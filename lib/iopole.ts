/**
 * Connecteur PDP Iopole (facturation électronique).
 *
 * Authentification : OAuth2 client_credentials (Keycloak realm « iopole »).
 * Toutes les requêtes API incluent le header customer-id (« client IOPOLE »).
 *
 * Tout est piloté par variables d'environnement ; tant qu'elles ne sont pas
 * définies, le connecteur est « non configuré » et n'est jamais appelé.
 *
 * Variables attendues :
 *   IOPOLE_TOKEN_URL    URL du endpoint token Keycloak (realm iopole)
 *   IOPOLE_CLIENT_ID    client_id OAuth2
 *   IOPOLE_CLIENT_SECRET client_secret OAuth2
 *   IOPOLE_CUSTOMER_ID  identifiant unique « client IOPOLE » (header customer-id)
 *   IOPOLE_API_BASE     base API (défaut sandbox https://api.ppd.iopole.fr)
 *   IOPOLE_CUSTOMER_HEADER  nom du header customer-id (défaut "customer-id")
 */

export function isIopoleConfigured(): boolean {
  return Boolean(
    process.env.IOPOLE_TOKEN_URL &&
      process.env.IOPOLE_CLIENT_ID &&
      process.env.IOPOLE_CLIENT_SECRET &&
      process.env.IOPOLE_CUSTOMER_ID
  )
}

function apiBase(): string {
  return process.env.IOPOLE_API_BASE || 'https://api.ppd.iopole.fr'
}

let cachedToken: { value: string; expiresAt: number } | null = null

/** Récupère un jeton OAuth2 (client_credentials), avec cache jusqu'à ~30 s avant expiration. */
export async function getIopoleToken(): Promise<string> {
  if (!isIopoleConfigured()) throw new Error('Iopole non configuré (variables d’environnement manquantes).')
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 30_000) return cachedToken.value

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.IOPOLE_CLIENT_ID as string,
    client_secret: process.env.IOPOLE_CLIENT_SECRET as string,
  })
  const res = await fetch(process.env.IOPOLE_TOKEN_URL as string, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Échec de l'authentification Iopole (${res.status}): ${detail.slice(0, 200)}`)
  }
  const json = (await res.json()) as { access_token: string; expires_in?: number }
  cachedToken = {
    value: json.access_token,
    expiresAt: now + (json.expires_in ?? 300) * 1000,
  }
  return cachedToken.value
}

/** Appel authentifié à l'API Iopole (Bearer + header customer-id). */
export async function iopoleFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getIopoleToken()
  const customerHeader = process.env.IOPOLE_CUSTOMER_HEADER || 'customer-id'
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    [customerHeader]: process.env.IOPOLE_CUSTOMER_ID as string,
    ...(init.headers as Record<string, string> | undefined),
  }
  const url = path.startsWith('http') ? path : `${apiBase()}${path}`
  return fetch(url, { ...init, headers })
}

/**
 * Émission d'une facture électronique via la PDP.
 * TODO : finaliser le chemin + le format du payload d'après le Swagger Iopole
 * (Ressources → factures). Selon la doc, l'appel est asynchrone et renvoie un GUID
 * à conserver pour suivre le statut (via webhook).
 *
 * @param xml  XML Factur-X (CII EN16931) déjà généré et validé.
 */
export async function emitInvoiceXml(xml: string): Promise<{ guid?: string; raw: unknown }> {
  void xml // endpoint à brancher d'après le Swagger Iopole (Ressources → factures)
  throw new Error('emitInvoiceXml: endpoint Iopole non encore configuré (voir Swagger Ressources).')
}
