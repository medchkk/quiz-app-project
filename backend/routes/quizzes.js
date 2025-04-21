const express = require('express');
const router = express.Router();
const { getQuizzes, getQuizById, submitQuiz, getSubmissionDetails } = require('../controllers/quizController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, getQuizzes);
router.get('/:id', authMiddleware, getQuizById); // authMiddleware réactivé
router.post('/:id/submit', authMiddleware, submitQuiz);
router.get('/submission/:submissionId', authMiddleware, getSubmissionDetails);

module.exports = router;