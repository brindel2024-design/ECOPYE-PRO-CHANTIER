import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  getSessionOrUnauthorized,
  requireCompanyId,
  computeTotals,
} from '@/lib/api-helpers'

type Params = { params: { id: string } }

export async function GET(_request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const data = await prisma.invoice.findFirst({
      where: { id: params.id, companyId },
      include: {
        client: true,
        project: true,
        lines: { orderBy: { order: 'asc' } },
        payments: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!data) {
      return NextResponse.json(
        { error: 'Facture introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error('GET /api/invoices/[id] error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const existing = await prisma.invoice.findFirst({
      where: { id: params.id, companyId },
    })
    if (!existing) {
      return NextResponse.json(
        { error: 'Facture introuvable' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const updateData: Record<string, unknown> = {}
    const scalarFields = ['type', 'status', 'notes', 'amountPaid'] as const
    for (const key of scalarFields) {
      if (body[key] !== undefined) updateData[key] = body[key]
    }
    if (body.dueDate !== undefined)
      updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null

    if (Array.isArray(body.lines)) {
      const totals = computeTotals(body.lines)
      updateData.subtotalHT = totals.subtotalHT
      updateData.vatAmount = totals.vatAmount
      updateData.totalTTC = totals.totalTTC

      await prisma.invoiceLine.deleteMany({ where: { invoiceId: params.id } })
      await prisma.invoiceLine.createMany({
        data: body.lines.map(
          (
            line: {
              label: string
              description?: string
              quantity?: number
              unit?: string
              unitPriceHT?: number
              vatRate?: number
              discount?: number
            },
            index: number
          ) => {
            const qty = Number(line.quantity ?? 1)
            const unitPrice = Number(line.unitPriceHT ?? 0)
            const discount = Number(line.discount ?? 0)
            return {
              invoiceId: params.id,
              label: line.label,
              description: line.description ?? null,
              quantity: qty,
              unit: line.unit ?? 'forfait',
              unitPriceHT: unitPrice,
              vatRate: Number(line.vatRate ?? 20),
              totalHT:
                Math.round(qty * unitPrice * (1 - discount / 100) * 100) / 100,
              order: index,
            }
          }
        ),
      })
    }

    const data = await prisma.invoice.update({
      where: { id: params.id },
      data: updateData,
      include: {
        client: true,
        project: true,
        lines: { orderBy: { order: 'asc' } },
      },
    })

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error('PUT /api/invoices/[id] error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const existing = await prisma.invoice.findFirst({
      where: { id: params.id, companyId },
    })
    if (!existing) {
      return NextResponse.json(
        { error: 'Facture introuvable' },
        { status: 404 }
      )
    }
    if (existing.status !== 'BROUILLON') {
      return NextResponse.json(
        { error: 'Seules les factures en brouillon peuvent être supprimées' },
        { status: 400 }
      )
    }

    await prisma.invoice.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/invoices/[id] error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
