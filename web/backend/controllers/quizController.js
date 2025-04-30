const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');
const User = require('../models/User');

const getQuizzes = async (_req, res) => {
  try {
    console.log('Fetching all quizzes...');
    // Récupérer tous les quiz avec leurs questions
    const quizzes = await Quiz.find({});

    // Transformer les données pour n'inclure que les champs nécessaires
    const transformedQuizzes = quizzes.map(quiz => ({
      _id: quiz._id,
      title: quiz.title,
      category: quiz.category,
      difficulty: quiz.difficulty,
      description: quiz.description,
      imageUrl: quiz.imageUrl,
      isPublished: quiz.isPublished,
      questions: quiz.questions // Inclure les questions complètes
    }));

    console.log('Quizzes found:', transformedQuizzes.length);
    res.json(transformedQuizzes);
  } catch (error) {
    console.error('Error in getQuizzes:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const getQuizById = async (req, res) => {
  try {
    // Utilisation du paramètre standardisé quizId
    const quizId = req.params.quizId;
    console.log('Fetching quiz with ID:', quizId);
    console.log('Database in use:', mongoose.connection.db.databaseName);

    // Recherche avec findById
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      console.log('Quiz not found for ID:', quizId);
      // Vérifier si des quiz existent dans la base
      const quizCount = await Quiz.countDocuments();
      console.log('Number of quizzes in database:', quizCount);
      return res.status(404).json({
        message: 'Quiz not found',
        error: `No quiz found with ID: ${quizId}`
      });
    }

    console.log('Quiz found:', quiz.title);
    res.json(quiz);
  } catch (error) {
    console.error('Error in getQuizById:', error);

    // Amélioration de la gestion des erreurs
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid quiz ID format',
        error: `The provided ID "${req.params.quizId}" is not a valid MongoDB ObjectId`
      });
    }

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    // Utilisation du paramètre standardisé quizId
    const quizId = req.params.quizId;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found',
        error: `No quiz found with ID: ${quizId}`
      });
    }

    // Validation des réponses
    if (!answers || !Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return res.status(400).json({
        message: 'Invalid answers format',
        error: 'Answers must be an array with the same length as the quiz questions'
      });
    }

    let score = 0;
    const submissionAnswers = answers.map((answer, index) => {
      // Gérer le cas où answer est null (pas de réponse sélectionnée)
      const selectedOption = answer === null ? -1 : answer;

      // Vérifier si la réponse est correcte (uniquement si une réponse a été sélectionnée)
      const isCorrect = answer !== null && quiz.questions[index].correctAnswer === answer;
      if (isCorrect) score++;

      return {
        questionIndex: index,
        selectedOption: selectedOption, // Utiliser -1 pour représenter "pas de réponse"
      };
    });

    const submission = new Submission({
      userId: req.user.userId,
      quizId: quizId,
      answers: submissionAnswers,
      score,
    });

    await submission.save();

    // Mise à jour des statistiques de l'utilisateur
    const user = await User.findById(req.user.userId);
    if (user) {
      // Initialiser les stats si elles n'existent pas
      if (!user.stats) {
        user.stats = { totalScore: 0, totalQuizzesCompleted: 0 };
      }

      user.stats.totalScore = (user.stats.totalScore || 0) + score;
      user.stats.totalQuizzesCompleted = (user.stats.totalQuizzesCompleted || 0) + 1;
      await user.save();
    }

    res.json({
      score,
      total: quiz.questions.length,
      submissionId: submission._id,
      message: 'Quiz submitted successfully'
    });
  } catch (error) {
    console.error('Error in submitQuiz:', error);

    // Amélioration de la gestion des erreurs
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid quiz ID format',
        error: `The provided ID "${req.params.quizId}" is not a valid MongoDB ObjectId`
      });
    }

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getSubmissionDetails = async (req, res) => {
  try {
    const submissionId = req.params.submissionId;
    console.log('Fetching submission details for ID:', submissionId);

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({
        message: 'Submission not found',
        error: `No submission found with ID: ${submissionId}`
      });
    }

    // Vérifier si l'utilisateur est autorisé à voir cette soumission
    if (submission.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Not authorized',
        error: 'You are not authorized to view this submission'
      });
    }

    const quiz = await Quiz.findById(submission.quizId);
    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found',
        error: `The quiz associated with this submission (ID: ${submission.quizId}) was not found`
      });
    }

    const results = submission.answers.map(answer => {
      const question = quiz.questions[answer.questionIndex];
      return {
        question: question.text,
        // Gérer le cas où aucune réponse n'a été sélectionnée
        selectedAnswer: answer.selectedOption === -1 ? "Pas de réponse" : question.options[answer.selectedOption],
        correctAnswer: question.options[question.correctAnswer],
        isCorrect: answer.selectedOption === question.correctAnswer,
      };
    });

    res.json({
      score: submission.score,
      total: quiz.questions.length,
      results,
      submittedAt: submission.createdAt,
      message: 'Submission details retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getSubmissionDetails:', error);

    // Amélioration de la gestion des erreurs
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid submission ID format',
        error: `The provided ID "${req.params.submissionId}" is not a valid MongoDB ObjectId`
      });
    }

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = { getQuizzes, getQuizById, submitQuiz, getSubmissionDetails };