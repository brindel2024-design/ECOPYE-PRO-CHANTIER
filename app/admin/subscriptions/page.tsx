'use client'
import { useEffect, useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'

interface AdminSubscription {
  id: string
  plan: string
  status: string
  monthlyPrice: number
  startedAt: string
  trialEndsAt: string | null
  endsAt: string | null
  company: { id: string; name: string; email: string; city: string }
}

const STATUS_STYLE: Record<string, string> = {
  ACTIF: 'bg-green-100 text-green-700',
  ESSAI: 'bg-yellow-100 text-yellow-700',
  SUSPENDU: 'bg-red-100 text-red-700',
  ANNULE: 'bg-gray-100 text-gray-500',
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<AdminSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  function load() {
    fetch('/api/admin/subscriptions')
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || 'Erreur')
        return r.json()
      })
      .then((j) => setSubs(j.data ?? []))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function changeStatus(id: string, status: string) {
    setSavingId(id)
    await fetch('/api/admin/subscriptions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setSavingId(null)
    load()
  }

  const mrr = subs.filter((s) => s.status === 'ACTIF').reduce((t, s) => t + s.monthlyPrice, 0)

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-1">
        <CreditCard className="w-6 h-6 text-slate-700" />
        <h1 className="text-2xl font-bold text-slate-900">Abonnements</h1>
      </div>
      <p className="text-slate-500 text-sm mb-6">
        {loading ? '…' : `${subs.length} abonnement(s) · MRR ${mrr.toLocaleString('fr-FR')} €`}
      </p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-7 h-7 animate-spin text-slate-400" />
          </div>
        ) : err ? (
          <p className="text-red-600 text-sm py-8 text-center">{err}</p>
        ) : subs.length === 0 ? (
          <p className="text-slate-400 text-sm py-12 text-center">Aucun abonnement</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Entreprise</th>
                  <th className="pb-3 font-medium">Plan</th>
                  <th className="pb-3 font-medium">Prix / mois</th>
                  <th className="pb-3 font-medium">Statut</th>
                  <th className="pb-3 font-medium">Depuis</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subs.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <p className="font-medium text-slate-900">{s.company.name}</p>
                      <p className="text-xs text-slate-400">{s.company.email}</p>
                    </td>
                    <td className="py-3 text-slate-700 font-medium">{s.plan}</td>
                    <td className="py-3 text-slate-600">{s.monthlyPrice.toLocaleString('fr-FR')} €</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[s.status] ?? STATUS_STYLE.ANNULE}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(s.startedAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3">
                      <select
                        disabled={savingId === s.id}
                        value={s.status}
                        onChange={(e) => changeStatus(s.id, e.target.value)}
                        className="border border-gray-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <option value="ESSAI">Essai</option>
                        <option value="ACTIF">Actif</option>
                        <option value="SUSPENDU">Suspendu</option>
                        <option value="ANNULE">Annulé</option>
                      </select>
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
