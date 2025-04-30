import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Composant de route protégée pour les administrateurs
 * Redirige vers la page de connexion si l'utilisateur n'est pas connecté
 * ou n'a pas les droits d'administrateur
 */
const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        
        // Vérifier si l'utilisateur est un administrateur
        const response = await axios.get(`${API_URL}/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Si la requête réussit, l'utilisateur est un administrateur
        setIsAdmin(true);
        setLoading(false);
      } catch (error) {
        console.error('Error verifying admin status:', error);
        setIsAdmin(false);
        setLoading(false);
      }
    };
    
    verifyAdmin();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;
