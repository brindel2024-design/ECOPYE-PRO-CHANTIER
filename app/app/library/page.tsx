'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  HardHat,
  Euro,
  Truck,
  FileText,
  GraduationCap,
  Search,
  ExternalLink,
  Download,
  BookOpen,
  MapPin,
  FileDown,
  Calendar,
  Hammer,
  Plus,
  Trash2,
  Loader2,
  LucideIcon,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

type TabId = 'ouvrages' | 'reglementations' | 'prix' | 'fournisseurs' | 'fiches' | 'formations'

interface CatalogItem {
  id: string
  label: string
  unit: string
  unitPriceHT: number
  vatRate: number
  isLabor: boolean
  category: string | null
}

interface Tab {
  id: TabId
  label: string
  icon: LucideIcon
}

const TABS: Tab[] = [
  { id: 'ouvrages', label: 'Mes ouvrages', icon: Hammer },
  { id: 'reglementations', label: 'Réglementations', icon: HardHat },
  { id: 'prix', label: 'Prix unitaires', icon: Euro },
  { id: 'fournisseurs', label: 'Fournisseurs', icon: Truck },
  { id: 'fiches', label: 'Fiches techniques', icon: FileText },
  { id: 'formations', label: 'Formations', icon: GraduationCap },
]

const REGLEMENTATIONS = [
  { ref: 'DTU 60.1', title: 'Installations de plomberie sanitaire', updated: 'Mise à jour 2020' },
  { ref: 'NF C 15-100', title: 'Installations électriques basse tension', updated: 'Mise à jour 2022' },
  { ref: 'DTU 52.1', title: 'Revêtements de sol scellés', updated: 'Mise à jour 2021' },
  { ref: 'RT 2020', title: 'Réglementation thermique', updated: 'Entrée en vigueur jan 2022' },
  { ref: 'DTU 20.1', title: 'Ouvrages en maçonnerie de petits éléments', updated: 'Révision 2019' },
  { ref: 'Loi AGEC', title: 'Anti-gaspillage & économie circulaire', updated: '2021' },
]

const PRIX_UNITAIRES = [
  { poste: 'Pose carrelage sol', unite: 'm²', min: 25, moy: 35, max: 55 },
  { poste: 'Pose carrelage mural', unite: 'm²', min: 30, moy: 42, max: 65 },
  { poste: 'Installation douche italienne', unite: 'unité', min: 800, moy: 1200, max: 1800 },
  { poste: 'Remplacement chaudière gaz', unite: 'unité', min: 1500, moy: 2200, max: 3200 },
  { poste: 'Tableau électrique NF', unite: 'unité', min: 900, moy: 1400, max: 2000 },
  { poste: 'Peinture intérieure', unite: 'm²', min: 8, moy: 15, max: 25 },
  { poste: 'Pose parquet flottant', unite: 'm²', min: 15, moy: 22, max: 35 },
  { poste: 'Enduit de façade', unite: 'm²', min: 35, moy: 55, max: 80 },
]

const FOURNISSEURS = [
  { name: 'Point P', desc: 'Matériaux généraliste', location: 'Lyon 3ème', badge: 'Compte pro ouvert', badgeColor: 'bg-green-100 text-green-700' },
  { name: 'Würth', desc: 'Outillage & fixations', location: 'Charpieu (69)', badge: 'Livraison J+1', badgeColor: 'bg-blue-100 text-blue-700' },
  { name: 'Rexel', desc: 'Électricité', location: 'Lyon 7ème', badge: 'Remise 15%', badgeColor: 'bg-purple-100 text-purple-700' },
  { name: 'Sider Alpes', desc: 'Carrelage & sanitaires', location: 'Décines (69)', badge: 'Showroom', badgeColor: 'bg-orange-100 text-orange-700' },
  { name: 'Noreva', desc: 'Plomberie-chauffage', location: 'Saint-Priest', badge: 'Techniciens conseil', badgeColor: 'bg-teal-100 text-teal-700' },
]

const FICHES = [
  { title: 'Fiche installation douche italienne', size: 'PDF 2.4 Mo' },
  { title: 'Protocole test étanchéité', size: 'PDF 890 Ko' },
  { title: 'Guide pose carrelage grand format', size: 'PDF 3.1 Mo' },
  { title: 'Fiche raccordement chaudière gaz', size: 'PDF 1.8 Mo' },
  { title: 'Checklist réception chantier', size: 'PDF 520 Ko' },
]

