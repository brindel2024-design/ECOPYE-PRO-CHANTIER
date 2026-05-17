import {
  TrendingUp,
  FileText,
  CheckCircle2,
  AlertTriangle,
  FolderKanban,
  CreditCard,
  Percent,
  ShieldAlert,
  ArrowRight,
  Clock,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import {
  MOCK_DASHBOARD_STATS,
  MOCK_REVENUE_DATA,
  MOCK_QUOTE_RATE_DATA,
  MOCK_PROJECTS,
  MOCK_INVOICES,
  MOCK_CLIENTS,
} from '@/lib/mock-data'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { PROJECT_STATUS_LABELS, INVOICE_STATUS_LABELS } from '@/lib/types'
import { StatCard } from '@/components/StatCard'
import { RevenueChart } from '@/components/charts/RevenueChart'
import { QuoteRateChart } from '@/components/charts/QuoteRateChart'

export default function DashboardPage() {
  const stats = MOCK_DASHBOARD_STATS
  const trendRevenue = Math.round(((stats.revenueThisMonth - stats.revenuePreviousMonth) / stats.revenuePreviousMonth) * 100)

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-500 mt-0.5">Bonjour Jean 👋 — Voici votre activité du moment</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
            ⚠ Données fictives
          </span>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="CA ce mois"
          value={formatCurrency(stats.revenueThisMonth)}
          icon={TrendingUp}
          trend={trendRevenue}
          trendLabel="vs mois dernier"
          color="blue"
        />
        <StatCard
          title="Devis envoyés"
          value={stats.quotesCount}
          subtitle={`${stats.quotesAccepted} acceptés`}
          icon={FileText}
          color="purple"
        />
        <StatCard
          title="Chantiers actifs"
          value={stats.activeProjects}
          icon={FolderKanban}
          color="green"
        />
        <StatCard
          title="Paiements en attente"
          value={formatCurrency(stats.pendingPayments)}
          icon={CreditCard}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Factures en retard"
          value={stats.invoicesOverdue}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Marge estimée"
          value={`${stats.estimatedMargin}%`}
          icon={Percent}
          color="green"
        />
        <StatCard
          title="Alertes litiges"
          value={stats.disputeAlerts}
          icon={ShieldAlert}
          color="red"
        />
        <StatCard
          title="Clients actifs"
          value={MOCK_CLIENTS.length}
          icon={Users}
          color="blue"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChart data={MOCK_REVENUE_DATA} />
        <QuoteRateChart data={MOCK_QUOTE_RATE_DATA} />
      </div>

      {/* Listes basses */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chantiers actifs */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Chantiers en cours</h2>
            <Link href="/app/projects" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {MOCK_PROJECTS.filter((p) => p.status === 'EN_COURS' || p.status === 'PREPARATION' || p.status === 'EN_ATTENTE_ACOMPTE').slice(0, 4).map((project) => (
              <Link key={project.id} href={`/app/projects/${project.id}`} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{project.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-24">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{project.progress}%</span>
                  </div>
                </div>
                <span className={`ml-3 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(project.status)}`}>
                  {PROJECT_STATUS_LABELS[project.status]}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Factures récentes */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Dernières factures</h2>
            <Link href="/app/invoices" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {MOCK_INVOICES.slice(0, 4).map((invoice) => {
              const client = MOCK_CLIENTS.find((c) => c.id === invoice.clientId)
              return (
                <Link key={invoice.id} href={`/app/invoices/${invoice.id}`} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{invoice.number}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{client ? `${client.firstName} ${client.lastName}` : '—'}</p>
                  </div>
                  <div className="ml-3 text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(invoice.totalTTC)}</p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {INVOICE_STATUS_LABELS[invoice.status]}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Alertes */}
      <div className="rounded-xl border border-red-100 bg-red-50 p-4">
        <h3 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Alertes et actions requises
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-lg bg-white border border-red-100 px-4 py-3">
            <Clock className="h-4 w-4 text-red-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 font-medium">Facture en retard — Sophie Moreau</p>
              <p className="text-xs text-gray-500">FAC-2024-0003 — 2 340 € restants — En retard de 15 jours</p>
            </div>
            <Link href="/app/invoices/invoice-3" className="text-xs text-red-600 font-medium hover:underline shrink-0">
              Voir
            </Link>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-white border border-orange-100 px-4 py-3">
            <ShieldAlert className="h-4 w-4 text-orange-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 font-medium">Litige potentiel — Marseille</p>
              <p className="text-xs text-gray-500">Chantier dépassement budget +10% — Préparez un dossier</p>
            </div>
            <Link href="/app/projects/project-3" className="text-xs text-orange-600 font-medium hover:underline shrink-0">
              Voir
            </Link>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-white border border-yellow-100 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 font-medium">Attestation URSSAF expire bientôt</p>
              <p className="text-xs text-gray-500">Expire le 31 juillet 2024 — Pensez à renouveler</p>
            </div>
            <Link href="/app/documents" className="text-xs text-yellow-600 font-medium hover:underline shrink-0">
              Voir
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
