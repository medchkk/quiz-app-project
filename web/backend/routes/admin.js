const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const adminAuthMiddleware = require('../middleware/adminAuth');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Submission = require('../models/Submission');
const logger = require('../utils/logger');

/**
 * Route pour récupérer des statistiques générales
 */
router.get('/stats', adminAuthMiddleware, async (_req, res) => {
  try {
    logger.debug('Admin', 'Fetching admin statistics');

    // Optimisation : Utiliser des promesses parallèles pour les requêtes indépendantes
    const [userCount, quizCount, submissionCount] = await Promise.all([
      User.countDocuments(),
      Quiz.countDocuments(),
      Submission.countDocuments()
    ]);

    // Optimisation : Utiliser l'agrégation MongoDB pour calculer la moyenne directement
    const aggregationResult = await Submission.aggregate([
      {
        $group: {
          _id: null,
          averageScore: { $avg: "$score" }
        }
      }
    ]);

    // Extraire le score moyen ou utiliser 0 si aucune soumission
    const averageScore = aggregationResult.length > 0
      ? Math.round(aggregationResult[0].averageScore * 100) / 100
      : 0;

    logger.debug('Admin', 'Admin statistics fetched successfully');

    res.json({
      userCount,
      quizCount,
      submissionCount,
      averageScore
    });
  } catch (error) {
    logger.error('Admin', 'Error fetching admin stats', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Route pour récupérer tous les utilisateurs
 */
router.get('/users', adminAuthMiddleware, async (_req, res) => {
  try {
    logger.debug('Admin', 'Fetching all users');
    const users = await User.find().select('-password');
    logger.debug('Admin', `Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    logger.error('Admin', 'Error fetching users', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Route pour mettre à jour le rôle d'un utilisateur
 */
router.put('/users/:userId/role', adminAuthMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.userId;

    logger.debug('Admin', `Updating role for user ${userId} to ${role}`);

    if (!role || !['user', 'admin'].includes(role)) {
      logger.warn('Admin', `Invalid role provided: ${role}`);
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      logger.warn('Admin', `User not found with ID: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    logger.info('Admin', `Role updated successfully for user ${user.username}`);
    res.json(user);
  } catch (error) {
    logger.error('Admin', 'Error updating user role', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Route pour supprimer un utilisateur (méthode DELETE)
 */
router.delete('/users/:userId', adminAuthMiddleware, async (req, res) => {
  const userId = req.params.userId;
  logger.debug('Admin', `Processing DELETE request for user ${userId}`);

  try {
    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);

    if (!user) {
      logger.warn('Admin', `User not found with ID: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    logger.debug('Admin', `Found user to delete: ${user.username}`);

    // Vérifier si c'est le dernier administrateur
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      logger.debug('Admin', `Admin count: ${adminCount}`);

      if (adminCount <= 1) {
        logger.warn('Admin', 'Cannot delete the last administrator');
        return res.status(400).json({
          message: 'Cannot delete the last administrator',
          error: 'Il doit y avoir au moins un administrateur dans le système'
        });
      }
    }

    // Utiliser Promise.all pour effectuer les opérations en parallèle
    const deletePromises = [];

    // Supprimer les soumissions associées à cet utilisateur
    deletePromises.push(
      Submission.deleteMany({ userId }).then(result => {
        logger.debug('Admin', `Deleted ${result.deletedCount} submissions for user ${userId}`);
        return result;
      }).catch(err => {
        logger.error('Admin', 'Error deleting user submissions', err);
        // Continuer même si la suppression des soumissions échoue
        return null;
      })
    );

    // Supprimer l'utilisateur
    deletePromises.push(
      User.findByIdAndDelete(userId).then(result => {
        logger.debug('Admin', `User deletion result: ${result ? 'Success' : 'Failed'}`);
        return result;
      })
    );

    // Attendre que toutes les opérations soient terminées
    await Promise.all(deletePromises);

    // Si l'utilisateur a un avatar personnalisé, le supprimer
    if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
      try {
        const avatarPath = path.join(__dirname, '..', user.avatar);
        logger.debug('Admin', `Checking for avatar at path: ${avatarPath}`);

        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
          logger.debug('Admin', `Avatar deleted: ${avatarPath}`);
        } else {
          logger.debug('Admin', `Avatar file not found at path: ${avatarPath}`);
        }
      } catch (fileError) {
        logger.error('Admin', 'Error deleting avatar file', fileError);
        // Continuer même si la suppression du fichier échoue
      }
    }

    logger.info('Admin', `User ${user.username} deleted successfully`);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Admin', 'Error deleting user', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Route pour supprimer un utilisateur (méthode POST pour compatibilité avec les formulaires)
 */
router.post('/users/:userId/delete', adminAuthMiddleware, async (req, res) => {
  console.log('POST /admin/users/:userId/delete route hit');
  console.log('User ID to delete:', req.params.userId);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);

  try {
    // Vérifier si l'utilisateur existe
    const user = await User.findById(req.params.userId);

    if (!user) {
      console.log('User not found with ID:', req.params.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Found user to delete:', user.username);

    // Vérifier si c'est le dernier administrateur
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      console.log('Admin count:', adminCount);

      if (adminCount <= 1) {
        console.log('Cannot delete the last administrator');
        return res.status(400).json({
          message: 'Cannot delete the last administrator',
          error: 'Il doit y avoir au moins un administrateur dans le système'
        });
      }
    }

    // Supprimer les soumissions associées à cet utilisateur
    try {
      const deleteResult = await Submission.deleteMany({ userId: req.params.userId });
      console.log(`Deleted ${deleteResult.deletedCount} submissions for user`);
    } catch (submissionError) {
      console.error('Error deleting user submissions:', submissionError);
      // Continuer même si la suppression des soumissions échoue
    }

    // Supprimer l'utilisateur
    const deleteResult = await User.findByIdAndDelete(req.params.userId);
    console.log('User deletion result:', deleteResult ? 'Success' : 'Failed');

    // Si l'utilisateur a un avatar personnalisé, le supprimer
    if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
      try {
        const avatarPath = path.join(__dirname, '..', user.avatar);
        console.log('Checking for avatar at path:', avatarPath);

        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
          console.log(`Avatar deleted: ${avatarPath}`);
        } else {
          console.log('Avatar file not found at path:', avatarPath);
        }
      } catch (fileError) {
        console.error('Error deleting avatar file:', fileError);
        // Continuer même si la suppression du fichier échoue
      }
    }

    console.log('User deleted successfully');
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Route pour récupérer tous les quiz
 */
router.get('/quizzes', adminAuthMiddleware, async (_req, res) => {
  try {
    logger.debug('Admin', 'Fetching all quizzes');

    // Optimisation : Sélectionner uniquement les champs nécessaires
    const quizzes = await Quiz.find({}, {
      title: 1,
      category: 1,
      difficulty: 1,
      description: 1,
      imageUrl: 1,
      isPublished: 1,
      createdAt: 1,
      updatedAt: 1
    });

    logger.debug('Admin', `Found ${quizzes.length} quizzes`);
    res.json(quizzes);
  } catch (error) {
    logger.error('Admin', 'Error fetching quizzes', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Route pour récupérer un quiz spécifique par son ID
 */
router.get('/quizzes/:quizId', adminAuthMiddleware, async (req, res) => {
  try {
    console.log('Admin fetching quiz with ID:', req.params.quizId);
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      console.log('Quiz not found for ID:', req.params.quizId);
      return res.status(404).json({ message: 'Quiz not found' });
    }

    console.log('Quiz found:', quiz.title);
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Route pour créer un nouveau quiz
 */
router.post('/quizzes', adminAuthMiddleware, async (req, res) => {
  try {
    const { title, category, questions } = req.body;

    // Validation de base
    if (!title || !category || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Invalid quiz data' });
    }

    // Validation des questions
    for (const question of questions) {
      if (!question.text || !question.options || !Array.isArray(question.options) ||
          question.options.length < 2 || typeof question.correctAnswer !== 'number' ||
          question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
        return res.status(400).json({
          message: 'Invalid question format',
          details: 'Each question must have text, at least 2 options, and a valid correctAnswer index'
        });
      }
    }

    const quiz = new Quiz({
      title,
      category,
      questions
    });

    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Route pour mettre à jour un quiz existant
 */
router.put('/quizzes/:quizId', adminAuthMiddleware, async (req, res) => {
  try {
    const { title, category, questions, difficulty, description, imageUrl, isPublished } = req.body;

    // Validation de base
    if (!title || !category || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Invalid quiz data' });
    }

    // Validation des questions
    for (const question of questions) {
      if (!question.text || !question.options || !Array.isArray(question.options) ||
          question.options.length < 2 || typeof question.correctAnswer !== 'number' ||
          question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
        return res.status(400).json({
          message: 'Invalid question format',
          details: 'Each question must have text, at least 2 options, and a valid correctAnswer index'
        });
      }
    }

    // Créer un objet avec tous les champs à mettre à jour
    const updateData = {
      title,
      category,
      questions
    };

    // Ajouter les champs optionnels s'ils sont définis
    if (difficulty) updateData.difficulty = difficulty;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    console.log('Updating quiz with data:', updateData);

    const quiz = await Quiz.findByIdAndUpdate(
      req.params.quizId,
      updateData,
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Route pour supprimer un quiz
 */
router.delete('/quizzes/:quizId', adminAuthMiddleware, async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Supprimer également toutes les soumissions associées à ce quiz
    await Submission.deleteMany({ quizId: req.params.quizId });

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Route pour importer des quiz depuis un fichier JSON
 */
router.post('/import/quizzes', adminAuthMiddleware, async (req, res) => {
  try {
    const { quizzes } = req.body;

    if (!quizzes || !Array.isArray(quizzes) || quizzes.length === 0) {
      return res.status(400).json({ message: 'Invalid import data' });
    }

    const results = {
      total: quizzes.length,
      imported: 0,
      errors: []
    };

    for (const quizData of quizzes) {
      try {
        // Validation de base
        if (!quizData.title || !quizData.category || !quizData.questions ||
            !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
          results.errors.push({
            quiz: quizData.title || 'Unknown',
            error: 'Invalid quiz format'
          });
          continue;
        }

        // Validation des questions
        let validQuestions = true;
        for (const question of quizData.questions) {
          if (!question.text || !question.options || !Array.isArray(question.options) ||
              question.options.length < 2 || typeof question.correctAnswer !== 'number' ||
              question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
            results.errors.push({
              quiz: quizData.title,
              error: 'Invalid question format'
            });
            validQuestions = false;
            break;
          }
        }

        if (!validQuestions) continue;

        // Vérifier si un quiz avec le même titre existe déjà
        const existingQuiz = await Quiz.findOne({ title: quizData.title });
        if (existingQuiz) {
          // Créer un objet avec les champs à mettre à jour
          const updateData = {
            category: quizData.category,
            questions: quizData.questions
          };

          // Ajouter les champs optionnels s'ils sont définis
          if (quizData.difficulty) updateData.difficulty = quizData.difficulty;
          if (quizData.description !== undefined) updateData.description = quizData.description;
          if (quizData.imageUrl !== undefined) updateData.imageUrl = quizData.imageUrl;
          if (quizData.isPublished !== undefined) updateData.isPublished = quizData.isPublished;

          // Mettre à jour le quiz existant
          await Quiz.findByIdAndUpdate(existingQuiz._id, updateData);
        } else {
          // Créer un objet avec les champs obligatoires
          const quizData2 = {
            title: quizData.title,
            category: quizData.category,
            questions: quizData.questions
          };

          // Ajouter les champs optionnels s'ils sont définis
          if (quizData.difficulty) quizData2.difficulty = quizData.difficulty;
          if (quizData.description !== undefined) quizData2.description = quizData.description;
          if (quizData.imageUrl !== undefined) quizData2.imageUrl = quizData.imageUrl;
          if (quizData.isPublished !== undefined) quizData2.isPublished = quizData.isPublished;

          // Créer un nouveau quiz
          const quiz = new Quiz(quizData2);

          await quiz.save();
        }

        results.imported++;
      } catch (quizError) {
        results.errors.push({
          quiz: quizData.title || 'Unknown',
          error: quizError.message
        });
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Error importing quizzes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Route pour exporter tous les quiz au format JSON
 */
router.get('/export/quizzes', adminAuthMiddleware, async (_req, res) => {
  try {
    logger.debug('Admin', 'Exporting all quizzes');

    // Pour l'exportation, nous avons besoin de toutes les données
    const quizzes = await Quiz.find();

    logger.debug('Admin', `Exporting ${quizzes.length} quizzes`);
    res.json(quizzes);
  } catch (error) {
    logger.error('Admin', 'Error exporting quizzes', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
