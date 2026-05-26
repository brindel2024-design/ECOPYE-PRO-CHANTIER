import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'

type Params = { params: { id: string } }

export async function GET(_request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const project = await prisma.project.findFirst({
      where: { id: params.id, companyId },
      include: { quote: true },
    })
    if (!project) return NextResponse.json({ error: 'Chantier introuvable' }, { status: 404 })

    const invoices = await prisma.invoice.findMany({
      where: { companyId, projectId: project.id },
      select: { totalTTC: true, status: true },
    })
    const revenueInvoiced = invoices
      .filter((i) => i.status !== 'ANNULEE')
      .reduce((s, i) => s + i.totalTTC, 0)
    const quoteTotal = project.quote?.totalTTC ?? 0

    const costs = {
      materials: project.costMaterials,
      labor: project.costLabor,
      subcontract: project.costSubcontract,
      overhead: project.costOverhead,
    }
    const totalCost = costs.materials + costs.labor + costs.subcontract + costs.overhead
    // Revenu de référence : facturé si > 0, sinon total du devis, sinon budget prévu
    const revenue = revenueInvoiced > 0 ? revenueInvoiced : quoteTotal > 0 ? quoteTotal : project.plannedBudget
    const margin = revenue - totalCost
    const marginPct = revenue > 0 ? Math.round((margin / revenue) * 1000) / 10 : 0

    return NextResponse.json({
      costs,
      totalCost,
      revenueInvoiced,
      quoteTotal,
      plannedBudget: project.plannedBudget,
      revenue,
      margin,
      marginPct,
    })
  } catch (e) {
    console.error('GET profitability error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
