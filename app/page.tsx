import Link from 'next/link'
import {
  FileText,
  FolderKanban,
  Camera,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Star,
  HardHat,
  Shield,
  Zap,
  Users,
  TrendingUp,
  Receipt,
  Clock,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Smartphone,
} from 'lucide-react'
import { PwaInstallButton } from '@/components/PwaInstallButton'

const features = [
  {
    icon: FileText,
    title: 'Devis en 3 minutes',
    description: 'Créez des devis professionnels avec génération automatique des lignes selon le type de chantier. Envoi client en un clic.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: FolderKanban,
    title: 'Suivi chantier complet',
    description: 'Pilotez chaque chantier avec des étapes claires, des alertes retard et un tableau de bord temps réel.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Camera,
    title: 'Photos & preuves',
    description: 'Archivez les photos avant/pendant/après chaque chantier. Constituez votre dossier anti-litige en quelques clics.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Receipt,
    title: 'Facturation automatique',
    description: 'Générez acomptes, factures intermédiaires et finales depuis vos devis acceptés. Relances automatiques.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: CreditCard,
    title: 'Paiements simplifiés',
    description: 'Lien de paiement ou QR code à envoyer au client. Encaissez plus vite, suivez tout en temps réel.',
    color: 'bg-teal-100 text-teal-600',
  },
  {
    icon: TrendingUp,
    title: 'Trésorerie & marges',
    description: 'Visualisez votre CA, vos marges, vos impayés et votre prévisionnel à 90 jours. Pilotez comme un chef.',
    color: 'bg-red-100 text-red-600',
  },
]

const problems = [
  { icon: Clock, text: '3h par devis en moyenne — souvent sur papier ou sous Excel' },
  { icon: AlertTriangle, text: 'Litiges clients faute de preuves photos organisées' },
  { icon: Receipt, text: 'Factures impayées difficiles à suivre et relancer' },
  { icon: Users, text: 'Perte de clients faute de suivi et de professionnalisme perçu' },
]

const testimonials = [
  {
    name: 'Patrick Renard',
    role: 'Plombier, 12 ans d\'expérience — Lyon',
    text: '"Avant, je passais mes soirées sous Excel. Maintenant mes devis partent le jour même et mes clients voient l\'avancement du chantier en temps réel. Mes paiements arrivent 2 semaines plus tôt."',
    stars: 5,
    avatar: 'PR',
  },
  {
    name: 'Sylvie Marchetti',
    role: 'Entreprise rénovation salle de bain — Marseille',
    text: '"J\'ai évité un litige grâce aux photos avant/après archivées. Le client ne pouvait pas contester l\'état initial. ECOPYE Pro m\'a sauvé 8 000 € de travaux contestés."',
    stars: 5,
    avatar: 'SM',
  },
  {
    name: 'Hamid Bouafia',
    role: 'Multi-services BTP — Paris',
    text: '"Interface simple, mes techniciens l\'ont prise en main en 1 heure. Le portail client les impressionne vraiment. On a l\'air d\'une grande entreprise."',
    stars: 5,
    avatar: 'HB',
  },
]

const plans = [
  {
    name: 'Starter',
    price: '29',
    description: 'Pour démarrer proprement',
    features: ['5 devis/mois', '3 chantiers actifs', '1 utilisateur', 'Factures simples', 'Photos limitées'],
    cta: 'Commencer',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '59',
    description: 'Pour les artisans actifs',
    features: ['Devis illimités', 'Chantiers illimités', '3 utilisateurs', 'Paiements simulés', 'Relances auto', 'Photos avant/après', 'Documents'],
    cta: 'Démarrer — le plus populaire',
    highlighted: true,
  },
  {
    name: 'Premium',
    price: '99',
    description: 'Pour les PME BTP',
    features: ['Multi-utilisateurs', 'Copilote IA', 'Trésorerie avancée', 'Dossier litige', 'Bibliothèque', 'Espace client', 'Support prioritaire'],
    cta: 'Passer Premium',
    highlighted: false,
  },
]

