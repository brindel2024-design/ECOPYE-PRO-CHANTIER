'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, FileText, TrendingUp, Clock, AlertTriangle, Bell, Loader2 } from 'lucide-react'
import { INVOICE_STATUS_LABELS } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'

const TYPE_LABELS: Record<string, string> = {
  ACOMPTE: 'Acompte', FINALE: 'Facture finale', INTERMEDIAIRE: 'Intermédiaire', AVOIR: 'Avoir',
}

function statusBadgeClass(s: string) {
  return { PAYEE: 'bg-green-100 text-green-700', EN_ATTENTE: 'bg-yellow-100 text-yellow-700',
    EN_RETARD: 'bg-red-100 text-red-700', ENVOYEE: 'bg-blue-100 text-blue-700',
    BROUILLON: 'bg-gray-100 text-gray-600', ANNULEE: 'bg-gray-100 text-gray-500' }[s] ?? 'bg-gray-100 text-gray-600'
}

interface Invoice {
  id: string; number: string; type: string; status: string
  totalTTC: number; amountPaid: number; dueDate: string | null
  client?: { firstName: string; lastName: string }
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('TOUTES')
  const [toast, setToast] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter !== 'TOUTES') params.set('status', statusFilter)
    const res = await fetch(`/api/invoices?${params}`)
    if (res.ok) { const d = await res.json(); setInvoices(d.data ?? []) }
    setLoading(false)
  }, [search, statusFilter])

  useEffect(() => { fetch_() }, [fetch_])

  const totalEncaisse = invoices.filter(i => i.status === 'PAYEE').reduce((s, i) => s + i.amountPaid, 0)
  const totalAttente = invoices.filter(i => i.status === 'EN_ATTENTE').reduce((s, i) => s + i.totalTTC, 0)
  const totalRetard = invoices.filter(i => i.status === 'EN_RETARD').reduce((s, i) => s + (i.totalTTC - i.amountPaid), 0)

  async function handleRelance(id: string, number: string) {
    setToast(`Envoi de la relance ${number}…`)
    try {
      const res = await fetch(`/api/invoices/${id}/relance`, { method: 'POST' })
      const json = await res.json().catch(() => ({}))
      setToast(res.ok ? `Relance envoyée par email pour ${number}` : (json.error || `Échec de la relance ${number}`))
    } catch {
      setToast(`Échec de la relance ${number}`)
    }
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <Bell className="w-4 h-4" />{toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestion et suivi de vos factures</p>
        </div>
        <Link href="/app/invoices/new" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="w-4 h-4" />Nouvelle facture
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: TrendingUp, color: 'green', label: 'Total encaissé', value: totalEncaisse },
          { icon: Clock, color: 'yellow', label: 'En attente', value: totalAttente },
          { icon: AlertTriangle, color: 'red', label: 'En retard', value: totalRetard },
        ].map(({ icon: Icon, color, label, value }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div className={`p-3 bg-${color}-100 rounded-lg`}><Icon className={`w-5 h-5 text-${color}-600`} /></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
              <p className={`text-xl font-bold text-${color}-600`}>{formatCurrency(value)}</p></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="TOUTES">Toutes</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="PAYEE">Payée</option>
          <option value="EN_RETARD">En retard</option>
          <option value="ENVOYEE">Envoyée</option>
          <option value="BROUILLON">Brouillon</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Numéro','Type','Client','Montant TTC','Payé','Statut','Échéance','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">
                    Aucune facture — <Link href="/app/invoices/new" className="text-blue-600 hover:underline">Créer une facture</Link>
                  </td></tr>
                ) : invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" /><span className="font-medium text-gray-900">{inv.number}</span></div></td>
                    <td className="px-4 py-3 text-gray-600">{TYPE_LABELS[inv.type] ?? inv.type}</td>
                    <td className="px-4 py-3 text-gray-700">{inv.client ? `${inv.client.firstName} ${inv.client.lastName}` : '—'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(inv.totalTTC)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatCurrency(inv.amountPaid)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(inv.status)}`}>
                        {INVOICE_STATUS_LABELS[inv.status as keyof typeof INVOICE_STATUS_LABELS] ?? inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {inv.status === 'EN_RETARD' && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                        <span className={inv.status === 'EN_RETARD' ? 'text-red-600 font-medium' : 'text-gray-600'}>
                          {inv.dueDate ? formatDate(new Date(inv.dueDate)) : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/app/invoices/${inv.id}`} className="text-blue-600 hover:text-blue-700 text-xs font-medium underline">Voir</Link>
                        {inv.status === 'EN_RETARD' && (
                          <button onClick={() => handleRelance(inv.id, inv.number)}
                            className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded font-medium transition-colors">
                            Relance
                          </button>
                        )}
                      </div>
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
