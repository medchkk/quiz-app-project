import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AdminNav from '../../components/AdminNav';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const QuizForm = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const isEditMode = quizId !== 'new';

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    difficulty: 'intermédiaire',
    description: '',
    imageUrl: '',
    isPublished: true,
    questions: []
  });

  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Catégories disponibles
  const categories = [
    'Histoire', 'Sciences', 'Géographie', 'Culture', 'Sport',
    'Musique', 'Cinéma', 'Littérature', 'Technologie', 'Autre'
  ];

  // Niveaux de difficulté
  const difficultyLevels = ['débutant', 'intermédiaire', 'expert'];

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!isEditMode) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Vous devez être connecté pour accéder à cette page');
          setLoading(false);
          return;
        }

        // Utilisons la route admin correcte maintenant qu'elle est implémentée
        const response = await axios.get(`${API_URL}/admin/quizzes/${quizId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setFormData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quiz:', error);

        // Affichons plus d'informations sur l'erreur pour le débogage
        const errorDetails = {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method,
          message: error.message
        };
        console.log('Error details:', errorDetails);

        // Vérifions si le serveur est en cours d'exécution
        try {
          const serverCheck = await axios.get(`${API_URL}`);
          console.log('Server is running:', serverCheck.status);
        } catch (serverError) {
          console.error('Server might be down:', serverError.message);
        }

        if (error.response && error.response.status === 404) {
          // Si le quiz n'existe pas, rediriger vers la page de création
          setError(`Le quiz avec l'ID ${quizId} n'existe pas ou a été supprimé. URL: ${error.config?.url}`);
          setTimeout(() => {
            navigate('/admin/quizzes/new');
          }, 5000);
        } else {
          setError(error.response?.data?.message || `Une erreur est survenue lors du chargement du quiz: ${error.message}`);
        }
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...formData.questions];
    const options = [...updatedQuestions[questionIndex].options];
    options[optionIndex] = value;
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options
    };
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const handleCorrectAnswerChange = (questionIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      correctAnswer: parseInt(value, 10)
    };
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          text: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          explanation: '',
          imageUrl: ''
        }
      ]
    });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions.splice(index, 1);
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options.push('');
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...formData.questions];
    const options = [...updatedQuestions[questionIndex].options];

    // Ajuster correctAnswer si nécessaire
    if (updatedQuestions[questionIndex].correctAnswer === optionIndex) {
      updatedQuestions[questionIndex].correctAnswer = 0;
    } else if (updatedQuestions[questionIndex].correctAnswer > optionIndex) {
      updatedQuestions[questionIndex].correctAnswer -= 1;
    }

    options.splice(optionIndex, 1);
    updatedQuestions[questionIndex].options = options;

    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');

      if (!token) {
        setError('Vous devez être connecté pour effectuer cette action');
        setLoading(false);
        return;
      }

      // Validation
      if (!formData.title.trim()) {
        setError('Le titre du quiz est requis');
        setLoading(false);
        return;
      }

      if (!formData.category.trim()) {
        setError('La catégorie du quiz est requise');
        setLoading(false);
        return;
      }

      if (formData.questions.length === 0) {
        setError('Le quiz doit contenir au moins une question');
        setLoading(false);
        return;
      }

      // Valider chaque question
      for (let i = 0; i < formData.questions.length; i++) {
        const question = formData.questions[i];

        if (!question.text.trim()) {
          setError(`La question ${i + 1} doit avoir un texte`);
          setLoading(false);
          return;
        }

        if (question.options.length < 2) {
          setError(`La question ${i + 1} doit avoir au moins 2 options`);
          setLoading(false);
          return;
        }

        for (let j = 0; j < question.options.length; j++) {
          if (!question.options[j].trim()) {
            setError(`L'option ${j + 1} de la question ${i + 1} ne peut pas être vide`);
            setLoading(false);
            return;
          }
        }

        if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
          setError(`La réponse correcte de la question ${i + 1} est invalide`);
          setLoading(false);
          return;
        }
      }

      // Envoyer les données
      if (isEditMode) {
        // Utilisons la route admin correcte
        await axios.put(`${API_URL}/admin/quizzes/${quizId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setSuccess('Quiz mis à jour avec succès');

        // Faire défiler la page vers le haut pour voir le message de succès
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Masquer le message après 5 secondes
        setTimeout(() => {
          setSuccess('');
        }, 5000);
      } else {
        // Utilisons la route admin correcte
        await axios.post(`${API_URL}/admin/quizzes`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setSuccess('Quiz créé avec succès');

        // Rediriger vers la liste des quiz après un court délai
        setTimeout(() => {
          navigate('/admin/quizzes');
        }, 2000);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error saving quiz:', error);
      setError(error.response?.data?.message || 'Une erreur est survenue lors de l\'enregistrement du quiz');
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[var(--bg-light)]">
        <div className="spinner"></div>
      </div>
    );
  }

  // Si nous sommes en mode édition mais qu'il y a une erreur 404, afficher un message plus convivial
  if (isEditMode && error && error.includes("n'existe pas")) {
    return (
      <div className="min-h-screen bg-[var(--bg-light)] flex flex-col md:flex-row">
        <AdminNav />
        <div className="flex-1 p-6 md:overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-[var(--button-dark-blue)]">
                Quiz non trouvé
              </h1>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => navigate('/admin/quizzes')}
                  className="bg-[var(--button-dark-blue)] hover:opacity-90 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Retour à la liste
                </button>
              </div>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="font-medium">{error}</p>
              </div>
            </div>

            <p className="text-[var(--text-medium-blue)] mb-4">Vous allez être redirigé vers la page de création de quiz...</p>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => navigate('/admin/quizzes/new')}
                className="bg-[var(--button-cyan)] hover:opacity-90 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Créer un nouveau quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-light)] flex flex-col md:flex-row">
      <AdminNav />
      <div className="flex-1 p-6 md:overflow-y-auto">
        {/* Styles pour les animations */}
        <style>{`
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 sm:gap-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--button-dark-blue)]">
              {isEditMode ? 'Modifier le quiz' : 'Créer un quiz'}
            </h1>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => navigate('/admin/quizzes')}
                className="bg-[var(--button-dark-blue)] hover:opacity-90 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Retour
              </button>
            </div>
          </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="fixed top-20 left-0 right-0 z-50 mx-auto max-w-md" style={{ animation: 'fadeInDown 0.5s ease-out' }}>
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md shadow-lg mx-4" role="alert">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium">{success}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    type="button"
                    onClick={() => setSuccess('')}
                    className="inline-flex bg-green-100 rounded-md p-1.5 text-green-500 hover:bg-green-200 focus:outline-none"
                  >
                    <span className="sr-only">Fermer</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {/* Informations générales */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--button-dark-blue)] mb-4 pb-2">Informations générales</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-[var(--text-dark-blue)] mb-1">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--button-cyan)] bg-white text-[var(--text-dark-blue)]"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-[var(--text-dark-blue)] mb-1">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--button-cyan)] bg-white text-[var(--text-dark-blue)]"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-[var(--text-dark-blue)] mb-1">
                  Difficulté
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--button-cyan)] bg-white text-[var(--text-dark-blue)]"
                >
                  {difficultyLevels.map((level) => (
                    <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-[var(--text-dark-blue)] mb-1">
                  URL de l'image
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--button-cyan)] bg-white text-[var(--text-dark-blue)]"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-[var(--text-dark-blue)] mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--button-cyan)] bg-white text-[var(--text-dark-blue)]"
                  placeholder="Description du quiz..."
                ></textarea>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-[var(--button-cyan)] focus:ring-[var(--button-cyan)] border-gray-300 rounded"
                />
                <label htmlFor="isPublished" className="ml-2 block text-sm font-medium text-[var(--button-dark-blue)]">
                  Publier ce quiz
                </label>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-0">
              <h2 className="text-xl font-semibold text-[var(--button-dark-blue)] pb-2">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="bg-[var(--button-cyan)] hover:opacity-90 text-white font-medium py-2 px-4 rounded-md transition-colors w-full sm:w-auto"
              >
                Ajouter une question
              </button>
            </div>

            {formData.questions.length === 0 ? (
              <div className="text-center py-8 bg-[var(--button-dark-blue)] bg-opacity-5 rounded-md">
                <p className="text-[var(--text-medium-blue)]">Aucune question ajoutée. Cliquez sur "Ajouter une question" pour commencer.</p>
              </div>
            ) : (
              formData.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="mb-8 p-4 sm:p-6 border border-[var(--border-color)] rounded-md bg-[var(--button-dark-blue)] text-white">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
                    <h3 className="text-lg font-medium text-white">Question {questionIndex + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeQuestion(questionIndex)}
                      className="text-white bg-red-500 hover:opacity-80 transition-colors px-3 py-1 rounded-md w-full sm:w-auto"
                    >
                      Supprimer
                    </button>
                  </div>

                  <div className="mb-4">
                    <label htmlFor={`question-${questionIndex}`} className="block text-sm font-medium mb-1 text-white">
                      Texte de la question <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id={`question-${questionIndex}`}
                      value={question.text}
                      onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--button-cyan)] bg-white text-[var(--text-dark-blue)]"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor={`question-image-${questionIndex}`} className="block text-sm font-medium mb-1 text-white">
                      URL de l'image (optionnel)
                    </label>
                    <input
                      type="text"
                      id={`question-image-${questionIndex}`}
                      value={question.imageUrl || ''}
                      onChange={(e) => handleQuestionChange(questionIndex, 'imageUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--button-cyan)] bg-white text-[var(--text-dark-blue)]"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="mb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2 sm:gap-0">
                      <label className="block text-sm font-medium text-white">
                        Options <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => addOption(questionIndex)}
                        className="text-sm text-white bg-[var(--button-cyan)] hover:opacity-90 transition-colors flex items-center justify-center px-3 py-1 rounded-md w-full sm:w-auto"
                      >
                        <span className="text-white text-xl mr-1">+</span>
                        Ajouter une option
                      </button>
                    </div>

                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex flex-wrap items-center mb-2 gap-2">
                        <div className="flex items-center min-w-[40px]">
                          <input
                            type="radio"
                            id={`correct-${questionIndex}-${optionIndex}`}
                            name={`correct-${questionIndex}`}
                            checked={question.correctAnswer === optionIndex}
                            onChange={() => handleCorrectAnswerChange(questionIndex, optionIndex)}
                            className="h-4 w-4 text-[var(--button-cyan)] focus:ring-[var(--button-cyan)] border-white"
                          />
                          <label htmlFor={`correct-${questionIndex}-${optionIndex}`} className="ml-1 text-xs text-white">
                            {optionIndex + 1}
                          </label>
                        </div>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--button-cyan)] bg-white text-[var(--text-dark-blue)]"
                          placeholder={`Option ${optionIndex + 1}`}
                          required
                        />
                        {question.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(questionIndex, optionIndex)}
                            className="text-white bg-red-500 hover:opacity-80 transition-colors font-bold px-2 py-1 rounded-md"
                            aria-label="Supprimer cette option"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <p className="text-xs text-white mt-1">Sélectionnez le bouton radio à côté de la réponse correcte.</p>
                  </div>

                  <div>
                    <label htmlFor={`explanation-${questionIndex}`} className="block text-sm font-medium mb-1 text-white">
                      Explication de la réponse correcte...
                    </label>
                    <textarea
                      id={`explanation-${questionIndex}`}
                      value={question.explanation || ''}
                      onChange={(e) => handleQuestionChange(questionIndex, 'explanation', e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--button-cyan)] bg-white text-[var(--text-dark-blue)]"
                      placeholder="Explication de la réponse correcte..."
                    ></textarea>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0">
            <Link
              to="/admin/quizzes"
              className="bg-[var(--button-dark-blue)] hover:opacity-90 text-white font-medium py-2 px-4 rounded-md transition-colors text-center sm:text-left"
            >
              Annuler
            </Link>
            <div className="flex flex-col sm:flex-row gap-2">
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => window.open(`/quiz/${quizId}`, '_blank')}
                  className="bg-[var(--button-medium-blue)] hover:opacity-90 text-white font-medium py-2 px-4 rounded-md transition-colors order-2 sm:order-1"
                >
                  Prévisualiser
                </button>
              )}
              <button
                type="submit"
                className="bg-[var(--button-cyan)] hover:opacity-90 text-white font-medium py-2 px-4 rounded-md transition-colors order-1 sm:order-2"
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : isEditMode ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default QuizForm;
