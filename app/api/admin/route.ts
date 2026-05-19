import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEcopyeAdmin } from '@/lib/api-helpers'

export async function GET() {
  const { error } = await requireEcopyeAdmin()
  if (error) return error

  const [companies, activeSubs, subs, openTickets, recentCompanies] = await Promise.all([
    prisma.company.count(),
    prisma.subscription.count({ where: { status: { in: ['ACTIF', 'ESSAI'] } } }),
    prisma.subscription.findMany({ select: { monthlyPrice: true, status: true } }),
    prisma.supportTicket.count({ where: { status: 'OUVERT' } }),
    prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        city: true,
        createdAt: true,
        active: true,
        subscription: { select: { plan: true, status: true } },
      },
    }),
  ])

  const mrr = subs
    .filter((s) => s.status === 'ACTIF')
    .reduce((sum, s) => sum + s.monthlyPrice, 0)

  return NextResponse.json({
    data: {
      companies,
      activeSubscriptions: activeSubs,
      mrr,
      openTickets,
      recentCompanies,
    },
  })
}
