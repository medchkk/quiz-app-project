import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa'; // Icônes pour email et mot de passe
import axios from 'axios';
import ThemeToggle from '../components/ThemeToggle';
import { STORAGE_KEYS } from '../utils/constants';


function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // État pour gérer le chargement
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Étape 1: Connexion pour obtenir le token et les informations utilisateur
      const response = await axios.post('http://localhost:5000/auth/login', formData);
      const token = response.data.token;
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);

      // Si la réponse contient des informations utilisateur, les stocker
      if (response.data.user) {
        console.log('Login: User data received from login response');
        localStorage.setItem(STORAGE_KEYS.USERNAME, response.data.user.username);
        localStorage.setItem(STORAGE_KEYS.EMAIL, response.data.user.email);

        // Stocker le rôle de l'utilisateur
        if (response.data.user.role) {
          console.log(`Login: User role is "${response.data.user.role}"`);
          localStorage.setItem(STORAGE_KEYS.USER_ROLE, response.data.user.role);
          console.log(`Login: Role stored in localStorage: "${localStorage.getItem(STORAGE_KEYS.USER_ROLE)}"`);
        } else {
          console.log('Login: No role found in user data');
        }

        // Gérer l'avatar si présent
        if (response.data.user.avatar) {
          const username = response.data.user.username;
          const userAvatarKey = `${STORAGE_KEYS.AVATAR_PREFIX}${username}`;
          localStorage.setItem(STORAGE_KEYS.CURRENT_AVATAR_KEY, userAvatarKey);
          localStorage.setItem(userAvatarKey, response.data.user.avatar);
        }
      }

      // Étape 2: Récupérer les informations du profil utilisateur
      try {
        const userResponse = await axios.get('http://localhost:5000/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Stocker les informations utilisateur dans le localStorage
        const username = userResponse.data.username;
        localStorage.setItem(STORAGE_KEYS.USERNAME, username);
        localStorage.setItem(STORAGE_KEYS.EMAIL, userResponse.data.email);

        // Stocker le rôle de l'utilisateur s'il est présent
        if (userResponse.data.role) {
          console.log(`Profile: User role is "${userResponse.data.role}"`);
          localStorage.setItem(STORAGE_KEYS.USER_ROLE, userResponse.data.role);
          console.log(`Profile: Role stored in localStorage: "${localStorage.getItem(STORAGE_KEYS.USER_ROLE)}"`);
        } else {
          console.log('Profile: No role found in profile data');
        }

        // Afficher toutes les données du profil pour le débogage
        console.log('Profile data received:', userResponse.data);

        // Créer une clé spécifique à l'utilisateur pour l'avatar
        const userAvatarKey = `${STORAGE_KEYS.AVATAR_PREFIX}${username}`;
        console.log(`Login: Using avatar key: ${userAvatarKey} for user: ${username}`);

        // Stocker la clé de l'avatar actuel
        localStorage.setItem(STORAGE_KEYS.CURRENT_AVATAR_KEY, userAvatarKey);

        // Si l'utilisateur a un avatar dans la réponse API, le stocker
        if (userResponse.data.avatar) {
          console.log('Login: Using avatar from API response');
          // Vérifier si l'avatar est une image base64 ou une URL
          if (userResponse.data.avatar.startsWith('data:image/')) {
            console.log('Login: Avatar is a base64 image');
          } else {
            console.log('Login: Avatar is a URL');
          }
          localStorage.setItem(userAvatarKey, userResponse.data.avatar);
        }

        console.log('Login: User profile data loaded successfully');
      } catch (profileError) {
        console.error('Error fetching user profile after login:', profileError);
        // Continuer même en cas d'erreur pour ne pas bloquer la connexion
      }

      setError('');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-light)] p-6">
      <div className="max-w-md mx-auto pb-32"> {/* Padding-bottom pour les vagues */}
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <div className="bg-[var(--card-bg)] p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center text-[var(--text-dark-blue)] mb-6">Connexion</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
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
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="password">Mot de passe</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--button-cyan)]"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="button-primary w-full flex justify-center items-center"
              disabled={loading}
            >
              {loading ? <div className="spinner" /> : 'Se connecter'}
            </button>
          </form>
          <p className="text-center mt-4 text-gray-600">
            Pas de compte ?{' '}
            <Link to="/register" className="text-[var(--text-medium-blue)] hover:underline">
              S'inscrire
            </Link>
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
}

export default Login;