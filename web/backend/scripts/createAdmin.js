/**
 * Script pour créer un utilisateur administrateur
 *
 * Usage: node createAdmin.js <email> <password> <username>
 * Exemple: node createAdmin.js admin@example.com password123 Admin
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Vérifier les arguments
if (process.argv.length < 5) {
  console.error('Usage: node createAdmin.js <email> <password> <username>');
  process.exit(1);
}

const email = process.argv[2];
const password = process.argv[3];
const username = process.argv[4];

// Fonction principale
async function createAdmin() {
  try {
    // Connexion à MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app';

    console.log(`Connexion à MongoDB: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connecté à MongoDB');

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`L'utilisateur avec l'email ${email} existe déjà.`);

      // Mettre à jour le rôle si l'utilisateur n'est pas déjà admin
      if (existingUser.role !== 'admin') {
        await User.updateOne({ _id: existingUser._id }, { role: 'admin' });
        console.log(`Le rôle de l'utilisateur a été mis à jour en 'admin'.`);
      } else {
        console.log(`L'utilisateur est déjà un administrateur.`);
      }
    } else {
      // Hacher le mot de passe avec bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Créer un nouvel utilisateur avec le rôle admin
      const newUser = new User({
        email,
        password: hashedPassword,
        username,
        role: 'admin'
      });

      console.log('Création d\'un nouvel utilisateur avec les données suivantes:', {
        email: newUser.email,
        username: newUser.username,
        role: newUser.role
      });

      await newUser.save();

      // Vérifier que l'utilisateur a bien été créé avec le rôle admin
      const createdUser = await User.findOne({ email });
      console.log('Utilisateur créé en base de données:', {
        email: createdUser.email,
        username: createdUser.username,
        role: createdUser.role
      });

      console.log(`Nouvel administrateur créé avec l'email ${email} et le nom d'utilisateur ${username}.`);
    }

    // Déconnexion de MongoDB
    await mongoose.disconnect();
    console.log('Déconnecté de MongoDB');

    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

// Exécuter la fonction principale
createAdmin();
