import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: { token: string } }

/**
 * Accès PUBLIC au devis via token (portail client). Aucune authentification :
 * le token aléatoire (192 bits) fait office de clé. Ne renvoie que le strict
 * nécessaire à l'affichage et à la signature.
 */
export async function GET(_request: Request, { params }: Params) {
  try {
    const token = params.token
    if (!token || token.length < 16) {
      return NextResponse.json({ error: 'Lien invalide' }, { status: 404 })
    }

    const quote = await prisma.quote.findUnique({
      where: { publicToken: token },
      include: {
        company: true,
        client: true,
        lines: { orderBy: { order: 'asc' } },
      },
    })
    if (!quote) {
      return NextResponse.json({ error: 'Devis introuvable ou lien expiré' }, { status: 404 })
    }

    // Marque comme "vu" la première fois
    if (!quote.viewedAt) {
      await prisma.quote.update({ where: { id: quote.id }, data: { viewedAt: new Date() } }).catch(() => {})
    }

    return NextResponse.json({
      company: {
        name: quote.company.name,
        phone: quote.company.phone,
        email: quote.company.email,
        siret: quote.company.siret,
        address: quote.company.address,
        city: quote.company.city,
        postalCode: quote.company.postalCode,
        insuranceNumber: quote.company.insuranceNumber,
      },
      client: { firstName: quote.client.firstName, lastName: quote.client.lastName },
      quote: {
        number: quote.number,
        title: quote.title,
        description: quote.description,
        status: quote.status,
        subtotalHT: quote.subtotalHT,
        vatAmount: quote.vatAmount,
        totalTTC: quote.totalTTC,
        depositPercentage: quote.depositPercentage,
        expiresAt: quote.expiresAt,
        notes: quote.notes,
        signedAt: quote.signedAt,
        signerName: quote.signerName,
        lines: quote.lines.map((l) => ({
          label: l.label,
          quantity: l.quantity,
          unit: l.unit,
          unitPriceHT: l.unitPriceHT,
          vatRate: l.vatRate,
          totalHT: l.totalHT,
        })),
      },
    })
  } catch (e) {
    console.error('GET /api/portal/[token] error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
