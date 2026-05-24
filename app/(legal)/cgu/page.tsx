export const metadata = { title: "CGU — ECOPYE Pro Chantier" }

export default function CGUPage() {
  return (
    <>
      <h1>Conditions Générales d&apos;Utilisation (CGU)</h1>
      <p className="text-sm text-gray-500">Dernière mise à jour : 24 mai 2026</p>

      <h2>1. Objet</h2>
      <p>
        Les présentes CGU régissent l&apos;accès et l&apos;utilisation du service ECOPYE Pro Chantier
        (le « Service »), plateforme de gestion d&apos;activité destinée aux artisans du BTP.
      </p>

      <h2>2. Acceptation</h2>
      <p>
        Toute personne créant un compte sur le Service reconnaît avoir lu et accepté les présentes
        CGU sans réserve. À défaut d&apos;acceptation, il convient de ne pas utiliser le Service.
      </p>

      <h2>3. Accès au service</h2>
      <p>
        L&apos;accès est conditionné à la création d&apos;un compte. L&apos;utilisateur s&apos;engage à fournir
        des informations exactes et à conserver la confidentialité de ses identifiants. Toute
        utilisation faite avec ses identifiants est réputée effectuée par l&apos;utilisateur.
      </p>

      <h2>4. Période d&apos;essai</h2>
      <p>
        Un essai gratuit de 14 jours est offert à l&apos;inscription, sans demande de carte bancaire.
        Au-delà, l&apos;accès aux fonctions payantes nécessite une souscription.
      </p>

      <h2>5. Obligations de l&apos;utilisateur</h2>
      <ul>
        <li>Ne pas utiliser le Service à des fins illicites</li>
        <li>Ne pas tenter de contourner les protections de sécurité</li>
        <li>Renseigner des informations légales exactes (SIRET, raison sociale, etc.)</li>
        <li>Respecter les droits des tiers (clients, employés, fournisseurs)</li>
      </ul>

      <h2>6. Disponibilité</h2>
      <p>
        L&apos;éditeur met en œuvre les moyens raisonnables pour assurer la disponibilité du Service
        mais ne garantit pas une disponibilité absolue. Des interruptions de maintenance peuvent
        survenir et seront, dans la mesure du possible, annoncées à l&apos;avance.
      </p>

      <h2>7. Limitation de responsabilité</h2>
      <p>
        L&apos;éditeur ne saurait être tenu responsable des dommages indirects, perte de chiffre
        d&apos;affaires ou de données résultant de l&apos;utilisation du Service. Le contenu publié par
        l&apos;utilisateur (devis, factures, photos, etc.) reste sous son entière responsabilité.
      </p>

      <h2>8. Données personnelles</h2>
      <p>
        Le traitement des données personnelles est décrit dans la{' '}
        <a href="/confidentialite">politique de confidentialité</a>.
      </p>

      <h2>9. Résiliation</h2>
      <p>
        L&apos;utilisateur peut résilier son compte à tout moment depuis son espace ou en écrivant à{' '}
        <a href="mailto:support@ecopye.fr">support@ecopye.fr</a>. L&apos;éditeur peut suspendre ou
        clôturer un compte en cas de non-respect des présentes CGU, après mise en demeure restée
        sans effet.
      </p>

      <h2>10. Statut bêta</h2>
      <p>
        Le Service est actuellement en phase bêta. Certaines fonctionnalités peuvent évoluer ou
        comporter des limitations. L&apos;utilisateur en est informé et accepte d&apos;utiliser le Service
        en l&apos;état.
      </p>

      <h2>11. Droit applicable</h2>
      <p>
        Les présentes CGU sont soumises au droit français. Tout litige relèvera de la compétence
        des tribunaux français.
      </p>

      <p className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
        ⚠️ <strong>Modèle indicatif.</strong> À faire valider par un conseil juridique avant
        exploitation commerciale.
      </p>
    </>
  )
}
