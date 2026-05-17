import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'

export async function GET(request: Request) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    const dateFilter: Record<string, Date> = {}
    if (start) dateFilter.gte = new Date(start)
    if (end) dateFilter.lte = new Date(end)

    const data = await prisma.scheduleEvent.findMany({
      where: {
        companyId,
        ...(Object.keys(dateFilter).length > 0
          ? { startDate: dateFilter }
          : {}),
      },
      include: { project: true, technician: true },
      orderBy: { startDate: 'asc' },
    })

    return NextResponse.json({ success: true, data, total: data.length })
  } catch (e) {
    console.error('GET /api/schedule error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const body = await request.json()
    const {
      title,
      description,
      startDate,
      endDate,
      status,
      location,
      color,
      projectId,
      technicianId,
    } = body

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Champs requis manquants (title, startDate, endDate)' },
        { status: 400 }
      )
    }

    const data = await prisma.scheduleEvent.create({
      data: {
        companyId,
        title,
        description: description ?? null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status ?? 'PLANIFIE',
        location: location ?? null,
        color: color ?? '#3b82f6',
        projectId: projectId ?? null,
        technicianId: technicianId ?? null,
        userId: session.user.id,
      },
      include: { project: true, technician: true },
    })

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (e) {
    console.error('POST /api/schedule error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
