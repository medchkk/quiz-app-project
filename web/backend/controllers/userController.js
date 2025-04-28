const User = require('../models/User');
const Submission = require('../models/Submission');
const bcrypt = require('bcrypt');

const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const getUserSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user.userId })
      .populate('quizId', 'title category')
      .sort({ submittedAt: -1 });

    const submissionDetails = submissions.map(submission => ({
      quizTitle: submission.quizId.title,
      category: submission.quizId.category,
      score: submission.score,
      submittedAt: submission.submittedAt,
      submissionId: submission._id,
    }));

    res.json(submissionDetails);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Si l'utilisateur n'a pas d'avatar, générer un avatar par défaut
    if (!user.avatar) {
      user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=0D8ABC&color=fff`;
    }

    // Vérifier si l'avatar est une image base64 ou une URL
    if (user.avatar) {
      console.log('User has avatar:', user.avatar.substring(0, 30) + '...');
    } else {
      console.log('User has no avatar');
    }

    res.json({
      username: user.username,
      email: user.email,
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    console.log('Updating user profile...');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    // Vérifier que l'utilisateur existe
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Récupérer les données du formulaire
    // Gérer à la fois les données JSON et FormData
    let username, email, currentPassword, newPassword;

    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
      // Si c'est un FormData
      username = req.body.username;
      email = req.body.email;
      currentPassword = req.body.currentPassword;
      newPassword = req.body.newPassword;
    } else {
      // Si c'est un JSON
      ({ username, email, currentPassword, newPassword } = req.body);
    }

    console.log('Parsed data:', { username, email, hasPassword: !!currentPassword });

    // Vérifier que les données requises sont présentes
    // Pour le développement, on peut être plus permissif
    if (!username || !email) {
      return res.status(400).json({
        message: 'Données manquantes',
        details: {
          hasUsername: !!username,
          hasEmail: !!email,
          hasPassword: !!currentPassword
        }
      });
    }

    // Si le mot de passe n'est pas fourni, on utilise un mot de passe par défaut pour le développement
    if (!currentPassword) {
      console.warn('Password not provided, using default password for development');
      currentPassword = 'password123'; // Mot de passe par défaut pour le développement
    }

    // Vérifier le mot de passe actuel
    try {
      // Pour le développement, on peut contourner la vérification du mot de passe
      // en utilisant une variable d'environnement
      const skipPasswordCheck = process.env.NODE_ENV === 'development' && process.env.SKIP_PASSWORD_CHECK === 'true';

      if (skipPasswordCheck) {
        console.warn('Skipping password check in development mode');
      } else {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
        }
      }
    } catch (passwordError) {
      console.error('Error comparing passwords:', passwordError);

      // Pour le développement, on peut ignorer cette erreur
      if (process.env.NODE_ENV === 'development') {
        console.warn('Ignoring password error in development mode');
      } else {
        return res.status(400).json({ message: 'Erreur lors de la vérification du mot de passe' });
      }
    }

    // Mettre à jour les informations de base
    user.username = username;
    user.email = email;

    // Mettre à jour le mot de passe si fourni
    if (newPassword) {
      try {
        user.password = await bcrypt.hash(newPassword, 10);
      } catch (hashError) {
        console.error('Error hashing password:', hashError);
        return res.status(500).json({ message: 'Erreur lors du hachage du mot de passe' });
      }
    }

    // Gérer le téléchargement d'avatar
    let avatarUrl = null;

    // Vérifier si un fichier est fourni via multer
    if (req.file) {
      try {
        // Dans un environnement de production, vous stockeriez le fichier
        // sur un service comme AWS S3, Cloudinary, etc.
        // Ici, nous simulons simplement le stockage en enregistrant le chemin

        // Exemple avec un chemin local (à adapter selon votre configuration)
        const avatarPath = `/uploads/avatars/${req.file.filename}`;
        user.avatar = avatarPath;
        avatarUrl = `http://localhost:5000${avatarPath}`;

        console.log('Avatar file uploaded:', avatarUrl);
      } catch (fileError) {
        console.error('Error processing file:', fileError);
        // Continuer même en cas d'erreur de fichier
      }
    }
    // Vérifier si une image base64 est fournie dans le corps de la requête
    else if (req.body.avatarBase64) {
      try {
        console.log('Received base64 avatar data in controller');
        console.log('Base64 data length:', req.body.avatarBase64.length);
        console.log('Base64 data starts with:', req.body.avatarBase64.substring(0, 50) + '...');

        // Stocker directement l'image base64 dans la base de données
        user.avatar = req.body.avatarBase64;
        avatarUrl = req.body.avatarBase64;
        console.log('Base64 avatar stored in database');
      } catch (base64Error) {
        console.error('Error processing base64 image:', base64Error);
      }
    }
    // Si aucun avatar n'est fourni, utiliser un avatar généré
    else {
      console.log('No avatarBase64 found in request body');
      console.log('Request body keys:', Object.keys(req.body));
      console.log('No avatar uploaded, using generated avatar');

      // Générer une URL d'avatar basée sur le nom d'utilisateur
      avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=0D8ABC&color=fff`;
      user.avatar = avatarUrl;
    }

    try {
      await user.save();
      console.log('User profile updated successfully');

      // Renvoyer l'URL de l'avatar si elle a été mise à jour
      return res.json({
        message: 'Profil mis à jour avec succès',
        avatarUrl: avatarUrl
      });
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      return res.status(500).json({ message: 'Erreur lors de la sauvegarde du profil', error: saveError.message });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getUserStats,
  getUserSubmissions,
  getUserProfile,
  updateUserProfile
};