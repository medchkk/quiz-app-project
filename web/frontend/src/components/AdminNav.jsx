import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChartBar, FaQuestionCircle, FaUsers, FaFileImport, FaSignOutAlt, FaBars, FaTimes, FaUser } from 'react-icons/fa';
import axios from 'axios';
import avatarManager from '../utils/avatarManager';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminNav = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    username: '',
    avatar: null,
    email: ''
  });
  const location = useLocation();

  useEffect(() => {
    // Récupérer le profil utilisateur depuis le localStorage via avatarManager
    const profile = avatarManager.getUserProfile();

    // Traiter l'avatar pour s'assurer qu'il a l'URL complète si c'est un chemin relatif
    let processedAvatar = profile.avatar;
    if (processedAvatar && processedAvatar.startsWith('/uploads/')) {
      processedAvatar = `${API_URL}${processedAvatar}`;
      console.log('Avatar URL corrigée:', processedAvatar);
    }

    setUserProfile({
      ...profile,
      avatar: processedAvatar
    });

    // Récupérer les données fraîches depuis l'API
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`${API_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Traiter l'avatar de la réponse API
        let avatarUrl = response.data.avatar;
        if (avatarUrl && avatarUrl.startsWith('/uploads/')) {
          avatarUrl = `${API_URL}${avatarUrl}`;
          console.log('Avatar URL depuis API corrigée:', avatarUrl);
        }

        // Mettre à jour le profil avec les données de l'API
        setUserProfile(prevProfile => ({
          ...prevProfile,
          username: response.data.username,
          email: response.data.email,
          role: response.data.role,
          avatar: avatarUrl // Utiliser l'URL corrigée
        }));

        // Si l'API renvoie un avatar, le mettre à jour dans le localStorage
        if (response.data.avatar) {
          const username = response.data.username;
          const userAvatarKey = `userAvatar_${username}`;
          localStorage.setItem('currentAvatarKey', userAvatarKey);

          // Stocker l'avatar original (sans préfixe API_URL) pour maintenir la cohérence
          localStorage.setItem(userAvatarKey, response.data.avatar);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    // Supprimer toutes les données de session
    const sessionKeys = ['token', 'username', 'email', 'userRole', 'currentAvatarKey'];
    sessionKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    // Rediriger vers la page de connexion
    window.location.href = '/login';
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Overlay pour fermer la barre latérale en cliquant à l'extérieur */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Barre de navigation mobile */}
      <div className="bg-[var(--bg-light)] shadow-md py-4 px-6 flex justify-between items-center md:hidden">
        <button
          onClick={toggleSidebar}
          className="text-[var(--text-dark-blue)] focus:outline-none"
        >
          <FaBars className="text-xl" />
        </button>
        <h1 className="text-xl font-bold text-[var(--text-dark-blue)]">Admin</h1>
        {userProfile.avatar ? (
          <img
            src={userProfile.avatar}
            alt={userProfile.username}
            className="w-8 h-8 rounded-full border-2 border-[var(--button-cyan)]"
            onError={(e) => {
              console.log('Erreur de chargement avatar mobile:', e.target.src);
              // Éviter les boucles infinies
              e.target.onerror = null;
              // Fallback vers un avatar généré
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.username)}&background=0D8ABC&color=fff&size=64`;
            }}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[var(--button-cyan)] flex items-center justify-center border-2 border-[var(--button-cyan)]">
            <FaUser className="text-white text-sm" />
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-screen bg-[var(--button-dark-blue)] w-64 transform transition-all duration-300 ease-in-out shadow-xl z-50 ${sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-95'} md:translate-x-0 md:sticky md:top-0 md:h-screen md:opacity-100 overflow-y-auto`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-end items-center mb-6">
            <button
              onClick={toggleSidebar}
              className="text-white md:hidden hover:rotate-90 transition-transform duration-300"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {userProfile.username && (
            <div className="mb-6 pb-4 border-b border-[var(--wave-cyan)] border-opacity-30">
              <div className="flex justify-center mb-3">
                <div className="relative">
                  {userProfile.avatar ? (
                    <img
                      src={userProfile.avatar}
                      alt={userProfile.username}
                      className="w-16 h-16 rounded-full bg-[var(--button-cyan)]"
                      onError={(e) => {
                        console.log('Erreur de chargement avatar sidebar:', e.target.src);
                        // Éviter les boucles infinies
                        e.target.onerror = null;
                        // Fallback vers un avatar généré
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.username)}&background=0D8ABC&color=fff&size=128`;
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[var(--button-cyan)] flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">{userProfile.username.charAt(0).toUpperCase() + userProfile.username.charAt(1).toUpperCase()}</span>
                    </div>
                  )}
                  {userProfile.role === 'admin' && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[var(--button-cyan)] text-white text-xs py-1 px-3 rounded-full">
                      <span className="text-[10px] uppercase font-bold">Admin</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center">
                <p className="text-[var(--button-cyan)] text-sm">Connecté en tant que</p>
                <p className="text-white font-medium text-lg">{userProfile.username}</p>
              </div>
            </div>
          )}

          <nav className="flex-grow">
            <ul className="space-y-3 px-4">
              <li>
                <Link
                  to="/admin"
                  className={`flex items-center py-3 px-4 rounded-md transition-all sidebar-nav-link ${isActive('/admin')
                    ? 'bg-[var(--button-cyan)] text-white font-medium'
                    : 'text-white'}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3 sidebar-nav-icon">
                    <FaChartBar className="text-[var(--button-cyan)]" />
                  </div>
                  <span className="text-base">Tableau de bord</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/quizzes"
                  className={`flex items-center py-3 px-4 rounded-md transition-all sidebar-nav-link ${isActive('/admin/quizzes') || location.pathname.includes('/admin/quizzes/')
                    ? 'bg-[var(--button-cyan)] text-white font-medium'
                    : 'text-white'}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--button-cyan)] flex items-center justify-center mr-3 sidebar-nav-icon">
                    <FaQuestionCircle className="text-white" />
                  </div>
                  <span className="text-base">Gestion des Quiz</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/users"
                  className={`flex items-center py-3 px-4 rounded-md transition-all sidebar-nav-link ${isActive('/admin/users')
                    ? 'bg-[var(--button-cyan)] text-white font-medium'
                    : 'text-white'}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--button-cyan)] flex items-center justify-center mr-3 sidebar-nav-icon">
                    <FaUsers className="text-white" />
                  </div>
                  <span className="text-base">Utilisateurs</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/import-export"
                  className={`flex items-center py-3 px-4 rounded-md transition-all sidebar-nav-link ${isActive('/admin/import-export')
                    ? 'bg-[var(--button-cyan)] text-white font-medium'
                    : 'text-white'}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--button-cyan)] flex items-center justify-center mr-3 sidebar-nav-icon">
                    <FaFileImport className="text-white" />
                  </div>
                  <span className="text-base">Import / Export</span>
                </Link>
              </li>
            </ul>
          </nav>

          <div className="mt-auto px-4 mb-6 w-full">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="flex items-center justify-center py-3 px-4 text-white bg-[var(--button-cyan)] rounded-md transition-all"
                onClick={() => setSidebarOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Retour au site
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center py-3 px-4 text-white bg-[var(--wave-pink)] rounded-md transition-all"
              >
                <FaSignOutAlt className="mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminNav;
