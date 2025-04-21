import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaQuestionCircle, FaArrowLeft, FaArrowRight } from 'react-icons/fa'; // Icônes pour le quiz et les boutons
import api from '../utils/api';

function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // État pour gérer la soumission

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/quizzes/${id}`);
        setQuiz(response.data);
        setAnswers(new Array(response.data.questions.length).fill(null));
      } catch (err) {
        console.error('Error fetching quiz:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else if (err.response?.status === 404) {
          setError('Quiz non trouvé');
        } else {
          setError(err.response?.data?.message || 'Erreur lors du chargement du quiz');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id, navigate]);

  const handleAnswerSelect = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      console.log('Submitting quiz with ID:', id, 'answers:', answers);
      const response = await api.post(`/quizzes/${id}/submit`, { answers });
      console.log('Submission response:', response.data);
      const submissionId = response.data.submissionId;
      if (!submissionId) {
        throw new Error('submissionId not found in response');
      }
      console.log('Navigating to submission:', submissionId);
      navigate(`/submission/${submissionId}`);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Erreur lors de la soumission du quiz: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExit = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[var(--bg-light)] p-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">Chargement...</h2>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-[var(--bg-light)] p-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6 text-[var(--text-dark-blue)]">Erreur</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => navigate('/')} className="button-nav">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="relative min-h-screen bg-[var(--bg-light)] p-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6 text-[var(--text-dark-blue)]">Aucun quiz disponible</h2>
          <button onClick={() => navigate('/')} className="button-nav">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="relative min-h-screen bg-[var(--text-dark-blue)] p-6">
      <div className="max-w-2xl mx-auto pb-32 text-center"> {/* Padding-bottom pour les vagues */}
        {/* Boutons Exit et Next/Soumettre */}
        <div className="flex justify-between mb-6">
          <button
            onClick={handleExit}
            className="button-nav flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Exit
          </button>
          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="button-nav flex items-center"
              disabled={submitting}
            >
              {submitting ? <div className="spinner" /> : 'Soumettre'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="button-nav flex items-center"
              disabled={currentQuestionIndex === quiz.questions.length - 1}
            >
              Suivant <FaArrowRight className="ml-2" />
            </button>
          )}
        </div>

        {/* Titre du quiz */}
        <h1 className="text-2xl font-bold text-white mb-4 flex items-center justify-center">
          <FaQuestionCircle className="w-6 h-6 mr-2" />
          {quiz.title}
        </h1>

        {/* Question */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">
            Question {currentQuestionIndex + 1}/{quiz.questions.length}
          </h2>
          <p className="text-lg mt-2 text-white">{currentQuestion.text}</p>
          {error && <p className="text-red-500 mt-4">{error}</p>}

          {/* Options */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`${
                  answers[currentQuestionIndex] === index ? 'ring-4 ring-white' : ''
                } ${
                  index % 2 === 0 ? 'option-yellow' : 'option-cyan'
                } text-center text-xl font-semibold transition-transform`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Bouton Précédent */}
        {currentQuestionIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="button-nav mt-4 flex items-center mx-auto"
          >
            <FaArrowLeft className="mr-2" /> Précédent
          </button>
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
}

export default Quiz;