'use client'

interface ProofPhoto {
  dataUrl: string
  category: string
  caption?: string | null
  takenAt: string
}
interface ProofChecklistItem {
  label: string
  done: boolean
}

function fmtFromDataUrl(dataUrl: string): 'PNG' | 'JPEG' {
  const m = /^data:image\/([a-z]+)/i.exec(dataUrl)
  const t = (m?.[1] ?? 'jpeg').toUpperCase()
  return t === 'PNG' ? 'PNG' : 'JPEG'
}

export async function generateProofDossierPdf(input: {
  company: { name: string; siret: string | null; address: string; city: string; postalCode?: string }
  project: { title: string; address?: string | null; city?: string | null; client?: string | null }
  checklist: { items: ProofChecklistItem[]; score: number }
  photos: ProofPhoto[]
}) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  let y = 18

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Dossier de preuve — chantier', 14, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(input.company.name, 14, y); y += 5
  if (input.company.siret) { doc.text('SIRET : ' + input.company.siret, 14, y); y += 5 }
  doc.text(`${input.company.address} ${input.company.postalCode ?? ''} ${input.company.city}`.trim(), 14, y); y += 8

  doc.setFont('helvetica', 'bold')
  doc.text('Chantier : ' + input.project.title, 14, y); y += 6
  doc.setFont('helvetica', 'normal')
  if (input.project.client) { doc.text('Client : ' + input.project.client, 14, y); y += 5 }
  if (input.project.address || input.project.city) {
    doc.text(`Adresse : ${input.project.address ?? ''} ${input.project.city ?? ''}`.trim(), 14, y); y += 5
  }
  doc.text('Édité le : ' + new Date().toLocaleString('fr-FR'), 14, y); y += 8

  doc.setFont('helvetica', 'bold')
  doc.text(`Protection du chantier : ${input.checklist.score}%`, 14, y); y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  for (const it of input.checklist.items) {
    doc.text(`${it.done ? '[x]' : '[  ]'} ${it.label}`, 16, y); y += 5
  }
  y += 4

  const phases: Array<{ key: string; label: string }> = [
    { key: 'AVANT', label: 'Avant travaux' },
    { key: 'PENDANT', label: 'Pendant travaux' },
    { key: 'APRES', label: 'Après travaux' },
  ]
  for (const phase of phases) {
    const list = input.photos.filter((p) => p.category === phase.key)
    if (list.length === 0) continue
    if (y > 250) { doc.addPage(); y = 18 }
    doc.setFontSize(11); doc.setFont('helvetica', 'bold')
    doc.text(phase.label, 14, y); y += 6
    for (const p of list) {
      if (y > 225) { doc.addPage(); y = 18 }
      try {
        doc.addImage(p.dataUrl, fmtFromDataUrl(p.dataUrl), 14, y, 80, 60, undefined, 'FAST')
      } catch {
        doc.setFontSize(8); doc.text('[photo non disponible]', 14, y + 6)
      }
      doc.setFontSize(8); doc.setFont('helvetica', 'normal')
      doc.text(new Date(p.takenAt).toLocaleString('fr-FR'), 100, y + 6)
      if (p.caption) doc.text(doc.splitTextToSize(p.caption, 95), 100, y + 12)
      y += 66
    }
    y += 4
  }

  doc.setFontSize(7)
  doc.setTextColor(150)
  doc.text(
    "Document de preuve généré par ECOPYE Pro Chantier. Les horodatages correspondent à la date de prise/import des photos.",
    14,
    287
  )

  const safe = input.project.title.replace(/[^a-z0-9]+/gi, '-').slice(0, 30) || 'chantier'
  doc.save(`dossier-preuve-${safe}.pdf`)
}
