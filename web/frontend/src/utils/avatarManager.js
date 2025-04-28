/**
 * Gestionnaire d'avatars pour l'application
 * Centralise toutes les opérations liées aux avatars
 */
import logger from './logger';
import { STORAGE_KEYS } from './constants';

// URL de base de l'API
const API_URL = 'http://localhost:5000';

/**
 * Récupère la clé d'avatar spécifique à un utilisateur
 * @param {string} username - Nom d'utilisateur
 * @returns {string} - Clé d'avatar
 */
export const getUserAvatarKey = (username) => {
  if (!username) {
    username = localStorage.getItem(STORAGE_KEYS.USERNAME) || 'Utilisateur';
  }
  return `${STORAGE_KEYS.AVATAR_PREFIX}${username}`;
};

/**
 * Vérifie si un avatar est une URL externe (UI-Avatars)
 * @param {string} avatarUrl - URL de l'avatar
 * @returns {boolean} - true si c'est une URL externe
 */
export const isExternalAvatar = (avatarUrl) => {
  return avatarUrl && avatarUrl.includes('ui-avatars.com');
};

/**
 * Vérifie si un avatar est une image base64
 * @param {string} avatarUrl - URL de l'avatar
 * @returns {boolean} - true si c'est une image base64
 */
export const isBase64Avatar = (avatarUrl) => {
  return avatarUrl && avatarUrl.startsWith('data:image/');
};

/**
 * Vérifie si un avatar est un chemin relatif
 * @param {string} avatarUrl - URL de l'avatar
 * @returns {boolean} - true si c'est un chemin relatif
 */
export const isRelativePath = (avatarUrl) => {
  return avatarUrl && avatarUrl.startsWith('/uploads/');
};

/**
 * Convertit un chemin relatif en URL complète
 * @param {string} relativePath - Chemin relatif
 * @returns {string} - URL complète
 */
export const getFullAvatarUrl = (relativePath) => {
  if (!relativePath || !isRelativePath(relativePath)) {
    return relativePath;
  }
  return `${API_URL}${relativePath}`;
};

/**
 * Récupère l'avatar d'un utilisateur
 * @param {string} username - Nom d'utilisateur
 * @returns {Object} - Informations sur l'avatar
 */
export const getUserAvatar = (username) => {
  try {
    // Récupérer la clé d'avatar
    const avatarKey = getUserAvatarKey(username);
    
    // Stocker la clé d'avatar actuelle
    localStorage.setItem(STORAGE_KEYS.CURRENT_AVATAR_KEY, avatarKey);
    logger.debug('Avatar', `Using avatar key: ${avatarKey} for user: ${username}`);
    
    // Récupérer l'avatar du localStorage
    let avatarUrl = localStorage.getItem(avatarKey);
    
    // Vérifier si l'avatar existe avec l'ancienne clé générique
    if (!avatarUrl && localStorage.getItem('userAvatar')) {
      const genericAvatar = localStorage.getItem('userAvatar');
      logger.debug('Avatar', 'Found avatar with generic key, transferring to user-specific key');
      localStorage.setItem(avatarKey, genericAvatar);
      localStorage.removeItem('userAvatar');
      avatarUrl = genericAvatar;
    }
    
    // Déterminer le type d'avatar
    const isExternal = isExternalAvatar(avatarUrl);
    const isBase64 = isBase64Avatar(avatarUrl);
    const isRelative = isRelativePath(avatarUrl);
    
    // Si c'est un chemin relatif, convertir en URL complète
    if (isRelative) {
      logger.debug('Avatar', 'Converting relative path to full URL');
      avatarUrl = getFullAvatarUrl(avatarUrl);
    }
    
    return {
      avatarUrl,
      avatarKey,
      isExternal,
      isBase64,
      isRelative
    };
  } catch (error) {
    logger.error('Avatar', 'Error getting user avatar', error);
    return {
      avatarUrl: '/default-avatar.svg',
      avatarKey: getUserAvatarKey(username),
      isExternal: false,
      isBase64: false,
      isRelative: false
    };
  }
};

