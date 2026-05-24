export const metadata = { title: 'Contact — ECOPYE Pro Chantier' }

export default function ContactPage() {
  return (
    <>
      <h1>Contact</h1>
      <p className="text-sm text-gray-500">Une question, une demande commerciale, un problème technique ? Voici comment nous joindre.</p>

      <h2>Support technique</h2>
      <p>
        Email&nbsp;: <a href="mailto:support@ecopye.fr">support@ecopye.fr</a>
        <br />
        Pour&nbsp;: questions sur le service, bugs, configuration, perte d&apos;accès, problèmes de
        paiement.
      </p>

      <h2>Commercial</h2>
      <p>
        Email&nbsp;: <a href="mailto:pro@ecopye.fr">pro@ecopye.fr</a>
        <br />
        Pour&nbsp;: demande de devis Entreprise, plans sur mesure, partenariats.
      </p>

      <h2>Protection des données (RGPD)</h2>
      <p>
        Email&nbsp;: <a href="mailto:rgpd@ecopye.fr">rgpd@ecopye.fr</a>
        <br />
        Pour&nbsp;: exercer vos droits d&apos;accès, rectification, suppression, portabilité de vos
        données personnelles. Réponse sous 30 jours maximum.
      </p>

      <h2>Adresse postale</h2>
      <p>À compléter par l&apos;éditeur dans les <a href="/mentions-legales">mentions légales</a>.</p>

      <p className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
        Avant de nous écrire pour un problème technique, vérifiez le statut du service et consultez
        la <a href="/#faq" className="underline">FAQ</a>.
      </p>
    </>
  )
}
