'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Wallet, CheckCircle, Clock, AlertCircle, CreditCard, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface PaymentItem {
  id: string
  amount: number
  status: string
  method: string
  receiptNumber: string | null
  simulatedAt: string | null
  createdAt: string
  client: { firstName: string; lastName: string } | null
  invoice: { number: string } | null
}

const METHOD_LABEL: Record<string, string> = {
  VIREMENT: 'Virement',
  CHEQUE: 'Chèque',
  ESPECES: 'Espèces',
  CARTE: 'Carte (Stripe)',
  CARTE_BANCAIRE: 'Carte',
  PRELEVEMENT: 'Prélèvement',
}

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  REUSSI: { label: 'Reçu', cls: 'bg-green-100 text-green-700' },
  EN_ATTENTE: { label: 'En attente', cls: 'bg-yellow-100 text-yellow-700' },
  ECHEC: { label: 'Échec', cls: 'bg-red-100 text-red-700' },
  REMBOURSE: { label: 'Remboursé', cls: 'bg-gray-100 text-gray-600' },
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('')

  useEffect(() => {
    fetch('/api/payments')
      .then((r) => r.json())
      .then((j) => setPayments(j.data ?? []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false))
  }, [])

  const totalReussi = payments.filter((p) => p.status === 'REUSSI').reduce((s, p) => s + p.amount, 0)
  const totalAttente = payments.filter((p) => p.status === 'EN_ATTENTE').reduce((s, p) => s + p.amount, 0)
  const totalEchec = payments.filter((p) => p.status === 'ECHEC').reduce((s, p) => s + p.amount, 0)
  const filtered = filterStatus ? payments.filter((p) => p.status === filterStatus) : payments

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paiements &amp; Encaissements</h1>
          <p className="text-sm text-gray-500 mt-0.5">Historique réel des paiements reçus</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex items-start gap-3 text-blue-800 text-sm">
        <CreditCard className="w-5 h-5 flex-shrink-0 text-blue-600 mt-0.5" />
        <div>
          <strong>Encaisser par carte ?</strong> Ouvrez la facture concernée puis cliquez sur « Encaisser » →
          mode « Carte bancaire (paiement en ligne) ». Votre client reçoit un lien Stripe sécurisé.
          <Link href="/app/invoices" className="ml-2 underline font-medium">Voir mes factures →</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="h-5 w-5 text-green-600" /></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total encaissé</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(totalReussi)}</p>
          <p className="text-xs text-gray-400 mt-1">{payments.filter((p) => p.status === 'REUSSI').length} paiement(s)</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="h-5 w-5 text-yellow-600" /></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">En attente</span>
          </div>
          <p className="text-2xl font-bold text-yellow-700">{formatCurrency(totalAttente)}</p>
          <p className="text-xs text-gray-400 mt-1">{payments.filter((p) => p.status === 'EN_ATTENTE').length} paiement(s)</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg"><AlertCircle className="h-5 w-5 text-red-600" /></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Échec</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{formatCurrency(totalEchec)}</p>
          <p className="text-xs text-gray-400 mt-1">{payments.filter((p) => p.status === 'ECHEC').length} paiement(s)</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Tous les paiements</h2>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tous les statuts</option>
            <option value="REUSSI">Reçus</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="ECHEC">Échec</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Wallet className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {payments.length === 0
                ? 'Aucun paiement enregistré pour le moment'
                : 'Aucun paiement dans cette catégorie'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Date</th>
                  <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Reçu n°</th>
                  <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Facture</th>
                  <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Client</th>
                  <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Mode</th>
                  <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Statut</th>
                  <th className="text-right text-xs text-gray-500 font-medium pb-3">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => {
                  const cfg = STATUS_CFG[p.status] ?? STATUS_CFG.EN_ATTENTE
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="py-3.5 pr-4 text-gray-600">
                        {new Date(p.simulatedAt ?? p.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3.5 pr-4 font-mono text-xs text-gray-700">{p.receiptNumber ?? '—'}</td>
                      <td className="py-3.5 pr-4 text-gray-700">{p.invoice?.number ?? '—'}</td>
                      <td className="py-3.5 pr-4 text-gray-700">
                        {p.client ? `${p.client.firstName} ${p.client.lastName}` : '—'}
                      </td>
                      <td className="py-3.5 pr-4 text-gray-600">{METHOD_LABEL[p.method] ?? p.method}</td>
                      <td className="py-3.5 pr-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-semibold text-gray-900">{formatCurrency(p.amount)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
