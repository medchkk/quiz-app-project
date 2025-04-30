const express = require('express');
const router = express.Router();
const { getQuizzes, getQuizById, submitQuiz, getSubmissionDetails } = require('../controllers/quizController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, getQuizzes);
router.get('/:quizId', authMiddleware, getQuizById); // Standardisation des paramètres
router.post('/:quizId/submit', authMiddleware, submitQuiz);
router.get('/submission/:submissionId', authMiddleware, getSubmissionDetails);

module.exports = router;