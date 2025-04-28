import React, { useState, useEffect, useRef } from 'react';
import { FaClock } from 'react-icons/fa';

// Durée du timer en secondes
const TIMER_DURATION = 10;

const QuizTimer = ({ onTimeExpired, isActive }) => {
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const timerRef = useRef(null);

  // Effet pour réinitialiser le timer quand il devient actif
  useEffect(() => {
    if (isActive) {
      setTimeLeft(TIMER_DURATION);
    }
  }, [isActive]);

  // Référence pour suivre si onTimeExpired a déjà été appelé
  const hasExpiredRef = useRef(false);

  // Effet séparé pour gérer le timer
  useEffect(() => {
    // Si le timer n'est pas actif, ne rien faire
    if (!isActive) {
      // Réinitialiser le flag lorsque le timer est désactivé
      hasExpiredRef.current = false;
      return;
    }

    // Démarrer le timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          // Arrêter le timer quand il atteint 0
          clearInterval(timerRef.current);

          // Vérifier si onTimeExpired a déjà été appelé pour cette session de timer
          if (!hasExpiredRef.current) {
            hasExpiredRef.current = true;

            // Utiliser setTimeout pour éviter l'erreur de mise à jour pendant le rendu
            setTimeout(() => {
              onTimeExpired();
            }, 0);
          }

          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Nettoyer le timer lors du démontage ou quand isActive change
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, onTimeExpired]);

  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center bg-[var(--button-dark-blue)] px-3 py-1 rounded-full mb-1">
        <FaClock className="text-white mr-2" />
        <span className={`text-white font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : ''}`}>
          {timeLeft}s
        </span>
      </div>
      <div className="w-24 h-2 bg-gray-300 rounded-full overflow-hidden">
        <div
          className={`h-full ${timeLeft <= 10 ? 'bg-red-500' : 'bg-green-500'}`}
          style={{ width: `${(timeLeft / TIMER_DURATION) * 100}%`, transition: 'width 1s linear' }}
        ></div>
      </div>
    </div>
  );
};

export default QuizTimer;
