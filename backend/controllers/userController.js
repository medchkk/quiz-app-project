const User = require('../models/User');
const Submission = require('../models/Submission');
const Quiz = require('../models/Quiz');

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

module.exports = { getUserStats, getUserSubmissions };