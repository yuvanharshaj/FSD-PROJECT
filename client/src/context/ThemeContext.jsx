import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

// Theme provider managing light and dark mode state and HTML class toggling
export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('smartpark_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('smartpark_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('smartpark_theme', 'light');
    }
  }, [isDark]);

  // Toggle between dark and light themes
  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to consume theme context
export const useTheme = () => useContext(ThemeContext);
