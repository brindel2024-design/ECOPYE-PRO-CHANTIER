'use client'

import { useEffect, useState } from 'react'
import { Link2, Copy, Check, CheckCircle2, Send } from 'lucide-react'

interface QuoteMini {
  publicToken: string | null
  status: string
  signedAt: string | null
  signerName: string | null
}

export function QuotePortalCard({ quoteId }: { quoteId: string }) {
  const [q, setQ] = useState<QuoteMini | null>(null)
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
    let active = true
    fetch(`/api/quotes/${quoteId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (active && j?.data) {
          setQ({
            publicToken: j.data.publicToken ?? null,
            status: j.data.status,
            signedAt: j.data.signedAt ?? null,
            signerName: j.data.signerName ?? null,
          })
        }
      })
      .catch(() => {})
    return () => { active = false }
  }, [quoteId])

  if (!q) return null

  const link = q.publicToken ? `${origin}/client-portal/${q.publicToken}` : null

  async function copy() {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-2">
        <Link2 className="h-4 w-4 text-blue-600" />
        <h2 className="text-sm font-semibold text-gray-900">Portail client — signature en ligne</h2>
      </div>

      {q.signedAt ? (
        <div className="flex items-start gap-2 rounded-lg bg-green-50 border border-green-100 px-3 py-2 text-sm text-green-900">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-green-600" />
          <span>Devis <strong>signé</strong> par {q.signerName} le {new Date(q.signedAt).toLocaleString('fr-FR')}.</span>
        </div>
      ) : link ? (
        <>
          <p className="text-xs text-gray-500 mb-2">Envoyez ce lien à votre client pour qu&apos;il consulte et <strong>signe le devis en ligne</strong> :</p>
          <div className="flex items-center gap-2">
            <input readOnly value={link} className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700" />
            <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs font-medium shrink-0">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copié' : 'Copier'}
            </button>
          </div>
        </>
      ) : (
        <p className="flex items-center gap-2 text-xs text-gray-500">
          <Send className="h-3.5 w-3.5 text-gray-400" />
          Le lien de signature client sera généré dès que vous <strong>envoyez</strong> le devis.
        </p>
      )}
    </div>
  )
}
