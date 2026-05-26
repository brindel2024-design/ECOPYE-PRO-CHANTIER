import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId, assertCompanyLegalReady } from '@/lib/api-helpers'
import { stripe, isStripeConfigured } from '@/lib/stripe'

type Params = { params: { id: string } }

export async function POST(request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    if (!isStripeConfigured() || !stripe) {
      return NextResponse.json(
        { error: 'Paiement par carte non configuré (clés Stripe manquantes).' },
        { status: 503 }
      )
    }

    // Garde-fou légal : une facture transmise au client pour paiement doit être complète
    const legal = await assertCompanyLegalReady(companyId)
    if (!legal.ok) return legal.error

    const invoice = await prisma.invoice.findFirst({
      where: { id: params.id, companyId },
      include: { client: true },
    })
    if (!invoice) {
      return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 })
    }

    // Montant exigible : TTC moins la retenue de garantie (retenue payée plus tard), moins le déjà-payé
    const payableNow = invoice.totalTTC * (1 - (invoice.retentionPct ?? 0) / 100)
    const amountDue = Math.round((payableNow - invoice.amountPaid) * 100)
    if (amountDue <= 0) {
      return NextResponse.json(
        { error: 'Cette facture est déjà réglée.' },
        { status: 400 }
      )
    }

    const payment = await prisma.payment.create({
      data: {
        companyId,
        clientId: invoice.clientId,
        invoiceId: invoice.id,
        amount: amountDue / 100,
        status: 'EN_ATTENTE',
        method: 'CARTE',
      },
    })

    const origin =
      request.headers.get('origin') ||
      process.env.NEXTAUTH_URL ||
      'http://localhost:3001'

    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: amountDue,
            product_data: {
              name: `Facture ${invoice.number}`,
              description: `${invoice.client.firstName} ${invoice.client.lastName}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { invoiceId: invoice.id, companyId, paymentId: payment.id },
      success_url: `${origin}/app/invoices/${invoice.id}?paid=1`,
      cancel_url: `${origin}/app/invoices/${invoice.id}?canceled=1`,
    })

    await prisma.payment.update({
      where: { id: payment.id },
      data: { paymentLink: checkout.url },
    })

    return NextResponse.json({ url: checkout.url })
  } catch (e) {
    console.error('POST /api/invoices/[id]/checkout error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
