'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Shield,
  Building2,
  CreditCard,
  Euro,
  LifeBuoy,
  Loader2,
} from 'lucide-react'

interface RecentCompany {
  id: string
  name: string
  city: string
  createdAt: string
  active: boolean
  subscription: { plan: string; status: string } | null
}

interface AdminStats {
  companies: number
  activeSubscriptions: number
  mrr: number
  openTickets: number
  recentCompanies: RecentCompany[]
}

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

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/admin')
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || 'Erreur')
        return r.json()
      })
      .then((j) => setStats(j.data))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (err || !stats) {
    return <div className="p-8 text-red-600 text-sm">{err || 'Données indisponibles'}</div>
  }

  const cards = [
    { label: 'Entreprises', value: String(stats.companies), icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Abonnements actifs', value: String(stats.activeSubscriptions), icon: CreditCard, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'MRR (revenu mensuel)', value: `${stats.mrr.toLocaleString('fr-FR')} €`, icon: Euro, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Tickets ouverts', value: String(stats.openTickets), icon: LifeBuoy, color: 'text-red-600', bg: 'bg-red-50' },
  ]

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord ECOPYE</h1>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-md">
            <Shield className="w-3 h-3" />
            ADMIN
          </span>
        </div>
        <p className="text-slate-500 text-sm">Vue d&apos;ensemble de la plateforme</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Entreprises récentes</h2>
          <Link href="/admin/companies" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Voir toutes →
          </Link>
        </div>

        {stats.recentCompanies.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">Aucune entreprise inscrite</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Entreprise</th>
                  <th className="pb-3 font-medium">Ville</th>
                  <th className="pb-3 font-medium">Plan</th>
                  <th className="pb-3 font-medium">Statut</th>
                  <th className="pb-3 font-medium">Inscrit le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentCompanies.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-slate-900">{c.name}</td>
                    <td className="py-3 text-slate-600">{c.city}</td>
                    <td className="py-3">
                      {c.subscription ? <PlanBadge plan={c.subscription.plan} /> : <span className="text-slate-400 text-xs">—</span>}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {c.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
