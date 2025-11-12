import React from 'react';
import { X } from 'lucide-react';
import './TermsModal.css';

const TermsModal = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  const handleAccept = () => {
    onAccept();
    onClose();
  };

  return (
    <div className="terms-modal-overlay" onClick={onClose}>
      <div className="terms-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="terms-modal-header">
          <h2 className="terms-modal-title">Terms & Conditions</h2>
          <button className="terms-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="terms-modal-content">
          <div className="terms-section">
            <h3>1. Acceptance of Terms</h3>
            <p>
              By creating an account and using WasteWise, you agree to comply with and be bound by 
              these Terms and Conditions. If you do not agree to these terms, please do not use our services.
            </p>
          </div>

          <div className="terms-section">
            <h3>2. User Responsibilities</h3>
            <p>As a user of WasteWise, you agree to:</p>
            <ul>
              <li>Provide accurate and truthful information during registration</li>
              <li>Maintain the security of your account credentials</li>
              <li>Use the platform in compliance with all applicable laws and regulations</li>
              <li>Properly segregate waste according to provided guidelines</li>
              <li>Be present at the scheduled pickup time and location</li>
              <li>Not misuse the reward or points system</li>
            </ul>
          </div>

          <div className="terms-section">
            <h3>3. Waste Collection Services</h3>
            <p>
              WasteWise facilitates waste collection services. We reserve the right to refuse 
              collection of hazardous or prohibited materials. Collection schedules are subject 
              to availability and may be rescheduled due to unforeseen circumstances.
            </p>
          </div>

          <div className="terms-section">
            <h3>4. Privacy & Data Protection</h3>
            <p>
              We are committed to protecting your privacy. Your personal information will be 
              collected, stored, and used in accordance with our Privacy Policy. We will not 
              share your information with third parties without your consent, except as required by law.
            </p>
          </div>

          <div className="terms-section">
            <h3>5. Rewards & Points System</h3>
            <p>
              Points earned through the platform can be redeemed for rewards as specified. 
              Points have no cash value and cannot be transferred. We reserve the right to 
              modify the rewards program at any time.
            </p>
          </div>

          <div className="terms-section">
            <h3>6. Account Termination</h3>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms 
              or engage in fraudulent activities. Users may delete their accounts at any time 
              through account settings.
            </p>
          </div>

          <div className="terms-section">
            <h3>7. Limitation of Liability</h3>
            <p>
              WasteWise is not liable for any indirect, incidental, or consequential damages 
              arising from the use of our services. Our total liability shall not exceed the 
              amount paid by you for our services, if any.
            </p>
          </div>

          <div className="terms-section">
            <h3>8. Changes to Terms</h3>
            <p>
              We reserve the right to modify these Terms and Conditions at any time. Users 
              will be notified of significant changes, and continued use of the platform 
              constitutes acceptance of the updated terms.
            </p>
          </div>

          <div className="terms-section">
            <h3>9. Governing Law</h3>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with 
              the laws of India. Any disputes shall be subject to the exclusive jurisdiction 
              of the courts in [Your City/State].
            </p>
          </div>

          <div className="terms-section">
            <h3>10. Contact Information</h3>
            <p>
              For questions about these Terms and Conditions, please contact us at:
            </p>
            <ul>
              <li>Email: support@wastewise.com</li>
              <li>Phone: +91 1800-123-456</li>
              <li>Address: WasteWise Headquarters, Green City, India</li>
            </ul>
          </div>

          <div className="terms-footer-note">
            <p><strong>Last Updated:</strong> November 2024</p>
            <p>
              By clicking "I Agree" below, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms and Conditions.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="terms-modal-footer">
          <button className="terms-btn decline-btn" onClick={onClose}>
            Decline
          </button>
          <button className="terms-btn accept-btn" onClick={handleAccept}>
            I Agree to Terms & Conditions
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;