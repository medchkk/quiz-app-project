import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaQuestionCircle, FaArrowLeft, FaArrowRight } from 'react-icons/fa'; // Icônes pour le quiz et les boutons
import api from '../utils/api';
import ThemeToggle from '../components/ThemeToggle';
import QuizTimer from '../components/QuizTimer';


function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // État pour gérer la soumission
  const [timerActive, setTimerActive] = useState(false); // Contrôle l'activation du timer

  // Référence pour suivre si une soumission est en cours
  const isSubmittingRef = useRef(false);

  // Définir handleSubmit avant handleTimeExpired
  const handleSubmit = useCallback(async () => {
    // Éviter les soumissions multiples en utilisant une référence
    if (submitting || isSubmittingRef.current) return;

    // Marquer comme en cours de soumission
    isSubmittingRef.current = true;
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

      // Message d'erreur plus explicite
      if (err.response?.status === 500) {
        setError(
          'Erreur serveur (500) lors de la soumission du quiz. ' +
          'Cela peut être dû à un problème temporaire. ' +
          'Vous allez être redirigé vers la page d\'accueil dans quelques secondes...'
        );

        // Rediriger vers la page d'accueil après un délai
        setTimeout(() => {
          navigate('/');
        }, 5000);
      } else {
        setError('Erreur lors de la soumission du quiz: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  }, [id, answers, navigate, submitting]);

  // Référence pour suivre si handleTimeExpired est en cours d'exécution
  const isHandlingExpiredRef = useRef(false);

  // Fonction appelée lorsque le timer expire
  const handleTimeExpired = useCallback(() => {
    // Éviter les appels multiples
    if (isHandlingExpiredRef.current) return;
    isHandlingExpiredRef.current = true;

    console.log('Timer expired!');

    // Désactiver le timer pour éviter les appels multiples
    setTimerActive(false);

    // Marquer la réponse comme incorrecte si non répondue
    setAnswers(prevAnswers => {
      const newAnswers = [...prevAnswers];
      if (newAnswers[currentQuestionIndex] === null || newAnswers[currentQuestionIndex] === undefined) {
        newAnswers[currentQuestionIndex] = null;
      }
      return newAnswers;
    });

    // Utiliser setTimeout pour éviter les problèmes de rendu React
    setTimeout(() => {
      // Passer à la question suivante ou soumettre le quiz
      if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
        // Passer à la question suivante
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else if (quiz) {
        // C'est la dernière question, soumettre le quiz
        handleSubmit();
      }

      // Réinitialiser le flag après un court délai
      setTimeout(() => {
        isHandlingExpiredRef.current = false;
      }, 500);
    }, 0);
  }, [currentQuestionIndex, quiz, handleSubmit]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/quizzes/${id}`);
        setQuiz(response.data);
        setAnswers(new Array(response.data.questions.length).fill(null));
        // Activer le timer après le chargement du quiz
        setTimerActive(true);
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

    // Désactiver le timer lors du démontage du composant
    return () => setTimerActive(false);
  }, [id, navigate]);

  // Effet pour réactiver le timer lorsque la question change
  useEffect(() => {
    if (quiz) {
      console.log(`Question changed to ${currentQuestionIndex + 1}`);
      // Réactiver le timer pour la nouvelle question
      setTimerActive(true);
    }
  }, [currentQuestionIndex, quiz]);

  const handleAnswerSelect = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      // Désactiver temporairement le timer
      setTimerActive(false);

      // Passer à la question suivante
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Le timer sera réactivé par l'effet useEffect
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      // Désactiver temporairement le timer
      setTimerActive(false);

      // Passer à la question précédente
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Le timer sera réactivé par l'effet useEffect
    }
  };



  const handleExit = () => {
    // Désactiver le timer avant de quitter
    setTimerActive(false);
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
        {/* Barre de navigation */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleExit}
              className="button-nav flex items-center"
            >
              <FaArrowLeft className="mr-2" /> Exit
            </button>
            <ThemeToggle />
          </div>
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
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
              Question {currentQuestionIndex + 1}/{quiz.questions.length}
            </h2>
            <QuizTimer
              onTimeExpired={handleTimeExpired}
              isActive={timerActive}
            />
          </div>
          <p className="text-lg mt-2 text-white">{currentQuestion.text}</p>
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="font-bold">Erreur:</p>
              <p>{error}</p>
            </div>
          )}

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