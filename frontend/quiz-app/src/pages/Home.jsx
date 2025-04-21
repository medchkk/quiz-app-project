import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaLightbulb, FaQuestionCircle } from 'react-icons/fa'; // Icônes pour l’ampoule et les quiz
import api from '../utils/api';

const Home = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await api.get('/quizzes');
        setQuizzes(response.data);
      } catch (err) {
        setError('Erreur lors du chargement des quiz');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };
    fetchQuizzes();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleTopics = () => {
    alert('Page des catégories à venir !');
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-light)] p-6">
      <div className="max-w-4xl mx-auto pb-32"> {/* Ajout de padding-bottom pour les vagues */}
        {/* Barre de navigation (Profil et Déconnexion) */}
        <div className="flex justify-end mb-6 space-x-4">
          <Link
            to="/profile"
            className="button-nav"
          >
            Profil
          </Link>
          <button
            onClick={handleLogout}
            className="button-nav bg-red-500 hover:bg-red-600"
          >
            Déconnexion
          </button>
        </div>

        {/* Icône et titre */}
        <div className="text-center mb-8">
          <FaLightbulb className="text-[var(--button-cyan)] text-6xl mx-auto mb-3 animate-pulse" />
          <h2 className="text-4xl font-bold text-[var(--text-dark-blue)] mb-2">Quiz App</h2>
          <p className="text-secondary text-lg">
            Learn • Take Quiz • Repeat
          </p>
        </div>

        {/* Boutons principaux */}
        <div className="flex flex-col items-center mb-10 space-y-4">
          <button
            onClick={() => navigate('/')}
            className="button-primary w-48 transform hover:scale-105 transition-transform"
          >
            PLAY
          </button>
          <button
            onClick={handleTopics}
            className="button-secondary w-48 transform hover:scale-105 transition-transform"
          >
            TOPICS
          </button>
        </div>

        {/* Liste des quiz */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="space-y-6">
          {quizzes.map((quiz, index) => (
            <Link
              key={quiz._id}
              to={`/quiz/${quiz._id}`}
              className={`flex items-center p-4 rounded-lg shadow-md transition-all duration-500 transform hover:scale-105 hover:shadow-lg ${
                index % 2 === 0 ? 'bg-[var(--option-cyan)]' : 'bg-[var(--option-yellow)]'
              } animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <FaQuestionCircle className="text-[var(--text-dark-blue)] text-3xl mr-4" />
              <div>
                <h3 className="text-xl font-semibold text-[var(--text-dark-blue)]">{quiz.title}</h3>
                <p className="text-gray-800">{quiz.category}</p>
              </div>
            </Link>
          ))}
        </div>
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

export default Home;