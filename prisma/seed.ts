import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding ECOPYE Pro Chantier...')

  // Créer entreprise
  const company = await prisma.company.create({
    data: {
      name: 'Durand Rénovation Services',
      ownerName: 'Jean Durand',
      siret: '82394710200013',
      trade: 'RENOVATION_SALLE_DE_BAIN',
      address: '45 Rue des Artisans',
      city: 'Lyon',
      postalCode: '69003',
      phone: '04 78 12 34 56',
      email: 'contact@durand-renovation.fr',
      vatNumber: 'FR28823947102',
      insuranceNumber: 'DEC-2024-00892',
      insuranceExpiryDate: new Date('2025-12-31'),
      monthlyRevenueTarget: 25000,
      onboardingCompleted: true,
    },
  })

  // Créer utilisateurs
  const passwordHash = await bcrypt.hash('password123', 12)

  await prisma.user.createMany({
    data: [
      {
        name: 'Jean Durand',
        email: 'jean.durand@durand-renovation.fr',
        passwordHash,
        role: 'OWNER',
        companyId: company.id,
      },
      {
        name: 'Sarah Martin',
        email: 'sarah.martin@durand-renovation.fr',
        passwordHash,
        role: 'ADMIN_COMPANY',
        companyId: company.id,
      },
      {
        name: 'Karim Benali',
        email: 'karim.benali@durand-renovation.fr',
        passwordHash,
        role: 'TECHNICIAN',
        companyId: company.id,
      },
      {
        name: 'Lucas Petit',
        email: 'lucas.petit@durand-renovation.fr',
        passwordHash,
        role: 'TECHNICIAN',
        companyId: company.id,
      },
      {
        name: 'Admin ECOPYE',
        email: 'admin@ecopye.fr',
        passwordHash,
        role: 'ECOPYE_ADMIN',
        companyId: null,
      },
    ],
  })

  // Créer abonnement
  await prisma.subscription.create({
    data: {
      companyId: company.id,
      plan: 'PRO',
      status: 'ACTIF',
      monthlyPrice: 59,
      startedAt: new Date('2024-01-01'),
    },
  })

  // Créer techniciens
  await prisma.technician.createMany({
    data: [
      {
        companyId: company.id,
        name: 'Karim Benali',
        email: 'karim.benali@durand-renovation.fr',
        phone: '06 11 22 33 44',
        trade: 'PLOMBIER',
      },
      {
        companyId: company.id,
        name: 'Lucas Petit',
        email: 'lucas.petit@durand-renovation.fr',
        phone: '06 55 66 77 88',
        trade: 'CARRELEUR',
      },
    ],
  })

  // Créer clients
  const clients = await prisma.client.createMany({
    data: [
      { companyId: company.id, type: 'PARTICULIER', firstName: 'Marie', lastName: 'Laurent', email: 'marie.laurent@email.fr', phone: '06 12 34 56 78', address: '12 Rue de la Paix', city: 'Lyon', postalCode: '69001', trustScore: 9 },
      { companyId: company.id, type: 'PARTICULIER', firstName: 'Thomas', lastName: 'Bernard', email: 'thomas.bernard@gmail.com', phone: '06 23 45 67 89', address: '8 Avenue Garibaldi', city: 'Villeurbanne', postalCode: '69100', trustScore: 7 },
      { companyId: company.id, type: 'PARTICULIER', firstName: 'Sophie', lastName: 'Moreau', email: 'sophie.moreau@outlook.fr', phone: '06 34 56 78 90', address: '23 Cours Julien', city: 'Marseille', postalCode: '13006', notes: 'Prudence sur les délais de paiement', trustScore: 5 },
      { companyId: company.id, type: 'PARTICULIER', firstName: 'Ahmed', lastName: 'Rahmani', email: 'ahmed.rahmani@hotmail.fr', phone: '06 45 67 89 01', address: '5 Place de la Comédie', city: 'Montpellier', postalCode: '34000', trustScore: 8 },
      { companyId: company.id, type: 'PARTICULIER', firstName: 'Claire', lastName: 'Dubois', email: 'claire.dubois@email.fr', phone: '06 56 78 90 12', address: '34 Rue de Rivoli', city: 'Paris', postalCode: '75004', notes: 'Client premium', trustScore: 10 },
      { companyId: company.id, type: 'PARTICULIER', firstName: 'Julien', lastName: 'Garnier', email: 'julien.garnier@gmail.com', phone: '06 67 89 01 23', address: '17 Rue Nationale', city: 'Lille', postalCode: '59000', trustScore: 6 },
      { companyId: company.id, type: 'PARTICULIER', firstName: 'Nadia', lastName: 'Ferrand', email: 'nadia.ferrand@email.fr', phone: '06 78 90 12 34', address: '9 Rue du Taur', city: 'Toulouse', postalCode: '31000', trustScore: 8 },
      { companyId: company.id, type: 'PARTICULIER', firstName: 'Michel', lastName: 'Robert', email: 'michel.robert@orange.fr', phone: '06 89 01 23 45', address: '21 Cours Berriat', city: 'Grenoble', postalCode: '38000', trustScore: 7 },
    ],
  })

  // Créer documents entreprise
  await prisma.document.createMany({
    data: [
      { companyId: company.id, type: 'ASSURANCE_DECENNALE', title: 'Assurance décennale 2024-2025', status: 'VALIDE', expiresAt: new Date('2025-12-31') },
      { companyId: company.id, type: 'RESPONSABILITE_CIVILE', title: 'RC Pro Allianz 2024', status: 'VALIDE', expiresAt: new Date('2025-03-31') },
      { companyId: company.id, type: 'ATTESTATION_URSSAF', title: 'Attestation URSSAF Q2 2024', status: 'EXPIRE_BIENTOT', expiresAt: new Date('2024-07-31') },
      { companyId: company.id, type: 'CONDITIONS_GENERALES', title: 'CGV ECOPYE Pro Chantier', status: 'VALIDE' },
    ],
  })

  console.log('✅ Seed terminé avec succès!')
  console.log('📧 Compte démo: jean.durand@durand-renovation.fr')
  console.log('🔑 Mot de passe: password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
