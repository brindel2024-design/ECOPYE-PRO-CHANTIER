import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'

const MONTH_LABELS = [
  'Jan',
  'Fév',
  'Mar',
  'Avr',
  'Mai',
  'Juin',
  'Juil',
  'Août',
  'Sep',
  'Oct',
  'Nov',
  'Déc',
]

export async function GET() {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    const [
      paidInvoicesThisMonth,
      activeProjects,
      pendingQuotes,
      unpaidInvoices,
      totalQuotes,
      acceptedQuotes,
      paidInvoicesPeriod,
      totalClients,
    ] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          companyId,
          status: 'PAYEE',
          paidAt: { gte: startOfMonth, lt: startOfNextMonth },
        },
      }),
      prisma.project.count({
        where: { companyId, status: 'EN_COURS' },
      }),
      prisma.quote.count({ where: { companyId, status: 'ENVOYE' } }),
      prisma.invoice.findMany({
        where: {
          companyId,
          status: { in: ['EN_RETARD', 'EN_ATTENTE'] },
        },
      }),
      prisma.quote.count({ where: { companyId } }),
      prisma.quote.count({ where: { companyId, status: 'ACCEPTE' } }),
      prisma.invoice.findMany({
        where: {
          companyId,
          status: 'PAYEE',
          paidAt: { gte: sixMonthsAgo },
        },
        select: { totalTTC: true, paidAt: true },
      }),
      prisma.client.count({ where: { companyId } }),
    ])

    const revenueThisMonth = paidInvoicesThisMonth.reduce(
      (sum, i) => sum + i.totalTTC,
      0
    )
    const unpaidAmount = unpaidInvoices.reduce(
      (sum, i) => sum + i.totalTTC,
      0
    )

    // CA des 6 derniers mois groupé par mois.
    const revenueByMonth = new Map<string, number>()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      revenueByMonth.set(key, 0)
    }
    for (const inv of paidInvoicesPeriod) {
      if (!inv.paidAt) continue
      const key = `${inv.paidAt.getFullYear()}-${inv.paidAt.getMonth()}`
      if (revenueByMonth.has(key)) {
        revenueByMonth.set(
          key,
          (revenueByMonth.get(key) ?? 0) + inv.totalTTC
        )
      }
    }
    const revenueData = Array.from(revenueByMonth.entries()).map(
      ([key, value]) => {
        const [, month] = key.split('-')
        return { month: MONTH_LABELS[Number(month)], revenue: value }
      }
    )

    const conversionRate =
      totalQuotes > 0
        ? Math.round((acceptedQuotes / totalQuotes) * 1000) / 10
        : 0

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          monthlyRevenue: revenueThisMonth,
          activeProjects,
          pendingQuotes,
          unpaidInvoices: unpaidInvoices.length,
          unpaidAmount,
          conversionRate,
          totalClients,
        },
        revenueData,
        quoteRateData: {
          total: totalQuotes,
          accepted: acceptedQuotes,
          rate: conversionRate,
        },
      },
    })
  } catch (e) {
    console.error('GET /api/dashboard error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
