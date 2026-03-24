import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => setIsDark(!isDark);

  // Colors jo poori app mein use honge
  const theme = {
  isDark,
  font: "'Poppins', sans-serif",
  bg: isDark ? '#080808' : '#f8f9fa',
    bgSecond:  isDark ? '#0f0f0f' : '#ffffff',
    bgThird:   isDark ? '#0a0a0a' : '#f1f3f5',
    border:    isDark ? '#1a1a1a' : '#e9ecef',
    borderHover: isDark ? '#2a2a2a' : '#dee2e6',
    text:      isDark ? '#ffffff' : '#111827',
    textMuted: isDark ? '#6b7280' : '#6b7280',
    textDim:   isDark ? '#4b5563' : '#9ca3af',
    sidebar:   isDark ? '#0a0a0a' : '#ffffff',
    sidebarBorder: isDark ? '#141414' : '#e9ecef',
    card:      isDark ? '#0f0f0f' : '#ffffff',
    accent:    '#22c55e',
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);