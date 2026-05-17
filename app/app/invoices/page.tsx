'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Plus, Search, FileText, TrendingUp, Clock, Bell } from 'lucide-react'
import { MOCK_INVOICES, MOCK_CLIENTS } from '@/lib/mock-data'
import { INVOICE_STATUS_LABELS } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'

const TYPE_LABELS: Record<string, string> = {
  ACOMPTE: 'Acompte',
  FINALE: 'Facture finale',
  INTERMEDIAIRE: 'Intermédiaire',
  AVOIR: 'Avoir',
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'PAYEE': return 'bg-green-100 text-green-700'
    case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-700'
    case 'EN_RETARD': return 'bg-red-100 text-red-700'
    case 'ENVOYEE': return 'bg-blue-100 text-blue-700'
    case 'BROUILLON': return 'bg-gray-100 text-gray-600'
    case 'ANNULEE': return 'bg-gray-100 text-gray-500'
    default: return 'bg-gray-100 text-gray-600'
  }
}

function getClientName(clientId: string): string {
  const client = MOCK_CLIENTS.find((c) => c.id === clientId)
  if (!client) return '—'
  return `${client.firstName} ${client.lastName}`
}

export default function InvoicesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('TOUTES')
  const [relanceToast, setRelanceToast] = useState<string | null>(null)

  const filtered = MOCK_INVOICES.filter((inv) => {
    const clientName = getClientName(inv.clientId).toLowerCase()
    const matchSearch =
      inv.number.toLowerCase().includes(search.toLowerCase()) ||
      clientName.includes(search.toLowerCase())
    const matchStatus = statusFilter === 'TOUTES' || inv.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalEncaisse = MOCK_INVOICES.filter((i) => i.status === 'PAYEE').reduce((s, i) => s + i.amountPaid, 0)
  const totalAttente = MOCK_INVOICES.filter((i) => i.status === 'EN_ATTENTE').reduce((s, i) => s + i.totalTTC, 0)
  const totalRetard = MOCK_INVOICES.filter((i) => i.status === 'EN_RETARD').reduce((s, i) => s + (i.totalTTC - i.amountPaid), 0)

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
          <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestion et suivi de vos factures</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
            ⚠ Simulation — données fictives
          </span>
          <button
            disabled
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle facture
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total encaissé</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totalEncaisse)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-3 bg-yellow-100 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">En attente</p>
            <p className="text-xl font-bold text-yellow-600">{formatCurrency(totalAttente)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">En retard</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(totalRetard)}</p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par numéro ou client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="TOUTES">Toutes</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="PAYEE">Payée</option>
          <option value="EN_RETARD">En retard</option>
          <option value="ENVOYEE">Envoyée</option>
          <option value="BROUILLON">Brouillon</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Numéro', 'Type', 'Client', 'Montant TTC', 'Payé', 'Statut', 'Échéance', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">
                    Aucune facture trouvée
                  </td>
                </tr>
              )}
              {filtered.map((inv) => {
                const isLate = inv.status === 'EN_RETARD'
                const dueDate = inv.dueDate ? new Date(inv.dueDate) : null
                return (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{inv.number}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {TYPE_LABELS[inv.type] ?? inv.type}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {getClientName(inv.clientId)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {formatCurrency(inv.totalTTC)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatCurrency(inv.amountPaid)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(inv.status)}`}>
                        {INVOICE_STATUS_LABELS[inv.status as keyof typeof INVOICE_STATUS_LABELS] ?? inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {isLate && <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                        <span className={isLate ? 'text-red-600 font-medium' : 'text-gray-600'}>
                          {dueDate ? formatDate(dueDate) : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium underline"
                        >
                          Voir
                        </Link>
                        {isLate && (
                          <button
                            onClick={() => handleRelance(inv.number)}
                            className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded font-medium transition-colors"
                          >
                            Envoyer relance
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
