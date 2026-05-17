// Types TypeScript pour ECOPYE Pro Chantier

export type Role = 'OWNER' | 'ADMIN_COMPANY' | 'TECHNICIAN' | 'CLIENT' | 'ECOPYE_ADMIN'

export type Trade =
  | 'PLOMBIER'
  | 'CHAUFFAGISTE'
  | 'ELECTRICIEN'
  | 'RENOVATION_SALLE_DE_BAIN'
  | 'MACON'
  | 'PEINTRE'
  | 'CARRELEUR'
  | 'MENUISIER'
  | 'MULTI_SERVICES'
  | 'ENTREPRISE_GENERALE_BTP'

export type ClientType = 'PARTICULIER' | 'PROFESSIONNEL'

export type QuoteStatus = 'BROUILLON' | 'ENVOYE' | 'VU' | 'ACCEPTE' | 'REFUSE' | 'EXPIRE'

export type InvoiceType = 'ACOMPTE' | 'INTERMEDIAIRE' | 'FINALE' | 'AVOIR'

export type InvoiceStatus = 'BROUILLON' | 'ENVOYEE' | 'EN_ATTENTE' | 'PAYEE' | 'EN_RETARD' | 'ANNULEE'

export type PaymentStatus = 'EN_ATTENTE' | 'REUSSI' | 'REFUSE' | 'EXPIRE' | 'REMBOURSE'

export type PaymentMethod = 'VIREMENT' | 'CHEQUE' | 'CARTE_BANCAIRE' | 'ESPECES' | 'PRELEVEMENT'

export type ProjectStatus =
  | 'PREPARATION'
  | 'EN_ATTENTE_ACOMPTE'
  | 'EN_COURS'
  | 'CONTROLE_QUALITE'
  | 'RECEPTION_CLIENT'
  | 'TERMINE'
  | 'LITIGE_POTENTIEL'
  | 'ANNULE'

export type ProjectStepStatus = 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'VALIDE_CLIENT' | 'PROBLEME'

export type RiskLevel = 'FAIBLE' | 'MOYEN' | 'ELEVE' | 'CRITIQUE'

export type PhotoCategory = 'AVANT' | 'PENDANT' | 'APRES' | 'PROBLEME' | 'DETAIL' | 'RECEPTION'

export type DocumentType =
  | 'ASSURANCE_DECENNALE'
  | 'RESPONSABILITE_CIVILE'
  | 'ATTESTATION_URSSAF'
  | 'PV_RECEPTION'
  | 'BON_INTERVENTION'
  | 'BON_LIVRAISON'
  | 'CONDITIONS_GENERALES'
  | 'CHECKLIST_SECURITE'
  | 'RAPPORT_CHANTIER'
  | 'DOSSIER_LITIGE'
  | 'AUTRE'

export type DocumentStatus = 'VALIDE' | 'EXPIRE_BIENTOT' | 'EXPIRE' | 'MANQUANT'

export type ScheduleStatus = 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE' | 'REPORTE'

export type AiRequestType =
  | 'GENERER_DEVIS'
  | 'REDIGER_RELANCE'
  | 'RESUMER_CHANTIER'
  | 'PREPARER_COMPTE_RENDU'
  | 'ANALYSER_BUDGET'
  | 'PREPARER_LITIGE'
  | 'MESSAGE_WHATSAPP'
  | 'EMAIL_PROFESSIONNEL'
  | 'CHECKLIST_CHANTIER'

export type TicketStatus = 'OUVERT' | 'EN_COURS' | 'RESOLU' | 'FERME'
export type TicketPriority = 'FAIBLE' | 'NORMAL' | 'ELEVE' | 'URGENT'
export type SubscriptionPlan = 'STARTER' | 'PRO' | 'PREMIUM' | 'ENTREPRISE'
export type SubscriptionStatus = 'ACTIF' | 'SUSPENDU' | 'ANNULE' | 'ESSAI'

// ================================
// INTERFACES MÉTIER
// ================================

