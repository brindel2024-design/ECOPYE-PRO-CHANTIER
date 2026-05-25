'use client'

import { useState, useEffect } from 'react'
import { Download, ChevronDown, Share, Plus } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Platform = 'ios' | 'android' | 'desktop'

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent || ''
  // iPadOS récent se présente comme un Mac : on teste aussi le tactile.
  const isIOS =
    /iphone|ipad|ipod/i.test(ua) ||
    (/Macintosh/.test(ua) && 'ontouchend' in document)
  if (isIOS) return 'ios'
  if (/android/i.test(ua)) return 'android'
  return 'desktop'
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

export function InstallApp() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [standalone, setStandalone] = useState(false)
  const [platform, setPlatform] = useState<Platform>('desktop')
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    setPlatform(detectPlatform())
    setStandalone(isStandalone())
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    const installedHandler = () => setInstalled(true)
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installedHandler)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  // Déjà ouverte en mode application installée
  if (standalone) return null

  if (installed) {
    return (
      <div className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-green-50 border border-green-100 px-4 py-2 text-sm text-green-700">
        ✓ Application installée — ouvrez-la depuis l&apos;écran d&apos;accueil de votre appareil
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

  // 1) Android / Chrome / Edge : installation native disponible
  if (prompt) {
    return (
      <div className="mt-5 rounded-xl bg-gray-50 border border-gray-100 p-4">
        <button
          onClick={handleInstall}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-sm font-semibold transition-colors"
        >
          <Download className="h-4 w-4" />
          Installer l&apos;application sur cet appareil
        </button>
      </div>
    )
  }

  // 2) iPhone / iPad : pas d'installation automatique possible (limite Apple)
  //    → on affiche directement la procédure manuelle Safari.
  if (platform === 'ios') {
    return (
      <div className="mt-5 rounded-xl bg-blue-50 border border-blue-100 p-4">
        <p className="text-sm font-semibold text-blue-900 mb-2 inline-flex items-center gap-2">
          <Download className="h-4 w-4" />
          Ajouter ECOPYE à l&apos;écran d&apos;accueil de votre iPhone
        </p>
        <ol className="space-y-2 text-sm text-blue-900/90">
          <li className="flex items-start gap-2">
            <span className="font-bold">1.</span>
            <span>
              Appuyez sur le bouton <strong>Partager</strong>{' '}
              <Share className="inline h-4 w-4 align-text-bottom" /> en bas de Safari
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">2.</span>
            <span>
              Faites défiler et choisissez{' '}
              <strong>« Sur l&apos;écran d&apos;accueil »</strong>{' '}
              <Plus className="inline h-4 w-4 align-text-bottom" />
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">3.</span>
            <span>Appuyez sur <strong>« Ajouter »</strong> — l&apos;icône ECOPYE apparaît sur votre écran d&apos;accueil.</span>
          </li>
        </ol>
        <p className="mt-3 text-xs text-blue-700/80 italic">
          Sur iPhone, l&apos;ajout doit se faire depuis <strong>Safari</strong> (pas Chrome) et de façon manuelle — c&apos;est imposé par Apple.
        </p>
      </div>
    )
  }

  // 3) Android sans prompt encore déclenché, ou ordinateur : aide repliable
  return (
    <div className="mt-5 rounded-xl bg-gray-50 border border-gray-100 p-4">
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
          {platform === 'android' ? (
            <>
              <p className="font-semibold text-gray-700">Sur Android (Chrome) :</p>
              <ol className="list-decimal list-inside space-y-1 ml-1">
                <li>Appuyez sur le menu <strong>⋮</strong> en haut à droite</li>
                <li>Choisissez <strong>« Installer l&apos;application »</strong> ou <strong>« Ajouter à l&apos;écran d&apos;accueil »</strong></li>
                <li>Confirmez — l&apos;icône ECOPYE apparaît sur votre écran d&apos;accueil</li>
              </ol>
            </>
          ) : (
            <>
              <p className="font-semibold text-gray-700">Sur ordinateur (Chrome / Edge) :</p>
              <ol className="list-decimal list-inside space-y-1 ml-1">
                <li>Cliquez sur l&apos;icône <strong>installer</strong> dans la barre d&apos;adresse, ou le menu <strong>⋮</strong></li>
                <li><strong>Enregistrer et partager</strong> → <strong>Installer ECOPYE Pro Chantier…</strong></li>
                <li>Confirmez — un raccourci apparaît sur votre bureau</li>
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  )
}
