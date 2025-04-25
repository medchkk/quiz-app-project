import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaQuestionCircle, FaFolder } from 'react-icons/fa';
import api from '../utils/api';
import ThemeToggle from '../components/ThemeToggle';

const Topics = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await api.get('/quizzes');
        setQuizzes(response.data);
        
        // Extraire les catégories uniques
        const uniqueCategories = [...new Set(response.data.map(quiz => quiz.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        setError('Erreur lors du chargement des quiz');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizzes();
  }, [navigate]);

  // Filtrer les quiz par catégorie sélectionnée
  const filteredQuizzes = selectedCategory 
    ? quizzes.filter(quiz => quiz.category === selectedCategory)
    : [];

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
          <FaFolder className="text-[var(--button-yellow)] text-6xl mx-auto mb-3" />
          <h2 className="text-4xl font-bold text-[var(--text-dark-blue)] mb-2">Catégories</h2>
          <p className="text-secondary text-lg">
            Choisissez une catégorie pour explorer les quiz
          </p>
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
            {/* Liste des catégories */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {categories.map((category, index) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`p-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                    selectedCategory === category 
                      ? 'bg-[var(--button-dark-blue)] text-white' 
                      : index % 2 === 0 
                        ? 'bg-[var(--option-cyan)]' 
                        : 'bg-[var(--option-yellow)]'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <FaFolder className="mr-2" />
                    <span className="font-semibold">{category}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Affichage des quiz de la catégorie sélectionnée */}
            {selectedCategory && (
              <div>
                <h3 className="text-2xl font-semibold text-[var(--text-dark-blue)] mb-4">
                  Quiz dans {selectedCategory}
                </h3>
                
                {filteredQuizzes.length === 0 ? (
                  <p className="text-center text-gray-600">Aucun quiz disponible dans cette catégorie</p>
                ) : (
                  <div className="space-y-4">
                    {filteredQuizzes.map((quiz) => (
                      <Link
                        key={quiz._id}
                        to={`/quiz/${quiz._id}`}
                        className="flex items-center p-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg bg-[var(--option-cyan)]"
                      >
                        <FaQuestionCircle className="text-[var(--text-dark-blue)] text-3xl mr-4" />
                        <div>
                          <h4 className="text-xl font-semibold text-[var(--text-dark-blue)]">{quiz.title}</h4>
                          <p className="text-gray-800">{quiz.questions?.length || 0} questions</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
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

export default Topics;
