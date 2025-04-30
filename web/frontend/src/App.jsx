import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import ProfilePage from './pages/ProfilePage';
import HistoryPage from './pages/HistoryPage';
import Topics from './pages/Topics';
import PlayQuiz from './pages/PlayQuiz';
import AdminDashboard from './pages/admin/Dashboard';
import QuizManagement from './pages/admin/QuizManagement';
import QuizForm from './pages/admin/QuizForm';
import UserManagement from './pages/admin/UserManagement';
import ImportExport from './pages/admin/ImportExport';
import AdminRoute from './components/AdminRoute';
import { ThemeProvider } from './contexts/ThemeContext';
import { cleanLocalStorage } from './utils/cleanLocalStorage';
import './styles/admin.css';

/**
 * Composant principal de l'application
 */
function App() {
  // Initialisation de l'application - exécutée une seule fois au démarrage
  useEffect(() => {
    // Clé pour s'assurer que l'initialisation n'est exécutée qu'une seule fois
    const INIT_KEY = 'app_initialized';

    // Vérifier si l'application a déjà été initialisée
    if (localStorage.getItem(INIT_KEY)) {
      console.log('App already initialized, skipping initialization');
      return;
    }

    console.log('App started - performing one-time initialization');

    // Nettoyer le localStorage
    cleanLocalStorage();

    // Marquer l'initialisation comme terminée
    localStorage.setItem(INIT_KEY, Date.now().toString());
  }, []);

  return (
    <ThemeProvider>
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

          {/* Routes d'administration */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/quizzes" element={<AdminRoute><QuizManagement /></AdminRoute>} />
          <Route path="/admin/quizzes/:quizId" element={<AdminRoute><QuizForm /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
          <Route path="/admin/import-export" element={<AdminRoute><ImportExport /></AdminRoute>} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;