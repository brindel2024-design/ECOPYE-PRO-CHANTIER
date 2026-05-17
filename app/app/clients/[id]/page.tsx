'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Phone, Mail, MapPin, Star, FileText, FolderKanban,
  Receipt, Plus, Loader2,
} from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { QUOTE_STATUS_LABELS, INVOICE_STATUS_LABELS, PROJECT_STATUS_LABELS } from '@/lib/types'
import type { QuoteStatus } from '@/lib/types'

interface ClientData {
  id: string; type: string; firstName: string; lastName: string
  companyName: string | null; email: string; phone: string
  address: string; city: string; postalCode: string
  notes: string | null; trustScore: number; active: boolean
  quotes: Array<{ id: string; number: string; title: string; status: string; totalTTC: number; createdAt: string }>
  invoices: Array<{ id: string; number: string; type: string; status: string; totalTTC: number; amountPaid: number; issuedAt: string }>
  projects: Array<{ id: string; title: string; status: string; city: string; plannedBudget: number }>
}

export default function ClientDetailPage() {
  const params = useParams()
  const id = params?.id as string

  const [client, setClient] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/clients/${id}`)
    if (res.ok) { const d = await res.json(); setClient(d.data) }
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
  }

  if (!client) {
    return (
      <div className="p-6">
        <Link href="/app/clients" className="text-blue-600 hover:underline text-sm flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
        <p className="text-gray-500">Client introuvable.</p>
      </div>
    )
  }

  const totalFacture = client.invoices.reduce((s, i) => s + i.totalTTC, 0)
  const totalPaye = client.invoices.reduce((s, i) => s + i.amountPaid, 0)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link href="/app/clients" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4" />Retour aux clients
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
              {client.firstName[0]}{client.lastName[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{client.firstName} {client.lastName}</h1>
              {client.companyName && <p className="text-sm text-gray-500">{client.companyName}</p>}
              <p className="text-sm text-gray-500">
                {client.type === 'PARTICULIER' ? 'Client particulier' : 'Client professionnel'}
              </p>
              <div className="flex items-center gap-0.5 mt-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < client.trustScore ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                ))}
                <span className="ml-1 text-xs text-gray-500">Score de confiance: {client.trustScore}/10</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2 text-sm text-gray-600"><Mail className="h-4 w-4 text-gray-400" />{client.email}</div>
          <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="h-4 w-4 text-gray-400" />{client.phone}</div>
          <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="h-4 w-4 text-gray-400" />{client.address}, {client.city} {client.postalCode}</div>
        </div>

        {client.notes && (
          <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-100 px-4 py-3">
            <p className="text-xs font-medium text-yellow-700">Note interne</p>
            <p className="text-sm text-yellow-800 mt-0.5">{client.notes}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{client.quotes.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Devis</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalFacture)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Facturé au total</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className={`text-2xl font-bold ${totalFacture - totalPaye > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(totalFacture - totalPaye)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Reste à payer</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white mb-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Devis ({client.quotes.length})</h2>
          </div>
          <Link href={`/app/quotes/new?clientId=${client.id}`} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
            <Plus className="h-3 w-3" />Nouveau devis
          </Link>
        </div>
        {client.quotes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Aucun devis pour ce client</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {client.quotes.map((q) => (
              <Link key={q.id} href={`/app/quotes/${q.id}`} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{q.number}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{q.title} · {formatDate(q.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(q.totalTTC)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(q.status)}`}>
                    {QUOTE_STATUS_LABELS[q.status as QuoteStatus] ?? q.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white mb-4">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
          <FolderKanban className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Chantiers ({client.projects.length})</h2>
        </div>
        {client.projects.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Aucun chantier pour ce client</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {client.projects.map((p) => (
              <Link key={p.id} href={`/app/projects/${p.id}`} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.city}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(p.plannedBudget)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(p.status)}`}>
                    {PROJECT_STATUS_LABELS[p.status as keyof typeof PROJECT_STATUS_LABELS] ?? p.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
          <Receipt className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Factures ({client.invoices.length})</h2>
        </div>
        {client.invoices.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Aucune facture pour ce client</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {client.invoices.map((inv) => (
              <Link key={inv.id} href={`/app/invoices/${inv.id}`} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{inv.number}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Émise le {formatDate(inv.issuedAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(inv.totalTTC)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(inv.status)}`}>
                    {INVOICE_STATUS_LABELS[inv.status as keyof typeof INVOICE_STATUS_LABELS] ?? inv.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
