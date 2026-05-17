import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'

export async function GET() {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const data = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            active: true,
            createdAt: true,
          },
        },
        subscription: true,
      },
    })

    if (!data) {
      return NextResponse.json(
        { error: 'Entreprise introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error('GET /api/company error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const body = await request.json()
    const updateData: Record<string, unknown> = {}
    const allowed = [
      'name',
      'ownerName',
      'trade',
      'address',
      'city',
      'postalCode',
      'phone',
      'email',
      'vatNumber',
      'insuranceNumber',
      'logoUrl',
      'monthlyRevenueTarget',
      'onboardingCompleted',
    ] as const
    for (const key of allowed) {
      if (body[key] !== undefined) updateData[key] = body[key]
    }
    if (body.insuranceExpiryDate !== undefined)
      updateData.insuranceExpiryDate = body.insuranceExpiryDate
        ? new Date(body.insuranceExpiryDate)
        : null

    const data = await prisma.company.update({
      where: { id: companyId },
      data: updateData,
    })

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error('PUT /api/company error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
