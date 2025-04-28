const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const {
  getUserStats,
  getUserSubmissions,
  getUserProfile,
  updateUserProfile
} = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

/**
 * Configuration
 */
// Chemin du dossier d'uploads
const UPLOADS_DIR = path.join(__dirname, '../uploads/avatars');
// Taille maximale des fichiers (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024;
// Préfixe pour les noms de fichiers
const FILE_PREFIX = 'avatar-';
// Mode d'environnement
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Crée le dossier d'uploads s'il n'existe pas
 */
const createUploadsDir = () => {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      logger.info('Files', `Created uploads directory: ${UPLOADS_DIR}`);
    }
  } catch (error) {
    logger.warn('Files', `Could not create uploads directory: ${error.message}`);
  }
};

// Créer le dossier d'uploads
createUploadsDir();

/**
 * Configuration de multer pour le stockage des fichiers
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${FILE_PREFIX}${uniqueSuffix}${ext}`);
  }
});

/**
 * Filtre pour n'accepter que les images
 */
const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont acceptées'), false);
  }
};

/**
 * Configuration de multer
 */
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter
});

/**
 * Middleware pour traiter les données base64 après multer
 * - Vérifie si une image base64 est présente dans la requête
 * - Ajoute des données par défaut pour le développement
 */
const handleBase64Data = async (req, res, next) => {
  try {
    logger.debug('Middleware', 'Processing request in handleBase64Data middleware');

    // Si le corps de la requête est vide ou mal formé, initialiser un objet vide
    if (!req.body || typeof req.body !== 'object') {
      logger.warn('Middleware', 'Request body is empty or invalid, initializing empty object');
      req.body = {};
    }

    // Vérifier si une image base64 est présente dans la requête
    if (req.body.avatarBase64) {
      logger.debug('Middleware', 'Found base64 avatar data in request');
    }

    // Pour le développement, on peut ajouter des données par défaut
    if (NODE_ENV === 'development') {
      await addDefaultUserData(req);
    }

    // Continuer avec le traitement de la requête
    next();
  } catch (error) {
    logger.error('Middleware', 'Error in handleBase64Data middleware', error);
    res.status(500).json({ message: 'Error processing form data', error: error.message });
  }
};

/**
 * Ajoute des données par défaut à partir du token JWT
 * @param {Object} req - Requête Express
 * @returns {Promise<void>}
 */
const addDefaultUserData = async (req) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) return;

    // Récupérer l'utilisateur depuis la base de données
    const User = require('../models/User');
    const user = await User.findById(decoded.userId);

    if (user) {
      // Ajouter les données de l'utilisateur au corps de la requête si elles ne sont pas déjà présentes
      req.body.username = req.body.username || user.username;
      req.body.email = req.body.email || user.email;

      logger.debug('Middleware', 'Added default data from user', {
        username: req.body.username
      });
    }
  } catch (error) {
    logger.error('Middleware', 'Error adding default user data', error);
    // Ne pas bloquer le processus en cas d'erreur
  }
};

/**
 * Routes utilisateur
 */
// Récupérer les statistiques de l'utilisateur
router.get('/stats', authMiddleware, getUserStats);

// Récupérer les soumissions de l'utilisateur
router.get('/submissions', authMiddleware, getUserSubmissions);

// Récupérer le profil de l'utilisateur
router.get('/profile', authMiddleware, getUserProfile);

// Mettre à jour le profil de l'utilisateur
router.put('/profile',
  authMiddleware,
  upload.single('avatar'),
  handleBase64Data,
  updateUserProfile
);

// Route pour servir les avatars
router.use('/uploads/avatars', express.static(UPLOADS_DIR));

module.exports = router;