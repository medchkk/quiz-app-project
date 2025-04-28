# Quiz App Project

Application de quiz interactive avec authentification utilisateur, suivi des statistiques et gestion des profils. Cette application permet aux utilisateurs de tester leurs connaissances dans différentes catégories, de suivre leurs progrès et de personnaliser leur expérience.

![Quiz App Logo](frontend/quiz-app/public/quiz-logo.png)

## 📑 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#️-architecture)
- [Captures d'écran](#-captures-décran)
- [Prérequis](#-prérequis)
- [Installation et démarrage](#-installation-et-démarrage)
- [Structure du projet](#-structure-du-projet)
- [Utilisation](#-utilisation)
- [Technologies utilisées](#️-technologies-utilisées)
- [Fonctionnalités avancées](#-fonctionnalités-avancées)
- [Problèmes connus](#-problèmes-connus)
- [Roadmap](#-roadmap)
- [Licence](#-licence)
- [Contribution](#-contribution)
- [Contact](#-contact)

## 🌟 Fonctionnalités

- **Authentification** : Inscription et connexion des utilisateurs avec JWT
- **Quiz interactifs** : Questions à choix multiples avec minuteur de 30 secondes
- **Statistiques** : Suivi détaillé des scores et des performances
- **Profil utilisateur** : Personnalisation avec photo de profil et historique des quiz
- **Interface responsive** : Fonctionne parfaitement sur ordinateurs, tablettes et smartphones
- **Thème sombre/clair** : Personnalisation de l'interface selon vos préférences
- **Catégories de quiz** : Différentes thématiques pour varier les plaisirs
- **Résultats détaillés** : Analyse des réponses après chaque quiz

## 🏗️ Architecture

Le projet est organisé en deux parties principales :

- **web/** : Application web complète
  - **frontend/** : Interface utilisateur React avec Vite, TailwindCSS et React Router
  - **backend/** : API RESTful avec Node.js, Express et MongoDB

- **mobile/** : Application mobile Android
  - **frontend/** : Application React avec Capacitor et fonctionnalités hors-ligne
  - **data/** : Données JSON pour le mode hors-ligne

## � Captures d'écran

### Page d'accueil
![Page d'accueil](frontend/quiz-app/public/screenshots/home.png)

### Quiz en cours
![Quiz en cours](frontend/quiz-app/public/screenshots/quiz.png)

### Profil utilisateur
![Profil utilisateur](frontend/quiz-app/public/screenshots/profile.png)

## �📋 Prérequis

- **Node.js** (v14+) et npm
- **MongoDB** (local ou distant)
- **Navigateur web moderne** (Chrome, Firefox, Safari, Edge)
- **Git** pour le clonage du dépôt

## 🚀 Installation et démarrage

### Cloner le dépôt

```bash
git clone https://github.com/votre-username/quiz-app-project.git
cd quiz-app-project
```

### Configuration de l'application web

#### Backend

```bash
cd web/backend
npm install

# Créer un fichier .env dans le dossier backend
# Voir l'exemple ci-dessous

# Démarrer le serveur
npm start
```

Exemple de fichier `.env` pour le backend :
```
MONGODB_URI=mongodb://localhost:27017/quiz-app
JWT_SECRET=votre_clé_secrète_jwt
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
```

#### Frontend

```bash
cd web/frontend
npm install

# Démarrer le serveur de développement
npm run dev

# Pour construire pour la production
npm run build
```

### Configuration de l'application mobile

```bash
cd mobile/frontend
npm install

# Démarrer le serveur de développement
npm run dev

# Pour construire l'application
npm run build
npx cap sync android

# Pour ouvrir dans Android Studio
npx cap open android
```

L'application frontend sera accessible à l'adresse : http://localhost:5173
L'API backend sera accessible à l'adresse : http://localhost:5000

## � Structure du projet

```
quiz-app-project/
├── web/                    # Application web
│   ├── backend/            # API Node.js/Express
│   │   ├── controllers/    # Logique métier
│   │   ├── middleware/     # Middleware Express
│   │   ├── models/         # Modèles Mongoose
│   │   ├── routes/         # Routes API
│   │   ├── uploads/        # Fichiers uploadés
│   │   ├── utils/          # Fonctions utilitaires
│   │   ├── .env            # Variables d'environnement
│   │   ├── package.json    # Dépendances backend
│   │   ├── README.md       # Documentation backend
│   │   └── server.js       # Point d'entrée
│   │
│   └── frontend/           # Frontend React
│       ├── public/         # Fichiers statiques
│       ├── src/            # Code source
│       │   ├── assets/     # Images et ressources
│       │   ├── components/ # Composants React
│       │   ├── contexts/   # Contextes React
│       │   ├── pages/      # Composants de page
│       │   ├── utils/      # Fonctions utilitaires
│       │   ├── App.jsx     # Composant principal
│       │   └── main.jsx    # Point d'entrée
│       ├── package.json    # Dépendances frontend
│       └── README.md       # Documentation frontend
│
├── mobile/                 # Application mobile
│   ├── frontend/           # Frontend React avec Capacitor
│   │   ├── android/        # Projet Android généré
│   │   ├── public/         # Fichiers statiques
│   │   ├── src/            # Code source
│   │   ├── capacitor.config.json # Configuration Capacitor
│   │   └── package.json    # Dépendances mobile
│   │
│   └── data/               # Données JSON pour le mode hors-ligne
│
├── .gitignore              # Fichiers ignorés par Git
└── README.md               # Documentation principale
```

## �📱 Utilisation

1. **Inscription/Connexion** : Créez un compte ou connectez-vous avec vos identifiants
2. **Exploration** : Parcourez les différentes catégories de quiz disponibles
3. **Participation** : Sélectionnez un quiz et répondez aux questions dans le temps imparti (30 secondes par question)
4. **Résultats** : Consultez vos résultats et les réponses correctes après chaque quiz
5. **Statistiques** : Suivez vos performances dans votre profil utilisateur
6. **Personnalisation** : Modifiez votre profil et ajoutez une photo de profil

## 🛠️ Technologies utilisées

### Frontend
- **React.js** : Bibliothèque UI pour construire l'interface utilisateur
- **Vite** : Outil de build rapide pour le développement moderne
- **TailwindCSS** : Framework CSS utilitaire pour le styling
- **React Router** : Gestion des routes et de la navigation
- **React Icons** : Bibliothèque d'icônes pour l'interface
- **Context API** : Gestion de l'état global de l'application

### Backend
- **Node.js** : Environnement d'exécution JavaScript côté serveur
- **Express** : Framework web minimaliste pour Node.js
- **MongoDB** : Base de données NoSQL orientée documents
- **Mongoose** : ODM (Object Data Modeling) pour MongoDB
- **JWT** : JSON Web Tokens pour l'authentification
- **Multer** : Middleware pour la gestion des uploads de fichiers
- **bcrypt** : Bibliothèque pour le hachage des mots de passe

## 🚀 Fonctionnalités avancées

- **Timer automatique** : Chaque question a un délai de 30 secondes
- **Stockage local** : Les données utilisateur sont conservées entre les sessions
- **Gestion des avatars** : Upload et stockage d'images de profil
- **Mode hors ligne** : Certaines fonctionnalités sont disponibles sans connexion internet
- **Animations** : Transitions fluides entre les pages et les questions

## 🔮 Roadmap

- [ ] Ajout de nouvelles catégories de quiz
- [ ] Implémentation d'un mode multijoueur
- [ ] Création d'un tableau de classement global
- [ ] Possibilité de créer ses propres quiz
- [ ] Application mobile native avec React Native

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Contribution

Les contributions sont les bienvenues ! Voici comment vous pouvez contribuer :

1. Fork du projet
2. Création d'une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Commit de vos changements (`git commit -m 'Add some amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouverture d'une Pull Request

## 📞 Contact

Pour toute question ou suggestion, n'hésitez pas à me contacter :

- **Email** : votre-email@example.com
- **GitHub** : [votre-username](https://github.com/votre-username)
- **LinkedIn** : [Votre Nom](https://linkedin.com/in/votre-nom)