import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'

/**
 * Export comptable des factures (CSV ; séparateur « ; » pour Excel FR, UTF-8 BOM).
 * Destiné à être transmis à l'expert-comptable. Filtrable par année (?year=2026).
 */
export async function GET(request: Request) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')
    const year = yearParam ? parseInt(yearParam, 10) : null

    const where: { companyId: string; createdAt?: { gte: Date; lt: Date } } = { companyId }
    if (year && !Number.isNaN(year)) {
      where.createdAt = { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) }
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: { client: true },
      orderBy: { createdAt: 'asc' },
    })

    const fr = (n: number) => (Math.round((n || 0) * 100) / 100).toFixed(2).replace('.', ',')
    const d = (date: Date | null) => (date ? new Date(date).toLocaleDateString('fr-FR') : '')
    const cell = (s: string | null | undefined) => `"${String(s ?? '').replace(/"/g, '""')}"`

    const header = [
      'Numéro', 'Date', 'Type', 'Statut', 'Client',
      'Montant HT', 'TVA', 'Montant TTC', 'Payé', 'Reste dû', 'Échéance',
    ].join(';')

    const rows = invoices.map((inv) =>
      [
        cell(inv.number),
        d(inv.createdAt),
        cell(inv.type),
        cell(inv.status),
        cell(inv.client ? `${inv.client.firstName} ${inv.client.lastName}` : ''),
        fr(inv.subtotalHT),
        fr(inv.vatAmount),
        fr(inv.totalTTC),
        fr(inv.amountPaid),
        fr(inv.totalTTC - inv.amountPaid),
        d(inv.dueDate),
      ].join(';')
    )

    const csv = '﻿' + [header, ...rows].join('\r\n')
    const filename = `export-comptable-${year ?? 'tout'}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (e) {
    console.error('GET /api/accounting/export error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
