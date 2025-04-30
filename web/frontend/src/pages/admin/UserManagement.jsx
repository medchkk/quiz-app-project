import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminNav from '../../components/AdminNav';
import avatarManager from '../../utils/avatarManager';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleUpdateLoading, setRoleUpdateLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Vous devez être connecté pour accéder à cette page');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Prétraiter les avatars pour s'assurer qu'ils sont correctement formatés
        const processedUsers = response.data.map(user => {
          // Si l'avatar est un chemin relatif, préfixer avec l'URL du serveur
          if (user.avatar && user.avatar.startsWith('/uploads/')) {
            return {
              ...user,
              avatar: `${API_URL}${user.avatar}`
            };
          }
          return user;
        });


        setUsers(processedUsers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(error.response?.data?.message || 'Une erreur est survenue lors du chargement des utilisateurs');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setRoleUpdateLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.put(
        `${API_URL}/admin/users/${userId}/role`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Mettre à jour la liste des utilisateurs
      setUsers(users.map(user => user._id === userId ? response.data : user));
      setRoleUpdateLoading(false);
    } catch (error) {
      console.error('Error updating user role:', error);
      setError(error.response?.data?.message || 'Une erreur est survenue lors de la mise à jour du rôle');
      setRoleUpdateLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const userToDelete = users.find(user => user._id === userId);

      await axios.delete(`${API_URL}/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Mettre à jour la liste des utilisateurs
      setUsers(users.filter(user => user._id !== userId));
      setDeleteConfirmation(null);

      // Afficher un message de succès
      setSuccessMessage(`L'utilisateur ${userToDelete.username} a été supprimé avec succès.`);

      // Masquer le message après 5 secondes
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.response?.data?.message || 'Une erreur est survenue lors de la suppression de l\'utilisateur');
    }
  };





  // Filtrer les utilisateurs en fonction du terme de recherche
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

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
          <Link to="/admin" className="block text-center bg-[var(--button-cyan)] hover:bg-[var(--button-medium-blue)] text-white font-bold py-2 px-4 rounded transition-colors">
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
              <h1 className="text-2xl md:text-3xl font-bold">Gestion des Utilisateurs</h1>
              <p className="text-gray-200 mt-1 text-sm md:text-base">Administrez les comptes utilisateurs et leurs rôles</p>

              {/* Statistiques mobiles */}
              <div className="flex flex-wrap mt-3 gap-2 md:hidden">
                <div className="bg-[var(--button-cyan)] px-3 py-1 rounded-md shadow-sm flex items-center text-xs">
                  <span className="font-bold">{users.length}</span>
                  <span className="ml-1">utilisateurs</span>
                </div>
                <div className="bg-[var(--button-medium-blue)] px-3 py-1 rounded-md shadow-sm flex items-center text-xs">
                  <span className="font-bold">{users.filter(u => u.role === 'admin').length}</span>
                  <span className="ml-1">admins</span>
                </div>
                <div className="bg-[var(--button-dark-blue)] px-3 py-1 rounded-md shadow-sm flex items-center text-xs">
                  <span className="font-bold">{users.reduce((total, user) => total + (user.stats?.totalQuizzesCompleted || 0), 0)}</span>
                  <span className="ml-1">quiz</span>
                </div>
                <div className="bg-[var(--wave-pink)] px-3 py-1 rounded-md shadow-sm flex items-center text-xs">
                  <span className="font-bold">{users.reduce((total, user) => total + (user.stats?.totalScore || 0), 0)}</span>
                  <span className="ml-1">points</span>
                </div>
              </div>
            </div>

            {/* Statistiques desktop */}
            <div className="hidden md:flex items-center space-x-3 text-sm">
              <div className="bg-[var(--button-cyan)] px-4 py-2 rounded-md shadow-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span className="font-bold text-base">{users.length}</span>
                <span className="ml-1">utilisateurs</span>
              </div>
              <div className="bg-[var(--button-medium-blue)] px-4 py-2 rounded-md shadow-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
                <span className="font-bold text-base">{users.filter(u => u.role === 'admin').length}</span>
                <span className="ml-1">admins</span>
              </div>
              <div className="bg-[var(--button-dark-blue)] px-4 py-2 rounded-md shadow-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className="font-bold text-base">{users.reduce((total, user) => total + (user.stats?.totalQuizzesCompleted || 0), 0)}</span>
                <span className="ml-1">quiz</span>
              </div>
              <div className="bg-[var(--wave-pink)] px-4 py-2 rounded-md shadow-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-bold text-base">{users.reduce((total, user) => total + (user.stats?.totalScore || 0), 0)}</span>
                <span className="ml-1">points</span>
              </div>
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
              placeholder="Rechercher par nom ou email..."
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
          {filteredUsers.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'utilisateur trouvé' : 'utilisateurs trouvés'}
            </p>
          )}
        </div>

        {/* Liste des utilisateurs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          {/* Version desktop - tableau */}
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[var(--button-dark-blue)] text-white">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold tracking-wider rounded-tl-lg">
                    Utilisateur
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                    Statistiques
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                    Rôle
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                    Date d'inscription
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-sm font-semibold tracking-wider rounded-tr-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium">Aucun utilisateur trouvé</p>
                        <p className="text-gray-400 text-sm mt-1">Essayez de modifier vos critères de recherche</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {user.avatar ? (
                              <img
                                className="h-12 w-12 rounded-full object-cover border-2 border-[var(--button-cyan)]"
                                src={user.avatar}
                                alt={user.username}
                                onError={(e) => {
                                  // Utiliser le gestionnaire d'erreur d'avatar
                                  const isRelativePath = user.avatar.startsWith('/uploads/');
                                  if (isRelativePath) {
                                    // Préfixer avec l'URL du serveur
                                    e.target.src = `${API_URL}${user.avatar}`;
                                  } else {
                                    // Fallback vers un avatar généré
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=0D8ABC&color=fff`;
                                  }
                                }}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-[var(--button-cyan)] flex items-center justify-center">
                                <span className="text-white font-medium text-lg">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-base font-medium text-[var(--button-dark-blue)]">{user.username}</div>
                            <div className="text-xs text-gray-500 mt-1">ID: {user._id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm text-[var(--text-dark-blue)]">{user.email}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-[var(--text-dark-blue)]">Score: </span>
                            <span className="font-bold text-blue-600">{user.stats ? user.stats.totalScore : 0}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-[var(--text-dark-blue)]">Quiz: </span>
                            <span className="font-bold text-green-600">{user.stats ? user.stats.totalQuizzesCompleted : 0}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          disabled={roleUpdateLoading}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--button-cyan)] bg-white text-[var(--text-dark-blue)]"
                        >
                          <option value="user">Utilisateur</option>
                          <option value="admin">Administrateur</option>
                        </select>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm text-[var(--text-dark-blue)]">
                          {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(user.createdAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (user.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1) {
                              alert('Impossible de supprimer le dernier administrateur');
                              return;
                            }

                            // Utiliser la boîte de dialogue modale au lieu de window.confirm
                            setDeleteConfirmation(user._id);
                          }}
                          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                            user.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                          }`}
                          title={
                            user.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1
                              ? 'Impossible de supprimer le dernier administrateur'
                              : 'Supprimer cet utilisateur'
                          }
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Version mobile - cartes */}
          <div className="md:hidden">
            {currentUsers.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <p className="text-gray-500 text-lg font-medium">Aucun utilisateur trouvé</p>
                  <p className="text-gray-400 text-sm mt-1">Essayez de modifier vos critères de recherche</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {currentUsers.map((user) => (
                  <div key={user._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center mb-3">
                      <div className="flex-shrink-0 h-12 w-12">
                        {user.avatar ? (
                          <img
                            className="h-12 w-12 rounded-full object-cover border-2 border-[var(--button-cyan)]"
                            src={user.avatar}
                            alt={user.username}
                            onError={(e) => {
                              const isRelativePath = user.avatar.startsWith('/uploads/');
                              if (isRelativePath) {
                                e.target.src = `${API_URL}${user.avatar}`;
                              } else {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=0D8ABC&color=fff`;
                              }
                            }}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-[var(--button-cyan)] flex items-center justify-center">
                            <span className="text-white font-medium text-lg">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="text-base font-medium text-[var(--button-dark-blue)]">{user.username}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                      <div className="ml-2">
                        {user.role === 'admin' ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Admin
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Utilisateur
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Score: </span>
                        <span className="font-bold text-blue-600">{user.stats ? user.stats.totalScore : 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Quiz complétés: </span>
                        <span className="font-bold text-green-600">{user.stats ? user.stats.totalQuizzesCompleted : 0}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Inscrit le: </span>
                        <span className="text-[var(--text-dark-blue)]">
                          {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        disabled={roleUpdateLoading}
                        className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--button-cyan)] bg-white text-[var(--text-dark-blue)]"
                      >
                        <option value="user">Utilisateur</option>
                        <option value="admin">Administrateur</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          if (user.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1) {
                            alert('Impossible de supprimer le dernier administrateur');
                            return;
                          }
                          setDeleteConfirmation(user._id);
                        }}
                        className={`inline-flex items-center px-3 py-1.5 text-sm rounded-md ${
                          user.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                        disabled={user.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pagination et informations */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-6 bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-600 mb-4 md:mb-0">
            Affichage de <span className="font-medium text-[var(--button-dark-blue)]">{indexOfFirstUser + 1}</span> à <span className="font-medium text-[var(--button-dark-blue)]">{Math.min(indexOfLastUser, filteredUsers.length)}</span> sur <span className="font-medium text-[var(--button-dark-blue)]">{filteredUsers.length}</span> utilisateurs
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

        {/* Lien de retour */}
        <div className="mt-8">
          <Link to="/admin" className="text-[var(--button-cyan)] hover:text-[var(--button-medium-blue)] transition-colors flex items-center">
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

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from { transform: translateY(10%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Confirmation de suppression */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--card-bg)] rounded-lg p-8 max-w-md w-full shadow-xl animate-fade-in">
            <h2 className="text-2xl font-bold text-[var(--text-dark-blue)] mb-4">Confirmer la suppression</h2>
            <p className="text-[var(--text-color)] mb-6">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="bg-[var(--button-dark-blue)] hover:opacity-90 text-white font-bold py-2 px-4 rounded-md transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirmation)}
                className="bg-[var(--wave-pink)] hover:opacity-90 text-white font-bold py-2 px-4 rounded-md transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManagement;
