export const metadata = { title: 'Politique de confidentialité — ECOPYE Pro Chantier' }

export default function ConfidentialitePage() {
  return (
    <>
      <h1>Politique de confidentialité (RGPD)</h1>
      <p className="text-sm text-gray-500">Dernière mise à jour : 24 mai 2026</p>

      <p>
        ECOPYE Pro Chantier traite des données à caractère personnel pour fournir son service de
        gestion d&apos;activité pour artisans. Cette politique décrit, conformément au Règlement
        Général sur la Protection des Données (RGPD), quelles données nous collectons, pourquoi,
        comment elles sont protégées et comment exercer vos droits.
      </p>

      <h2>1. Responsable du traitement</h2>
      <p>
        Le responsable du traitement est l&apos;éditeur du service, identifié dans les{' '}
        <a href="/mentions-legales">mentions légales</a>. Contact dédié à la protection des
        données : <a href="mailto:rgpd@ecopye.fr">rgpd@ecopye.fr</a>.
      </p>

      <h2>2. Données collectées et finalités</h2>
      <table>
        <thead>
          <tr>
            <th>Catégorie</th>
            <th>Données concernées</th>
            <th>Finalité</th>
            <th>Base légale</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Compte utilisateur</td>
            <td>Nom, prénom, email, mot de passe haché (bcrypt)</td>
            <td>Authentification, contact</td>
            <td>Exécution du contrat</td>
          </tr>
          <tr>
            <td>Entreprise</td>
            <td>Raison sociale, SIRET, adresse, téléphone, email, métier</td>
            <td>Édition des devis et factures, mentions légales</td>
            <td>Exécution du contrat / obligation légale</td>
          </tr>
          <tr>
            <td>Clients de l&apos;artisan</td>
            <td>Nom, email, téléphone, adresse de chantier</td>
            <td>Gestion commerciale</td>
            <td>Intérêt légitime de l&apos;artisan (sous-traitant : ECOPYE)</td>
          </tr>
          <tr>
            <td>Documents</td>
            <td>Devis, factures, photos chantier, assurances, dossiers litige</td>
            <td>Traçabilité commerciale et légale</td>
            <td>Obligation légale (factures) / contrat</td>
          </tr>
          <tr>
            <td>Paiement</td>
            <td>Identifiant Stripe (jamais le numéro de carte)</td>
            <td>Encaissement de l&apos;abonnement</td>
            <td>Exécution du contrat</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Durées de conservation</h2>
      <ul>
        <li><strong>Compte actif</strong> : pendant toute la durée de l&apos;abonnement.</li>
        <li><strong>Compte clôturé</strong> : suppression sous 30 jours, sauf obligations comptables (factures conservées 10 ans selon art. L.123-22 Code de commerce).</li>
        <li><strong>Logs techniques</strong> : 12 mois maximum.</li>
        <li><strong>Photos de chantier</strong> : conservées tant que le compte est actif, supprimables à tout moment.</li>
      </ul>

      <h2>4. Hébergement</h2>
      <p>
        Les données sont hébergées sur un serveur Hostinger situé en France/Union Européenne.
        Les sauvegardes sont chiffrées et conservées sur la même infrastructure.
      </p>

      <h2>5. Vos droits</h2>
      <p>Vous disposez à tout moment des droits suivants&nbsp;:</p>
      <ul>
        <li><strong>Droit d&apos;accès</strong> : obtenir copie des données vous concernant</li>
        <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
        <li><strong>Droit à l&apos;effacement</strong> : suppression des données (hors obligations légales)</li>
        <li><strong>Droit à la portabilité</strong> : récupérer vos données dans un format ouvert</li>
        <li><strong>Droit d&apos;opposition</strong> : refuser certains traitements</li>
        <li><strong>Droit à la limitation</strong> : geler le traitement</li>
      </ul>
      <p>
        Pour exercer ces droits, écrivez à <a href="mailto:rgpd@ecopye.fr">rgpd@ecopye.fr</a>{' '}
        en justifiant de votre identité. Réponse sous 30 jours maximum.
      </p>
      <p>
        Vous pouvez également introduire une réclamation auprès de la CNIL{' '}
        (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>).
      </p>

      <h2>6. Sous-traitants</h2>
      <ul>
        <li><strong>Stripe</strong> (paiement) — DPA en place</li>
        <li><strong>Resend</strong> (envoi d&apos;emails transactionnels)</li>
        <li><strong>Hostinger</strong> (hébergement)</li>
        <li><strong>OpenRouter / Anthropic</strong> (assistant IA — les prompts saisis sont envoyés au modèle)</li>
      </ul>

      <h2>7. Cookies</h2>
      <p>
        ECOPYE Pro Chantier utilise uniquement des cookies techniques nécessaires à l&apos;authentification
        et au fonctionnement du service. Aucun cookie publicitaire ni de mesure d&apos;audience tiers
        n&apos;est déposé sans votre consentement préalable.
      </p>

      <h2>8. Sécurité</h2>
      <ul>
        <li>Connexions chiffrées HTTPS (Let&apos;s Encrypt)</li>
        <li>Mots de passe hachés (bcrypt, coût 12)</li>
        <li>Sessions signées (JWT)</li>
        <li>Accès admin séparé du compte artisan</li>
      </ul>

      <p className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
        ⚠️ <strong>Cette page est un modèle de base.</strong> Selon votre traitement réel, il peut être
        nécessaire de désigner un DPO, de réaliser une AIPD et d&apos;ajouter les coordonnées exactes
        avant exploitation commerciale.
      </p>
    </>
  )
}
