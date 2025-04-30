const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['débutant', 'intermédiaire', 'expert'],
    default: 'intermédiaire'
  },
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  questions: [
    {
      text: {
        type: String,
        required: true,
      },
      options: {
        type: [String],
        required: true,
      },
      correctAnswer: {
        type: Number,
        required: true,
      },
      explanation: {
        type: String,
        default: ''
      },
      imageUrl: {
        type: String,
        default: null
      }
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);