const FORMATIONS = [
  { title: 'Habilitation électrique B1V', org: 'AFPA Lyon', duration: '3 jours', price: '890 € HT' },
  { title: 'CACES Nacelle 3B', org: 'APAVE', duration: '2 jours', price: '650 € HT' },
  { title: 'Qualibat RGE', org: 'En ligne', duration: '1 jour', price: 'Gratuit' },
  { title: 'Gestes & postures BTP', org: 'OPPBTP', duration: '1 jour', price: 'Gratuit' },
]

function formatEur(n: number) {
  return n.toLocaleString('fr-FR') + ' €'
}

const EMPTY_FORM = { label: '', unit: 'forfait', unitPriceHT: 0, vatRate: 20, isLabor: false, category: '' }

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<TabId>('ouvrages')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [adding, setAdding] = useState(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const simToast = () => showToast('Fonctionnalité disponible en version PRO')

  const loadCatalog = useCallback(async () => {
    const r = await fetch('/api/catalog')
    if (r.ok) { const j = await r.json(); setCatalog(j.data ?? []) }
    setCatalogLoading(false)
  }, [])

  useEffect(() => { loadCatalog() }, [loadCatalog])

  async function addItem() {
    if (!form.label.trim()) { showToast('Le libellé est obligatoire'); return }
    setAdding(true)
    const r = await fetch('/api/catalog', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setAdding(false)
    if (r.ok) { setForm({ ...EMPTY_FORM }); await loadCatalog(); showToast('Ouvrage ajouté') }
    else { const j = await r.json().catch(() => ({})); showToast(j.error || 'Échec') }
  }

  async function deleteItem(id: string) {
    await fetch(`/api/catalog/${id}`, { method: 'DELETE' })
    await loadCatalog()
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bibliothèque Technique</h1>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un DTU, prix, fournisseur..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'ouvrages' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Ajouter un ouvrage à votre bibliothèque</h2>
            <p className="text-xs text-gray-500 mb-4">Vos prestations récurrentes avec vos prix — réutilisables en un clic dans vos devis.</p>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="Désignation de l'ouvrage" className="sm:col-span-4 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="Catégorie (ex: Plomberie)" className="sm:col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              <input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} placeholder="Unité" className="sm:col-span-1 rounded-lg border border-gray-300 px-2 py-2 text-sm" />
              <input type="number" min="0" step="0.01" value={form.unitPriceHT} onChange={(e) => setForm((f) => ({ ...f, unitPriceHT: parseFloat(e.target.value) || 0 }))} placeholder="PU HT" className="sm:col-span-2 rounded-lg border border-gray-300 px-2 py-2 text-sm" />
              <select value={form.vatRate} onChange={(e) => setForm((f) => ({ ...f, vatRate: parseFloat(e.target.value) }))} className="sm:col-span-1 rounded-lg border border-gray-300 px-1 py-2 text-sm">
                <option value={5.5}>5,5%</option><option value={10}>10%</option><option value={20}>20%</option>
              </select>
              <button onClick={addItem} disabled={adding} className="sm:col-span-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm font-medium disabled:opacity-50">
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Ajouter
              </button>
            </div>
            <label className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-600">
              <input type="checkbox" checked={form.isLabor} onChange={(e) => setForm((f) => ({ ...f, isLabor: e.target.checked }))} className="h-3.5 w-3.5 rounded border-gray-300" />
              Main d&apos;œuvre (sinon fourniture)
            </label>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            {catalogLoading ? (
              <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
            ) : catalog.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-400">Aucun ouvrage. Ajoutez vos prestations courantes ci-dessus.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[520px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{['Désignation', 'Catégorie', 'Unité', 'PU HT', 'TVA', ''].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {catalog.filter((c) => !search || c.label.toLowerCase().includes(search.toLowerCase()) || (c.category ?? '').toLowerCase().includes(search.toLowerCase())).map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 font-medium text-gray-900">{c.label}{c.isLabor && <span className="ml-2 text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">Main d&apos;œuvre</span>}</td>
                        <td className="px-4 py-2.5 text-gray-500">{c.category ?? '—'}</td>
                        <td className="px-4 py-2.5 text-gray-500">{c.unit}</td>
                        <td className="px-4 py-2.5 text-gray-900">{formatCurrency(c.unitPriceHT)}</td>
                        <td className="px-4 py-2.5 text-gray-500">{c.vatRate} %</td>
                        <td className="px-4 py-2.5 text-right"><button onClick={() => deleteItem(c.id)} className="text-gray-300 hover:text-red-500" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400">Ces ouvrages sont insérables en un clic depuis l&apos;écran de création de devis.</p>
        </div>
      )}

      {activeTab === 'reglementations' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REGLEMENTATIONS.filter(
            (r) =>
              !search ||
              r.ref.toLowerCase().includes(search.toLowerCase()) ||
              r.title.toLowerCase().includes(search.toLowerCase())
          ).map((reg) => (
            <div key={reg.ref} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
              <div>
                <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded mb-2">
                  {reg.ref}
                </span>
                <p className="font-semibold text-gray-900 text-sm leading-snug">{reg.title}</p>
              </div>
              <p className="text-xs text-gray-400">{reg.updated}</p>
              <button
                onClick={simToast}
                className="mt-auto flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Voir la fiche
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'prix' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-6">Poste</th>
                  <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-6">Unité</th>
                  <th className="text-right text-xs text-gray-500 font-medium pb-3 pr-6">Prix min</th>
                  <th className="text-right text-xs text-gray-500 font-medium pb-3 pr-6">Prix moyen</th>
                  <th className="text-right text-xs text-gray-500 font-medium pb-3">Prix max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {PRIX_UNITAIRES.filter(
                  (p) => !search || p.poste.toLowerCase().includes(search.toLowerCase())
                ).map((row) => (
                  <tr key={row.poste} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 pr-6 font-medium text-gray-900">{row.poste}</td>
                    <td className="py-3.5 pr-6 text-gray-500">{row.unite}</td>
                    <td className="py-3.5 pr-6 text-right text-green-700 font-medium">{formatEur(row.min)}</td>
                    <td className="py-3.5 pr-6 text-right text-blue-700 font-semibold">{formatEur(row.moy)}</td>
                    <td className="py-3.5 text-right text-orange-700 font-medium">{formatEur(row.max)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-4 border-t border-gray-100 pt-4">
            Source : Batiprix 2024 — Prix indicatifs HT, hors déplacements
          </p>
        </div>
      )}

      {activeTab === 'fournisseurs' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FOURNISSEURS.filter(
            (f) =>
              !search ||
              f.name.toLowerCase().includes(search.toLowerCase()) ||
              f.desc.toLowerCase().includes(search.toLowerCase())
          ).map((f) => (
            <div key={f.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-900">{f.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{f.desc}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${f.badgeColor}`}>
                  {f.badge}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <MapPin className="h-3.5 w-3.5" />
                {f.location}
              </div>
              <button
                onClick={simToast}
                className="mt-auto text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors text-left"
              >
                Voir le profil →
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'fiches' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FICHES.filter(
            (f) => !search || f.title.toLowerCase().includes(search.toLowerCase())
          ).map((fiche) => (
            <div key={fiche.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-50 rounded-lg flex-shrink-0">
                  <FileDown className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm leading-snug">{fiche.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{fiche.size}</p>
                </div>
              </div>
              <button
                onClick={simToast}
                className="mt-auto flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Télécharger
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'formations' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FORMATIONS.filter(
            (f) =>
              !search ||
              f.title.toLowerCase().includes(search.toLowerCase()) ||
              f.org.toLowerCase().includes(search.toLowerCase())
          ).map((formation) => (
            <div key={formation.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
              <div>
                <p className="font-semibold text-gray-900">{formation.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{formation.org}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formation.duration}
                </span>
                <span className={`font-semibold ${formation.price === 'Gratuit' ? 'text-green-700' : 'text-blue-700'}`}>
                  {formation.price}
                </span>
              </div>
              <button
                onClick={simToast}
                className="mt-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors self-start"
              >
                S&apos;inscrire
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm z-50 shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
