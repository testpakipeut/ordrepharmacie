import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Article from '../models/Article.js';

dotenv.config();

const articles = [
  // 1. Article pédagogique - Énergie
  {
    title: "Comment choisir son installation solaire au Gabon : Guide complet 2024",
    slug: "comment-choisir-installation-solaire-gabon-guide-2024",
    excerpt: "Découvrez les critères essentiels pour bien dimensionner votre installation solaire photovoltaïque selon vos besoins énergétiques au Gabon.",
    content: `
# Introduction

L'énergie solaire représente une solution idéale pour le Gabon, avec un ensoleillement optimal toute l'année. Mais comment choisir la bonne installation ? Ce guide complet vous aide à faire le bon choix.

## 1. Évaluer votre consommation énergétique

La première étape consiste à calculer votre consommation quotidienne en kWh. Relevez vos factures d'électricité des 6 derniers mois pour avoir une moyenne fiable.

## 2. Les composants essentiels

Une installation solaire complète comprend :
- **Panneaux photovoltaïques** : Captent l'énergie solaire
- **Onduleur** : Convertit le courant continu en alternatif
- **Batteries** : Stockent l'énergie pour la nuit
- **Régulateur de charge** : Protège les batteries

## 3. Dimensionnement

Pour une maison moyenne au Gabon (consommation 10 kWh/jour), prévoyez :
- 3 à 4 kWc de panneaux
- Un onduleur de 3 à 5 kW
- 10 à 15 kWh de batteries lithium

## 4. Budget et rentabilité

L'investissement initial est compensé par :
- Réduction de 80-95% de la facture d'électricité
- Retour sur investissement en 4-6 ans
- Durée de vie de 25 ans pour les panneaux

## Conclusion

Une installation bien dimensionnée vous garantit l'autonomie énergétique et des économies substantielles. N'hésitez pas à contacter nos experts CIPS pour une étude personnalisée gratuite.
    `,
    featuredImage: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200",
    category: "pedagogique",
    pole: "energie",
    author: {
      name: "Ingénieur Paul Moussavou",
      role: "Expert Énergie Solaire",
      avatar: null
    },
    seo: {
      metaTitle: "Guide Complet : Choisir son Installation Solaire au Gabon 2024",
      metaDescription: "Découvrez comment bien dimensionner votre installation solaire photovoltaïque au Gabon. Guide pratique avec conseils d'experts.",
      keywords: ["solaire gabon", "installation photovoltaïque", "énergie renouvelable", "panneaux solaires libreville", "autonomie énergétique"]
    },
    tags: ["solaire", "guide", "dimensionnement", "économies", "gabon"],
    readTime: 8,
    featured: true,
    publishedAt: new Date('2024-10-15')
  },

  // 2. Actualités secteur - Drone
  {
    title: "Le secteur des drones professionnels en pleine expansion en Afrique centrale",
    slug: "drones-professionnels-expansion-afrique-centrale",
    excerpt: "Le marché africain des drones devrait croître de 35% par an d'ici 2028, porté par les besoins en cartographie, agriculture et inspection d'infrastructures.",
    content: `
Le marché des drones professionnels connaît une croissance exceptionnelle en Afrique centrale, avec le Gabon en première ligne de cette révolution technologique.

## Une croissance impressionnante

Selon les dernières études, le secteur devrait croître de 35% par an d'ici 2028, soutenu par :

- Les projets d'infrastructure (routes, ponts, plateformes pétrolières)
- L'agriculture de précision
- La surveillance environnementale
- L'inspection industrielle

## Le Gabon en pionnier

Notre pays se distingue par :
- Une réglementation claire et favorable
- Des projets pilotes gouvernementaux
- L'émergence d'entreprises spécialisées comme ODS (Optimum Drone Services)

## Applications concrètes

Les drones sont déjà utilisés pour :
- Cartographier les parcs nationaux
- Inspecter les installations pétrolières offshore
- Surveiller les cultures de palmiers à huile
- Modéliser les villes en 3D

## Formation et emplois

La demande de télépilotes certifiés explose, créant de nouvelles opportunités d'emploi qualifié au Gabon.
    `,
    featuredImage: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1200",
    category: "actualites",
    pole: "drone",
    author: {
      name: "Équipe CIPS",
      role: "Rédaction"
    },
    seo: {
      metaTitle: "Drones Professionnels : Boom du Secteur en Afrique Centrale",
      metaDescription: "Le marché des drones en Afrique centrale devrait croître de 35% par an. Découvrez les opportunités au Gabon.",
      keywords: ["drones afrique", "drone gabon", "télépilote", "cartographie aérienne", "inspection drone"]
    },
    tags: ["drones", "technologie", "afrique", "emploi", "innovation"],
    readTime: 6,
    featured: true,
    publishedAt: new Date('2024-10-20')
  },

  // 3. Comparatif - Énergie
  {
    title: "Solaire vs Groupe électrogène : Quel est le meilleur choix économique ?",
    slug: "solaire-vs-groupe-electrogene-comparatif-economique",
    excerpt: "Analyse comparative détaillée des coûts réels entre énergie solaire et groupe électrogène sur 10 ans au Gabon.",
    content: `
Vous hésitez entre installer des panneaux solaires ou acheter un groupe électrogène ? Voici une analyse économique complète pour vous aider à décider.

## Coûts d'investissement initial

**Groupe électrogène (10 kW)** :
- Achat : 1 500 000 FCFA
- Installation : 200 000 FCFA
- **Total : 1 700 000 FCFA**

**Installation solaire (10 kWc)** :
- Panneaux + onduleur + batteries : 8 500 000 FCFA
- Installation : 500 000 FCFA
- **Total : 9 000 000 FCFA**

## Coûts d'exploitation (par an)

**Groupe électrogène** :
- Carburant : 3 600 000 FCFA (300L/mois)
- Maintenance : 400 000 FCFA
- **Total : 4 000 000 FCFA/an**

**Installation solaire** :
- Maintenance : 150 000 FCFA
- **Total : 150 000 FCFA/an**

## Comparatif sur 10 ans

**Groupe électrogène** :
- Investissement : 1 700 000 FCFA
- Exploitation (10 ans) : 40 000 000 FCFA
- **TOTAL : 41 700 000 FCFA**

**Installation solaire** :
- Investissement : 9 000 000 FCFA
- Exploitation (10 ans) : 1 500 000 FCFA
- **TOTAL : 10 500 000 FCFA**

## Économie réalisée : 31 200 000 FCFA

L'énergie solaire est **4 fois moins chère** sur 10 ans, sans compter les bénéfices environnementaux (zéro émission, zéro bruit).

## Conclusion

Malgré un coût initial plus élevé, le solaire est rentabilisé en moins de 3 ans et génère des économies massives sur le long terme.
    `,
    featuredImage: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=1200",
    category: "comparatifs",
    pole: "energie",
    author: {
      name: "Service Commercial CIPS",
      role: "Analyse"
    },
    seo: {
      metaTitle: "Comparatif Solaire vs Groupe Électrogène : Analyse Coûts 10 ans",
      metaDescription: "Solaire ou groupe électrogène ? Découvrez le vrai coût sur 10 ans et faites des économies de 31M FCFA.",
      keywords: ["solaire vs groupe", "comparatif énergie", "économies solaire", "rentabilité photovoltaïque", "gabon"]
    },
    tags: ["comparatif", "économies", "solaire", "groupe électrogène", "rentabilité"],
    readTime: 7,
    featured: false,
    publishedAt: new Date('2024-10-10')
  },

  // 4. Innovation - Santé
  {
    title: "Télémédecine au Gabon : Les cabines médicales connectées révolutionnent l'accès aux soins",
    slug: "telemedecine-gabon-cabines-medicales-connectees",
    excerpt: "Les cabines médicales autonomes équipées de capteurs intelligents permettent désormais des consultations à distance dans les zones rurales.",
    content: `
La télémédecine fait un bond en avant au Gabon avec l'arrivée des cabines médicales connectées, une innovation qui pourrait transformer l'accès aux soins dans tout le pays.

## Le concept

Des cabines autonomes de type "photomaton médical" équipées de :
- Capteurs de tension artérielle
- Thermomètre infrarouge
- Oxymètre de pouls
- ECG
- Webcam HD pour téléconsultation

## Comment ça marche ?

1. Le patient entre dans la cabine
2. Les capteurs mesurent automatiquement les constantes vitales
3. Un médecin consulte à distance via vidéo
4. Diagnostic et prescription envoyés par email/SMS

## Avantages

- **Accessibilité** : Disponible 24/7 dans les zones reculées
- **Rapidité** : Consultation en 10-15 minutes
- **Coût** : 2 à 3 fois moins cher qu'une consultation classique
- **Qualité** : Mesures précises par capteurs médicaux certifiés

## Déploiement au Gabon

CIPS a déjà installé 3 cabines pilotes à Franceville, avec plans d'expansion à Libreville, Port-Gentil et Oyem.

## Impact

Plus de 500 consultations réalisées en 3 mois, avec un taux de satisfaction de 92%.

Cette innovation rapproche les soins de qualité des populations éloignées des centres urbains.
    `,
    featuredImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200",
    category: "innovations",
    pole: "sante",
    author: {
      name: "Dr. Marie Obame",
      role: "Directrice Médicale"
    },
    seo: {
      metaTitle: "Cabines Médicales Connectées : Innovation Télémédecine Gabon",
      metaDescription: "Découvrez comment les cabines médicales intelligentes révolutionnent l'accès aux soins au Gabon.",
      keywords: ["télémédecine gabon", "cabine médicale", "santé connectée", "consultation distance", "innovation santé"]
    },
    tags: ["télémédecine", "innovation", "santé", "technologie", "accès soins"],
    readTime: 6,
    featured: true,
    publishedAt: new Date('2024-10-25')
  },

  // 5. Communiqué - Partenariat
  {
    title: "CIPS annonce un partenariat stratégique avec SUN X pour l'énergie solaire",
    slug: "cips-partenariat-sun-x-energie-solaire",
    excerpt: "Le Groupe CIPS devient distributeur officiel de SUN X au Gabon, renforçant son offre en solutions énergétiques de pointe.",
    content: `
## Libreville, le 1er octobre 2024

Le Groupe CIPS (Conception Innovante pour la Sécurité) est fier d'annoncer la signature d'un partenariat stratégique avec **SUN X**, leader mondial des solutions solaires intelligentes.

### À propos de ce partenariat

Ce partenariat permettra à CIPS de :
- Distribuer la gamme complète SUN X au Gabon
- Bénéficier de tarifs préférentiels
- Accéder aux dernières innovations technologiques
- Former ses équipes aux standards internationaux

### Produits disponibles

La gamme SUN X comprend :
- Panneaux photovoltaïques haute performance (jusqu'à 550W)
- Onduleurs hybrides intelligents
- Batteries lithium longue durée
- Systèmes de monitoring en temps réel

### Impact pour les clients

Nos clients gabonais bénéficieront de :
- **Technologie de pointe** avec garantie constructeur 25 ans
- **Prix compétitifs** grâce à notre volume d'achat
- **Support technique** local et international
- **Disponibilité immédiate** des pièces détachées

### Déclaration

*"Ce partenariat avec SUN X marque une étape importante dans notre mission de démocratiser l'accès à l'énergie solaire au Gabon. Nous sommes ravis d'offrir à nos clients les meilleures technologies mondiales."* - Directeur Général, Groupe CIPS

### Contact Presse
Pour toute demande d'information : contact@cips-gabon.com
    `,
    featuredImage: "https://images.unsplash.com/photo-1521791055366-0d553872125f?w=1200",
    category: "communiques",
    pole: "energie",
    author: {
      name: "Service Communication CIPS",
      role: "Communiqué de presse"
    },
    seo: {
      metaTitle: "CIPS x SUN X : Partenariat Stratégique Énergie Solaire Gabon",
      metaDescription: "CIPS devient distributeur officiel SUN X au Gabon. Solutions solaires de pointe maintenant disponibles.",
      keywords: ["partenariat CIPS", "SUN X gabon", "distributeur solaire", "panneaux photovoltaïques"]
    },
    tags: ["partenariat", "communiqué", "SUN X", "distribution", "énergie"],
    readTime: 4,
    featured: false,
    publishedAt: new Date('2024-10-01')
  },

  // 6. Pédagogique - Cybersécurité
  {
    title: "5 erreurs de cybersécurité que font les entreprises gabonaises (et comment les éviter)",
    slug: "5-erreurs-cybersecurite-entreprises-gabon",
    excerpt: "Les cyberattaques augmentent de 40% par an en Afrique. Découvrez les 5 erreurs les plus courantes et comment protéger votre entreprise.",
    content: `
La cybersécurité est devenue un enjeu critique pour les entreprises gabonaises. Voici les 5 erreurs les plus fréquentes et comment les corriger.

## 1. Mots de passe faibles ou réutilisés

**Le problème** : "123456", "password", "admin"... Ces mots de passe sont piratés en quelques secondes.

**La solution** :
- Utiliser des mots de passe d'au moins 12 caractères
- Mélanger majuscules, chiffres et symboles
- Utiliser un gestionnaire de mots de passe
- Activer l'authentification à 2 facteurs (2FA)

## 2. Logiciels obsolètes

**Le problème** : Ne pas installer les mises à jour de sécurité expose vos systèmes aux failles connues.

**La solution** :
- Activer les mises à jour automatiques
- Remplacer les logiciels en fin de vie
- Auditer régulièrement votre parc informatique

## 3. Absence de sauvegardes

**Le problème** : Un ransomware peut chiffrer toutes vos données en quelques minutes.

**La solution** :
- Sauvegardes automatiques quotidiennes
- Règle 3-2-1 : 3 copies, 2 supports, 1 hors site
- Tester régulièrement la restauration

## 4. Personnel non formé

**Le problème** : 90% des cyberattaques réussies commencent par une erreur humaine.

**La solution** :
- Former le personnel aux bonnes pratiques
- Sensibiliser au phishing
- Simuler des attaques pour tester la vigilance

## 5. Pas de pare-feu ni antivirus

**Le problème** : Une entreprise sans protection = une porte ouverte aux hackers.

**La solution** :
- Installer un pare-feu professionnel
- Déployer un antivirus de qualité sur tous les postes
- Utiliser un VPN pour les connexions distantes

## Conclusion

Un audit de cybersécurité CIPS peut identifier vos vulnérabilités en 48h. Ne laissez pas votre entreprise devenir la prochaine victime.

**Contactez-nous pour un audit gratuit.**
    `,
    featuredImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200",
    category: "pedagogique",
    pole: "securite",
    author: {
      name: "Expert Sécurité CIPS",
      role: "Consultant Cybersécurité"
    },
    seo: {
      metaTitle: "5 Erreurs Cybersécurité Entreprises Gabonaises - Guide CIPS",
      metaDescription: "Les cyberattaques explosent au Gabon. Découvrez les 5 erreurs fatales et comment protéger votre entreprise.",
      keywords: ["cybersécurité gabon", "protection entreprise", "audit sécurité", "piratage", "ransomware"]
    },
    tags: ["cybersécurité", "entreprise", "protection", "audit", "formation"],
    readTime: 8,
    featured: false,
    publishedAt: new Date('2024-09-20')
  },

  // 7. Actualités - Géospatial
  {
    title: "Cartographie 3D : Libreville lance son projet de ville intelligente",
    slug: "cartographie-3d-libreville-ville-intelligente",
    excerpt: "La capitale gabonaise se dote d'une cartographie 3D ultra-précise pour optimiser son urbanisme et ses infrastructures.",
    content: `
Libreville entre dans l'ère des smart cities avec un ambitieux projet de cartographie 3D de l'ensemble de la ville.

## Un projet d'envergure

La mairie de Libreville a lancé la cartographie complète de la capitale en 3D, couvrant :
- 180 km² de surface urbaine
- Tous les bâtiments et infrastructures
- Le réseau routier et les équipements publics
- La végétation urbaine

## Technologies utilisées

Le projet utilise :
- **Drones professionnels** pour la capture aérienne
- **Photogrammétrie** pour la modélisation 3D
- **LiDAR** pour la précision centimétrique
- **IA** pour le traitement automatique des données

## Applications concrètes

Cette cartographie servira à :
- Planifier les nouveaux quartiers
- Optimiser les réseaux (eau, électricité, internet)
- Gérer les risques d'inondation
- Améliorer la circulation
- Créer des simulations urbaines

## Timeline

- Phase 1 (terminée) : Centre-ville - 30 km²
- Phase 2 (en cours) : Quartiers périphériques - 100 km²
- Phase 3 (2025) : Extension et mises à jour régulières

## Partenaires

CIPS, via son pôle traitement de données géospatiales, est partenaire technique du projet aux côtés de la mairie.

## Impact

Cette initiative positionne Libreville parmi les capitales africaines les plus avancées en matière de gestion urbaine numérique.
    `,
    featuredImage: "https://images.unsplash.com/photo-1533158628620-7e35717d36e7?w=1200",
    category: "actualites",
    pole: "geospatial",
    author: {
      name: "Équipe CIPS",
      role: "Rédaction"
    },
    seo: {
      metaTitle: "Libreville Smart City : Cartographie 3D Ville Intelligente",
      metaDescription: "Libreville se cartographie en 3D pour devenir une ville intelligente. Découvrez ce projet innovant.",
      keywords: ["cartographie 3D", "smart city gabon", "libreville", "urbanisme", "ville intelligente"]
    },
    tags: ["cartographie", "3D", "smart city", "libreville", "urbanisme"],
    readTime: 5,
    featured: false,
    publishedAt: new Date('2024-09-15')
  },

  // 8. Innovation - Général
  {
    title: "L'intelligence artificielle au service du développement durable en Afrique",
    slug: "intelligence-artificielle-developpement-durable-afrique",
    excerpt: "Comment l'IA transforme les secteurs de l'énergie, de l'agriculture et de la santé sur le continent africain.",
    content: `
L'intelligence artificielle n'est plus de la science-fiction : elle transforme déjà de nombreux secteurs en Afrique, avec des applications concrètes au service du développement durable.

## IA et Énergie

**Optimisation des réseaux solaires** :
- Prédiction de la production selon la météo
- Gestion intelligente du stockage
- Maintenance prédictive des équipements

**Impact** : Augmentation du rendement de 15-20%

## IA et Agriculture

**Agriculture de précision** :
- Détection précoce des maladies des cultures (drones + IA)
- Optimisation de l'irrigation
- Prévision des rendements

**Impact** : Réduction de 30% de l'utilisation d'eau et pesticides

## IA et Santé

**Diagnostic assisté** :
- Analyse d'images médicales (radiographies, échographies)
- Détection précoce de maladies
- Orientation des patients vers les bons spécialistes

**Impact** : Taux de diagnostic correct augmenté de 25%

## IA et Environnement

**Surveillance environnementale** :
- Détection automatique de la déforestation
- Suivi de la faune sauvage
- Prédiction des catastrophes naturelles

**Impact** : Réaction 10x plus rapide aux menaces environnementales

## Le rôle de CIPS

CIPS intègre l'IA dans tous ses pôles d'activité :
- Optimisation énergétique
- Traitement automatique d'images drone
- Détection d'intrusions en cybersécurité
- Diagnostic médical assisté

## Conclusion

L'IA n'est pas réservée aux pays développés : l'Afrique peut sauter des étapes technologiques et devenir un leader de l'IA éthique et durable.
    `,
    featuredImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200",
    category: "innovations",
    pole: "general",
    author: {
      name: "Dr. Tech CIPS",
      role: "Responsable Innovation"
    },
    seo: {
      metaTitle: "Intelligence Artificielle et Développement Durable en Afrique",
      metaDescription: "Comment l'IA transforme l'énergie, l'agriculture et la santé en Afrique. Applications concrètes.",
      keywords: ["IA afrique", "intelligence artificielle", "développement durable", "innovation technologique"]
    },
    tags: ["IA", "intelligence artificielle", "innovation", "développement durable", "afrique"],
    readTime: 9,
    featured: true,
    publishedAt: new Date('2024-11-01')
  },

  // 9. Comparatif - Drone
  {
    title: "Inspection par drone vs méthodes traditionnelles : Quel ROI pour votre entreprise ?",
    slug: "inspection-drone-vs-methodes-traditionnelles-roi",
    excerpt: "Analyse comparative des coûts, de la sécurité et de l'efficacité entre l'inspection par drone et les méthodes classiques.",
    content: `
L'inspection d'infrastructures par drone révolutionne le secteur. Mais quel est le véritable retour sur investissement comparé aux méthodes traditionnelles ?

## Cas d'étude : Inspection d'une plateforme pétrolière offshore

### Méthode traditionnelle (cordistes)

**Coûts** :
- Équipe de 6 cordistes : 2 500 000 FCFA/jour
- Durée : 10 jours
- Location équipements sécurité : 1 000 000 FCFA
- Arrêt partiel production : 15 000 000 FCFA
- **TOTAL : 41 000 000 FCFA**

**Risques** :
- Travail en hauteur dangereux
- Accidents possibles
- Conditions météo critiques

### Méthode drone

**Coûts** :
- Prestation drone (2 télépilotes) : 8 500 000 FCFA
- Durée : 2 jours
- Pas d'arrêt de production
- **TOTAL : 8 500 000 FCFA**

**Avantages** :
- Zéro accident
- Inspection en conditions difficiles
- Documentation photo/vidéo HD
- Analyse thermique infrarouge

## Économie réalisée : 32 500 000 FCFA (79%)

## Autres secteurs

Cette économie s'applique aussi à :
- Inspection d'éoliennes
- Vérification de lignes électriques
- Contrôle de ponts et viaducs
- Audit de toitures industrielles

## Temps de retour sur investissement

Pour une entreprise faisant 4 inspections/an :
- Économie annuelle : 130 000 000 FCFA
- Coût d'un drone professionnel : 25 000 000 FCFA
- **ROI : 2 mois**

## Conclusion

L'inspection par drone n'est plus une option mais une nécessité économique et sécuritaire pour les entreprises modernes.

Contactez ODS (Optimum Drone Services) pour une étude personnalisée.
    `,
    featuredImage: "https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=1200",
    category: "comparatifs",
    pole: "drone",
    author: {
      name: "ODS Team",
      role: "Optimum Drone Services"
    },
    seo: {
      metaTitle: "Inspection Drone vs Traditionnelle : ROI et Économies",
      metaDescription: "Inspections par drone : 79% d'économies, ROI en 2 mois. Découvrez l'analyse complète.",
      keywords: ["inspection drone", "ROI drone", "cordiste vs drone", "économies inspection", "ODS"]
    },
    tags: ["inspection", "drone", "ROI", "économies", "sécurité"],
    readTime: 7,
    featured: false,
    publishedAt: new Date('2024-09-10')
  },

  // 10. Pédagogique - Général
  {
    title: "Transition énergétique au Gabon : Enjeux et opportunités pour les entreprises",
    slug: "transition-energetique-gabon-opportunites-entreprises",
    excerpt: "Le Gabon s'engage vers la neutralité carbone en 2050. Quelles sont les opportunités pour les entreprises locales ?",
    content: `
Le Gabon a annoncé son objectif de neutralité carbone en 2050. Cette transition énergétique représente un défi majeur mais aussi d'immenses opportunités économiques.

## Le contexte gabonais

Le Gabon, déjà puits de carbone grâce à ses forêts, veut aller plus loin :
- Réduction de 50% des émissions d'ici 2030
- 80% d'énergies renouvelables d'ici 2035
- Neutralité carbone totale en 2050

## Opportunités pour les entreprises

### 1. Secteur Énergie

**Opportunités** :
- Installation solaire pour entreprises et particuliers
- Maintenance et formation
- Stockage d'énergie
- Smart grids

**Marché potentiel** : 500 milliards FCFA sur 10 ans

### 2. Efficacité énergétique

**Opportunités** :
- Audit énergétique des bâtiments
- Isolation et climatisation efficace
- LED et éclairage intelligent
- Gestion technique centralisée

**Économies moyennes** : 30-40% sur la facture énergétique

### 3. Mobilité électrique

**Opportunités** :
- Bornes de recharge
- Conversion de flottes professionnelles
- Maintenance véhicules électriques

**Projections** : 10 000 véhicules électriques au Gabon d'ici 2030

### 4. Technologies vertes

**Opportunités** :
- Drones pour surveillance environnementale
- IoT pour gestion ressources
- IA pour optimisation énergétique

## Incitations gouvernementales

Le gouvernement propose :
- Exonérations fiscales sur équipements renouvelables
- Subventions pour audits énergétiques
- Tarifs préférentiels pour électricité verte

## Comment se lancer ?

1. **Audit énergétique** : Identifiez vos gisements d'économie
2. **Plan d'action** : Priorisez les investissements rentables
3. **Financement** : Mobilisez les aides disponibles
4. **Mise en œuvre** : Faites appel à des experts locaux (CIPS !)

## Conclusion

La transition énergétique n'est pas une contrainte mais une opportunité de :
- Réduire vos coûts
- Améliorer votre image
- Anticiper les réglementations futures
- Créer de la valeur durable

CIPS vous accompagne dans votre transition énergétique avec des solutions sur mesure.
    `,
    featuredImage: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200",
    category: "pedagogique",
    pole: "general",
    author: {
      name: "Équipe CIPS",
      role: "Expertise Développement Durable"
    },
    seo: {
      metaTitle: "Transition Énergétique Gabon : Guide Entreprises 2024-2050",
      metaDescription: "Neutralité carbone 2050 au Gabon : enjeux, opportunités et solutions pour les entreprises. Guide complet.",
      keywords: ["transition énergétique gabon", "neutralité carbone", "opportunités entreprises", "énergies renouvelables"]
    },
    tags: ["transition énergétique", "gabon", "neutralité carbone", "opportunités", "développement durable"],
    readTime: 10,
    featured: false,
    publishedAt: new Date('2024-08-25')
  },

  // 11. Partenariat
  {
    title: "CIPS rejoint le réseau Africa Tech Hub pour accélérer l'innovation technologique",
    slug: "cips-africa-tech-hub-innovation-technologique",
    excerpt: "Le Groupe CIPS devient membre du réseau panafricain Africa Tech Hub, renforçant son ancrage dans l'écosystème tech africain.",
    content: `
## Libreville, le 5 novembre 2024

Le Groupe CIPS annonce son adhésion au **Africa Tech Hub**, le plus grand réseau d'innovation technologique du continent africain.

### À propos d'Africa Tech Hub

Africa Tech Hub regroupe plus de 500 entreprises tech dans 35 pays africains, favorisant :
- Le partage de connaissances
- Les partenariats stratégiques
- L'accès aux financements
- La mise en réseau des talents

### Bénéfices pour CIPS

Cette adhésion permettra à CIPS de :
- Accéder à un réseau de 10 000+ professionnels tech
- Participer aux événements panafricains
- Collaborer sur des projets régionaux
- Recruter les meilleurs talents africains

### Bénéfices pour le Gabon

Le Gabon renforce sa position dans l'écosystème tech africain :
- Visibilité internationale accrue
- Attraction d'investissements
- Transferts de technologies
- Création d'emplois qualifiés

### Projets pilotes

Dans le cadre de ce partenariat, CIPS participera à :
- Un projet de smart cities multi-pays
- Une plateforme de télémédecine transfrontalière
- Un programme de formation en cybersécurité

### Citation

*"Africa Tech Hub représente l'avenir de la tech africaine. En unissant nos forces, nous pouvons résoudre les grands défis du continent avec des solutions locales innovantes."* - Directeur Général, Groupe CIPS

### Contact
Pour plus d'informations : communication@cips-gabon.com
    `,
    featuredImage: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200",
    category: "partenariats",
    pole: "general",
    author: {
      name: "Service Communication CIPS",
      role: "Communiqué"
    },
    seo: {
      metaTitle: "CIPS x Africa Tech Hub : Partenariat Innovation Tech Afrique",
      metaDescription: "CIPS rejoint le réseau Africa Tech Hub pour accélérer l'innovation technologique en Afrique.",
      keywords: ["africa tech hub", "partenariat CIPS", "innovation afrique", "écosystème tech"]
    },
    tags: ["partenariat", "innovation", "afrique", "réseau", "technologie"],
    readTime: 4,
    featured: false,
    publishedAt: new Date('2024-11-05')
  },

  // 12. Actualités - Énergie
  {
    title: "Le prix des panneaux solaires baisse de 30% en 2024 : C'est le moment d'investir",
    slug: "prix-panneaux-solaires-baisse-30-pourcent-2024",
    excerpt: "La chute des prix mondiaux des panneaux photovoltaïques rend l'énergie solaire plus accessible que jamais au Gabon.",
    content: `
Bonne nouvelle pour les Gabonais : les prix des panneaux solaires ont chuté de 30% en 2024, rendant l'énergie solaire plus accessible que jamais.

## Pourquoi cette baisse ?

Plusieurs facteurs expliquent cette tendance :

### 1. Surproduction mondiale
- La Chine a augmenté sa capacité de production de 40%
- Concurrence accrue entre fabricants
- Économies d'échelle

### 2. Innovations technologiques
- Cellules plus efficaces = moins de modules nécessaires
- Processus de fabrication optimisés
- Réduction des coûts de transport

### 3. Politiques favorables
- Subventions gouvernementales dans plusieurs pays
- Objectifs climatiques ambitieux
- Fiscalité avantageuse

## Impact au Gabon

**Avant (2023)** :
- Installation 5 kWc : 12 000 000 FCFA
- Retour sur investissement : 6 ans

**Maintenant (2024)** :
- Installation 5 kWc : 8 400 000 FCFA (-30%)
- Retour sur investissement : 4 ans

**Économie : 3 600 000 FCFA**

## Prévisions 2025

Les experts prévoient :
- Encore -15% en 2025
- Parité avec le réseau électrique dès 2026
- Explosion de la demande

## Recommandation

**C'est LE moment d'investir** car :
- Prix historiquement bas
- Aides gouvernementales disponibles
- Factures d'électricité en hausse
- Climat gabonais idéal (ensoleillement optimal)

## Offre spéciale CIPS

À l'occasion de cette baisse de prix, CIPS propose :
- **-35% sur toutes les installations**
- Étude personnalisée gratuite
- Financement jusqu'à 36 mois
- Garantie 25 ans

**Offre valable jusqu'au 31 décembre 2024**

## Conclusion

Ne ratez pas cette opportunité historique de passer au solaire à prix réduit. Dans 5 ans, vous serez content d'avoir investi maintenant.

**Demandez votre devis gratuit dès aujourd'hui !**
    `,
    featuredImage: "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=1200",
    category: "actualites",
    pole: "energie",
    author: {
      name: "Service Commercial CIPS",
      role: "Analyse Marché"
    },
    seo: {
      metaTitle: "Prix Panneaux Solaires -30% en 2024 : Moment Idéal Investir Gabon",
      metaDescription: "Les panneaux solaires n'ont jamais été aussi abordables. Profitez de -35% chez CIPS. Offre limitée.",
      keywords: ["prix panneaux solaires", "baisse prix photovoltaïque", "investir solaire 2024", "promotion solaire gabon"]
    },
    tags: ["prix", "solaire", "promotion", "investissement", "économies"],
    readTime: 6,
    featured: true,
    publishedAt: new Date('2024-11-06')
  }
];

// Fonction pour insérer les articles
const seedArticles = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    const MONGODB_URI = 'mongodb://mongo:yhsquvSUxQpHOkzDbdQaMZymPmWYGmOX@switchyard.proxy.rlwy.net:51728';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    console.log('🗑️  Suppression des anciens articles...');
    await Article.deleteMany({});
    console.log('✅ Anciens articles supprimés');

    console.log('📝 Insertion des nouveaux articles...');
    const insertedArticles = await Article.insertMany(articles);
    console.log(`✅ ${insertedArticles.length} articles insérés avec succès !`);

    console.log('\n📊 Résumé des articles insérés:');
    const articlesByCategory = insertedArticles.reduce((acc, article) => {
      acc[article.category] = (acc[article.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('Par catégorie:');
    Object.entries(articlesByCategory).forEach(([category, count]) => {
      console.log(`  - ${category}: ${count} article(s)`);
    });

    console.log('\n✅ Seeding terminé avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
};

seedArticles();

