import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createAdminUser = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    const MONGODB_URI = 'mongodb://mongo:yhsquvSUxQpHOkzDbdQaMZymPmWYGmOX@switchyard.proxy.rlwy.net:51728';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Vérifier si un admin existe déjà
    const existingAdmin = await User.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Un utilisateur admin existe déjà');
      console.log('Username:', existingAdmin.username);
      console.log('Email:', existingAdmin.email);
      process.exit(0);
    }

    // Créer l'utilisateur admin par défaut
    const admin = await User.create({
      username: 'admin',
      email: 'admin@cips-gabon.com',
      password: 'admin123', // Sera hashé automatiquement par le pre-save hook
      role: 'admin',
      isActive: true
    });

    console.log('\n✅ Utilisateur admin créé avec succès !');
    console.log('\n📋 Informations de connexion:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT : Changez le mot de passe après la première connexion !');
    console.log('\n🔐 URL de connexion: http://localhost:3000/admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
    process.exit(1);
  }
};

createAdminUser();

