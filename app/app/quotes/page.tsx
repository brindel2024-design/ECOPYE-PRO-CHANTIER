'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { FileText, Plus, Search, Filter, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { QUOTE_STATUS_LABELS } from '@/lib/types'
import type { QuoteStatus } from '@/lib/types'
import { EmptyState } from '@/components/EmptyState'

const STATUS_OPTIONS: Array<{ value: QuoteStatus | 'tous'; label: string }> = [
  { value: 'tous', label: 'Tous les statuts' },
  { value: 'BROUILLON', label: 'Brouillon' },
  { value: 'ENVOYE', label: 'Envoyé' },
  { value: 'VU', label: 'Vu' },
  { value: 'ACCEPTE', label: 'Accepté' },
  { value: 'REFUSE', label: 'Refusé' },
  { value: 'EXPIRE', label: 'Expiré' },
]

interface Quote {
  id: string
  number: string
  title: string
  status: string
  totalTTC: number
  createdAt: string
  client?: { firstName: string; lastName: string }
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'tous'>('tous')

  const fetch_ = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter !== 'tous') params.set('status', statusFilter)
    const res = await fetch(`/api/quotes?${params}`)
    if (res.ok) { const d = await res.json(); setQuotes(d.data ?? []) }
    setLoading(false)
  }, [search, statusFilter])

  useEffect(() => { fetch_() }, [fetch_])

  const acceptes = quotes.filter(q => q.status === 'ACCEPTE')
  const totalAcceptes = acceptes.reduce((s, q) => s + q.totalTTC, 0)
  const taux = quotes.length ? Math.round(acceptes.length / quotes.length * 100) : 0

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devis</h1>
          <p className="text-sm text-gray-500 mt-0.5">{quotes.length} devis • Taux d&apos;acceptation : {taux}%</p>
        </div>
        <Link href="/app/quotes/new" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />Nouveau devis
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Devis acceptés</p>
          <p className="text-xl font-bold text-green-600 mt-0.5">{acceptes.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Montant accepté</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{formatCurrency(totalAcceptes)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">En attente réponse</p>
          <p className="text-xl font-bold text-orange-500 mt-0.5">{quotes.filter(q => q.status === 'ENVOYE' || q.status === 'VU').length}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as QuoteStatus | 'tous')}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none">
            {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
      ) : quotes.length === 0 ? (
        <EmptyState icon={FileText} title="Aucun devis trouvé" description="Créez votre premier devis." actionLabel="Créer un devis" actionHref="/app/quotes/new" />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50">
                  {['Numéro','Client','Objet','Montant TTC','Statut','Date',''].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {quotes.map(q => (
                  <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4"><span className="text-sm font-mono font-medium text-gray-900">{q.number}</span></td>
                    <td className="px-6 py-4"><span className="text-sm text-gray-900">{q.client ? `${q.client.firstName} ${q.client.lastName}` : '—'}</span></td>
                    <td className="px-6 py-4"><span className="text-sm text-gray-600 line-clamp-1">{q.title}</span></td>
                    <td className="px-6 py-4"><span className="text-sm font-semibold text-gray-900">{formatCurrency(q.totalTTC)}</span></td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(q.status)}`}>
                        {QUOTE_STATUS_LABELS[q.status as QuoteStatus] ?? q.status}
                      </span>
                    </td>
                    <td className="px-6 py-4"><span className="text-sm text-gray-400">{formatDate(q.createdAt)}</span></td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/app/quotes/${q.id}`} className="text-xs font-medium text-blue-600 hover:underline">Voir →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
