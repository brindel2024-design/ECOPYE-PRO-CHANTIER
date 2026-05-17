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
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')

    const data = await prisma.project.findMany({
      where: {
        companyId,
        ...(status ? { status } : {}),
        ...(clientId ? { clientId } : {}),
      },
      include: {
        client: true,
        steps: { orderBy: { order: 'asc' } },
        _count: { select: { photos: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data, total: data.length })
  } catch (e) {
    console.error('GET /api/projects error:', e)
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
      clientId,
      quoteId,
      title,
      description,
      address,
      city,
      postalCode,
      status,
      plannedBudget,
      startDate,
      endDate,
      riskLevel,
      notes,
      steps = [],
    } = body

    if (!clientId || !title) {
      return NextResponse.json(
        { error: 'Champs requis manquants (clientId, title)' },
        { status: 400 }
      )
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, companyId },
    })
    if (!client) {
      return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })
    }

    const data = await prisma.project.create({
      data: {
        companyId,
        clientId,
        quoteId: quoteId ?? null,
        title,
        description: description ?? null,
        address: address ?? '',
        city: city ?? '',
        postalCode: postalCode ?? '',
        status: status ?? 'PREPARATION',
        plannedBudget: plannedBudget ?? 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        riskLevel: riskLevel ?? 'FAIBLE',
        notes: notes ?? null,
        steps: {
          create: steps.map(
            (
              step: {
                title: string
                description?: string
                status?: string
                dueDate?: string
                notes?: string
              },
              index: number
            ) => ({
              title: step.title,
              description: step.description ?? null,
              status: step.status ?? 'EN_ATTENTE',
              order: index,
              dueDate: step.dueDate ? new Date(step.dueDate) : null,
              notes: step.notes ?? null,
            })
          ),
        },
      },
      include: {
        client: true,
        steps: { orderBy: { order: 'asc' } },
        _count: { select: { photos: true } },
      },
    })

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (e) {
    console.error('POST /api/projects error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
