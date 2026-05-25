'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Send, CheckCircle2, XCircle, Download, FolderKanban, ArrowRight, Loader2, Trash2,
} from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { QUOTE_STATUS_LABELS } from '@/lib/types'
import type { QuoteStatus } from '@/lib/types'

interface QuoteLine {
  id: string; label: string; quantity: number; unit: string
  unitPriceHT: number; vatRate: number; totalHT: number; order: number
}

interface QuoteData {
  id: string; number: string; title: string; status: string
  createdAt: string; expiresAt: string | null; depositPercentage: number
  subtotalHT: number; vatAmount: number; totalTTC: number; notes: string | null
  sentAt: string | null; acceptedAt: string | null
  client: { id: string; firstName: string; lastName: string; email: string; phone: string; address: string; city: string }
  lines: QuoteLine[]
}

interface CompanyData {
  name: string; siret: string | null; address: string; city: string; phone: string; email: string
}

export default function QuoteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [quote, setQuote] = useState<QuoteData | null>(null)
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const load = useCallback(async () => {
    setLoading(true)
    const [qRes, cRes] = await Promise.all([
      fetch(`/api/quotes/${id}`),
      fetch('/api/company'),
    ])
    if (qRes.ok) { const d = await qRes.json(); setQuote(d.data) }
    if (cRes.ok) { const d = await cRes.json(); setCompany(d.data) }
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  async function handleSend() {
    setActionLoading(true)
    const res = await fetch(`/api/quotes/${id}/send`, { method: 'POST' })
    const j = await res.json().catch(() => ({}))
    setActionLoading(false)
    if (res.ok) { showToast('Devis marqué comme envoyé'); load() }
    else showToast(j.error || 'Erreur lors de l\'envoi', false)
  }

  async function handleDelete() {
    if (!confirm('Supprimer définitivement ce brouillon de devis ?')) return
    setActionLoading(true)
    const res = await fetch(`/api/quotes/${id}`, { method: 'DELETE' })
    if (res.ok) { router.push('/app/quotes') }
    else {
      const j = await res.json().catch(() => ({}))
      showToast(j.error || 'Suppression impossible', false)
      setActionLoading(false)
    }
  }

  async function handleStatus(status: string) {
    setActionLoading(true)
    const body: Record<string, unknown> = { status }
    if (status === 'ACCEPTE') body.acceptedAt = new Date().toISOString()
    const res = await fetch(`/api/quotes/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    setActionLoading(false)
    if (res.ok) { showToast(status === 'ACCEPTE' ? 'Devis accepté' : 'Devis refusé'); load() }
    else showToast('Erreur', false)
  }

  async function handleDownloadPdf() {
    if (!quote || !company) return
    if (!company.siret || !company.address || !company.city) {
      showToast('Profil incomplet : renseignez SIRET, adresse et ville dans Paramètres avant de générer le PDF.', false)
      return
    }
    const { generateQuotePdf } = await import('@/lib/generate-pdf')
    await generateQuotePdf({
      number: quote.number,
      title: quote.title,
      createdAt: quote.createdAt,
      expiresAt: quote.expiresAt,
      client: {
        firstName: quote.client.firstName,
        lastName: quote.client.lastName,
        email: quote.client.email,
        phone: quote.client.phone,
        address: quote.client.address,
        city: quote.client.city,
      },
      company: {
        name: company.name,
        siret: company.siret,
        address: company.address,
        city: company.city,
        phone: company.phone,
        email: company.email,
      },
      lines: quote.lines.map(l => ({
        label: l.label,
        quantity: l.quantity,
        unit: l.unit,
        unitPriceHT: l.unitPriceHT,
        vatRate: l.vatRate,
        totalHT: l.totalHT,
      })),
      subtotalHT: quote.subtotalHT,
      vatAmount: quote.vatAmount,
      totalTTC: quote.totalTTC,
      depositPercentage: quote.depositPercentage,
      notes: quote.notes,
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
  }

  if (!quote) {
    return (
      <div className="p-6">
        <Link href="/app/quotes" className="text-blue-600 hover:underline text-sm flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
        <p className="text-gray-500">Devis introuvable.</p>
      </div>
    )
  }

  const depositAmount = quote.totalTTC * (quote.depositPercentage / 100)
  const soldAmount = quote.totalTTC - depositAmount

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm text-white flex items-center gap-2 ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <Link href="/app/quotes" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4" />Retour aux devis
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{quote.number}</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(quote.status)}`}>
              {QUOTE_STATUS_LABELS[quote.status as QuoteStatus] ?? quote.status}
            </span>
          </div>
          <p className="text-sm text-gray-500">{quote.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />PDF
          </button>
          {quote.status === 'BROUILLON' && (
            <>
              <button
                onClick={handleSend}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Envoyer au client
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                aria-label="Supprimer le brouillon de devis"
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />Supprimer
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex justify-between mb-6">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase mb-1">Émetteur</p>
                {company && (
                  <>
                    <p className="text-sm font-semibold text-gray-900">{company.name}</p>
                    <p className="text-xs text-gray-500">{company.address}</p>
                    <p className="text-xs text-gray-500">{company.city}</p>
                    <p className="text-xs text-gray-500">
                      {company.siret ? `SIRET : ${company.siret}` : <span className="text-red-600 font-medium">SIRET à renseigner</span>}
                    </p>
                  </>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-medium uppercase mb-1">Client</p>
                <p className="text-sm font-semibold text-gray-900">{quote.client.firstName} {quote.client.lastName}</p>
                <p className="text-xs text-gray-500">{quote.client.address}</p>
                <p className="text-xs text-gray-500">{quote.client.city}</p>
                <p className="text-xs text-gray-500">{quote.client.email}</p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4 grid grid-cols-3 gap-4 text-xs text-gray-500">
              <div>
                <p className="font-medium text-gray-400">Date création</p>
                <p className="text-gray-700">{formatDate(quote.createdAt)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-400">Expire le</p>
                <p className="text-gray-700">{quote.expiresAt ? formatDate(quote.expiresAt) : '—'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-400">Acompte demandé</p>
                <p className="text-gray-700">{quote.depositPercentage}%</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden hidden sm:block">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Qté</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Prix unit. HT</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">TVA</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Total HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {quote.lines.map(line => (
                  <tr key={line.id}>
                    <td className="px-4 py-3 text-sm text-gray-700">{line.label}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">{line.quantity} {line.unit}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">{formatCurrency(line.unitPriceHT)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">{line.vatRate}%</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{formatCurrency(line.totalHT)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-sm font-medium text-right text-gray-700">Sous-total HT</td>
                  <td className="px-4 py-2 text-sm font-bold text-right text-gray-900">{formatCurrency(quote.subtotalHT)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-sm font-medium text-right text-gray-700">TVA</td>
                  <td className="px-4 py-2 text-sm font-bold text-right text-gray-900">{formatCurrency(quote.vatAmount)}</td>
                </tr>
                <tr className="bg-blue-50">
                  <td colSpan={4} className="px-4 py-3 text-base font-bold text-right text-gray-900">Total TTC</td>
                  <td className="px-4 py-3 text-base font-bold text-right text-blue-700">{formatCurrency(quote.totalTTC)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile : cartes verticales */}
          <div className="sm:hidden space-y-3">
            {quote.lines.map(line => (
              <div key={line.id} className="rounded-lg border border-gray-200 bg-white p-3">
                <p className="font-medium text-gray-900 text-sm mb-2">{line.label}</p>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 text-xs">
                  <span className="text-gray-500">Quantité</span>
                  <span className="text-right text-gray-700">{line.quantity} {line.unit}</span>
                  <span className="text-gray-500">Prix unitaire HT</span>
                  <span className="text-right text-gray-700">{formatCurrency(line.unitPriceHT)}</span>
                  <span className="text-gray-500">TVA</span>
                  <span className="text-right text-gray-700">{line.vatRate} %</span>
                  <span className="text-gray-600 font-medium border-t border-gray-100 pt-1.5">Total HT</span>
                  <span className="text-right font-semibold text-gray-900 border-t border-gray-100 pt-1.5">{formatCurrency(line.totalHT)}</span>
                </div>
              </div>
            ))}
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Sous-total HT</span><span className="font-medium text-gray-900">{formatCurrency(quote.subtotalHT)}</span></div>
              <div className="flex justify-between text-gray-600"><span>TVA</span><span className="font-medium text-gray-900">{formatCurrency(quote.vatAmount)}</span></div>
              <div className="flex justify-between border-t border-gray-200 pt-1.5"><span className="font-bold text-gray-900">Total TTC</span><span className="font-bold text-blue-700">{formatCurrency(quote.totalTTC)}</span></div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Conditions de paiement</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
                <p className="text-xs text-blue-600 font-medium">Acompte à la signature</p>
                <p className="text-lg font-bold text-blue-800 mt-0.5">{formatCurrency(depositAmount)}</p>
                <p className="text-xs text-blue-500">{quote.depositPercentage}% du total TTC</p>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                <p className="text-xs text-gray-600 font-medium">Solde à la réception</p>
                <p className="text-lg font-bold text-gray-800 mt-0.5">{formatCurrency(soldAmount)}</p>
                <p className="text-xs text-gray-400">{100 - quote.depositPercentage}% à la fin des travaux</p>
              </div>
            </div>
          </div>

          {quote.notes && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              {quote.status === 'ACCEPTE' && (
                <div className="rounded-lg bg-green-50 border border-green-100 p-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-green-800">Devis accepté</p>
                    {quote.acceptedAt && <p className="text-xs text-green-600">{formatDate(quote.acceptedAt)}</p>}
                  </div>
                </div>
              )}
              {quote.status === 'ACCEPTE' && (
                <Link
                  href="/app/projects/new"
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <FolderKanban className="h-4 w-4" />Créer le chantier
                </Link>
              )}
              {quote.status === 'BROUILLON' && (
                <>
                  <button
                    onClick={handleSend}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Envoyer au client
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4" />Télécharger PDF
                  </button>
                </>
              )}
              {(quote.status === 'ENVOYE' || quote.status === 'VU') && (
                <>
                  <button
                    onClick={() => handleStatus('ACCEPTE')}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />Marquer accepté
                  </button>
                  <button
                    onClick={() => handleStatus('REFUSE')}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-100 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />Marquer refusé
                  </button>
                </>
              )}
              {['BROUILLON', 'ENVOYE', 'VU', 'ACCEPTE', 'REFUSE', 'EXPIRE'].includes(quote.status) && (
                <button
                  onClick={handleDownloadPdf}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" />Télécharger PDF
                </button>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Client</h3>
            <Link href={`/app/clients/${quote.client.id}`} className="group flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {quote.client.firstName[0]}{quote.client.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                  {quote.client.firstName} {quote.client.lastName}
                </p>
                <p className="text-xs text-gray-400">{quote.client.city}</p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-600" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
