import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Dashboard Pages
import CitizenDashboard from './pages/CitizenDashboard';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is trying to access correct dashboard
  if (userType !== 'citizen') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ===============================
// App Component
// ===============================
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* ---------- PUBLIC ROUTES ---------- */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* ---------- PROTECTED ROUTES ---------- */}
          <Route 
            path="/citizen/dashboard" 
            element={
              <ProtectedRoute>
                <CitizenDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* ---------- FALLBACK ---------- */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;