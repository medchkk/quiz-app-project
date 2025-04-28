/**
 * Utilitaire de logging pour le frontend
 * Permet de désactiver facilement les logs en production
 */

// Niveau de log (0: aucun, 1: erreurs, 2: avertissements, 3: info, 4: debug)
// En Vite, on utilise import.meta.env au lieu de process.env
const LOG_LEVEL = import.meta.env.PROD ? 1 : 4;

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
  const formattedMessage = `[${level.toUpperCase()}][${module}] ${message}`;

  // Logger avec la fonction appropriée
  switch (level) {
    case 'error':
      console.error(formattedMessage, data);
      break;
    case 'warn':
      console.warn(formattedMessage, data);
      break;
    case 'info':
      console.info(formattedMessage, data);
      break;
    case 'debug':
      console.debug(formattedMessage, data);
      break;
    default:
      console.log(formattedMessage, data);
  }
};

// Fonctions d'aide pour chaque niveau de log
export const logError = (module, message, data = null) => log('error', module, message, data);
export const logWarn = (module, message, data = null) => log('warn', module, message, data);
export const logInfo = (module, message, data = null) => log('info', module, message, data);
export const logDebug = (module, message, data = null) => log('debug', module, message, data);

// Fonction par défaut
export default {
  error: logError,
  warn: logWarn,
  info: logInfo,
  debug: logDebug
};
