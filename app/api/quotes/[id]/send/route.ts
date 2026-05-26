import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId, assertCompanyLegalReady } from '@/lib/api-helpers'

type Params = { params: { id: string } }

export async function POST(_request: Request, { params }: Params) {
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

    // Garde-fou légal : un devis envoyé doit porter le SIRET et l'adresse de l'émetteur
    const legal = await assertCompanyLegalReady(companyId)
    if (!legal.ok) return legal.error

    const data = await prisma.quote.update({
      where: { id: params.id },
      data: { status: 'ENVOYE', sentAt: new Date() },
      include: { client: true, lines: { orderBy: { order: 'asc' } } },
    })

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error('POST /api/quotes/[id]/send error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
