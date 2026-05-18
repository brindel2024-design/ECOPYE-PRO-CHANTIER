import { NextResponse } from 'next/server'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { AiRequestType } from '@/lib/types'

const SYSTEM_PROMPTS: Record<AiRequestType, string> = {
  GENERER_DEVIS:
    "Tu es un assistant pour artisans du bâtiment français. Génère un devis détaillé, structuré par poste, avec quantités, prix unitaires HT estimés réalistes (marché français), total HT, TVA 20% et total TTC. Termine par les mentions légales habituelles (validité 30 jours, acompte 30%).",
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

  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-sonnet-4.5'

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPTS[type as AiRequestType] },
          { role: 'user', content: prompt.trim() },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    })

    if (!res.ok) {
      const detail = await res.text()
      console.error('OpenRouter error:', res.status, detail)
      return NextResponse.json(
        { error: "L'assistant IA est momentanément indisponible." },
        { status: 502 }
      )
    }

    const data = await res.json()
    const content: string | undefined = data?.choices?.[0]?.message?.content
    if (!content) {
      return NextResponse.json(
        { error: "Réponse vide de l'assistant IA." },
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
