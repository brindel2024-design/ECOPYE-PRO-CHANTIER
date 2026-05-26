import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'

export async function GET() {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const data = await prisma.catalogItem.findMany({
      where: { companyId },
      orderBy: [{ category: 'asc' }, { label: 'asc' }],
    })
    return NextResponse.json({ data })
  } catch (e) {
    console.error('GET /api/catalog error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const body = await request.json().catch(() => ({}))
    const label = typeof body.label === 'string' ? body.label.trim() : ''
    if (!label) return NextResponse.json({ error: "Le libellé de l'ouvrage est obligatoire." }, { status: 400 })

    const data = await prisma.catalogItem.create({
      data: {
        companyId,
        label,
        unit: typeof body.unit === 'string' && body.unit.trim() ? body.unit.trim() : 'forfait',
        unitPriceHT: Number(body.unitPriceHT) || 0,
        vatRate: Number(body.vatRate ?? 20),
        isLabor: body.isLabor === true,
        category: typeof body.category === 'string' && body.category.trim() ? body.category.trim() : null,
      },
    })
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (e) {
    console.error('POST /api/catalog error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
