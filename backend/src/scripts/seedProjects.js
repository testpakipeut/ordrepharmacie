import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from '../models/Project.js';

dotenv.config();

const projects = [
  // 1. PÔLE ÉNERGIE - Installation solaire à Libreville
  {
    title: "Installation solaire résidentielle - Quartier Glass",
    shortDescription: "Installation complète de 15 kWc pour une résidence familiale à Libreville avec système de stockage",
    description: "Ce projet pilote a permis d'équiper une résidence familiale de 250m² dans le quartier Glass de Libreville avec un système solaire photovoltaïque complet. L'installation comprend 40 panneaux solaires de 375W, un onduleur hybride de 15kW et un système de stockage par batteries lithium de 20kWh. Le système permet une autonomie énergétique de 95% avec un retour sur investissement prévu en 5 ans.",
    pole: "energie",
    mainImage: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800",
    images: [
      { url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800", caption: "Vue d'ensemble des panneaux installés" },
      { url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800", caption: "Onduleur et système de stockage" }
    ],
    videos: [],
    beforeAfter: {
      before: {
        image: "https://images.unsplash.com/photo-1582719188393-bb71ca45dbb9?w=600",
        description: "Facture mensuelle: 250 000 FCFA - Dépendance totale au réseau SEEG"
      },
      after: {
        image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600",
        description: "Facture mensuelle: 12 000 FCFA - Autonomie énergétique de 95%"
      }
    },
    location: {
      city: "Libreville",
      country: "Gabon",
      coordinates: { lat: 0.4162, lng: 9.4673 }
    },
    client: {
      name: "M. Jean-Baptiste Nze",
      company: "Particulier"
    },
    testimonial: {
      text: "Depuis l'installation de ces panneaux solaires, nos factures d'électricité ont chuté de 95%. Le système est fiable et l'équipe CIPS a été professionnelle du début à la fin.",
      author: "Jean-Baptiste Nze",
      position: "Propriétaire",
      rating: 5
    },
    results: [
      { metric: "Économies annuelles", value: "2 850 000 FCFA", icon: "💰" },
      { metric: "Réduction CO2", value: "8 tonnes/an", icon: "🌿" },
      { metric: "Autonomie énergétique", value: "95%", icon: "⚡" }
    ],
    duration: "2 semaines",
    budget: "12 500 000 FCFA",
    team: "3 techniciens",
    date: new Date('2024-08-15'),
    caseStudy: {
      challenge: "Le client souffrait de coupures de courant fréquentes et de factures d'électricité élevées (250 000 FCFA/mois).",
      solution: "Installation d'un système solaire hybride de 15kWc avec batteries lithium permettant un fonctionnement 24/7.",
      impact: "Réduction de 95% des factures, autonomie énergétique totale et retour sur investissement en 5 ans."
    },
    status: "termine",
    featured: true,
    published: true,
    tags: ["solaire", "résidentiel", "autonomie", "économies"]
  },

  // 2. PÔLE GÉOSPATIAL - Cartographie Port-Gentil
  {
    title: "Cartographie 3D du centre-ville de Port-Gentil",
    shortDescription: "Modélisation 3D complète de 5 km² du centre-ville pour le plan d'urbanisme municipal",
    description: "Mission de cartographie aérienne par drone pour créer un modèle 3D haute résolution du centre-ville de Port-Gentil. Le projet inclut l'acquisition de 2000+ photos aériennes, la création d'orthophotographies, de modèles numériques de terrain (MNT) et de surface (MNS), ainsi que la production de plans topographiques détaillés. Ces données servent maintenant de base au nouveau plan d'urbanisme de la ville.",
    pole: "geospatial",
    mainImage: "/Contenue visuel pole TGS/5.svg",
    images: [
      { url: "/Contenue visuel pole TGS/5.svg", caption: "Vue aérienne du centre-ville" },
      { url: "/Contenue visuel pole TGS/6.svg", caption: "Modèle 3D généré" },
      { url: "/Contenue visuel pole TGS/7.svg", caption: "Orthophotographie" },
      { url: "/Contenue visuel pole TGS/8.svg", caption: "Plan topographique" }
    ],
    videos: [],
    beforeAfter: {
      before: {
        image: "https://via.placeholder.com/600x400/cccccc/666666?text=Pas+de+cartographie+précise",
        description: "Pas de cartographie précise - Plans obsolètes de 1995"
      },
      after: {
        image: "https://images.unsplash.com/photo-1473445730015-841f29a9490b?w=600",
        description: "Modèle 3D précis au centimètre - Données actualisées 2024"
      }
    },
    location: {
      city: "Port-Gentil",
      country: "Gabon",
      coordinates: { lat: -0.7193, lng: 8.7815 }
    },
    client: {
      name: "Mairie de Port-Gentil",
      company: "Administration municipale"
    },
    testimonial: {
      text: "Cette cartographie 3D nous permet enfin de planifier l'urbanisation de notre ville avec des données précises et actualisées. Un travail remarquable de l'équipe CIPS.",
      author: "Directeur de l'Urbanisme",
      position: "Mairie de Port-Gentil",
      rating: 5
    },
    results: [
      { metric: "Surface cartographiée", value: "5 km²", icon: "📐" },
      { metric: "Photos aériennes", value: "2000+", icon: "📸" },
      { metric: "Précision", value: "±2 cm", icon: "🎯" }
    ],
    duration: "1 mois",
    budget: "15 000 000 FCFA",
    team: "2 télépilotes + 2 géomaticiens",
    date: new Date('2024-06-20'),
    caseStudy: {
      challenge: "La ville ne disposait pas de plans à jour depuis 1995, rendant la planification urbaine difficile.",
      solution: "Cartographie aérienne par drone avec photogrammétrie pour créer un modèle 3D ultra-précis.",
      impact: "Plans urbanisme actualisés, optimisation des projets d'infrastructure, économie de temps et budget."
    },
    status: "termine",
    featured: true,
    published: true,
    tags: ["cartographie", "3D", "urbanisme", "drone"]
  },

  // 3. PÔLE DRONE (ODS) - Inspection plateforme pétrolière
  {
    title: "Inspection par drone d'une plateforme pétrolière offshore",
    shortDescription: "Inspection complète d'une plateforme pétrolière en mer pour un client du secteur Oil & Gas",
    description: "Mission d'inspection technique d'une plateforme pétrolière offshore située à 25 km des côtes. Utilisation de drones industriels équipés de caméras thermiques et HD pour inspecter les structures métalliques, torchères, canalisations et équipements en hauteur. Le projet a permis d'identifier 12 points de corrosion nécessitant une maintenance préventive, évitant ainsi des risques majeurs.",
    pole: "drone",
    mainImage: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800",
    images: [
      { url: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800", caption: "Plateforme offshore" },
      { url: "https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=800", caption: "Drone industriel en mission" }
    ],
    videos: [],
    location: {
      city: "Au large de Port-Gentil",
      country: "Gabon",
      coordinates: { lat: -0.85, lng: 8.65 }
    },
    client: {
      name: "Compagnie pétrolière internationale",
      company: "Secteur Oil & Gas"
    },
    testimonial: {
      text: "L'inspection par drone nous a permis d'éviter l'arrêt de production et les risques liés aux travaux en hauteur. Efficace et sécurisé.",
      author: "Responsable HSE",
      position: "Compagnie pétrolière",
      rating: 5
    },
    results: [
      { metric: "Économies réalisées", value: "25 000 000 FCFA", icon: "💰" },
      { metric: "Temps d'inspection", value: "2 jours vs 2 semaines", icon: "⏱️" },
      { metric: "Points identifiés", value: "12 anomalies", icon: "🔍" }
    ],
    duration: "2 jours",
    budget: "8 500 000 FCFA",
    team: "2 télépilotes certifiés + 1 ingénieur HSE",
    date: new Date('2024-09-10'),
    caseStudy: {
      challenge: "Inspection traditionnelle nécessitant l'arrêt de production et travaux en hauteur dangereux.",
      solution: "Inspection par drone avec caméras thermiques sans interruption de l'activité.",
      impact: "Économie de 25M FCFA, zéro accident, maintenance préventive identifiée."
    },
    status: "termine",
    featured: false,
    published: true,
    tags: ["drone", "inspection", "offshore", "sécurité"]
  },

  // 4. PÔLE SANTÉ - Cabine médicale à Franceville
  {
    title: "Déploiement de cabines médicales connectées à Franceville",
    shortDescription: "Installation de 3 cabines médicales connectées dans les quartiers périphériques de Franceville",
    description: "Projet pilote de télémédecine avec installation de 3 cabines médicales connectées de type photomaton dans les quartiers mal desservis de Franceville. Chaque cabine est équipée de capteurs médicaux (tension, température, rythme cardiaque, oxymétrie), d'une webcam HD pour téléconsultation et d'une connexion internet par satellite. Plus de 500 consultations ont été réalisées en 3 mois.",
    pole: "sante",
    mainImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
    images: [
      { url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800", caption: "Cabine médicale connectée" },
      { url: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800", caption: "Interface de téléconsultation" }
    ],
    videos: [],
    beforeAfter: {
      before: {
        image: "https://via.placeholder.com/600x400/cccccc/666666?text=Pas+d%27accès+aux+soins",
        description: "Quartiers isolés - Pas d'accès à un médecin - Déplacements de 15km"
      },
      after: {
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600",
        description: "Accès immédiat aux soins - Téléconsultation 24/7 - Capteurs médicaux"
      }
    },
    location: {
      city: "Franceville",
      country: "Gabon",
      coordinates: { lat: -1.6334, lng: 13.5833 }
    },
    client: {
      name: "Direction Régionale de la Santé",
      company: "Ministère de la Santé"
    },
    testimonial: {
      text: "Ces cabines ont révolutionné l'accès aux soins dans nos quartiers. Les habitants n'ont plus besoin de parcourir 15 km pour voir un médecin.",
      author: "Dr. Marie Obame",
      position: "Directrice Régionale de la Santé",
      rating: 5
    },
    results: [
      { metric: "Consultations réalisées", value: "500+", icon: "👨‍⚕️" },
      { metric: "Temps d'attente moyen", value: "5 minutes", icon: "⏱️" },
      { metric: "Satisfaction patients", value: "92%", icon: "😊" }
    ],
    duration: "1 mois",
    budget: "18 000 000 FCFA",
    team: "2 techniciens + 5 médecins partenaires",
    date: new Date('2024-07-01'),
    caseStudy: {
      challenge: "Quartiers périphériques sans accès à des structures médicales - Déplacements coûteux.",
      solution: "Cabines médicales connectées avec téléconsultation et capteurs médicaux intégrés.",
      impact: "500+ consultations en 3 mois, accès aux soins facilité, réduction des coûts de transport."
    },
    status: "en_cours",
    featured: true,
    published: true,
    tags: ["santé", "télémédecine", "innovation", "accès aux soins"]
  },

  // 5. PÔLE SÉCURITÉ NUMÉRIQUE - Audit cybersécurité banque
  {
    title: "Audit de cybersécurité pour une institution bancaire",
    shortDescription: "Audit complet de sécurité informatique et mise en conformité pour une banque gabonaise",
    description: "Mission d'audit de cybersécurité pour une grande banque commerciale de Libreville. Le projet comprenait un test d'intrusion (penetration testing), un audit des systèmes d'information, une analyse des vulnérabilités et la mise en place de recommandations. 23 vulnérabilités critiques ont été identifiées et corrigées, renforçant considérablement la sécurité des données clients.",
    pole: "securite",
    mainImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
    images: [
      { url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800", caption: "Audit de sécurité" },
      { url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800", caption: "Monitoring des systèmes" }
    ],
    videos: [],
    location: {
      city: "Libreville",
      country: "Gabon",
      coordinates: { lat: 0.4162, lng: 9.4673 }
    },
    client: {
      name: "Banque Commerciale Internationale",
      company: "Secteur bancaire"
    },
    testimonial: {
      text: "L'audit CIPS a révélé des failles que nous ignorions. Leur expertise nous a permis de sécuriser nos systèmes et protéger les données de nos clients.",
      author: "DSI",
      position: "Banque Commerciale",
      rating: 5
    },
    results: [
      { metric: "Vulnérabilités identifiées", value: "23 critiques", icon: "🔒" },
      { metric: "Taux de conformité", value: "95%", icon: "✅" },
      { metric: "Risques éliminés", value: "100%", icon: "🛡️" }
    ],
    duration: "3 semaines",
    budget: "12 000 000 FCFA",
    team: "3 experts en cybersécurité",
    date: new Date('2024-05-15'),
    caseStudy: {
      challenge: "Systèmes informatiques vieillissants avec de nombreuses vulnérabilités non détectées.",
      solution: "Audit complet avec tests d'intrusion et recommandations de sécurisation.",
      impact: "Toutes les vulnérabilités critiques corrigées, conformité réglementaire atteinte."
    },
    status: "termine",
    featured: false,
    published: true,
    tags: ["cybersécurité", "audit", "banque", "protection"]
  },

  // 6. PÔLE ÉNERGIE - Installation PME
  {
    title: "Solution énergétique hybride pour une PME à Owendo",
    shortDescription: "Installation solaire + groupe électrogène pour une usine de transformation agroalimentaire",
    description: "Projet d'installation d'un système énergétique hybride (solaire + groupe électrogène) pour une PME de transformation agroalimentaire à Owendo. Le système de 50kWc avec stockage de 80kWh garantit une alimentation continue même en cas de coupure réseau. L'installation permet de faire fonctionner les chambres froides et les équipements de production 24/7.",
    pole: "energie",
    mainImage: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800",
    images: [
      { url: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800", caption: "Installation solaire de 50kWc" },
      { url: "https://images.unsplash.com/photo-1594818379496-da1e345b0ded?w=800", caption: "Onduleur hybride et batteries" }
    ],
    videos: [],
    beforeAfter: {
      before: {
        image: "https://via.placeholder.com/600x400/cccccc/666666?text=Coupures+fréquentes",
        description: "Coupures fréquentes - Pertes de production - Coûts de groupe élevés"
      },
      after: {
        image: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=600",
        description: "Alimentation continue 24/7 - Économies de 60% - Production stable"
      }
    },
    location: {
      city: "Owendo",
      country: "Gabon",
      coordinates: { lat: 0.3, lng: 9.5 }
    },
    client: {
      name: "SARL AgroTransform",
      company: "Transformation agroalimentaire"
    },
    testimonial: {
      text: "Nous n'avons plus de pertes de production dues aux coupures. Le système hybride est parfait pour notre activité.",
      author: "Directeur Général",
      position: "AgroTransform",
      rating: 5
    },
    results: [
      { metric: "Économies annuelles", value: "8 500 000 FCFA", icon: "💰" },
      { metric: "Disponibilité", value: "99.9%", icon: "⚡" },
      { metric: "Retour sur investissement", value: "4 ans", icon: "📈" }
    ],
    duration: "3 semaines",
    budget: "35 000 000 FCFA",
    team: "5 techniciens",
    date: new Date('2024-04-10'),
    caseStudy: {
      challenge: "Coupures de courant fréquentes causant des pertes de production et détérioration des produits.",
      solution: "Système hybride solaire + groupe électrogène avec gestion intelligente de l'énergie.",
      impact: "Production continue, économies significatives, autonomie énergétique."
    },
    status: "termine",
    featured: false,
    published: true,
    tags: ["solaire", "hybride", "PME", "industrie"]
  },

  // 7. PÔLE GÉOSPATIAL - Suivi végétation parc national
  {
    title: "Cartographie et suivi de la végétation du Parc National de Loango",
    shortDescription: "Mission de cartographie par drone pour le suivi environnemental et la détection de déforestation",
    description: "Projet de cartographie environnementale du Parc National de Loango avec acquisition d'images multispectrales par drone. Création de cartes de végétation (NDVI), détection des zones de déforestation, suivi de la faune par caméra thermique et modélisation 3D du terrain. Les données permettent aux gardes forestiers de mieux surveiller le parc.",
    pole: "geospatial",
    mainImage: "/Contenue visuel pole TGS/15.svg",
    images: [
      { url: "/Contenue visuel pole TGS/15.svg", caption: "Vue aérienne du parc" },
      { url: "/Contenue visuel pole TGS/16.svg", caption: "Carte NDVI de la végétation" },
      { url: "/Contenue visuel pole TGS/17.svg", caption: "Modèle numérique de terrain" },
      { url: "/Contenue visuel pole TGS/18.svg", caption: "Analyse multispectrale" }
    ],
    videos: [],
    location: {
      city: "Parc National de Loango",
      country: "Gabon",
      coordinates: { lat: -1.95, lng: 9.45 }
    },
    client: {
      name: "Agence Nationale des Parcs Nationaux (ANPN)",
      company: "Conservation de la nature"
    },
    testimonial: {
      text: "Ces données nous permettent de surveiller efficacement la déforestation et la faune. Un outil précieux pour la conservation.",
      author: "Conservateur du Parc",
      position: "ANPN",
      rating: 5
    },
    results: [
      { metric: "Surface analysée", value: "120 km²", icon: "🌲" },
      { metric: "Zones de déforestation détectées", value: "3", icon: "🔍" },
      { metric: "Images collectées", value: "5000+", icon: "📸" }
    ],
    duration: "2 mois",
    budget: "18 000 000 FCFA",
    team: "2 télépilotes + 1 écologue",
    date: new Date('2024-03-20'),
    caseStudy: {
      challenge: "Surveillance de vastes zones forestières difficiles d'accès pour détecter la déforestation.",
      solution: "Cartographie aérienne par drone avec caméras multispectrales et thermiques.",
      impact: "Détection précoce de déforestation, suivi de la faune, optimisation des patrouilles."
    },
    status: "termine",
    featured: false,
    published: true,
    tags: ["environnement", "conservation", "drone", "cartographie"]
  },

  // 8. PÔLE DRONE (ODS) - Vidéo événementielle
  {
    title: "Captation aérienne événementielle - Festival de Musique de Libreville",
    shortDescription: "Réalisation de vidéos aériennes spectaculaires pour le Festival International de Musique",
    description: "Mission de captation aérienne pour le Festival International de Musique de Libreville. Production de 15 vidéos aériennes en 4K, photos panoramiques, timelapses et diffusion en direct sur écrans géants. Les vidéos ont été utilisées pour la promotion de l'événement et ont généré plus de 2 millions de vues sur les réseaux sociaux.",
    pole: "drone",
    mainImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
    images: [
      { url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800", caption: "Vue aérienne du festival" },
      { url: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800", caption: "Captation nocturne" }
    ],
    videos: [
      { url: "https://www.youtube.com/watch?v=example", title: "Festival de Musique - Vue aérienne", thumbnail: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400" }
    ],
    location: {
      city: "Libreville",
      country: "Gabon",
      coordinates: { lat: 0.4162, lng: 9.4673 }
    },
    client: {
      name: "Festival International de Musique",
      company: "Événementiel"
    },
    testimonial: {
      text: "Les vidéos aériennes ont donné une dimension spectaculaire à notre festival. Un vrai plus pour notre communication.",
      author: "Directeur du Festival",
      position: "Organisateur",
      rating: 5
    },
    results: [
      { metric: "Vues sur réseaux sociaux", value: "2M+", icon: "👁️" },
      { metric: "Vidéos produites", value: "15", icon: "🎥" },
      { metric: "Photos panoramiques", value: "50+", icon: "📸" }
    ],
    duration: "3 jours",
    budget: "4 500 000 FCFA",
    team: "2 télépilotes + 1 vidéaste",
    date: new Date('2024-10-05'),
    caseStudy: {
      challenge: "Capturer l'ampleur de l'événement avec 50 000 spectateurs de manière spectaculaire.",
      solution: "Drones 4K avec captation aérienne de jour et de nuit, diffusion live.",
      impact: "Visibilité internationale, 2M+ de vues, contenu promotionnel de qualité professionnelle."
    },
    status: "termine",
    featured: false,
    published: true,
    tags: ["drone", "événementiel", "vidéo", "captation"]
  }
];

// Fonction pour insérer les projets
const seedProjects = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    const MONGODB_URI = 'mongodb://mongo:yhsquvSUxQpHOkzDbdQaMZymPmWYGmOX@switchyard.proxy.rlwy.net:51728';
    console.log('uri=',MONGODB_URI);

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    console.log('🗑️  Suppression des anciens projets...');
    await Project.deleteMany({});
    console.log('✅ Anciens projets supprimés');

    console.log('📝 Insertion des nouveaux projets...');
    const insertedProjects = await Project.insertMany(projects);
    console.log(`✅ ${insertedProjects.length} projets insérés avec succès !`);

    console.log('\n📊 Résumé des projets insérés:');
    const projectsByPole = insertedProjects.reduce((acc, project) => {
      acc[project.pole] = (acc[project.pole] || 0) + 1;
      return acc;
    }, {});
    
    console.log('Par pôle:');
    Object.entries(projectsByPole).forEach(([pole, count]) => {
      console.log(`  - ${pole}: ${count} projet(s)`);
    });

    console.log('\n✅ Seeding terminé avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
};

seedProjects();

