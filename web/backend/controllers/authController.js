const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const register = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      username,
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Créer le payload du token avec le rôle de l'utilisateur
    const tokenPayload = {
      userId: user._id,
      role: user.role || 'user' // Inclure le rôle dans le token
    };

    logger.debug('Auth', 'Creating JWT token with payload', tokenPayload);

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Préparer les informations utilisateur à renvoyer
    const userInfo = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role || 'user',
      avatar: user.avatar
    };

    logger.debug('Auth', 'Sending user info in response', userInfo);

    // Renvoyer le token et les informations de base de l'utilisateur
    res.json({
      token,
      user: userInfo
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = { register, login };