import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Garde-fou légal : vérifie que l'entreprise possède les informations
 * obligatoires (SIRET, adresse, code postal) avant toute émission ou envoi
 * d'un document commercial (devis, facture). Renvoie une erreur 400 sinon.
 */
export async function assertCompanyLegalReady(
  companyId: string
): Promise<{ ok: true } | { ok: false; error: NextResponse; missing: string[] }> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { siret: true, address: true, postalCode: true },
  })
  const missing: string[] = []
  if (!company?.siret) missing.push('SIRET')
  if (!company?.address) missing.push('adresse')
  if (!company?.postalCode) missing.push('code postal')
  if (missing.length > 0) {
    return {
      ok: false,
      missing,
      error: NextResponse.json(
        {
          error: `Profil entreprise incomplet (${missing.join(', ')}). Complétez vos informations légales dans Paramètres avant d'émettre ou d'envoyer ce document.`,
          missing,
        },
        { status: 400 }
      ),
    }
  }
  return { ok: true }
}

export async function getSessionOrUnauthorized() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json({ error: 'Non autorisé' }, { status: 401 }),
    }
  }
  return { session, error: null }
}

/**
 * Garde réservé aux comptes plateforme ECOPYE_ADMIN.
 */
export async function requireEcopyeAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json({ error: 'Non autorisé' }, { status: 401 }),
    }
  }
  const role = (session.user as { role?: string }).role
  if (role !== 'ECOPYE_ADMIN') {
    return {
      session: null,
      error: NextResponse.json(
        { error: "Accès réservé à l'administration ECOPYE" },
        { status: 403 }
      ),
    }
  }
  return { session, error: null }
}

/**
 * Récupère le companyId de la session ou renvoie une erreur 400.
 * Les comptes ECOPYE_ADMIN n'ont pas de companyId.
 */
export function requireCompanyId(
  session: { user: { companyId?: string | null } }
):
  | { companyId: string; error: null }
  | { companyId: null; error: NextResponse } {
  const companyId = session.user.companyId
  if (!companyId) {
    return {
      companyId: null,
      error: NextResponse.json(
        { error: 'Aucune entreprise associée à ce compte' },
        { status: 400 }
      ),
    }
  }
  return { companyId, error: null }
}

interface LineInput {
  quantity?: number
  unitPriceHT?: number
  vatRate?: number
  discount?: number
}

/**
 * Calcule les totaux d'un devis / facture à partir de ses lignes.
 * subtotalHT = somme(qty * unitPrice * (1 - discount/100))
 * vatAmount  = somme(lineHT * vatRate/100)
 * totalTTC   = subtotalHT + vatAmount
 */
export function computeTotals(lines: LineInput[]) {
  let subtotalHT = 0
  let vatAmount = 0
  for (const line of lines) {
    const qty = Number(line.quantity ?? 1)
    const unitPrice = Number(line.unitPriceHT ?? 0)
    const discount = Number(line.discount ?? 0)
    const vatRate = Number(line.vatRate ?? 20)
    const lineHT = qty * unitPrice * (1 - discount / 100)
    subtotalHT += lineHT
    vatAmount += (lineHT * vatRate) / 100
  }
  const round = (n: number) => Math.round(n * 100) / 100
  return {
    subtotalHT: round(subtotalHT),
    vatAmount: round(vatAmount),
    totalTTC: round(subtotalHT + vatAmount),
  }
}

/**
 * Génère un numéro séquentiel du type PREFIX-YYYY-0001 en comptant les
 * enregistrements existants de l'année courante pour la company.
 */
export function buildDocumentNumber(
  prefix: string,
  year: number,
  count: number
) {
  const sequence = String(count + 1).padStart(4, '0')
  return `${prefix}-${year}-${sequence}`
}
