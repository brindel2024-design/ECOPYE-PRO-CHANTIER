'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import {
  CheckCircle,
  Circle,
  Clock,
  CreditCard,
  MessageSquare,
  Send,
  X,
  AlertTriangle,
  Building2,
  Phone,
  Mail,
  Lock,
} from 'lucide-react'

const PORTAL_DATA = {
  company: {
    name: 'Durand Rénovation Services',
    phone: '04 78 12 34 56',
    email: 'contact@durand-renovation.fr',
  },
  client: { name: 'Marie Laurent', city: 'Lyon' },
  project: {
    title: 'Rénovation SDB - Lyon 1er',
    progress: 65,
    status: 'EN_COURS',
    address: '12 Rue de la Paix, Lyon 1er',
  },
  quote: { number: 'DEV-2024-0001', amount: 10200, status: 'ACCEPTE' },
  invoice: {
    number: 'FAC-2024-0002',
    amount: 7140,
    status: 'EN_ATTENTE',
    dueDate: '15/07/2024',
  },
  steps: [
    { title: 'Devis signé', done: true, current: false },
    { title: 'Acompte reçu', done: true, current: false },
    { title: 'Préparation chantier', done: true, current: false },
    { title: 'Plomberie', done: false, current: true },
    { title: 'Carrelage', done: false, current: false },
    { title: 'Finitions', done: false, current: false },
    { title: 'Réception', done: false, current: false },
  ],
}

function PaymentModal({ onClose }: { onClose: () => void }) {
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)

  const handlePay = async () => {
    setPaying(true)
    await new Promise((r) => setTimeout(r, 1500))
    setPaying(false)
    setPaid(true)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-semibold text-slate-900">Paiement en ligne</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {paid ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-lg font-semibold text-slate-900 mb-1">Paiement simulé !</p>
              <p className="text-slate-500 text-sm">
                Votre paiement de{' '}
                <span className="font-medium text-slate-700">
                  {PORTAL_DATA.invoice.amount.toLocaleString('fr-FR')} € TTC
                </span>{' '}
                a été enregistré.
              </p>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-700 text-xs">Mode simulation — aucun prélèvement réel</p>
              </div>
              <button
                onClick={onClose}
                className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Fermer
              </button>
            </div>
          ) : (
            <>
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <p className="text-xs text-slate-500 mb-1">Montant à régler</p>
                <p className="text-3xl font-bold text-slate-900">
                  {PORTAL_DATA.invoice.amount.toLocaleString('fr-FR')} €
                  <span className="text-sm font-normal text-slate-500 ml-1">TTC</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Réf. {PORTAL_DATA.invoice.number} · Échéance {PORTAL_DATA.invoice.dueDate}
                </p>
              </div>

              <div className="space-y-3 mb-5">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-xs font-medium text-blue-700 mb-1">Virement bancaire</p>
                  <p className="text-xs text-slate-600">IBAN : FR76 1234 5678 9012 3456 7890 123</p>
                  <p className="text-xs text-slate-600">Réf. : {PORTAL_DATA.invoice.number}</p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-amber-700 text-xs">
                    Mode simulation — aucun paiement réel ne sera effectué
                  </p>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={paying}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {paying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Confirmer le paiement (simulation)
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ClientPortalPage() {
  const params = useParams()
  const token = params?.token as string
  const [showPayment, setShowPayment] = useState(false)
  const [message, setMessage] = useState('')
  const [messageSent, setMessageSent] = useState(false)

  const handleSendMessage = () => {
    if (!message.trim()) return
    setMessageSent(true)
    setMessage('')
    setTimeout(() => setMessageSent(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showPayment && <PaymentModal onClose={() => setShowPayment(false)} />}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">ECOPYE Pro Chantier</span>
              <span className="mx-2 text-slate-300">·</span>
              <span className="text-slate-600 text-sm">{PORTAL_DATA.company.name}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Token info */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-xs text-slate-500">
          <Lock className="w-3 h-3" />
          <span>Token de session : <code className="font-mono">{token}</code></span>
        </div>

        {/* Bannière de bienvenue */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <p className="text-blue-100 text-sm mb-1">Portail client</p>
          <h1 className="text-xl font-bold mb-1">
            Bonjour {PORTAL_DATA.client.name} 👋
          </h1>
          <p className="text-blue-100 text-sm">
            Voici l&apos;avancement de vos travaux — {PORTAL_DATA.project.title}
          </p>
        </div>

        {/* Avancement du projet */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">{PORTAL_DATA.project.title}</h2>
              <p className="text-slate-500 text-sm mt-0.5">{PORTAL_DATA.project.address}</p>
            </div>
            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              En cours
            </span>
          </div>

          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-slate-600">Avancement global</span>
            <span className="text-sm font-bold text-blue-600">{PORTAL_DATA.project.progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 mb-1">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${PORTAL_DATA.project.progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">
            Devis {PORTAL_DATA.quote.number} ·{' '}
            {PORTAL_DATA.quote.amount.toLocaleString('fr-FR')} € TTC
          </p>
        </div>

        {/* Étapes du chantier */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-5">Étapes du chantier</h2>

          <div className="relative">
            {/* Ligne verticale */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />

            <div className="space-y-4">
              {PORTAL_DATA.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-4 relative">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 bg-white" style={{
                    borderColor: step.done ? '#16a34a' : step.current ? '#2563eb' : '#e5e7eb',
                  }}>
                    {step.done ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : step.current ? (
                      <Clock className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      step.done
                        ? 'text-green-700'
                        : step.current
                        ? 'text-blue-700'
                        : 'text-slate-400'
                    }`}>
                      {step.title}
                    </p>
                    {step.current && (
                      <p className="text-xs text-blue-500 mt-0.5">En cours</p>
                    )}
                    {step.done && (
                      <p className="text-xs text-green-500 mt-0.5">Terminé</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Facture en attente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Facture en attente</h2>
              <p className="text-slate-500 text-sm mt-0.5">{PORTAL_DATA.invoice.number}</p>
            </div>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              En attente
            </span>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">Montant TTC</p>
                <p className="text-2xl font-bold text-slate-900">
                  {PORTAL_DATA.invoice.amount.toLocaleString('fr-FR')} €
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-1">Échéance</p>
                <p className="text-sm font-medium text-red-600">{PORTAL_DATA.invoice.dueDate}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowPayment(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            Payer en ligne
          </button>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-slate-600" />
            <h2 className="text-base font-semibold text-slate-900">Message à l&apos;artisan</h2>
          </div>

          {messageSent && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg mb-3">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-green-700 text-sm">Message envoyé (simulation)</p>
            </div>
          )}

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Posez votre question ou laissez un commentaire..."
            rows={4}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />

          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-slate-400">
              Votre message sera transmis à {PORTAL_DATA.company.name}
            </p>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Envoyer
            </button>
          </div>
        </div>

        {/* Coordonnées artisan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Contact artisan</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {PORTAL_DATA.company.name}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {PORTAL_DATA.company.phone}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {PORTAL_DATA.company.email}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-8">
        <div className="max-w-3xl mx-auto px-4 py-5 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-slate-500 text-xs">
              Portail client ECOPYE Pro Chantier — Vos données sont sécurisées
            </p>
          </div>
          <p className="text-slate-400 text-xs">
            © 2024 ECOPYE · Mode simulation · Aucune donnée réelle
          </p>
        </div>
      </footer>
    </div>
  )
}
