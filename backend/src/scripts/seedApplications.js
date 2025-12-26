import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import dotenv from 'dotenv';

dotenv.config();

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:yhsquvSUxQpHOkzDbdQaMZymPmWYGmOX@switchyard.proxy.rlwy.net:51728')
.then(() => console.log('✅ Connecté à MongoDB'))
.catch(err => {
  console.error('❌ Erreur de connexion MongoDB:', err.message);
  console.log('\n⚠️  Assurez-vous que MongoDB est démarré');
  process.exit(1);
});

// Fonction pour insérer les candidatures fictives
const seedApplications = async () => {
  try {
    // Récupérer les offres d'emploi existantes
    const jobs = await Job.find({ actif: true }).limit(3);
    
    if (jobs.length === 0) {
      console.log('⚠️  Aucune offre d\'emploi trouvée. Exécutez d\'abord seedJobs.js');
      process.exit(1);
    }

    console.log(`📋 ${jobs.length} offres d'emploi trouvées`);

    // Supprimer les anciennes candidatures
    await Application.deleteMany({});
    console.log('🗑️  Anciennes candidatures supprimées');

    // Candidatures fictives
    const applications = [
      {
        jobId: jobs[0]._id, // Première offre (Ingénieur Énergie Solaire)
        nom: 'Jean-Marc Nkoghe',
        email: 'jm.nkoghe@email.ga',
        telephone: '+241 07 12 34 56',
        message: `Bonjour,

Je suis ingénieur en énergies renouvelables avec 5 ans d'expérience dans la conception et l'installation de systèmes photovoltaïques en Afrique centrale. J'ai supervisé plus de 50 installations au Gabon et au Congo.

Mon expérience inclut :
- Dimensionnement de systèmes solaires (résidentiel et industriel)
- Gestion d'équipes techniques (10+ personnes)
- Formation de techniciens locaux
- Suivi de projets de A à Z

Je suis très motivé à rejoindre le Groupe CIPS et contribuer à l'indépendance énergétique de l'Afrique.

Cordialement,
Jean-Marc Nkoghe`,
        cvPath: '/uploads/cv/jm_nkoghe_cv.pdf',
        statut: 'en_cours',
        notes: 'Profil très intéressant, expérience solide. Prévoir entretien.'
      },
      {
        jobId: jobs[1] ? jobs[1]._id : jobs[0]._id, // Deuxième offre (Télépilote Drone)
        nom: 'Marie-Claire Obiang',
        email: 'mc.obiang@gmail.com',
        telephone: '+241 06 98 76 54',
        message: `Madame, Monsieur,

Télépilote de drone certifiée depuis 3 ans, je possède une solide expérience en captation aérienne et inspection d'infrastructures. 

Mes compétences :
- Certification télépilote professionnelle (validité 2027)
- Maîtrise DJI Phantom 4 Pro, Mavic 3, Inspire 2
- Montage vidéo (Adobe Premiere Pro, DaVinci Resolve)
- Photogrammétrie et modélisation 3D

J'ai réalisé des missions pour des clients privés et institutionnels (événements, inspections, agriculture de précision).

Je serais ravie de mettre mon expertise au service d'ODS.

Bien cordialement,
Marie-Claire Obiang`,
        cvPath: '/uploads/cv/mc_obiang_cv.pdf',
        statut: 'nouvelle'
      }
    ];

    // Insérer les candidatures
    const insertedApplications = await Application.insertMany(applications);
    console.log(`✅ ${insertedApplications.length} candidatures insérées avec succès`);

    console.log('\n📋 Liste des candidatures:');
    for (const app of insertedApplications) {
      const populated = await Application.findById(app._id);
      console.log(`- ${populated.nom} → ${populated.jobId.titre} (${populated.statut})`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  }
};

// Exécuter le seed
seedApplications();

