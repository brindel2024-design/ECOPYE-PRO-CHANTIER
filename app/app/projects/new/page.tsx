'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { isValidISODate } from '@/lib/utils'

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

interface StepDraft {
  id: string
  title: string
  dueDate: string
}

export default function NewProjectPage() {
  const router = useRouter()
  const [clients, setClients] = useState<ClientOption[]>([])
  const [quotes, setQuotes] = useState<QuoteOption[]>([])
  const [loading, setLoading] = useState(true)
  const [clientId, setClientId] = useState('')
  const [quoteId, setQuoteId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [plannedBudget, setPlannedBudget] = useState('')
  const [steps, setSteps] = useState<StepDraft[]>([])
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

  function addStep() {
    setSteps((prev) => [...prev, { id: Math.random().toString(36).slice(2), title: '', dueDate: '' }])
  }

  function updateStep(id: string, field: 'title' | 'dueDate', value: string) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  function removeStep(id: string) {
    setSteps((prev) => prev.filter((s) => s.id !== id))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!clientId) {
      setError('Veuillez sélectionner un client')
      return
    }
    if (!title.trim()) {
      setError('Le titre du chantier est obligatoire')
      return
    }
    if (startDate && !isValidISODate(startDate)) {
      setError('La date de début est incomplète ou invalide. Saisissez une date valide ou laissez le champ vide.')
      return
    }
    if (endDate && !isValidISODate(endDate)) {
      setError('La date de fin est incomplète ou invalide. Saisissez une date valide ou laissez le champ vide.')
      return
    }
    if (startDate && endDate && endDate < startDate) {
      setError('La date de fin prévue doit être postérieure ou égale à la date de début.')
      return
    }
    for (const s of steps) {
      if (s.title.trim() && s.dueDate && !isValidISODate(s.dueDate)) {
        setError(`L'échéance de l'étape « ${s.title.trim()} » est invalide.`)
        return
      }
    }
    setSaving(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          quoteId: quoteId || undefined,
          title: title.trim(),
          description: description.trim() || undefined,
          address: address.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          plannedBudget: plannedBudget ? Number(plannedBudget) : 0,
          steps: steps
            .filter((s) => s.title.trim())
            .map((s) => ({ title: s.title.trim(), dueDate: s.dueDate || undefined })),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erreur lors de la création du chantier')
      setToast('Chantier créé')
      setTimeout(() => router.push('/app/projects'), 700)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du chantier')
      setSaving(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50'

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {toast}
        </div>
      )}

      <Link href="/app/projects" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4" />Retour aux chantiers
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nouveau chantier</h1>
        <p className="text-sm text-gray-500 mt-0.5">Créez un chantier et planifiez ses étapes</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-900">Informations générales</h2>

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
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Devis associé (optionnel)</label>
              <select value={quoteId} onChange={(e) => setQuoteId(e.target.value)} disabled={loading} className={inputClass}>
                <option value="">Aucun devis</option>
                {availableQuotes.map((q) => (
                  <option key={q.id} value={q.id}>{q.number} — {q.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Titre du chantier *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Ex: Rénovation cuisine M. Dupont" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Description (optionnel)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputClass} placeholder="Description des travaux..." />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Adresse du chantier</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Ville</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Code postal</label>
              <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Date de début</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Date de fin prévue</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Budget prévu (€)</label>
              <input type="number" min="0" value={plannedBudget} onChange={(e) => setPlannedBudget(e.target.value)} className={inputClass} placeholder="0" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Étapes du chantier (optionnel)</h2>
            <button type="button" onClick={addStep} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
              <Plus className="h-3.5 w-3.5" />Ajouter une étape
            </button>
          </div>
          {steps.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center">
              <p className="text-sm text-gray-400">Aucune étape. Ajoutez les phases du chantier.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {steps.map((step) => (
                <div key={step.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-7">
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => updateStep(step.id, 'title', e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      placeholder="Titre de l'étape"
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="date"
                      value={step.dueDate}
                      onChange={(e) => updateStep(step.id, 'dueDate', e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button type="button" onClick={() => removeStep(step.id)} className="text-gray-300 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link href="/app/projects" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Enregistrement...</> : 'Créer le chantier'}
          </button>
        </div>
      </form>
    </div>
  )
}
