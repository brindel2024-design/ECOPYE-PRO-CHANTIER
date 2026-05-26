/**
 * Moteur de "sécurisation avant envoi" — vérifications déterministes anti-litige.
 *
 * Source de vérité fiable (indépendante de l'IA) : signale les mentions
 * manquantes, la TVA à vérifier, les preuves absentes, et les incohérences
 * avant qu'un devis / une facture ne parte chez le client.
 */

export type RiskLevel = 'bloquant' | 'attention' | 'info'

export interface RiskFlag {
  level: RiskLevel
  title: string
  detail?: string
}

export interface CheckCompany {
  siret: string | null
  address: string | null
  postalCode: string | null
  insuranceNumber: string | null
}

interface CheckLine {
  label?: string | null
  vatRate?: number | null
  totalHT?: number | null
}

export interface CheckQuoteInput {
  company: CheckCompany
  quote: {
    status?: string | null
    expiresAt?: Date | string | null
    totalTTC?: number | null
    lines: CheckLine[]
  }
  client: { email?: string | null } | null
  /** Le devis est-il rattaché à un chantier avec au moins une photo ? */
  hasProjectPhotos?: boolean
}

export interface CheckInvoiceInput {
  company: CheckCompany
  invoice: {
    status?: string | null
    dueDate?: Date | string | null
    totalTTC?: number | null
    lines: CheckLine[]
  }
  client: { email?: string | null } | null
}

function legalFlags(company: CheckCompany): RiskFlag[] {
  const flags: RiskFlag[] = []
  const missing: string[] = []
  if (!company.siret) missing.push('SIRET')
  if (!company.address) missing.push('adresse')
  if (!company.postalCode) missing.push('code postal')
  if (missing.length > 0) {
    flags.push({
      level: 'bloquant',
      title: `Informations légales manquantes : ${missing.join(', ')}`,
      detail: 'Obligatoires sur un document commercial. Complétez votre profil entreprise (Paramètres).',
    })
  }
  if (!company.insuranceNumber) {
    flags.push({
      level: 'attention',
      title: 'Assurance décennale non renseignée',
      detail: "Mention obligatoire pour les travaux relevant de la garantie décennale.",
    })
  }
  return flags
}

function vatFlag(lines: CheckLine[]): RiskFlag | null {
  const rates = lines.map((l) => Number(l.vatRate ?? 20))
  if (rates.length === 0) return null
  const allTwenty = rates.every((r) => r === 20)
  if (allTwenty) {
    return {
      level: 'attention',
      title: 'Toutes les lignes sont à 20 % de TVA',
      detail: 'Vérifiez si un taux réduit s’applique (10 % rénovation logement +2 ans, 5,5 % rénovation énergétique).',
    }
  }
  return null
}

function lineFlags(lines: CheckLine[]): RiskFlag[] {
  const flags: RiskFlag[] = []
  if (lines.length === 0) {
    flags.push({ level: 'bloquant', title: 'Aucune ligne', detail: 'Ajoutez au moins une prestation.' })
    return flags
  }
  if (lines.some((l) => !l.label || !String(l.label).trim())) {
    flags.push({ level: 'attention', title: 'Une ou plusieurs lignes sans désignation' })
  }
  if (lines.some((l) => Number(l.totalHT ?? 0) <= 0)) {
    flags.push({ level: 'attention', title: 'Une ou plusieurs lignes à 0 €', detail: 'Vérifiez les quantités et prix unitaires.' })
  }
  return flags
}

function clientEmailFlag(client: { email?: string | null } | null): RiskFlag | null {
  if (!client?.email) {
    return {
      level: 'attention',
      title: 'Client sans adresse email',
      detail: "L'envoi par email et le suivi en ligne ne seront pas possibles.",
    }
  }
  return null
}

export function checkQuote(input: CheckQuoteInput): RiskFlag[] {
  const flags: RiskFlag[] = [...legalFlags(input.company), ...lineFlags(input.quote.lines)]
  const vat = vatFlag(input.quote.lines)
  if (vat) flags.push(vat)
  const email = clientEmailFlag(input.client)
  if (email) flags.push(email)

  if (!input.quote.expiresAt) {
    flags.push({ level: 'info', title: 'Pas de date de validité', detail: 'Indiquez « valable jusqu’au » (souvent 30 jours).' })
  } else {
    const exp = new Date(input.quote.expiresAt).getTime()
    if (!Number.isNaN(exp) && exp < Date.now()) {
      flags.push({ level: 'attention', title: 'Date de validité dépassée', detail: 'Le devis est expiré — prolongez la validité avant envoi.' })
    }
  }

  if (input.hasProjectPhotos === false) {
    flags.push({
      level: 'info',
      title: 'Aucune photo de chantier',
      detail: 'Des photos avant/pendant/après protègent en cas de litige (dossier de preuve).',
    })
  }
  return flags
}

export function checkInvoice(input: CheckInvoiceInput): RiskFlag[] {
  const flags: RiskFlag[] = [...legalFlags(input.company), ...lineFlags(input.invoice.lines)]
  const vat = vatFlag(input.invoice.lines)
  if (vat) flags.push(vat)
  const email = clientEmailFlag(input.client)
  if (email) flags.push(email)

  if (!input.invoice.dueDate) {
    flags.push({ level: 'attention', title: "Pas de date d'échéance", detail: 'Précisez l’échéance de paiement (mentions de pénalités liées).' })
  }
  return flags
}

/** Synthèse : niveau global le plus élevé + compteurs. */
export function summarize(flags: RiskFlag[]) {
  const counts = {
    bloquant: flags.filter((f) => f.level === 'bloquant').length,
    attention: flags.filter((f) => f.level === 'attention').length,
    info: flags.filter((f) => f.level === 'info').length,
  }
  const worst: RiskLevel | 'ok' =
    counts.bloquant > 0 ? 'bloquant' : counts.attention > 0 ? 'attention' : counts.info > 0 ? 'info' : 'ok'
  return { counts, worst }
}
