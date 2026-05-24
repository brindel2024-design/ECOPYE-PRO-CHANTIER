'use client'

// Client-side PDF generation using jsPDF
export async function generateQuotePdf(quote: {
  number: string
  title: string
  createdAt: string
  expiresAt?: string | null
  client: { firstName: string; lastName: string; email: string; phone: string; address: string; city: string }
  company: { name: string; siret: string | null; address: string; city: string; phone: string; email: string; vatNumber?: string | null; insuranceNumber?: string | null }
  lines: { label: string; quantity: number; unit: string; unitPriceHT: number; vatRate: number; totalHT: number }[]
  subtotalHT: number
  vatAmount: number
  totalTTC: number
  depositPercentage: number
  notes?: string | null
}) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const blue = [37, 99, 235] as [number, number, number]
  const gray = [107, 114, 128] as [number, number, number]
  const dark = [17, 24, 39] as [number, number, number]

  // Header band
  doc.setFillColor(...blue)
  doc.rect(0, 0, 210, 35, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('ECOPYE Pro Chantier', 15, 14)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`DEVIS N° ${quote.number}`, 15, 23)
  doc.text(`Date : ${new Date(quote.createdAt).toLocaleDateString('fr-FR')}`, 15, 30)
  if (quote.expiresAt) doc.text(`Valable jusqu'au : ${new Date(quote.expiresAt).toLocaleDateString('fr-FR')}`, 100, 30)

  // Company block
  doc.setTextColor(...dark)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(quote.company.name, 15, 50)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...gray)
  doc.text(`SIRET : ${quote.company.siret ?? '— à renseigner —'}`, 15, 56)
  doc.text(quote.company.address || '— adresse à compléter —', 15, 61)
  doc.text(quote.company.city, 15, 66)
  doc.text(quote.company.phone, 15, 71)
  if (quote.company.vatNumber) doc.text(`TVA intracom. : ${quote.company.vatNumber}`, 15, 76)

  // Client block
  doc.setFillColor(248, 250, 252)
  doc.rect(120, 43, 75, 35, 'F')
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('CLIENT', 125, 51)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...gray)
  doc.text(`${quote.client.firstName} ${quote.client.lastName}`, 125, 58)
  doc.text(quote.client.email, 125, 63)
  doc.text(quote.client.phone, 125, 68)
  doc.text(`${quote.client.address}, ${quote.client.city}`, 125, 73)

  // Title
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(quote.title, 15, 92)

  // Table header
  let y = 102
  doc.setFillColor(...blue)
  doc.rect(15, y - 5, 180, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('Désignation', 17, y)
  doc.text('Qté', 110, y)
  doc.text('P.U. HT', 125, y)
  doc.text('TVA', 148, y)
  doc.text('Total HT', 163, y)

  // Lines
  y += 10
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  for (const line of quote.lines) {
    if (y > 250) { doc.addPage(); y = 20 }
    doc.text(line.label.substring(0, 50), 17, y)
    doc.text(String(line.quantity), 112, y)
    doc.text(`${line.unitPriceHT.toFixed(2)} €`, 125, y)
    doc.text(`${line.vatRate}%`, 149, y)
    doc.text(`${line.totalHT.toFixed(2)} €`, 163, y)
    y += 7
    doc.setDrawColor(229, 231, 235)
    doc.line(15, y - 3, 195, y - 3)
  }

  // Totals
  y += 5
  const totalsX = 140
  doc.setFontSize(9)
  doc.text('Sous-total HT :', totalsX, y); doc.text(`${quote.subtotalHT.toFixed(2)} €`, 185, y, { align: 'right' }); y += 7
  doc.text('TVA :', totalsX, y); doc.text(`${quote.vatAmount.toFixed(2)} €`, 185, y, { align: 'right' }); y += 7
  doc.setFont('helvetica', 'bold')
  doc.setFillColor(...blue)
  doc.rect(138, y - 5, 57, 9, 'F')
  doc.setTextColor(255, 255, 255)
  doc.text('TOTAL TTC :', totalsX, y); doc.text(`${quote.totalTTC.toFixed(2)} €`, 185, y, { align: 'right' }); y += 12

  // Acompte
  doc.setTextColor(...gray)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  const acompte = (quote.totalTTC * quote.depositPercentage / 100).toFixed(2)
  doc.text(`Acompte demandé (${quote.depositPercentage}%) : ${acompte} €`, 15, y)

  if (quote.notes) {
    y += 10
    doc.setFont('helvetica', 'bold')
    doc.text('Notes :', 15, y)
    doc.setFont('helvetica', 'normal')
    doc.text(quote.notes.substring(0, 200), 15, y + 6)
  }

  // Mentions légales devis
  doc.setFontSize(7)
  doc.setTextColor(...gray)
  let footerY = 268
  const legalLines: string[] = [
    'Devis valable 30 jours à compter de la date d\'émission. En cas d\'acceptation, retourner ce document signé avec la mention manuscrite « Bon pour accord ».',
    'Modalités de règlement : à la commande pour l\'acompte (30 %), solde à la fin des travaux.',
    'En cas de retard de paiement, des pénalités au taux de 3 fois le taux d\'intérêt légal en vigueur seront appliquées (art. L.441-10 Code de commerce), ainsi qu\'une indemnité forfaitaire pour frais de recouvrement de 40 € (art. D.441-5).',
    'Aucun escompte n\'est accordé pour paiement anticipé, sauf accord particulier.',
  ]
  if (quote.company.insuranceNumber) {
    legalLines.push(`Assurance professionnelle / décennale : ${quote.company.insuranceNumber}.`)
  }
  if (!quote.company.siret) {
    legalLines.unshift('⚠ DOCUMENT INCOMPLET — SIRET de l\'éditeur manquant. À compléter dans Paramètres avant transmission au client.')
  }
  for (const line of legalLines) {
    const wrapped = doc.splitTextToSize(line, 180)
    doc.text(wrapped, 15, footerY)
    footerY += wrapped.length * 3.5 + 1
    if (footerY > 290) break
  }

  doc.save(`Devis-${quote.number}.pdf`)
}

