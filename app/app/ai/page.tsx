'use client'

import { useState } from 'react'
import {
  Bot,
  FileText,
  Bell,
  ClipboardList,
  FileCheck,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Mail,
  CheckSquare,
  Copy,
  Clock,
  LucideIcon,
} from 'lucide-react'
import { AiRequestType } from '@/lib/types'

const MOCK_RESPONSES: Record<AiRequestType, string> = {
  GENERER_DEVIS: `DEVIS SIMULÉ — Rénovation Salle de Bain 7m²

1. Démolition et évacuation (7m²) — 450 € HT
2. Étanchéité sous carrelage (SPEC 90) — 680 € HT
3. Fourniture et pose carrelage sol 60x60 — 1 260 € HT
4. Fourniture et pose carrelage mural — 1 440 € HT
5. Douche italienne 90x90 avec receveur — 890 € HT
6. Double vasque encastrée 120cm + robinetterie — 1 200 € HT
7. Plomberie et raccordements — 780 € HT
8. Électricité (spots, VMC, chauffage) — 540 € HT
9. Finitions et nettoyage — 280 € HT

Sous-total HT : 7 520 €
TVA 20% : 1 504 €
Total TTC : 9 024 €
Acompte 30% à la signature : 2 707 €

Délai d'exécution estimé : 8-10 jours ouvrés
Validité du devis : 30 jours`,

  REDIGER_RELANCE: `Objet : Rappel — Facture FAC-2024-0003 échue depuis 35 jours

Madame Moreau,

Je me permets de revenir vers vous concernant la facture n°FAC-2024-0003
d'un montant de 3 840 € TTC, dont l'échéance était fixée au 05/06/2024.

À ce jour, nous n'avons pas reçu votre règlement, et il semblerait que
cette facture soit passée inaperçue.

Pourriez-vous procéder au règlement dans les meilleurs délais par virement
sur notre compte IBAN FR76 3000 6000 0112 3456 7890 189 ?

En cas de difficulté, n'hésitez pas à me contacter au 04 78 12 34 56 afin
que nous puissions trouver une solution amiable.

Cordialement,
Jean Durand — Durand Rénovation Services`,

  RESUMER_CHANTIER: `RÉSUMÉ CHANTIER — Rénovation SDB Marie Laurent
État au 25/06/2024

✅ Étapes terminées (4/10) :
- Devis signé et acompte encaissé
- Préparation et installation de chantier
- Dépose ancienne installation
- Travaux d'étanchéité validés

🔄 En cours :
- Plomberie et raccordements eau (75% avancé)
- Retard estimé : 0 jour

⏳ À venir :
- Pose carrelage sol et mural (J+3)
- Installation équipements sanitaires (J+6)
- Finitions et nettoyage (J+8)
- Réception client prévue le 05/07/2024

💰 Budget :
- Prévu : 10 200 € TTC
- Réalisé à date : 8 900 €
- Écart favorable : -1 300 € (dans les objectifs)

⚠ Points d'attention : Aucun`,

  PREPARER_COMPTE_RENDU: `✅ Réponse IA générée (simulation)

[Contenu généré en fonction de votre demande. En production, l'IA analyserait votre contexte et générerait une réponse personnalisée adaptée à votre activité BTP.]`,

  ANALYSER_BUDGET: `✅ Réponse IA générée (simulation)

[Contenu généré en fonction de votre demande. En production, l'IA analyserait votre contexte et générerait une réponse personnalisée adaptée à votre activité BTP.]`,

  PREPARER_LITIGE: `✅ Réponse IA générée (simulation)

[Contenu généré en fonction de votre demande. En production, l'IA analyserait votre contexte et générerait une réponse personnalisée adaptée à votre activité BTP.]`,

  MESSAGE_WHATSAPP: `✅ Réponse IA générée (simulation)

[Contenu généré en fonction de votre demande. En production, l'IA analyserait votre contexte et générerait une réponse personnalisée adaptée à votre activité BTP.]`,

  EMAIL_PROFESSIONNEL: `✅ Réponse IA générée (simulation)

[Contenu généré en fonction de votre demande. En production, l'IA analyserait votre contexte et générerait une réponse personnalisée adaptée à votre activité BTP.]`,

  CHECKLIST_CHANTIER: `CHECKLIST — Rénovation Salle de Bain

AVANT DÉMARRAGE ✅
☐ EPI vérifiés (casque, lunettes, gants, chaussures de sécurité)
☐ Zone de travail balisée et protégée
☐ Coupure eau vérifiée et affichée
☐ Matériaux commandés et livrés
☐ Acompte encaissé

DÉMOLITION
☐ Protection revêtements adjacents
☐ Dépose robinetterie et sanitaires anciens
☐ Évacuation décombres en benne agréée

PLOMBERIE
☐ Vérification pression réseau (>3 bars)
☐ Raccordements eau froide/chaude conformes
☐ Test étanchéité 24h avant carrelage
☐ Mise aux normes évacuations

CARRELAGE
☐ Test planéité support (< 3mm/2m)
☐ Calepinage validé client
☐ Joints réalisés selon DTU 52.2

RÉCEPTION
☐ Nettoyage complet chantier
☐ Notice utilisation remise client
☐ PV réception signé
☐ Solde facturé`,
}