/**
 * Sauvegarde l'avatar d'un utilisateur
 * @param {string} username - Nom d'utilisateur
 * @param {string} avatarUrl - URL de l'avatar
 * @returns {string} - Clé d'avatar
 */
export const saveUserAvatar = (username, avatarUrl) => {
  try {
    if (!username || !avatarUrl) {
      logger.warn('Avatar', 'Missing username or avatarUrl');
      return null;
    }
    
    // Récupérer la clé d'avatar
    const avatarKey = getUserAvatarKey(username);
    
    // Stocker l'avatar
    localStorage.setItem(avatarKey, avatarUrl);
    
    // Stocker la clé d'avatar actuelle
    localStorage.setItem(STORAGE_KEYS.CURRENT_AVATAR_KEY, avatarKey);
    
    logger.debug('Avatar', `Saved avatar with key ${avatarKey}`);
    
    // Supprimer l'ancienne clé générique si elle existe
    if (localStorage.getItem('userAvatar')) {
      logger.debug('Avatar', 'Removing generic userAvatar key');
      localStorage.removeItem('userAvatar');
    }
    
    return avatarKey;
  } catch (error) {
    logger.error('Avatar', 'Error saving user avatar', error);
    return null;
  }
};

/**
 * Récupère le profil utilisateur complet
 * @returns {Object} - Profil utilisateur
 */
export const getUserProfile = () => {
  try {
    // Récupérer les données utilisateur du localStorage
    const username = localStorage.getItem(STORAGE_KEYS.USERNAME) || 'Utilisateur';
    const email = localStorage.getItem(STORAGE_KEYS.EMAIL) || 'user@example.com';
    
    // Récupérer l'avatar
    const { avatarUrl } = getUserAvatar(username);
    
    // Utiliser l'avatar ou l'avatar par défaut
    const avatar = avatarUrl || '/default-avatar.svg';
    
    return {
      username,
      email,
      avatar
    };
  } catch (error) {
    logger.error('Avatar', 'Error getting user profile', error);
    return {
      username: 'Utilisateur',
      email: 'user@example.com',
      avatar: '/default-avatar.svg'
    };
  }
};

/**
 * Gère les erreurs de chargement d'avatar
 * @param {Event} event - Événement d'erreur
 * @returns {string} - URL de l'avatar de remplacement
 */
export const handleAvatarError = (event) => {
  try {
    logger.warn('Avatar', 'Error loading avatar image');
    event.target.onerror = null; // Prevent infinite loop
    
    // Récupérer l'avatar actuel
    const username = localStorage.getItem(STORAGE_KEYS.USERNAME) || 'Utilisateur';
    const avatarKey = getUserAvatarKey(username);
    const currentAvatar = localStorage.getItem(avatarKey);
    
    // Vérifier si c'est un chemin relatif
    if (currentAvatar && isRelativePath(currentAvatar)) {
      logger.debug('Avatar', 'Avatar is a relative path, prefixing with server URL');
      const fullUrl = getFullAvatarUrl(currentAvatar);
      logger.debug('Avatar', 'Using full URL');
      event.target.src = fullUrl;
      return fullUrl;
    } 
    
    // Sinon, utiliser l'avatar par défaut
    logger.debug('Avatar', 'Using default avatar as fallback');
    event.target.src = '/default-avatar.svg';
    return '/default-avatar.svg';
  } catch (error) {
    logger.error('Avatar', 'Error handling avatar error', error);
    event.target.src = '/default-avatar.svg';
    return '/default-avatar.svg';
  }
};

export default {
  getUserAvatarKey,
  isExternalAvatar,
  isBase64Avatar,
  isRelativePath,
  getFullAvatarUrl,
  getUserAvatar,
  saveUserAvatar,
  getUserProfile,
  handleAvatarError
};
