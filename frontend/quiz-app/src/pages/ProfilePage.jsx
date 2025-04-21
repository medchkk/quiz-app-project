import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaChartBar, FaHistory, FaArrowLeft } from 'react-icons/fa'; // Icônes pour le profil, stats, historique et retour
import api from '../utils/api';

const ProfilePage = () => {
  const [stats, setStats] = useState({ totalScore: 0, totalQuizzesCompleted: 0 });
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // État pour gérer le chargement
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('Fetching user stats...');
        const statsResponse = await api.get('/users/stats');
        console.log('Stats response:', statsResponse.data);
        setStats(statsResponse.data);

        console.log('Fetching user submissions...');
        const submissionsResponse = await api.get('/users/submissions');
        console.log('Submissions response:', submissionsResponse.data);
        setSubmissions(submissionsResponse.data);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        if (err.response?.status === 401) {
          console.log('Unauthorized, redirecting to login...');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Erreur lors du chargement des données du profil');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  console.log('Rendering ProfilePage, error:', error, 'stats:', stats, 'submissions:', submissions);

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[var(--bg-light)] p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-[var(--text-dark-blue)]">Profil</h2>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-[var(--bg-light)] p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-[var(--text-dark-blue)]">Profil</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="button-nav"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[var(--bg-light)] p-6">
      <div className="max-w-4xl mx-auto pb-32"> {/* Padding-bottom pour les vagues */}
        {/* Bouton Retour à l'accueil */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => navigate('/')}
            className="button-nav flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Retour à l'accueil
          </button>
        </div>

        {/* Titre avec icône de profil */}
        <div className="text-center mb-8">
          <FaUserCircle className="text-[var(--button-cyan)] text-6xl mx-auto mb-3" />
          <h2 className="text-3xl font-bold text-[var(--text-dark-blue)]">Profil</h2>
        </div>

        {/* Statistiques */}
        <h3 className="text-xl font-semibold text-[var(--text-dark-blue)] mb-4 flex items-center">
          <FaChartBar className="mr-2" /> Statistiques
        </h3>
        <div className="bg-[var(--option-cyan)] p-4 rounded-lg shadow-md mb-6">
          <p className="text-gray-800">Score total : {stats.totalScore}</p>
          <p className="text-gray-800">Quiz complétés : {stats.totalQuizzesCompleted}</p>
        </div>

        {/* Historique des soumissions */}
        <h3 className="text-xl font-semibold text-[var(--text-dark-blue)] mb-4 flex items-center">
          <FaHistory className="mr-2" /> Historique des soumissions
        </h3>
        {submissions.length === 0 ? (
          <p className="text-gray-600 text-center">Aucune soumission pour le moment.</p>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission, index) => (
              <div
                key={submission.submissionId}
                className={`p-4 rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105 ${
                  index % 2 === 0 ? 'bg-[var(--option-yellow)]' : 'bg-[var(--option-cyan)]'
                }`}
              >
                <p className="text-gray-800">
                  Quiz : {submission.quizTitle} ({submission.category})
                </p>
                <p className="text-gray-800">Score : {submission.score}</p>
                <p className="text-gray-800">
                  Date : {new Date(submission.submittedAt).toLocaleString()}
                </p>
                <Link
                  to={`/submission/${submission.submissionId}`}
                  className="text-[var(--text-medium-blue)] hover:underline"
                >
                  Voir les détails
                </Link>
              </div>
            ))}
          </div>
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

export default ProfilePage;