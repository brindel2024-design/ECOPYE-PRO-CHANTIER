import Link from 'next/link'
import { CheckCircle2, ArrowRight, HardHat } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '29',
    period: '/mois',
    description: 'Pour démarrer avec des outils professionnels',
    features: ['5 devis par mois', '3 chantiers actifs simultanément', '1 utilisateur', 'Factures simples', 'Photos (50/mois)', 'Support email'],
    notIncluded: ['Devis illimités', 'Paiements simulés', 'Copilote IA', 'Trésorerie avancée'],
    cta: 'Démarrer Starter',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '59',
    period: '/mois',
    description: 'Le plan idéal pour un artisan actif',
    features: ['Devis illimités', 'Chantiers illimités', '3 utilisateurs', 'Paiements simulés + QR code', 'Relances automatiques', 'Photos illimitées avant/après', 'Documents & conformité', 'Planning équipe', 'Espace client'],
    notIncluded: ['Copilote IA', 'Trésorerie avancée', 'Dossier litige IA'],
    cta: 'Démarrer Pro — Le plus populaire',
    highlighted: true,
  },
  {
    name: 'Premium',
    price: '99',
    period: '/mois',
    description: 'Pour les entreprises et PME BTP',
    features: ['Tout le plan Pro', 'Utilisateurs illimités', 'Copilote IA complet', 'Trésorerie avancée 90j', 'Dossier litige automatique', 'Bibliothèque technique', 'Support prioritaire', 'Onboarding personnalisé'],
    notIncluded: [],
    cta: 'Passer Premium',
    highlighted: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <HardHat className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">ECOPYE Pro Chantier</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Connexion</Link>
            <Link href="/register" className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Démarrer
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tarifs simples et transparents</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sans engagement. Sans frais cachés. Commencez gratuitement 14 jours, annulez à tout moment.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? 'bg-blue-600 shadow-xl shadow-blue-200'
                  : 'border border-gray-200 bg-white shadow-sm'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-green-500 px-4 py-1.5 text-sm font-bold text-white shadow">
                    ✓ Le plus populaire
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h2 className={`text-xl font-bold mb-1 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h2>
                <p className={`text-sm mb-4 ${plan.highlighted ? 'text-blue-200' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price} €
                  </span>
                  <span className={`text-sm ${plan.highlighted ? 'text-blue-200' : 'text-gray-500'}`}>
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${plan.highlighted ? 'text-green-300' : 'text-green-500'}`} />
                    <span className={`text-sm ${plan.highlighted ? 'text-blue-100' : 'text-gray-700'}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`flex items-center justify-center gap-2 w-full rounded-xl py-3.5 text-sm font-semibold transition-all ${
                  plan.highlighted
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Entreprise */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Plan Entreprise — Sur devis</h3>
          <p className="text-gray-600 mb-4">
            Pour les entreprises avec plusieurs agences, besoin d&apos;intégration API, de personnalisation et d&apos;accompagnement dédié.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6 text-sm text-gray-600">
            {['Multi-agences', 'API partenaire', 'Intégration comptable', 'Formation équipe', 'SLA garanti', 'Account manager dédié'].map((f) => (
              <span key={f} className="rounded-full bg-gray-100 px-3 py-1">{f}</span>
            ))}
          </div>
          <a
            href="mailto:pro@ecopye.fr"
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Nous contacter
          </a>
        </div>
      </div>

      <footer className="border-t border-gray-200 bg-white py-8 text-center">
        <p className="text-sm text-gray-500">© 2024 ECOPYE Pro Chantier</p>
        <p className="text-xs text-amber-600 mt-1">⚠ Prototype de démonstration — Données fictives — Aucun paiement réel</p>
      </footer>
    </div>
  )
}
