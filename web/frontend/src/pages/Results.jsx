import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTrophy } from 'react-icons/fa'; // Icône de trophée
import api from '../utils/api';
import ThemeToggle from '../components/ThemeToggle';


const Results = () => {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        console.log('Fetching submission with ID:', submissionId);
        const response = await api.get(`/quizzes/submission/${submissionId}`);
        console.log('Submission response:', response.data);
        setSubmission(response.data);
      } catch (err) {
        console.error('Error fetching submission:', err);
        setError('Erreur lors du chargement des détails de la soumission');
        if (err.response?.status === 401) {
          console.log('Unauthorized, redirecting to login...');
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };
    if (submissionId) {
      fetchSubmission();
    } else {
      console.error('No submissionId provided');
      setError('ID de soumission manquant');
    }
  }, [submissionId, navigate]);

  console.log('Rendering Results, submission:', submission, 'error:', error);

  if (error && !submission) {
    return (
      <div className="relative min-h-screen bg-[var(--bg-light)] p-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          <h2 className="text-2xl font-bold mb-6 text-[var(--text-dark-blue)]">Résultat de la soumission</h2>
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

  if (!submission) {
    return (
      <div className="relative min-h-screen bg-[var(--bg-light)] p-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          <h2 className="text-2xl font-bold mb-6 text-[var(--text-dark-blue)]">Résultat de la soumission</h2>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[var(--bg-light)] p-6">
      <div className="max-w-2xl mx-auto text-center pb-32"> {/* Padding-bottom pour les vagues */}
        {/* Barre de navigation */}
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        {/* Icône de trophée */}
        <FaTrophy className="text-[var(--option-yellow)] text-6xl mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2 text-[var(--text-dark-blue)]">Congratulations</h2>
        <p className="text-secondary text-lg mb-2">Your Score</p>
        <p className="text-4xl font-bold text-[var(--text-dark-blue)] mb-4">
          {submission.score} / {submission.total}
        </p>
        <p className="text-secondary text-lg mb-6">
          You did a great job, Learn more by taking another quiz
        </p>

        {/* Détails des réponses */}
        {submission.results && submission.results.length > 0 ? (
          submission.results.map((result, index) => (
            <div key={index} className="bg-[var(--card-bg)] p-4 rounded-lg shadow-md mb-4">
              <p className="text-lg font-semibold text-[var(--text-dark-blue)]">{result.question}</p>
              <p className="text-gray-600">Votre réponse : {result.selectedAnswer}</p>
              <p className="text-gray-600">Réponse correcte : {result.correctAnswer}</p>
              <p className={result.isCorrect ? 'text-green-500' : 'text-red-500'}>
                {result.isCorrect ? 'Correct' : 'Incorrect'}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-600">Aucun détail disponible pour cette soumission.</p>
        )}

        {/* Bouton Back to Home */}
        <button
          onClick={() => navigate('/')}
          className="button-nav mt-6"
        >
          Back to Home
        </button>
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

export default Results;