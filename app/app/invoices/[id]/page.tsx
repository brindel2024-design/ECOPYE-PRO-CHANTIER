'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  AlertTriangle,
  Download,
  Mail,
  CreditCard,
  CheckCircle,
  X,
} from 'lucide-react'
import { MOCK_INVOICES, MOCK_CLIENTS, MOCK_COMPANY } from '@/lib/mock-data'
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
    default: return 'bg-gray-100 text-gray-600'
  }
}

type MockLine = { label: string; qty: number; unit: string; unitPrice: number }

function getMockLines(invoiceId: string): MockLine[] {
  if (invoiceId === 'invoice-1') {
    return [
      { label: 'Acompte 30% sur devis DEV-2024-0001 — Rénovation SDB', qty: 1, unit: 'forfait', unitPrice: 2550 },
    ]
  }
  if (invoiceId === 'invoice-2') {
    return [
      { label: 'Main d\'œuvre — Plomberie et étanchéité', qty: 16, unit: 'h', unitPrice: 65 },
      { label: 'Pose carrelage format 30x60 — murs et sol', qty: 6, unit: 'm²', unitPrice: 85 },
      { label: 'Installation équipements sanitaires (WC, lavabo, douche)', qty: 1, unit: 'forfait', unitPrice: 1480 },
      { label: 'Fournitures et matériaux complémentaires', qty: 1, unit: 'forfait', unitPrice: 2090 },
    ]
  }
  if (invoiceId === 'invoice-3') {
    return [
      { label: 'Remplacement tableau électrique principal 14 circuits', qty: 1, unit: 'forfait', unitPrice: 1200 },
      { label: 'Mise aux normes NF C 15-100 — câblage', qty: 1, unit: 'forfait', unitPrice: 1100 },
      { label: 'Fournitures électriques (gaines, câbles, prises)', qty: 1, unit: 'forfait', unitPrice: 900 },
    ]
  }
  return [
    { label: 'Prestations de services', qty: 1, unit: 'forfait', unitPrice: 0 },
  ]
}

const PAYMENT_METHODS = [
  { value: 'VIREMENT', label: 'Virement bancaire' },
  { value: 'CHEQUE', label: 'Chèque' },
  { value: 'ESPECES', label: 'Espèces' },
]

