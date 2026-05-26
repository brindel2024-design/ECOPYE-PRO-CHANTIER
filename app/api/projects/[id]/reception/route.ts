import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'
import { isValidISODate } from '@/lib/utils'

type Params = { params: { id: string } }

async function ownProject(id: string, companyId: string) {
  return prisma.project.findFirst({ where: { id, companyId } })
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const project = await ownProject(params.id, companyId)
    if (!project) return NextResponse.json({ error: 'Chantier introuvable' }, { status: 404 })

    const reserves = await prisma.reserve.findMany({
      where: { projectId: params.id },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({
      receptionAt: project.receptionAt,
      receptionSignerName: project.receptionSignerName,
      receptionNotes: project.receptionNotes,
      reserves,
    })
  } catch (e) {
    console.error('GET reception error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const project = await ownProject(params.id, companyId)
    if (!project) return NextResponse.json({ error: 'Chantier introuvable' }, { status: 404 })

    const body = await request.json().catch(() => ({}))
    const signer = typeof body.receptionSignerName === 'string' ? body.receptionSignerName.trim() : ''
    if (!signer) {
      return NextResponse.json({ error: 'Indiquez le nom du client qui réceptionne.' }, { status: 400 })
    }
    const dateStr = typeof body.receptionAt === 'string' && body.receptionAt ? body.receptionAt : null
    if (dateStr && !isValidISODate(dateStr)) {
      return NextResponse.json({ error: 'Date de réception invalide.' }, { status: 400 })
    }

    const data = await prisma.project.update({
      where: { id: params.id },
      data: {
        receptionAt: dateStr ? new Date(dateStr) : new Date(),
        receptionSignerName: signer,
        receptionNotes: typeof body.receptionNotes === 'string' ? body.receptionNotes.trim() || null : null,
      },
    })

    return NextResponse.json({
      success: true,
      receptionAt: data.receptionAt,
      receptionSignerName: data.receptionSignerName,
      receptionNotes: data.receptionNotes,
    })
  } catch (e) {
    console.error('POST reception error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
