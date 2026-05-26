'use client'

import { useEffect, useState } from 'react'
import { ShieldCheck, ShieldAlert, ShieldX, Info, Loader2, ChevronDown } from 'lucide-react'

interface RiskFlag {
  level: 'bloquant' | 'attention' | 'info'
  title: string
  detail?: string
}
interface CheckResponse {
  flags: RiskFlag[]
  summary: { counts: { bloquant: number; attention: number; info: number }; worst: 'bloquant' | 'attention' | 'info' | 'ok' }
}

const LEVEL_CFG = {
  bloquant: { icon: ShieldX, badge: 'bg-red-100 text-red-700', dot: 'text-red-600', label: 'Bloquant' },
  attention: { icon: ShieldAlert, badge: 'bg-amber-100 text-amber-800', dot: 'text-amber-600', label: 'À vérifier' },
  info: { icon: Info, badge: 'bg-blue-100 text-blue-700', dot: 'text-blue-600', label: 'Conseil' },
} as const

export function PreSendCheck({ kind, id }: { kind: 'quote' | 'invoice'; id: string }) {
  const [data, setData] = useState<CheckResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    let active = true
    fetch(`/api/${kind === 'quote' ? 'quotes' : 'invoices'}/${id}/check`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => active && setData(j))
      .catch(() => {})
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [kind, id])

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Vérification avant envoi…
      </div>
    )
  }
  if (!data) return null

  const { flags, summary } = data
  const ok = summary.worst === 'ok'

  const headerColor = ok
    ? 'border-green-200 bg-green-50'
    : summary.worst === 'bloquant'
    ? 'border-red-200 bg-red-50'
    : summary.worst === 'attention'
    ? 'border-amber-200 bg-amber-50'
    : 'border-blue-200 bg-blue-50'

  const HeaderIcon = ok ? ShieldCheck : LEVEL_CFG[summary.worst as 'bloquant' | 'attention' | 'info'].icon

  return (
    <div className={`rounded-xl border ${headerColor}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <HeaderIcon className={`h-5 w-5 shrink-0 ${ok ? 'text-green-600' : LEVEL_CFG[summary.worst as 'bloquant' | 'attention' | 'info'].dot}`} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              {ok ? 'Prêt à envoyer — aucun risque détecté' : 'Vérification avant envoi (Copilote sécurisation)'}
            </p>
            {!ok && (
              <p className="text-xs text-gray-600 mt-0.5">
                {summary.counts.bloquant > 0 && <span className="font-medium text-red-700">{summary.counts.bloquant} bloquant(s) · </span>}
                {summary.counts.attention > 0 && <span className="text-amber-700">{summary.counts.attention} à vérifier · </span>}
                {summary.counts.info > 0 && <span className="text-blue-700">{summary.counts.info} conseil(s)</span>}
              </p>
            )}
          </div>
        </div>
        {!ok && <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>

      {!ok && open && (
        <ul className="px-4 pb-4 space-y-2">
          {flags.map((f, i) => {
            const cfg = LEVEL_CFG[f.level]
            const Icon = cfg.icon
            return (
              <li key={i} className="flex items-start gap-2 rounded-lg bg-white border border-gray-100 px-3 py-2">
                <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${cfg.dot}`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{f.title}</span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${cfg.badge}`}>{cfg.label}</span>
                  </div>
                  {f.detail && <p className="text-xs text-gray-500 mt-0.5">{f.detail}</p>}
                </div>
              </li>
            )
          })}
          <li className="text-[11px] text-gray-400 pt-1">
            Vérifications automatiques ECOPYE — à confirmer par vos soins. Ne constituent pas un conseil juridique.
          </li>
        </ul>
      )}
    </div>
  )
}
