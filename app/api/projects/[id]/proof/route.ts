import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'
import { checkProjectProof } from '@/lib/proof-checks'

type Params = { params: { id: string } }

export async function GET(_request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const project = await prisma.project.findFirst({
      where: { id: params.id, companyId },
      include: {
        client: true,
        photos: { orderBy: { takenAt: 'asc' } },
        reserves: true,
      },
    })
    if (!project) {
      return NextResponse.json({ error: 'Chantier introuvable' }, { status: 404 })
    }

    const invoiceCount = await prisma.invoice.count({ where: { companyId, projectId: project.id } })
    const totalReserves = project.reserves.length
    const openReserves = project.reserves.filter((r) => !r.resolved).length

    const checklist = checkProjectProof({
      photos: project.photos.map((p) => ({ category: p.category })),
      hasLinkedQuote: Boolean(project.quoteId),
      hasInvoice: invoiceCount > 0,
      received: Boolean(project.receptionAt),
      openReserves,
      totalReserves,
    })

    const photos = project.photos.map((p) => ({
      id: p.id,
      category: (p.category ?? 'PENDANT').toUpperCase(),
      url: p.url,
      caption: p.caption,
      takenAt: p.takenAt,
    }))

    return NextResponse.json({
      project: {
        id: project.id,
        title: project.title,
        address: project.address,
        city: project.city,
        postalCode: project.postalCode,
        client: project.client
          ? `${project.client.firstName} ${project.client.lastName}`
          : null,
      },
      photos,
      checklist,
    })
  } catch (e) {
    console.error('GET /api/projects/[id]/proof error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
