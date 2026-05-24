import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized } from '@/lib/api-helpers'

/**
 * Changement de mot de passe par l'utilisateur connecté.
 * (Le reset par email "j'ai oublié" est un flux distinct à brancher avec Resend.)
 */
export async function POST(request: Request) {
  const { session, error } = await getSessionOrUnauthorized()
  if (error) return error
  const userId = (session.user as { id?: string }).id
  if (!userId) return NextResponse.json({ error: 'Session invalide.' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const currentPassword = body?.currentPassword as string | undefined
  const newPassword = body?.newPassword as string | undefined

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Mot de passe actuel et nouveau requis.' }, { status: 400 })
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'Le nouveau mot de passe doit faire au moins 8 caractères.' }, { status: 400 })
  }

  const me = await prisma.user.findUnique({ where: { id: userId } })
  if (!me || !(await bcrypt.compare(currentPassword, me.passwordHash))) {
    return NextResponse.json({ error: 'Mot de passe actuel incorrect.' }, { status: 400 })
  }

  const hash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: userId } , data: { passwordHash: hash } })

  return NextResponse.json({ success: true })
}
