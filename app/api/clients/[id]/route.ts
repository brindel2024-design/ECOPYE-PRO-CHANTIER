import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'

type Params = { params: { id: string } }

export async function GET(_request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const data = await prisma.client.findFirst({
      where: { id: params.id, companyId },
      include: {
        quotes: { orderBy: { createdAt: 'desc' } },
        invoices: { orderBy: { createdAt: 'desc' } },
        projects: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!data) {
      return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error('GET /api/clients/[id] error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const existing = await prisma.client.findFirst({
      where: { id: params.id, companyId },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })
    }

    const body = await request.json()
    const allowed = [
      'type',
      'firstName',
      'lastName',
      'companyName',
      'siret',
      'vatNumber',
      'email',
      'phone',
      'address',
      'city',
      'postalCode',
      'notes',
      'active',
    ] as const
    const updateData: Record<string, unknown> = {}
    for (const key of allowed) {
      if (body[key] !== undefined) updateData[key] = body[key]
    }

    const data = await prisma.client.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error('PUT /api/clients/[id] error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const existing = await prisma.client.findFirst({
      where: { id: params.id, companyId },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })
    }

    const data = await prisma.client.update({
      where: { id: params.id },
      data: { active: false },
    })

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error('DELETE /api/clients/[id] error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
