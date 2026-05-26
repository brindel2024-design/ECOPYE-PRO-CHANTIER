import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'

type Params = { params: { id: string; reserveId: string } }

async function guard(reserveId: string, projectId: string, companyId: string) {
  const reserve = await prisma.reserve.findUnique({ where: { id: reserveId } })
  if (!reserve || reserve.projectId !== projectId) return null
  const project = await prisma.project.findFirst({ where: { id: projectId, companyId } })
  if (!project) return null
  return reserve
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const reserve = await guard(params.reserveId, params.id, companyId)
    if (!reserve) return NextResponse.json({ error: 'Réserve introuvable' }, { status: 404 })

    const body = await request.json().catch(() => ({}))
    const resolved = body.resolved === true
    const data = await prisma.reserve.update({
      where: { id: params.reserveId },
      data: { resolved, resolvedAt: resolved ? new Date() : null },
    })
    return NextResponse.json({ success: true, reserve: data })
  } catch (e) {
    console.error('PATCH reserve error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const reserve = await guard(params.reserveId, params.id, companyId)
    if (!reserve) return NextResponse.json({ error: 'Réserve introuvable' }, { status: 404 })

    await prisma.reserve.delete({ where: { id: params.reserveId } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE reserve error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
