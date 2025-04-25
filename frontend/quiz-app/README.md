# Quiz App - Frontend

Interface utilisateur de l'application Quiz App, développée avec React et Vite.

![Quiz App Screenshot](../public/app-screenshot.png)

## 🌟 Fonctionnalités

- **Interface utilisateur intuitive** : Navigation fluide et design responsive
- **Thème sombre/clair** : Personnalisation de l'apparence
- **Quiz interactifs** : Questions à choix multiples avec minuteur
- **Profil utilisateur** : Gestion des informations et photo de profil
- **Statistiques** : Visualisation des performances

## 🚀 Démarrage rapide

### Prérequis

- Node.js (v14+)
- npm ou yarn

### Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

L'application sera accessible à l'adresse : http://localhost:5173

### Build pour la production

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist`.

## 📁 Structure du projet

```
src/
├── assets/        # Images, icônes et autres ressources
├── components/    # Composants React réutilisables
├── contexts/      # Contextes React (thème, auth, etc.)
├── hooks/         # Hooks personnalisés
├── pages/         # Composants de page
├── utils/         # Fonctions utilitaires
├── App.jsx        # Composant principal
└── main.jsx       # Point d'entrée
```

## 🔧 Technologies utilisées

- **React** : Bibliothèque UI
- **Vite** : Build tool et serveur de développement
- **React Router** : Navigation entre les pages
- **TailwindCSS** : Framework CSS utilitaire
- **React Icons** : Bibliothèque d'icônes

## 🔄 Communication avec le backend

L'application communique avec le backend via une API RESTful. Les requêtes sont gérées par le module `api.js` dans le dossier `utils`.

## 🧪 Tests

```bash
# Exécuter les tests
npm test
```

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.
