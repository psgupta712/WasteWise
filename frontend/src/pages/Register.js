import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TermsModal from '../components/TermsModal';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: ''
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    if (!formData.userType) {
      setError('Please select a user type');
      return;
    }
    setStep(2);
    setError('');
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  // Handle checkbox click - allow normal check/uncheck
  const handleTermsCheckboxChange = (e) => {
    setTermsAccepted(e.target.checked);
  };

  // Handle terms link click - open modal
  const handleTermsLinkClick = (e) => {
    e.preventDefault();
    setShowTermsModal(true);
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    setShowTermsModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check if terms are accepted
    if (!termsAccepted) {
      setError('You must agree to the Terms & Conditions to continue');
      setShowTermsModal(true);
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      userType: formData.userType
    });

    setLoading(false);

    if (result.success) {
      setShowSuccessModal(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
  };

  const getUserTypeLabel = (type) => {
    switch(type) {
      case 'citizen': return 'Citizen';
      case 'industry': return 'Industry';
      case 'pickup_agent': return 'PickUp Agent';
      default: return '';
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        <div className="register-content">
          <div className="logo-section">
            <div className="logo-icon">♻️</div>
            <h1 className="logo-text">WasteWise</h1>
          </div>

          <div className="register-form-container">
            {step === 1 ? (
              <>
                <h2 className="form-title">Create your account</h2>
                <p className="form-subtitle">Sign up as a</p>

                {error && (
                  <div className="alert alert-error">
                    <span className="alert-icon">⚠️</span>
                    {error}
                  </div>
                )}

                <div className="user-type-section">
                  <div className="form-group">
                    <label htmlFor="userType">Select User Type</label>
                    <select
                      id="userType"
                      name="userType"
                      value={formData.userType}
                      onChange={handleChange}
                      className="user-type-dropdown"
                      required
                    >
                      <option value="">-- Select User Type --</option>
                      <option value="citizen">Citizen</option>
                      <option value="industry">Industry</option>
                      <option value="pickup_agent">PickUp Agent</option>
                    </select>
                  </div>
                </div>

                <button type="button" className="btn-register" onClick={handleNext}>
                  Next
                </button>

                <p className="form-subtitle" style={{ marginTop: '24px' }}>
                  Already have an account? <Link to="/login" className="signin-link">Log In</Link>
                </p>
              </>
            ) : (
              <>
                <h2 className="form-title">Complete your details</h2>
                <p className="form-subtitle">
                  Signing up as <strong>{getUserTypeLabel(formData.userType)}</strong>
                </p>

                {error && (
                  <div className="alert alert-error">
                    <span className="alert-icon">⚠️</span>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="register-form">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      autoComplete="name"
                    />
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
                      autoComplete="new-password"
                      minLength="6"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                      autoComplete="new-password"
                      minLength="6"
                    />
                  </div>

                  <div className="form-terms">
                    <label className="terms-checkbox">
                      <input 
                        type="checkbox" 
                        checked={termsAccepted}
                        onChange={handleTermsCheckboxChange}
                      />
                      <span>
                        I agree to the{' '}
                        <button 
                          type="button"
                          className="terms-link"
                          onClick={handleTermsLinkClick}
                        >
                          Terms & Conditions
                        </button>
                      </span>
                    </label>
                    {termsAccepted && (
                      <span className="terms-accepted-badge">✓ Terms Accepted</span>
                    )}
                  </div>

                  <div className="button-group">
                    <button type="button" className="btn-back" onClick={handleBack}>
                      Back
                    </button>
                    <button type="submit" className="btn-register" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner"></span>
                          Creating Account...
                        </>
                      ) : (
                        'Sign Up'
                      )}
                    </button>
                  </div>
                </form>

                <p className="form-subtitle" style={{ marginTop: '24px' }}>
                  Already have an account? <Link to="/login" className="signin-link">Log In</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      <TermsModal 
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleAcceptTerms}
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon">✓</div>
            <h2 className="modal-title">Account Created!</h2>
            <p className="modal-text">
              Your account has been successfully created.<br />
              Redirecting to login...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;