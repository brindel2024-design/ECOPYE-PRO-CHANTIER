import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateLong(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function generateQuoteNumber(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `DEV-${year}-${rand}`
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `FAC-${year}-${rand}`
}

export function generateReceiptNumber(): string {
  const rand = Math.floor(Math.random() * 900000) + 100000
  return `REC-${rand}`
}

export function generatePaymentLink(invoiceId: string): string {
  const token = Math.random().toString(36).substring(2, 15)
  return `https://pay.ecopye.fr/sim/${token}`
}

export function generateQrValue(amount: number, reference: string): string {
  return `ECOPYE|SIM|${reference}|${amount}`
}

export function calculateProgress(steps: { status: string }[]): number {
  if (!steps || steps.length === 0) return 0
  const done = steps.filter((s) => s.status === 'TERMINE' || s.status === 'VALIDE_CLIENT').length
  return Math.round((done / steps.length) * 100)
}

export function getRiskColor(level: string): string {
  switch (level) {
    case 'FAIBLE': return 'text-green-600 bg-green-50'
    case 'MOYEN': return 'text-yellow-600 bg-yellow-50'
    case 'ELEVE': return 'text-orange-600 bg-orange-50'
    case 'CRITIQUE': return 'text-red-600 bg-red-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'ACCEPTE':
    case 'PAYEE':
    case 'REUSSI':
    case 'TERMINE':
    case 'VALIDE':
      return 'text-green-700 bg-green-100'
    case 'EN_COURS':
    case 'EN_ATTENTE':
    case 'PLANIFIE':
      return 'text-blue-700 bg-blue-100'
    case 'EN_RETARD':
    case 'EXPIRE':
    case 'LITIGE_POTENTIEL':
    case 'CRITIQUE':
      return 'text-red-700 bg-red-100'
    case 'REFUSE':
    case 'ANNULE':
    case 'ANNULEE':
      return 'text-gray-700 bg-gray-100'
    case 'BROUILLON':
      return 'text-gray-600 bg-gray-100'
    case 'ENVOYE':
    case 'ENVOYEE':
    case 'VU':
      return 'text-purple-700 bg-purple-100'
    case 'EXPIRE_BIENTOT':
      return 'text-orange-700 bg-orange-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export function daysUntil(date: Date | string | null | undefined): number | null {
  if (!date) return null
  const diff = new Date(date).getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
