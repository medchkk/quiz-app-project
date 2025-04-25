import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaCheckCircle } from 'react-icons/fa'; // Icônes pour les champs et le message de succès
import axios from 'axios';
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
      // Étape 1: Inscription
      await axios.post('http://localhost:5000/auth/register', formData);
      setSuccess('Inscription réussie ! Connexion automatique...');
      setError('');

      // Étape 2: Connexion automatique
      try {
        const loginResponse = await axios.post('http://localhost:5000/auth/login', {
          email: formData.email,
          password: formData.password
        });

        const token = loginResponse.data.token;
        localStorage.setItem('token', token);

        // Étape 3: Récupérer les informations du profil utilisateur
        try {
          const userResponse = await axios.get('http://localhost:5000/users/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          // Stocker les informations utilisateur dans le localStorage
          const username = userResponse.data.username;
          localStorage.setItem('username', username);
          localStorage.setItem('email', userResponse.data.email);

          // Créer une clé spécifique à l'utilisateur pour l'avatar
          const userAvatarKey = `userAvatar_${username}`;
          console.log(`Register: Using avatar key: ${userAvatarKey} for user: ${username}`);

          // Stocker la clé de l'avatar actuel
          localStorage.setItem('currentAvatarKey', userAvatarKey);

          // Si l'utilisateur a un avatar dans la réponse API, le stocker
          if (userResponse.data.avatar) {
            console.log('Register: Using avatar from API response');
            // Vérifier si l'avatar est une image base64 ou une URL
            if (userResponse.data.avatar.startsWith('data:image/')) {
              console.log('Register: Avatar is a base64 image');
            } else {
              console.log('Register: Avatar is a URL');
            }
            localStorage.setItem(userAvatarKey, userResponse.data.avatar);
          }

          console.log('Register: User profile data loaded successfully');

          // Rediriger vers la page d'accueil
          setTimeout(() => navigate('/'), 1000);
          return;
        } catch (profileError) {
          console.error('Error fetching user profile after registration:', profileError);
          // Continuer même en cas d'erreur
        }

        // Si on arrive ici, c'est que la récupération du profil a échoué
        // mais on a quand même le token, donc on redirige vers la page d'accueil
        setTimeout(() => navigate('/'), 1000);
        return;
      } catch (loginError) {
        console.error('Error logging in after registration:', loginError);
        // En cas d'erreur de connexion, rediriger vers la page de connexion
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
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