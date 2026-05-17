'use client'

// Client-side PDF generation using jsPDF
export async function generateQuotePdf(quote: {
  number: string
  title: string
  createdAt: string
  expiresAt?: string | null
  client: { firstName: string; lastName: string; email: string; phone: string; address: string; city: string }
  company: { name: string; siret: string; address: string; city: string; phone: string; email: string }
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
  doc.text(`SIRET : ${quote.company.siret}`, 15, 56)
  doc.text(quote.company.address, 15, 61)
  doc.text(quote.company.city, 15, 66)
  doc.text(quote.company.phone, 15, 71)

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

  // Footer
  doc.setFontSize(7)
  doc.setTextColor(...gray)
  doc.text('Ce devis est valable 30 jours. En cas d\'acceptation, veuillez retourner ce document signé avec la mention "Bon pour accord".', 15, 285)

  doc.save(`Devis-${quote.number}.pdf`)
}

export async function generateInvoicePdf(invoice: {
  number: string
  type: string
  issuedAt: string
  dueDate?: string | null
  client: { firstName: string; lastName: string; email: string; phone: string; address: string; city: string }
  company: { name: string; siret: string; address: string; city: string; phone: string; email: string; vatNumber?: string | null; insuranceNumber?: string | null }
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
  doc.text(`SIRET : ${invoice.company.siret}`, 15, 56)
  if (invoice.company.vatNumber) doc.text(`TVA : ${invoice.company.vatNumber}`, 15, 61)
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

  doc.setFillColor(243, 244, 246)
  doc.rect(15, y, 180, 20, 'F')
  doc.setTextColor(...gray)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Règlement par virement bancaire uniquement. Tout retard de paiement entraîne des pénalités de 3× le taux légal.', 17, y + 8)

  doc.save(`Facture-${invoice.number}.pdf`)
}
