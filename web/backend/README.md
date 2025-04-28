# Quiz App - Backend

API RESTful pour l'application Quiz App, développée avec Node.js, Express et MongoDB.

## 🌟 Fonctionnalités

- **API RESTful** : Endpoints pour toutes les fonctionnalités de l'application
- **Authentification** : Système complet avec JWT
- **Base de données** : Modèles MongoDB avec Mongoose
- **Upload de fichiers** : Gestion des avatars utilisateurs
- **Sécurité** : Protection des routes et validation des données

## 🚀 Démarrage rapide

### Prérequis

- Node.js (v14+)
- MongoDB (local ou distant)
- npm ou yarn

### Installation

```bash
# Installer les dépendances
npm install

# Créer un fichier .env avec les variables suivantes
# MONGODB_URI=mongodb://localhost:27017/quiz-app
# JWT_SECRET=votre_clé_secrète_jwt
# NODE_ENV=development

# Démarrer le serveur
npm start
```

Le serveur sera accessible à l'adresse : http://localhost:5000

### Données de test

Pour initialiser la base de données avec des données de test :

```bash
node seed.js
```

## 📁 Structure du projet

```
backend/
├── controllers/    # Logique métier
├── middleware/     # Middleware Express
├── models/         # Modèles Mongoose
├── routes/         # Routes API
├── uploads/        # Fichiers uploadés
├── utils/          # Fonctions utilitaires
├── .env            # Variables d'environnement
└── server.js       # Point d'entrée
```

## 📡 API Endpoints

### Authentification
- `POST /auth/register` : Inscription d'un nouvel utilisateur
- `POST /auth/login` : Connexion d'un utilisateur

### Utilisateurs
- `GET /users/profile` : Récupérer le profil de l'utilisateur
- `PUT /users/profile` : Mettre à jour le profil de l'utilisateur
- `GET /users/stats` : Récupérer les statistiques de l'utilisateur
- `GET /users/submissions` : Récupérer les soumissions de l'utilisateur

### Quiz
- `GET /quizzes` : Récupérer tous les quiz
- `GET /quizzes/:id` : Récupérer un quiz spécifique
- `POST /quizzes/:id/submit` : Soumettre les réponses à un quiz
- `GET /quizzes/submissions/:submissionId` : Récupérer les détails d'une soumission

## 🔧 Technologies utilisées

- **Node.js** : Environnement d'exécution
- **Express** : Framework web
- **MongoDB** : Base de données NoSQL
- **Mongoose** : ODM pour MongoDB
- **JWT** : Authentification basée sur les tokens
- **Multer** : Gestion des uploads de fichiers
- **bcrypt** : Hachage des mots de passe

## 🧪 Tests

```bash
# Exécuter les tests
npm test
```

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.
