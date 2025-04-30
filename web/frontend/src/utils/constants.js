/**
 * Constantes globales pour l'application
 */

// URL de l'API
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// URL pour les avatars générés
export const UI_AVATARS_URL = 'https://ui-avatars.com/api';

// Préfixes pour les clés de localStorage
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USERNAME: 'username',
  EMAIL: 'email',
  THEME: 'theme',
  USER_ROLE: 'userRole',
  AVATAR_PREFIX: 'userAvatar_',
  CURRENT_AVATAR_KEY: 'currentAvatarKey',
  APP_INITIALIZED: 'app_initialized',
  TEMP_PREFIX: 'tmp-'
};

// Taille maximale des fichiers (en octets)
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// Délai du timer pour les questions de quiz (en secondes)
export const QUIZ_TIMER_SECONDS = 30;

// Couleurs de l'application
export const COLORS = {
  PRIMARY: '#0D8ABC',
  SECONDARY: '#FF5733',
  SUCCESS: '#33FF57',
  DANGER: '#FF3357',
  WARNING: '#FFAA33',
  INFO: '#33FFF5',
  LIGHT: '#F5F5F5',
  DARK: '#333333',
  NEON_BLUE: '#00BFFF',
  NEON_PINK: '#FF6EC7'
};
