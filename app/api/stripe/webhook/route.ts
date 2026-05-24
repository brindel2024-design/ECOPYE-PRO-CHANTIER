import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { PLANS, PlanKey } from '@/lib/plans'

function mapStripeStatus(status: Stripe.Subscription.Status): string {
  switch (status) {
    case 'trialing':
    case 'incomplete':
      return 'ESSAI'
    case 'active':
      return 'ACTIF'
    case 'past_due':
    case 'unpaid':
      return 'SUSPENDU'
    case 'canceled':
    case 'incomplete_expired':
    case 'paused':
      return 'ANNULE'
    default:
      return 'ESSAI'
  }
}

function planFromLookupKey(lookupKey: string | null | undefined): PlanKey | null {
  if (!lookupKey) return null
  const found = (Object.values(PLANS) as Array<(typeof PLANS)[PlanKey]>).find(
    (p) => p.lookupKey === lookupKey
  )
  return found ? found.key : null
}

async function syncSubscriptionFromStripe(sub: Stripe.Subscription) {
  const companyId = (sub.metadata?.companyId as string | undefined) ?? null
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id

  // Trouve la souscription locale soit par companyId metadata, soit par stripeCustomerId
  const where = companyId
    ? { companyId }
    : { stripeCustomerId: customerId }

  const local = await prisma.subscription.findFirst({ where })
  if (!local) {
    console.warn('webhook: subscription locale introuvable pour', customerId)
    return
  }

  const priceItem = sub.items.data[0]
  const stripePriceId = priceItem?.price?.id
  const lookupKey = priceItem?.price?.lookup_key
  const plan = planFromLookupKey(lookupKey) ?? (local.plan as PlanKey)
  const monthlyPrice =
    priceItem?.price?.unit_amount != null
      ? priceItem.price.unit_amount / 100
      : local.monthlyPrice

  const currentPeriodEnd =
    (sub as unknown as { current_period_end?: number }).current_period_end
  const trialEnd = sub.trial_end

  await prisma.subscription.update({
    where: { id: local.id },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: sub.id,
      stripePriceId,
      plan,
      monthlyPrice,
      status: mapStripeStatus(sub.status),
      cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
      currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
      trialEndsAt: trialEnd ? new Date(trialEnd * 1000) : local.trialEndsAt,
    },
  })
}

async function handleInvoicePayment(invoice: Stripe.Invoice, succeeded: boolean) {
  const subId = (invoice as unknown as { subscription?: string }).subscription
  if (!subId) return
  const local = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subId },
  })
  if (!local) return

  if (succeeded) {
    // Le paiement de la mensualité a réussi -> repasser en ACTIF si on était SUSPENDU
    if (local.status === 'SUSPENDU') {
      await prisma.subscription.update({
        where: { id: local.id },
        data: { status: 'ACTIF' },
      })
    }
  } else {
    // Paiement échoué -> SUSPENDU
    await prisma.subscription.update({
      where: { id: local.id },
      data: { status: 'SUSPENDU' },
    })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Cas 1 : paiement d'une FACTURE (mode payment) -> logique existante
  const md = session.metadata ?? {}
  if (md.invoiceId && md.paymentId) {
    const now = new Date()
    const receiptNumber = `REC-${now
      .toISOString()
      .slice(2, 10)
      .replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`
    try {
      const payment = await prisma.payment.update({
        where: { id: md.paymentId },
        data: { status: 'REUSSI', receiptNumber, simulatedAt: now },
      })
      const invoice = await prisma.invoice.findUnique({ where: { id: md.invoiceId } })
      if (invoice) {
        const newAmountPaid = invoice.amountPaid + payment.amount
        await prisma.invoice.update({
          where: { id: md.invoiceId },
          data: {
            amountPaid: newAmountPaid,
            paidAt: now,
            status: newAmountPaid >= invoice.totalTTC ? 'PAYEE' : invoice.status,
          },
        })
      }
    } catch (e) {
      console.error('webhook facture update failed:', e)
    }
    return
  }

  // Cas 2 : checkout d'ABONNEMENT (mode subscription) -> sync via la subscription
  if (session.mode === 'subscription' && session.subscription && stripe) {
    const subId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription.id
    const sub = await stripe.subscriptions.retrieve(subId)
    await syncSubscriptionFromStripe(sub)
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook Stripe non configuré.' }, { status: 503 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
  }

  const rawBody = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (e) {
    console.error('Stripe signature verification failed:', e)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncSubscriptionFromStripe(event.data.object as Stripe.Subscription)
        break
      case 'invoice.payment_succeeded':
        await handleInvoicePayment(event.data.object as Stripe.Invoice, true)
        break
      case 'invoice.payment_failed':
        await handleInvoicePayment(event.data.object as Stripe.Invoice, false)
        break
      default:
        // événements non gérés explicitement
        break
    }
  } catch (e) {
    console.error('webhook handler error:', e)
    return NextResponse.json({ error: 'Erreur traitement' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