interface AiCard {
  type: AiRequestType
  icon: LucideIcon
  title: string
  description: string
  placeholder: string
  color: string
  iconColor: string
}

const AI_CARDS: AiCard[] = [
  {
    type: 'GENERER_DEVIS',
    icon: FileText,
    title: 'Générer un devis',
    description: 'Décrivez les travaux et obtenez un devis complet automatiquement',
    placeholder: 'Ex: Rénovation salle de bain 7m², douche italienne, double vasque, carrelage 60x60...',
    color: 'border-blue-100 hover:border-blue-300',
    iconColor: 'text-blue-600 bg-blue-50',
  },
  {
    type: 'REDIGER_RELANCE',
    icon: Bell,
    title: 'Rédiger une relance',
    description: 'Générez un email de relance professionnel pour vos factures impayées',
    placeholder: 'Ex: Facture FAC-2024-0003, client Sophie Moreau, 35 jours de retard...',
    color: 'border-orange-100 hover:border-orange-300',
    iconColor: 'text-orange-600 bg-orange-50',
  },
  {
    type: 'RESUMER_CHANTIER',
    icon: ClipboardList,
    title: 'Résumer le chantier',
    description: "Obtenez un résumé structuré de l'avancement d'un chantier",
    placeholder: 'Ex: Chantier rénovation SDB Marie Laurent, Lyon...',
    color: 'border-green-100 hover:border-green-300',
    iconColor: 'text-green-600 bg-green-50',
  },
  {
    type: 'PREPARER_COMPTE_RENDU',
    icon: FileCheck,
    title: 'Préparer un compte-rendu',
    description: 'Générez un compte-rendu de chantier professionnel',
    placeholder: 'Ex: Visite du 25/06/2024, avancement plomberie...',
    color: 'border-purple-100 hover:border-purple-300',
    iconColor: 'text-purple-600 bg-purple-50',
  },
  {
    type: 'ANALYSER_BUDGET',
    icon: TrendingUp,
    title: 'Analyser le budget',
    description: 'Analysez les écarts entre budget prévu et réalisé',
    placeholder: 'Ex: Chantier budget prévu 10 200€, réalisé 8 900€...',
    color: 'border-indigo-100 hover:border-indigo-300',
    iconColor: 'text-indigo-600 bg-indigo-50',
  },
  {
    type: 'PREPARER_LITIGE',
    icon: AlertTriangle,
    title: 'Préparer un dossier litige',
    description: 'Structurez votre dossier en cas de litige avec un client',
    placeholder: 'Ex: Client Sophie Moreau, facture impayée, travaux non acceptés...',
    color: 'border-red-100 hover:border-red-300',
    iconColor: 'text-red-600 bg-red-50',
  },
  {
    type: 'MESSAGE_WHATSAPP',
    icon: MessageSquare,
    title: 'Message WhatsApp',
    description: 'Rédigez un message professionnel pour votre client',
    placeholder: 'Ex: Confirmation RDV mardi 9h pour démarrage travaux...',
    color: 'border-green-100 hover:border-green-300',
    iconColor: 'text-green-600 bg-green-50',
  },
  {
    type: 'EMAIL_PROFESSIONNEL',
    icon: Mail,
    title: 'Email professionnel',
    description: 'Composez un email professionnel adapté à votre situation',
    placeholder: 'Ex: Accusé de réception devis signé, prochaines étapes...',
    color: 'border-blue-100 hover:border-blue-300',
    iconColor: 'text-blue-600 bg-blue-50',
  },
  {
    type: 'CHECKLIST_CHANTIER',
    icon: CheckSquare,
    title: 'Checklist chantier',
    description: 'Générez une checklist personnalisée pour votre type de chantier',
    placeholder: "Ex: Rénovation salle de bain, surface 6m², client particulier...",
    color: 'border-teal-100 hover:border-teal-300',
    iconColor: 'text-teal-600 bg-teal-50',
  },
]

