import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminNav from '../../components/AdminNav';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    quizCount: 0,
    submissionCount: 0,
    averageScore: 0,
    quizzesByCategory: {},
    submissionsByDay: {},
    scoreDistribution: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Options pour les graphiques
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--text-dark-blue)'
        }
      },
      title: {
        display: true,
        color: 'var(--text-dark-blue)'
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'var(--text-medium-blue)'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        ticks: {
          color: 'var(--text-medium-blue)'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Vous devez être connecté pour accéder à cette page');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Récupérer les données de base
        const baseStats = response.data;

        // Si l'API ne renvoie pas encore les données pour les graphiques, générer des données de test
        if (!baseStats.quizzesByCategory) {
          // Données de test pour les graphiques
          baseStats.quizzesByCategory = {
            'Histoire': 5,
            'Sciences': 8,
            'Géographie': 3,
            'Culture': 6,
            'Sport': 4,
            'Musique': 7
          };

          baseStats.submissionsByDay = {
            'Lundi': 12,
            'Mardi': 18,
            'Mercredi': 25,
            'Jeudi': 15,
            'Vendredi': 22,
            'Samedi': 30,
            'Dimanche': 10
          };

          baseStats.scoreDistribution = {
            '0-20': 5,
            '21-40': 12,
            '41-60': 25,
            '61-80': 35,
            '81-100': 18
          };
        }

        setStats(baseStats);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        setError(error.response?.data?.message || 'Une erreur est survenue lors du chargement des statistiques');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[var(--bg-light)]">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[var(--bg-light)]">
        <div className="bg-[var(--card-bg)] p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-[var(--wave-pink)] mb-4">Erreur</h2>
          <p className="text-[var(--text-color)] mb-4">{error}</p>
          <Link to="/" className="block text-center bg-[var(--button-cyan)] hover:bg-[var(--button-medium-blue)] text-white font-bold py-2 px-4 rounded">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-light)] flex flex-col md:flex-row">
      <AdminNav />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-[var(--text-dark-blue)] mb-8">Tableau de bord administrateur</h1>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[var(--card-bg)] rounded-lg shadow-md p-6 border-t-4 border-[var(--button-cyan)]">
            <h2 className="text-lg font-semibold text-[var(--text-dark-blue)] mb-2">Utilisateurs</h2>
            <p className="text-3xl font-bold text-[var(--button-cyan)]">{stats.userCount}</p>
          </div>

          <div className="bg-[var(--card-bg)] rounded-lg shadow-md p-6 border-t-4 border-[var(--wave-yellow)]">
            <h2 className="text-lg font-semibold text-[var(--text-dark-blue)] mb-2">Quiz</h2>
            <p className="text-3xl font-bold text-[var(--wave-yellow)]">{stats.quizCount}</p>
          </div>

          <div className="bg-[var(--card-bg)] rounded-lg shadow-md p-6 border-t-4 border-[var(--wave-pink)]">
            <h2 className="text-lg font-semibold text-[var(--text-dark-blue)] mb-2">Soumissions</h2>
            <p className="text-3xl font-bold text-[var(--wave-pink)]">{stats.submissionCount}</p>
          </div>

          <div className="bg-[var(--card-bg)] rounded-lg shadow-md p-6 border-t-4 border-[var(--button-medium-blue)]">
            <h2 className="text-lg font-semibold text-[var(--text-dark-blue)] mb-2">Score moyen</h2>
            <p className="text-3xl font-bold text-[var(--button-medium-blue)]">{stats.averageScore}</p>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Graphique des quiz par catégorie */}
          <div className="bg-[var(--card-bg)] rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-[var(--text-dark-blue)] mb-4">Quiz par catégorie</h2>
            <div className="h-64">
              <Bar
                data={{
                  labels: Object.keys(stats.quizzesByCategory || {}),
                  datasets: [
                    {
                      label: 'Nombre de quiz',
                      data: Object.values(stats.quizzesByCategory || {}),
                      backgroundColor: [
                        'rgba(13, 138, 188, 0.6)', // --button-cyan
                        'rgba(255, 170, 51, 0.6)', // --wave-yellow
                        'rgba(255, 110, 199, 0.6)', // --wave-pink
                        'rgba(0, 87, 146, 0.6)', // --button-medium-blue
                        'rgba(99, 102, 241, 0.6)', // Indigo
                        'rgba(16, 185, 129, 0.6)', // Emerald
                      ],
                      borderColor: [
                        'rgba(13, 138, 188, 1)',
                        'rgba(255, 170, 51, 1)',
                        'rgba(255, 110, 199, 1)',
                        'rgba(0, 87, 146, 1)',
                        'rgba(99, 102, 241, 1)',
                        'rgba(16, 185, 129, 1)',
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      ...chartOptions.plugins.title,
                      text: 'Répartition des quiz par catégorie'
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Graphique des soumissions par jour */}
          <div className="bg-[var(--card-bg)] rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-[var(--text-dark-blue)] mb-4">Activité par jour</h2>
            <div className="h-64">
              <Line
                data={{
                  labels: Object.keys(stats.submissionsByDay || {}),
                  datasets: [
                    {
                      label: 'Soumissions',
                      data: Object.values(stats.submissionsByDay || {}),
                      backgroundColor: 'rgba(13, 138, 188, 0.2)',
                      borderColor: 'rgba(13, 138, 188, 1)',
                      borderWidth: 2,
                      tension: 0.3,
                      fill: true,
                    },
                  ],
                }}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      ...chartOptions.plugins.title,
                      text: 'Soumissions par jour de la semaine'
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Graphique de distribution des scores */}
          <div className="bg-[var(--card-bg)] rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-[var(--text-dark-blue)] mb-4">Distribution des scores</h2>
            <div className="h-64">
              <Pie
                data={{
                  labels: Object.keys(stats.scoreDistribution || {}),
                  datasets: [
                    {
                      label: 'Utilisateurs',
                      data: Object.values(stats.scoreDistribution || {}),
                      backgroundColor: [
                        'rgba(255, 110, 199, 0.6)', // --wave-pink
                        'rgba(255, 170, 51, 0.6)', // --wave-yellow
                        'rgba(13, 138, 188, 0.6)', // --button-cyan
                        'rgba(0, 87, 146, 0.6)', // --button-medium-blue
                        'rgba(99, 102, 241, 0.6)', // Indigo
                      ],
                      borderColor: [
                        'rgba(255, 110, 199, 1)',
                        'rgba(255, 170, 51, 1)',
                        'rgba(13, 138, 188, 1)',
                        'rgba(0, 87, 146, 1)',
                        'rgba(99, 102, 241, 1)',
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        color: 'var(--text-dark-blue)'
                      }
                    },
                    title: {
                      display: true,
                      text: 'Distribution des scores (%)',
                      color: 'var(--text-dark-blue)'
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Liens rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/admin/quizzes" className="bg-[var(--card-bg)] rounded-lg shadow-md p-6 hover:shadow-lg transition-all hover:transform hover:scale-105">
            <h2 className="text-xl font-semibold text-[var(--text-dark-blue)] mb-2">Gestion des Quiz</h2>
            <p className="text-[var(--text-color)] mb-4">Créer, modifier et supprimer des quiz</p>
            <div className="flex justify-end">
              <span className="text-[var(--button-cyan)] font-medium">Accéder &rarr;</span>
            </div>
          </Link>

          <Link to="/admin/users" className="bg-[var(--card-bg)] rounded-lg shadow-md p-6 hover:shadow-lg transition-all hover:transform hover:scale-105">
            <h2 className="text-xl font-semibold text-[var(--text-dark-blue)] mb-2">Gestion des Utilisateurs</h2>
            <p className="text-[var(--text-color)] mb-4">Gérer les utilisateurs et leurs rôles</p>
            <div className="flex justify-end">
              <span className="text-[var(--button-cyan)] font-medium">Accéder &rarr;</span>
            </div>
          </Link>

          <Link to="/admin/import-export" className="bg-[var(--card-bg)] rounded-lg shadow-md p-6 hover:shadow-lg transition-all hover:transform hover:scale-105">
            <h2 className="text-xl font-semibold text-[var(--text-dark-blue)] mb-2">Import/Export</h2>
            <p className="text-[var(--text-color)] mb-4">Importer et exporter des données</p>
            <div className="flex justify-end">
              <span className="text-[var(--button-cyan)] font-medium">Accéder &rarr;</span>
            </div>
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
