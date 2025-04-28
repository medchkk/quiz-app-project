import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const PWAUpdateNotification = () => {
  const [showNotification, setShowNotification] = useState(false);
  
  // Enregistrement du service worker avec la fonction de mise à jour
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
    onOfflineReady() {
      console.log('App ready to work offline');
    },
  });

  // Afficher la notification lorsqu'une mise à jour est disponible
  useEffect(() => {
    if (needRefresh) {
      setShowNotification(true);
    }
  }, [needRefresh]);

  // Fonction pour mettre à jour l'application
  const handleUpdate = () => {
    updateServiceWorker(true);
    setShowNotification(false);
  };

  // Fonction pour ignorer la mise à jour
  const handleClose = () => {
    setNeedRefresh(false);
    setShowNotification(false);
  };

  if (!showNotification) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-0 right-0 mx-auto max-w-md bg-[var(--card-bg)] p-4 rounded-lg shadow-lg z-50 flex flex-col items-center">
      <p className="text-[var(--text-dark-blue)] mb-3">
        Une nouvelle version de l'application est disponible !
      </p>
      <div className="flex space-x-4">
        <button
          onClick={handleUpdate}
          className="button-primary"
        >
          Mettre à jour
        </button>
        <button
          onClick={handleClose}
          className="button-nav"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
};

export default PWAUpdateNotification;
