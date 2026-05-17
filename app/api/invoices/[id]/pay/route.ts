import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'

type Params = { params: { id: string } }

export async function POST(request: Request, { params }: Params) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const invoice = await prisma.invoice.findFirst({
      where: { id: params.id, companyId },
    })
    if (!invoice) {
      return NextResponse.json(
        { error: 'Facture introuvable' },
        { status: 404 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const amount = Number(body.amount ?? invoice.totalTTC)
    const method = body.method ?? 'VIREMENT'
    const now = new Date()
    const receiptNumber = `REC-${now
      .toISOString()
      .slice(2, 10)
      .replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`

    const payment = await prisma.payment.create({
      data: {
        companyId,
        clientId: invoice.clientId,
        invoiceId: invoice.id,
        amount,
        status: 'REUSSI',
        method,
        receiptNumber,
        simulatedAt: now,
      },
    })

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'PAYEE',
        paidAt: now,
        amountPaid: amount,
      },
      include: {
        client: true,
        payments: { orderBy: { createdAt: 'desc' } },
      },
    })

    return NextResponse.json({
      success: true,
      data: { invoice: updatedInvoice, payment },
    })
  } catch (e) {
    console.error('POST /api/invoices/[id]/pay error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
