import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId, assertCompanyLegalReady } from '@/lib/api-helpers'
import { sendEmail, isEmailConfigured } from '@/lib/email'

type Params = { params: { id: string } }

const euro = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

export async function POST(_request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    if (!isEmailConfigured()) {
      return NextResponse.json(
        { error: 'Service email non configuré (RESEND_API_KEY / EMAIL_FROM manquants).' },
        { status: 503 }
      )
    }

    // Garde-fou légal : une facture envoyée à un client doit porter SIRET + adresse
    const legal = await assertCompanyLegalReady(companyId)
    if (!legal.ok) return legal.error

    const invoice = await prisma.invoice.findFirst({
      where: { id: params.id, companyId },
      include: { client: true, company: true },
    })
    if (!invoice) {
      return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 })
    }
    if (!invoice.client.email) {
      return NextResponse.json(
        { error: "Ce client n'a pas d'adresse email." },
        { status: 400 }
      )
    }

    const reste = invoice.totalTTC - invoice.amountPaid
    const echeance = invoice.dueDate
      ? new Date(invoice.dueDate).toLocaleDateString('fr-FR')
      : 'à réception'

    const subject = `Relance — Facture ${invoice.number} en attente de règlement`
    const text = `Bonjour ${invoice.client.firstName} ${invoice.client.lastName},

Sauf erreur ou règlement de votre part, nous constatons que la facture ${invoice.number} d'un montant de ${euro(reste)} (échéance : ${echeance}) demeure impayée à ce jour.

Nous vous remercions de bien vouloir procéder à son règlement dans les meilleurs délais.

Si le règlement a déjà été effectué, merci de ne pas tenir compte de ce message.

Pour toute question, n'hésitez pas à nous contacter.

Cordialement,
${invoice.company.name}
${invoice.company.phone}`

    const result = await sendEmail({
      to: invoice.client.email,
      subject,
      text,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 })
    }

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: invoice.status === 'BROUILLON' ? 'ENVOYEE' : invoice.status },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('POST /api/invoices/[id]/relance error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
