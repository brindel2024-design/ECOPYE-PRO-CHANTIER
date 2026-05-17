import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Star,
  FileText,
  FolderKanban,
  Receipt,
  Plus,
  Edit,
} from 'lucide-react'
import { MOCK_CLIENTS, MOCK_QUOTES, MOCK_PROJECTS, MOCK_INVOICES } from '@/lib/mock-data'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { QUOTE_STATUS_LABELS, INVOICE_STATUS_LABELS, PROJECT_STATUS_LABELS } from '@/lib/types'

interface Props {
  params: { id: string }
}

export default function ClientDetailPage({ params }: Props) {
  const client = MOCK_CLIENTS.find((c) => c.id === params.id)
  if (!client) notFound()

  const clientQuotes = MOCK_QUOTES.filter((q) => q.clientId === client.id)
  const clientProjects = MOCK_PROJECTS.filter((p) => p.clientId === client.id)
  const clientInvoices = MOCK_INVOICES.filter((i) => i.clientId === client.id)

  const totalFacture = clientInvoices.reduce((s, i) => s + i.totalTTC, 0)
  const totalPaye = clientInvoices.reduce((s, i) => s + i.amountPaid, 0)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Retour */}
      <Link href="/app/clients" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Retour aux clients
      </Link>

      {/* Header client */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
              {client.firstName[0]}{client.lastName[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {client.firstName} {client.lastName}
              </h1>
              <p className="text-sm text-gray-500">
                {client.type === 'PARTICULIER' ? 'Client particulier' : 'Client professionnel'}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < client.trustScore ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                  />
                ))}
                <span className="ml-1 text-xs text-gray-500">Score de confiance: {client.trustScore}/10</span>
              </div>
            </div>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
            <Edit className="h-4 w-4" />
            Modifier
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4 text-gray-400" />
            {client.email}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4 text-gray-400" />
            {client.phone}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400" />
            {client.address}, {client.city} {client.postalCode}
          </div>
        </div>

        {client.notes && (
          <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-100 px-4 py-3">
            <p className="text-xs font-medium text-yellow-700">📌 Note interne</p>
            <p className="text-sm text-yellow-800 mt-0.5">{client.notes}</p>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{clientQuotes.length}</p>
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

      {/* Tabs: Devis */}
      <div className="rounded-xl border border-gray-200 bg-white mb-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Devis ({clientQuotes.length})</h2>
          </div>
          <Link href={`/app/quotes/new?clientId=${client.id}`} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
            <Plus className="h-3 w-3" />Nouveau devis
          </Link>
        </div>
        {clientQuotes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Aucun devis pour ce client</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {clientQuotes.map((q) => (
              <Link key={q.id} href={`/app/quotes/${q.id}`} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{q.number}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{q.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(q.totalTTC)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(q.status)}`}>
                    {QUOTE_STATUS_LABELS[q.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Chantiers */}
      <div className="rounded-xl border border-gray-200 bg-white mb-4">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
          <FolderKanban className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Chantiers ({clientProjects.length})</h2>
        </div>
        {clientProjects.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Aucun chantier pour ce client</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {clientProjects.map((p) => (
              <Link key={p.id} href={`/app/projects/${p.id}`} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.city}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(p.plannedBudget)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(p.status)}`}>
                    {PROJECT_STATUS_LABELS[p.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Factures */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
          <Receipt className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Factures ({clientInvoices.length})</h2>
        </div>
        {clientInvoices.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Aucune facture pour ce client</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {clientInvoices.map((inv) => (
              <Link key={inv.id} href={`/app/invoices/${inv.id}`} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{inv.number}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Émise le {formatDate(inv.issuedAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(inv.totalTTC)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(inv.status)}`}>
                    {INVOICE_STATUS_LABELS[inv.status]}
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
