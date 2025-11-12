import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

// Create Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      
      // Save token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
      
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message || 'Registration failed');
      return { success: false, error: err.message };
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);
      
      // Save token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
      
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message || 'Login failed');
      return { success: false, error: err.message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Values to be shared across app
  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;