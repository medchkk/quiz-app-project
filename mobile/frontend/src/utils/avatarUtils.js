/**
 * Utilitaires pour la gestion des avatars
 */

/**
 * Génère un avatar basé sur la première lettre du nom d'utilisateur
 * @param {string} username - Nom d'utilisateur
 * @returns {string} - URL de l'avatar en base64
 */
export const generateLetterAvatar = (username) => {
  try {
    const firstLetter = username.charAt(0).toUpperCase();
    const colors = {
      A: '#FF5733', B: '#33FF57', C: '#3357FF', D: '#F333FF', E: '#33FFF5',
      F: '#FF33A8', G: '#A833FF', H: '#33FFA8', I: '#FF8C33', J: '#8CFF33',
      K: '#338CFF', L: '#FF338C', M: '#33FF8C', N: '#8C33FF', O: '#FF5733',
      P: '#33FF57', Q: '#3357FF', R: '#F333FF', S: '#33FFF5', T: '#FF33A8',
      U: '#A833FF', V: '#33FFA8', W: '#FF8C33', X: '#8CFF33', Y: '#338CFF',
      Z: '#FF338C'
    };
    const bgColor = colors[firstLetter] || '#0D8ABC';

    // Créer un canvas pour générer l'image
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    // Dessiner le fond
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dessiner la lettre
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 100px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(firstLetter, canvas.width / 2, canvas.height / 2);

    // Convertir en base64
    return canvas.toDataURL('image/png');
  } catch (e) {
    console.error('Error generating avatar:', e);
    // Fallback à une image statique SVG
    const firstLetter = username.charAt(0).toUpperCase();
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%230D8ABC"/><text x="50%" y="50%" font-size="100" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold" dominant-baseline="middle">${firstLetter}</text></svg>`;
  }
};

/**
 * Vérifie si l'avatar est une URL externe (ui-avatars.com)
 * @param {string} avatarUrl - URL de l'avatar
 * @returns {boolean} - true si c'est une URL externe
 */
export const isExternalAvatar = (avatarUrl) => {
  return avatarUrl && avatarUrl.includes('ui-avatars.com');
};

/**
 * Vérifie si l'avatar est une image base64
 * @param {string} avatarUrl - URL de l'avatar
 * @returns {boolean} - true si c'est une image base64
 */
export const isBase64Image = (avatarUrl) => {
  return avatarUrl && avatarUrl.startsWith('data:image/');
};

/**
 * Vérifie si l'avatar est un chemin relatif
 * @param {string} avatarUrl - URL de l'avatar
 * @returns {boolean} - true si c'est un chemin relatif
 */
export const isRelativePath = (avatarUrl) => {
  return avatarUrl && avatarUrl.startsWith('/uploads/');
};

/**
 * Préfixe un chemin relatif avec l'URL du serveur
 * @param {string} relativePath - Chemin relatif
 * @returns {string} - URL complète
 */
export const getFullAvatarUrl = (relativePath) => {
  if (!relativePath || !isRelativePath(relativePath)) return relativePath;
  return `http://localhost:5000${relativePath}`;
};

/**
 * Récupère l'avatar de l'utilisateur depuis le localStorage
 * @param {string} username - Nom d'utilisateur
 * @returns {Object} - Informations sur l'avatar
 */
export const getUserAvatar = (username) => {
  // Créer une clé spécifique à l'utilisateur pour l'avatar
  const userAvatarKey = `userAvatar_${username}`;
  
  // Récupérer l'avatar du localStorage
  let avatarUrl = localStorage.getItem(userAvatarKey);
  
  // Si l'avatar est un chemin relatif, préfixer avec l'URL du serveur
  if (isRelativePath(avatarUrl)) {
    avatarUrl = getFullAvatarUrl(avatarUrl);
  }
  
  return {
    avatarUrl,
    avatarKey: userAvatarKey,
    isExternal: isExternalAvatar(avatarUrl),
    isBase64: isBase64Image(avatarUrl),
    isRelative: isRelativePath(avatarUrl)
  };
};

/**
 * Sauvegarde l'avatar de l'utilisateur dans le localStorage
 * @param {string} username - Nom d'utilisateur
 * @param {string} avatarUrl - URL de l'avatar
 */
export const saveUserAvatar = (username, avatarUrl) => {
  if (!username || !avatarUrl) return;
  
  // Créer une clé spécifique à l'utilisateur pour l'avatar
  const userAvatarKey = `userAvatar_${username}`;
  
  // Stocker l'avatar avec la clé spécifique à l'utilisateur
  localStorage.setItem(userAvatarKey, avatarUrl);
  
  // Stocker la clé de l'avatar actuel
  localStorage.setItem('currentAvatarKey', userAvatarKey);
  
  console.log(`Avatar saved in localStorage with key ${userAvatarKey}`);
  
  // Supprimer l'ancienne clé générique si elle existe
  if (localStorage.getItem('userAvatar')) {
    console.log('Removing generic userAvatar key');
    localStorage.removeItem('userAvatar');
  }
  
  return userAvatarKey;
};
