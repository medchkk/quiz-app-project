const express = require('express');
const router = express.Router();
const { getUserStats, getUserSubmissions } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

router.get('/stats', authMiddleware, getUserStats);
router.get('/submissions', authMiddleware, getUserSubmissions);

module.exports = router;