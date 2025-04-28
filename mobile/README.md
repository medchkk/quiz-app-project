# Quiz App Mobile

Version mobile de l'application Quiz, optimisée pour Android.

## Structure

- **frontend/** : Application React avec Capacitor
- **data/** : Données JSON pour le mode hors-ligne

## Installation

```bash
cd frontend
npm install
```

## Développement

```bash
npm run dev
```

## Construction

```bash
npm run build
npx cap sync android
```

## Génération de l'APK

1. Ouvrir le projet dans Android Studio :
   ```bash
   npx cap open android
   ```

2. Dans Android Studio, sélectionner "Build" > "Build Bundle(s) / APK(s)" > "Build APK(s)"

3. L'APK sera généré dans le dossier `android/app/build/outputs/apk/debug/`

## Fonctionnalités

- Progressive Web App (PWA) avec fonctionnalités hors-ligne
- Interface utilisateur adaptée aux appareils mobiles
- Stockage local avec Capacitor Preferences
- Synchronisation des données avec le backend lorsque la connexion est disponible

## Technologies utilisées

- React
- Vite
- Capacitor
- IndexedDB
- Service Workers
- Web Storage API
