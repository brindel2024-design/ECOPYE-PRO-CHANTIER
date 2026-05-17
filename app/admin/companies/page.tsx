'use client'
import { useState } from 'react'
import { Search, Download, Eye, Pause, ChevronLeft, ChevronRight, Building2 } from 'lucide-react'

const MOCK_ADMIN_COMPANIES = [
  { id: 'c1', name: 'Durand Rénovation', city: 'Lyon', plan: 'PRO', users: 3, status: 'ACTIF', joinedAt: '12/01/2024', revenue: 18750 },
  { id: 'c2', name: 'Électricité Martin', city: 'Paris', plan: 'PREMIUM', users: 8, status: 'ACTIF', joinedAt: '05/02/2024', revenue: 34200 },
  { id: 'c3', name: 'Plomberie Dupont', city: 'Marseille', plan: 'STARTER', users: 1, status: 'ESSAI', joinedAt: '18/06/2024', revenue: 4100 },
  { id: 'c4', name: 'BTP Solutions', city: 'Toulouse', plan: 'PRO', users: 5, status: 'ACTIF', joinedAt: '30/03/2024', revenue: 22600 },
  { id: 'c5', name: 'Renovation Express', city: 'Bordeaux', plan: 'STARTER', users: 2, status: 'SUSPENDU', joinedAt: '10/04/2024', revenue: 8900 },
  { id: 'c6', name: 'Maçonnerie Leblanc', city: 'Nantes', plan: 'PRO', users: 4, status: 'ACTIF', joinedAt: '22/04/2024', revenue: 19300 },
  { id: 'c7', name: 'Carrelage Pro Est', city: 'Strasbourg', plan: 'PREMIUM', users: 6, status: 'ACTIF', joinedAt: '03/05/2024', revenue: 28100 },
  { id: 'c8', name: 'Multi Services Petit', city: 'Lille', plan: 'STARTER', users: 1, status: 'ESSAI', joinedAt: '14/06/2024', revenue: 1200 },
]

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    STARTER: 'bg-gray-100 text-gray-700',
    PRO: 'bg-blue-100 text-blue-700',
    PREMIUM: 'bg-purple-100 text-purple-700',
    ENTREPRISE: 'bg-amber-100 text-amber-700',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[plan] ?? styles.STARTER}`}>
      {plan}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { style: string; label: string }> = {
    ACTIF: { style: 'bg-green-100 text-green-700', label: 'Actif' },
    ESSAI: { style: 'bg-yellow-100 text-yellow-700', label: 'Essai' },
    SUSPENDU: { style: 'bg-red-100 text-red-700', label: 'Suspendu' },
    ANNULE: { style: 'bg-gray-100 text-gray-500', label: 'Annulé' },
  }
  const cfg = configs[status] ?? configs.ACTIF
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.style}`}>
      {cfg.label}
    </span>
  )
}

export default function AdminCompaniesPage() {
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = MOCK_ADMIN_COMPANIES.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
    const matchPlan = !planFilter || c.plan === planFilter
    const matchStatus = !statusFilter || c.status === statusFilter
    return matchSearch && matchPlan && matchStatus
  })

  const handleExport = () => {
    alert('[SIMULATION] Export CSV — cette fonctionnalité est simulée')
  }

  const handleAction = (action: string, name: string) => {
    alert(`[SIMULATION] Action "${action}" sur ${name}`)
  }

  return (
    <div className="p-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-600" />
            <h1 className="text-2xl font-bold text-slate-900">Entreprises</h1>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            {filtered.length} entreprise{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Recherche */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, ville..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtre plan */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les plans</option>
            <option value="STARTER">Starter</option>
            <option value="PRO">Pro</option>
            <option value="PREMIUM">Premium</option>
            <option value="ENTREPRISE">Entreprise</option>
          </select>

          {/* Filtre statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="ACTIF">Actif</option>
            <option value="ESSAI">Essai</option>
            <option value="SUSPENDU">Suspendu</option>
            <option value="ANNULE">Annulé</option>
          </select>

          {(search || planFilter || statusFilter) && (
            <button
              onClick={() => { setSearch(''); setPlanFilter(''); setStatusFilter('') }}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Entreprise</th>
                <th className="pb-3 font-medium">Ville</th>
                <th className="pb-3 font-medium">Plan</th>
                <th className="pb-3 font-medium">Utilisateurs</th>
                <th className="pb-3 font-medium">Statut</th>
                <th className="pb-3 font-medium">CA simulé</th>
                <th className="pb-3 font-medium">Inscrit le</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Aucune entreprise ne correspond aux filtres
                  </td>
                </tr>
              ) : (
                filtered.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-slate-900">{company.name}</td>
                    <td className="py-3 text-slate-600">{company.city}</td>
                    <td className="py-3"><PlanBadge plan={company.plan} /></td>
                    <td className="py-3 text-slate-600">{company.users}</td>
                    <td className="py-3"><StatusBadge status={company.status} /></td>
                    <td className="py-3 text-slate-700 font-medium">
                      {company.revenue.toLocaleString('fr-FR')} €
                    </td>
                    <td className="py-3 text-slate-500">{company.joinedAt}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction('voir détails', company.name)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          Voir
                        </button>
                        <button
                          onClick={() => handleAction('suspendre', company.name)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                        >
                          <Pause className="w-3 h-3" />
                          Suspendre
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination (visuelle uniquement) */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Affichage de 1 à {filtered.length} sur {MOCK_ADMIN_COMPANIES.length} entreprises
        </p>
        <div className="flex items-center gap-1">
          <button
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-gray-100 rounded-lg disabled:opacity-40"
            disabled
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium">
            1
          </button>
          <button className="px-3 py-1.5 text-slate-600 hover:bg-gray-100 rounded-lg text-sm">
            2
          </button>
          <button className="px-3 py-1.5 text-slate-600 hover:bg-gray-100 rounded-lg text-sm">
            3
          </button>
          <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
