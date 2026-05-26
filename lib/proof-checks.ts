/**
 * Check-list de protection anti-litige d'un chantier (D10).
 * Détecte les preuves manquantes et calcule un score de protection.
 */

export interface ProofChecklistItem {
  key: string
  label: string
  done: boolean
  hint?: string
}

export interface ProofInput {
  photos: { category?: string | null }[]
  hasLinkedQuote: boolean
  hasInvoice: boolean
  received?: boolean
  openReserves?: number
  totalReserves?: number
}

export function checkProjectProof(input: ProofInput): {
  items: ProofChecklistItem[]
  score: number
  done: number
  total: number
} {
  const cats = input.photos.map((p) => (p.category ?? 'PENDANT').toUpperCase())
  const items: ProofChecklistItem[] = [
    { key: 'avant', label: 'Photo « avant » travaux', done: cats.includes('AVANT'), hint: "Preuve de l'état initial du chantier." },
    { key: 'pendant', label: 'Photos « pendant » travaux', done: cats.includes('PENDANT'), hint: "Suivi de l'exécution." },
    { key: 'apres', label: 'Photo « après » travaux', done: cats.includes('APRES'), hint: 'Preuve du travail livré.' },
    { key: 'min', label: 'Au moins 3 photos horodatées', done: input.photos.length >= 3 },
    { key: 'devis', label: 'Devis rattaché au chantier', done: input.hasLinkedQuote, hint: 'Cadre contractuel signé.' },
    { key: 'facture', label: 'Facture émise', done: input.hasInvoice },
    { key: 'reception', label: 'Réception du chantier enregistrée', done: Boolean(input.received), hint: 'PV de réception signé par le client.' },
  ]
  if ((input.totalReserves ?? 0) > 0) {
    items.push({
      key: 'reserves',
      label: 'Réserves levées',
      done: (input.openReserves ?? 0) === 0,
      hint: 'Documentez la levée des réserves.',
    })
  }
  const done = items.filter((i) => i.done).length
  const total = items.length
  return { items, score: Math.round((100 * done) / total), done, total }
}
