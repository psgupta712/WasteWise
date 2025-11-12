import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './ResetPassword.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validToken, setValidToken] = useState(true);

  useEffect(() => {
    // Check if token exists
    if (!token) {
      setValidToken(false);
      setError('Invalid reset link');
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password. The link may have expired.');
        setValidToken(false);
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!validToken && !success) {
    return (
      <div className="reset-password-wrapper">
        <div className="reset-password-container">
          <div className="reset-password-content">
            <div className="logo-section">
              <div className="logo-icon">♻️</div>
              <h1 className="logo-text">WasteWise</h1>
            </div>

            <div className="reset-password-form-container">
              <div className="error-icon">⚠️</div>
              <h2 className="form-title">Invalid Reset Link</h2>
              <p className="form-subtitle">
                This password reset link is invalid or has expired. Please request a new one.
              </p>

              <Link to="/forgot-password" className="btn-reset">
                Request New Reset Link
              </Link>

              <div className="back-to-login">
                <Link to="/login" className="back-link">
                  ← Back to Log In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-wrapper">
      <div className="reset-password-container">
        <div className="reset-password-content">
          <div className="logo-section">
            <div className="logo-icon">♻️</div>
            <h1 className="logo-text">WasteWise</h1>
          </div>

          <div className="reset-password-form-container">
            {!success ? (
              <>
                <h2 className="form-title">Reset Your Password</h2>
                <p className="form-subtitle">
                  Enter your new password below.
                </p>

                {error && (
                  <div className="alert alert-error">
                    <span className="alert-icon">⚠️</span>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="reset-password-form">
                  <div className="form-group">
                    <label htmlFor="password">New Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      required
                      autoComplete="new-password"
                      minLength="6"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      required
                      autoComplete="new-password"
                      minLength="6"
                    />
                  </div>

                  <button type="submit" className="btn-reset" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Resetting Password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>

                <div className="back-to-login">
                  <Link to="/login" className="back-link">
                    ← Back to Log In
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="success-icon">✓</div>
                <h2 className="form-title">Password Reset Successful!</h2>
                <p className="form-subtitle">
                  Your password has been successfully reset. You can now log in with your new password.
                </p>
                <p className="redirect-message">
                  Redirecting to login page in 3 seconds...
                </p>

                <Link to="/login" className="btn-reset">
                  Go to Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;