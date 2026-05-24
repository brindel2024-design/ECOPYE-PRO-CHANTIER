'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  TrendingUp, FileText, AlertTriangle, FolderKanban, CreditCard,
  Percent, ArrowRight, Users, Loader2,
} from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { PROJECT_STATUS_LABELS, INVOICE_STATUS_LABELS } from '@/lib/types'
import { StatCard } from '@/components/StatCard'
import { RevenueChart } from '@/components/charts/RevenueChart'
import { QuoteRateChart } from '@/components/charts/QuoteRateChart'

interface DashboardData {
  stats: {
    monthlyRevenue: number
    activeProjects: number
    pendingQuotes: number
    unpaidInvoices: number
    unpaidAmount: number
    conversionRate: number
    totalClients: number
  }
  revenueData: Array<{ month: string; revenue: number }>
  quoteRateData: { total: number; accepted: number; rate: number }
}

interface Project { id: string; title: string; status: string; progress: number }
interface Invoice { id: string; number: string; status: string; totalTTC: number; client?: { firstName: string; lastName: string } }

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then(r => r.json()),
      fetch('/api/projects?status=EN_COURS').then(r => r.json()),
      fetch('/api/invoices').then(r => r.json()),
    ]).then(([d, p, i]) => {
      if (d.data) setData(d.data)
      if (p.data) setProjects(p.data.slice(0, 4))
      if (i.data) setInvoices(i.data.slice(0, 4))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
  }

  const stats = data?.stats
  const revenueData = (data?.revenueData ?? []).map(d => ({
    mois: d.month,
    CA: d.revenue,
    objectif: stats ? stats.monthlyRevenue * 1.1 : 0,
  }))
  const quoteRateData = data?.quoteRateData
    ? [{ mois: 'Total', envoyes: data.quoteRateData.total, acceptes: data.quoteRateData.accepted }]
    : []

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-500 mt-0.5">Vue d&apos;ensemble de votre activité</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="CA ce mois" value={formatCurrency(stats?.monthlyRevenue ?? 0)} icon={TrendingUp} color="blue" />
        <StatCard title="Devis en attente" value={stats?.pendingQuotes ?? 0} icon={FileText} color="purple" />
        <StatCard title="Chantiers actifs" value={stats?.activeProjects ?? 0} icon={FolderKanban} color="green" />
        <StatCard title="Impayés" value={formatCurrency(stats?.unpaidAmount ?? 0)} icon={CreditCard} color="orange" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard title="Factures impayées" value={stats?.unpaidInvoices ?? 0} icon={AlertTriangle} color="red" />
        <StatCard title="Taux conversion" value={`${stats?.conversionRate ?? 0}%`} icon={Percent} color="green" />
        <StatCard title="Total clients" value={stats?.totalClients ?? 0} icon={Users} color="blue" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChart data={revenueData} />
        <QuoteRateChart data={quoteRateData} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Chantiers en cours</h2>
            <Link href="/app/projects" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {projects.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Aucun chantier en cours</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {projects.map((project) => (
                <Link key={project.id} href={`/app/projects/${project.id}`} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{project.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-24">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${project.progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-400">{project.progress}%</span>
                    </div>
                  </div>
                  <span className={`ml-3 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(project.status)}`}>
                    {PROJECT_STATUS_LABELS[project.status as keyof typeof PROJECT_STATUS_LABELS] ?? project.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Dernières factures</h2>
            <Link href="/app/invoices" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {invoices.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Aucune facture</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {invoices.map((invoice) => (
                <Link key={invoice.id} href={`/app/invoices/${invoice.id}`} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{invoice.number}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {invoice.client ? `${invoice.client.firstName} ${invoice.client.lastName}` : '—'}
                    </p>
                  </div>
                  <div className="ml-3 text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(invoice.totalTTC)}</p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {INVOICE_STATUS_LABELS[invoice.status as keyof typeof INVOICE_STATUS_LABELS] ?? invoice.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {(stats?.unpaidInvoices ?? 0) > 0 && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Attention
          </h3>
          <p className="text-sm text-red-700">
            {stats?.unpaidInvoices} facture{(stats?.unpaidInvoices ?? 0) > 1 ? 's' : ''} impayée{(stats?.unpaidInvoices ?? 0) > 1 ? 's' : ''} — montant total {formatCurrency(stats?.unpaidAmount ?? 0)}.{' '}
            <Link href="/app/invoices?status=EN_RETARD" className="underline font-medium">Voir les factures en retard →</Link>
          </p>
        </div>
      )}
    </div>
  )
}
