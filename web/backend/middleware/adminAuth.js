const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const adminAuthMiddleware = async (req, res, next) => {
  try {
    logger.debug('AdminAuth', `Admin auth middleware triggered for request: ${req.url}`);

    // Vérifier si le header Authorization existe
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      logger.warn('AdminAuth', 'No Authorization header');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Extraire le token
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      logger.warn('AdminAuth', 'No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Vérifier si JWT_SECRET est défini
    if (!process.env.JWT_SECRET) {
      logger.error('AdminAuth', 'JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    try {
      logger.debug('AdminAuth', 'Verifying token');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      logger.debug('AdminAuth', 'Token verified, decoded payload', {
        userId: decoded.userId,
        role: decoded.role || 'user'
      });

      // Vérifier que le token contient un userId
      if (!decoded.userId) {
        logger.error('AdminAuth', 'Token does not contain userId');
        return res.status(401).json({ message: 'Invalid token format' });
      }

      // Récupérer l'utilisateur depuis la base de données
      const user = await User.findById(decoded.userId);

      // Vérifier si l'utilisateur existe
      if (!user) {
        logger.error('AdminAuth', 'User not found');
        return res.status(401).json({ message: 'User not found' });
      }

      logger.debug('AdminAuth', 'User found in database for admin check', {
        id: user._id,
        username: user.username,
        role: user.role || 'user'
      });

      // Vérifier si l'utilisateur est un administrateur
      if (user.role !== 'admin') {
        logger.error('AdminAuth', `User ${user.username} is not an admin`);
        return res.status(403).json({ message: 'Access denied: Admin privileges required' });
      }

      logger.info('AdminAuth', `Admin access granted for user: ${user.username}`);

      req.user = decoded;
      req.user.role = user.role;
      next();
    } catch (jwtError) {
      logger.error('AdminAuth', `Token verification failed: ${jwtError.message}`);
      return res.status(401).json({ message: 'Token is not valid', error: jwtError.message });
    }
  } catch (error) {
    logger.error('AdminAuth', 'Unexpected error in admin auth middleware', error);
    return res.status(500).json({ message: 'Server error in authentication', error: error.message });
  }
};

module.exports = adminAuthMiddleware;
