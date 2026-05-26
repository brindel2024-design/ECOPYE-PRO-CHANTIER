export type BlogSection = {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export type BlogFaq = {
  question: string
  answer: string
}

export type BlogPost = {
  slug: string
  title: string
  description: string
  excerpt: string
  publishedAt: string
  readTime: string
  category: string
  intro: string
  sections: BlogSection[]
  faq: BlogFaq[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'devis-artisan-clair-professionnel',
    title: 'Comment créer un devis artisan clair et professionnel',
    description:
      "Découvrez les informations utiles d'un devis artisan, les bonnes pratiques de présentation et comment centraliser devis et suivi de chantier.",
    excerpt:
      "Un devis bien structuré simplifie les échanges avec le client et facilite le suivi du chantier, de la proposition jusqu'à la facture.",
    publishedAt: '2026-05-26',
    readTime: '5 min de lecture',
    category: 'Devis artisan',
    intro:
      'Un devis clair aide un artisan à présenter son intervention, cadrer les attentes du client et démarrer le chantier sur de bonnes bases.',
    sections: [
      {
        heading: 'Que doit permettre un devis bien organisé ?',
        paragraphs: [
          "Avant l'acceptation, le client doit comprendre la prestation proposée, son prix et les prochaines étapes. Pour l'artisan, le devis doit rester accessible pendant la relation client, notamment lorsque le chantier évolue ou qu'une facture doit être préparée.",
        ],
        bullets: [
          'Regrouper les coordonnées du client et les informations du chantier.',
          'Présenter les prestations et les montants de façon lisible.',
          'Retrouver facilement le devis accepté.',
          'Relier le devis au suivi du chantier et aux documents suivants.',
        ],
      },
      {
        heading: 'Éviter la dispersion des documents',
        paragraphs: [
          "Un devis rédigé dans un fichier isolé, envoyé par message puis archivé ailleurs peut vite devenir difficile à suivre. Les photos, informations client et factures risquent alors d'être séparées du document d'origine.",
          "Centraliser le travail permet de conserver une vue simple : le devis lance le dossier, les informations de suivi restent rattachées au chantier et la facturation peut s'appuyer sur les éléments déjà renseignés.",
        ],
      },
      {
        heading: 'Du devis au suivi du chantier',
        paragraphs: [
          "Le devis n'est pas seulement une étape commerciale. Une fois accepté, il peut servir de référence pour suivre les prestations, documenter l'avancement et retrouver les échanges utiles.",
          "ECOPYE Pro Chantier présente des fonctions de devis, suivi chantier, photos, facturation et paiements au sein d'une seule application. Le site indique également proposer un essai de 14 jours sans carte bancaire.",
        ],
      },
    ],
    faq: [
      {
        question: 'ECOPYE Pro Chantier fonctionne-t-il sur mobile ?',
        answer:
          "Le site officiel indique que l'application peut être installée directement sur smartphone et fonctionne sur Android et iPhone.",
      },
      {
        question: 'Peut-on essayer le service ?',
        answer:
          'Le site affiche un essai gratuit de 14 jours, sans carte bancaire et sans engagement.',
      },
    ],
  },
  {
    slug: 'suivi-photo-chantier-organiser-preuves',
    title: 'Suivi photo de chantier : organiser les preuves avant et après',
    description:
      'Découvrez comment classer les photos de chantier pour documenter l’avancement, faciliter les échanges et conserver un dossier clair.',
    excerpt:
      'Des photos rattachées au bon chantier permettent de suivre les étapes et de retrouver rapidement les éléments utiles.',
    publishedAt: '2026-06-02',
    readTime: '5 min de lecture',
    category: 'Suivi chantier',
    intro:
      'Sur le terrain, les photos complètent les notes et les documents. Bien organisées, elles donnent une vision concrète du chantier à chaque étape.',
    sections: [
      {
        heading: 'Pourquoi documenter un chantier en images ?',
        paragraphs: [
          'Les photos peuvent montrer la situation avant intervention, l’avancement et le résultat final. Elles facilitent aussi la compréhension lorsque plusieurs personnes participent au suivi du dossier.',
        ],
        bullets: [
          'Identifier la pièce, la zone ou la phase de travaux concernée.',
          'Conserver une chronologie compréhensible des interventions.',
          'Retrouver les éléments partagés avec le client.',
        ],
      },
      {
        heading: 'Classer les photos avec le dossier correspondant',
        paragraphs: [
          'Les images dispersées dans un téléphone ou une messagerie sont difficiles à exploiter plus tard. Les rattacher au chantier concerné évite de chercher parmi plusieurs interventions.',
          'Une organisation cohérente aide à retrouver le devis, les photos et la facture dans le même parcours de travail.',
        ],
      },
      {
        heading: 'Centraliser le suivi avec ECOPYE Pro Chantier',
        paragraphs: [
          'ECOPYE Pro Chantier présente une gestion réunissant chantiers, photos, devis et factures. Cette continuité permet de conserver les informations essentielles liées à une intervention dans un outil adapté aux artisans.',
        ],
      },
    ],
    faq: [
      {
        question: 'Quelles photos conserver pour un chantier ?',
        answer:
          'Les photos utiles dépendent de la prestation : état initial, étapes importantes, points particuliers et résultat final.',
      },
      {
        question: 'Pourquoi relier photos et devis ?',
        answer:
          'Cela permet de retrouver plus facilement le contexte de la prestation et les éléments documentés au cours du chantier.',
      },
    ],
  },
  {
    slug: 'facturation-btp-du-devis-accepte-a-la-facture',
    title: 'Facturation BTP : passer du devis accepté à la facture',
    description:
      'Découvrez comment organiser le passage du devis accepté à la facture pour conserver un suivi plus fluide de vos chantiers.',
    excerpt:
      'Une continuité entre devis, chantier et facture aide l’artisan à limiter les ressaisies et à garder ses dossiers organisés.',
    publishedAt: '2026-06-09',
    readTime: '5 min de lecture',
    category: 'Facturation artisan',
    intro:
      'Une fois un devis accepté, les informations déjà validées constituent une base utile pour suivre le chantier puis préparer la facturation.',
    sections: [
      {
        heading: 'Conserver le lien entre devis et facture',
        paragraphs: [
          'Lorsque les informations du client et de la prestation sont déjà structurées, le passage à la facture devient plus lisible. Le dossier reste compréhensible depuis la proposition initiale jusqu’au document de facturation.',
        ],
        bullets: [
          'Vérifier le client et le chantier concernés.',
          'S’appuyer sur les prestations validées.',
          'Conserver les documents dans un parcours cohérent.',
        ],
      },
      {
        heading: 'Limiter les ressaisies et les oublis',
        paragraphs: [
          'Multiplier les fichiers séparés augmente les risques de confusion. Une organisation centralisée aide à retrouver les informations nécessaires et à suivre les documents déjà produits.',
        ],
      },
      {
        heading: 'Gérer les documents dans une seule application',
        paragraphs: [
          'ECOPYE Pro Chantier présente des fonctions de devis, de suivi de chantier, de facturation et de paiements, avec un usage pensé pour les artisans du BTP.',
        ],
      },
    ],
    faq: [
      {
        question: 'Pourquoi partir du devis accepté ?',
        answer:
          'Le devis accepté fournit les éléments de référence de la prestation et facilite la continuité du dossier.',
      },
      {
        question: 'ECOPYE Pro Chantier propose-t-il la facturation ?',
        answer:
          'Le site officiel présente la facturation parmi les fonctionnalités de l’application.',
      },
    ],
  },
  {
    slug: 'centraliser-devis-photos-paiements-chantier',
    title: 'Centraliser devis, photos et paiements sur un chantier',
    description:
      'Pourquoi réunir devis, photos, factures et paiements permet aux artisans de suivre leurs chantiers avec plus de clarté.',
    excerpt:
      'Un dossier de chantier centralisé aide à retrouver les documents et à suivre les étapes utiles depuis le terrain.',
    publishedAt: '2026-06-16',
    readTime: '6 min de lecture',
    category: 'Gestion chantier',
    intro:
      'Un chantier produit plusieurs informations : coordonnées client, devis, photos, facture et paiement. Les regrouper permet de conserver une vision claire du dossier.',
    sections: [
      {
        heading: 'Un dossier unique pour chaque intervention',
        paragraphs: [
          'Un artisan gagne en lisibilité lorsque les documents liés à la même intervention ne sont pas répartis entre différents outils. Le dossier sert alors de fil conducteur au travail réalisé.',
        ],
        bullets: [
          'Accéder aux éléments du chantier depuis un même espace.',
          'Conserver les photos avec leur contexte.',
          'Retrouver devis, facture et suivi du paiement.',
        ],
      },
      {
        heading: 'Faciliter le travail depuis le terrain',
        paragraphs: [
          'L’accès sur smartphone est utile lorsque les informations doivent être consultées ou complétées en déplacement. Le site ECOPYE indique que son application peut être installée sur Android et iPhone.',
        ],
      },
      {
        heading: 'Découvrir ECOPYE Pro Chantier',
        paragraphs: [
          'ECOPYE Pro Chantier est présenté comme une application pour artisans réunissant devis, chantiers, photos, factures et paiements. Un essai gratuit de 14 jours est affiché sur le site officiel.',
        ],
      },
    ],
    faq: [
      {
        question: 'Quels documents centraliser pour un chantier ?',
        answer:
          'Les éléments utiles peuvent inclure le devis, les informations client, les photos de suivi, la facture et les données de paiement associées.',
      },
      {
        question: 'Peut-on découvrir l’application avant de choisir une offre ?',
        answer:
          'Le site officiel affiche un essai gratuit de 14 jours, sans carte bancaire et sans engagement.',
      },
    ],
  },
]

function todayInParis(now: Date): string {
  return new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export function isBlogPostPublished(post: BlogPost, now = new Date()): boolean {
  return post.publishedAt <= todayInParis(now)
}

export function getPublishedBlogPosts(now = new Date()): BlogPost[] {
  return BLOG_POSTS.filter((post) => isBlogPostPublished(post, now)).sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  )
}

export function getBlogPost(slug: string, now = new Date()): BlogPost | undefined {
  return getPublishedBlogPosts(now).find((post) => post.slug === slug)
}

export function formatBlogDate(date: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Paris',
  }).format(new Date(`${date}T12:00:00Z`))
}
