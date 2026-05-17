import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  getSessionOrUnauthorized,
  requireCompanyId,
  computeTotals,
  buildDocumentNumber,
} from '@/lib/api-helpers'

export async function GET(request: Request) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')

    const data = await prisma.invoice.findMany({
      where: {
        companyId,
        ...(status ? { status } : {}),
        ...(clientId ? { clientId } : {}),
      },
      include: {
        client: true,
        project: true,
        lines: { orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data, total: data.length })
  } catch (e) {
    console.error('GET /api/invoices error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const body = await request.json()
    const {
      clientId,
      quoteId,
      projectId,
      type,
      lines = [],
      dueDate,
      notes,
    } = body

    let resolvedClientId = clientId
    let invoiceLines = lines

    // Création depuis un devis : on reprend client + lignes.
    if (quoteId) {
      const quote = await prisma.quote.findFirst({
        where: { id: quoteId, companyId },
        include: { lines: { orderBy: { order: 'asc' } } },
      })
      if (!quote) {
        return NextResponse.json(
          { error: 'Devis introuvable' },
          { status: 404 }
        )
      }
      resolvedClientId = quote.clientId
      if (invoiceLines.length === 0) {
        invoiceLines = quote.lines.map((l) => ({
          label: l.label,
          description: l.description,
          quantity: l.quantity,
          unit: l.unit,
          unitPriceHT: l.unitPriceHT,
          vatRate: l.vatRate,
          discount: l.discount,
        }))
      }
    }

    if (!resolvedClientId) {
      return NextResponse.json(
        { error: 'Champ requis manquant (clientId ou quoteId)' },
        { status: 400 }
      )
    }

    const client = await prisma.client.findFirst({
      where: { id: resolvedClientId, companyId },
    })
    if (!client) {
      return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })
    }

    const totals = computeTotals(invoiceLines)
    const year = new Date().getFullYear()
    const count = await prisma.invoice.count({
      where: {
        companyId,
        createdAt: {
          gte: new Date(`${year}-01-01T00:00:00.000Z`),
          lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
        },
      },
    })
    const number = buildDocumentNumber('FAC', year, count)

    const data = await prisma.invoice.create({
      data: {
        companyId,
        clientId: resolvedClientId,
        quoteId: quoteId ?? null,
        projectId: projectId ?? null,
        number,
        type: type ?? 'FINALE',
        status: 'BROUILLON',
        subtotalHT: totals.subtotalHT,
        vatAmount: totals.vatAmount,
        totalTTC: totals.totalTTC,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: notes ?? null,
        lines: {
          create: invoiceLines.map(
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
                label: line.label,
                description: line.description ?? null,
                quantity: qty,
                unit: line.unit ?? 'forfait',
                unitPriceHT: unitPrice,
                vatRate: Number(line.vatRate ?? 20),
                totalHT:
                  Math.round(qty * unitPrice * (1 - discount / 100) * 100) /
                  100,
                order: index,
              }
            }
          ),
        },
      },
      include: {
        client: true,
        project: true,
        lines: { orderBy: { order: 'asc' } },
      },
    })

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (e) {
    console.error('POST /api/invoices error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
