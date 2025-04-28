import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaQuestionCircle, FaRandom, FaStar, FaFire } from 'react-icons/fa';
import api from '../utils/api';
import * as offlineLogic from '../utils/offlineLogic';
import ThemeToggle from '../components/ThemeToggle';

const PlayQuiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);

        // Initialiser la base de données si ce n'est pas déjà fait
        await offlineLogic.initDB();

        // Récupérer les quiz depuis IndexedDB
        const quizzesData = await offlineLogic.getQuizzes();
        setQuizzes(quizzesData);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError('Erreur lors du chargement des quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [navigate]);

  // Fonction pour démarrer un quiz aléatoire
  const handleRandomQuiz = () => {
    if (quizzes.length === 0) {
      setError('Aucun quiz disponible pour le moment');
      return;
    }

    // Sélectionner un quiz aléatoire
    const randomIndex = Math.floor(Math.random() * quizzes.length);
    const randomQuiz = quizzes[randomIndex];

    // Rediriger vers le quiz sélectionné
    navigate(`/quiz/${randomQuiz._id}`);
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-light)] p-6">
      <div className="max-w-4xl mx-auto pb-32">
        {/* Barre de navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="button-nav flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Retour
          </button>
          <ThemeToggle />
        </div>

        {/* Titre */}
        <div className="text-center mb-8">
          <FaQuestionCircle className="text-[var(--button-cyan)] text-6xl mx-auto mb-3" />
          <h2 className="text-4xl font-bold text-[var(--text-dark-blue)] mb-2">Jouer</h2>
          <p className="text-secondary text-lg">
            Choisissez un quiz ou lancez-en un aléatoirement
          </p>
        </div>

        {/* Bouton Quiz Aléatoire */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleRandomQuiz}
            className="button-primary flex items-center justify-center px-6 py-3 transform hover:scale-105 transition-transform"
            disabled={loading || quizzes.length === 0}
          >
            <FaRandom className="mr-2" />
            Quiz Aléatoire
          </button>
        </div>

        {/* Affichage des erreurs */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Affichage du chargement */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-10 h-10 border-4 border-[var(--button-cyan)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Quiz Recommandés */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <FaStar className="text-[var(--button-yellow)] text-xl mr-2" />
                <h3 className="text-2xl font-semibold text-[var(--text-dark-blue)]">Recommandés</h3>
              </div>

              {quizzes.length === 0 ? (
                <p className="text-center text-gray-600">Aucun quiz disponible pour le moment</p>
              ) : (
                <div className="space-y-4">
                  {quizzes.slice(0, 3).map((quiz) => (
                    <Link
                      key={quiz._id}
                      to={`/quiz/${quiz._id}`}
                      className="flex items-center p-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg bg-[var(--option-cyan)]"
                    >
                      <FaQuestionCircle className="text-[var(--text-dark-blue)] text-3xl mr-4" />
                      <div>
                        <h4 className="text-xl font-semibold text-[var(--text-dark-blue)]">{quiz.title}</h4>
                        <p className="text-gray-800">{quiz.category} • {quiz.questions?.length || 0} questions</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quiz Populaires */}
            <div>
              <div className="flex items-center mb-4">
                <FaFire className="text-[var(--button-pink)] text-xl mr-2" />
                <h3 className="text-2xl font-semibold text-[var(--text-dark-blue)]">Populaires</h3>
              </div>

              {quizzes.length === 0 ? (
                <p className="text-center text-gray-600">Aucun quiz disponible pour le moment</p>
              ) : (
                <div className="space-y-4">
                  {quizzes.slice(0, 3).reverse().map((quiz) => (
                    <Link
                      key={quiz._id}
                      to={`/quiz/${quiz._id}`}
                      className="flex items-center p-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg bg-[var(--option-yellow)]"
                    >
                      <FaQuestionCircle className="text-[var(--text-dark-blue)] text-3xl mr-4" />
                      <div>
                        <h4 className="text-xl font-semibold text-[var(--text-dark-blue)]">{quiz.title}</h4>
                        <p className="text-gray-800">{quiz.category} • {quiz.questions?.length || 0} questions</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Vagues décoratives */}
      <div className="wave-container">
        <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{ height: '80px' }}>
          <path
            className="wave-cyan"
            d="M-0.00,49.92 C150.00,150.00 271.49,-49.92 500.00,49.92 L500.00,150.00 L-0.00,150.00 Z"
          />
        </svg>
      </div>
      <div className="wave-container" style={{ bottom: '25px' }}>
        <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{ height: '80px' }}>
          <path
            className="wave-yellow"
            d="M-0.00,49.92 C150.00,150.00 271.49,-49.92 500.00,49.92 L500.00,150.00 L-0.00,150.00 Z"
          />
        </svg>
      </div>
      <div className="wave-container" style={{ bottom: '50px' }}>
        <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{ height: '80px' }}>
          <path
            className="wave-pink"
            d="M-0.00,49.92 C150.00,150.00 271.49,-49.92 500.00,49.92 L500.00,150.00 L-0.00,150.00 Z"
          />
        </svg>
      </div>
    </div>
  );
};

export default PlayQuiz;
