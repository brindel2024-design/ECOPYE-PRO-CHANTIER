import { Badge } from '@/components/ui/badge'
import { getStatusColor } from '@/lib/utils'
import {
  QUOTE_STATUS_LABELS,
  INVOICE_STATUS_LABELS,
  PROJECT_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
} from '@/lib/types'
import type { QuoteStatus, InvoiceStatus, ProjectStatus, PaymentStatus, DocumentStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: string
  type?: 'quote' | 'invoice' | 'project' | 'payment' | 'document'
}

function getLabel(status: string, type?: string): string {
  switch (type) {
    case 'quote':
      return QUOTE_STATUS_LABELS[status as QuoteStatus] ?? status
    case 'invoice':
      return INVOICE_STATUS_LABELS[status as InvoiceStatus] ?? status
    case 'project':
      return PROJECT_STATUS_LABELS[status as ProjectStatus] ?? status
    case 'payment':
      return PAYMENT_STATUS_LABELS[status as PaymentStatus] ?? status
    default:
      return status
  }
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const colorClass = getStatusColor(status)
  const label = getLabel(status, type)

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  )
}
