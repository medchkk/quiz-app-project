/**
 * Logique hors-ligne pour l'application Quiz
 * Permet de fonctionner sans backend en utilisant IndexedDB
 */
import { openDB } from 'idb';
import quizzesData from '../data/quizzes.json';
import usersData from '../data/users.json';
import submissionsData from '../data/submissions.json';

// Configuration de la base de données IndexedDB
const DB_NAME = 'quiz-app-db';
const DB_VERSION = 1;

/**
 * Initialise la base de données IndexedDB
 * @returns {Promise<IDBDatabase>} - Instance de la base de données
 */
export const initDB = async () => {
  try {
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Créer les object stores si ils n'existent pas
        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { keyPath: '_id' });
          usersStore.createIndex('email', 'email', { unique: true });
        }

        if (!db.objectStoreNames.contains('quizzes')) {
          db.createObjectStore('quizzes', { keyPath: '_id' });
        }

        if (!db.objectStoreNames.contains('submissions')) {
          const submissionsStore = db.createObjectStore('submissions', { keyPath: '_id', autoIncrement: true });
          submissionsStore.createIndex('userId', 'userId', { unique: false });
          submissionsStore.createIndex('quizId', 'quizId', { unique: false });
        }
      }
    });

    // Vérifier si les données initiales sont déjà chargées
    const tx = db.transaction('quizzes', 'readonly');
    const quizzesStore = tx.objectStore('quizzes');
    const quizzesCount = await quizzesStore.count();

    // Si aucun quiz n'est présent, charger les données initiales
    if (quizzesCount === 0) {
      await loadInitialData(db);
    }

    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

/**
 * Charge les données initiales dans IndexedDB
 * @param {IDBDatabase} db - Instance de la base de données
 */
export const loadInitialData = async (db) => {
  try {
    // Charger les quizzes
    const quizzesTx = db.transaction('quizzes', 'readwrite');
    const quizzesStore = quizzesTx.objectStore('quizzes');
    for (const quiz of quizzesData) {
      await quizzesStore.add(quiz);
    }
    await quizzesTx.done;

    // Charger les utilisateurs
    const usersTx = db.transaction('users', 'readwrite');
    const usersStore = usersTx.objectStore('users');
    for (const user of usersData) {
      await usersStore.add(user);
    }
    await usersTx.done;

    // Charger les soumissions
    const submissionsTx = db.transaction('submissions', 'readwrite');
    const submissionsStore = submissionsTx.objectStore('submissions');
    for (const submission of submissionsData) {
      await submissionsStore.add(submission);
    }
    await submissionsTx.done;

    console.log('Initial data loaded successfully');
  } catch (error) {
    console.error('Error loading initial data:', error);
    throw error;
  }
};

/**
 * Calcule le score d'un quiz en fonction des réponses
 * @param {Array} answers - Réponses de l'utilisateur
 * @param {Object} quiz - Quiz avec les questions et réponses correctes
 * @returns {number} - Score obtenu
 */
export const calculateScore = (answers, quiz) => {
  if (!answers || !quiz || !quiz.questions) {
    return 0;
  }

  let score = 0;

  // Parcourir les réponses et comparer avec les réponses correctes
  answers.forEach((answer, index) => {
    if (index < quiz.questions.length) {
      const question = quiz.questions[index];
      // Vérifier si la réponse est correcte (uniquement si une réponse a été sélectionnée)
      if (answer !== null && answer === question.correctAnswer) {
        score++;
      }
    }
  });

  return score;
};

/**
 * Enregistre un nouvel utilisateur
 * @param {Object} userObj - Données de l'utilisateur
 * @returns {Promise<Object>} - Utilisateur créé
 */
