import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'
import { stripe, isStripeConfigured } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    if (!isStripeConfigured() || !stripe) {
      return NextResponse.json(
        { error: 'Stripe non configuré.' },
        { status: 503 }
      )
    }

    const sub = await prisma.subscription.findUnique({ where: { companyId } })
    if (!sub?.stripeCustomerId) {
      return NextResponse.json(
        { error: "Aucun abonnement payant trouvé. Choisissez d'abord un plan." },
        { status: 400 }
      )
    }

    const origin =
      request.headers.get('origin') || process.env.NEXTAUTH_URL || 'https://pro.ecopye.fr'

    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${origin}/app/settings/billing`,
    })

    return NextResponse.json({ url: portal.url })
  } catch (e) {
    console.error('POST /api/billing/portal error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
