const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  answers: [
    {
      questionIndex: {
        type: Number,
        required: true,
      },
      selectedOption: {
        type: Number,
        required: true,
        // -1 représente "pas de réponse"
        validate: {
          validator: function(v) {
            return v >= -1; // Accepter -1 ou des valeurs positives
          },
          message: props => `${props.value} n'est pas une valeur valide pour selectedOption`
        }
      },
    },
  ],
  score: {
    type: Number,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Submission', submissionSchema);