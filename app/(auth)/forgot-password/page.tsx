'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HardHat, Loader2, MailCheck } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(() => {})
    setLoading(false)
    setSent(true)
  }

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

          {sent ? (
            <div className="text-center py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                <MailCheck className="h-7 w-7 text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Vérifiez vos emails</h1>
              <p className="text-sm text-gray-500 mb-6">
                Si un compte existe pour <strong>{email}</strong>, un lien de réinitialisation (valable 1 heure) vient d&apos;être envoyé. Pensez à regarder vos spams.
              </p>
              <Link href="/login" className="text-sm font-medium text-blue-600 hover:underline">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Mot de passe oublié</h1>
              <p className="text-sm text-gray-500 text-center mb-8">
                Entrez votre email, nous vous enverrons un lien de réinitialisation.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="votre@email.fr"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Envoi…</> : 'Envoyer le lien'}
                </button>
              </form>
              <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">← Retour à la connexion</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
