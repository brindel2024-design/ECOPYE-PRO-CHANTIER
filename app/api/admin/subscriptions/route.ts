import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEcopyeAdmin } from '@/lib/api-helpers'

export async function GET() {
  const { error } = await requireEcopyeAdmin()
  if (error) return error

  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      company: { select: { id: true, name: true, email: true, city: true } },
    },
  })

  return NextResponse.json({ data: subscriptions })
}

export async function PATCH(request: Request) {
  const { error } = await requireEcopyeAdmin()
  if (error) return error

  const body = await request.json().catch(() => ({}))
  const { id, plan, status, monthlyPrice } = body
  if (!id) {
    return NextResponse.json({ error: 'id requis' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  if (plan !== undefined) data.plan = plan
  if (status !== undefined) data.status = status
  if (monthlyPrice !== undefined) data.monthlyPrice = Number(monthlyPrice)

  const updated = await prisma.subscription.update({ where: { id }, data })
  return NextResponse.json({ success: true, data: updated })
}