const faqs = [
  {
    q: 'Est-ce que les paiements sont réels ?',
    a: 'Dans cette version démo, tous les paiements sont simulés. Aucune donnée bancaire réelle n\'est utilisée. La version commerciale intégrera Stripe ou PayPlug.',
  },
  {
    q: 'Mes données sont-elles sécurisées ?',
    a: 'Toutes les données sont fictives dans la démo. La version commerciale respectera le RGPD avec hébergement en France et chiffrement de bout en bout.',
  },
  {
    q: 'Puis-je essayer gratuitement ?',
    a: 'Oui ! Créez votre compte gratuitement et explorez toutes les fonctionnalités en mode démonstration pendant 14 jours.',
  },
  {
    q: 'L\'application fonctionne-t-elle sur mobile ?',
    a: 'Oui, l\'interface est entièrement responsive et optimisée pour les tablettes et smartphones. Vos techniciens peuvent ajouter des photos depuis le chantier.',
  },
  {
    q: 'Peut-on utiliser ECOPYE Pro pour plusieurs métiers ?',
    a: 'Absolument. La plateforme est conçue pour les plombiers, chauffagistes, électriciens, maçons, peintres, carreleurs, menuisiers et entreprises générales BTP.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <HardHat className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold text-gray-900">ECOPYE</span>
                <span className="ml-1 text-sm text-blue-600 font-semibold">Pro Chantier</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#fonctionnalites" className="text-sm text-gray-600 hover:text-gray-900">Fonctionnalités</a>
              <a href="#tarifs" className="text-sm text-gray-600 hover:text-gray-900">Tarifs</a>
              <a href="#temoignages" className="text-sm text-gray-600 hover:text-gray-900">Témoignages</a>
              <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900">FAQ</a>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Démarrer gratuitement
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6TTYgNHY2aDZWNEg2em0wIDMwdjZoNnYtNkg2em0yNCAyNHY2aDZ2LTZoLTZ6TTE4IDEwdjZoNnYtNmgtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 mb-8">
            <Shield className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-xs font-medium text-blue-300">Version démo — Données fictives</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Devis, chantier, photos,
            <br />
            <span className="text-blue-400">factures et paiements</span>
            <br />
            dans une seule application.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            ECOPYE Pro Chantier aide les artisans à gagner du temps, suivre leurs travaux,
            encaisser plus vite et éviter les litiges clients.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/40"
            >
              Démarrer gratuitement
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-all"
            >
              Voir la démo
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-400" />Sans carte bancaire</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-400" />14 jours gratuits</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-400" />Annulable à tout moment</span>
          </div>
        </div>
      </section>

      {/* Télécharger l'app */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
            <div>
              <div className="flex items-center justify-center gap-2 mb-3 lg:justify-start">
                <Smartphone className="h-5 w-5 text-blue-200" />
                <span className="text-sm font-semibold text-blue-200 uppercase tracking-wide">Application mobile</span>
              </div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Gérez vos chantiers depuis votre téléphone
              </h2>
              <p className="mt-2 text-blue-100 text-sm max-w-lg">
                Installez ECOPYE Pro Chantier directement sur votre smartphone — sans passer par un store.
                Fonctionne sur Android et iPhone.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 lg:items-end">
              <PwaInstallButton />
              <div className="flex items-center gap-3">
                {/* App Store badge - bientôt */}
                <div className="relative group">
                  <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 opacity-60 cursor-not-allowed select-none">
                    <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <div className="text-left">
                      <p className="text-[10px] text-white/70 leading-none">Bientôt sur</p>
                      <p className="text-xs font-semibold text-white leading-none mt-0.5">App Store</p>
                    </div>
                  </div>
                  <span className="absolute -top-2 -right-2 rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold text-amber-900 leading-none">Soon</span>
                </div>
                {/* Play Store badge - bientôt */}
                <div className="relative group">
                  <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 opacity-60 cursor-not-allowed select-none">
                    <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.18 23.76c.3.17.64.24.99.2L15.88 12 12 8.12 3.18 23.76zm17.62-11.3L17.92 11l-3.2 3.2 3.2 3.2 2.9-1.64c.82-.46.82-1.62-.02-2.1zM3.13.23C2.79-.01 2.4-.07 2.06.1L14 12 2.06 23.9c.34.17.73.11 1.07-.13L17.5 12 3.13.23zm9.75 9.89L3.18.24C2.89.07 2.55 0 2.2.04L14 11.88l-1.12-1.76z"/>
                    </svg>
                    <div className="text-left">
                      <p className="text-[10px] text-white/70 leading-none">Bientôt sur</p>
                      <p className="text-xs font-semibold text-white leading-none mt-0.5">Google Play</p>
                    </div>
                  </div>
                  <span className="absolute -top-2 -right-2 rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold text-amber-900 leading-none">Soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chiffres clés */}
      <section className="border-b border-gray-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: '+2h', label: 'gagnées par devis' },
              { value: '-45%', label: 'de litiges clients' },
              { value: '3x', label: 'paiements plus rapides' },
              { value: '98%', label: 'satisfaction artisans' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problème */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Le quotidien des artisans sans outil adapté</h2>
            <p className="mt-4 text-lg text-gray-600">On vous connaît. C&apos;est pour ça qu&apos;on a créé ECOPYE Pro Chantier.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-3xl mx-auto">
            {problems.map((p) => (
              <div key={p.text} className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
                <p.icon className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section id="fonctionnalites" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Tout ce dont un artisan a besoin</h2>
            <p className="mt-4 text-lg text-gray-600">Une seule application pour piloter toute votre activité.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color} mb-4`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Métiers */}
      <section className="py-16 bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white">Fait pour votre métier</h2>
            <p className="mt-2 text-slate-400">Adapté aux besoins spécifiques de chaque corps de métier du BTP</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {['Plombier', 'Chauffagiste', 'Électricien', 'Rénovation salle de bain', 'Maçon', 'Peintre', 'Carreleur', 'Menuisier', 'Multi-services', 'Entreprise générale BTP'].map((trade) => (
              <span key={trade} className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300">
                {trade}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section id="temoignages" className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Ce que disent les artisans</h2>
            <p className="mt-4 text-gray-600">Des témoignages fictifs représentatifs de cas réels</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-6 italic">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Tarifs simples et transparents</h2>
            <p className="mt-4 text-gray-600">Commencez gratuitement, évoluez quand vous voulez.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-200'
                    : 'border border-gray-200 bg-white'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
                      Le plus populaire
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`text-lg font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mt-1 ${plan.highlighted ? 'text-blue-200' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price} €
                    </span>
                    <span className={`text-sm ${plan.highlighted ? 'text-blue-200' : 'text-gray-500'}`}>/mois</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 ${plan.highlighted ? 'text-blue-200' : 'text-green-500'}`} />
                      <span className={plan.highlighted ? 'text-blue-100' : 'text-gray-700'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                    plan.highlighted
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-8">
            Plan Entreprise sur devis — <a href="mailto:pro@ecopye.fr" className="text-blue-600 hover:underline">pro@ecopye.fr</a>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Questions fréquentes</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à professionnaliser votre activité ?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Rejoignez les artisans qui gèrent devis, chantiers et paiements dans une seule application.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-600 hover:bg-blue-50 transition-all shadow-lg"
            >
              Démarrer gratuitement
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-all"
            >
              Voir la démo
            </Link>
          </div>
          <p className="mt-6 text-sm text-blue-200">
            ⚠ Version démo — Données fictives — Aucun paiement réel
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
                  <HardHat className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-900">ECOPYE Pro Chantier</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Le SaaS des artisans français du BTP. Devis, chantiers, factures et paiements.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900 mb-4">Produit</h4>
              <ul className="space-y-2">
                {['Fonctionnalités', 'Tarifs', 'Témoignages', 'FAQ'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-gray-500 hover:text-gray-900">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900 mb-4">Métiers</h4>
              <ul className="space-y-2">
                {['Plombier', 'Électricien', 'Maçon', 'Rénovation'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-gray-500 hover:text-gray-900">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900 mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail className="h-3.5 w-3.5" />pro@ecopye.fr
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone className="h-3.5 w-3.5" />01 23 45 67 89
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />Paris, France
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-100 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400">© 2024 ECOPYE Pro Chantier. Tous droits réservés.</p>
            <p className="text-xs text-amber-600 font-medium">⚠ Prototype de démonstration — Données fictives — Aucun paiement réel</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
