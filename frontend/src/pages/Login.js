import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    const wasRemembered = localStorage.getItem('rememberMe') === 'true';

    if (wasRemembered && savedEmail) {
      setFormData({
        email: savedEmail,
        password: savedPassword || ''
      });
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData);
      setLoading(false);

      if (result.success && result.data) {
        // Handle Remember Me
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
          localStorage.setItem('rememberedPassword', formData.password);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberedPassword');
          localStorage.removeItem('rememberMe');
        }

        // Save token and userType in localStorage
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('userType', result.data.userType);

        // Redirect based on userType
        if (result.data.userType === 'citizen') {
          navigate('/citizen/dashboard');
        } else if (result.data.userType === 'industry') {
          navigate('/industry/dashboard');
        } else if (result.data.userType === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login Error:', err);
      setLoading(false);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="login-wrapper">
      {/* Left Side - Login Form */}
      <div className="login-left">
        <div className="login-content">
          <div className="logo-section">
            <div className="logo-icon">♻️</div>
            <h1 className="logo-text">WasteWise</h1>
          </div>

          <div className="login-form-container">
            <h2 className="form-title">Log in to your account</h2>
            <p className="form-subtitle">
              Don't have an account?{' '}
              <Link to="/register" className="signup-link">Sign Up</Link>
            </p>

            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-divider">
                <span>Or with email and password</span>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="abc@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                  />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Logging in...
                  </>
                ) : (
                  'Log In'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Image Only */}
      <div className="login-right">
        <img 
          src="/green_earth.jpg" 
          alt="Green Earth - Sustainable Future" 
          className="background-image"
        />
      </div>
    </div>
  );
};

export default Login;