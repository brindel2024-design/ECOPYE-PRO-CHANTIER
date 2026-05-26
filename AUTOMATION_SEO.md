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

Le script `scripts/auto-deploy-seo.sh` est installe une fois sur le VPS
Hostinger. Toutes les 15 minutes, le VPS controle la branche `master`. Si une
mise a jour autorisee est disponible, il construit le site et recharge
`ecopye-pro`. S'il trouve des modifications locales non enregistrees sur le
serveur, il s'arrete sans les ecraser.

Cette approche evite de transmettre une cle privee du VPS a GitHub.

Installation initiale sur le terminal Hostinger, apres publication de ce
script sur `master` :

```bash
cd /opt/ECOPYE-PRO-CHANTIER
git pull --ff-only origin master
chmod +x scripts/auto-deploy-seo.sh
(crontab -l 2>/dev/null | grep -v 'auto-deploy-seo.sh'; echo '*/15 * * * * /opt/ECOPYE-PRO-CHANTIER/scripts/auto-deploy-seo.sh >> /var/log/ecopye-auto-deploy.log 2>&1') | crontab -
./scripts/auto-deploy-seo.sh
```

## Extension a d'autres sites

L'agent peut appliquer la meme routine a un site officiel connecte :

1. definir son domaine, son depot ou CMS et ses canaux autorises ;
2. creer un adaptateur de publication et un deploiement securise ;
3. preparer le calendrier et les contenus ;
4. publier uniquement sur les comptes explicitement autorises ;
5. verifier les URL finales, l'indexabilite et les resultats disponibles.

Les reseaux sociaux, newsletters et outils de mesure exigent chacun une
connexion officielle distincte avant toute diffusion autonome.
