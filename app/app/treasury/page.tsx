'use client'

import { AlertTriangle, TrendingUp, Clock, Banknote, BarChart2, Target, Bell } from 'lucide-react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { MOCK_INVOICES, MOCK_CLIENTS, MOCK_REVENUE_DATA } from '@/lib/mock-data'
import { INVOICE_STATUS_LABELS } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useState } from 'react'

function getClientName(clientId: string): string {
  const c = MOCK_CLIENTS.find((x) => x.id === clientId)
  return c ? `${c.firstName} ${c.lastName}` : '—'
}

function daysDiff(date: Date): number {
  return Math.ceil((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
}

const KPI_CARDS = [
  {
    label: 'Encaissé ce mois',
    value: '18 750 €',
    sub: '↑ 32% vs mois dernier',
    color: 'text-green-600',
    bg: 'bg-green-50',
    iconBg: 'bg-green-100',
    Icon: TrendingUp,
    iconColor: 'text-green-600',
  },
  {
    label: 'Facturé en attente',
    value: '7 140 €',
    sub: '1 facture en cours',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    iconBg: 'bg-orange-100',
    Icon: Clock,
    iconColor: 'text-orange-600',
  },
  {
    label: 'En retard',
    value: '2 340 €',
    sub: '1 facture en retard',
    color: 'text-red-600',
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
    Icon: AlertTriangle,
    iconColor: 'text-red-600',
  },
  {
    label: 'Dépenses estimées',
    value: '13 500 €',
    sub: 'Main d\'œuvre + matériaux',
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    iconBg: 'bg-gray-100',
    Icon: Banknote,
    iconColor: 'text-gray-500',
  },
  {
    label: 'Marge brute estimée',
    value: '28%',
    sub: 'Objectif ≥ 30%',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    Icon: BarChart2,
    iconColor: 'text-blue-600',
  },
  {
    label: 'Objectif mensuel',
    value: '25 000 €',
    sub: '75% atteint (18 750 €)',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    Icon: Target,
    iconColor: 'text-purple-600',
  },
]

const PREVISIONNEL = [
  { label: '30 jours', value: 22400, desc: 'Encaissements attendus' },
  { label: '60 jours', value: 18900, desc: 'Encaissements attendus' },
  { label: '90 jours', value: 15200, desc: 'Encaissements attendus' },
]

const REPARTITION = [
  { icon: '🏦', label: 'Virement', amount: 15810, pct: 84 },
  { icon: '📋', label: 'Chèque', amount: 1500, pct: 8 },
  { icon: '💵', label: 'Espèces', amount: 1440, pct: 8 },
]

export default function TreasuryPage() {
  const overdueInvoices = MOCK_INVOICES.filter((i) => i.status === 'EN_RETARD')
  const pendingRelances = MOCK_INVOICES.filter(
    (i) => (i.status === 'EN_RETARD' || i.status === 'EN_ATTENTE') && i.dueDate && new Date(i.dueDate) < new Date()
  )

  const [relanceToast, setRelanceToast] = useState<string | null>(null)

  function handleRelance(number: string) {
    setRelanceToast(`Relance simulée envoyée pour ${number}`)
    setTimeout(() => setRelanceToast(null), 3000)
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Toast */}
      {relanceToast && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <Bell className="w-4 h-4" />
          {relanceToast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trésorerie</h1>
          <p className="text-sm text-gray-500 mt-0.5">Suivi financier et prévisionnel</p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
          ⚠ Simulation — données fictives
        </span>
      </div>

      {/* Overdue alert */}
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

      {/* KPI Cards — 2 rows of 3 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {KPI_CARDS.map((card) => (
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

      {/* Prévisionnel 90 jours */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3">Prévisionnel 90 jours</h2>
        <div className="grid grid-cols-3 gap-4">
          {PREVISIONNEL.map((p, i) => (
            <div key={p.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">{p.label}</p>
              <p className={`text-2xl font-bold ${i === 0 ? 'text-blue-600' : i === 1 ? 'text-blue-500' : 'text-blue-400'}`}>
                {formatCurrency(p.value)}
              </p>
              <p className="text-xs text-gray-400 mt-1">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Évolution de trésorerie</h2>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={MOCK_REVENUE_DATA} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="CA" name="CA encaissé" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Line
              dataKey="objectif"
              name="Objectif mensuel"
              type="monotone"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Répartition par mode de paiement */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Répartition par mode de paiement</h2>
        <div className="space-y-4">
          {REPARTITION.map((r) => (
            <div key={r.label} className="flex items-center gap-4">
              <span className="text-xl w-7 text-center">{r.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{r.label}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(r.amount)}</span>
                    <span className="text-xs text-gray-400 ml-2">({r.pct}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Factures à relancer */}
      {pendingRelances.length > 0 && (
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
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingRelances.map((inv) => {
                  const retard = inv.dueDate ? daysDiff(inv.dueDate) : 0
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{inv.number}</td>
                      <td className="px-4 py-3 text-gray-700">{getClientName(inv.clientId)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {formatCurrency(inv.totalTTC - inv.amountPaid)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${retard > 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {retard > 0 ? `+${retard}j` : 'Aujourd\'hui'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleRelance(inv.number)}
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

      {/* Disclaimer */}
      <div className="text-center text-xs text-gray-400 pb-2">
        Les données financières sont fictives et générées pour illustration uniquement.
      </div>
    </div>
  )
}
