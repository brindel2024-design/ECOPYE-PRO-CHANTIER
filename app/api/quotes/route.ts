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

    const data = await prisma.quote.findMany({
      where: {
        companyId,
        ...(status ? { status } : {}),
        ...(clientId ? { clientId } : {}),
      },
      include: { client: true, lines: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data, total: data.length })
  } catch (e) {
    console.error('GET /api/quotes error:', e)
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
      title,
      description,
      lines = [],
      depositPercentage,
      notes,
      termsAndConditions,
      expiresAt,
    } = body

    if (!clientId || !title) {
      return NextResponse.json(
        { error: 'Champs requis manquants (clientId, title)' },
        { status: 400 }
      )
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, companyId },
    })
    if (!client) {
      return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })
    }

    const totals = computeTotals(lines)
    const year = new Date().getFullYear()
    // Numéro séquentiel par entreprise basé sur le plus grand numéro existant.
    const last = await prisma.quote.findFirst({
      where: { companyId, number: { startsWith: `DEV-${year}-` } },
      orderBy: { number: 'desc' },
      select: { number: true },
    })
    const lastSeq = last ? parseInt(last.number.split('-')[2] ?? '0', 10) || 0 : 0
    const number = buildDocumentNumber('DEV', year, lastSeq)

    const data = await prisma.quote.create({
      data: {
        companyId,
        clientId,
        number,
        title,
        description: description ?? null,
        status: 'BROUILLON',
        subtotalHT: totals.subtotalHT,
        vatAmount: totals.vatAmount,
        totalTTC: totals.totalTTC,
        depositPercentage: depositPercentage ?? 30,
        notes: notes ?? null,
        termsAndConditions: termsAndConditions ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        lines: {
          create: lines.map(
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
                label: line.label,
                description: line.description ?? null,
                quantity: qty,
                unit: line.unit ?? 'forfait',
                unitPriceHT: unitPrice,
                vatRate: Number(line.vatRate ?? 20),
                discount,
                totalHT:
                  Math.round(qty * unitPrice * (1 - discount / 100) * 100) /
                  100,
                order: index,
                isLabor: line.isLabor ?? false,
              }
            }
          ),
        },
      },
      include: { client: true, lines: { orderBy: { order: 'asc' } } },
    })

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (e) {
    console.error('POST /api/quotes error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