const MOCK_HISTORY = [
  { type: 'Rédiger une relance', time: 'il y a 2h', excerpt: 'Relance FAC-2024-0003...' },
  { type: 'Générer un devis', time: 'hier', excerpt: 'Rénovation SDB 7m²...' },
  { type: 'Checklist chantier', time: 'il y a 3j', excerpt: 'Salle de bain particulier...' },
]

export default function AiPage() {
  const [activeCard, setActiveCard] = useState<AiCard | null>(null)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const ActiveIcon = activeCard?.icon ?? null

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const handleSelectCard = (card: AiCard) => {
    setActiveCard(card)
    setPrompt(card.placeholder)
    setResponse(null)
    setLoading(false)
  }

  const handleGenerate = () => {
    if (!activeCard || !prompt.trim()) return
    setLoading(true)
    setResponse(null)
    setTimeout(() => {
      setResponse(MOCK_RESPONSES[activeCard.type])
      setLoading(false)
    }, 1500)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => showToast('Copié dans le presse-papier'))
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bot className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Copilote IA</h1>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
          ⚠ Simulation — données fictives
        </span>
      </div>

      {/* Intro banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6">
        <p className="text-xl font-semibold mb-1">🤖 Votre assistant IA pour le bâtiment</p>
        <p className="text-blue-100 text-sm mb-3">
          Générez des devis, rédigez des relances, préparez vos comptes rendus — en quelques secondes.
        </p>
        <span className="inline-block bg-blue-800 bg-opacity-60 text-blue-100 text-xs px-3 py-1 rounded-full">
          ⚠ Mode simulation — Les réponses sont des exemples prédéfinis
        </span>
      </div>

      {/* Cards grid + panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 9 action cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {AI_CARDS.map((card) => {
            const Icon = card.icon
            const isActive = activeCard?.type === card.type
            return (
              <button
                key={card.type}
                onClick={() => handleSelectCard(card)}
                className={`bg-white rounded-xl border-2 p-4 text-left transition-all ${card.color} ${
                  isActive ? 'ring-2 ring-blue-400 shadow-md' : 'shadow-sm'
                }`}
              >
                <div className={`inline-flex p-2 rounded-lg mb-3 ${card.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-semibold text-gray-900 text-sm mb-1">{card.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{card.description}</p>
                <span className="mt-3 inline-block text-xs font-medium text-blue-600">Utiliser →</span>
              </button>
            )
          })}
        </div>

        {/* Active panel */}
        <div className="lg:col-span-1">
          {activeCard && ActiveIcon ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4 sticky top-6">
              <div className="flex items-center gap-2">
                <div className={`inline-flex p-1.5 rounded-lg ${activeCard.iconColor}`}>
                  <ActiveIcon className="h-4 w-4" />
                </div>
                <p className="font-semibold text-gray-900 text-sm">{activeCard.title}</p>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                placeholder={activeCard.placeholder}
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Génération en cours...
                  </>
                ) : (
                  'Générer'
                )}
              </button>

              {response && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Résultat</p>
                    <button
                      onClick={() => handleCopy(response)}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copier
                    </button>
                  </div>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">{response}</pre>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center h-64">
              <Bot className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 font-medium">Sélectionnez une action</p>
              <p className="text-xs text-gray-400 mt-1">Choisissez un outil dans la grille pour commencer</p>
            </div>
          )}
        </div>
      </div>

      {/* History section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Historique des utilisations (simulation)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Action</th>
                <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Date</th>
                <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Extrait</th>
                <th className="text-left text-xs text-gray-500 font-medium pb-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_HISTORY.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 pr-4 font-medium text-gray-900">{item.type}</td>
                  <td className="py-3 pr-4 text-gray-500 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {item.time}
                  </td>
                  <td className="py-3 pr-4 text-gray-600">{item.excerpt}</td>
                  <td className="py-3">
                    <button
                      onClick={() => showToast('Copié dans le presse-papier')}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm z-50 shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
