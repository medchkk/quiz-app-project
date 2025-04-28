import * as storage from './storage';

// Fonction pour migrer les données de localStorage vers notre nouveau système de stockage
export const migrateData = async () => {
  try {
    console.log('Starting data migration to persistent storage...');
    
    // Vérifier si la migration a déjà été effectuée
    const migrationDone = await storage.getItem('__migration_done');
    if (migrationDone) {
      console.log('Migration already completed, skipping...');
      return;
    }
    
    // Récupérer toutes les clés du localStorage
    const keys = Object.keys(localStorage);
    console.log(`Found ${keys.length} keys to migrate`);
    
    // Migrer chaque clé
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          // Essayer de parser la valeur comme JSON
          const parsedValue = JSON.parse(value);
          await storage.setItem(key, parsedValue);
          console.log(`Migrated key: ${key}`);
        } catch (e) {
          // Si ce n'est pas du JSON valide, stocker comme chaîne
          await storage.setItem(key, value);
          console.log(`Migrated key as string: ${key}`);
        }
      }
    }
    
    // Marquer la migration comme terminée
    await storage.setItem('__migration_done', true);
    console.log('Migration completed successfully');
    
    return true;
  } catch (error) {
    console.error('Error during data migration:', error);
    return false;
  }
};
