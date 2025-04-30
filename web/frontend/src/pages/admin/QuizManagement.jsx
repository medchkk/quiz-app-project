import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminNav from '../../components/AdminNav';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [quizzesPerPage] = useState(10);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Vous devez être connecté pour accéder à cette page');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/admin/quizzes`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setQuizzes(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        setError(error.response?.data?.message || 'Une erreur est survenue lors du chargement des quiz');
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleDeleteQuiz = async (quizId) => {
    try {
      const token = localStorage.getItem('token');

      await axios.delete(`${API_URL}/admin/quizzes/${quizId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Mettre à jour la liste des quiz
      setQuizzes(quizzes.filter(quiz => quiz._id !== quizId));
      setDeleteConfirmation(null);

      // Afficher un message de succès
      setSuccessMessage('Le quiz a été supprimé avec succès.');

      // Masquer le message après 5 secondes
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error deleting quiz:', error);
      setError(error.response?.data?.message || 'Une erreur est survenue lors de la suppression du quiz');
    }
  };

  // Filtrer les quiz en fonction du terme de recherche
  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastQuiz = currentPage * quizzesPerPage;
  const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;
  const currentQuizzes = filteredQuizzes.slice(indexOfFirstQuiz, indexOfLastQuiz);
  const totalPages = Math.ceil(filteredQuizzes.length / quizzesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[var(--bg-light)]">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[var(--bg-light)]">
        <div className="bg-[var(--card-bg)] p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-[var(--wave-pink)] mb-4">Erreur</h2>
          <p className="text-[var(--text-color)] mb-4">{error}</p>
          <Link to="/admin" className="block text-center bg-[var(--button-cyan)] hover:bg-[var(--button-medium-blue)] text-white font-bold py-2 px-4 rounded">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-[var(--bg-light)] flex flex-col md:flex-row">
      <AdminNav />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-[var(--button-dark-blue)] text-white p-6 rounded-lg shadow-md">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold">Gestion des Quiz</h1>
              <p className="text-gray-200 mt-1 text-sm md:text-base">Créez et gérez les quiz de votre application</p>

              {/* Statistiques mobiles */}
              <div className="flex mt-3 space-x-4 md:hidden">
                <div className="bg-[var(--button-cyan)] px-3 py-1 rounded-md shadow-sm flex items-center text-xs">
                  <span className="font-bold">{quizzes.length}</span>
                  <span className="ml-1">quiz</span>
                </div>
                <div className="bg-[var(--button-medium-blue)] px-3 py-1 rounded-md shadow-sm flex items-center text-xs">
                  <span className="font-bold">{quizzes.filter(q => q.isPublished).length}</span>
                  <span className="ml-1">publiés</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
              {/* Statistiques desktop */}
              <div className="hidden md:flex items-center space-x-3 text-sm">
                <div className="bg-[var(--button-cyan)] px-4 py-2 rounded-md shadow-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold text-base">{quizzes.length}</span>
                  <span className="ml-1">quiz</span>
                </div>
                <div className="bg-[var(--button-medium-blue)] px-4 py-2 rounded-md shadow-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  <span className="font-bold text-base">{quizzes.filter(q => q.isPublished).length}</span>
                  <span className="ml-1">publiés</span>
                </div>
              </div>

              <Link to="/admin/quizzes/new" className="bg-[var(--wave-pink)] hover:opacity-90 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center text-sm md:text-base">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span className="whitespace-nowrap">Créer un quiz</span>
              </Link>
            </div>
          </div>

        {/* Message de succès */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md shadow-sm" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  {successMessage}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    type="button"
                    onClick={() => setSuccessMessage('')}
                    className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Rechercher par titre ou catégorie..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Réinitialiser à la première page lors d'une nouvelle recherche
              }}
              className="pl-10 pr-10 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[var(--button-cyan)] focus:border-[var(--button-cyan)] bg-white text-gray-700 shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          {filteredQuizzes.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'quiz trouvé' : 'quiz trouvés'}
            </p>
          )}
        </div>

        {/* Liste des quiz */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          {/* En-tête du tableau - visible uniquement sur desktop */}
          <div className="bg-[var(--button-dark-blue)] text-white py-3 px-6 hidden md:block">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-3">Titre</div>
              <div className="col-span-2">Catégorie</div>
              <div className="col-span-2 text-center">Difficulté</div>
              <div className="col-span-1 text-center">Questions</div>
              <div className="col-span-2 text-center">Statut</div>
              <div className="col-span-2 text-center">Actions</div>
            </div>
          </div>

          {filteredQuizzes.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 text-lg font-medium">Aucun quiz trouvé</p>
                <p className="text-gray-400 text-sm mt-1">Essayez de modifier vos critères de recherche</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)] border-t border-[var(--border-color)]">
              {currentQuizzes.map((quiz) => (
                <div key={quiz._id} className="px-4 py-4 md:px-6">
                  {/* Version desktop - grille */}
                  <div className="hidden md:grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3 font-medium text-[var(--text-dark-blue)]">{quiz.title}</div>
                    <div className="col-span-2 text-[var(--text-medium-blue)]">{quiz.category}</div>
                    <div className="col-span-2 flex justify-center">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${quiz.difficulty === 'débutant' ? 'bg-[var(--button-cyan)] text-white' :
                          quiz.difficulty === 'intermédiaire' ? 'bg-[var(--wave-yellow)] text-[var(--text-dark-blue)]' :
                          'bg-[var(--wave-pink)] text-white'}`}>
                        {quiz.difficulty || 'intermédiaire'}
                      </span>
                    </div>
                    <div className="col-span-1 text-center text-[var(--button-cyan)] font-medium">
                      {quiz.questions?.length || 0}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${quiz.isPublished ? 'bg-[var(--button-cyan)] text-white' : 'bg-gray-300 text-gray-700'}`}>
                        {quiz.isPublished ? 'Publié' : 'Brouillon'}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-center items-center space-x-2">
                      <Link to={`/admin/quizzes/${quiz._id}`} className="inline-block px-4 py-1 text-[var(--button-cyan)] hover:underline transition-colors text-sm whitespace-nowrap">
                        Modifier
                      </Link>
                      <button
                        onClick={() => setDeleteConfirmation(quiz._id)}
                        className="inline-block px-4 py-1 text-[var(--wave-pink)] hover:underline transition-colors text-sm whitespace-nowrap"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>

                  {/* Version mobile - carte */}
                  <div className="md:hidden flex flex-col space-y-3">
                    <div className="flex flex-col">
                      <h3 className="font-medium text-[var(--text-dark-blue)] text-lg mb-1">{quiz.title}</h3>
                      <div className="flex items-center">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full mr-2
                          ${quiz.isPublished ? 'bg-[var(--button-cyan)] text-white' : 'bg-gray-300 text-gray-700'}`}>
                          {quiz.isPublished ? 'Publié' : 'Brouillon'}
                        </span>
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${quiz.difficulty === 'débutant' ? 'bg-[var(--button-cyan)] text-white' :
                            quiz.difficulty === 'intermédiaire' ? 'bg-[var(--wave-yellow)] text-[var(--text-dark-blue)]' :
                            'bg-[var(--wave-pink)] text-white'}`}>
                          {quiz.difficulty || 'intermédiaire'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Catégorie: </span>
                        <span className="text-[var(--text-medium-blue)]">{quiz.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Questions: </span>
                        <span className="text-[var(--button-cyan)] font-medium">{quiz.questions?.length || 0}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <div className="flex space-x-2 w-full">
                        <Link to={`/admin/quizzes/${quiz._id}`} className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-[var(--button-cyan)] text-[var(--button-cyan)] bg-white rounded-md text-sm font-medium">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Modifier
                        </Link>
                        <button
                          onClick={() => setDeleteConfirmation(quiz._id)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-[var(--wave-pink)] text-[var(--wave-pink)] bg-white rounded-md text-sm font-medium"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination et informations */}
        {filteredQuizzes.length > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center mt-6 bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-sm text-gray-600 mb-4 md:mb-0">
              Affichage de <span className="font-medium text-[var(--button-dark-blue)]">{indexOfFirstQuiz + 1}</span> à <span className="font-medium text-[var(--button-dark-blue)]">{Math.min(indexOfLastQuiz, filteredQuizzes.length)}</span> sur <span className="font-medium text-[var(--button-dark-blue)]">{filteredQuizzes.length}</span> quiz
            </div>

            {totalPages > 1 && (
              <nav className="relative z-0 inline-flex rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-[var(--button-dark-blue)] hover:bg-gray-50 disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
                >
                  <span className="sr-only">Précédent</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>

                {totalPages <= 5 ? (
                  // Si moins de 5 pages, afficher toutes les pages
                  [...Array(totalPages).keys()].map(number => (
                    <button
                      key={number + 1}
                      onClick={() => paginate(number + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium transition-colors ${
                        currentPage === number + 1
                          ? 'z-10 bg-[var(--button-cyan)] border-[var(--button-cyan)] text-white'
                          : 'bg-white text-[var(--text-dark-blue)] hover:bg-gray-50'
                      }`}
                    >
                      {number + 1}
                    </button>
                  ))
                ) : (
                  // Si plus de 5 pages, afficher un sous-ensemble avec ellipses
                  <>
                    {/* Première page */}
                    {currentPage > 2 && (
                      <button
                        onClick={() => paginate(1)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-[var(--text-dark-blue)] hover:bg-gray-50`}
                      >
                        1
                      </button>
                    )}

                    {/* Ellipse de gauche */}
                    {currentPage > 3 && (
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    )}

                    {/* Pages autour de la page courante */}
                    {[...Array(totalPages).keys()]
                      .filter(number => Math.abs(number + 1 - currentPage) <= 1)
                      .map(number => (
                        <button
                          key={number + 1}
                          onClick={() => paginate(number + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium transition-colors ${
                            currentPage === number + 1
                              ? 'z-10 bg-[var(--button-cyan)] border-[var(--button-cyan)] text-white'
                              : 'bg-white text-[var(--text-dark-blue)] hover:bg-gray-50'
                          }`}
                        >
                          {number + 1}
                        </button>
                      ))
                    }

                    {/* Ellipse de droite */}
                    {currentPage < totalPages - 2 && (
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    )}

                    {/* Dernière page */}
                    {currentPage < totalPages - 1 && (
                      <button
                        onClick={() => paginate(totalPages)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-[var(--text-dark-blue)] hover:bg-gray-50`}
                      >
                        {totalPages}
                      </button>
                    )}
                  </>
                )}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-[var(--button-dark-blue)] hover:bg-gray-50 disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
                >
                  <span className="sr-only">Suivant</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            )}
          </div>
        )}

        {/* Confirmation de suppression */}
        {deleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[var(--card-bg)] rounded-lg p-8 max-w-md w-full shadow-xl animate-fade-in">
              <h2 className="text-2xl font-bold text-[var(--text-dark-blue)] mb-4">Confirmer la suppression</h2>
              <p className="text-[var(--text-color)] mb-6">
                Êtes-vous sûr de vouloir supprimer ce quiz ? Cette action est irréversible.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="bg-[var(--button-dark-blue)] hover:opacity-90 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDeleteQuiz(deleteConfirmation)}
                  className="bg-[var(--wave-pink)] hover:opacity-90 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lien de retour */}
        <div className="mt-8">
          <Link to="/admin" className="text-[var(--button-cyan)] hover:text-[var(--button-cyan)] hover:opacity-90 transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Retour au tableau de bord
          </Link>
        </div>
        </div>
      </div>
    </div>

    {/* Styles pour les animations */}
    <style>{`
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideIn {
        from { transform: translateY(10%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `}</style>
    </>
  );
};

export default QuizManagement;