export const registerUser = async (userObj) => {
  try {
    const db = await initDB();

    // Vérifier si l'email existe déjà
    const tx = db.transaction('users', 'readonly');
    const usersStore = tx.objectStore('users');
    const emailIndex = usersStore.index('email');
    const existingUser = await emailIndex.get(userObj.email);

    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Générer un ID unique
    const userId = 'user_' + Date.now();

    // Créer l'utilisateur
    const newUser = {
      _id: userId,
      email: userObj.email,
      password: userObj.password, // Le mot de passe doit être hashé avant d'appeler cette fonction
      username: userObj.username,
      avatar: null,
      stats: {
        totalScore: 0,
        totalQuizzesCompleted: 0
      }
    };

    // Enregistrer l'utilisateur
    const writeTx = db.transaction('users', 'readwrite');
    const writeStore = writeTx.objectStore('users');
    await writeStore.add(newUser);
    await writeTx.done;

    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Authentifie un utilisateur
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe de l'utilisateur
 * @returns {Promise<Object>} - Utilisateur authentifié
 */
export const login = async (email, password) => {
  try {
    const db = await initDB();

    // Rechercher l'utilisateur par email
    const tx = db.transaction('users', 'readonly');
    const usersStore = tx.objectStore('users');
    const emailIndex = usersStore.index('email');
    const user = await emailIndex.get(email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Vérifier le mot de passe (à implémenter avec bcryptjs)
    // Pour l'instant, comparaison simple
    if (user.password !== password) {
      throw new Error('Invalid email or password');
    }

    // Générer un token (simulé)
    const token = 'offline_token_' + Date.now();

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

/**
 * Récupère tous les quizzes
 * @returns {Promise<Array>} - Liste des quizzes
 */
export const getQuizzes = async () => {
  try {
    const db = await initDB();

    const tx = db.transaction('quizzes', 'readonly');
    const quizzesStore = tx.objectStore('quizzes');
    const quizzes = await quizzesStore.getAll();

    // Retourner uniquement les informations nécessaires pour la liste
    return quizzes.map(quiz => ({
      _id: quiz._id,
      title: quiz.title,
      category: quiz.category
    }));
  } catch (error) {
    console.error('Error getting quizzes:', error);
    throw error;
  }
};

/**
 * Récupère un quiz par son ID
 * @param {string} quizId - ID du quiz
 * @returns {Promise<Object>} - Quiz
 */
export const getQuizById = async (quizId) => {
  try {
    const db = await initDB();

    const tx = db.transaction('quizzes', 'readonly');
    const quizzesStore = tx.objectStore('quizzes');
    const quiz = await quizzesStore.get(quizId);

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    return quiz;
  } catch (error) {
    console.error('Error getting quiz:', error);
    throw error;
  }
};

/**
 * Soumet un quiz
 * @param {string} quizId - ID du quiz
 * @param {string} userId - ID de l'utilisateur
 * @param {Array} answers - Réponses de l'utilisateur
 * @returns {Promise<Object>} - Résultat de la soumission
 */
export const submitQuiz = async (quizId, userId, answers) => {
  try {
    const db = await initDB();

    // Récupérer le quiz
    const quizTx = db.transaction('quizzes', 'readonly');
    const quizzesStore = quizTx.objectStore('quizzes');
    const quiz = await quizzesStore.get(quizId);

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Calculer le score
    const score = calculateScore(answers, quiz);

    // Créer la soumission
    const submissionId = 'submission_' + Date.now();
    const submission = {
      _id: submissionId,
      userId,
      quizId,
      answers: answers.map((answer, index) => ({
        questionIndex: index,
        selectedOption: answer === null ? -1 : answer
      })),
      score,
      submittedAt: new Date().toISOString()
    };

    // Enregistrer la soumission
    const submissionTx = db.transaction('submissions', 'readwrite');
    const submissionsStore = submissionTx.objectStore('submissions');
    await submissionsStore.add(submission);
    await submissionTx.done;

    // Vérifier si l'utilisateur existe et créer un utilisateur temporaire si nécessaire
    const userTx = db.transaction('users', 'readwrite');
    const usersStore = userTx.objectStore('users');
    let user = await usersStore.get(userId);

    // Si l'utilisateur n'existe pas (utilisateur temporaire), le créer
    if (!user && userId.startsWith('temp_user_')) {
      console.log('Creating temporary user in database:', userId);
      user = {
        _id: userId,
        email: 'temp@example.com',
        username: 'Utilisateur Temporaire',
        password: 'temp_password',
        avatar: null,
        stats: {
          totalScore: 0,
          totalQuizzesCompleted: 0
        }
      };
      await usersStore.add(user);
    }

    // Mettre à jour les statistiques de l'utilisateur s'il existe
    if (user) {
      user.stats.totalScore += score;
      user.stats.totalQuizzesCompleted += 1;
      await usersStore.put(user);
    }
    await userTx.done;

    return { score, total: quiz.questions.length, submissionId };
  } catch (error) {
    console.error('Error submitting quiz:', error);
    throw error;
  }
};

/**
 * Récupère les détails d'une soumission
 * @param {string} submissionId - ID de la soumission
 * @returns {Promise<Object>} - Détails de la soumission
 */
export const getSubmissionDetails = async (submissionId) => {
  try {
    const db = await initDB();

    // Récupérer la soumission
    const submissionTx = db.transaction('submissions', 'readonly');
    const submissionsStore = submissionTx.objectStore('submissions');
    const submission = await submissionsStore.get(submissionId);

    if (!submission) {
      throw new Error('Submission not found');
    }

    // Récupérer le quiz
    const quizTx = db.transaction('quizzes', 'readonly');
    const quizzesStore = quizTx.objectStore('quizzes');
    const quiz = await quizzesStore.get(submission.quizId);

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Vérifier si l'utilisateur existe
    const userTx = db.transaction('users', 'readonly');
    const usersStore = userTx.objectStore('users');
    const user = await usersStore.get(submission.userId);

    // Si l'utilisateur n'existe pas et que c'est un ID temporaire, créer un utilisateur temporaire
    if (!user && submission.userId.startsWith('temp_user_')) {
      console.log('Creating temporary user for submission details:', submission.userId);
      const tempUserTx = db.transaction('users', 'readwrite');
      const tempUsersStore = tempUserTx.objectStore('users');
      const tempUser = {
        _id: submission.userId,
        email: 'temp@example.com',
        username: 'Utilisateur Temporaire',
        password: 'temp_password',
        avatar: null,
        stats: {
          totalScore: submission.score,
          totalQuizzesCompleted: 1
        }
      };
      await tempUsersStore.add(tempUser);
      await tempUserTx.done;
    }

    // Préparer les résultats
    const results = submission.answers.map(answer => {
      const question = quiz.questions[answer.questionIndex];
      return {
        question: question.text,
        selectedAnswer: answer.selectedOption === -1 ? "Pas de réponse" : question.options[answer.selectedOption],
        correctAnswer: question.options[question.correctAnswer],
        isCorrect: answer.selectedOption === question.correctAnswer
      };
    });

    return {
      score: submission.score,
      total: quiz.questions.length,
      results
    };
  } catch (error) {
    console.error('Error getting submission details:', error);
    throw error;
  }
};

/**
 * Récupère les soumissions d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} - Liste des soumissions
 */
export const getUserSubmissions = async (userId) => {
  try {
    const db = await initDB();

    // Récupérer les soumissions de l'utilisateur
    const submissionTx = db.transaction('submissions', 'readonly');
    const submissionsStore = submissionTx.objectStore('submissions');
    const userIndex = submissionsStore.index('userId');
    const submissions = await userIndex.getAll(userId);

    // Récupérer les informations des quizzes
    const quizTx = db.transaction('quizzes', 'readonly');
    const quizzesStore = quizTx.objectStore('quizzes');

    // Préparer les résultats
    const results = await Promise.all(submissions.map(async (submission) => {
      const quiz = await quizzesStore.get(submission.quizId);
      return {
        _id: submission._id,
        quizTitle: quiz ? quiz.title : 'Quiz inconnu',
        score: submission.score,
        total: quiz ? quiz.questions.length : 0,
        submittedAt: submission.submittedAt
      };
    }));

    return results;
  } catch (error) {
    console.error('Error getting user submissions:', error);
    throw error;
  }
};

/**
 * Récupère les statistiques d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} - Statistiques de l'utilisateur
 */
export const getUserStats = async (userId) => {
  try {
    const db = await initDB();

    const tx = db.transaction('users', 'readonly');
    const usersStore = tx.objectStore('users');
    const user = await usersStore.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user.stats;
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

/**
 * Récupère le profil d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} - Profil de l'utilisateur
 */
export const getUserProfile = async (userId) => {
  try {
    const db = await initDB();

    const tx = db.transaction('users', 'readonly');
    const usersStore = tx.objectStore('users');
    const user = await usersStore.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Retourner le profil sans le mot de passe
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Met à jour le profil d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} profileData - Données du profil à mettre à jour
 * @returns {Promise<Object>} - Profil mis à jour
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    const db = await initDB();

    // Récupérer l'utilisateur
    const tx = db.transaction('users', 'readwrite');
    const usersStore = tx.objectStore('users');
    const user = await usersStore.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Mettre à jour les champs
    if (profileData.username) {
      user.username = profileData.username;
    }

    if (profileData.avatar) {
      user.avatar = profileData.avatar;
    }

    // Enregistrer les modifications
    await usersStore.put(user);
    await tx.done;

    // Retourner le profil mis à jour sans le mot de passe
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Initialise les quizzes dans la base de données
 * @returns {Promise<void>}
 */
export const initializeQuizzes = async () => {
  try {
    const db = await initDB();

    // Vérifier si des quizzes existent déjà
    const tx = db.transaction('quizzes', 'readonly');
    const quizzesStore = tx.objectStore('quizzes');
    const count = await quizzesStore.count();

    // Si des quizzes existent déjà, ne rien faire
    if (count > 0) {
      console.log('Quizzes already initialized');
      return;
    }

    // Charger les quizzes
    const quizzesTx = db.transaction('quizzes', 'readwrite');
    const quizzesWriteStore = quizzesTx.objectStore('quizzes');
    for (const quiz of quizzesData) {
      await quizzesWriteStore.add(quiz);
    }
    await quizzesTx.done;

    console.log('Quizzes initialized successfully');
  } catch (error) {
    console.error('Error initializing quizzes:', error);
    throw error;
  }
};

/**
 * Initialise les utilisateurs dans la base de données
 * @returns {Promise<void>}
 */
export const initializeUsers = async () => {
  try {
    const db = await initDB();

    // Vérifier si des utilisateurs existent déjà
    const tx = db.transaction('users', 'readonly');
    const usersStore = tx.objectStore('users');
    const count = await usersStore.count();

    // Si des utilisateurs existent déjà, ne rien faire
    if (count > 0) {
      console.log('Users already initialized');
      return;
    }

    // Charger les utilisateurs
    const usersTx = db.transaction('users', 'readwrite');
    const usersWriteStore = usersTx.objectStore('users');
    for (const user of usersData) {
      await usersWriteStore.add(user);
    }
    await usersTx.done;

    console.log('Users initialized successfully');
  } catch (error) {
    console.error('Error initializing users:', error);
    throw error;
  }
};

export default {
  initDB,
  loadInitialData,
  calculateScore,
  registerUser,
  login,
  getQuizzes,
  getQuizById,
  submitQuiz,
  getSubmissionDetails,
  getUserSubmissions,
  getUserStats,
  getUserProfile,
  updateUserProfile,
  initializeQuizzes,
  initializeUsers
};
