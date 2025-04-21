const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');
const User = require('../models/User');

const getQuizzes = async (req, res) => {
  try {
    console.log('Fetching all quizzes...');
    const quizzes = await Quiz.find({}, 'title category');
    console.log('Quizzes found:', quizzes);
    res.json(quizzes);
  } catch (error) {
    console.error('Error in getQuizzes:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const getQuizById = async (req, res) => {
  try {
    console.log('Fetching quiz with ID:', req.params.id);
    console.log('Database in use:', mongoose.connection.db.databaseName);
    // Recherche manuelle avec findOne
    const quiz = await Quiz.findOne({ _id: req.params.id });
    if (!quiz) {
      console.log('Quiz not found for ID:', req.params.id);
      // Vérifier si des quiz existent dans la base
      const allQuizzes = await Quiz.find({});
      console.log('All quizzes in database:', allQuizzes);
      return res.status(404).json({ message: 'Quiz not found' });
    }
    console.log('Quiz found:', quiz);
    res.json(quiz);
  } catch (error) {
    console.error('Error in getQuizById:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let score = 0;
    const submissionAnswers = answers.map((answer, index) => {
      const isCorrect = quiz.questions[index].correctAnswer === answer;
      if (isCorrect) score++;
      return {
        questionIndex: index,
        selectedOption: answer,
      };
    });

    const submission = new Submission({
      userId: req.user.userId,
      quizId: req.params.id,
      answers: submissionAnswers,
      score,
    });

    await submission.save();

    const user = await User.findById(req.user.userId);
    user.stats.totalScore += score;
    user.stats.totalQuizzesCompleted = (user.stats.totalQuizzesCompleted || 0) + 1; // Incrémenter
    await user.save();

    res.json({ score, total: quiz.questions.length, submissionId: submission._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const getSubmissionDetails = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const quiz = await Quiz.findById(submission.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const results = submission.answers.map(answer => {
      const question = quiz.questions[answer.questionIndex];
      return {
        question: question.text,
        selectedAnswer: question.options[answer.selectedOption],
        correctAnswer: question.options[question.correctAnswer],
        isCorrect: answer.selectedOption === question.correctAnswer,
      };
    });

    res.json({
      score: submission.score,
      total: quiz.questions.length,
      results,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = { getQuizzes, getQuizById, submitQuiz, getSubmissionDetails };