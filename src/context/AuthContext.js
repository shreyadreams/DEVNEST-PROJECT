import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// AUTH PROVIDER — Wraps entire app in App.js
// Holds logged-in user globally so any component can access it
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app start — if token exists in localStorage, auto-login the user
  useEffect(() => {
    const token = localStorage.getItem('devnest_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/auth/me')
        .then(res => setCurrentUser(res.data.user))
        .catch(() => localStorage.removeItem('devnest_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Save token + set user after login/register
  const login = (token, user) => {
    localStorage.setItem('devnest_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setCurrentUser(user);
  };

  // Clear everything on logout
  const logout = () => {
    localStorage.removeItem('devnest_token');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — use anywhere: const { currentUser, logout } = useAuth()
export const useAuth = () => useContext(AuthContext);
