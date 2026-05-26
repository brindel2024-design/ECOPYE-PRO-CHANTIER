# Automatisation SEO ECOPYE Pro Chantier

## Objectif

Le blog accepte des articles planifies. Un article present dans `lib/blog-posts.ts`
devient visible automatiquement a la date `publishedAt`, selon le fuseau
`Europe/Paris`. Les pages futures ne sont ni affichees dans le blog ni ajoutees
au sitemap avant leur date de publication.

## Articles programmes

| Date de publication | Article | Statut |
| --- | --- | --- |
| 2026-05-26 | Comment creer un devis artisan clair et professionnel | Publie |
| 2026-06-02 | Suivi photo de chantier : organiser les preuves avant et apres | Programme |
| 2026-06-09 | Facturation BTP : passer du devis accepte a la facture | Programme |
| 2026-06-16 | Centraliser devis, photos et paiements sur un chantier | Programme |

## Deploiement automatique

Le workflow `.github/workflows/deploy-production.yml` redeploie le site apres
une mise a jour de la branche `master`, sans utiliser le terminal Hostinger.

Configurer une seule fois les secrets GitHub de l'environnement `production` :

| Secret | Valeur attendue |
| --- | --- |
| `ECOPYE_VPS_HOST` | Adresse du VPS Hostinger |
| `ECOPYE_VPS_USER` | Utilisateur SSH de deploiement |
| `ECOPYE_VPS_SSH_KEY` | Cle privee reservee au deploiement automatique |

La cle privee ne doit jamais etre ajoutee au depot. La cle publique
correspondante doit etre autorisee sur le VPS.

## Extension a d'autres sites

L'agent peut appliquer la meme routine a un site officiel connecte :

1. definir son domaine, son depot ou CMS et ses canaux autorises ;
2. creer un adaptateur de publication et un deploiement securise ;
3. preparer le calendrier et les contenus ;
4. publier uniquement sur les comptes explicitement autorises ;
5. verifier les URL finales, l'indexabilite et les resultats disponibles.

Les reseaux sociaux, newsletters et outils de mesure exigent chacun une
connexion officielle distincte avant toute diffusion autonome.
