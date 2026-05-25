'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { formatCurrency, isValidISODate, isoDateOffset } from '@/lib/utils'

interface QuoteLine {
  id: string
  label: string
  quantity: number
  unit: string
  unitPriceHT: number
  vatRate: number
  totalHT: number
  isLabor: boolean
}

interface ClientOption {
  id: string
  firstName: string
  lastName: string
  city: string
}

const AI_TEMPLATES: Record<string, { title: string; lines: Omit<QuoteLine, 'id'>[] }> = {
  'renovation-sdb': {
    title: 'Rénovation salle de bain 6m²',
    lines: [
      { label: 'Dépose ancienne installation', quantity: 1, unit: 'forfait', unitPriceHT: 450, vatRate: 20, totalHT: 450, isLabor: true },
      { label: 'Préparation du support', quantity: 6, unit: 'm²', unitPriceHT: 35, vatRate: 20, totalHT: 210, isLabor: true },
      { label: 'Plomberie (remplacement circuits)', quantity: 1, unit: 'forfait', unitPriceHT: 780, vatRate: 20, totalHT: 780, isLabor: true },
      { label: 'Électricité mise aux normes', quantity: 1, unit: 'forfait', unitPriceHT: 320, vatRate: 20, totalHT: 320, isLabor: true },
      { label: 'Étanchéité receveur douche', quantity: 1, unit: 'forfait', unitPriceHT: 280, vatRate: 20, totalHT: 280, isLabor: false },
      { label: 'Pose carrelage sol et murs', quantity: 18, unit: 'm²', unitPriceHT: 85, vatRate: 20, totalHT: 1530, isLabor: true },
      { label: 'Installation meuble vasque + miroir', quantity: 1, unit: 'forfait', unitPriceHT: 650, vatRate: 20, totalHT: 650, isLabor: false },
      { label: 'Fourniture sanitaires (WC suspendu)', quantity: 1, unit: 'unité', unitPriceHT: 420, vatRate: 20, totalHT: 420, isLabor: false },
      { label: 'Finitions, silicone, nettoyage', quantity: 1, unit: 'forfait', unitPriceHT: 180, vatRate: 20, totalHT: 180, isLabor: true },
    ],
  },
  'plomberie': {
    title: 'Remplacement chaudière gaz',
    lines: [
      { label: 'Dépose ancienne chaudière', quantity: 1, unit: 'forfait', unitPriceHT: 250, vatRate: 5.5, totalHT: 250, isLabor: true },
      { label: 'Chaudière gaz condensation A++', quantity: 1, unit: 'unité', unitPriceHT: 1800, vatRate: 5.5, totalHT: 1800, isLabor: false },
      { label: 'Pose et raccordement gaz', quantity: 1, unit: 'forfait', unitPriceHT: 480, vatRate: 5.5, totalHT: 480, isLabor: true },
      { label: 'Mise en service et réglages', quantity: 1, unit: 'forfait', unitPriceHT: 150, vatRate: 5.5, totalHT: 150, isLabor: true },
      { label: 'Evacuation ancienne chaudière', quantity: 1, unit: 'forfait', unitPriceHT: 80, vatRate: 20, totalHT: 80, isLabor: false },
    ],
  },
  'peinture': {
    title: 'Peinture appartement 4 pièces',
    lines: [
      { label: 'Protection sols et meubles', quantity: 1, unit: 'forfait', unitPriceHT: 120, vatRate: 10, totalHT: 120, isLabor: true },
      { label: 'Préparation murs (rebouchage, ponçage)', quantity: 80, unit: 'm²', unitPriceHT: 8, vatRate: 10, totalHT: 640, isLabor: true },
      { label: 'Peinture murs 2 couches', quantity: 80, unit: 'm²', unitPriceHT: 12, vatRate: 10, totalHT: 960, isLabor: true },
      { label: 'Peinture plafonds 2 couches', quantity: 65, unit: 'm²', unitPriceHT: 14, vatRate: 10, totalHT: 910, isLabor: true },
      { label: 'Fourniture peinture haut de gamme', quantity: 1, unit: 'forfait', unitPriceHT: 380, vatRate: 20, totalHT: 380, isLabor: false },
    ],
  },
}

