import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEcopyeAdmin } from '@/lib/api-helpers'

export async function GET() {
  const { error } = await requireEcopyeAdmin()
  if (error) return error

  const tickets = await prisma.supportTicket.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: {
      company: { select: { name: true } },
      user: { select: { name: true, email: true } },
    },
  })

  return NextResponse.json({ data: tickets })
}

export async function PATCH(request: Request) {
  const { error } = await requireEcopyeAdmin()
  if (error) return error

  const body = await request.json().catch(() => ({}))
  const { id, status, response } = body
  if (!id) {
    return NextResponse.json({ error: 'id requis' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  if (status !== undefined) data.status = status
  if (response !== undefined) data.response = response

  const updated = await prisma.supportTicket.update({ where: { id }, data })
  return NextResponse.json({ success: true, data: updated })
}
