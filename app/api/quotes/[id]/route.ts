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

    const data = await prisma.quote.findFirst({
      where: { id: params.id, companyId },
      include: { client: true, lines: { orderBy: { order: 'asc' } } },
    })

    if (!data) {
      return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error('GET /api/quotes/[id] error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const existing = await prisma.quote.findFirst({
      where: { id: params.id, companyId },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 })
    }

    const body = await request.json()
    const {
      title,
      description,
      lines,
      depositPercentage,
      notes,
      termsAndConditions,
      status,
      expiresAt,
    } = body

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (depositPercentage !== undefined)
      updateData.depositPercentage = depositPercentage
    if (notes !== undefined) updateData.notes = notes
    if (termsAndConditions !== undefined)
      updateData.termsAndConditions = termsAndConditions
    if (status !== undefined) updateData.status = status
    if (expiresAt !== undefined)
      updateData.expiresAt = expiresAt ? new Date(expiresAt) : null

    // Si de nouvelles lignes sont fournies, on les remplace et recalcule.
    if (Array.isArray(lines)) {
      const totals = computeTotals(lines)
      updateData.subtotalHT = totals.subtotalHT
      updateData.vatAmount = totals.vatAmount
      updateData.totalTTC = totals.totalTTC

      await prisma.quoteLine.deleteMany({ where: { quoteId: params.id } })
      await prisma.quoteLine.createMany({
        data: lines.map(
          (
            line: {
              label: string
              description?: string
              quantity?: number
              unit?: string
              unitPriceHT?: number
              vatRate?: number
              discount?: number
              isLabor?: boolean
            },
            index: number
          ) => {
            const qty = Number(line.quantity ?? 1)
            const unitPrice = Number(line.unitPriceHT ?? 0)
            const discount = Number(line.discount ?? 0)
            return {
              quoteId: params.id,
              label: line.label,
              description: line.description ?? null,
              quantity: qty,
              unit: line.unit ?? 'forfait',
              unitPriceHT: unitPrice,
              vatRate: Number(line.vatRate ?? 20),
              discount,
              totalHT:
                Math.round(qty * unitPrice * (1 - discount / 100) * 100) / 100,
              order: index,
              isLabor: line.isLabor ?? false,
            }
          }
        ),
      })
    }

    const data = await prisma.quote.update({
      where: { id: params.id },
      data: updateData,
      include: { client: true, lines: { orderBy: { order: 'asc' } } },
    })

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error('PUT /api/quotes/[id] error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const existing = await prisma.quote.findFirst({
      where: { id: params.id, companyId },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 })
    }
    if (existing.status !== 'BROUILLON') {
      return NextResponse.json(
        { error: 'Seuls les devis en brouillon peuvent être supprimés' },
        { status: 400 }
      )
    }

    await prisma.quote.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/quotes/[id] error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
