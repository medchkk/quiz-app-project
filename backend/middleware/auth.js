const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    console.log('Auth middleware triggered for request:', req.url);

    // Vérifier si le header Authorization existe
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      console.log('No Authorization header');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Extraire le token
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Vérifier si JWT_SECRET est défini
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    try {
      console.log('Verifying token');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified, user ID:', decoded.userId);

      // Vérifier que le token contient un userId
      if (!decoded.userId) {
        console.error('Token does not contain userId');
        return res.status(401).json({ message: 'Invalid token format' });
      }

      req.user = decoded;
      next();
    } catch (jwtError) {
      console.error('Token verification failed:', jwtError.message);
      return res.status(401).json({ message: 'Token is not valid', error: jwtError.message });
    }
  } catch (error) {
    console.error('Unexpected error in auth middleware:', error);
    return res.status(500).json({ message: 'Server error in authentication', error: error.message });
  }
};

module.exports = authMiddleware;