export default function InvoiceDetailPage() {
  const params = useParams()
  const id = params?.id as string

  const invoice = MOCK_INVOICES.find((i) => i.id === id)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('VIREMENT')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <Link href="/invoices" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Retour aux factures
        </Link>
        <p className="mt-6 text-gray-500">Facture introuvable.</p>
      </div>
    )
  }

  const client = MOCK_CLIENTS.find((c) => c.id === invoice.clientId)
  const lines = getMockLines(invoice.id)
  const resteAPayer = invoice.totalTTC - invoice.amountPaid
  const isLate = invoice.status === 'EN_RETARD'
  const daysLate = isLate && invoice.dueDate
    ? Math.ceil((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  function handleSimulatePayment() {
    setPaymentSuccess(true)
    setTimeout(() => {
      setPaymentSuccess(false)
      setShowPaymentModal(false)
      showToast('Paiement simulé enregistré avec succès')
    }, 2000)
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {toastMsg}
        </div>
      )}

      {/* Back link */}
      <Link href="/invoices" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1.5">
        <ArrowLeft className="w-4 h-4" />
        Retour aux factures
      </Link>

      {/* Simulation warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 flex items-center gap-2 text-amber-700 text-sm">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span>⚠ Simulation — données fictives — Ceci est un aperçu de facture simulée</span>
      </div>

      {/* Late alert */}
      {isLate && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-2 text-red-700 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            Cette facture est en retard de {daysLate} jour{daysLate > 1 ? 's' : ''} — Envoyez une relance au client
          </span>
        </div>
      )}

      {/* Invoice document */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
        {/* Header: company + invoice info */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-lg font-bold text-gray-900">{MOCK_COMPANY.name}</p>
            <p className="text-sm text-gray-500 mt-1">SIRET : {MOCK_COMPANY.siret}</p>
            <p className="text-sm text-gray-500">{MOCK_COMPANY.address}</p>
            <p className="text-sm text-gray-500">{MOCK_COMPANY.postalCode} {MOCK_COMPANY.city}</p>
            <p className="text-sm text-gray-500">{MOCK_COMPANY.phone}</p>
            <p className="text-sm text-gray-500">{MOCK_COMPANY.email}</p>
            <p className="text-sm text-gray-500">TVA : {MOCK_COMPANY.vatNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-gray-900 tracking-tight">FACTURE</p>
            <p className="text-lg font-semibold text-blue-600 mt-1">{invoice.number}</p>
            <div className="mt-3 space-y-1 text-sm text-gray-500">
              <p>Date d&apos;émission : <span className="text-gray-700 font-medium">{formatDate(invoice.issuedAt)}</span></p>
              <p>Date d&apos;échéance : <span className={`font-medium ${isLate ? 'text-red-600' : 'text-gray-700'}`}>{invoice.dueDate ? formatDate(invoice.dueDate) : '—'}</span></p>
            </div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadgeClass(invoice.type === 'ACOMPTE' ? 'ENVOYEE' : invoice.status)}`}>
                {TYPE_LABELS[invoice.type]}
              </span>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadgeClass(invoice.status)}`}>
                {INVOICE_STATUS_LABELS[invoice.status as keyof typeof INVOICE_STATUS_LABELS]}
              </span>
            </div>
          </div>
        </div>

        {/* Client info */}
        {client && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Facturée à :</p>
            <p className="font-semibold text-gray-900">{client.firstName} {client.lastName}</p>
            <p className="text-sm text-gray-600">{client.address}</p>
            <p className="text-sm text-gray-600">{client.postalCode} {client.city}</p>
            <p className="text-sm text-gray-500">{client.email}</p>
          </div>
        )}

        {/* Lines table */}
        <div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 text-gray-600 font-semibold">Désignation</th>
                <th className="text-right py-2 text-gray-600 font-semibold w-16">Qté</th>
                <th className="text-right py-2 text-gray-600 font-semibold w-20">Unité</th>
                <th className="text-right py-2 text-gray-600 font-semibold w-28">P.U. HT</th>
                <th className="text-right py-2 text-gray-600 font-semibold w-28">Total HT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lines.map((line, i) => (
                <tr key={i} className="py-2">
                  <td className="py-3 text-gray-800">{line.label}</td>
                  <td className="py-3 text-right text-gray-600">{line.qty}</td>
                  <td className="py-3 text-right text-gray-600">{line.unit}</td>
                  <td className="py-3 text-right text-gray-700">{formatCurrency(line.unitPrice)}</td>
                  <td className="py-3 text-right font-medium text-gray-900">{formatCurrency(line.qty * line.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total HT</span>
              <span>{formatCurrency(invoice.subtotalHT)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>TVA 20%</span>
              <span>{formatCurrency(invoice.vatAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2">
              <span>Total TTC</span>
              <span>{formatCurrency(invoice.totalTTC)}</span>
            </div>
            {invoice.amountPaid > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Déjà payé</span>
                <span>- {formatCurrency(invoice.amountPaid)}</span>
              </div>
            )}
            {resteAPayer > 0 && (
              <div className="flex justify-between font-bold text-blue-700 border-t border-gray-200 pt-2">
                <span>Reste à payer</span>
                <span>{formatCurrency(resteAPayer)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment info */}
        <div className="bg-blue-50 rounded-lg p-4 text-sm">
          <p className="font-semibold text-blue-800 mb-2">Conditions de paiement</p>
          <p className="text-blue-700">Paiement à 30 jours à réception de facture.</p>
          <p className="text-blue-700 mt-1">IBAN : <span className="font-mono font-medium">FR76 3000 6000 0112 3456 7890 189</span></p>
          <p className="text-blue-700">BIC : SOGEFRPP</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => showToast('Téléchargement PDF simulé')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Télécharger PDF
        </button>
        <button
          onClick={() => showToast('Email simulé envoyé au client')}
          className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Envoyer par email
        </button>
        {invoice.status !== 'PAYEE' && (
          <button
            onClick={() => {
              setPaymentAmount(String(resteAPayer))
              setShowPaymentModal(true)
            }}
            className="border border-green-200 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Enregistrer paiement
          </button>
        )}
      </div>

      {/* Payment modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            {paymentSuccess ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-lg font-semibold text-gray-900">Paiement enregistré !</p>
                <p className="text-sm text-gray-500 text-center">Le paiement de {formatCurrency(Number(paymentAmount))} a été simulé avec succès.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-900">Enregistrer un paiement</h2>
                  <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Mode de paiement</label>
                    <div className="flex flex-col gap-2">
                      {PAYMENT_METHODS.map((m) => (
                        <label key={m.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="method"
                            value={m.value}
                            checked={paymentMethod === m.value}
                            onChange={() => setPaymentMethod(m.value)}
                            className="accent-blue-600"
                          />
                          <span className="text-sm text-gray-700">{m.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Montant (€)</label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSimulatePayment}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Confirmer le paiement simulé
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
