import { Preferences } from '@capacitor/preferences';

const useNative = !!window.Capacitor;

export const setItem = async (k, v) => {
  const value = JSON.stringify(v);
  return useNative 
    ? await Preferences.set({ key: k, value }) 
    : localStorage.setItem(k, value);
};

export const getItem = async (k) => {
  if (useNative) {
    const result = await Preferences.get({ key: k });
    return result.value ? JSON.parse(result.value) : null;
  } else {
    const value = localStorage.getItem(k);
    return value ? JSON.parse(value) : null;
  }
};

export const removeItem = async (k) => {
  return useNative 
    ? await Preferences.remove({ key: k }) 
    : localStorage.removeItem(k);
};

export const clear = async () => {
  return useNative 
    ? await Preferences.clear() 
    : localStorage.clear();
};

export const keys = async () => {
  if (useNative) {
    const { keys } = await Preferences.keys();
    return keys;
  } else {
    return Object.keys(localStorage);
  }
};

// Fonction utilitaire pour migrer les données existantes de localStorage vers Preferences
export const migrateFromLocalStorage = async () => {
  if (useNative) {
    const localStorageKeys = Object.keys(localStorage);
    for (const key of localStorageKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        await Preferences.set({ key, value });
      }
    }
    console.log('Migration from localStorage to Preferences completed');
  }
};
