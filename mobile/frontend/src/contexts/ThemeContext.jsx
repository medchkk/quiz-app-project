import { createContext, useState, useEffect, useContext } from 'react';
import * as storage from '../utils/storage';

// Create the theme context
export const ThemeContext = createContext();

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Check if user has a saved preference in storage, default to light
  const [darkMode, setDarkMode] = useState(false);

  // Load theme preference from storage on component mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await storage.getItem('theme');
        setDarkMode(savedTheme === 'dark');
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    loadTheme();
  }, []);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setDarkMode(prevMode => !prevMode);
  };

  // Update storage and apply theme class to HTML element when theme changes
  useEffect(() => {
    const updateTheme = async () => {
      try {
        // Save theme preference to storage
        await storage.setItem('theme', darkMode ? 'dark' : 'light');

        // Apply or remove dark class from the HTML element
        if (darkMode) {
          document.documentElement.classList.add('dark-theme');
        } else {
          document.documentElement.classList.remove('dark-theme');
        }
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    };

    updateTheme();
  }, [darkMode]);

  // Provide theme state and toggle function to children
  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
