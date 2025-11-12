import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Call forgot password API
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(data.message || 'Failed to send reset link. Please try again.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-wrapper">
      <div className="forgot-password-container">
        <div className="forgot-password-content">
          <div className="logo-section">
            <div className="logo-icon">♻️</div>
            <h1 className="logo-text">WasteWise</h1>
          </div>

          <div className="forgot-password-form-container">
            {!success ? (
              <>
                <h2 className="form-title">Forgot Password?</h2>
                <p className="form-subtitle">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                {error && (
                  <div className="alert alert-error">
                    <span className="alert-icon">⚠️</span>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="forgot-password-form">
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="abc@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <button type="submit" className="btn-reset" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Sending Reset Link...
                      </>
                    ) : (
                      'Send Reset Link'
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
                <div className="success-icon1">✓</div>
                <h2 className="form-title">Check Your Email</h2>
                <p className="form-subtitle">
                  We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
                </p>

                <div className="success-actions">
                  <Link to="/login" className="btn-reset">
                    Back to Log In
                  </Link>
                  <button 
                    type="button" 
                    className="btn-resend"
                    onClick={() => setSuccess(false)}
                  >
                    Resend Link
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;