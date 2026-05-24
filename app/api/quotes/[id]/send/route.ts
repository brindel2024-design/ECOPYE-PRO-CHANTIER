import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'

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
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { siret: true, address: true, postalCode: true },
    })
    const missing: string[] = []
    if (!company?.siret) missing.push('SIRET')
    if (!company?.address) missing.push('adresse')
    if (!company?.postalCode) missing.push('code postal')
    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: `Profil entreprise incomplet (${missing.join(', ')}). Complétez vos informations légales dans Paramètres avant d'envoyer un devis.`,
          missing,
        },
        { status: 400 }
      )
    }

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
