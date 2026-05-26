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

    const data = await prisma.project.findFirst({
      where: { id: params.id, companyId },
      include: {
        client: true,
        steps: { orderBy: { order: 'asc' } },
        _count: { select: { photos: true } },
      },
    })

    if (!data) {
      return NextResponse.json(
        { error: 'Chantier introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error('GET /api/projects/[id] error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const existing = await prisma.project.findFirst({
      where: { id: params.id, companyId },
    })
    if (!existing) {
      return NextResponse.json(
        { error: 'Chantier introuvable' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const updateData: Record<string, unknown> = {}
    const scalarFields = [
      'title',
      'description',
      'address',
      'city',
      'postalCode',
      'status',
      'plannedBudget',
      'actualBudget',
      'costMaterials',
      'costLabor',
      'costSubcontract',
      'costOverhead',
      'progress',
      'riskLevel',
      'notes',
    ] as const
    for (const key of scalarFields) {
      if (body[key] !== undefined) updateData[key] = body[key]
    }
    if (body.startDate !== undefined)
      updateData.startDate = body.startDate ? new Date(body.startDate) : null
    if (body.endDate !== undefined)
      updateData.endDate = body.endDate ? new Date(body.endDate) : null

    const data = await prisma.project.update({
      where: { id: params.id },
      data: updateData,
      include: {
        client: true,
        steps: { orderBy: { order: 'asc' } },
        _count: { select: { photos: true } },
      },
    })

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error('PUT /api/projects/[id] error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const existing = await prisma.project.findFirst({
      where: { id: params.id, companyId },
    })
    if (!existing) {
      return NextResponse.json(
        { error: 'Chantier introuvable' },
        { status: 404 }
      )
    }

    // Détacher les références optionnelles avant suppression (évite les erreurs de contrainte FK).
    // Les étapes et photos sont en cascade ; factures et événements référencent projectId en option.
    await prisma.invoice.updateMany({ where: { projectId: params.id }, data: { projectId: null } })
    await prisma.scheduleEvent.updateMany({ where: { projectId: params.id }, data: { projectId: null } })
    await prisma.document.updateMany({ where: { projectId: params.id }, data: { projectId: null } })
    await prisma.project.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/projects/[id] error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
