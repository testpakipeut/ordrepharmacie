import mongoose from 'mongoose';
import Job from '../models/Job.js';
import dotenv from 'dotenv';

dotenv.config();

// Connexion à MongoDB
const MONGODB_URI = 'mongodb://mongo:yhsquvSUxQpHOkzDbdQaMZymPmWYGmOX@switchyard.proxy.rlwy.net:51728';
mongoose.connect(MONGODB_URI)
.then(() => console.log('✅ Connecté à MongoDB'))
.catch(err => {
  console.error('❌ Erreur de connexion MongoDB:', err.message);
  console.log('\n⚠️  Assurez-vous que MongoDB est démarré');
  process.exit(1);
});

// Données des offres d'emploi
const jobs = [
  {
    titre: 'Ingénieur en Énergie Solaire',
    type: 'CDI',
    localisation: 'Libreville, Gabon',
    departement: 'Pôle Énergie',
    description: 'Nous recherchons un ingénieur passionné pour concevoir et superviser l\'installation de systèmes solaires photovoltaïques.',
    competences: [
      'Conception de systèmes solaires',
      'Gestion de projet',
      'Formation technique'
    ],
    experience: '3+ ans',
    missions: [
      'Concevoir des installations solaires adaptées aux besoins des clients',
      'Superviser les installations sur le terrain',
      'Former les équipes techniques',
      'Assurer le suivi et la maintenance des installations',
      'Participer au développement commercial'
    ],
    profil: 'Diplôme d\'ingénieur en énergie, électrotechnique ou équivalent. Expérience significative en conception et installation de systèmes photovoltaïques.',
    avantages: [
      'Salaire compétitif',
      'Formation continue',
      'Véhicule de fonction',
      'Assurance santé'
    ],
    actif: true,
    priorite: 10
  },
  {
    titre: 'Télépilote de Drone Certifié',
    type: 'CDI',
    localisation: 'Libreville, Gabon',
    departement: 'ODS - Services Drones',
    description: 'Rejoignez notre équipe ODS pour des missions de captation aérienne, inspection et surveillance.',
    competences: [
      'Certification télépilote',
      'Montage vidéo',
      'Analyse d\'images'
    ],
    experience: '2+ ans',
    missions: [
      'Réaliser des prises de vues aériennes professionnelles',
      'Effectuer des inspections d\'infrastructures',
      'Missions de surveillance et monitoring',
      'Post-production et montage vidéo',
      'Maintenance des équipements drones'
    ],
    profil: 'Certification télépilote obligatoire. Expérience en pilotage professionnel et maîtrise des logiciels de montage.',
    avantages: [
      'Équipements professionnels fournis',
      'Formations régulières',
      'Missions variées',
      'Assurance complète'
    ],
    actif: true,
    priorite: 9
  },
  {
    titre: 'Ingénieur en Cybersécurité',
    type: 'CDI',
    localisation: 'Libreville, Gabon',
    departement: 'Pôle Sécurité Numérique',
    description: 'Protégez les infrastructures numériques de nos clients en tant qu\'expert en cybersécurité.',
    competences: [
      'Audit sécurité',
      'Cryptographie',
      'Gestion des incidents'
    ],
    experience: '4+ ans',
    missions: [
      'Réaliser des audits de sécurité',
      'Mettre en place des solutions de protection',
      'Gérer les incidents de sécurité',
      'Former les équipes aux bonnes pratiques',
      'Veille technologique en cybersécurité'
    ],
    profil: 'Diplôme d\'ingénieur en informatique ou cybersécurité. Certifications en sécurité (CEH, CISSP, etc.) appréciées.',
    avantages: [
      'Poste stratégique',
      'Formation continue',
      'Environnement technique de pointe',
      'Package compétitif'
    ],
    actif: true,
    priorite: 10
  },
];

// Fonction pour insérer les données
const seedJobs = async () => {
  try {
    // Supprimer les anciennes offres
    await Job.deleteMany({});
    console.log('🗑️  Anciennes offres supprimées');

    // Insérer les nouvelles offres
    const insertedJobs = await Job.insertMany(jobs);
    console.log(`✅ ${insertedJobs.length} offres d'emploi insérées avec succès`);

    console.log(`\n📋 Liste des ${insertedJobs.length} offres:`);
    insertedJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.titre} - ${job.departement} (${job.type})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  }
};

// Exécuter le seed
seedJobs();

