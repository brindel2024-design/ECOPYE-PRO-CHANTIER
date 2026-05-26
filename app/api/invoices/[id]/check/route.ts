import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'
import { checkInvoice, summarize } from '@/lib/risk-checks'

type Params = { params: { id: string } }

export async function GET(_request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const invoice = await prisma.invoice.findFirst({
      where: { id: params.id, companyId },
      include: { client: true, lines: true },
    })
    if (!invoice) {
      return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 })
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { siret: true, address: true, postalCode: true, insuranceNumber: true },
    })

    const flags = checkInvoice({
      company: {
        siret: company?.siret ?? null,
        address: company?.address ?? null,
        postalCode: company?.postalCode ?? null,
        insuranceNumber: company?.insuranceNumber ?? null,
      },
      invoice: {
        status: invoice.status,
        dueDate: invoice.dueDate,
        totalTTC: invoice.totalTTC,
        lines: invoice.lines.map((l) => ({ label: l.label, vatRate: l.vatRate, totalHT: l.totalHT })),
      },
      client: invoice.client ? { email: invoice.client.email } : null,
    })

    return NextResponse.json({ flags, summary: summarize(flags) })
  } catch (e) {
    console.error('GET /api/invoices/[id]/check error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
