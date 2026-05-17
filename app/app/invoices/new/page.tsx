'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface ClientOption {
  id: string
  firstName: string
  lastName: string
  city: string
}

interface QuoteOption {
  id: string
  number: string
  title: string
  clientId: string
}

interface InvoiceLine {
  id: string
  label: string
  quantity: number
  unitPriceHT: number
  vatRate: number
}

type InvoiceType = 'ACOMPTE' | 'INTERMEDIAIRE' | 'FINALE'

const TYPE_OPTIONS: Array<{ value: InvoiceType; label: string }> = [
  { value: 'ACOMPTE', label: 'Acompte' },
  { value: 'INTERMEDIAIRE', label: 'Intermédiaire' },
  { value: 'FINALE', label: 'Facture finale' },
]

export default function NewInvoicePage() {
  const router = useRouter()
  const [clients, setClients] = useState<ClientOption[]>([])
  const [quotes, setQuotes] = useState<QuoteOption[]>([])
  const [loading, setLoading] = useState(true)
  const [clientId, setClientId] = useState('')
  const [quoteId, setQuoteId] = useState('')
  const [type, setType] = useState<InvoiceType>('FINALE')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<InvoiceLine[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function loadData() {
      try {
        const [clientsRes, quotesRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/quotes'),
        ])
        const clientsJson = await clientsRes.json()
        const quotesJson = await quotesRes.json()
        if (!clientsRes.ok) throw new Error(clientsJson.error || 'Erreur de chargement des clients')
        if (active) {
          setClients(clientsJson.data ?? [])
          setQuotes(quotesRes.ok ? quotesJson.data ?? [] : [])
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Erreur de chargement')
      } finally {
        if (active) setLoading(false)
      }
    }
    loadData()
    return () => {
      active = false
    }
  }, [])

  const availableQuotes = clientId ? quotes.filter((q) => q.clientId === clientId) : quotes

  function addLine() {
    setLines((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2), label: '', quantity: 1, unitPriceHT: 0, vatRate: 20 },
    ])
  }

  function updateLine(id: string, field: keyof Omit<InvoiceLine, 'id'>, value: string | number) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)))
  }

  function removeLine(id: string) {
    setLines((prev) => prev.filter((l) => l.id !== id))
  }

  const subtotalHT = lines.reduce((s, l) => s + l.quantity * l.unitPriceHT, 0)
  const vatAmount = lines.reduce((s, l) => s + l.quantity * l.unitPriceHT * (l.vatRate / 100), 0)
  const totalTTC = subtotalHT + vatAmount

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!clientId && !quoteId) {
      setError('Veuillez sélectionner un client ou un devis')
      return
    }
    if (!quoteId && lines.length === 0) {
      setError('Ajoutez au moins une ligne de facture')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientId || undefined,
          quoteId: quoteId || undefined,
          type,
          dueDate: dueDate || undefined,
          notes: notes.trim() || undefined,
          lines: lines.map((l) => ({
            label: l.label,
            quantity: l.quantity,
            unitPriceHT: l.unitPriceHT,
            vatRate: l.vatRate,
          })),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erreur lors de la création de la facture')
      setToast('Facture créée')
      setTimeout(() => router.push('/app/invoices'), 700)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la facture')
      setSaving(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50'

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {toast}
        </div>
      )}

      <Link href="/app/invoices" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4" />Retour aux factures
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle facture</h1>
        <p className="text-sm text-gray-500 mt-0.5">Créez une facture pour un client</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-900">Informations</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Client *</label>
              <select
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value)
                  setQuoteId('')
                }}
                disabled={loading}
                className={inputClass}
              >
                <option value="">{loading ? 'Chargement...' : 'Sélectionner un client'}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} — {c.city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Type de facture</label>
              <select value={type} onChange={(e) => setType(e.target.value as InvoiceType)} className={inputClass}>
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Devis associé (optionnel)</label>
              <select value={quoteId} onChange={(e) => setQuoteId(e.target.value)} disabled={loading} className={inputClass}>
                <option value="">Aucun devis</option>
                {availableQuotes.map((q) => (
                  <option key={q.id} value={q.id}>{q.number} — {q.title}</option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-gray-400">Si un devis est lié et qu&apos;aucune ligne n&apos;est saisie, ses lignes seront reprises.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Date d&apos;échéance</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Notes (optionnel)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass} placeholder="Mentions complémentaires..." />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Lignes de facture</h2>
            <button type="button" onClick={addLine} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
              <Plus className="h-3.5 w-3.5" />Ajouter une ligne
            </button>
          </div>
          {lines.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center">
              <p className="text-sm text-gray-400">Aucune ligne. Ajoutez des lignes ou liez un devis.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
                <div className="col-span-4">Description</div>
                <div className="col-span-2">Qté</div>
                <div className="col-span-2">Prix HT</div>
                <div className="col-span-1">TVA %</div>
                <div className="col-span-2">Total HT</div>
                <div className="col-span-1" />
              </div>
              {lines.map((line) => (
                <div key={line.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={line.label}
                      onChange={(e) => updateLine(line.id, 'label', e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      placeholder="Description"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={line.quantity}
                      onChange={(e) => updateLine(line.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      min="0"
                      step="0.5"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={line.unitPriceHT}
                      onChange={(e) => updateLine(line.id, 'unitPriceHT', parseFloat(e.target.value) || 0)}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      min="0"
                    />
                  </div>
                  <div className="col-span-1">
                    <select
                      value={line.vatRate}
                      onChange={(e) => updateLine(line.id, 'vatRate', parseFloat(e.target.value))}
                      className="w-full rounded border border-gray-300 px-1 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value={5.5}>5,5%</option>
                      <option value={10}>10%</option>
                      <option value={20}>20%</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(line.quantity * line.unitPriceHT)}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button type="button" onClick={() => removeLine(line.id)} className="text-gray-300 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 border-t border-gray-100 pt-4 space-y-2 max-w-xs ml-auto">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Sous-total HT</span>
              <span className="font-medium">{formatCurrency(subtotalHT)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">TVA</span>
              <span className="font-medium">{formatCurrency(vatAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-gray-100 pt-2">
              <span>Total TTC</span>
              <span className="text-blue-600">{formatCurrency(totalTTC)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link href="/app/invoices" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Enregistrement...</> : 'Créer la facture'}
          </button>
        </div>
      </form>
    </div>
  )
}
