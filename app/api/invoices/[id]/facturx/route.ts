import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'
import { buildFacturXml, facturxReadiness, type FxParty } from '@/lib/facturx'

type Params = { params: { id: string } }

export async function GET(request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const invoice = await prisma.invoice.findFirst({
      where: { id: params.id, companyId },
      include: { client: true, company: true, lines: { orderBy: { order: 'asc' } } },
    })
    if (!invoice) {
      return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 })
    }

    const seller: FxParty = {
      name: invoice.company.name,
      siret: invoice.company.siret,
      vatNumber: invoice.company.vatNumber,
      address: invoice.company.address,
      postalCode: invoice.company.postalCode,
      city: invoice.company.city,
      countryCode: 'FR',
    }
    const buyerIsBusiness = (invoice.client.type ?? 'PARTICULIER').toUpperCase() !== 'PARTICULIER'
    const buyer: FxParty = {
      name:
        buyerIsBusiness && invoice.client.companyName
          ? invoice.client.companyName
          : `${invoice.client.firstName} ${invoice.client.lastName}`,
      siret: invoice.client.siret,
      vatNumber: invoice.client.vatNumber,
      address: invoice.client.address,
      postalCode: invoice.client.postalCode,
      city: invoice.client.city,
      countryCode: 'FR',
    }

    const readiness = facturxReadiness({ seller, buyer, buyerIsBusiness })

    const { searchParams } = new URL(request.url)
    if (searchParams.get('download') !== '1') {
      // Métadonnées (complétude) pour l'UI
      return NextResponse.json({ readiness, buyerIsBusiness, number: invoice.number })
    }

    const xml = buildFacturXml({
      invoice: {
        number: invoice.number,
        type: invoice.type,
        issueDate: invoice.createdAt,
        dueDate: invoice.dueDate,
        currency: 'EUR',
        subtotalHT: invoice.subtotalHT,
        vatAmount: invoice.vatAmount,
        totalTTC: invoice.totalTTC,
        lines: invoice.lines.map((l) => ({
          label: l.label,
          quantity: l.quantity,
          unit: l.unit,
          unitPriceHT: l.unitPriceHT,
          vatRate: l.vatRate,
          totalHT: l.totalHT,
        })),
      },
      seller,
      buyer,
    })

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="factur-x-${invoice.number}.xml"`,
      },
    })
  } catch (e) {
    console.error('GET /api/invoices/[id]/facturx error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