export default function NewQuotePage() {
  const router = useRouter()
  const [clients, setClients] = useState<ClientOption[]>([])
  const [clientsLoading, setClientsLoading] = useState(true)
  const [clientId, setClientId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [expiresAt, setExpiresAt] = useState(isoDateOffset(30))
  const [depositPercentage, setDepositPercentage] = useState(30)
  const [lines, setLines] = useState<QuoteLine[]>([])
  const [templateLoading, setTemplateLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function loadClients() {
      try {
        const res = await fetch('/api/clients')
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Erreur de chargement des clients')
        if (active) setClients(json.data ?? [])
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Erreur de chargement des clients')
      } finally {
        if (active) setClientsLoading(false)
      }
    }
    loadClients()
    return () => {
      active = false
    }
  }, [])

  function addLine() {
    setLines((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        label: '',
        quantity: 1,
        unit: 'forfait',
        unitPriceHT: 0,
        vatRate: 20,
        totalHT: 0,
        isLabor: false,
      },
    ])
  }

  function updateLine(id: string, field: string, value: string | number) {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l
        const updated = { ...l, [field]: value }
        updated.totalHT = updated.quantity * updated.unitPriceHT
        return updated
      })
    )
  }

  function removeLine(id: string) {
    setLines((prev) => prev.filter((l) => l.id !== id))
  }

  function applyTemplate(templateKey: string) {
    setTemplateLoading(true)
    const template = AI_TEMPLATES[templateKey]
    if (template) {
      setTitle(template.title)
      setLines(template.lines.map((l) => ({ ...l, id: Math.random().toString(36).slice(2) })))
    }
    setTemplateLoading(false)
  }

  const subtotalHT = lines.reduce((s, l) => s + l.totalHT, 0)
  const vatAmount = lines.reduce((s, l) => s + l.totalHT * (l.vatRate / 100), 0)
  const totalTTC = subtotalHT + vatAmount
  const depositAmount = totalTTC * (depositPercentage / 100)

  async function handleSave(status: 'BROUILLON' | 'ENREGISTRE' = 'ENREGISTRE') {
    setError(null)
    if (!clientId) {
      setError('Veuillez sélectionner un client')
      return
    }
    if (!title.trim()) {
      setError("L'intitulé du devis est obligatoire")
      return
    }
    if (expiresAt && !isValidISODate(expiresAt)) {
      setError("La date de validité est incomplète ou invalide. Saisissez une date valide ou laissez le champ vide.")
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          title: title.trim(),
          description: description.trim() || undefined,
          depositPercentage,
          notes: notes.trim() || undefined,
          expiresAt: expiresAt || undefined,
          lines: lines.map((l) => ({
            label: l.label,
            quantity: l.quantity,
            unit: l.unit,
            unitPriceHT: l.unitPriceHT,
            vatRate: l.vatRate,
            isLabor: l.isLabor,
          })),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erreur lors de la création du devis')
      setToast(status === 'BROUILLON' ? 'Brouillon enregistré' : 'Devis enregistré')
      setTimeout(() => router.push('/app/quotes'), 700)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la création du devis')
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {toast}
        </div>
      )}

      <Link href="/app/quotes" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4" />Retour aux devis
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nouveau devis</h1>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Modèles pré-remplis */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-5 w-5 text-blue-600" />
          <h2 className="text-sm font-semibold text-blue-900">Modèles de devis — point de départ</h2>
        </div>
        <p className="text-xs text-blue-700 mb-3">Pré-remplissez vos lignes à partir d&apos;un modèle type, puis ajustez les quantités, prix et taux de TVA selon votre chantier :</p>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'renovation-sdb', label: '🚿 Rénovation salle de bain' },
            { key: 'plomberie', label: '🔧 Remplacement chaudière' },
            { key: 'peinture', label: '🎨 Peinture appartement' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => applyTemplate(t.key)}
              disabled={templateLoading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
            >
              {templateLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Info devis */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Informations générales</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Client *</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  disabled={clientsLoading}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50"
                >
                  <option value="">{clientsLoading ? 'Chargement des clients...' : 'Sélectionner un client'}</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName} — {c.city}</option>
                  ))}
                </select>
                {!clientsLoading && clients.length === 0 && (
                  <p className="mt-1.5 text-xs text-gray-400">
                    Aucun client.{' '}
                    <Link href="/app/clients/new" className="text-blue-600 hover:underline">Créer un client</Link>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Intitulé du devis *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Ex: Rénovation salle de bain 6m²"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Devis valable jusqu&apos;au</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="mt-1.5 text-xs text-gray-400">Par défaut : 30 jours. Cette date figure sur le PDF du devis.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Description (optionnel)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Description des travaux..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Notes internes (optionnel)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Notes visibles uniquement par vous..."
                />
              </div>
            </div>
          </div>

          {/* Lignes */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Lignes du devis</h2>
              <button onClick={addLine} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                <Plus className="h-3.5 w-3.5" />Ajouter une ligne
              </button>
            </div>
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600" />
              <p>
                <strong>Vérifiez le taux de TVA applicable avant envoi.</strong> Le taux par défaut est 20 %, mais il dépend de la nature des travaux et de l&apos;éligibilité du logement (5,5 % rénovation énergétique, 10 % travaux d&apos;amélioration sur logement de plus de 2 ans, etc.).
              </p>
            </div>
            {lines.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
                <p className="text-sm text-gray-400">Utilisez le copilote IA ou ajoutez des lignes manuellement</p>
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
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(line.totalHT)}</span>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button onClick={() => removeLine(line.id)} className="text-gray-300 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Récapitulatif */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Récapitulatif</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sous-total HT</span>
                <span className="font-medium">{formatCurrency(subtotalHT)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">TVA</span>
                <span className="font-medium">{formatCurrency(vatAmount)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between text-base font-bold">
                <span>Total TTC</span>
                <span className="text-blue-600">{formatCurrency(totalTTC)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Acompte</h2>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={depositPercentage}
                onChange={(e) => setDepositPercentage(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-bold text-blue-600 w-10">{depositPercentage}%</span>
            </div>
            <p className="text-sm text-gray-900 font-semibold">{formatCurrency(depositAmount)}</p>
            <p className="text-xs text-gray-400">à percevoir à la signature</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleSave('ENREGISTRE')}
              disabled={saving || !clientId || !title}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Enregistrement...</> : 'Enregistrer le devis'}
            </button>
            <button
              onClick={() => handleSave('BROUILLON')}
              disabled={saving || !clientId || !title}
              className="w-full rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Enregistrer en brouillon
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
