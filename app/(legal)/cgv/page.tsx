export const metadata = { title: 'CGV — ECOPYE Pro Chantier' }

export default function CGVPage() {
  return (
    <>
      <h1>Conditions Générales de Vente (CGV)</h1>
      <p className="text-sm text-gray-500">Dernière mise à jour : 24 mai 2026</p>

      <h2>1. Champ d&apos;application</h2>
      <p>
        Les présentes CGV régissent les abonnements payants au service ECOPYE Pro Chantier
        souscrits par des professionnels (artisans, entreprises du BTP).
      </p>

      <h2>2. Formules et tarifs</h2>
      <p>
        Trois formules sont proposées en abonnement mensuel reconductible tacitement&nbsp;:
      </p>
      <ul>
        <li><strong>Starter</strong> — 29 € HT / mois</li>
        <li><strong>Pro</strong> — 79 € HT / mois</li>
        <li><strong>Premium</strong> — 149 € HT / mois</li>
      </ul>
      <p>
        Les tarifs sont indiqués hors taxes. La TVA française au taux en vigueur (20 % à ce jour)
        s&apos;applique aux clients établis en France. Le détail des fonctionnalités est consultable
        sur la <a href="/pricing">page tarifs</a>.
      </p>

      <h2>3. Souscription</h2>
      <p>
        La souscription se fait en ligne via Stripe. L&apos;abonnement prend effet à la date du
        paiement validé. Une facture est émise pour chaque échéance et accessible dans le portail
        client.
      </p>

      <h2>4. Période d&apos;essai</h2>
      <p>
        Tout nouveau compte bénéficie de 14 jours d&apos;essai gratuit sans carte bancaire requise.
        Aucune somme n&apos;est débitée tant que l&apos;abonnement n&apos;a pas été activé volontairement.
      </p>

      <h2>5. Paiement</h2>
      <p>
        Le paiement est mensuel, par carte bancaire via Stripe. Le client garantit disposer de
        l&apos;autorisation nécessaire pour utiliser le moyen de paiement choisi. En cas de défaut de
        paiement, l&apos;accès aux fonctions payantes est suspendu jusqu&apos;à régularisation.
      </p>

      <h2>6. Droit de rétractation</h2>
      <p>
        L&apos;article L.221-3 du Code de la consommation s&apos;applique uniquement aux particuliers, ce
        qui n&apos;est pas la cible du Service. Toutefois, les nouveaux clients disposent de 14 jours
        d&apos;essai gratuit pour évaluer le Service sans engagement.
      </p>

      <h2>7. Résiliation</h2>
      <p>
        Le client peut résilier son abonnement à tout moment depuis le portail Stripe. La
        résiliation prend effet à la fin de la période en cours déjà payée — aucun remboursement
        prorata n&apos;est effectué, sauf disposition contraire.
      </p>

      <h2>8. Service après-vente</h2>
      <p>
        Le support est accessible par email à <a href="mailto:support@ecopye.fr">support@ecopye.fr</a>.
        Délai de réponse&nbsp;:
      </p>
      <ul>
        <li>Plan Starter&nbsp;: 48 h ouvrées</li>
        <li>Plan Pro&nbsp;: 24 h ouvrées</li>
        <li>Plan Premium&nbsp;: 4 h ouvrées</li>
      </ul>

      <h2>9. Modification des CGV</h2>
      <p>
        L&apos;éditeur se réserve le droit de modifier les présentes CGV. Toute modification sera
        notifiée par email au moins 30 jours avant son entrée en vigueur. Le client conserve la
        possibilité de résilier sans frais en cas de désaccord.
      </p>

      <h2>10. Litiges</h2>
      <p>
        Tout litige sera soumis aux tribunaux français compétents, après une tentative de résolution
        amiable préalable.
      </p>

      <p className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
        ⚠️ <strong>Modèle indicatif.</strong> À faire valider par un conseil juridique. Les
        coordonnées de l&apos;éditeur et le médiateur de la consommation sont à compléter dans les{' '}
        <a href="/mentions-legales">mentions légales</a>.
      </p>
    </>
  )
}
