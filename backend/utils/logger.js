/**
 * Utilitaire de logging pour le backend
 * Permet de désactiver facilement les logs en production
 */

// Niveau de log (0: aucun, 1: erreurs, 2: avertissements, 3: info, 4: debug)
const LOG_LEVEL = process.env.NODE_ENV === 'production' ? 1 : 4;

/**
 * Fonction de log qui respecte le niveau de log configuré
 * @param {string} level - Niveau de log ('error', 'warn', 'info', 'debug')
 * @param {string} module - Nom du module qui génère le log
 * @param {string} message - Message à logger
 * @param {any} data - Données additionnelles à logger
 */
const log = (level, module, message, data = null) => {
  // Déterminer le niveau numérique du log
  let numericLevel;
  switch (level) {
    case 'error': numericLevel = 1; break;
    case 'warn': numericLevel = 2; break;
    case 'info': numericLevel = 3; break;
    case 'debug': numericLevel = 4; break;
    default: numericLevel = 4;
  }

  // Ne pas logger si le niveau est supérieur au niveau configuré
  if (numericLevel > LOG_LEVEL) return;

  // Formater le message
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}][${level.toUpperCase()}][${module}] ${message}`;

  // Logger avec la fonction appropriée
  switch (level) {
    case 'error':
      console.error(formattedMessage, data ? JSON.stringify(data) : '');
      break;
    case 'warn':
      console.warn(formattedMessage, data ? JSON.stringify(data) : '');
      break;
    case 'info':
      console.info(formattedMessage, data ? JSON.stringify(data) : '');
      break;
    case 'debug':
      console.debug(formattedMessage, data ? JSON.stringify(data) : '');
      break;
    default:
      console.log(formattedMessage, data ? JSON.stringify(data) : '');
  }
};

// Fonctions d'aide pour chaque niveau de log
exports.error = (module, message, data = null) => log('error', module, message, data);
exports.warn = (module, message, data = null) => log('warn', module, message, data);
exports.info = (module, message, data = null) => log('info', module, message, data);
exports.debug = (module, message, data = null) => log('debug', module, message, data);
