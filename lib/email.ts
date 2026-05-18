import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
const resend = apiKey ? new Resend(apiKey) : null

export function isEmailConfigured(): boolean {
  return Boolean(apiKey && process.env.EMAIL_FROM)
}

export async function sendEmail(params: {
  to: string
  subject: string
  text: string
}): Promise<{ ok: boolean; error?: string }> {
  if (!resend || !process.env.EMAIL_FROM) {
    return { ok: false, error: 'Service email non configuré.' }
  }
  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: params.to,
      subject: params.subject,
      text: params.text,
    })
    if (error) {
      console.error('Resend error:', error)
      return { ok: false, error: "Échec de l'envoi de l'email." }
    }
    return { ok: true }
  } catch (e) {
    console.error('sendEmail error:', e)
    return { ok: false, error: "Erreur lors de l'envoi de l'email." }
  }
}
