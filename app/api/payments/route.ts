import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'

export async function GET() {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const payments = await prisma.payment.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { firstName: true, lastName: true } },
        invoice: { select: { number: true } },
      },
    })

    return NextResponse.json({ data: payments })
  } catch (e) {
    console.error('GET /api/payments error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
