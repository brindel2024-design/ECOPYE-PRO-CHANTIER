'use client'
import {
  Shield,
  AlertTriangle,
  Building2,
  Users,
  FileText,
  Euro,
  Ticket,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Pause,
} from 'lucide-react'

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

const MOCK_TICKETS = [
  { id: 't1', company: 'Plomberie Dupont', subject: 'Impossible de créer un devis', priority: 'ELEVE', status: 'OUVERT', createdAt: 'il y a 2h' },
  { id: 't2', company: 'BTP Solutions', subject: 'Question sur la facturation', priority: 'NORMAL', status: 'EN_COURS', createdAt: 'il y a 5h' },
  { id: 't3', company: 'Renovation Express', subject: 'Compte suspendu à tort', priority: 'URGENT', status: 'OUVERT', createdAt: 'il y a 30min' },
]

const PLATFORM_STATS = [
  { label: 'Entreprises actives', value: '1 247', sub: '+23 ce mois', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Utilisateurs', value: '3 891', sub: '+67 ce mois', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Devis générés', value: '18 432', sub: 'ce mois: 2 341', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'CA simulé total', value: '12,4 M€', sub: 'ce mois: 847 K€', icon: Euro, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Alertes actives', value: '7', sub: 'tickets support', icon: Ticket, color: 'text-red-600', bg: 'bg-red-50' },
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

function TicketPriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    URGENT: 'bg-red-100 text-red-700',
    ELEVE: 'bg-orange-100 text-orange-700',
    NORMAL: 'bg-blue-100 text-blue-700',
  }
  const labels: Record<string, string> = {
    URGENT: 'Urgent',
    ELEVE: 'Élevé',
    NORMAL: 'Normal',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[priority] ?? styles.NORMAL}`}>
      {labels[priority] ?? priority}
    </span>
  )
}

function TicketStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { style: string; label: string }> = {
    OUVERT: { style: 'bg-red-100 text-red-700', label: 'Ouvert' },
    EN_COURS: { style: 'bg-blue-100 text-blue-700', label: 'En cours' },
    RESOLU: { style: 'bg-green-100 text-green-700', label: 'Résolu' },
  }
  const cfg = configs[status] ?? configs.OUVERT
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.style}`}>
      {cfg.label}
    </span>
  )
}

export default function AdminDashboard() {
  const handleAction = (action: string, target: string) => {
    alert(`[SIMULATION] Action "${action}" sur ${target}`)
  }

  return (
    <div className="p-8">
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord ECOPYE</h1>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-md">
            <Shield className="w-3 h-3" />
            ADMIN
          </span>
        </div>
        <p className="text-slate-500 text-sm">Vue d&apos;ensemble de la plateforme</p>

        {/* Alerte simulation */}
        <div className="mt-3 flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg w-fit">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <p className="text-amber-700 text-sm font-medium">
            Mode simulation — toutes les données sont fictives
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {PLATFORM_STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
              <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                {stat.sub}
              </p>
            </div>
          )
        })}
      </div>

      {/* Tableau entreprises récentes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Entreprises récentes</h2>
          <a href="/admin/companies" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Voir toutes →
          </a>
        </div>

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
              {MOCK_ADMIN_COMPANIES.map((company) => (
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
                        onClick={() => handleAction('voir', company.name)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Voir détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAction('suspendre', company.name)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Suspendre"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tickets support */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">Tickets support</h2>
            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
              {MOCK_TICKETS.filter(t => t.status === 'OUVERT').length} ouverts
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {MOCK_TICKETS.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-900">{ticket.subject}</span>
                  <TicketPriorityBadge priority={ticket.priority} />
                </div>
                <p className="text-xs text-slate-500">
                  {ticket.company} · {ticket.createdAt}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <TicketStatusBadge status={ticket.status} />
                <button
                  onClick={() => handleAction('traiter ticket', ticket.subject)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Traiter →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
