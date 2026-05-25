'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface LineForm {
  label: string
  quantity: number
  unit: string
  unitPriceHT: number
  vatRate: number
}

const TYPES = [
  { value: 'FINALE', label: 'Facture finale' },
  { value: 'ACOMPTE', label: 'Acompte' },
  { value: 'INTERMEDIAIRE', label: 'Intermédiaire' },
  { value: 'AVOIR', label: 'Avoir' },
]

export default function EditInvoicePage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editable, setEditable] = useState(true)
  const [type, setType] = useState('FINALE')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<LineForm[]>([])

  const load = useCallback(async () => {
    const res = await fetch(`/api/invoices/${id}`)
    if (res.ok) {
      const { data } = await res.json()
      if (data.status !== 'BROUILLON') setEditable(false)
      setType(data.type ?? 'FINALE')
      setDueDate(data.dueDate ? String(data.dueDate).slice(0, 10) : '')
      setNotes(data.notes ?? '')
      setLines((data.lines ?? []).map((l: LineForm) => ({
        label: l.label, quantity: l.quantity, unit: l.unit, unitPriceHT: l.unitPriceHT, vatRate: l.vatRate,
      })))
    }
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  function updateLine(i: number, field: keyof LineForm, value: string | number) {
    setLines((ls) => ls.map((l, idx) => idx === i ? { ...l, [field]: value } : l))
  }
  function addLine() {
    setLines((ls) => [...ls, { label: '', quantity: 1, unit: 'forfait', unitPriceHT: 0, vatRate: 20 }])
  }
  function removeLine(i: number) {
    setLines((ls) => ls.filter((_, idx) => idx !== i))
  }

  const subtotalHT = lines.reduce((s, l) => s + l.quantity * l.unitPriceHT, 0)
  const vatAmount = lines.reduce((s, l) => s + l.quantity * l.unitPriceHT * (l.vatRate / 100), 0)
  const totalTTC = subtotalHT + vatAmount

  async function handleSave() {
    setError('')
    if (lines.length === 0 || lines.some((l) => !l.label.trim())) {
      setError('Chaque ligne doit avoir une désignation.')
      return
    }
    setSaving(true)
    const res = await fetch(`/api/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, dueDate: dueDate || null, notes: notes || null, lines }),
    })
    setSaving(false)
    if (res.ok) router.push(`/app/invoices/${id}`)
    else { const j = await res.json().catch(() => ({})); setError(j.error || 'Échec de l\'enregistrement.') }
  }

  if (loading) return <div className="p-6 flex justify-center h-64 items-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>

  if (!editable) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Link href={`/app/invoices/${id}`} className="text-blue-600 text-sm flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" />Retour</Link>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
          Seules les factures en <strong>brouillon</strong> peuvent être modifiées. Cette facture a déjà été émise.
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
      <Link href={`/app/invoices/${id}`} className="text-blue-600 text-sm flex items-center gap-1"><ArrowLeft className="w-4 h-4" />Retour à la facture</Link>
      <h1 className="text-2xl font-bold text-gray-900">Modifier le brouillon</h1>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" /><p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date d&apos;échéance</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Lignes</h2>
          <button onClick={addLine} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"><Plus className="h-3.5 w-3.5" />Ajouter</button>
        </div>
        <div className="space-y-3">
          {lines.map((line, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input value={line.label} onChange={(e) => updateLine(i, 'label', e.target.value)} placeholder="Désignation"
                className="col-span-12 sm:col-span-5 border border-gray-200 rounded px-2 py-1.5 text-sm" />
              <input type="number" value={line.quantity} onChange={(e) => updateLine(i, 'quantity', parseFloat(e.target.value) || 0)} placeholder="Qté"
                className="col-span-3 sm:col-span-2 border border-gray-200 rounded px-2 py-1.5 text-sm" />
              <input type="number" value={line.unitPriceHT} onChange={(e) => updateLine(i, 'unitPriceHT', parseFloat(e.target.value) || 0)} placeholder="PU HT"
                className="col-span-4 sm:col-span-2 border border-gray-200 rounded px-2 py-1.5 text-sm" />
              <input type="number" value={line.vatRate} onChange={(e) => updateLine(i, 'vatRate', parseFloat(e.target.value) || 0)} placeholder="TVA%"
                className="col-span-3 sm:col-span-2 border border-gray-200 rounded px-2 py-1.5 text-sm" />
              <button onClick={() => removeLine(i)} aria-label="Supprimer la ligne" className="col-span-2 sm:col-span-1 text-red-500 hover:text-red-700 flex justify-center">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {lines.length === 0 && <p className="text-sm text-gray-400">Aucune ligne — cliquez sur Ajouter.</p>}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-right space-y-1">
          <p className="text-gray-600">Sous-total HT : <span className="font-medium text-gray-900">{formatCurrency(subtotalHT)}</span></p>
          <p className="text-gray-600">TVA : <span className="font-medium text-gray-900">{formatCurrency(vatAmount)}</span></p>
          <p className="font-bold text-gray-900">Total TTC : {formatCurrency(totalTTC)}</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div className="flex gap-3">
        <Link href={`/app/invoices/${id}`} className="px-4 py-2 rounded-lg border border-gray-300 text-sm">Annuler</Link>
        <button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}Enregistrer
        </button>
      </div>
    </div>
  )
}
