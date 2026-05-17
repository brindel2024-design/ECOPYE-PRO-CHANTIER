import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding ECOPYE Pro Chantier (SQLite)...')

  // Nettoyage (ordre dépendances) — idempotent en dev
  await prisma.scheduleEvent.deleteMany()
  await prisma.invoiceLine.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.projectStep.deleteMany()
  await prisma.project.deleteMany()
  await prisma.quoteLine.deleteMany()
  await prisma.quote.deleteMany()
  await prisma.client.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.user.deleteMany()
  await prisma.technician.deleteMany()
  await prisma.company.deleteMany()

  // ---------------------------------------------------------------
  // Company
  // ---------------------------------------------------------------
  const company = await prisma.company.create({
    data: {
      name: 'Durand Rénovation',
      ownerName: 'Jean Durand',
      siret: '12345678901234',
      trade: 'RENOVATION_SALLE_DE_BAIN',
      address: '45 Rue des Artisans',
      city: 'Lyon',
      postalCode: '69003',
      phone: '04 78 12 34 56',
      email: 'contact@durand-renovation.fr',
      vatNumber: 'FR28123456789',
      insuranceNumber: 'DEC-2024-00892',
      insuranceExpiryDate: new Date('2025-12-31'),
      monthlyRevenueTarget: 25000,
      onboardingCompleted: true,
    },
  })

  // ---------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------
  const passwordHash = await bcrypt.hash('password123', 12)
  const adminHash = await bcrypt.hash('admin123', 12)

  const [jean, sarah] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Jean Durand',
        email: 'jean.durand@durand-renovation.fr',
        passwordHash,
        role: 'OWNER',
        companyId: company.id,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Sarah Martin',
        email: 'sarah.martin@durand-renovation.fr',
        passwordHash,
        role: 'ADMIN_COMPANY',
        companyId: company.id,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Admin ECOPYE',
        email: 'admin@ecopye.fr',
        passwordHash: adminHash,
        role: 'ECOPYE_ADMIN',
        companyId: null,
      },
    }),
  ])

  // ---------------------------------------------------------------
  // Technicians
  // ---------------------------------------------------------------
  const [tech1, tech2] = await Promise.all([
    prisma.technician.create({
      data: {
        companyId: company.id,
        name: 'Karim Benali',
        email: 'karim.benali@durand-renovation.fr',
        phone: '06 11 22 33 44',
        trade: 'PLOMBIER',
      },
    }),
    prisma.technician.create({
      data: {
        companyId: company.id,
        name: 'Lucas Petit',
        email: 'lucas.petit@durand-renovation.fr',
        phone: '06 55 66 77 88',
        trade: 'CARRELEUR',
      },
    }),
  ])

  // ---------------------------------------------------------------
  // Clients (PARTICULIER + PROFESSIONNEL)
  // ---------------------------------------------------------------
  const clientMarie = await prisma.client.create({
    data: {
      companyId: company.id,
      type: 'PARTICULIER',
      firstName: 'Marie',
      lastName: 'Laurent',
      email: 'marie.laurent@email.fr',
      phone: '06 12 34 56 78',
      address: '12 Rue de la Paix',
      city: 'Lyon',
      postalCode: '69001',
      trustScore: 9,
    },
  })

  const clientThomas = await prisma.client.create({
    data: {
      companyId: company.id,
      type: 'PARTICULIER',
      firstName: 'Thomas',
      lastName: 'Bernard',
      email: 'thomas.bernard@gmail.com',
      phone: '06 23 45 67 89',
      address: '8 Avenue Garibaldi',
      city: 'Villeurbanne',
      postalCode: '69100',
      trustScore: 7,
    },
  })

  const clientSci = await prisma.client.create({
    data: {
      companyId: company.id,
      type: 'PROFESSIONNEL',
      firstName: 'Sophie',
      lastName: 'Moreau',
      companyName: 'SCI Moreau Immobilier',
      email: 'contact@sci-moreau.fr',
      phone: '04 91 23 45 67',
      address: '23 Cours Julien',
      city: 'Marseille',
      postalCode: '13006',
      notes: 'Gestion de plusieurs lots locatifs',
      trustScore: 8,
    },
  })

  // ---------------------------------------------------------------
  // Quotes + lignes
  // ---------------------------------------------------------------
  const quote1 = await prisma.quote.create({
    data: {
      companyId: company.id,
      clientId: clientMarie.id,
      number: 'DEV-2025-001',
      title: 'Rénovation complète salle de bain',
      description: 'Dépose, plomberie, carrelage et faïence',
      status: 'ACCEPTE',
      subtotalHT: 8500,
      vatAmount: 1700,
      totalTTC: 10200,
      depositPercentage: 30,
      laborCost: 4500,
      materialCost: 4000,
      acceptedAt: new Date('2025-04-10'),
      lines: {
        create: [
          { label: 'Dépose ancienne salle de bain', quantity: 1, unit: 'forfait', unitPriceHT: 1200, vatRate: 20, totalHT: 1200, order: 0, isLabor: true },
          { label: 'Plomberie complète', quantity: 1, unit: 'forfait', unitPriceHT: 3300, vatRate: 20, totalHT: 3300, order: 1, isLabor: true },
          { label: 'Carrelage sol et mur', quantity: 25, unit: 'm2', unitPriceHT: 160, vatRate: 20, totalHT: 4000, order: 2, isLabor: false },
        ],
      },
    },
  })

  const quote2 = await prisma.quote.create({
    data: {
      companyId: company.id,
      clientId: clientThomas.id,
      number: 'DEV-2025-002',
      title: 'Remplacement chauffe-eau',
      description: 'Fourniture et pose chauffe-eau 200L',
      status: 'ENVOYE',
      subtotalHT: 1400,
      vatAmount: 280,
      totalTTC: 1680,
      depositPercentage: 30,
      laborCost: 400,
      materialCost: 1000,
      sentAt: new Date('2025-05-02'),
      lines: {
        create: [
          { label: 'Chauffe-eau 200L', quantity: 1, unit: 'unité', unitPriceHT: 1000, vatRate: 20, totalHT: 1000, order: 0, isLabor: false },
          { label: "Main d'œuvre pose", quantity: 1, unit: 'forfait', unitPriceHT: 400, vatRate: 20, totalHT: 400, order: 1, isLabor: true },
        ],
      },
    },
  })

  await prisma.quote.create({
    data: {
      companyId: company.id,
      clientId: clientSci.id,
      number: 'DEV-2025-003',
      title: 'Rénovation 3 appartements locatifs',
      description: 'Peinture et sols pour 3 lots',
      status: 'BROUILLON',
      subtotalHT: 12000,
      vatAmount: 2400,
      totalTTC: 14400,
      depositPercentage: 40,
      laborCost: 7000,
      materialCost: 5000,
      lines: {
        create: [
          { label: 'Peinture complète (3 lots)', quantity: 3, unit: 'lot', unitPriceHT: 2500, vatRate: 20, totalHT: 7500, order: 0, isLabor: true },
          { label: 'Sol stratifié', quantity: 90, unit: 'm2', unitPriceHT: 50, vatRate: 20, totalHT: 4500, order: 1, isLabor: false },
        ],
      },
    },
  })

  // ---------------------------------------------------------------
  // Projects + steps
  // ---------------------------------------------------------------
  const project1 = await prisma.project.create({
    data: {
      companyId: company.id,
      clientId: clientMarie.id,
      quoteId: quote1.id,
      title: 'Rénovation salle de bain — Laurent',
      description: 'Chantier issu du devis DEV-2025-001',
      address: '12 Rue de la Paix',
      city: 'Lyon',
      postalCode: '69001',
      status: 'EN_COURS',
      plannedBudget: 8500,
      actualBudget: 4200,
      startDate: new Date('2025-04-15'),
      progress: 55,
      riskLevel: 'FAIBLE',
      steps: {
        create: [
          { title: 'Dépose existant', status: 'TERMINE', order: 0, completedAt: new Date('2025-04-17'), validatedByClient: true },
          { title: 'Plomberie', status: 'EN_COURS', order: 1 },
          { title: 'Carrelage', status: 'EN_ATTENTE', order: 2 },
          { title: 'Réception client', status: 'EN_ATTENTE', order: 3 },
        ],
      },
    },
  })

  await prisma.project.create({
    data: {
      companyId: company.id,
      clientId: clientThomas.id,
      title: 'Remplacement chauffe-eau — Bernard',
      description: 'Préparation chantier',
      address: '8 Avenue Garibaldi',
      city: 'Villeurbanne',
      postalCode: '69100',
      status: 'PREPARATION',
      plannedBudget: 1400,
      actualBudget: 0,
      progress: 0,
      riskLevel: 'FAIBLE',
      steps: {
        create: [
          { title: 'Validation devis', status: 'EN_ATTENTE', order: 0 },
          { title: 'Commande matériel', status: 'EN_ATTENTE', order: 1 },
          { title: 'Pose', status: 'EN_ATTENTE', order: 2 },
        ],
      },
    },
  })

  // ---------------------------------------------------------------
  // Invoices + lignes
  // ---------------------------------------------------------------
  await prisma.invoice.create({
    data: {
      companyId: company.id,
      clientId: clientMarie.id,
      quoteId: quote1.id,
      projectId: project1.id,
      number: 'FAC-2025-001',
      type: 'ACOMPTE',
      status: 'PAYEE',
      subtotalHT: 2550,
      vatAmount: 510,
      totalTTC: 3060,
      amountPaid: 3060,
      issuedAt: new Date('2025-04-12'),
      paidAt: new Date('2025-04-14'),
      lines: {
        create: [
          { label: 'Acompte 30% — Rénovation SDB', quantity: 1, unit: 'forfait', unitPriceHT: 2550, vatRate: 20, totalHT: 2550, order: 0 },
        ],
      },
    },
  })

  await prisma.invoice.create({
    data: {
      companyId: company.id,
      clientId: clientMarie.id,
      quoteId: quote1.id,
      projectId: project1.id,
      number: 'FAC-2025-002',
      type: 'INTERMEDIAIRE',
      status: 'ENVOYEE',
      subtotalHT: 3000,
      vatAmount: 600,
      totalTTC: 3600,
      amountPaid: 0,
      issuedAt: new Date('2025-05-05'),
      dueDate: new Date('2025-05-20'),
      lines: {
        create: [
          { label: 'Situation intermédiaire — plomberie', quantity: 1, unit: 'forfait', unitPriceHT: 3000, vatRate: 20, totalHT: 3000, order: 0 },
        ],
      },
    },
  })

  await prisma.invoice.create({
    data: {
      companyId: company.id,
      clientId: clientThomas.id,
      number: 'FAC-2025-003',
      type: 'FINALE',
      status: 'BROUILLON',
      subtotalHT: 1400,
      vatAmount: 280,
      totalTTC: 1680,
      amountPaid: 0,
      issuedAt: new Date('2025-05-10'),
      lines: {
        create: [
          { label: 'Chauffe-eau 200L + pose', quantity: 1, unit: 'forfait', unitPriceHT: 1400, vatRate: 20, totalHT: 1400, order: 0 },
        ],
      },
    },
  })

  // ---------------------------------------------------------------
  // Subscription (PRO / ESSAI)
  // ---------------------------------------------------------------
  await prisma.subscription.create({
    data: {
      companyId: company.id,
      plan: 'PRO',
      status: 'ESSAI',
      monthlyPrice: 59,
      startedAt: new Date('2025-04-01'),
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  })

  // ---------------------------------------------------------------
  // ScheduleEvents
  // ---------------------------------------------------------------
  await prisma.scheduleEvent.createMany({
    data: [
      {
        companyId: company.id,
        projectId: project1.id,
        technicianId: tech1.id,
        userId: jean.id,
        title: 'Intervention plomberie — Laurent',
        description: 'Pose réseau eau chaude/froide',
        startDate: new Date('2025-05-19T08:00:00'),
        endDate: new Date('2025-05-19T17:00:00'),
        status: 'PLANIFIE',
        location: '12 Rue de la Paix, Lyon',
        color: '#3b82f6',
      },
      {
        companyId: company.id,
        projectId: project1.id,
        technicianId: tech2.id,
        userId: sarah.id,
        title: 'Pose carrelage — Laurent',
        startDate: new Date('2025-05-26T08:00:00'),
        endDate: new Date('2025-05-28T17:00:00'),
        status: 'PLANIFIE',
        location: '12 Rue de la Paix, Lyon',
        color: '#10b981',
      },
      {
        companyId: company.id,
        title: 'RDV commercial — SCI Moreau',
        description: 'Présentation devis 3 lots',
        startDate: new Date('2025-05-21T14:00:00'),
        endDate: new Date('2025-05-21T15:30:00'),
        status: 'PLANIFIE',
        color: '#f59e0b',
      },
    ],
  })

  console.log('✅ Seed terminé avec succès!')
  console.log('📧 Artisan : jean.durand@durand-renovation.fr / password123')
  console.log('📧 Admin   : admin@ecopye.fr / admin123')
}

main()
  .catch(e => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
