import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'

type Params = { params: { id: string } }

async function ensureProject(projectId: string, companyId: string) {
  return prisma.project.findFirst({ where: { id: projectId, companyId } })
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const project = await ensureProject(params.id, companyId)
    if (!project) {
      return NextResponse.json(
        { error: 'Chantier introuvable' },
        { status: 404 }
      )
    }

    const data = await prisma.projectStep.findMany({
      where: { projectId: params.id },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ success: true, data, total: data.length })
  } catch (e) {
    console.error('GET /api/projects/[id]/steps error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const project = await ensureProject(params.id, companyId)
    if (!project) {
      return NextResponse.json(
        { error: 'Chantier introuvable' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { title, description, status, order, dueDate, notes } = body
    if (!title) {
      return NextResponse.json(
        { error: 'Champ requis manquant (title)' },
        { status: 400 }
      )
    }

    let stepOrder = order
    if (stepOrder === undefined) {
      const count = await prisma.projectStep.count({
        where: { projectId: params.id },
      })
      stepOrder = count
    }

    const data = await prisma.projectStep.create({
      data: {
        projectId: params.id,
        title,
        description: description ?? null,
        status: status ?? 'EN_ATTENTE',
        order: stepOrder,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: notes ?? null,
      },
    })

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (e) {
    console.error('POST /api/projects/[id]/steps error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const project = await ensureProject(params.id, companyId)
    if (!project) {
      return NextResponse.json(
        { error: 'Chantier introuvable' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { stepId } = body
    if (!stepId) {
      return NextResponse.json(
        { error: 'Champ requis manquant (stepId)' },
        { status: 400 }
      )
    }

    const step = await prisma.projectStep.findFirst({
      where: { id: stepId, projectId: params.id },
    })
    if (!step) {
      return NextResponse.json({ error: 'Étape introuvable' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const fields = [
      'title',
      'description',
      'status',
      'order',
      'notes',
      'validatedByClient',
    ] as const
    for (const key of fields) {
      if (body[key] !== undefined) updateData[key] = body[key]
    }
    if (body.dueDate !== undefined)
      updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null
    if (body.completedAt !== undefined)
      updateData.completedAt = body.completedAt
        ? new Date(body.completedAt)
        : null
    // Auto-renseigne completedAt si l'étape passe à TERMINE.
    if (body.status === 'TERMINE' && !step.completedAt) {
      updateData.completedAt = new Date()
    }

    const data = await prisma.projectStep.update({
      where: { id: stepId },
      data: updateData,
    })

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error('PUT /api/projects/[id]/steps error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