export interface User {
  id: string
  name: string
  email: string
  role: Role
  companyId?: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Company {
  id: string
  name: string
  ownerName: string
  siret: string
  trade: Trade
  address: string
  city: string
  postalCode: string
  phone: string
  email: string
  vatNumber?: string
  insuranceNumber?: string
  insuranceExpiryDate?: Date
  logoUrl?: string
  monthlyRevenueTarget: number
  active: boolean
  onboardingCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Client {
  id: string
  companyId: string
  type: ClientType
  firstName: string
  lastName: string
  companyName?: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  notes?: string
  trustScore: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface QuoteLine {
  id: string
  quoteId: string
  label: string
  description?: string
  quantity: number
  unit: string
  unitPriceHT: number
  vatRate: number
  discount: number
  totalHT: number
  order: number
  isLabor: boolean
}

export interface Quote {
  id: string
  companyId: string
  clientId: string
  client?: Client
  number: string
  title: string
  description?: string
  status: QuoteStatus
  subtotalHT: number
  vatAmount: number
  totalTTC: number
  depositPercentage: number
  laborCost: number
  materialCost: number
  notes?: string
  expiresAt?: Date
  sentAt?: Date
  acceptedAt?: Date
  createdAt: Date
  updatedAt: Date
  lines?: QuoteLine[]
}

export interface Invoice {
  id: string
  companyId: string
  clientId: string
  client?: Client
  quoteId?: string
  projectId?: string
  number: string
  type: InvoiceType
  status: InvoiceStatus
  subtotalHT: number
  vatAmount: number
  totalTTC: number
  amountPaid: number
  dueDate?: Date
  issuedAt: Date
  paidAt?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  id: string
  companyId: string
  clientId: string
  client?: Client
  invoiceId?: string
  amount: number
  status: PaymentStatus
  method: PaymentMethod
  paymentLink?: string
  qrCodeValue?: string
  receiptNumber?: string
  simulatedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface ProjectStep {
  id: string
  projectId: string
  title: string
  description?: string
  status: ProjectStepStatus
  order: number
  dueDate?: Date
  completedAt?: Date
  validatedByClient: boolean
  notes?: string
}

export interface Project {
  id: string
  companyId: string
  clientId: string
  client?: Client
  quoteId?: string
  title: string
  description?: string
  address: string
  city: string
  postalCode: string
  status: ProjectStatus
  plannedBudget: number
  actualBudget: number
  startDate?: Date
  endDate?: Date
  progress: number
  riskLevel: RiskLevel
  notes?: string
  createdAt: Date
  updatedAt: Date
  steps?: ProjectStep[]
}

export interface PhotoProof {
  id: string
  projectId: string
  uploadedById: string
  category: PhotoCategory
  url: string
  caption?: string
  takenAt: Date
  createdAt: Date
}

export interface Document {
  id: string
  companyId: string
  projectId?: string
  clientId?: string
  type: DocumentType
  title: string
  status: DocumentStatus
  fileUrl?: string
  expiresAt?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Technician {
  id: string
  companyId: string
  name: string
  email: string
  phone?: string
  trade: Trade
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ScheduleEvent {
  id: string
  companyId: string
  projectId?: string
  technicianId?: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  status: ScheduleStatus
  location?: string
  color?: string
  createdAt: Date
  updatedAt: Date
}

export interface AiRequest {
  id: string
  companyId: string
  userId: string
  type: AiRequestType
  prompt: string
  response: string
  createdAt: Date
}

export interface SupportTicket {
  id: string
  companyId: string
  userId: string
  subject: string
  status: TicketStatus
  priority: TicketPriority
  message: string
  response?: string
  createdAt: Date
  updatedAt: Date
}

export interface Subscription {
  id: string
  companyId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  monthlyPrice: number
  startedAt: Date
  endsAt?: Date
  trialEndsAt?: Date
  createdAt: Date
  updatedAt: Date
}

// ================================
// TYPES DASHBOARD / STATS
// ================================

export interface DashboardStats {
  revenueThisMonth: number
  revenuePreviousMonth: number
  quotesCount: number
  quotesAccepted: number
  invoicesOverdue: number
  activeProjects: number
  pendingPayments: number
  estimatedMargin: number
  disputeAlerts: number
}

export interface TreasuryStats {
  encaisse: number
  facture: number
  enAttente: number
  enRetard: number
  depenses: number
  marge: number
  previsionnel30j: number
  previsionnel60j: number
  previsionnel90j: number
}

// ================================
// LIBELLÉS FRANÇAIS
// ================================

export const TRADE_LABELS: Record<Trade, string> = {
  PLOMBIER: 'Plombier',
  CHAUFFAGISTE: 'Chauffagiste',
  ELECTRICIEN: 'Électricien',
  RENOVATION_SALLE_DE_BAIN: 'Rénovation salle de bain',
  MACON: 'Maçon',
  PEINTRE: 'Peintre',
  CARRELEUR: 'Carreleur',
  MENUISIER: 'Menuisier',
  MULTI_SERVICES: 'Multi-services',
  ENTREPRISE_GENERALE_BTP: 'Entreprise générale BTP',
}

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  BROUILLON: 'Brouillon',
  ENVOYE: 'Envoyé',
  VU: 'Vu par le client',
  ACCEPTE: 'Accepté',
  REFUSE: 'Refusé',
  EXPIRE: 'Expiré',
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  BROUILLON: 'Brouillon',
  ENVOYEE: 'Envoyée',
  EN_ATTENTE: 'En attente',
  PAYEE: 'Payée',
  EN_RETARD: 'En retard',
  ANNULEE: 'Annulée',
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PREPARATION: 'Préparation',
  EN_ATTENTE_ACOMPTE: "En attente d'acompte",
  EN_COURS: 'En cours',
  CONTROLE_QUALITE: 'Contrôle qualité',
  RECEPTION_CLIENT: 'Réception client',
  TERMINE: 'Terminé',
  LITIGE_POTENTIEL: 'Litige potentiel',
  ANNULE: 'Annulé',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  EN_ATTENTE: 'En attente',
  REUSSI: 'Réussi',
  REFUSE: 'Refusé',
  EXPIRE: 'Expiré',
  REMBOURSE: 'Remboursé',
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  ASSURANCE_DECENNALE: 'Assurance décennale',
  RESPONSABILITE_CIVILE: 'Responsabilité civile pro',
  ATTESTATION_URSSAF: 'Attestation URSSAF',
  PV_RECEPTION: 'PV de réception',
  BON_INTERVENTION: "Bon d'intervention",
  BON_LIVRAISON: 'Bon de livraison',
  CONDITIONS_GENERALES: 'Conditions générales',
  CHECKLIST_SECURITE: 'Checklist sécurité',
  RAPPORT_CHANTIER: 'Rapport chantier',
  DOSSIER_LITIGE: 'Dossier litige',
  AUTRE: 'Autre',
}
