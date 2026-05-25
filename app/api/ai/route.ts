import { NextResponse } from 'next/server'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { AiRequestType } from '@/lib/types'

const GLOBAL_RULES = `RÈGLES STRICTES — À RESPECTER ABSOLUMENT :
- N'invente JAMAIS de données légales ou factuelles : pas de SIRET, pas de numéro de TVA, pas de nom d'entreprise, pas de numéro d'assurance décennale/RC, pas d'adresse, pas de date réelle. Ces informations te sont INCONNUES.
- Quand une telle donnée est nécessaire, insère un champ à compléter explicite entre crochets : [VOTRE SIRET], [NOM DE VOTRE ENTREPRISE], [N° ASSURANCE DÉCENNALE], [DATE], [VOS COORDONNÉES]. Ne mets jamais de valeur plausible inventée.
- N'invente pas de dates : si une date est requise et non fournie, écris [DATE] ou [JJ/MM/AAAA].
- Les montants et quantités que tu proposes sont des ESTIMATIONS indicatives, à valider par l'artisan.
- Termine TOUJOURS ta réponse par : "⚠ Brouillon généré par IA — vérifiez et complétez les informations (notamment légales, prix et taux de TVA) avant tout usage contractuel."
`

const SYSTEM_PROMPTS: Record<AiRequestType, string> = {
  GENERER_DEVIS:
    "Tu es un assistant pour artisans du bâtiment français. Génère une TRAME de devis détaillée, structurée par poste, avec quantités et prix unitaires HT estimés indicatifs (marché français), total HT, TVA (rappelle que le taux dépend des travaux : 20%/10%/5,5%) et total TTC. N'invente aucune coordonnée d'entreprise ni mention légale chiffrée : utilise des champs [à compléter].",
  REDIGER_RELANCE:
    "Tu es un assistant pour artisans du bâtiment français. Rédige un email de relance de facture impayée, ton professionnel et courtois mais ferme, rappelant le numéro de facture, le montant, l'échéance dépassée, et proposant un règlement rapide.",
  RESUMER_CHANTIER:
    "Tu es un assistant pour artisans du bâtiment français. Produis un résumé structuré et clair de l'avancement d'un chantier : état général, postes terminés, en cours, à venir, points de vigilance.",
  PREPARER_COMPTE_RENDU:
    "Tu es un assistant pour artisans du bâtiment français. Rédige un compte-rendu de visite de chantier professionnel : date, présents, constats, décisions, actions à mener avec responsables et délais.",
  ANALYSER_BUDGET:
    "Tu es un assistant pour artisans du bâtiment français. Analyse l'écart entre budget prévu et réalisé : montants, pourcentage d'écart, causes probables, recommandations concrètes pour la rentabilité.",
  PREPARER_LITIGE:
    "Tu es un assistant pour artisans du bâtiment français. Structure un dossier de litige client : faits chronologiques, pièces à réunir, fondement (devis signé, CGV), démarche amiable puis mise en demeure type. Précise que ce n'est pas un conseil juridique.",
  MESSAGE_WHATSAPP:
    "Tu es un assistant pour artisans du bâtiment français. Rédige un message WhatsApp court, clair et professionnel à envoyer à un client.",
  EMAIL_PROFESSIONNEL:
    "Tu es un assistant pour artisans du bâtiment français. Compose un email professionnel adapté à la situation décrite, avec objet, corps structuré et formule de politesse.",
  CHECKLIST_CHANTIER:
    "Tu es un assistant pour artisans du bâtiment français. Génère une checklist de chantier exhaustive et ordonnée (préparation, exécution, contrôle qualité, réception), adaptée au type de travaux décrit.",
}

const VALID_TYPES = Object.keys(SYSTEM_PROMPTS)

export async function GET() {
  const { session, error } = await getSessionOrUnauthorized()
  if (error) return error
  const { companyId, error: companyError } = requireCompanyId(session)
  if (companyError) return companyError

  const history = await prisma.aiRequest.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, type: true, prompt: true, createdAt: true },
  })
  return NextResponse.json({ data: history })
}

export async function POST(request: Request) {
  const { session, error } = await getSessionOrUnauthorized()
  if (error) return error
  const { companyId, error: companyError } = requireCompanyId(session)
  if (companyError) return companyError

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "Service IA non configuré (OPENROUTER_API_KEY manquante)." },
      { status: 503 }
    )
  }

  let body: { type?: string; prompt?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  const { type, prompt } = body
  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Type de demande invalide.' }, { status: 400 })
  }
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
    return NextResponse.json({ error: 'Veuillez préciser votre demande.' }, { status: 400 })
  }
  if (prompt.length > 4000) {
    return NextResponse.json({ error: 'Demande trop longue (max 4000 caractères).' }, { status: 400 })
  }

  // Modèles gratuits OpenRouter (coût 0). Le premier est tenté, puis on bascule
  // sur les suivants en cas de saturation (429), crédits (402) ou indispo (404/5xx).
  // OPENROUTER_MODEL (env) reste prioritaire si défini.
  const FREE_FALLBACKS = [
    'deepseek/deepseek-v4-flash:free',
    'openai/gpt-oss-120b:free',
    'openai/gpt-oss-20b:free',
  ]
  const envModel = process.env.OPENROUTER_MODEL
  const models = envModel
    ? [envModel, ...FREE_FALLBACKS.filter((m) => m !== envModel)]
    : FREE_FALLBACKS

  const systemContent = `${GLOBAL_RULES}\nDate du jour : ${new Date().toLocaleDateString('fr-FR')}.\n\n${SYSTEM_PROMPTS[type as AiRequestType]}`

  try {
    let content: string | undefined
    let lastStatus = 0
    let lastDetail = ''

    for (const model of models) {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemContent },
            { role: 'user', content: prompt.trim() },
          ],
          temperature: 0.7,
          max_tokens: 1200,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        content = data?.choices?.[0]?.message?.content
        if (content) break
        lastStatus = 502
        lastDetail = 'réponse vide'
        continue
      }

      lastStatus = res.status
      lastDetail = await res.text()
      console.error(`OpenRouter error (${model}):`, res.status, lastDetail)
      // 429 (saturé), 402 (crédits), 404 (modèle indispo), 5xx → on tente le modèle suivant
      if (![429, 402, 404, 500, 502, 503].includes(res.status)) break
    }

    if (!content) {
      console.error('AI: tous les modèles ont échoué', lastStatus, lastDetail)
      return NextResponse.json(
        { error: "L'assistant IA est momentanément indisponible (réessayez dans quelques instants)." },
        { status: 502 }
      )
    }

    const userId = (session.user as { id?: string }).id
    if (userId) {
      await prisma.aiRequest.create({
        data: { companyId, userId, type, prompt: prompt.trim(), response: content },
      })
    }

    return NextResponse.json({ data: content })
  } catch (e) {
    console.error('AI route error:', e)
    return NextResponse.json(
      { error: "Erreur lors de l'appel à l'assistant IA." },
      { status: 500 }
    )
  }
}
