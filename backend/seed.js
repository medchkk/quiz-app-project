const mongoose = require('mongoose');
require('dotenv').config();
const Quiz = require('./models/Quiz');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch((err) => console.error('MongoDB connection error:', err));

const quizzes = [
  {
    title: 'Histoire de France',
    category: 'Histoire',
    questions: [
      {
        text: 'Qui a remporté la bataille de Waterloo ?',
        options: ['Napoléon', 'Wellington', 'Louis XIV', 'Jeanne d\'Arc'],
        correctAnswer: 1,
      },
      {
        text: 'En quelle année a eu lieu la Révolution française ?',
        options: ['1789', '1804', '1756', '1815'],
        correctAnswer: 0,
      },
    ],
  },
  {
    title: 'Sciences de base',
    category: 'Sciences',
    questions: [
      {
        text: 'Quelle est la formule de l\'eau ?',
        options: ['H2O', 'CO2', 'O2', 'H2SO4'],
        correctAnswer: 0,
      },
      {
        text: 'Quel est le plus grand organe du corps humain ?',
        options: ['Cerveau', 'Foie', 'Peau', 'Cœur'],
        correctAnswer: 2,
      },
    ],
  },
];

const seedDB = async () => {
  try {
    await Quiz.deleteMany({});
    await Quiz.insertMany(quizzes);
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();