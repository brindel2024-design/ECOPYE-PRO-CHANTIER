import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: 'Webhook Stripe non configuré.' },
      { status: 503 }
    )
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
  }

  const rawBody = await request.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (e) {
    console.error('Stripe signature verification failed:', e)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const stripeSession = event.data.object as {
      metadata?: { invoiceId?: string; companyId?: string; paymentId?: string }
      amount_total?: number | null
    }
    const { invoiceId, paymentId } = stripeSession.metadata ?? {}

    if (invoiceId && paymentId) {
      const now = new Date()
      const receiptNumber = `REC-${now
        .toISOString()
        .slice(2, 10)
        .replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`

      try {
        const payment = await prisma.payment.update({
          where: { id: paymentId },
          data: { status: 'REUSSI', receiptNumber, simulatedAt: now },
        })

        const invoice = await prisma.invoice.findUnique({
          where: { id: invoiceId },
        })
        if (invoice) {
          const newAmountPaid = invoice.amountPaid + payment.amount
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
              amountPaid: newAmountPaid,
              paidAt: now,
              status: newAmountPaid >= invoice.totalTTC ? 'PAYEE' : invoice.status,
            },
          })
        }
      } catch (e) {
        console.error('Stripe webhook DB update failed:', e)
        return NextResponse.json({ error: 'Erreur traitement' }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ received: true })
}
