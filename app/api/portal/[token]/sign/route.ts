import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: { token: string } }

/**
 * Signature PUBLIQUE du devis par le client via le portail (token).
 * Signature simple : nom du signataire + acceptation explicite, horodatée,
 * avec capture de l'IP à titre de preuve. Idempotent (pas de re-signature).
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const token = params.token
    const body = await request.json().catch(() => ({}))
    const signerName = typeof body.signerName === 'string' ? body.signerName.trim() : ''
    const accept = body.accept === true

    if (!signerName || signerName.length < 2) {
      return NextResponse.json({ error: 'Veuillez indiquer votre nom et prénom.' }, { status: 400 })
    }
    if (!accept) {
      return NextResponse.json({ error: 'Vous devez cocher « Bon pour accord » pour signer.' }, { status: 400 })
    }

    const quote = await prisma.quote.findUnique({ where: { publicToken: token } })
    if (!quote) {
      return NextResponse.json({ error: 'Devis introuvable ou lien expiré' }, { status: 404 })
    }
    if (quote.signedAt || quote.status === 'ACCEPTE') {
      return NextResponse.json({ error: 'Ce devis a déjà été signé.' }, { status: 409 })
    }
    if (quote.status === 'REFUSE' || quote.status === 'ANNULE') {
      return NextResponse.json({ error: "Ce devis n'est plus disponible à la signature." }, { status: 409 })
    }
    if (quote.expiresAt && new Date(quote.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: 'Ce devis a expiré. Demandez un nouveau devis à votre artisan.' }, { status: 409 })
    }

    const fwd = request.headers.get('x-forwarded-for') || ''
    const ip = fwd.split(',')[0].trim() || request.headers.get('x-real-ip') || 'inconnue'
    const now = new Date()

    await prisma.quote.update({
      where: { id: quote.id },
      data: {
        status: 'ACCEPTE',
        acceptedAt: now,
        signedAt: now,
        signerName,
        signerIp: ip,
      },
    })

    return NextResponse.json({ success: true, signedAt: now, signerName })
  } catch (e) {
    console.error('POST /api/portal/[token]/sign error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
