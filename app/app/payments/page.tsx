'use client'

import { useState } from 'react'
import { CheckCircle, Copy, Share2, X, Wallet, Building2 } from 'lucide-react'
import { MOCK_INVOICES, MOCK_PAYMENTS, MOCK_CLIENTS } from '@/lib/mock-data'
import { INVOICE_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'

const METHOD_ICONS: Record<string, string> = {
  VIREMENT: '🏦',
  CHEQUE: '📋',
  ESPECES: '💵',
  CARTE_BANCAIRE: '💳',
  PRELEVEMENT: '🔄',
}

const METHOD_LABELS: Record<string, string> = {
  VIREMENT: 'Virement bancaire',
  CHEQUE: 'Chèque',
  ESPECES: 'Espèces',
  CARTE_BANCAIRE: 'Carte bancaire',
  PRELEVEMENT: 'Prélèvement',
}

const EXTRA_PAYMENT = {
  id: 'payment-3',
  invoiceId: 'invoice-2',
  clientId: 'client-1',
  amount: 7140,
  status: 'EN_ATTENTE' as const,
  method: 'VIREMENT' as const,
  receiptNumber: undefined as string | undefined,
  simulatedAt: undefined as Date | undefined,
  createdAt: new Date('2024-06-25'),
}

const ALL_PAYMENTS = [...MOCK_PAYMENTS, EXTRA_PAYMENT]

const PAYMENT_METHODS = [
  { value: 'VIREMENT', label: 'Virement bancaire' },
  { value: 'CHEQUE', label: 'Chèque' },
  { value: 'ESPECES', label: 'Espèces' },
  { value: 'CARTE_BANCAIRE', label: 'Carte bancaire' },
  { value: 'PRELEVEMENT', label: 'Prélèvement automatique' },
]

function getClientName(clientId: string): string {
  const c = MOCK_CLIENTS.find((x) => x.id === clientId)
  return c ? `${c.firstName} ${c.lastName}` : '—'
}

function getInvoiceNumber(invoiceId: string): string {
  const inv = MOCK_INVOICES.find((x) => x.id === invoiceId)
  return inv ? inv.number : '—'
}

function paymentStatusClass(status: string): string {
  switch (status) {
    case 'REUSSI': return 'bg-green-100 text-green-700'
    case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-700'
    case 'REFUSE': return 'bg-red-100 text-red-700'
    case 'EXPIRE': return 'bg-gray-100 text-gray-500'
    case 'REMBOURSE': return 'bg-blue-100 text-blue-700'
    default: return 'bg-gray-100 text-gray-600'
  }
}

// CSS-based fake QR code
function FakeQRCode() {
  const filledCells = [0, 2, 4, 7, 9, 14, 21, 23, 28, 35, 37, 42, 44, 46, 48]
  return (
    <div className="w-32 h-32 bg-white border-2 border-gray-800 p-2 mx-auto">
      <div className="w-full h-full grid grid-cols-7 gap-0.5">
        {Array.from({ length: 49 }).map((_, i) => (
          <div
            key={i}
            className={filledCells.includes(i) ? 'bg-gray-900' : 'bg-white'}
          />
        ))}
      </div>
    </div>
  )
}

type SuccessReceipt = {
  receiptNumber: string
  amount: number
  method: string
}

export default function PaymentsPage() {
  const pendingInvoices = MOCK_INVOICES.filter(
    (i) => i.status !== 'PAYEE' && (i.status as string) !== 'ANNULEE'
  )

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(pendingInvoices[0]?.id ?? '')
  const [amount, setAmount] = useState(() => {
    const inv = pendingInvoices[0]
    return inv ? String(inv.totalTTC - inv.amountPaid) : ''
  })
  const [method, setMethod] = useState('VIREMENT')
  const [successReceipt, setSuccessReceipt] = useState<SuccessReceipt | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)

  function handleInvoiceSelect(id: string) {
    setSelectedInvoiceId(id)
    const inv = MOCK_INVOICES.find((i) => i.id === id)
    if (inv) setAmount(String(inv.totalTTC - inv.amountPaid))
  }

  function handleSimulate() {
    const date = new Date()
    const d = date.toISOString().slice(2, 10).replace(/-/g, '')
    const rnd = Math.floor(Math.random() * 900) + 100
    const receipt = `REC-${d}-${rnd}`
    setSuccessReceipt({ receiptNumber: receipt, amount: Number(amount), method })
  }

  function handleCopyLink() {
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const payLink = `https://pay.ecopye.fr/sim/${selectedInvoiceId}`

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paiements &amp; Encaissements</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gérez et simulez vos encaissements</p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
          ⚠ Simulation — données fictives
        </span>
      </div>

      {/* Intro banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex items-center gap-3 text-blue-800 text-sm">
        <Wallet className="w-5 h-5 flex-shrink-0 text-blue-600" />
        <span>
          <strong>Simulateur de paiement</strong> — Testez les différents modes d&apos;encaissement sans aucune transaction réelle.
        </span>
      </div>

      {/* Two-column simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Simulator form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            Simulateur de paiement
          </h2>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Facture à encaisser</label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => handleInvoiceSelect(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {pendingInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.number} — {formatCurrency(inv.totalTTC - inv.amountPaid)} restant
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Montant à encaisser (€)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Mode de paiement</label>
            <div className="grid grid-cols-1 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.value}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    method === m.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payMethod"
                    value={m.value}
                    checked={method === m.value}
                    onChange={() => setMethod(m.value)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    {METHOD_ICONS[m.value]} {m.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleSimulate}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Simuler le paiement
          </button>
        </div>

        {/* RIGHT: QR Code / Link */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Lien de paiement simulé</h2>

          <div className="bg-gray-50 rounded-lg p-4 text-center space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">QR Code de paiement</p>
            <FakeQRCode />
            <p className="text-xs text-gray-400">Scan pour payer (simulation)</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Lien de paiement</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 truncate">
                {payLink}
              </code>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => alert('Partage simulé — ' + payLink)}
              className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Partager le lien
            </button>
            <button
              onClick={handleCopyLink}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                linkCopied
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <Copy className="w-4 h-4" />
              {linkCopied ? 'Lien copié !' : 'Copier le lien'}
            </button>
          </div>
        </div>
      </div>

      {/* Payment history table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Historique des paiements</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Date', 'Facture', 'Client', 'Montant', 'Méthode', 'Statut', 'Reçu'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ALL_PAYMENTS.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600">
                    {p.simulatedAt ? formatDate(p.simulatedAt) : formatDate(p.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {p.invoiceId ? getInvoiceNumber(p.invoiceId) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {getClientName(p.clientId)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {METHOD_ICONS[p.method]} {METHOD_LABELS[p.method] ?? p.method}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatusClass(p.status)}`}>
                      {PAYMENT_STATUS_LABELS[p.status as keyof typeof PAYMENT_STATUS_LABELS] ?? p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                    {p.receiptNumber ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Success Modal */}
      {successReceipt && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center space-y-4">
            <button
              onClick={() => setSuccessReceipt(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">Paiement simulé !</p>
              <p className="text-sm text-gray-500 mt-1">Encaissement enregistré avec succès</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-left">
              <div className="flex justify-between">
                <span className="text-gray-500">Montant</span>
                <span className="font-semibold text-gray-900">{formatCurrency(successReceipt.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Méthode</span>
                <span className="text-gray-700">{METHOD_ICONS[successReceipt.method]} {METHOD_LABELS[successReceipt.method]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">N° reçu</span>
                <span className="font-mono text-gray-900 text-xs">{successReceipt.receiptNumber}</span>
              </div>
            </div>
            <button
              onClick={() => setSuccessReceipt(null)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
