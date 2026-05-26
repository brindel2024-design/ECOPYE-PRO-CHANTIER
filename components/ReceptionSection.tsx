'use client'

import { useEffect, useState, useCallback } from 'react'
import { ClipboardCheck, CheckCircle2, Circle, Trash2, Plus, Loader2, AlertTriangle } from 'lucide-react'

interface Reserve { id: string; description: string; resolved: boolean; resolvedAt: string | null }
interface ReceptionData {
  receptionAt: string | null
  receptionSignerName: string | null
  receptionNotes: string | null
  reserves: Reserve[]
}

export function ReceptionSection({ projectId, onChange }: { projectId: string; onChange?: () => void }) {
  const [data, setData] = useState<ReceptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [signer, setSigner] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [newReserve, setNewReserve] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const r = await fetch(`/api/projects/${projectId}/reception`)
    if (r.ok) setData(await r.json())
    setLoading(false)
  }, [projectId])

  useEffect(() => { load() }, [load])

  async function recordReception() {
    setError('')
    if (!signer.trim()) { setError('Indiquez le nom du client qui réceptionne.'); return }
    setBusy(true)
    const r = await fetch(`/api/projects/${projectId}/reception`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receptionSignerName: signer.trim(), receptionAt: date || undefined, receptionNotes: notes.trim() || undefined }),
    })
    setBusy(false)
    if (r.ok) { await load(); onChange?.() } else { const j = await r.json().catch(() => ({})); setError(j.error || 'Échec.') }
  }

  async function addReserve() {
    if (!newReserve.trim()) return
    setBusy(true)
    const r = await fetch(`/api/projects/${projectId}/reserves`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: newReserve.trim() }),
    })
    setBusy(false)
    if (r.ok) { setNewReserve(''); await load(); onChange?.() }
  }

  async function toggleReserve(rv: Reserve) {
    await fetch(`/api/projects/${projectId}/reserves/${rv.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved: !rv.resolved }),
    })
    await load(); onChange?.()
  }

  async function deleteReserve(rv: Reserve) {
    await fetch(`/api/projects/${projectId}/reserves/${rv.id}`, { method: 'DELETE' })
    await load(); onChange?.()
  }

  if (loading) {
    return <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Réception…</div>
  }
  if (!data) return null

  const received = Boolean(data.receptionAt)
  const openReserves = data.reserves.filter((r) => !r.resolved).length

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      <div className="flex items-center gap-2">
        <ClipboardCheck className="h-5 w-5 text-blue-600" />
        <h2 className="text-sm font-semibold text-gray-900">Réception de chantier</h2>
      </div>

      {received ? (
        <div className="rounded-lg bg-green-50 border border-green-100 px-3 py-2 text-sm text-green-900">
          <p className="font-medium">Chantier réceptionné ✓</p>
          <p>Le {new Date(data.receptionAt as string).toLocaleDateString('fr-FR')} par <strong>{data.receptionSignerName}</strong>.</p>
          {data.receptionNotes && <p className="text-xs text-green-800 mt-1">Note : {data.receptionNotes}</p>}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-100 p-3 space-y-2">
          <p className="text-xs text-gray-500">Enregistrez la réception (procès-verbal) une fois les travaux terminés.</p>
          {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input value={signer} onChange={(e) => setSigner(e.target.value)} placeholder="Nom du client (réception)" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Observations (optionnel)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <button onClick={recordReception} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}Enregistrer la réception
          </button>
        </div>
      )}

      {/* Réserves */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-700">Réserves {data.reserves.length > 0 && <span className={openReserves > 0 ? 'text-amber-600' : 'text-green-600'}>({openReserves > 0 ? `${openReserves} non levée(s)` : 'toutes levées'})</span>}</h3>
        </div>
        <ul className="space-y-1.5 mb-2">
          {data.reserves.map((rv) => (
            <li key={rv.id} className="flex items-start gap-2 text-sm">
              <button onClick={() => toggleReserve(rv)} className="mt-0.5 shrink-0" aria-label={rv.resolved ? 'Marquer non levée' : 'Marquer levée'}>
                {rv.resolved ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Circle className="h-4 w-4 text-amber-500" />}
              </button>
              <span className={`flex-1 ${rv.resolved ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{rv.description}</span>
              <button onClick={() => deleteReserve(rv)} className="text-gray-300 hover:text-red-500 shrink-0" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
          {data.reserves.length === 0 && <li className="text-xs text-gray-400">Aucune réserve.</li>}
        </ul>
        <div className="flex items-center gap-2">
          <input value={newReserve} onChange={(e) => setNewReserve(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addReserve()} placeholder="Ajouter une réserve…" className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
          <button onClick={addReserve} disabled={busy || !newReserve.trim()} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"><Plus className="h-3.5 w-3.5" />Ajouter</button>
        </div>
        <p className="mt-2 text-[11px] text-gray-400">Astuce : photographiez chaque réserve (phase « Réception ») pour la joindre au dossier de preuve.</p>
      </div>
    </div>
  )
}
