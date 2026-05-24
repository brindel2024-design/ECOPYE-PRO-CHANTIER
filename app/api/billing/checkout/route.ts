import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'
import { stripe, isStripeConfigured } from '@/lib/stripe'
import { PLANS, PlanKey } from '@/lib/plans'

export async function POST(request: Request) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    if (!isStripeConfigured() || !stripe) {
      return NextResponse.json(
        { error: "Paiement par abonnement non configuré (Stripe manquant)." },
        { status: 503 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const plan = body.plan as PlanKey | undefined
    if (!plan || !(plan in PLANS)) {
      return NextResponse.json({ error: 'Plan inconnu.' }, { status: 400 })
    }
    const planDef = PLANS[plan]

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { subscription: true },
    })
    if (!company) {
      return NextResponse.json({ error: 'Entreprise introuvable.' }, { status: 404 })
    }

    // Récupère le Price Stripe via lookup_key (créé par scripts/setup-stripe-products.ts)
    const prices = await stripe.prices.list({
      lookup_keys: [planDef.lookupKey],
      active: true,
      limit: 1,
    })
    if (prices.data.length === 0) {
      return NextResponse.json(
        { error: 'Plan Stripe non synchronisé. Lancez le script setup-stripe-products.' },
        { status: 500 }
      )
    }
    const priceId = prices.data[0].id

    // Stripe Customer : réutilise celui de la souscription ou en crée un nouveau
    let stripeCustomerId = company.subscription?.stripeCustomerId
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: company.email,
        name: company.name,
        metadata: { companyId: company.id },
      })
      stripeCustomerId = customer.id
      if (company.subscription) {
        await prisma.subscription.update({
          where: { id: company.subscription.id },
          data: { stripeCustomerId },
        })
      }
    }

    const origin =
      request.headers.get('origin') || process.env.NEXTAUTH_URL || 'https://pro.ecopye.fr'

    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { companyId, plan },
      subscription_data: { metadata: { companyId, plan } },
      success_url: `${origin}/app/settings/billing?subscribed=1`,
      cancel_url: `${origin}/pricing?canceled=1`,
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: checkout.url })
  } catch (e) {
    console.error('POST /api/billing/checkout error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
