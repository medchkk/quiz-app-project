import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaPlay,
  FaListAlt,
  FaBars,
  FaUser,
  FaYoutube,
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaCopyright
} from 'react-icons/fa';
import ThemeToggle from '../components/ThemeToggle';
import quizLogo from '../assets/quiz.png';
import avatarManager from '../utils/avatarManager';
import logger from '../utils/logger';

/**
 * Page d'accueil de l'application
 */
const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error] = useState('');
  const navigate = useNavigate();

  // Initialisation du profil utilisateur
  const [userProfile, setUserProfile] = useState(() => {
    logger.debug('Home', 'Initializing user profile');
    return avatarManager.getUserProfile();
  });

  // Effet unique pour marquer le chargement comme terminé
  useEffect(() => {
    logger.info('Home', 'Page loaded and initialized');
  }, []);

  // Effet pour recharger les données du localStorage lorsque la page devient visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        logger.debug('Home', 'Page became visible, updating profile');
        setUserProfile(avatarManager.getUserProfile());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Effet pour écouter l'événement avatarUpdated
  useEffect(() => {
    const handleAvatarUpdated = (event) => {
      logger.debug('Home', 'Avatar update event detected');

      if (event.detail && event.detail.avatar) {
        // Mettre à jour le profil utilisateur avec le nouvel avatar
        setUserProfile(prevProfile => ({
          ...prevProfile,
          avatar: event.detail.avatar
        }));
      } else {
        // Recharger le profil depuis le localStorage
        setUserProfile(avatarManager.getUserProfile());
      }
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdated);

    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdated);
    };
  }, []);

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      logger.debug('Home', 'No token found, redirecting to login');
      navigate('/login');
      return;
    }

    // Charger les données utilisateur depuis le localStorage
    setUserProfile(avatarManager.getUserProfile());
  }, [navigate]);

  /**
   * Gère la déconnexion de l'utilisateur
   * - Supprime les données de session
   * - Conserve les avatars
   * - Redirige vers la page de connexion
   */
  const handleLogout = () => {
    logger.info('Home', 'User logging out');

    // Liste des clés à supprimer (liées à la session)
    const sessionKeys = ['token', 'username', 'email', 'currentAvatarKey'];

    // Supprimer les clés de session
    sessionKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    // Supprimer l'ancienne clé générique si elle existe
    if (localStorage.getItem('userAvatar')) {
      localStorage.removeItem('userAvatar');
    }

    // Rediriger vers la page de connexion
    navigate('/login');
  };

  // Fonction pour naviguer vers la page de jeu
  const handlePlay = () => {
    navigate('/play');
  };

  // Fonction pour naviguer vers la page des catégories
  const handleTopics = () => {
    navigate('/topics');
  };

  // Fonction pour ouvrir/fermer la sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-light)]">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-[var(--button-dark-blue)] w-64 transform transition-transform duration-300 z-50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4">
          <div className="flex justify-end">
            <button
              onClick={toggleSidebar}
              className="text-white text-2xl"
            >
              &times;
            </button>
          </div>
          <div className="mt-8 space-y-4">
            {/* Affichage de l'avatar et du nom d'utilisateur */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden mb-3">
                {userProfile.avatar ? (
                  <>
                    <img
                      src={userProfile.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => avatarManager.handleAvatarError(e)}
                    />
                  </>
                ) : (
                  <div className="w-full h-full bg-[var(--button-cyan)] text-white flex items-center justify-center">
                    <FaUser className="text-3xl" />
                  </div>
                )}
              </div>
              <p className="text-white font-semibold">{userProfile.username || 'Utilisateur'}</p>
              <p className="text-gray-300 text-sm">{userProfile.email || 'user@example.com'}</p>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <Link to="/profile" className="block text-white py-2 px-4 hover:bg-[var(--button-cyan)] rounded transition-colors">
                Mon Profil
              </Link>
              <Link to="/topics" className="block text-white py-2 px-4 hover:bg-[var(--button-cyan)] rounded transition-colors">
                Catégories
              </Link>
              <Link to="/play" className="block text-white py-2 px-4 hover:bg-[var(--button-cyan)] rounded transition-colors">
                Jouer
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left text-white py-2 px-4 hover:bg-red-600 rounded transition-colors mt-4"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay pour fermer la sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        ></div>
      )}

      <div className="max-w-4xl mx-auto p-6 pb-32">
        {/* Barre de navigation */}
        <div className="flex justify-between items-center mb-10">
          <button
            onClick={toggleSidebar}
            className="p-2 border border-[var(--button-dark-blue)] rounded text-[var(--button-dark-blue)]"
          >
            <FaBars className="text-xl" />
          </button>
          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              className="rounded-full overflow-hidden flex items-center justify-center"
              style={{ width: '36px', height: '36px' }}
            >
              {userProfile.avatar ? (
                <>
                  <img
                    src={userProfile.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => avatarManager.handleAvatarError(e)}
                  />
                </>
              ) : (
                <div className="w-full h-full bg-[var(--button-cyan)] text-white flex items-center justify-center">
                  <FaUser />
                </div>
              )}
            </Link>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-[var(--button-dark-blue)] text-white rounded"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Logo QUIZ PNG */}
        <div className="text-center mb-16 fade-in">
          <div className="relative" style={{
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
            padding: '10px',
            background: 'linear-gradient(to bottom, rgba(0, 20, 80, 0.1), rgba(0, 0, 0, 0))',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            {/* Effet de lueur derrière l'image */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              height: '80%',
              background: 'radial-gradient(circle, rgba(10, 252, 252, 0.2) 0%, rgba(0, 48, 128, 0.1) 50%, rgba(0, 0, 0, 0) 70%)',
              filter: 'blur(20px)',
              zIndex: 0
            }}></div>

            <img
              src={quizLogo}
              alt="Quiz Logo"
              className="w-full h-auto relative z-10"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(10, 252, 252, 0.8)) drop-shadow(0 0 20px rgba(0, 48, 128, 0.6))',
                transform: 'scale(1.05)',
                animation: 'pulse 3s infinite alternate'
              }}
            />
          </div>

          {/* Animation pour l'effet de pulsation */}
          <style jsx="true">{`
            @keyframes pulse {
              0% {
                filter: drop-shadow(0 0 10px rgba(10, 252, 252, 0.8)) drop-shadow(0 0 20px rgba(0, 48, 128, 0.6));
                transform: scale(1.05);
              }
              100% {
                filter: drop-shadow(0 0 15px rgba(10, 252, 252, 0.9)) drop-shadow(0 0 30px rgba(0, 48, 128, 0.7));
                transform: scale(1.08);
              }
            }
          `}</style>
        </div>

        {/* Boutons principaux */}
        <div className="flex flex-col md:flex-row items-center justify-center mb-20 space-y-6 md:space-y-0 md:space-x-8">
          <button
            onClick={handlePlay}
            className="button-primary w-64 h-16 transform hover:scale-110 transition-all duration-300 flex items-center justify-center text-xl fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            <FaPlay className="mr-3" /> JOUER
          </button>
          <button
            onClick={handleTopics}
            className="button-secondary w-64 h-16 transform hover:scale-110 transition-all duration-300 flex items-center justify-center text-xl fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            <FaListAlt className="mr-3" /> CATÉGORIES
          </button>
        </div>

        {/* Affichage des erreurs */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Message "Ready for a quiz?" - Style néon */}
        <div className="text-center mb-10 fade-in relative p-8" style={{
          animationDelay: '0.6s',
          background: 'var(--bg-light)',
          overflow: 'hidden'
        }}>
          {/* Effet de lignes horizontales pour simuler un fond néon */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(80, 80, 150, 0.05), rgba(80, 80, 150, 0.05) 1px, transparent 1px, transparent 4px)',
            backgroundSize: '100% 4px',
            zIndex: 0
          }}></div>

          {/* Ligne néon supérieure avec cercles */}
          <div className="flex items-center justify-center mb-6 relative z-10">
            <div className="h-1 bg-gradient-to-r from-transparent via-purple-500 to-purple-500 w-32 md:w-40 opacity-80 glow-purple"></div>
            <div className="mx-4 flex space-x-3">
              {[1, 2, 3, 4, 5].map((_, index) => (
                <div
                  key={index}
                  className={`rounded-full ${index === 2 ? 'w-4 h-4' : 'w-2 h-2'} ${index === 2 ? 'bg-white' : 'bg-purple-300'} glow-purple`}
                  style={{ boxShadow: `0 0 ${index === 2 ? '8px' : '5px'} ${index === 2 ? '3px' : '2px'} rgba(186, 104, 200, 0.8)` }}
                ></div>
              ))}
            </div>
            <div className="h-1 bg-gradient-to-r from-purple-500 to-transparent via-purple-500 w-32 md:w-40 opacity-80 glow-purple"></div>
          </div>

          {/* Texte néon */}
          <h2 className="text-4xl font-bold text-cyan-300 mb-2 tracking-wider neon-text-cyan relative z-10" style={{
            textShadow: '0 0 5px rgba(80, 199, 199, 0.8), 0 0 10px rgba(80, 199, 199, 0.5), 0 0 15px rgba(80, 199, 199, 0.3)'
          }}>
            READY FOR A
          </h2>
          <h2 className="text-6xl font-bold text-pink-500 tracking-wider neon-text-pink relative z-10" style={{
            textShadow: '0 0 5px rgba(236, 72, 153, 0.8), 0 0 10px rgba(236, 72, 153, 0.5), 0 0 15px rgba(236, 72, 153, 0.3)'
          }}>
            QUIZ?
          </h2>

          {/* Ligne néon inférieure */}
          <div className="mt-6 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-full opacity-80 glow-cyan relative z-10"></div>
        </div>

        {/* Ajout de styles CSS pour les effets de lueur */}
        <style jsx="true">{`
          .glow-purple {
            filter: drop-shadow(0 0 2px rgba(186, 104, 200, 0.8));
          }
          .glow-cyan {
            filter: drop-shadow(0 0 2px rgba(34, 211, 238, 0.8));
          }
          .neon-text-cyan {
            animation: flickerCyan 5s infinite alternate;
          }
          .neon-text-pink {
            animation: flickerPink 7s infinite alternate;
          }
          @keyframes flickerCyan {
            0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
              opacity: 0.95;
              text-shadow: 0 0 5px rgba(80, 199, 199, 0.8), 0 0 10px rgba(80, 199, 199, 0.5), 0 0 15px rgba(80, 199, 199, 0.3);
            }
            20%, 24%, 55% {
              opacity: 0.7;
              text-shadow: none;
            }
          }
          @keyframes flickerPink {
            0%, 29%, 31%, 33%, 35%, 64%, 66%, 100% {
              opacity: 0.95;
              text-shadow: 0 0 5px rgba(236, 72, 153, 0.8), 0 0 10px rgba(236, 72, 153, 0.5), 0 0 15px rgba(236, 72, 153, 0.3);
            }
            30%, 34%, 65% {
              opacity: 0.8;
              text-shadow: none;
            }
          }
        `}</style>

        {/* Icônes de médias sociaux */}
        <div className="flex justify-center space-x-6 mb-6">
          <a href="#" className="p-2 bg-[var(--button-dark-blue)] text-white rounded">
            <FaYoutube />
          </a>
          <a href="#" className="p-2 bg-[var(--button-dark-blue)] text-white rounded">
            <FaTwitter />
          </a>
          <a href="#" className="p-2 bg-[var(--button-dark-blue)] text-white rounded">
            <FaInstagram />
          </a>
          <a href="#" className="p-2 bg-[var(--button-dark-blue)] text-white rounded">
            <FaFacebook />
          </a>
          <a href="#" className="p-2 bg-[var(--button-dark-blue)] text-white rounded">
            <FaTiktok />
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center text-[var(--text-dark-blue)]">
          <p className="flex items-center justify-center">
            <FaCopyright className="mr-1" /> Copyright Info. Tous droits réservés
          </p>
        </div>
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

export default Home;
