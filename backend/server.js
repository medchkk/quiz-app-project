const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const logger = require('./utils/logger');
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quizzes');
const userRoutes = require('./routes/users');
require('dotenv').config();

// Configuration
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const MONGODB_URI = process.env.MONGODB_URI;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialisation de l'application
const app = express();

// Middleware de logging (uniquement en développement)
if (NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    logger.debug('Server', `${req.method} ${req.url}`);
    next();
  });
}

// Middleware CORS
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware pour parser le JSON et les données de formulaire
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Connexion à MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => logger.info('Database', 'Connected to MongoDB'))
  .catch((err) => logger.error('Database', 'MongoDB connection error', err));

// Routes
app.use('/auth', authRoutes);
app.use('/quizzes', quizRoutes);
app.use('/users', userRoutes);

// Route par défaut
app.get('/', (_req, res) => {
  res.send('Backend Quiz App is running!');
});

// Middleware de gestion des erreurs
app.use((err, _req, res, _next) => {
  logger.error('Server', 'Internal server error', err);
  res.status(500).json({
    message: 'Internal server error',
    error: NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  logger.info('Server', `Server running on port ${PORT} in ${NODE_ENV} mode`);
});