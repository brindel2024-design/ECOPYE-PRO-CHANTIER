'use client'

import { useEffect, useState } from 'react'
import { FileCode2, FileDown, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'

interface Meta {
  readiness: { ready: boolean; missing: string[] }
  buyerIsBusiness: boolean
  number: string
}

export function FacturXCard({ invoiceId }: { invoiceId: string }) {
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch(`/api/invoices/${invoiceId}/facturx`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => active && setMeta(j))
      .catch(() => {})
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [invoiceId])

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Facturation électronique…
      </div>
    )
  }
  if (!meta) return null

  const { readiness } = meta

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-1">
        <FileCode2 className="h-4 w-4 text-blue-600" />
        <h2 className="text-sm font-semibold text-gray-900">Facturation électronique — préparation</h2>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Génération du format structuré <strong>Factur-X (XML EN16931)</strong>. Réforme : réception 09/2026, émission PME 09/2027.
      </p>

      {readiness.ready ? (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-100 px-3 py-2 text-sm text-green-900 mb-3">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          Données complètes pour le format structuré.
        </div>
      ) : (
        <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-sm text-amber-900 mb-3">
          <div className="flex items-center gap-2 font-medium mb-1"><AlertTriangle className="h-4 w-4 text-amber-600" />Données à compléter :</div>
          <ul className="list-disc list-inside text-xs space-y-0.5">
            {readiness.missing.map((m) => <li key={m}>{m}</li>)}
          </ul>
        </div>
      )}

      <a
        href={`/api/invoices/${invoiceId}/facturx?download=1`}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <FileDown className="h-4 w-4" />Télécharger le XML Factur-X
      </a>
      <p className="mt-2 text-[11px] text-gray-400">
        Aperçu technique du XML structuré. La facture Factur-X complète (XML embarqué dans le PDF) et l&apos;envoi via plateforme agréée seront activés à l&apos;intégration — non encore opérationnels.
      </p>
    </div>
  )
}
