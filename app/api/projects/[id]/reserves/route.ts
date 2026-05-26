import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'

type Params = { params: { id: string } }

export async function POST(request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const project = await prisma.project.findFirst({ where: { id: params.id, companyId } })
    if (!project) return NextResponse.json({ error: 'Chantier introuvable' }, { status: 404 })

    const body = await request.json().catch(() => ({}))
    const description = typeof body.description === 'string' ? body.description.trim() : ''
    if (!description) {
      return NextResponse.json({ error: 'Décrivez la réserve.' }, { status: 400 })
    }

    const reserve = await prisma.reserve.create({
      data: { projectId: params.id, description },
    })
    return NextResponse.json({ success: true, reserve }, { status: 201 })
  } catch (e) {
    console.error('POST reserve error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
