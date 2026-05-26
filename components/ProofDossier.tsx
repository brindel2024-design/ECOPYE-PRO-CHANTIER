'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, CheckCircle2, Circle, FileDown, Loader2, Camera } from 'lucide-react'
import { generateProofDossierPdf } from '@/lib/proof-pdf'

interface ProofPhoto {
  id: string
  category: string
  url: string
  caption: string | null
  takenAt: string
}
interface ChecklistItem { key: string; label: string; done: boolean; hint?: string }
interface ProofData {
  project: { id: string; title: string; address: string | null; city: string | null; postalCode: string | null; client: string | null }
  photos: ProofPhoto[]
  checklist: { items: ChecklistItem[]; score: number; done: number; total: number }
}

const PHASES = [
  { key: 'AVANT', label: 'Avant' },
  { key: 'PENDANT', label: 'Pendant' },
  { key: 'APRES', label: 'Après' },
]

async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onloadend = () => resolve(r.result as string)
    r.onerror = reject
    r.readAsDataURL(blob)
  })
}

export function ProofDossier({ projectId }: { projectId: string }) {
  const [data, setData] = useState<ProofData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    let active = true
    fetch(`/api/projects/${projectId}/proof`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => active && setData(j))
      .catch(() => {})
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [projectId])

  async function exportPdf() {
    if (!data) return
    setExporting(true)
    try {
      const companyRes = await fetch('/api/company')
      const companyJson = companyRes.ok ? await companyRes.json() : null
      const c = companyJson?.data ?? {}
      const photos = await Promise.all(
        data.photos.map(async (p) => ({
          category: p.category,
          caption: p.caption,
          takenAt: p.takenAt,
          dataUrl: await urlToDataUrl(p.url).catch(() => ''),
        }))
      )
      await generateProofDossierPdf({
        company: {
          name: c.name ?? 'Mon entreprise',
          siret: c.siret ?? null,
          address: c.address ?? '',
          city: c.city ?? '',
          postalCode: c.postalCode ?? '',
        },
        project: {
          title: data.project.title,
          address: data.project.address,
          city: data.project.city,
          client: data.project.client,
        },
        checklist: { items: data.checklist.items, score: data.checklist.score },
        photos: photos.filter((p) => p.dataUrl),
      })
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Dossier de preuve…
      </div>
    )
  }
  if (!data) return null

  const { checklist, photos } = data
  const scoreColor = checklist.score >= 80 ? 'text-green-600' : checklist.score >= 50 ? 'text-amber-600' : 'text-red-600'

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Dossier de preuve anti-litige</h2>
            <p className="text-xs text-gray-500">Photos horodatées, preuves et export PDF pour vous protéger en cas de litige.</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${scoreColor}`}>{checklist.score}%</p>
          <p className="text-[11px] text-gray-400">protection</p>
        </div>
      </div>

      {/* Check-list */}
      <ul className="space-y-1.5">
        {checklist.items.map((it) => (
          <li key={it.key} className="flex items-start gap-2 text-sm">
            {it.done ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <Circle className="h-4 w-4 text-gray-300 shrink-0 mt-0.5" />
            )}
            <span className={it.done ? 'text-gray-700' : 'text-gray-500'}>
              {it.label}
              {!it.done && it.hint && <span className="text-xs text-gray-400"> — {it.hint}</span>}
            </span>
          </li>
        ))}
      </ul>

      {/* Photos par phase */}
      <div className="grid grid-cols-3 gap-3">
        {PHASES.map((phase) => {
          const list = photos.filter((p) => p.category === phase.key)
          return (
            <div key={phase.key} className="rounded-lg border border-gray-100 p-2">
              <p className="text-xs font-semibold text-gray-600 mb-1.5">{phase.label} <span className="text-gray-400">({list.length})</span></p>
              {list.length === 0 ? (
                <div className="h-16 rounded bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-300">
                  <Camera className="h-4 w-4" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {list.slice(0, 4).map((p) => (
                    <img key={p.id} src={p.url} alt={p.caption ?? phase.label} className="h-12 w-full object-cover rounded" />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          onClick={exportPdf}
          disabled={exporting || photos.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          Exporter le dossier PDF
        </button>
        <Link
          href={`/app/photos?projectId=${projectId}`}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Camera className="h-4 w-4 text-gray-500" />Ajouter / gérer les photos
        </Link>
        {photos.length === 0 && <span className="text-xs text-gray-400">Ajoutez des photos pour activer l&apos;export.</span>}
      </div>
    </div>
  )
}
