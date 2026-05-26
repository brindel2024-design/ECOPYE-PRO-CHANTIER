'use client'

import { useEffect, useState, useCallback } from 'react'
import { TrendingUp, Loader2, Save, Pencil } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Profit {
  costs: { materials: number; labor: number; subcontract: number; overhead: number }
  totalCost: number
  revenueInvoiced: number
  quoteTotal: number
  plannedBudget: number
  revenue: number
  margin: number
  marginPct: number
}

const FIELDS: Array<{ key: keyof Profit['costs']; label: string }> = [
  { key: 'materials', label: 'Matériaux' },
  { key: 'labor', label: 'Main d’œuvre' },
  { key: 'subcontract', label: 'Sous-traitance' },
  { key: 'overhead', label: 'Frais divers' },
]

export function ProfitabilitySection({ projectId }: { projectId: string }) {
  const [data, setData] = useState<Profit | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ materials: 0, labor: 0, subcontract: 0, overhead: 0 })

  const load = useCallback(async () => {
    const r = await fetch(`/api/projects/${projectId}/profitability`)
    if (r.ok) {
      const j: Profit = await r.json()
      setData(j)
      setForm(j.costs)
    }
    setLoading(false)
  }, [projectId])

  useEffect(() => { load() }, [load])

  async function save() {
    setSaving(true)
    const r = await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        costMaterials: Number(form.materials) || 0,
        costLabor: Number(form.labor) || 0,
        costSubcontract: Number(form.subcontract) || 0,
        costOverhead: Number(form.overhead) || 0,
      }),
    })
    setSaving(false)
    if (r.ok) { setEditing(false); await load() }
  }

  if (loading) {
    return <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Rentabilité…</div>
  }
  if (!data) return null

  const marginColor = data.margin > 0 ? 'text-green-600' : data.margin < 0 ? 'text-red-600' : 'text-gray-600'

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h2 className="text-sm font-semibold text-gray-900">Rentabilité du chantier</h2>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
            <Pencil className="h-3.5 w-3.5" />Saisir les coûts
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{f.label} (€)</label>
                <input
                  type="number" min="0" step="0.01"
                  value={form[f.key]}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: parseFloat(e.target.value) || 0 }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Enregistrer
            </button>
            <button onClick={() => { setEditing(false); setForm(data.costs) }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700">Annuler</button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {FIELDS.map((f) => (
              <div key={f.key} className="rounded-lg bg-gray-50 p-2.5">
                <p className="text-xs text-gray-500">{f.label}</p>
                <p className="font-semibold text-gray-900">{formatCurrency(data.costs[f.key])}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600"><span>Coût de revient total</span><span className="font-medium">{formatCurrency(data.totalCost)}</span></div>
            <div className="flex justify-between text-gray-600">
              <span>Revenu {data.revenueInvoiced > 0 ? '(facturé)' : data.quoteTotal > 0 ? '(devis)' : '(budget prévu)'}</span>
              <span className="font-medium">{formatCurrency(data.revenue)}</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 pt-2">
              <span className="font-semibold text-gray-900">Bénéfice / Marge</span>
              <span className={`text-lg font-bold ${marginColor}`}>{formatCurrency(data.margin)} <span className="text-xs font-medium">({data.marginPct} %)</span></span>
            </div>
          </div>
          <p className="text-[11px] text-gray-400">Le revenu de référence est le montant facturé (ou le devis, ou le budget prévu si rien n’est encore facturé).</p>
        </>
      )}
    </div>
  )
}
