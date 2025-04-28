/**
 * Utilitaire pour nettoyer le localStorage de manière sélective
 * Ne supprime que les clés temporaires et préserve les données importantes
 */

// Liste des clés à conserver absolument
const KEYS_TO_KEEP = [
  'username',
  'email',
  'token',
  'app_initialized',
  'theme',
  'currentAvatarKey'
];

// Préfixe des clés temporaires
const TEMP_KEY_PREFIX = 'tmp-';

// Préfixe des clés d'avatar spécifiques à l'utilisateur
const AVATAR_KEY_PREFIX = 'userAvatar_';

// Ancienne clé générique d'avatar
const GENERIC_AVATAR_KEY = 'userAvatar';

/**
 * Nettoie le localStorage de manière sélective
 * - Conserve les clés importantes (définies dans KEYS_TO_KEEP)
 * - Conserve les avatars spécifiques à l'utilisateur (préfixés par AVATAR_KEY_PREFIX)
 * - Supprime les clés temporaires (préfixées par TEMP_KEY_PREFIX)
 * - Supprime l'ancienne clé générique d'avatar (GENERIC_AVATAR_KEY)
 */
export const cleanLocalStorage = () => {
  try {
    console.log('Selective localStorage cleaning started');

    // Parcourir toutes les clés du localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      // Ignorer les clés null ou undefined
      if (!key) continue;

      // Ne jamais supprimer les clés importantes ou les avatars spécifiques à l'utilisateur
      if (KEYS_TO_KEEP.includes(key) || key.startsWith(AVATAR_KEY_PREFIX)) {
        console.log(`Keeping important key: ${key}`);
        continue;
      }

      // Supprimer uniquement les clés temporaires
      if (key.startsWith(TEMP_KEY_PREFIX)) {
        console.log(`Removing temporary key: ${key}`);
        localStorage.removeItem(key);
      }
    }

    // Supprimer l'ancienne clé générique userAvatar si elle existe
    if (localStorage.getItem(GENERIC_AVATAR_KEY)) {
      console.log('Removing generic userAvatar key');
      localStorage.removeItem(GENERIC_AVATAR_KEY);
    }

    console.log('Selective localStorage cleaning completed');
  } catch (error) {
    console.error('Error during selective localStorage cleaning:', error);
  }
};
