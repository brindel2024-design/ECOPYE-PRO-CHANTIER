'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

interface CompanyMini {
  siret: string | null
  address: string
  postalCode: string
}

export function ProfileIncompleteBanner() {
  const [c, setC] = useState<CompanyMini | null>(null)

  useEffect(() => {
    fetch('/api/company')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.data) setC({ siret: j.data.siret ?? null, address: j.data.address ?? '', postalCode: j.data.postalCode ?? '' })
      })
      .catch(() => {})
  }, [])

  if (!c) return null

  const missing: string[] = []
  if (!c.siret) missing.push('SIRET')
  if (!c.address) missing.push('adresse')
  if (!c.postalCode) missing.push('code postal')

  if (missing.length === 0) return null

  return (
    <div className="bg-orange-50 border-b border-orange-200 px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2 flex-1 min-w-0 text-orange-900">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 text-orange-600" />
        <p className="truncate">
          Profil entreprise incomplet ({missing.join(', ')}) — les devis et factures ne pourront pas être envoyés tant que ces informations légales obligatoires manquent.
        </p>
      </div>
      <Link
        href="/app/settings"
        className="bg-white hover:bg-gray-50 border border-orange-300 px-3 py-1 rounded-md text-xs font-semibold text-orange-900 flex-shrink-0"
      >
        Compléter
      </Link>
    </div>
  )
}
