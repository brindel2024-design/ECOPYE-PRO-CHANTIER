import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'

/**
 * Suppression de compte (art. 17 RGPD - droit à l'effacement).
 * Le propriétaire (rôle OWNER) doit confirmer son mot de passe pour autoriser l'action.
 * Supprime entièrement la company et toutes ses données.
 *
 * IMPORTANT : les factures sont légalement à conserver 10 ans (art. L.123-22 Code de commerce).
 * Cette suppression efface vos données du SaaS ; en cas de contrôle fiscal, c'est à vous d'avoir
 * archivé vos factures par ailleurs avant suppression (utilisez /api/account/export).
 */
export async function POST(request: Request) {
  const { session, error } = await getSessionOrUnauthorized()
  if (error) return error
  const { companyId, error: companyError } = requireCompanyId(session)
  if (companyError) return companyError

  const userId = (session.user as { id?: string }).id
  if (!userId) return NextResponse.json({ error: 'Session invalide.' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const password = body?.password as string | undefined
  const confirm = body?.confirm as string | undefined

  if (confirm !== 'SUPPRIMER') {
    return NextResponse.json(
      { error: 'Pour confirmer, tapez SUPPRIMER en majuscules.' },
      { status: 400 }
    )
  }

  // Vérification du mot de passe du propriétaire (les non-OWNER ne peuvent pas supprimer le compte)
  const me = await prisma.user.findUnique({ where: { id: userId } })
  if (!me || me.role !== 'OWNER') {
    return NextResponse.json(
      { error: 'Seul le propriétaire (OWNER) peut supprimer le compte.' },
      { status: 403 }
    )
  }
  if (!password || !(await bcrypt.compare(password, me.passwordHash))) {
    return NextResponse.json({ error: 'Mot de passe incorrect.' }, { status: 400 })
  }

  // Suppression cascade (dans l'ordre des dépendances)
  await prisma.aiRequest.deleteMany({ where: { companyId } })
  await prisma.payment.deleteMany({ where: { companyId } })
  await prisma.scheduleEvent.deleteMany({ where: { companyId } })
  await prisma.document.deleteMany({ where: { companyId } })
  await prisma.photoProof.deleteMany({ where: { project: { companyId } } })
  await prisma.supportTicket.deleteMany({ where: { companyId } })
  await prisma.subscription.deleteMany({ where: { companyId } })
  await prisma.invoice.deleteMany({ where: { companyId } })
  await prisma.quote.deleteMany({ where: { companyId } })
  await prisma.project.deleteMany({ where: { companyId } })
  await prisma.client.deleteMany({ where: { companyId } })
  await prisma.technician.deleteMany({ where: { companyId } })
  await prisma.user.deleteMany({ where: { companyId } })
  await prisma.company.delete({ where: { id: companyId } })

  return NextResponse.json({ success: true })
}
