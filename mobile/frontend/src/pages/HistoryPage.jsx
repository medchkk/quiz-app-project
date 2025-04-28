import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHistory, FaArrowLeft, FaCalendarAlt, FaTrophy, FaQuestionCircle } from 'react-icons/fa';
import api from '../utils/api';
import * as offlineLogic from '../utils/offlineLogic';
import ThemeToggle from '../components/ThemeToggle';

const HistoryPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);

        // Initialiser la base de données si ce n'est pas déjà fait
        await offlineLogic.initDB();

        // Récupérer l'ID de l'utilisateur depuis le localStorage
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('Utilisateur non connecté');
        }

        // Récupérer les soumissions de l'utilisateur depuis IndexedDB
        const submissionsData = await offlineLogic.getUserSubmissions(userId);
        setSubmissions(submissionsData);
      } catch (err) {
        console.error('Error fetching submissions data:', err);
        setError('Erreur lors du chargement de l\'historique: ' + err.message);

        if (err.message.includes('non connecté')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [navigate]);

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[var(--bg-light)] p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-[var(--text-dark-blue)]">Historique</h2>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[var(--bg-light)] p-6">
      <div className="max-w-4xl mx-auto pb-32">
        {/* Barre de navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/profile')}
            className="button-nav flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Retour au profil
          </button>
          <ThemeToggle />
        </div>

        {/* Titre avec icône d'historique */}
        <div className="text-center mb-8">
          <FaHistory className="text-[var(--button-cyan)] text-6xl mx-auto mb-3" />
          <h2 className="text-3xl font-bold text-[var(--text-dark-blue)]">Historique des quiz</h2>
          <p className="text-secondary mt-2">Consultez vos performances passées</p>
        </div>

        {/* Affichage des erreurs */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Historique des soumissions */}
        {submissions.length === 0 ? (
          <div className="text-center p-8 bg-[var(--card-bg)] rounded-lg shadow-md">
            <FaQuestionCircle className="text-[var(--text-medium-blue)] text-5xl mx-auto mb-4" />
            <p className="text-gray-600 text-xl">Aucune soumission pour le moment.</p>
            <p className="text-gray-500 mt-2">Jouez à quelques quiz pour voir votre historique ici !</p>
            <button
              onClick={() => navigate('/play')}
              className="button-primary mt-6"
            >
              Jouer maintenant
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission, index) => (
              <div
                key={submission._id}
                className={`p-5 rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-102 ${
                  index % 2 === 0 ? 'bg-[var(--option-yellow)]' : 'bg-[var(--option-cyan)]'
                }`}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--text-dark-blue)] mb-2">
                      {submission.quizTitle}
                    </h3>
                    <p className="text-gray-800 flex items-center mb-1">
                      <FaQuestionCircle className="mr-2" /> Catégorie: {submission.category}
                    </p>
                    <p className="text-gray-800 flex items-center mb-1">
                      <FaCalendarAlt className="mr-2" /> {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-3 md:mt-0">
                    <div className="flex items-center justify-center md:justify-end">
                      <FaTrophy className="text-2xl mr-2 text-[var(--text-dark-blue)]" />
                      <span className="text-2xl font-bold text-[var(--text-dark-blue)]">
                        {submission.score} pts
                      </span>
                    </div>
                    <Link
                      to={`/submission/${submission._id}`}
                      className="button-nav mt-2 block text-center"
                    >
                      Voir les détails
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vagues décoratives */}
      <div className="wave-container" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: -1 }}>
        <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{ height: '60px' }}>
          <path
            className="wave-cyan"
            d="M-0.00,49.92 C150.00,150.00 271.49,-49.92 500.00,49.92 L500.00,150.00 L-0.00,150.00 Z"
          />
        </svg>
      </div>
      <div className="wave-container" style={{ position: 'fixed', bottom: '20px', left: 0, right: 0, zIndex: -2 }}>
        <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{ height: '60px' }}>
          <path
            className="wave-yellow"
            d="M-0.00,49.92 C150.00,150.00 271.49,-49.92 500.00,49.92 L500.00,150.00 L-0.00,150.00 Z"
          />
        </svg>
      </div>
      <div className="wave-container" style={{ position: 'fixed', bottom: '40px', left: 0, right: 0, zIndex: -3 }}>
        <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{ height: '60px' }}>
          <path
            className="wave-pink"
            d="M-0.00,49.92 C150.00,150.00 271.49,-49.92 500.00,49.92 L500.00,150.00 L-0.00,150.00 Z"
          />
        </svg>
      </div>
    </div>
  );
};

export default HistoryPage;
