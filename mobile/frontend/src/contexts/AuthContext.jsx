import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import * as offlineLogic from '../utils/offlineLogic';
import * as storage from '../utils/storage';

// Créer le contexte d'authentification
export const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Fournisseur du contexte d'authentification
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Initialiser la base de données et vérifier l'authentification au chargement
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initialiser la base de données
        await offlineLogic.initDB();

        // Vérifier si un utilisateur est déjà connecté
        const token = await storage.getItem('token');
        const userId = await storage.getItem('userId');

        if (token && userId) {
          try {
            // Récupérer le profil de l'utilisateur
            const user = await offlineLogic.getUserProfile(userId);
            setCurrentUser(user);
          } catch (error) {
            console.error('Error loading user profile:', error);
            // En cas d'erreur, déconnecter l'utilisateur
            await storage.removeItem('token');
            await storage.removeItem('userId');
            setCurrentUser(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setError('Erreur lors de l\'initialisation de l\'authentification');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Fonction d'inscription
  const register = async (email, password, username) => {
    try {
      setLoading(true);
      setError('');

      // Hasher le mot de passe (à implémenter avec bcryptjs)
      // Pour l'instant, utiliser le mot de passe en clair
      const hashedPassword = password;

      // Enregistrer l'utilisateur
      const user = await offlineLogic.registerUser({
        email,
        password: hashedPassword,
        username
      });

      // Connecter automatiquement l'utilisateur
      const { token } = await offlineLogic.login(email, hashedPassword);

      // Stocker les informations d'authentification
      await storage.setItem('token', token);
      await storage.setItem('userId', user._id);
      await storage.setItem('username', user.username);
      await storage.setItem('email', user.email);

      // Mettre à jour l'état
      setCurrentUser(user);

      return user;
    } catch (error) {
      console.error('Error registering user:', error);
      setError(error.message || 'Erreur lors de l\'inscription');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError('');

      // Authentifier l'utilisateur
      const { user, token } = await offlineLogic.login(email, password);

      // Stocker les informations d'authentification
      await storage.setItem('token', token);
      await storage.setItem('userId', user._id);
      await storage.setItem('username', user.username);
      await storage.setItem('email', user.email);

      // Mettre à jour l'état
      setCurrentUser(user);

      return user;
    } catch (error) {
      console.error('Error logging in:', error);
      setError(error.message || 'Erreur lors de la connexion');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      // Supprimer les informations d'authentification
      await storage.removeItem('token');
      await storage.removeItem('userId');

      // Conserver certaines informations comme le nom d'utilisateur et l'email
      // pour faciliter la reconnexion

      // Mettre à jour l'état
      setCurrentUser(null);

      // Rediriger vers la page de connexion
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Fonction de mise à jour du profil
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError('');

      if (!currentUser) {
        throw new Error('Utilisateur non connecté');
      }

      // Mettre à jour le profil
      const updatedUser = await offlineLogic.updateUserProfile(currentUser._id, profileData);

      // Mettre à jour l'état
      setCurrentUser(updatedUser);

      // Mettre à jour le nom d'utilisateur dans le storage si nécessaire
      if (profileData.username) {
        await storage.setItem('username', profileData.username);
      }

      return updatedUser;
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Erreur lors de la mise à jour du profil');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Valeur du contexte
  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
