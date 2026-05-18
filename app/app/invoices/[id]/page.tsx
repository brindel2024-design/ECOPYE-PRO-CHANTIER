'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, AlertTriangle, Download, Mail, CreditCard, CheckCircle, X, Loader2,
} from 'lucide-react'
import { INVOICE_STATUS_LABELS } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'

const TYPE_LABELS: Record<string, string> = {
  ACOMPTE: 'Acompte', FINALE: 'Facture finale', INTERMEDIAIRE: 'Intermédiaire', AVOIR: 'Avoir',
}

const STATUS_BADGE: Record<string, string> = {
  PAYEE: 'bg-green-100 text-green-700',
  EN_ATTENTE: 'bg-yellow-100 text-yellow-700',
  EN_RETARD: 'bg-red-100 text-red-700',
  ENVOYEE: 'bg-blue-100 text-blue-700',
  BROUILLON: 'bg-gray-100 text-gray-600',
  ANNULEE: 'bg-gray-100 text-gray-500',
}

const PAYMENT_METHODS = [
  { value: 'CARTE', label: 'Carte bancaire (paiement en ligne)' },
  { value: 'VIREMENT', label: 'Virement bancaire (déjà reçu)' },
  { value: 'CHEQUE', label: 'Chèque (déjà reçu)' },
  { value: 'ESPECES', label: 'Espèces (déjà reçues)' },
]

interface InvoiceLine {
  id: string; label: string; quantity: number; unit: string
  unitPriceHT: number; vatRate: number; totalHT: number; order: number
}

interface InvoiceData {
  id: string; number: string; type: string; status: string
  issuedAt: string; dueDate: string | null
  subtotalHT: number; vatAmount: number; totalTTC: number; amountPaid: number
  notes: string | null
  client: { id: string; firstName: string; lastName: string; email: string; phone: string; address: string; city: string }
  lines: InvoiceLine[]
}

