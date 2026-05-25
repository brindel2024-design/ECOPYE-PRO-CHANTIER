'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { HardHat, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

function ResetForm() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Les deux mots de passe ne correspondent pas.'); return }
    if (password.length < 8) { setError('8 caractères minimum.'); return }
    setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    const j = await res.json().catch(() => ({}))
    setLoading(false)
    if (res.ok) { setDone(true); setTimeout(() => router.push('/login'), 2500) }
    else setError(j.error || 'Échec de la réinitialisation.')
  }

  if (!token) {
    return (
      <div className="text-center py-4">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <p className="text-sm text-gray-600 mb-4">Lien invalide. Refaites une demande de réinitialisation.</p>
        <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">Mot de passe oublié</Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
          <CheckCircle2 className="h-7 w-7 text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Mot de passe réinitialisé</h1>
        <p className="text-sm text-gray-500">Redirection vers la connexion…</p>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Nouveau mot de passe</h1>
      <p className="text-sm text-gray-500 text-center mb-8">Choisissez un nouveau mot de passe (8 caractères min).</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nouveau mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmation</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Validation…</> : 'Réinitialiser'}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <HardHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">ECOPYE</span>
              <span className="ml-1.5 text-lg text-blue-600 font-bold">Pro Chantier</span>
            </div>
          </div>
          <Suspense fallback={<div className="text-center text-sm text-gray-400 py-8">Chargement…</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
