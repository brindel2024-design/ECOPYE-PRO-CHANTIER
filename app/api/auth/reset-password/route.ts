import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

/**
 * Réinitialise le mot de passe à partir d'un token valide et non expiré.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const token = body?.token as string | undefined
  const password = body?.password as string | undefined

  if (!token || !password) {
    return NextResponse.json({ error: 'Lien ou mot de passe manquant.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Le mot de passe doit faire au moins 8 caractères.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { resetToken: token } })
  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry.getTime() < Date.now()) {
    return NextResponse.json(
      { error: 'Lien invalide ou expiré. Refaites une demande de réinitialisation.' },
      { status: 400 }
    )
  }

  const hash = await bcrypt.hash(password, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hash, resetToken: null, resetTokenExpiry: null },
  })

  return NextResponse.json({ success: true })
}
