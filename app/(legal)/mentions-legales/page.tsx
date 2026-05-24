export const metadata = { title: 'Mentions légales — ECOPYE Pro Chantier' }

export default function MentionsLegalesPage() {
  return (
    <>
      <h1>Mentions légales</h1>
      <p className="text-sm text-gray-500">Dernière mise à jour : 24 mai 2026</p>

      <h2>Éditeur du service</h2>
      <p>
        Le service <strong>ECOPYE Pro Chantier</strong>, accessible à l&apos;adresse{' '}
        <a href="https://pro.ecopye.fr">https://pro.ecopye.fr</a>, est édité par&nbsp;:
      </p>
      <ul>
        <li><strong>Raison sociale</strong> : ECOPYE (à compléter avec la forme juridique exacte)</li>
        <li><strong>Adresse du siège</strong> : à compléter</li>
        <li><strong>SIRET</strong> : à compléter</li>
        <li><strong>Numéro de TVA intracommunautaire</strong> : à compléter</li>
        <li><strong>Capital social</strong> : à compléter (le cas échéant)</li>
        <li><strong>Directeur de la publication</strong> : à compléter</li>
        <li><strong>Email de contact</strong> : <a href="mailto:contact@ecopye.fr">contact@ecopye.fr</a></li>
      </ul>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par&nbsp;:
      </p>
      <ul>
        <li><strong>Hostinger International Ltd.</strong></li>
        <li>61 Lordou Vironos Street, 6023, Larnaca, Chypre</li>
        <li><a href="https://www.hostinger.fr" target="_blank" rel="noopener noreferrer">https://www.hostinger.fr</a></li>
      </ul>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des éléments figurant sur le site (textes, logos, images, code source) sont la
        propriété exclusive de l&apos;éditeur ou de ses partenaires. Toute reproduction, représentation
        ou exploitation non autorisée est interdite et constituerait une contrefaçon sanctionnée
        par les articles L.335-2 et suivants du Code de la propriété intellectuelle.
      </p>

      <h2>Responsabilité</h2>
      <p>
        L&apos;éditeur s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations diffusées,
        mais ne peut garantir l&apos;exhaustivité ou l&apos;absence d&apos;erreurs. L&apos;utilisation des fonctionnalités
        du service relève de la seule responsabilité de l&apos;utilisateur.
      </p>

      <h2>Médiateur de la consommation</h2>
      <p>
        Conformément à l&apos;article L.612-1 du Code de la consommation, en cas de litige non résolu
        par le service client, le consommateur peut faire appel gratuitement à un médiateur de la
        consommation. Coordonnées du médiateur : à compléter.
      </p>

      <p className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
        ⚠️ <strong>Cette page est un modèle.</strong> Les informations marquées « à compléter »
        doivent être renseignées par l&apos;éditeur avant la mise en service commerciale.
      </p>
    </>
  )
}
