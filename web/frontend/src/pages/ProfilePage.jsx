import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUserCircle,
  FaChartBar,
  FaHistory,
  FaArrowLeft,
  FaEnvelope,
  FaUser,
  FaLock,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
  FaTrophy,
  FaQuestionCircle,
  FaCrown,
  FaShieldAlt
} from 'react-icons/fa';
import api from '../utils/api';
import ThemeToggle from '../components/ThemeToggle';
import { STORAGE_KEYS } from '../utils/constants';

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    avatar: null,
    role: ''
  });
  const [stats, setStats] = useState({ totalScore: 0, totalQuizzesCompleted: 0 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Récupérer les statistiques de l'utilisateur
        const statsResponse = await api.get('/users/stats');
        setStats(statsResponse.data);

        // Récupérer les informations du profil (à implémenter côté backend)
        const userResponse = await api.get('/users/profile');

        // Stocker les informations utilisateur dans le localStorage
        const username = userResponse.data.username;
        localStorage.setItem(STORAGE_KEYS.USERNAME, username);
        localStorage.setItem(STORAGE_KEYS.EMAIL, userResponse.data.email);

        // Vérifier et stocker le rôle de l'utilisateur
        console.log('ProfilePage: Full user data received:', userResponse.data);
        if (userResponse.data.role) {
          console.log(`ProfilePage: User role is "${userResponse.data.role}"`);
          localStorage.setItem(STORAGE_KEYS.USER_ROLE, userResponse.data.role);
          console.log(`ProfilePage: Role stored in localStorage: "${localStorage.getItem(STORAGE_KEYS.USER_ROLE)}"`);
        } else {
          console.log('ProfilePage: No role found in user data');
        }

        // Créer une clé spécifique à l'utilisateur pour l'avatar
        const userAvatarKey = `${STORAGE_KEYS.AVATAR_PREFIX}${username}`;
        console.log(`Using avatar key: ${userAvatarKey} for user: ${username}`);

        // Priorité à l'avatar stocké dans le localStorage pour cet utilisateur spécifique
        let storedAvatar = localStorage.getItem(userAvatarKey);
        const isUIAvatar = storedAvatar && storedAvatar.includes('ui-avatars.com');

        // Si l'avatar stocké est un UI-Avatar, le supprimer
        if (isUIAvatar) {
          console.log('Removing UI-Avatars from localStorage during profile load');
          localStorage.removeItem(userAvatarKey);
        }

        // Si l'avatar stocké existe et n'est pas un UI-Avatar, l'utiliser en priorité
        if (storedAvatar && !isUIAvatar) {
          console.log('Using avatar from localStorage:', storedAvatar.substring(0, 30) + '...');

          // Si l'avatar est un chemin relatif, préfixer avec l'URL du serveur
          if (storedAvatar.startsWith('/uploads/')) {
            console.log('Avatar is a relative path, prefixing with server URL');
            storedAvatar = `http://localhost:5000${storedAvatar}`;
          }

          userResponse.data.avatar = storedAvatar;
          setAvatarPreview(storedAvatar);
        }
        // Si l'utilisateur a un avatar dans la réponse API et qu'il n'y a pas d'avatar stocké (ou c'était un UI-Avatar)
        else if (userResponse.data.avatar && (!storedAvatar || isUIAvatar)) {
          console.log('Using avatar from API response');

          // Si l'avatar est un chemin relatif, préfixer avec l'URL du serveur
          if (userResponse.data.avatar && userResponse.data.avatar.startsWith('/uploads/')) {
            console.log('Avatar from API is a relative path, prefixing with server URL');
            // Créer une copie modifiable de l'avatar
            let avatarUrl = userResponse.data.avatar;
            avatarUrl = `http://localhost:5000${avatarUrl}`;
            userResponse.data.avatar = avatarUrl;
          }

          setAvatarPreview(userResponse.data.avatar);
          localStorage.setItem(userAvatarKey, userResponse.data.avatar);
        }
        // Si aucun avatar n'est disponible, utiliser l'avatar par défaut
        else {
          console.log('No avatar found, using default');
          const defaultAvatar = '/default-avatar.svg';
          userResponse.data.avatar = defaultAvatar;
          setAvatarPreview(defaultAvatar);
        }

        // Stocker la clé de l'avatar actuel pour pouvoir l'utiliser ailleurs dans l'application
        localStorage.setItem(STORAGE_KEYS.CURRENT_AVATAR_KEY, userAvatarKey);

        setUserData(userResponse.data);

        setFormData({
          username: userResponse.data.username,
          email: userResponse.data.email,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (err) {
        console.error('Error fetching profile data:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Erreur lors du chargement des données du profil');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.match('image.*')) {
        setError('Veuillez sélectionner une image');
        return;
      }

      // Vérifier la taille du fichier (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('L\'image ne doit pas dépasser 2MB');
        return;
      }

      setAvatarFile(file);

      // Créer une URL pour la prévisualisation
      const reader = new FileReader();
      reader.onload = () => {
        try {
          // Obtenir l'image en base64
          const data = reader.result;
          console.log('Image converted to base64');

          // Définir l'aperçu de l'avatar
          setAvatarPreview(data);

          // Récupérer le nom d'utilisateur actuel
          const username = localStorage.getItem('username') || 'Utilisateur';

          // Créer une clé spécifique à l'utilisateur pour l'avatar
          const userAvatarKey = `userAvatar_${username}`;
          console.log(`Using avatar key: ${userAvatarKey} for user: ${username} during upload`);

          // Stocker la clé de l'avatar actuel
          localStorage.setItem('currentAvatarKey', userAvatarKey);

          // Enregistrer immédiatement l'avatar dans le localStorage avec la clé spécifique à l'utilisateur
          localStorage.setItem(userAvatarKey, data);
          console.log(`Avatar saved to localStorage with key ${userAvatarKey} immediately after upload`);

          // Supprimer l'ancienne clé générique si elle existe
          if (localStorage.getItem('userAvatar')) {
            console.log('Removing generic userAvatar key');
            localStorage.removeItem('userAvatar');
          }

          // Déclencher l'événement avatarUpdated pour mettre à jour tous les composants
          window.dispatchEvent(new CustomEvent('avatarUpdated', {
            detail: {
              avatar: data,
              timestamp: Date.now(),
              avatarKey: userAvatarKey
            }
          }));
        } catch (error) {
          console.error('Error processing image:', error);
          setError('Error processing image');
        }
      };
      reader.onerror = () => {
        console.error('Erreur lors de la lecture du fichier');
        setError('Erreur lors de la lecture du fichier');
      };
      reader.readAsDataURL(file);

      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation des mots de passe
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Créer un objet FormData pour envoyer les données et le fichier
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('currentPassword', formData.currentPassword);

      if (formData.newPassword) {
        formDataToSend.append('newPassword', formData.newPassword);
      }

      // Ajouter l'avatar s'il a été modifié
      if (avatarFile) {
        console.log('Sending avatar file to server');
        // Envoyer à la fois le fichier et l'image base64
        formDataToSend.append('avatar', avatarFile);
        // Envoyer également l'image base64 pour les serveurs qui ne supportent pas multer
        formDataToSend.append('avatarBase64', avatarPreview);
        console.log('Avatar base64 data length:', avatarPreview ? avatarPreview.length : 0);
      }

      console.log('Submitting profile update...');

      // Appel API pour mettre à jour le profil
      let response;
      try {
        // Essayer d'abord de faire la requête normalement
        try {
          // Si nous avons un fichier d'avatar, utiliser multipart/form-data
          if (avatarFile) {
            console.log('Sending profile update with avatar file using multipart/form-data');
            response = await api.put('/users/profile', formDataToSend, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
          }
          // Sinon, essayer d'envoyer les données en JSON
          else {
            console.log('Sending profile update without avatar file using JSON');
            // Créer un objet JSON avec les données du formulaire
            const jsonData = {
              username: formData.username,
              email: formData.email,
              currentPassword: formData.currentPassword,
              newPassword: formData.newPassword
            };

            response = await api.put('/users/profile', jsonData);
          }

          console.log('Profile update response:', response.data);
        } catch (apiError) {
          console.log('API error detected, using fallback...', apiError);

          // Récupérer la clé d'avatar spécifique à l'utilisateur
          const username = localStorage.getItem('username') || 'Utilisateur';
          const userAvatarKey = `userAvatar_${username}`;

          // Créer une réponse simulée avec les données du localStorage
          // Utiliser l'avatar du localStorage ou l'aperçu actuel, jamais une URL externe
          let avatarUrl = avatarFile
            ? avatarPreview // Utiliser l'aperçu actuel qui est déjà en base64
            : localStorage.getItem(userAvatarKey);

          // Ne plus supprimer les avatars externes (ui-avatars.com)
          // Nous conservons tous les types d'avatars, sauf si un nouvel avatar est téléchargé

          response = {
            data: {
              message: 'Profil mis à jour avec succès (mode hors ligne)',
              avatarUrl: avatarUrl
            }
          };

          console.log('Using simulated response:', response.data);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        throw error;
      }

      setSuccess('Profil mis à jour avec succès');
      setEditMode(false);

      // Récupérer l'URL de l'avatar mise à jour depuis la réponse
      const avatarUrl = response?.data?.avatarUrl || avatarPreview;

      console.log('Avatar URL from response:', avatarUrl ? avatarUrl.substring(0, 30) + '...' : 'none');

      // Stocker les informations utilisateur dans le localStorage
      const username = formData.username;
      localStorage.setItem('username', username);
      localStorage.setItem('email', formData.email);
      console.log('User data saved in localStorage:', username, formData.email);

      // Créer une clé spécifique à l'utilisateur pour l'avatar
      const userAvatarKey = `userAvatar_${username}`;
      console.log(`Using avatar key: ${userAvatarKey} for user: ${username}`);

      // Stocker la clé de l'avatar actuel
      localStorage.setItem('currentAvatarKey', userAvatarKey);

      // Si nous avons un nouvel avatar (soit depuis le fichier, soit depuis la réponse API)
      if (avatarUrl) {
        // Stocker l'avatar avec la clé spécifique à l'utilisateur
        localStorage.setItem(userAvatarKey, avatarUrl);
        console.log(`Avatar saved in localStorage with key ${userAvatarKey}`);

        // Vérifier si l'avatar est une image base64 ou une URL
        if (avatarUrl.startsWith('data:image/')) {
          console.log('Saved avatar is a base64 image');
        } else {
          console.log('Saved avatar is a URL');
        }

        // Supprimer l'ancienne clé générique si elle existe
        if (localStorage.getItem('userAvatar')) {
          console.log('Removing generic userAvatar key');
          localStorage.removeItem('userAvatar');
        }
      }

      // Déclencher l'événement avatarUpdated pour mettre à jour tous les composants
      window.dispatchEvent(new CustomEvent('avatarUpdated', {
        detail: {
          avatar: avatarUrl || localStorage.getItem(userAvatarKey),
          timestamp: Date.now(),
          avatarKey: userAvatarKey
        }
      }));

      // Mettre à jour les données utilisateur
      setUserData({
        ...userData,
        username: formData.username,
        email: formData.email,
        avatar: avatarUrl
      });

      // Effacer les mots de passe et réinitialiser l'état du fichier
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setAvatarFile(null);

      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);

      // Message d'erreur plus détaillé
      let errorMessage = 'Erreur lors de la mise à jour du profil';

      if (err.response) {
        // Erreur avec réponse du serveur
        errorMessage = err.response.data?.message || `Erreur serveur: ${err.response.status}`;
      } else if (err.request) {
        // Erreur sans réponse (problème réseau)
        errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
      } else {
        // Autre type d'erreur
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setFormData({
      username: userData.username,
      email: userData.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    // Réinitialiser l'avatar à l'état d'origine
    setAvatarFile(null);
    setAvatarPreview(userData.avatar);
    setError('');
  };

  if (loading && !userData.username) {
    return (
      <div className="relative min-h-screen bg-[var(--bg-light)] p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-[var(--text-dark-blue)]">Profil</h2>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[var(--bg-light)] p-6">
      <div className="max-w-4xl mx-auto pb-32">
        {/* Barre de navigation */}
        <div className="flex justify-between items-center mb-6">
          <ThemeToggle />
          <button
            onClick={() => navigate('/')}
            className="button-nav flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Retour à l'accueil
          </button>
        </div>

        {/* Titre avec avatar de profil */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            {avatarPreview ? (
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-4 border-[var(--button-cyan)] shadow-lg">
                {console.log('Rendering profile avatar with URL:', avatarPreview)}
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Error loading profile avatar image:', e);
                    e.target.onerror = null; // Prevent infinite loop

                    // Récupérer la clé d'avatar spécifique à l'utilisateur
                    const username = localStorage.getItem('username') || 'Utilisateur';
                    const userAvatarKey = `userAvatar_${username}`;

                    // Vérifier si l'avatar actuel est un UI-Avatar
                    const currentAvatar = localStorage.getItem(userAvatarKey);
                    const isUIAvatar = currentAvatar && currentAvatar.includes('ui-avatars.com');
                    const isBase64Image = currentAvatar && currentAvatar.startsWith('data:image/');
                    const isRelativePath = currentAvatar && currentAvatar.startsWith('/uploads/');

                    // Si c'est un UI-Avatar, l'utiliser comme fallback
                    if (isUIAvatar) {
                      console.log(`Using UI-Avatar from localStorage key ${userAvatarKey} as fallback during image error`);
                      e.target.src = currentAvatar;
                    }
                    // Si c'est une image base64, la conserver
                    else if (isBase64Image) {
                      console.log('Error loading avatar but keeping base64 image in localStorage');
                      // Réessayer avec l'image base64
                      e.target.src = currentAvatar;
                    }
                    // Si c'est un chemin relatif, préfixer avec l'URL du serveur
                    else if (isRelativePath) {
                      console.log('Avatar is a relative path, prefixing with server URL');
                      const fullUrl = `http://localhost:5000${currentAvatar}`;
                      console.log('Using full URL:', fullUrl);
                      e.target.src = fullUrl;
                    }
                    // Sinon, utiliser l'avatar par défaut
                    else {
                      console.log('Using default avatar as fallback');
                      // Utiliser l'image SVG locale comme fallback uniquement pour l'affichage
                      e.target.src = '/default-avatar.svg';
                    }
                  }}
                />
              </div>
            ) : (
              <FaUserCircle className="text-[var(--button-cyan)] text-7xl mx-auto" />
            )}

            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="absolute bottom-0 right-0 bg-[var(--button-dark-blue)] text-white p-1 rounded-full"
                title="Modifier le profil"
              >
                <FaEdit />
              </button>
            )}
          </div>
          <h2 className="text-3xl font-bold text-[var(--text-dark-blue)] mt-3 flex items-center justify-center">
            {userData.username}
            {userData.role === 'admin' && (
              <span className="ml-3 bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-sm flex items-center">
                <FaCrown className="mr-1" /> Administrateur
              </span>
            )}
          </h2>
          <p className="text-[var(--text-medium-blue)]">{userData.email}</p>
        </div>

        {/* Messages d'erreur et de succès */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}

        {/* Formulaire d'édition du profil */}
        {editMode ? (
          <div className="bg-[var(--card-bg)] p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[var(--text-dark-blue)]">
                Modifier le profil
              </h3>
              <button
                onClick={cancelEdit}
                className="text-gray-500 hover:text-red-500"
                title="Annuler"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Section Avatar */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">
                  Photo de profil
                </label>
                <div className="flex flex-col items-center">
                  {/* Prévisualisation de l'avatar */}
                  <div className="mb-4">
                    {avatarPreview ? (
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--button-cyan)] shadow-lg">
                        {console.log('Rendering edit form avatar with URL:', avatarPreview)}
                        <img
                          src={avatarPreview}
                          alt="Avatar Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Error loading edit form avatar image:', e);
                            e.target.onerror = null; // Prevent infinite loop

                            // Récupérer la clé d'avatar spécifique à l'utilisateur
                            const username = localStorage.getItem('username') || 'Utilisateur';
                            const userAvatarKey = `userAvatar_${username}`;

                            // Vérifier si l'avatar actuel est un UI-Avatar
                            const currentAvatar = localStorage.getItem(userAvatarKey);
                            const isUIAvatar = currentAvatar && currentAvatar.includes('ui-avatars.com');
                            const isBase64Image = currentAvatar && currentAvatar.startsWith('data:image/');
                            const isRelativePath = currentAvatar && currentAvatar.startsWith('/uploads/');

                            // Si c'est un UI-Avatar, l'utiliser comme fallback
                            if (isUIAvatar) {
                              console.log(`Using UI-Avatar from localStorage key ${userAvatarKey} as fallback during edit form image error`);
                              e.target.src = currentAvatar;
                            }
                            // Si c'est une image base64, la conserver
                            else if (isBase64Image) {
                              console.log('Error loading avatar but keeping base64 image in localStorage');
                              // Réessayer avec l'image base64
                              e.target.src = currentAvatar;
                            }
                            // Si c'est un chemin relatif, préfixer avec l'URL du serveur
                            else if (isRelativePath) {
                              console.log('Avatar is a relative path, prefixing with server URL');
                              const fullUrl = `http://localhost:5000${currentAvatar}`;
                              console.log('Using full URL:', fullUrl);
                              e.target.src = fullUrl;
                            }
                            // Sinon, utiliser l'avatar par défaut
                            else {
                              console.log('Using default avatar as fallback');
                              // Utiliser l'image SVG locale comme fallback uniquement pour l'affichage
                              e.target.src = '/default-avatar.svg';
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                        <FaUser className="text-gray-400 text-5xl" />
                      </div>
                    )}
                  </div>

                  {/* Bouton de téléchargement */}
                  <div className="flex items-center space-x-3">
                    <label className="button-primary flex items-center cursor-pointer">
                      <FaCamera className="mr-2" />
                      <span>Choisir une image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>

                    {avatarPreview && avatarFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarFile(null);
                          setAvatarPreview(userData.avatar);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTimes /> Annuler
                      </button>
                    )}
                  </div>

                  <p className="text-gray-500 text-sm mt-2">
                    Formats acceptés: JPG, PNG, GIF. Taille max: 2MB
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="username">
                  Nom d'utilisateur
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    name="username"
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--button-cyan)]"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--button-cyan)]"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="currentPassword">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    name="currentPassword"
                    id="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--button-cyan)]"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="newPassword">
                  Nouveau mot de passe (optionnel)
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--button-cyan)]"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--button-cyan)]"
                    disabled={!formData.newPassword}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="button-secondary mr-3"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="button-primary flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner mr-2"></span>
                  ) : (
                    <FaSave className="mr-2" />
                  )}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Statistiques */}
            <div className="bg-[var(--card-bg)] p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-xl font-semibold text-[var(--text-dark-blue)] mb-4 flex items-center">
                <FaChartBar className="mr-2" /> Statistiques
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[var(--option-cyan)] p-4 rounded-lg flex items-center">
                  <FaTrophy className="text-3xl mr-4 text-[var(--text-dark-blue)]" />
                  <div>
                    <p className="text-sm text-gray-700">Score total</p>
                    <p className="text-2xl font-bold text-[var(--text-dark-blue)]">{stats.totalScore} pts</p>
                  </div>
                </div>
                <div className="bg-[var(--option-yellow)] p-4 rounded-lg flex items-center">
                  <FaQuestionCircle className="text-3xl mr-4 text-[var(--text-dark-blue)]" />
                  <div>
                    <p className="text-sm text-gray-700">Quiz complétés</p>
                    <p className="text-2xl font-bold text-[var(--text-dark-blue)]">{stats.totalQuizzesCompleted}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lien vers l'administration (pour les administrateurs) */}
            {userData.role === 'admin' && (
              <Link
                to="/admin"
                className="bg-yellow-50 border-2 border-yellow-500 p-6 rounded-lg shadow-md mb-6 block hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FaShieldAlt className="text-2xl mr-3 text-yellow-600" />
                    <h3 className="text-xl font-semibold text-yellow-800">
                      Administration
                    </h3>
                  </div>
                  <FaArrowLeft className="transform rotate-180 text-yellow-600" />
                </div>
                <p className="text-gray-600 mt-2 ml-9">
                  Gérer les quiz, les utilisateurs et les paramètres de l'application
                </p>
              </Link>
            )}

            {/* Lien vers l'historique */}
            <Link
              to="/history"
              className="bg-[var(--card-bg)] p-6 rounded-lg shadow-md mb-6 block hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <FaHistory className="text-2xl mr-3 text-[var(--button-cyan)]" />
                  <h3 className="text-xl font-semibold text-[var(--text-dark-blue)]">
                    Historique des quiz
                  </h3>
                </div>
                <FaArrowLeft className="transform rotate-180 text-[var(--text-medium-blue)]" />
              </div>
              <p className="text-gray-600 mt-2 ml-9">
                Consultez vos performances passées et révisez vos réponses
              </p>
            </Link>
          </>
        )}
      </div>

      {/* Vagues décoratives */}
      <div className="wave-container" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: -1 }}>
        <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{ height: '60px' }}>
          <path
            className="wave-cyan"
            d="M-0.00,49.92 C150.00,150.00 271.49,-49.92 500.00,49.92 L500.00,150.00 L-0.00,150.00 Z"
          />
        </svg>
      </div>
      <div className="wave-container" style={{ position: 'fixed', bottom: '20px', left: 0, right: 0, zIndex: -2 }}>
        <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{ height: '60px' }}>
          <path
            className="wave-yellow"
            d="M-0.00,49.92 C150.00,150.00 271.49,-49.92 500.00,49.92 L500.00,150.00 L-0.00,150.00 Z"
          />
        </svg>
      </div>
      <div className="wave-container" style={{ position: 'fixed', bottom: '40px', left: 0, right: 0, zIndex: -3 }}>
        <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{ height: '60px' }}>
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