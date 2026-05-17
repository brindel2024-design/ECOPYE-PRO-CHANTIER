import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  XCircle,
  Download,
  FolderKanban,
  ArrowRight,
} from 'lucide-react'
import { MOCK_QUOTES, MOCK_CLIENTS, MOCK_COMPANY } from '@/lib/mock-data'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { QUOTE_STATUS_LABELS } from '@/lib/types'

interface Props {
  params: { id: string }
}

export default function QuoteDetailPage({ params }: Props) {
  const quote = MOCK_QUOTES.find((q) => q.id === params.id)
  if (!quote) notFound()

  const client = MOCK_CLIENTS.find((c) => c.id === quote.clientId)
  const depositAmount = quote.totalTTC * (quote.depositPercentage / 100)
  const soldAmount = quote.totalTTC - depositAmount

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link href="/app/quotes" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4" />Retour aux devis
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{quote.number}</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(quote.status)}`}>
              {QUOTE_STATUS_LABELS[quote.status]}
            </span>
          </div>
          <p className="text-sm text-gray-500">{quote.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            <Download className="h-4 w-4" />PDF fictif
          </button>
          {quote.status === 'BROUILLON' && (
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <Send className="h-4 w-4" />Envoyer au client
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Détails devis */}
        <div className="lg:col-span-2 space-y-5">
          {/* En-tête devis */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex justify-between mb-6">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase mb-1">Émetteur</p>
                <p className="text-sm font-semibold text-gray-900">{MOCK_COMPANY.name}</p>
                <p className="text-xs text-gray-500">{MOCK_COMPANY.address}</p>
                <p className="text-xs text-gray-500">{MOCK_COMPANY.postalCode} {MOCK_COMPANY.city}</p>
                <p className="text-xs text-gray-500">SIRET: {MOCK_COMPANY.siret}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-medium uppercase mb-1">Client</p>
                {client && (
                  <>
                    <p className="text-sm font-semibold text-gray-900">{client.firstName} {client.lastName}</p>
                    <p className="text-xs text-gray-500">{client.address}</p>
                    <p className="text-xs text-gray-500">{client.postalCode} {client.city}</p>
                    <p className="text-xs text-gray-500">{client.email}</p>
                  </>
                )}
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4 grid grid-cols-3 gap-4 text-xs text-gray-500">
              <div>
                <p className="font-medium text-gray-400">Date création</p>
                <p className="text-gray-700">{formatDate(quote.createdAt)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-400">Expire le</p>
                <p className="text-gray-700">{formatDate(quote.expiresAt)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-400">Acompte demandé</p>
                <p className="text-gray-700">{quote.depositPercentage}%</p>
              </div>
            </div>
          </div>

          {/* Lignes (simulées) */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
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
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">Dépose et évacuation ancienne installation</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">1</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">450 €</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">20%</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">450 €</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">Main-d&apos;œuvre installation et finitions</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">1</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">{formatCurrency(quote.laborCost)}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">20%</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{formatCurrency(quote.laborCost)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">Fourniture matériaux et équipements</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">1</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">{formatCurrency(quote.materialCost)}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">20%</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{formatCurrency(quote.materialCost)}</td>
                </tr>
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-sm font-medium text-right text-gray-700">Sous-total HT</td>
                  <td className="px-4 py-2 text-sm font-bold text-right text-gray-900">{formatCurrency(quote.subtotalHT)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-sm font-medium text-right text-gray-700">TVA (20%)</td>
                  <td className="px-4 py-2 text-sm font-bold text-right text-gray-900">{formatCurrency(quote.vatAmount)}</td>
                </tr>
                <tr className="bg-blue-50">
                  <td colSpan={4} className="px-4 py-3 text-base font-bold text-right text-gray-900">Total TTC</td>
                  <td className="px-4 py-3 text-base font-bold text-right text-blue-700">{formatCurrency(quote.totalTTC)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Conditions de paiement */}
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
        </div>

        {/* Actions latérales */}
        <div className="space-y-4">
          {/* Statut et actions */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              {quote.status === 'ACCEPTE' ? (
                <div className="rounded-lg bg-green-50 border border-green-100 p-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-green-800">Devis accepté</p>
                    <p className="text-xs text-green-600">{formatDate(quote.acceptedAt)}</p>
                  </div>
                </div>
              ) : null}

              {quote.status === 'ACCEPTE' && (
                <Link
                  href="/app/projects"
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <FolderKanban className="h-4 w-4" />
                  Créer le chantier
                </Link>
              )}

              {quote.status === 'BROUILLON' && (
                <>
                  <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                    <Send className="h-4 w-4" />Envoyer au client
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    <Download className="h-4 w-4" />Télécharger PDF
                  </button>
                </>
              )}

              {(quote.status === 'ENVOYE' || quote.status === 'VU') && (
                <>
                  <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700">
                    <CheckCircle2 className="h-4 w-4" />Marquer accepté
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-100 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-200">
                    <XCircle className="h-4 w-4" />Marquer refusé
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Infos client */}
          {client && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Client</h3>
              <Link href={`/app/clients/${client.id}`} className="group flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {client.firstName[0]}{client.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                    {client.firstName} {client.lastName}
                  </p>
                  <p className="text-xs text-gray-400">{client.city}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-600" />
              </Link>
            </div>
          )}

          <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
            <p className="text-xs text-amber-700">⚠ Simulation — aucun envoi réel, aucune signature réelle</p>
          </div>
        </div>
      </div>
    </div>
  )
}
