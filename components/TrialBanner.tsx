'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, X } from 'lucide-react'

interface BillingMini {
  status: string
  trialDaysLeft: number | null
  trialExpired: boolean
  hasStripeSubscription: boolean
}

export function TrialBanner() {
  const [b, setB] = useState<BillingMini | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch('/api/billing/me')
      .then((r) => r.ok ? r.json() : { data: null })
      .then((j) => setB(j.data))
      .catch(() => setB(null))
  }, [])

  if (!b || dismissed) return null

  // Cas 1 : essai en cours, peu de jours restants
  const showTrialWarn =
    b.status === 'ESSAI' &&
    !b.hasStripeSubscription &&
    typeof b.trialDaysLeft === 'number' &&
    b.trialDaysLeft > 0 &&
    b.trialDaysLeft <= 7

  // Cas 2 : essai expiré
  const showTrialExpired = b.trialExpired

  // Cas 3 : suspension paiement
  const showSuspended = b.status === 'SUSPENDU'

  if (!showTrialWarn && !showTrialExpired && !showSuspended) return null

  let bg = 'bg-yellow-50 border-yellow-300 text-yellow-900'
  let icon = 'text-yellow-600'
  let message = ''
  if (showTrialExpired) {
    bg = 'bg-red-50 border-red-300 text-red-900'
    icon = 'text-red-600'
    message = 'Votre essai gratuit est terminé. Souscrivez un abonnement pour continuer.'
  } else if (showSuspended) {
    bg = 'bg-red-50 border-red-300 text-red-900'
    icon = 'text-red-600'
    message = 'Paiement en échec. Mettez à jour votre moyen de paiement pour réactiver vos fonctions.'
  } else if (showTrialWarn) {
    message = `Votre essai gratuit prend fin dans ${b.trialDaysLeft} jour(s). Souscrivez pour ne rien perdre.`
  }

  return (
    <div className={`border-b ${bg} px-4 py-2.5 flex items-center justify-between gap-3 text-sm`}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${icon}`} />
        <p className="truncate">{message}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href="/app/settings/billing"
          className="bg-white hover:bg-gray-50 border border-current/30 px-3 py-1 rounded-md text-xs font-semibold"
        >
          {showSuspended ? 'Régulariser' : 'Choisir une formule'}
        </Link>
        {showTrialWarn && (
          <button
            onClick={() => setDismissed(true)}
            className="opacity-70 hover:opacity-100"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
