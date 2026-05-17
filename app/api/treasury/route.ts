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
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    const [successfulPayments, pendingInvoices, projects, paidInvoicesPeriod] =
      await Promise.all([
        prisma.payment.findMany({
          where: { companyId, status: 'REUSSI' },
          select: { amount: true },
        }),
        prisma.invoice.findMany({
          where: { companyId, status: { in: ['EN_ATTENTE', 'EN_RETARD'] } },
          select: { totalTTC: true, dueDate: true },
        }),
        prisma.project.findMany({
          where: { companyId },
          select: { actualBudget: true },
        }),
        prisma.invoice.findMany({
          where: {
            companyId,
            status: 'PAYEE',
            paidAt: { gte: sixMonthsAgo },
          },
          select: { totalTTC: true, paidAt: true },
        }),
      ])

    const totalCollected = successfulPayments.reduce(
      (sum, p) => sum + p.amount,
      0
    )
    // Dépenses estimées : budget réel consommé sur les chantiers.
    const totalSpentEstimate = projects.reduce(
      (sum, p) => sum + p.actualBudget,
      0
    )
    const balance =
      Math.round((totalCollected - totalSpentEstimate) * 100) / 100

    const forecastAmount = pendingInvoices.reduce(
      (sum, i) => sum + i.totalTTC,
      0
    )

    const revenueByMonth = new Map<string, number>()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      revenueByMonth.set(`${d.getFullYear()}-${d.getMonth()}`, 0)
    }
    for (const inv of paidInvoicesPeriod) {
      if (!inv.paidAt) continue
      const key = `${inv.paidAt.getFullYear()}-${inv.paidAt.getMonth()}`
      if (revenueByMonth.has(key)) {
        revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + inv.totalTTC)
      }
    }
    const revenueByMonthData = Array.from(revenueByMonth.entries()).map(
      ([key, value]) => {
        const [, month] = key.split('-')
        return { month: MONTH_LABELS[Number(month)], revenue: value }
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        balance,
        totalCollected: Math.round(totalCollected * 100) / 100,
        totalSpentEstimate: Math.round(totalSpentEstimate * 100) / 100,
        forecast: {
          amount: Math.round(forecastAmount * 100) / 100,
          pendingInvoices: pendingInvoices.length,
        },
        revenueByMonth: revenueByMonthData,
      },
    })
  } catch (e) {
    console.error('GET /api/treasury error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