interface CompanyData {
  name: string; siret: string; address: string; city: string; phone: string; email: string
  vatNumber: string; insuranceNumber: string
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const id = params?.id as string

  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('CARTE')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    const [iRes, cRes] = await Promise.all([
      fetch(`/api/invoices/${id}`),
      fetch('/api/company'),
    ])
    if (iRes.ok) { const d = await iRes.json(); setInvoice(d.data) }
    if (cRes.ok) { const d = await cRes.json(); setCompany(d.data) }
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    if (q.get('paid') === '1') {
      showToast('Paiement par carte reçu — facture mise à jour')
      window.history.replaceState({}, '', window.location.pathname)
    } else if (q.get('canceled') === '1') {
      showToast('Paiement annulé')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  async function handlePayment() {
    if (!invoice) return
    setPaymentLoading(true)

    if (paymentMethod === 'CARTE') {
      const res = await fetch(`/api/invoices/${id}/checkout`, { method: 'POST' })
      const json = await res.json().catch(() => ({}))
      setPaymentLoading(false)
      if (res.ok && json.url) {
        window.location.href = json.url
      } else {
        showToast(json.error || 'Paiement par carte indisponible')
      }
      return
    }

    const res = await fetch(`/api/invoices/${id}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(paymentAmount), method: paymentMethod }),
    })
    setPaymentLoading(false)
    if (res.ok) {
      setPaymentSuccess(true)
      setTimeout(() => {
        setPaymentSuccess(false)
        setShowPaymentModal(false)
        load()
        showToast('Paiement enregistré avec succès')
      }, 1800)
    } else {
      showToast('Erreur lors de l\'enregistrement du paiement')
    }
  }

  async function handleDownloadPdf() {
    if (!invoice || !company) return
    const { generateInvoicePdf } = await import('@/lib/generate-pdf')
    await generateInvoicePdf({
      number: invoice.number,
      type: invoice.type,
      issuedAt: invoice.issuedAt,
      dueDate: invoice.dueDate,
      client: {
        firstName: invoice.client.firstName,
        lastName: invoice.client.lastName,
        email: invoice.client.email,
        phone: invoice.client.phone,
        address: invoice.client.address,
        city: invoice.client.city,
      },
      company: {
        name: company.name,
        siret: company.siret,
        address: company.address,
        city: company.city,
        phone: company.phone,
        email: company.email,
        vatNumber: company.vatNumber || null,
        insuranceNumber: company.insuranceNumber || null,
      },
      lines: invoice.lines.map(l => ({
        label: l.label,
        quantity: l.quantity,
        unit: l.unit,
        unitPriceHT: l.unitPriceHT,
        vatRate: l.vatRate,
        totalHT: l.totalHT,
      })),
      subtotalHT: invoice.subtotalHT,
      vatAmount: invoice.vatAmount,
      totalTTC: invoice.totalTTC,
      amountPaid: invoice.amountPaid,
      notes: invoice.notes,
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <Link href="/app/invoices" className="text-blue-600 hover:underline text-sm flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour aux factures
        </Link>
        <p className="text-gray-500">Facture introuvable.</p>
      </div>
    )
  }

  const resteAPayer = invoice.totalTTC - invoice.amountPaid
  const isLate = invoice.status === 'EN_RETARD'
  const daysLate = isLate && invoice.dueDate
    ? Math.ceil((new Date().getTime() - new Date(invoice.dueDate).getTime()) / 86400000)
    : 0

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />{toast}
        </div>
      )}

      <Link href="/app/invoices" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1.5">
        <ArrowLeft className="w-4 h-4" />Retour aux factures
      </Link>

      {isLate && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-2 text-red-700 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Cette facture est en retard de {daysLate} jour{daysLate > 1 ? 's' : ''} — Envoyez une relance au client
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
        <div className="grid grid-cols-2 gap-8">
          <div>
            {company && (
              <>
                <p className="text-lg font-bold text-gray-900">{company.name}</p>
                <p className="text-sm text-gray-500 mt-1">SIRET : {company.siret}</p>
                <p className="text-sm text-gray-500">{company.address}</p>
                <p className="text-sm text-gray-500">{company.city}</p>
                <p className="text-sm text-gray-500">{company.phone}</p>
                <p className="text-sm text-gray-500">{company.email}</p>
                {company.vatNumber && <p className="text-sm text-gray-500">TVA : {company.vatNumber}</p>}
              </>
            )}
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-gray-900 tracking-tight">FACTURE</p>
            <p className="text-lg font-semibold text-blue-600 mt-1">{invoice.number}</p>
            <div className="mt-3 space-y-1 text-sm text-gray-500">
              <p>Date d&apos;émission : <span className="text-gray-700 font-medium">{formatDate(invoice.issuedAt)}</span></p>
              <p>Date d&apos;échéance : <span className={`font-medium ${isLate ? 'text-red-600' : 'text-gray-700'}`}>{invoice.dueDate ? formatDate(invoice.dueDate) : '—'}</span></p>
            </div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[invoice.type === 'ACOMPTE' ? 'ENVOYEE' : invoice.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {TYPE_LABELS[invoice.type] ?? invoice.type}
              </span>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[invoice.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {INVOICE_STATUS_LABELS[invoice.status as keyof typeof INVOICE_STATUS_LABELS] ?? invoice.status}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Facturée à :</p>
          <p className="font-semibold text-gray-900">{invoice.client.firstName} {invoice.client.lastName}</p>
          <p className="text-sm text-gray-600">{invoice.client.address}</p>
          <p className="text-sm text-gray-600">{invoice.client.city}</p>
          <p className="text-sm text-gray-500">{invoice.client.email}</p>
        </div>

        <div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 text-gray-600 font-semibold">Désignation</th>
                <th className="text-right py-2 text-gray-600 font-semibold w-16">Qté</th>
                <th className="text-right py-2 text-gray-600 font-semibold w-20">Unité</th>
                <th className="text-right py-2 text-gray-600 font-semibold w-28">P.U. HT</th>
                <th className="text-right py-2 text-gray-600 font-semibold w-28">TVA</th>
                <th className="text-right py-2 text-gray-600 font-semibold w-28">Total HT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.lines.map((line) => (
                <tr key={line.id}>
                  <td className="py-3 text-gray-800">{line.label}</td>
                  <td className="py-3 text-right text-gray-600">{line.quantity}</td>
                  <td className="py-3 text-right text-gray-600">{line.unit}</td>
                  <td className="py-3 text-right text-gray-700">{formatCurrency(line.unitPriceHT)}</td>
                  <td className="py-3 text-right text-gray-600">{line.vatRate}%</td>
                  <td className="py-3 text-right font-medium text-gray-900">{formatCurrency(line.totalHT)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total HT</span><span>{formatCurrency(invoice.subtotalHT)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>TVA</span><span>{formatCurrency(invoice.vatAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2">
              <span>Total TTC</span><span>{formatCurrency(invoice.totalTTC)}</span>
            </div>
            {invoice.amountPaid > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Déjà payé</span><span>- {formatCurrency(invoice.amountPaid)}</span>
              </div>
            )}
            {resteAPayer > 0.01 && (
              <div className="flex justify-between font-bold text-blue-700 border-t border-gray-200 pt-2">
                <span>Reste à payer</span><span>{formatCurrency(resteAPayer)}</span>
              </div>
            )}
          </div>
        </div>

        {invoice.notes && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">Notes</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleDownloadPdf}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Download className="w-4 h-4" />Télécharger PDF
        </button>
        <button
          onClick={() => showToast('Email envoyé au client (simulation)')}
          className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Mail className="w-4 h-4" />Envoyer par email
        </button>
        {invoice.status !== 'PAYEE' && (
          <button
            onClick={() => { setPaymentAmount(String(Math.round(resteAPayer * 100) / 100)); setShowPaymentModal(true) }}
            className="border border-green-200 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />Enregistrer paiement
          </button>
        )}
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            {paymentSuccess ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-lg font-semibold text-gray-900">Paiement enregistré !</p>
                <p className="text-sm text-gray-500 text-center">Le paiement de {formatCurrency(Number(paymentAmount))} a été enregistré avec succès.</p>
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
                          <input type="radio" name="method" value={m.value}
                            checked={paymentMethod === m.value}
                            onChange={() => setPaymentMethod(m.value)}
                            className="accent-blue-600" />
                          <span className="text-sm text-gray-700">{m.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Montant (€)</label>
                    <input type="number" value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <button onClick={handlePayment} disabled={paymentLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                  {paymentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Confirmer le paiement
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
