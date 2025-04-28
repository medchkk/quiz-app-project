import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa'; // Icônes pour email et mot de passe
import api from '../utils/api';
import * as offlineLogic from '../utils/offlineLogic';
import ThemeToggle from '../components/ThemeToggle';


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
      // Initialiser la base de données si ce n'est pas déjà fait
      await offlineLogic.initDB();

      // Étape 1: Connexion pour obtenir le token et les informations utilisateur
      const { email, password } = formData;
      const { token, user } = await offlineLogic.login(email, password);

      // Stocker le token et l'ID utilisateur
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user._id);

      // Stocker les informations utilisateur dans le localStorage
      localStorage.setItem('username', user.username);
      localStorage.setItem('email', user.email);

      // Créer une clé spécifique à l'utilisateur pour l'avatar
      const userAvatarKey = `userAvatar_${user.username}`;
      console.log(`Login: Using avatar key: ${userAvatarKey} for user: ${user.username}`);

      // Stocker la clé de l'avatar actuel
      localStorage.setItem('currentAvatarKey', userAvatarKey);

      // Si l'utilisateur a un avatar, le stocker
      if (user.avatar) {
        console.log('Login: Using avatar from user data');
        localStorage.setItem(userAvatarKey, user.avatar);
      } else {
        // Générer un avatar par défaut
        console.log('Login: Generating default avatar');
        const firstLetter = user.username.charAt(0).toUpperCase();
        const defaultAvatar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%230D8ABC"/><text x="50%" y="50%" font-size="100" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold" dominant-baseline="middle">${firstLetter}</text></svg>`;
        localStorage.setItem(userAvatarKey, defaultAvatar);

        // Mettre à jour le profil utilisateur avec cet avatar
        await offlineLogic.updateUserProfile(user._id, { avatar: defaultAvatar });
      }

      console.log('Login: User logged in successfully');
      setError('');
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Erreur lors de la connexion');
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