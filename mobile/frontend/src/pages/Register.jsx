import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaCheckCircle } from 'react-icons/fa'; // Icônes pour les champs et le message de succès
import api from '../utils/api';
import * as offlineLogic from '../utils/offlineLogic';
import ThemeToggle from '../components/ThemeToggle';


function Register() {
  const [formData, setFormData] = useState({ email: '', password: '', username: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

      // Étape 1: Inscription
      const { email, password, username } = formData;

      // Hasher le mot de passe (à implémenter avec bcryptjs)
      // Pour l'instant, utiliser le mot de passe en clair
      const hashedPassword = password;

      // Enregistrer l'utilisateur
      const user = await offlineLogic.registerUser({
        email,
        password: hashedPassword,
        username
      });

      setSuccess('Inscription réussie ! Connexion automatique...');
      setError('');

      // Étape 2: Connexion automatique
      try {
        const { token, user: loggedInUser } = await offlineLogic.login(email, hashedPassword);

        // Stocker le token et l'ID utilisateur
        localStorage.setItem('token', token);
        localStorage.setItem('userId', loggedInUser._id);

        // Stocker les informations utilisateur dans le localStorage
        localStorage.setItem('username', loggedInUser.username);
        localStorage.setItem('email', loggedInUser.email);

        // Créer une clé spécifique à l'utilisateur pour l'avatar
        const userAvatarKey = `userAvatar_${loggedInUser.username}`;
        console.log(`Register: Using avatar key: ${userAvatarKey} for user: ${loggedInUser.username}`);

        // Stocker la clé de l'avatar actuel
        localStorage.setItem('currentAvatarKey', userAvatarKey);

        // Générer un avatar par défaut
        console.log('Register: Generating default avatar');
        const firstLetter = loggedInUser.username.charAt(0).toUpperCase();
        const defaultAvatar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%230D8ABC"/><text x="50%" y="50%" font-size="100" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold" dominant-baseline="middle">${firstLetter}</text></svg>`;
        localStorage.setItem(userAvatarKey, defaultAvatar);

        // Mettre à jour le profil utilisateur avec cet avatar
        await offlineLogic.updateUserProfile(loggedInUser._id, { avatar: defaultAvatar });

        console.log('Register: User registered and logged in successfully');

        // Rediriger vers la page d'accueil
        setTimeout(() => navigate('/'), 1000);
      } catch (loginError) {
        console.error('Error logging in after registration:', loginError);
        // En cas d'erreur de connexion, rediriger vers la page de connexion
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Erreur lors de l\'inscription');
      setSuccess('');
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
          <h2 className="text-2xl font-bold text-center text-[var(--text-dark-blue)] mb-6">Inscription</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {success && (
            <p className="text-green-500 text-center mb-4 flex items-center justify-center">
              <FaCheckCircle className="mr-2" /> {success}
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="username">Nom d'utilisateur</label>
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
              <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
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
              {loading ? <div className="spinner" /> : "S'inscrire"}
            </button>
          </form>
          <p className="text-center mt-4 text-gray-600">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-[var(--text-medium-blue)] hover:underline">
              Se connecter
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

export default Register;