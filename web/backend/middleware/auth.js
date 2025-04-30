const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authMiddleware = (req, res, next) => {
  try {
    logger.debug('Auth', `Auth middleware triggered for request: ${req.url}`);

    // Vérifier si le header Authorization existe
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      logger.warn('Auth', 'No Authorization header');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Extraire le token
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      logger.warn('Auth', 'No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Vérifier si JWT_SECRET est défini
    if (!process.env.JWT_SECRET) {
      logger.error('Auth', 'JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    try {
      logger.debug('Auth', 'Verifying token');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      logger.debug('Auth', 'Token verified, decoded payload', {
        userId: decoded.userId,
        role: decoded.role || 'user'
      });

      // Vérifier que le token contient un userId
      if (!decoded.userId) {
        logger.error('Auth', 'Token does not contain userId');
        return res.status(401).json({ message: 'Invalid token format' });
      }

      req.user = decoded;
      next();
    } catch (jwtError) {
      logger.error('Auth', `Token verification failed: ${jwtError.message}`);
      return res.status(401).json({ message: 'Token is not valid', error: jwtError.message });
    }
  } catch (error) {
    logger.error('Auth', 'Unexpected error in auth middleware', error);
    return res.status(500).json({ message: 'Server error in authentication', error: error.message });
  }
};

module.exports = authMiddleware;