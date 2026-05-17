'use client'

import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'

export function PwaInstallButton() {
  const [prompt, setPrompt] = useState<any>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (installed) {
    return (
      <span className="inline-flex items-center gap-2 rounded-xl border border-green-400/40 bg-green-500/10 px-6 py-3.5 text-sm font-semibold text-green-300">
        ✓ Application installée
      </span>
    )
  }

  if (!prompt) {
    return (
      <span className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-medium text-slate-400 cursor-default select-none">
        <Download className="h-4 w-4" />
        Installer l&apos;app (ouvrir depuis Chrome)
      </span>
    )
  }

  return (
    <button
      onClick={async () => {
        prompt.prompt()
        const { outcome } = await prompt.userChoice
        if (outcome === 'accepted') setInstalled(true)
        setPrompt(null)
      }}
      className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-all shadow-lg"
    >
      <Download className="h-4 w-4" />
      Installer l&apos;application
    </button>
  )
}
