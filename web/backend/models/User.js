const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: null
  },
  stats: {
    totalScore: {
      type: Number,
      default: 0,
    },
    totalQuizzesCompleted: {
      type: Number,
      default: 0
    },
  },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;