'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Building2, Phone, Mail, Lock, Loader2, CheckCircle2, AlertTriangle, PenLine } from 'lucide-react'

const euro = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
const fdate = (d: string | null | undefined) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—')

interface PortalLine { label: string; quantity: number; unit: string; unitPriceHT: number; vatRate: number; totalHT: number }
interface PortalData {
  company: { name: string; phone: string; email: string; siret: string | null; address: string; city: string; postalCode: string; insuranceNumber: string | null }
  client: { firstName: string; lastName: string }
  quote: {
    number: string; title: string; description: string | null; status: string
    subtotalHT: number; vatAmount: number; totalTTC: number; depositPercentage: number
    expiresAt: string | null; notes: string | null
    signedAt: string | null; signerName: string | null; lines: PortalLine[]
  }
}

export default function ClientPortalPage() {
  const params = useParams()
  const token = params?.token as string

  const [data, setData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [signerName, setSignerName] = useState('')
  const [accept, setAccept] = useState(false)
  const [signing, setSigning] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/portal/${token}`)
      if (!res.ok) { setNotFound(true); return }
      setData(await res.json())
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  async function handleSign() {
    setError('')
    if (!signerName.trim()) { setError('Veuillez indiquer votre nom et prénom.'); return }
    if (!accept) { setError('Cochez « Bon pour accord » pour signer.'); return }
    setSigning(true)
    try {
      const res = await fetch(`/api/portal/${token}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signerName: signerName.trim(), accept: true }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) { setError(j.error || 'Échec de la signature.'); setSigning(false); return }
      await load()
    } catch {
      setError('Erreur réseau. Réessayez.')
      setSigning(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
  }
  if (notFound || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-sm">
          <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-gray-900 mb-1">Lien indisponible</h1>
          <p className="text-sm text-gray-500">Ce lien de devis est invalide ou a expiré. Contactez votre artisan.</p>
        </div>
      </div>
    )
  }

  const { company, client, quote } = data
  const signed = Boolean(quote.signedAt)
  const deposit = (quote.totalTTC * quote.depositPercentage) / 100

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="text-sm">
            <span className="font-bold text-slate-900">{company.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <p className="text-blue-100 text-sm mb-1">Votre devis</p>
          <h1 className="text-xl font-bold mb-1">Bonjour {client.firstName} {client.lastName}</h1>
          <p className="text-blue-100 text-sm">{quote.title}</p>
        </div>

        {signed && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div className="text-sm text-green-900">
              <p className="font-semibold">Devis signé ✓</p>
              <p>Signé par <strong>{quote.signerName}</strong> le {new Date(quote.signedAt as string).toLocaleString('fr-FR')}.</p>
            </div>
          </div>
        )}

        {/* Détail du devis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">Devis {quote.number}</h2>
            <span className="text-xs text-slate-500">Valable jusqu&apos;au {fdate(quote.expiresAt)}</span>
          </div>

          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-sm min-w-[420px]">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-gray-100">
                  <th className="py-2 pr-2">Désignation</th>
                  <th className="py-2 px-2 text-right">Qté</th>
                  <th className="py-2 px-2 text-right">PU HT</th>
                  <th className="py-2 pl-2 text-right">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {quote.lines.map((l, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2 pr-2 text-slate-700">{l.label}</td>
                    <td className="py-2 px-2 text-right text-slate-600">{l.quantity} {l.unit}</td>
                    <td className="py-2 px-2 text-right text-slate-600">{euro(l.unitPriceHT)}</td>
                    <td className="py-2 pl-2 text-right font-medium text-slate-900">{euro(l.totalHT)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
            <div className="flex justify-between text-slate-600"><span>Sous-total HT</span><span>{euro(quote.subtotalHT)}</span></div>
            <div className="flex justify-between text-slate-600"><span>TVA</span><span>{euro(quote.vatAmount)}</span></div>
            <div className="flex justify-between font-bold text-slate-900 border-t border-gray-100 pt-1"><span>Total TTC</span><span className="text-blue-600">{euro(quote.totalTTC)}</span></div>
            <div className="flex justify-between text-xs text-slate-500 pt-1"><span>Acompte ({quote.depositPercentage}%)</span><span>{euro(deposit)}</span></div>
          </div>
        </div>

        {/* Signature */}
        {!signed && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-3">
              <PenLine className="h-4 w-4 text-blue-600" />
              <h2 className="text-base font-semibold text-slate-900">Signer le devis</h2>
            </div>
            <p className="text-sm text-slate-500 mb-4">Pour accepter ce devis, indiquez votre nom puis validez « Bon pour accord ». Votre signature est horodatée.</p>

            {error && (
              <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-600">
                <AlertTriangle className="h-4 w-4 shrink-0" />{error}
              </div>
            )}

            <label className="block text-xs font-medium text-slate-600 mb-1">Nom et prénom</label>
            <input
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder={`${client.firstName} ${client.lastName}`}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm mb-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <label className="flex items-start gap-2 cursor-pointer mb-4">
              <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600" />
              <span className="text-sm text-slate-600">
                Je déclare avoir pris connaissance du devis {quote.number} d&apos;un montant de <strong>{euro(quote.totalTTC)} TTC</strong> et je l&apos;accepte (« Bon pour accord »).
              </span>
            </label>
            <button
              onClick={handleSign}
              disabled={signing}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 text-sm font-semibold disabled:opacity-50"
            >
              {signing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />}
              Signer et accepter le devis
            </button>
          </div>
        )}

        {/* Coordonnées artisan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Votre artisan</h3>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-slate-400" />{company.name}{company.siret && <span className="text-xs text-slate-400">· SIRET {company.siret}</span>}</div>
            {company.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" />{company.phone}</div>}
            {company.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" />{company.email}</div>}
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-8">
        <div className="max-w-3xl mx-auto px-4 py-5 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-slate-500 text-xs">Portail client sécurisé — ECOPYE Pro Chantier</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
