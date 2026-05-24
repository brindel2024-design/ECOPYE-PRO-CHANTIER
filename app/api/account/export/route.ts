import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'

/**
 * Export RGPD : renvoie au format JSON l'intégralité des données de la company
 * détenues par l'utilisateur connecté (droit à la portabilité, art. 20 RGPD).
 */
export async function GET() {
  const { session, error } = await getSessionOrUnauthorized()
  if (error) return error
  const { companyId, error: companyError } = requireCompanyId(session)
  if (companyError) return companyError

  const [company, users, clients, projects, quotes, invoices, payments, photos, documents, scheduleEvents, aiRequests, subscription] = await Promise.all([
    prisma.company.findUnique({ where: { id: companyId } }),
    prisma.user.findMany({
      where: { companyId },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    }),
    prisma.client.findMany({ where: { companyId } }),
    prisma.project.findMany({ where: { companyId }, include: { steps: true } }),
    prisma.quote.findMany({ where: { companyId }, include: { lines: true } }),
    prisma.invoice.findMany({ where: { companyId }, include: { lines: true } }),
    prisma.payment.findMany({ where: { companyId } }),
    prisma.photoProof.findMany({ where: { project: { companyId } } }),
    prisma.document.findMany({ where: { companyId } }),
    prisma.scheduleEvent.findMany({ where: { companyId } }),
    prisma.aiRequest.findMany({ where: { companyId }, select: { id: true, type: true, prompt: true, createdAt: true } }),
    prisma.subscription.findUnique({ where: { companyId } }),
  ])

  const dump = {
    exportedAt: new Date().toISOString(),
    rgpd: 'Cet export contient toutes les données personnelles vous concernant détenues par ECOPYE Pro Chantier (art. 20 RGPD - portabilité).',
    company,
    users,
    subscription,
    clients,
    projects,
    quotes,
    invoices,
    payments,
    photos,
    documents,
    scheduleEvents,
    aiRequests,
  }

  return new NextResponse(JSON.stringify(dump, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="ecopye-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  })
}
