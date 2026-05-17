import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'

type Params = { params: { id: string } }

export async function PUT(request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const existing = await prisma.scheduleEvent.findFirst({
      where: { id: params.id, companyId },
    })
    if (!existing) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const updateData: Record<string, unknown> = {}
    const scalarFields = [
      'title',
      'description',
      'status',
      'location',
      'color',
      'projectId',
      'technicianId',
    ] as const
    for (const key of scalarFields) {
      if (body[key] !== undefined) updateData[key] = body[key]
    }
    if (body.startDate !== undefined)
      updateData.startDate = new Date(body.startDate)
    if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate)

    const data = await prisma.scheduleEvent.update({
      where: { id: params.id },
      data: updateData,
      include: { project: true, technician: true },
    })

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error('PUT /api/schedule/[id] error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const existing = await prisma.scheduleEvent.findFirst({
      where: { id: params.id, companyId },
    })
    if (!existing) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      )
    }

    await prisma.scheduleEvent.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/schedule/[id] error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
