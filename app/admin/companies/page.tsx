'use client'
import { useEffect, useState } from 'react'
import { Building2, Loader2, Search } from 'lucide-react'

interface AdminCompany {
  id: string
  name: string
  ownerName: string
  email: string
  phone: string
  city: string
  trade: string
  active: boolean
  createdAt: string
  subscription: { plan: string; status: string; monthlyPrice: number } | null
  _count: { users: number; clients: number; invoices: number; projects: number }
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

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<AdminCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')

  useEffect(() => {
    fetch('/api/admin/companies')
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || 'Erreur')
        return r.json()
      })
      .then((j) => setCompanies(j.data ?? []))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.city.toLowerCase().includes(q.toLowerCase()) ||
      c.email.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-1">
        <Building2 className="w-6 h-6 text-slate-700" />
        <h1 className="text-2xl font-bold text-slate-900">Entreprises</h1>
      </div>
      <p className="text-slate-500 text-sm mb-6">
        {loading ? '…' : `${companies.length} entreprise(s) inscrite(s)`}
      </p>

      <div className="relative mb-4 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher (nom, ville, email)..."
          className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-7 h-7 animate-spin text-slate-400" />
          </div>
        ) : err ? (
          <p className="text-red-600 text-sm py-8 text-center">{err}</p>
        ) : filtered.length === 0 ? (
          <p className="text-slate-400 text-sm py-12 text-center">
            {companies.length === 0 ? 'Aucune entreprise inscrite' : 'Aucun résultat'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Entreprise</th>
                  <th className="pb-3 font-medium">Gérant</th>
                  <th className="pb-3 font-medium">Ville</th>
                  <th className="pb-3 font-medium">Plan</th>
                  <th className="pb-3 font-medium">Clients</th>
                  <th className="pb-3 font-medium">Factures</th>
                  <th className="pb-3 font-medium">Statut</th>
                  <th className="pb-3 font-medium">Inscrit le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <p className="font-medium text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.email}</p>
                    </td>
                    <td className="py-3 text-slate-600">{c.ownerName}</td>
                    <td className="py-3 text-slate-600">{c.city}</td>
                    <td className="py-3">
                      {c.subscription ? <PlanBadge plan={c.subscription.plan} /> : <span className="text-slate-400 text-xs">—</span>}
                    </td>
                    <td className="py-3 text-slate-600">{c._count.clients}</td>
                    <td className="py-3 text-slate-600">{c._count.invoices}</td>
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
