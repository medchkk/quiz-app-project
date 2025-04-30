import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminNav from '../../components/AdminNav';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ImportExport = () => {
  const [importData, setImportData] = useState('');
  const [exportData, setExportData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importResults, setImportResults] = useState(null);

  const handleImportChange = (e) => {
    setImportData(e.target.value);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        setImportData(content);
      } catch (error) {
        setError('Erreur lors de la lecture du fichier');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setImportResults(null);

      // Valider le JSON
      let quizzes;
      try {
        quizzes = JSON.parse(importData);
        if (!Array.isArray(quizzes)) {
          quizzes = [quizzes]; // Si c'est un seul objet, le mettre dans un tableau
        }
      } catch (jsonError) {
        setError('Format JSON invalide');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vous devez être connecté pour effectuer cette action');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_URL}/admin/import/quizzes`,
        { quizzes },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setImportResults(response.data);
      setSuccess(`Importation terminée : ${response.data.imported} quiz importés sur ${response.data.total}`);
      setLoading(false);
    } catch (error) {
      console.error('Error importing quizzes:', error);
      setError(error.response?.data?.message || 'Une erreur est survenue lors de l\'importation');
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vous devez être connecté pour effectuer cette action');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/admin/export/quizzes`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setExportData(JSON.stringify(response.data, null, 2));
      setSuccess('Exportation réussie');
      setLoading(false);
    } catch (error) {
      console.error('Error exporting quizzes:', error);
      setError(error.response?.data?.message || 'Une erreur est survenue lors de l\'exportation');
      setLoading(false);
    }
  };

  const downloadExport = () => {
    if (!exportData) return;

    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-light)] flex flex-col md:flex-row">
      <AdminNav />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--text-dark-blue)]">Import / Export</h1>
          </div>

        {error && (
          <div className="bg-[var(--wave-pink)] bg-opacity-10 border-l-4 border-[var(--wave-pink)] text-[var(--wave-pink)] p-4 mb-6 rounded-r-md" role="alert">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-[var(--button-cyan)] bg-opacity-10 border-l-4 border-[var(--button-cyan)] text-[var(--button-cyan)] p-4 mb-6 rounded-r-md" role="alert">
            <p>{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Import */}
          <div className="bg-[var(--card-bg)] rounded-lg shadow-md p-6 border-t-4 border-[var(--wave-yellow)]">
            <h2 className="text-xl font-semibold text-[var(--text-dark-blue)] mb-4">Importer des quiz</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-dark-blue)] mb-2">
                Importer depuis un fichier JSON
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--button-cyan)] bg-[var(--card-bg)] text-[var(--text-color)]"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-dark-blue)] mb-2">
                Ou coller le JSON directement
              </label>
              <textarea
                value={importData}
                onChange={handleImportChange}
                rows="10"
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--button-cyan)] bg-[var(--card-bg)] text-[var(--text-color)]"
                placeholder='[{"title": "Mon Quiz", "category": "Histoire", "questions": [...]}]'
              ></textarea>
            </div>

            <button
              onClick={handleImport}
              disabled={loading || !importData}
              className="w-full bg-[var(--wave-yellow)] hover:opacity-90 text-[var(--text-dark-blue)] font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Importation en cours...' : 'Importer'}
            </button>

            {importResults && (
              <div className="mt-4 animate-fade-in">
                <h3 className="text-md font-medium text-[var(--text-dark-blue)] mb-2">Résultats de l'importation</h3>
                <div className="bg-[var(--button-dark-blue)] bg-opacity-5 p-4 rounded-md">
                  <p className="text-[var(--text-color)]">Total: <span className="font-semibold">{importResults.total}</span></p>
                  <p className="text-[var(--text-color)]">Importés: <span className="font-semibold text-[var(--button-cyan)]">{importResults.imported}</span></p>
                  <p className="text-[var(--text-color)]">Erreurs: <span className="font-semibold text-[var(--wave-pink)]">{importResults.errors.length}</span></p>

                  {importResults.errors.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-[var(--wave-pink)] mb-1">Détails des erreurs:</h4>
                      <ul className="text-sm text-[var(--wave-pink)] list-disc pl-5">
                        {importResults.errors.map((error, index) => (
                          <li key={index}>
                            {error.quiz}: {error.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Export */}
          <div className="bg-[var(--card-bg)] rounded-lg shadow-md p-6 border-t-4 border-[var(--button-cyan)]">
            <h2 className="text-xl font-semibold text-[var(--text-dark-blue)] mb-4">Exporter des quiz</h2>

            <div className="mb-4">
              <button
                onClick={handleExport}
                disabled={loading}
                className="w-full bg-[var(--button-cyan)] hover:bg-[var(--button-medium-blue)] text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 mb-4"
              >
                {loading ? 'Exportation en cours...' : 'Exporter tous les quiz'}
              </button>

              {exportData && (
                <div className="animate-fade-in">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-[var(--text-dark-blue)]">
                      Données exportées
                    </label>
                    <button
                      onClick={downloadExport}
                      className="text-sm text-[var(--button-cyan)] hover:text-[var(--button-medium-blue)] transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Télécharger
                    </button>
                  </div>
                  <textarea
                    value={exportData}
                    readOnly
                    rows="10"
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md bg-[var(--button-dark-blue)] bg-opacity-5 text-[var(--text-color)]"
                  ></textarea>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lien de retour */}
        <div className="mt-8">
          <Link to="/admin" className="text-[var(--button-cyan)] hover:text-[var(--button-medium-blue)] transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Retour au tableau de bord
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ImportExport;
