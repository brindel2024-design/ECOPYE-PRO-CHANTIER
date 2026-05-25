import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendEmail, isEmailConfigured } from '@/lib/email'

/**
 * Demande de réinitialisation de mot de passe.
 * Génère un token à durée limitée et envoie un lien par email.
 * Réponse toujours identique (ne révèle pas si l'email existe — anti-énumération).
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const email = (body?.email as string | undefined)?.trim().toLowerCase()

  const genericOk = NextResponse.json({
    success: true,
    message: 'Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.',
  })

  if (!email) return genericOk

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.active) return genericOk

  const token = crypto.randomBytes(32).toString('hex')
  const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 heure

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: expiry },
  })

  const origin =
    request.headers.get('origin') || process.env.NEXTAUTH_URL || 'https://pro.ecopye.fr'
  const link = `${origin}/reset-password?token=${token}`

  if (isEmailConfigured()) {
    await sendEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe ECOPYE Pro Chantier',
      text: `Bonjour,

Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous (valable 1 heure) :

${link}

Si vous n'êtes pas à l'origine de cette demande, ignorez cet email — votre mot de passe reste inchangé.

— ECOPYE Pro Chantier`,
    })
  } else {
    console.warn('forgot-password: email non configuré, lien non envoyé:', link)
  }

  return genericOk
}
