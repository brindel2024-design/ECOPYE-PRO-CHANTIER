'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, TrendingUp, Clock, Banknote, BarChart2, Target, Bell, Loader2 } from 'lucide-react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { INVOICE_STATUS_LABELS } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface TreasuryData {
  balance: number
  totalCollected: number
  totalSpentEstimate: number
  forecast: { amount: number; pendingInvoices: number }
  revenueByMonth: Array<{ month: string; revenue: number }>
}

interface Invoice {
  id: string; number: string; status: string; totalTTC: number; amountPaid: number
  dueDate: string | null; client?: { firstName: string; lastName: string }
}

function daysDiff(date: string): number {
  return Math.ceil((new Date().getTime() - new Date(date).getTime()) / 86400000)
}

export default function TreasuryPage() {
  const [data, setData] = useState<TreasuryData | null>(null)
  const [overdueInvoices, setOverdueInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [relanceToast, setRelanceToast] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/treasury').then(r => r.json()),
      fetch('/api/invoices?status=EN_RETARD').then(r => r.json()),
    ]).then(([t, i]) => {
      if (t.data) setData(t.data)
      if (i.data) setOverdueInvoices(i.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleRelance(id: string, number: string) {
    setRelanceToast(`Envoi de la relance ${number}…`)
    try {
      const res = await fetch(`/api/invoices/${id}/relance`, { method: 'POST' })
      const json = await res.json().catch(() => ({}))
      setRelanceToast(res.ok ? `Relance envoyée par email pour ${number}` : (json.error || `Échec de la relance ${number}`))
    } catch {
      setRelanceToast(`Échec de la relance ${number}`)
    }
    setTimeout(() => setRelanceToast(null), 4000)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
  }

  const chartData = (data?.revenueByMonth ?? []).map(d => ({
    mois: d.month,
    CA: d.revenue,
    objectif: (data?.totalCollected ?? 0) / 6,
  }))

  const margin = data && data.totalCollected > 0
    ? Math.round(((data.totalCollected - data.totalSpentEstimate) / data.totalCollected) * 100)
    : 0

  const kpiCards = data ? [
    { label: 'Encaissé total', value: formatCurrency(data.totalCollected), sub: 'Paiements reçus', color: 'text-green-600', iconBg: 'bg-green-100', Icon: TrendingUp, iconColor: 'text-green-600' },
    { label: 'À encaisser (prévision)', value: formatCurrency(data.forecast.amount), sub: `${data.forecast.pendingInvoices} facture(s) en attente`, color: 'text-orange-600', iconBg: 'bg-orange-100', Icon: Clock, iconColor: 'text-orange-600' },
    { label: 'En retard', value: formatCurrency(overdueInvoices.reduce((s, i) => s + (i.totalTTC - i.amountPaid), 0)), sub: `${overdueInvoices.length} facture(s)`, color: 'text-red-600', iconBg: 'bg-red-100', Icon: AlertTriangle, iconColor: 'text-red-600' },
    { label: 'Dépenses estimées', value: formatCurrency(data.totalSpentEstimate), sub: 'Budget réel chantiers', color: 'text-gray-600', iconBg: 'bg-gray-100', Icon: Banknote, iconColor: 'text-gray-500' },
    { label: 'Marge brute estimée', value: `${margin}%`, sub: 'Objectif ≥ 30%', color: 'text-blue-600', iconBg: 'bg-blue-100', Icon: BarChart2, iconColor: 'text-blue-600' },
    { label: 'Solde net estimé', value: formatCurrency(data.balance), sub: 'Encaissé − Dépenses', color: data.balance >= 0 ? 'text-green-600' : 'text-red-600', iconBg: 'bg-purple-100', Icon: Target, iconColor: 'text-purple-600' },
  ] : []

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {relanceToast && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <Bell className="w-4 h-4" />{relanceToast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trésorerie</h1>
          <p className="text-sm text-gray-500 mt-0.5">Suivi financier et prévisionnel</p>
        </div>
      </div>

      {overdueInvoices.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 flex items-center gap-3 text-red-700 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>
            <strong>{overdueInvoices.length} facture{overdueInvoices.length > 1 ? 's' : ''} en retard</strong>
            {' '}—{' '}
            {formatCurrency(overdueInvoices.reduce((s, i) => s + (i.totalTTC - i.amountPaid), 0))} non encaissés
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className={`p-3 ${card.iconBg} rounded-lg flex-shrink-0`}>
              <card.Icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{card.label}</p>
              <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Évolution des encaissements</h2>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="CA" name="CA encaissé" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Line dataKey="objectif" name="Objectif mensuel" type="monotone" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {overdueInvoices.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <h2 className="font-semibold text-gray-900">Factures à relancer</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Facture', 'Client', 'Montant', 'Retard (jours)', 'Action'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {overdueInvoices.map((inv) => {
                  const retard = inv.dueDate ? daysDiff(inv.dueDate) : 0
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <Link href={`/app/invoices/${inv.id}`} className="text-blue-600 hover:underline">{inv.number}</Link>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {inv.client ? `${inv.client.firstName} ${inv.client.lastName}` : '—'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(inv.totalTTC - inv.amountPaid)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${retard > 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {retard > 0 ? `+${retard}j` : 'Aujourd\'hui'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleRelance(inv.id, inv.number)}
                          className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg font-medium transition-colors"
                        >
                          Relancer
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
