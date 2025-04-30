const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminAuthMiddleware = async (req, res, next) => {
  try {
    console.log('Admin auth middleware triggered for request:', req.url);

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
      console.log('Token verified, decoded payload:', {
        userId: decoded.userId,
        role: decoded.role || 'user'
      });

      // Vérifier que le token contient un userId
      if (!decoded.userId) {
        console.error('Token does not contain userId');
        return res.status(401).json({ message: 'Invalid token format' });
      }

      // Récupérer l'utilisateur depuis la base de données
      const user = await User.findById(decoded.userId);

      // Vérifier si l'utilisateur existe
      if (!user) {
        console.error('User not found');
        return res.status(401).json({ message: 'User not found' });
      }

      console.log('User found in database for admin check:', {
        id: user._id,
        username: user.username,
        role: user.role || 'user'
      });

      // Vérifier si l'utilisateur est un administrateur
      if (user.role !== 'admin') {
        console.error('User is not an admin');
        return res.status(403).json({ message: 'Access denied: Admin privileges required' });
      }

      console.log('Admin access granted for user:', user.username);

      req.user = decoded;
      req.user.role = user.role;
      next();
    } catch (jwtError) {
      console.error('Token verification failed:', jwtError.message);
      return res.status(401).json({ message: 'Token is not valid', error: jwtError.message });
    }
  } catch (error) {
    console.error('Unexpected error in admin auth middleware:', error);
    return res.status(500).json({ message: 'Server error in authentication', error: error.message });
  }
};

module.exports = adminAuthMiddleware;