export async function generateInvoicePdf(invoice: {
  number: string
  type: string
  issuedAt: string
  dueDate?: string | null
  client: { firstName: string; lastName: string; email: string; phone: string; address: string; city: string }
  company: { name: string; siret: string | null; address: string; city: string; phone: string; email: string; vatNumber?: string | null; insuranceNumber?: string | null }
  lines: { label: string; quantity: number; unit: string; unitPriceHT: number; vatRate: number; totalHT: number }[]
  subtotalHT: number
  vatAmount: number
  totalTTC: number
  amountPaid: number
  notes?: string | null
}) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const blue = [37, 99, 235] as [number, number, number]
  const gray = [107, 114, 128] as [number, number, number]
  const dark = [17, 24, 39] as [number, number, number]

  const TYPE_LABELS: Record<string, string> = { ACOMPTE: 'Acompte', FINALE: 'Facture finale', INTERMEDIAIRE: 'Intermédiaire', AVOIR: 'Avoir' }

  doc.setFillColor(...blue)
  doc.rect(0, 0, 210, 35, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('ECOPYE Pro Chantier', 15, 14)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`${TYPE_LABELS[invoice.type] ?? 'FACTURE'} N° ${invoice.number}`, 15, 23)
  doc.text(`Date : ${new Date(invoice.issuedAt).toLocaleDateString('fr-FR')}`, 15, 30)
  if (invoice.dueDate) doc.text(`Échéance : ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`, 100, 30)

  doc.setTextColor(...dark)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(invoice.company.name, 15, 50)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...gray)
  doc.text(`SIRET : ${invoice.company.siret ?? '— à renseigner —'}`, 15, 56)
  if (invoice.company.vatNumber) doc.text(`TVA intracom. : ${invoice.company.vatNumber}`, 15, 61)
  doc.text(invoice.company.address, 15, 66)
  doc.text(invoice.company.city, 15, 71)

  doc.setFillColor(248, 250, 252)
  doc.rect(120, 43, 75, 35, 'F')
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('FACTURER À', 125, 51)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...gray)
  doc.text(`${invoice.client.firstName} ${invoice.client.lastName}`, 125, 58)
  doc.text(invoice.client.email, 125, 63)
  doc.text(invoice.client.phone, 125, 68)

  let y = 102
  doc.setFillColor(...blue)
  doc.rect(15, y - 5, 180, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('Désignation', 17, y)
  doc.text('Qté', 110, y)
  doc.text('P.U. HT', 125, y)
  doc.text('TVA', 148, y)
  doc.text('Total HT', 163, y)

  y += 10
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  for (const line of invoice.lines) {
    if (y > 250) { doc.addPage(); y = 20 }
    doc.text(line.label.substring(0, 50), 17, y)
    doc.text(String(line.quantity), 112, y)
    doc.text(`${line.unitPriceHT.toFixed(2)} €`, 125, y)
    doc.text(`${line.vatRate}%`, 149, y)
    doc.text(`${line.totalHT.toFixed(2)} €`, 163, y)
    y += 7
    doc.setDrawColor(229, 231, 235)
    doc.line(15, y - 3, 195, y - 3)
  }

  y += 5
  const totalsX = 140
  doc.setFontSize(9)
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'normal')
  doc.text('Sous-total HT :', totalsX, y); doc.text(`${invoice.subtotalHT.toFixed(2)} €`, 185, y, { align: 'right' }); y += 7
  doc.text('TVA :', totalsX, y); doc.text(`${invoice.vatAmount.toFixed(2)} €`, 185, y, { align: 'right' }); y += 7
  doc.setFont('helvetica', 'bold')
  doc.setFillColor(...blue)
  doc.rect(138, y - 5, 57, 9, 'F')
  doc.setTextColor(255, 255, 255)
  doc.text('TOTAL TTC :', totalsX, y); doc.text(`${invoice.totalTTC.toFixed(2)} €`, 185, y, { align: 'right' }); y += 12

  if (invoice.amountPaid > 0) {
    doc.setTextColor(...dark)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`Déjà réglé : ${invoice.amountPaid.toFixed(2)} €`, 140, y)
    y += 7
    const reste = invoice.totalTTC - invoice.amountPaid
    doc.setFont('helvetica', 'bold')
    doc.text(`Reste à payer : ${reste.toFixed(2)} €`, 140, y)
    y += 10
  }

  // Mentions légales facture (Code de commerce L.441-10, D.441-5)
  doc.setFontSize(7)
  doc.setTextColor(...gray)
  doc.setFont('helvetica', 'normal')
  let footerY = 262
  const legalLines: string[] = [
    'Règlement par virement bancaire (RIB à demander). Tout autre moyen de paiement doit faire l\'objet d\'un accord préalable.',
    'En cas de retard de paiement, application sans mise en demeure préalable de pénalités au taux de 3 fois le taux d\'intérêt légal en vigueur (art. L.441-10 Code de commerce).',
    'Indemnité forfaitaire pour frais de recouvrement : 40 € (art. D.441-5 Code de commerce), majorée si les frais réels exposés sont supérieurs.',
    'Aucun escompte n\'est accordé pour paiement anticipé, sauf accord particulier.',
    'TVA non applicable, art. 293 B du CGI — à supprimer si vous êtes assujetti à la TVA.',
  ]
  if (invoice.company.insuranceNumber) {
    legalLines.push(`Assurance professionnelle / décennale : ${invoice.company.insuranceNumber}.`)
  }
  if (invoice.company.vatNumber) {
    // Si la société a un numéro de TVA, retirer la mention franchise
    legalLines.splice(legalLines.length - 2, 1)
  }
  if (!invoice.company.siret) {
    legalLines.unshift('⚠ DOCUMENT INCOMPLET — SIRET de l\'émetteur manquant. À compléter dans Paramètres avant transmission au client.')
  }
  for (const line of legalLines) {
    const wrapped = doc.splitTextToSize(line, 180)
    doc.text(wrapped, 15, footerY)
    footerY += wrapped.length * 3.3 + 0.7
    if (footerY > 290) break
  }

  doc.save(`Facture-${invoice.number}.pdf`)
}

