'use client'

import { useState, useEffect } from 'react'
import { Download, ChevronDown } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallApp() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (installed) {
    return (
      <div className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-green-50 border border-green-100 px-4 py-2 text-sm text-green-700">
        ✓ Application installée — ouvrez-la depuis votre menu démarrer
      </div>
    )
  }

  async function handleInstall() {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setPrompt(null)
  }

  return (
    <div className="mt-5 rounded-xl bg-gray-50 border border-gray-100 p-4">
      {prompt ? (
        <button
          onClick={handleInstall}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-sm font-semibold transition-colors"
        >
          <Download className="h-4 w-4" />
          Installer l&apos;application sur cet appareil
        </button>
      ) : (
        <>
          <button
            onClick={() => setShowHelp((s) => !s)}
            className="w-full flex items-center justify-between text-left text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <span className="inline-flex items-center gap-2">
              <Download className="h-4 w-4 text-blue-600" />
              Ajouter ECOPYE Pro Chantier à mes applications
            </span>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showHelp ? 'rotate-180' : ''}`} />
          </button>
          {showHelp && (
            <div className="mt-3 space-y-2 text-xs text-gray-600 leading-relaxed">
              <p className="font-semibold text-gray-700">Sur ordinateur (Chrome / Edge) :</p>
              <ol className="list-decimal list-inside space-y-1 ml-1">
                <li>Cliquez sur le menu <strong>⋮</strong> en haut à droite</li>
                <li><strong>Enregistrer et partager</strong> → <strong>Créer un raccourci…</strong></li>
                <li>Cochez <strong>« Ouvrir en tant que fenêtre »</strong> puis <strong>Créer</strong></li>
              </ol>
              <p>Un raccourci ECOPYE apparaît sur votre bureau et dans le menu démarrer.</p>
              <p className="font-semibold text-gray-700 mt-3">Sur mobile (Chrome / Safari) :</p>
              <ol className="list-decimal list-inside space-y-1 ml-1">
                <li>Menu du navigateur</li>
                <li><strong>« Ajouter à l&apos;écran d&apos;accueil »</strong></li>
              </ol>
              <p className="mt-3 text-gray-500 italic">
                L&apos;installation PWA native sera disponible une fois le domaine + HTTPS configurés.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
