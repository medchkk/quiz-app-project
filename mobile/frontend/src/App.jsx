import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import ProfilePage from './pages/ProfilePage';
import HistoryPage from './pages/HistoryPage';
import Topics from './pages/Topics';
import PlayQuiz from './pages/PlayQuiz';
import PWAUpdateNotification from './components/PWAUpdateNotification';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { cleanLocalStorage } from './utils/cleanLocalStorage';
import * as offlineLogic from './utils/offlineLogic';
import * as storage from './utils/storage';
import { migrateData } from './utils/migrateToPersistence';

/**
 * Composant principal de l'application
 */
function App() {
  // État pour suivre l'initialisation de l'application
  const [isInitialized, setIsInitialized] = useState(false);

  // Clé pour s'assurer que l'initialisation n'est exécutée qu'une seule fois
  const INIT_KEY = 'app_initialized';

  // Initialisation de l'application - exécutée une seule fois au démarrage
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Vérifier si l'application a déjà été initialisée
        const initValue = await storage.getItem(INIT_KEY);
        if (initValue) {
          console.log('App already initialized, skipping initialization');
          setIsInitialized(true);
          return;
        }

        console.log('App started - performing one-time initialization');

        // Migrer les données existantes de localStorage vers le nouveau système de stockage
        await migrateData();

        // Nettoyer le localStorage
        cleanLocalStorage();

        // Initialiser la base de données IndexedDB
        await offlineLogic.initDB();
        console.log('IndexedDB initialized successfully');

        // Initialiser les données de quiz
        await offlineLogic.initializeQuizzes();

        // Initialiser les utilisateurs de test
        await offlineLogic.initializeUsers();

        // Marquer l'application comme initialisée
        await storage.setItem(INIT_KEY, Date.now().toString());

        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing app:', error);
        // En cas d'erreur, on considère quand même l'app comme initialisée pour éviter de bloquer l'utilisateur
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-[var(--bg-light)]">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/quiz/:id" element={<Quiz />} />
            <Route path="/results" element={<Results />} />
            <Route path="/submission/:submissionId" element={<Results />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/topics" element={<Topics />} />
            <Route path="/play" element={<PlayQuiz />} />
          </Routes>
          <PWAUpdateNotification />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;