export async function generateProjectReportPdf(project: {
  title: string
  description?: string | null
  status: string
  progress: number
  address: string
  city: string
  postalCode: string
  plannedBudget: number
  actualBudget: number
  startDate?: string | null
  endDate?: string | null
  notes?: string | null
  client?: { firstName: string; lastName: string; phone: string; city: string } | null
  company: { name: string; siret: string | null; address: string; city: string; phone: string }
  steps: { title: string; status: string; validatedByClient: boolean }[]
}) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const blue = [37, 99, 235] as [number, number, number]
  const gray = [107, 114, 128] as [number, number, number]
  const dark = [17, 24, 39] as [number, number, number]
  const euro = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

  doc.setFillColor(...blue)
  doc.rect(0, 0, 210, 35, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('ECOPYE Pro Chantier', 15, 14)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('RAPPORT DE CHANTIER', 15, 23)
  doc.text(`Édité le : ${new Date().toLocaleDateString('fr-FR')}`, 15, 30)

  doc.setTextColor(...dark)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(project.company.name, 15, 50)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...gray)
  doc.text(`SIRET : ${project.company.siret ?? '— à renseigner —'}`, 15, 56)
  doc.text(project.company.phone, 15, 61)

  if (project.client) {
    doc.setFillColor(248, 250, 252)
    doc.rect(120, 43, 75, 30, 'F')
    doc.setTextColor(...dark)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('CLIENT', 125, 51)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...gray)
    doc.text(`${project.client.firstName} ${project.client.lastName}`, 125, 58)
    doc.text(project.client.phone, 125, 63)
    doc.text(project.client.city, 125, 68)
  }

  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(project.title, 15, 88)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...gray)
  let y = 96
  doc.text(`Adresse : ${project.address}, ${project.postalCode} ${project.city}`, 15, y)
  y += 6
  doc.text(`Statut : ${project.status}`, 15, y)
  doc.text(`Avancement : ${project.progress}%`, 100, y)
  y += 6
  const period = `${project.startDate ? new Date(project.startDate).toLocaleDateString('fr-FR') : '—'} → ${project.endDate ? new Date(project.endDate).toLocaleDateString('fr-FR') : '—'}`
  doc.text(`Période : ${period}`, 15, y)
  y += 6
  doc.text(`Budget prévu : ${euro(project.plannedBudget)}`, 15, y)
  doc.text(`Réalisé : ${project.actualBudget > 0 ? euro(project.actualBudget) : '—'}`, 100, y)

  if (project.description) {
    y += 10
    doc.setTextColor(...dark)
    doc.setFont('helvetica', 'bold')
    doc.text('Description', 15, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...gray)
    y += 6
    doc.text(doc.splitTextToSize(project.description, 180), 15, y)
    y += Math.min(doc.splitTextToSize(project.description, 180).length * 5, 30)
  }

  y += 10
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Étapes du chantier', 15, y)
  y += 8
  doc.setFontSize(9)
  if (project.steps.length === 0) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...gray)
    doc.text('Aucune étape définie.', 15, y)
    y += 6
  } else {
    for (const step of project.steps) {
      if (y > 270) { doc.addPage(); y = 20 }
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...dark)
      const mark = step.status === 'TERMINE' || step.status === 'VALIDE_CLIENT' ? '[X]' : '[ ]'
      const valid = step.validatedByClient ? ' (validé client)' : ''
      doc.text(`${mark} ${step.title} — ${step.status}${valid}`, 15, y)
      y += 6
    }
  }

  if (project.notes) {
    if (y > 250) { doc.addPage(); y = 20 }
    y += 6
    doc.setTextColor(...dark)
    doc.setFont('helvetica', 'bold')
    doc.text('Notes', 15, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...gray)
    y += 6
    doc.text(doc.splitTextToSize(project.notes, 180), 15, y)
  }

  doc.setFontSize(7)
  doc.setTextColor(...gray)
  doc.text('Rapport généré automatiquement par ECOPYE Pro Chantier.', 15, 290)

  doc.save(`Rapport-chantier-${project.title.replace(/[^a-z0-9]/gi, '-').slice(0, 30)}.pdf`)
}
