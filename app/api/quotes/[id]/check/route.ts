import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'
import { checkQuote, summarize } from '@/lib/risk-checks'

type Params = { params: { id: string } }

export async function GET(_request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const quote = await prisma.quote.findFirst({
      where: { id: params.id, companyId },
      include: { client: true, lines: true },
    })
    if (!quote) {
      return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 })
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { siret: true, address: true, postalCode: true, insuranceNumber: true },
    })

    const flags = checkQuote({
      company: {
        siret: company?.siret ?? null,
        address: company?.address ?? null,
        postalCode: company?.postalCode ?? null,
        insuranceNumber: company?.insuranceNumber ?? null,
      },
      quote: {
        status: quote.status,
        expiresAt: quote.expiresAt,
        totalTTC: quote.totalTTC,
        lines: quote.lines.map((l) => ({ label: l.label, vatRate: l.vatRate, totalHT: l.totalHT })),
      },
      client: quote.client ? { email: quote.client.email } : null,
    })

    return NextResponse.json({ flags, summary: summarize(flags) })
  } catch (e) {
    console.error('GET /api/quotes/[id]/check error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
