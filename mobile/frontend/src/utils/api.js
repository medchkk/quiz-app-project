import axios from 'axios';
import {
  generateLetterAvatar,
  getUserAvatar,
  saveUserAvatar
} from './avatarUtils';
import * as offlineLogic from './offlineLogic';

// Configuration de l'API
const API_URL = 'http://localhost:5000';

// Créer une instance axios pour la compatibilité
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Initialiser la base de données IndexedDB
offlineLogic.initDB().catch(error => {
  console.error('Error initializing IndexedDB:', error);
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // S'assurer que l'objet headers existe
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour rediriger les appels API vers la logique hors-ligne
api.interceptors.request.use(
  async (config) => {
    try {
      console.log(`Offline mode: Intercepting ${config.method ? config.method.toUpperCase() : 'UNKNOWN'} ${config.url}`);

      // Extraire l'ID de l'utilisateur du token ou du localStorage
      const userId = localStorage.getItem('userId');

      // Gérer les différents endpoints
      if (config.url.startsWith('/quizzes')) {
        // GET /quizzes - Liste des quizzes
        if (config.method === 'get' && config.url === '/quizzes') {
          const quizzes = await offlineLogic.getQuizzes();
          throw {
            response: {
              status: 200,
              data: quizzes,
              config
            }
          };
        }

        // GET /quizzes/:id - Détails d'un quiz
        if (config.method === 'get' && config.url.match(/^\/quizzes\/[^\/]+$/)) {
          const quizId = config.url.split('/').pop();
          const quiz = await offlineLogic.getQuizById(quizId);
          throw {
            response: {
              status: 200,
              data: quiz,
              config
            }
          };
        }

        // POST /quizzes/:id - Soumettre un quiz
        if (config.method === 'post' && config.url.match(/^\/quizzes\/[^\/]+$/)) {
          const quizId = config.url.split('/').pop();
          const answers = config.data.answers;
          const result = await offlineLogic.submitQuiz(quizId, userId, answers);
          throw {
            response: {
              status: 200,
              data: result,
              config
            }
          };
        }

        // GET /quizzes/submission/:id - Détails d'une soumission
        if (config.method === 'get' && config.url.match(/^\/quizzes\/submission\/[^\/]+$/)) {
          const submissionId = config.url.split('/').pop();
          const submission = await offlineLogic.getSubmissionDetails(submissionId);
          throw {
            response: {
              status: 200,
              data: submission,
              config
            }
          };
        }
      }

      // Endpoints utilisateur
      if (config.url.startsWith('/users')) {
        // GET /users/profile - Profil utilisateur
        if (config.method === 'get' && config.url === '/users/profile') {
          if (!userId) {
            throw {
              response: {
                status: 401,
                data: { message: 'Unauthorized' },
                config
              }
            };
          }

          const profile = await offlineLogic.getUserProfile(userId);

          // Si pas d'avatar, en générer un
          if (!profile.avatar) {
            profile.avatar = generateLetterAvatar(profile.username);
            await offlineLogic.updateUserProfile(userId, { avatar: profile.avatar });
          }

          throw {
            response: {
              status: 200,
              data: profile,
              config
            }
          };
        }

        // PUT /users/profile - Mise à jour du profil
        if (config.method === 'put' && config.url === '/users/profile') {
          if (!userId) {
            throw {
              response: {
                status: 401,
                data: { message: 'Unauthorized' },
                config
              }
            };
          }

          let profileData = {};

          // Si la requête contient un FormData
          if (config.data instanceof FormData) {
            profileData.username = config.data.get('username');

            // Traiter l'avatar si présent
            const avatarFile = config.data.get('avatar');
            if (avatarFile) {
              // Convertir le fichier en base64
              const reader = new FileReader();
              const avatarBase64 = await new Promise((resolve) => {
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(avatarFile);
              });

              profileData.avatar = avatarBase64;
            }
          } else if (config.data) {
            // Si c'est un objet JSON
            profileData = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
          }

          const updatedProfile = await offlineLogic.updateUserProfile(userId, profileData);

          throw {
            response: {
              status: 200,
              data: {
                message: 'Profil mis à jour avec succès',
                avatarUrl: updatedProfile.avatar
              },
              config
            }
          };
        }

        // GET /users/stats - Statistiques utilisateur
        if (config.method === 'get' && config.url === '/users/stats') {
          if (!userId) {
            throw {
              response: {
                status: 401,
                data: { message: 'Unauthorized' },
                config
              }
            };
          }

          const stats = await offlineLogic.getUserStats(userId);
          throw {
            response: {
              status: 200,
              data: stats,
              config
            }
          };
        }

        // GET /users/submissions - Soumissions utilisateur
        if (config.method === 'get' && config.url === '/users/submissions') {
          if (!userId) {
            throw {
              response: {
                status: 401,
                data: { message: 'Unauthorized' },
                config
              }
            };
          }

          const submissions = await offlineLogic.getUserSubmissions(userId);
          throw {
            response: {
              status: 200,
              data: submissions,
              config
            }
          };
        }
      }

      // Endpoints d'authentification
      if (config.url.startsWith('/auth')) {
        // POST /auth/register - Inscription
        if (config.method === 'post' && config.url === '/auth/register') {
          const { email, password, username } = config.data;

          // Hasher le mot de passe (à implémenter avec bcryptjs)
          // Pour l'instant, utiliser le mot de passe en clair
          const hashedPassword = password;

          await offlineLogic.registerUser({
            email,
            password: hashedPassword,
            username
          });

          throw {
            response: {
              status: 201,
              data: { message: 'User registered successfully' },
              config
            }
          };
        }

        // POST /auth/login - Connexion
        if (config.method === 'post' && config.url === '/auth/login') {
          const { email, password } = config.data;
          const { token, user } = await offlineLogic.login(email, password);

          throw {
            response: {
              status: 200,
              data: { token },
              config
            }
          };
        }
      }

      // Si on arrive ici, c'est que l'endpoint n'est pas géré
      console.log(`Endpoint not handled in offline mode: ${config.method.toUpperCase()} ${config.url}`);
      return config;
    } catch (error) {
      if (error.response) {
        return Promise.resolve(error.response);
      }
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Vérifier si l'erreur a une réponse
    if (!error.response) {
      console.error('Network error or server not responding:', error.message);

      // Essayer de récupérer les informations de la requête
      if (error.config) {
        const { url, method, data } = error.config;
        console.log(`Attempting to handle offline: ${method ? method.toUpperCase() : 'UNKNOWN'} ${url || 'unknown-url'}`);

        try {
          // Extraire l'ID de l'utilisateur du localStorage
          const userId = localStorage.getItem('userId');

          // Gérer les différents endpoints en mode hors-ligne
          // GET /users/profile - Profil utilisateur
          if (method === 'get' && url === '/users/profile') {
            console.log('Handling offline GET /users/profile');

            // Récupérer les informations depuis le localStorage
            const username = localStorage.getItem('username') || 'Utilisateur';
            const email = localStorage.getItem('email') || 'user@example.com';

            // Récupérer l'avatar
            const { avatarUrl, isExternal } = getUserAvatar(username);

            // Si l'avatar est externe ou inexistant, générer un nouvel avatar
            let avatar = avatarUrl;
            if (!avatar || isExternal) {
              avatar = generateLetterAvatar(username);
              saveUserAvatar(username, avatar);
            }

            return Promise.resolve({
              data: {
                username,
                email,
                avatar
              },
              status: 200,
              statusText: 'OK',
              headers: {},
              config: error.config
            });
          }

          // PUT /users/profile - Mise à jour du profil
          if (method === 'put' && url === '/users/profile') {
            console.log('Handling offline PUT /users/profile');

            // Récupérer l'avatar depuis le localStorage
            const username = localStorage.getItem('username') || 'Utilisateur';
            const { avatarUrl } = getUserAvatar(username);

            return Promise.resolve({
              data: {
                message: 'Profil mis à jour avec succès',
                avatarUrl: avatarUrl
              },
              status: 200,
              statusText: 'OK',
              headers: {},
              config: error.config
            });
          }
        } catch (offlineError) {
          console.error('Error in offline handling:', offlineError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;