import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Send, AlertCircle, CheckCircle, 
  Clock, X, Search, Filter, Star, Phone,
  Mail, MapPin, FileText, Image as ImageIcon,
  ThumbsUp, ThumbsDown, MessageCircle
} from 'lucide-react';
import './FeedbackSystem.css';

const FeedbackSystem = () => {
  const [activeTab, setActiveTab] = useState('submit'); // submit, history, contact
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    type: '',
    subject: '',
    description: '',
    priority: 'medium',
    relatedPickupId: '',
    contactMethod: 'email'
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchFeedbacks();
    }
  }, [activeTab, filterStatus]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = filterStatus === 'all'
        ? 'http://localhost:5000/api/feedback/my-feedback'
        : `http://localhost:5000/api/feedback/my-feedback?status=${filterStatus}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data.data || []);
      } else {
        // Use mock data for demo
        setFeedbacks(generateMockFeedbacks());
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setFeedbacks(generateMockFeedbacks());
    } finally {
      setLoading(false);
    }
  };

  const generateMockFeedbacks = () => {
    return [
      {
        _id: '1',
        type: 'complaint',
        subject: 'Missed Pickup',
        description: 'Collection team did not arrive at scheduled time',
        status: 'pending',
        priority: 'high',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        response: null
      },
      {
        _id: '2',
        type: 'suggestion',
        subject: 'Add More Time Slots',
        description: 'Would love to have evening pickups after 6 PM',
        status: 'resolved',
        priority: 'low',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        response: 'Thank you for the suggestion! We are considering adding more time slots.',
        resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ];
  };

  const feedbackTypes = [
    { value: 'complaint', label: 'Complaint', icon: '⚠️', color: '#f44336' },
    { value: 'suggestion', label: 'Suggestion', icon: '💡', color: '#2196f3' },
    { value: 'praise', label: 'Praise', icon: '⭐', color: '#4caf50' },
    { value: 'query', label: 'Query', icon: '❓', color: '#ff9800' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low', color: '#4caf50' },
    { value: 'medium', label: 'Medium', color: '#ff9800' },
    { value: 'high', label: 'High', color: '#f44336' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.type || !formData.subject || !formData.description) {
      alert('Please fill all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({
          type: '',
          subject: '',
          description: '',
          priority: 'medium',
          relatedPickupId: '',
          contactMethod: 'email'
        });

        setTimeout(() => {
          setSubmitSuccess(false);
          setActiveTab('history');
        }, 2000);
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Submit feedback error:', error);
      alert('Error submitting feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: <Clock size={16} />, label: 'Pending', color: '#ff9800' },
      in_review: { icon: <MessageCircle size={16} />, label: 'In Review', color: '#2196f3' },
      resolved: { icon: <CheckCircle size={16} />, label: 'Resolved', color: '#4caf50' },
      closed: { icon: <X size={16} />, label: 'Closed', color: '#666' }
    };

    const badge = badges[status] || badges.pending;

    return (
      <div className="status-badge" style={{ background: badge.color }}>
        {badge.icon}
        <span>{badge.label}</span>
      </div>
    );
  };

  const getTypeIcon = (type) => {
    const typeObj = feedbackTypes.find(t => t.value === type);
    return typeObj ? typeObj.icon : '📝';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = feedback.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         feedback.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="feedback-container">
      {/* Header */}
      <div className="feedback-header">
        <div className="header-content">
          <h2 className="feedback-title">
            <MessageSquare size={28} />
            Feedback & Support
          </h2>
          <p className="feedback-subtitle">
            We're here to help! Share your feedback or report issues.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="feedback-tabs">
        <button
          className={`tab-btn ${activeTab === 'submit' ? 'active' : ''}`}
          onClick={() => setActiveTab('submit')}
        >
          <Send size={18} />
          Submit Feedback
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FileText size={18} />
          My Feedback
        </button>
        <button
          className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          <Phone size={18} />
          Contact Us
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Submit Feedback Tab */}
        {activeTab === 'submit' && (
          <div className="submit-section">
            {submitSuccess && (
              <div className="success-message">
                <CheckCircle size={24} />
                <div>
                  <h4>Feedback Submitted Successfully!</h4>
                  <p>We'll review your feedback and get back to you soon.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="feedback-form">
              {/* Feedback Type */}
              <div className="form-section">
                <label className="section-label">
                  <MessageSquare size={20} />
                  What would you like to share?
                </label>
                <div className="type-grid">
                  {feedbackTypes.map((type) => (
                    <div
                      key={type.value}
                      className={`type-card ${formData.type === type.value ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                      style={{ borderColor: formData.type === type.value ? type.color : '#e9ecef' }}
                    >
                      <span className="type-icon">{type.icon}</span>
                      <span className="type-label">{type.label}</span>
                      {formData.type === type.value && (
                        <CheckCircle size={18} className="check-icon" style={{ color: type.color }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="form-section">
                <label className="section-label">
                  <FileText size={20} />
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Brief description of your feedback..."
                  className="text-input"
                  required
                />
              </div>

              {/* Description */}
              <div className="form-section">
                <label className="section-label">
                  <MessageCircle size={20} />
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide detailed information about your feedback..."
                  rows="6"
                  className="textarea-input"
                  required
                />
              </div>

              {/* Priority & Contact */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">Priority Level</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="select-input"
                  >
                    {priorityLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="contactMethod">Preferred Contact</label>
                  <select
                    id="contactMethod"
                    name="contactMethod"
                    value={formData.contactMethod}
                    onChange={handleInputChange}
                    className="select-input"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="app">In-App Notification</option>
                  </select>
                </div>
              </div>

              {/* Related Pickup (Optional) */}
              <div className="form-section">
                <label className="section-label">
                  <MapPin size={20} />
                  Related Pickup ID (Optional)
                </label>
                <input
                  type="text"
                  name="relatedPickupId"
                  value={formData.relatedPickupId}
                  onChange={handleInputChange}
                  placeholder="Enter pickup ID if this is related to a specific pickup..."
                  className="text-input"
                />
              </div>

              {/* Submit Button */}
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="spinner-small"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Submit Feedback
                  </>
                )}
              </button>
            </form>

            {/* Quick Tips */}
            <div className="tips-section">
              <h4>💡 Tips for Better Support</h4>
              <ul>
                <li>Be specific and provide as much detail as possible</li>
                <li>Include pickup IDs or dates for faster resolution</li>
                <li>Choose the correct feedback type for proper routing</li>
                <li>For urgent issues, mark priority as "High"</li>
              </ul>
            </div>
          </div>
        )}

        {/* My Feedback Tab */}
        {activeTab === 'history' && (
          <div className="history-section">
            {/* Search & Filter */}
            <div className="controls-bar">
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search feedback..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-buttons">
                <Filter size={18} />
                {['all', 'pending', 'in_review', 'resolved'].map((status) => (
                  <button
                    key={status}
                    className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                    onClick={() => setFilterStatus(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback List */}
            {loading ? (
              <div className="loading-state">
                <div className="spinner-large"></div>
                <p>Loading feedback...</p>
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="empty-state">
                <MessageSquare size={64} className="empty-icon" />
                <h3>No Feedback Found</h3>
                <p>You haven't submitted any feedback yet.</p>
                <button 
                  className="action-btn"
                  onClick={() => setActiveTab('submit')}
                >
                  Submit Your First Feedback
                </button>
              </div>
            ) : (
              <div className="feedback-list">
                {filteredFeedbacks.map((feedback) => (
                  <div 
                    key={feedback._id} 
                    className="feedback-card"
                    onClick={() => {
                      setSelectedFeedback(feedback);
                      setShowDetailModal(true);
                    }}
                  >
                    <div className="feedback-header-row">
                      <div className="feedback-type">
                        <span className="type-icon">{getTypeIcon(feedback.type)}</span>
                        <span className="type-text">{feedback.type}</span>
                      </div>
                      {getStatusBadge(feedback.status)}
                    </div>

                    <h4 className="feedback-subject">{feedback.subject}</h4>
                    <p className="feedback-description">{feedback.description}</p>

                    <div className="feedback-footer">
                      <span className="feedback-date">
                        <Clock size={14} />
                        {formatDate(feedback.createdAt)}
                      </span>
                      {feedback.response && (
                        <span className="has-response">
                          <MessageCircle size={14} />
                          Response Available
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contact Us Tab */}
        {activeTab === 'contact' && (
          <div className="contact-section">
            <div className="contact-grid">
              <div className="contact-card">
                <div className="contact-icon">
                  <Phone size={32} />
                </div>
                <h3>Call Us</h3>
                <p>Available 24/7 for urgent support</p>
                <a href="tel:+911800123456" className="contact-link">
                  +91 1800-123-456
                </a>
              </div>

              <div className="contact-card">
                <div className="contact-icon">
                  <Mail size={32} />
                </div>
                <h3>Email Us</h3>
                <p>Get response within 24 hours</p>
                <a href="mailto:support@wastewise.com" className="contact-link">
                  support@wastewise.com
                </a>
              </div>

              <div className="contact-card">
                <div className="contact-icon">
                  <MessageSquare size={32} />
                </div>
                <h3>Live Chat</h3>
                <p>Chat with our support team</p>
                <button className="contact-link-btn">
                  Start Chat
                </button>
              </div>
            </div>

            <div className="faq-section">
              <h3>Frequently Asked Questions</h3>
              <div className="faq-list">
                <details className="faq-item">
                  <summary>How do I schedule a pickup?</summary>
                  <p>Go to the "Schedule Pickup" tab, select your waste type, choose a date and time slot, and provide your address. You'll receive a confirmation within 30 minutes.</p>
                </details>

                <details className="faq-item">
                  <summary>What types of waste do you collect?</summary>
                  <p>We collect Biodegradable waste, Recyclable materials, E-waste, and Hazardous waste. Each type has specific disposal guidelines available in the Waste Guide.</p>
                </details>

                <details className="faq-item">
                  <summary>How do I earn reward points?</summary>
                  <p>You earn points by scheduling pickups, completing collections, and achieving milestones. Points can be redeemed for eco-friendly rewards and discounts.</p>
                </details>

                <details className="faq-item">
                  <summary>What if the collector doesn't show up?</summary>
                  <p>If your scheduled pickup is missed, please submit a complaint through the Feedback section with your pickup ID. We'll reschedule immediately and compensate you with bonus points.</p>
                </details>

                <details className="faq-item">
                  <summary>How can I track my environmental impact?</summary>
                  <p>Your Profile shows total waste recycled, CO₂ saved, and trees equivalent. You can also see your contribution on the community leaderboard in the Rewards section.</p>
                </details>
              </div>
            </div>

            <div className="support-hours">
              <h4>Support Hours</h4>
              <div className="hours-grid">
                <div className="hour-item">
                  <strong>Phone Support:</strong>
                  <span>24/7 Available</span>
                </div>
                <div className="hour-item">
                  <strong>Email Support:</strong>
                  <span>Response within 24 hours</span>
                </div>
                <div className="hour-item">
                  <strong>Live Chat:</strong>
                  <span>Mon-Sat, 9 AM - 9 PM</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedFeedback && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Feedback Details</h3>
              <button 
                className="close-btn"
                onClick={() => setShowDetailModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value">
                  {getTypeIcon(selectedFeedback.type)} {selectedFeedback.type}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Status:</span>
                {getStatusBadge(selectedFeedback.status)}
              </div>

              <div className="detail-row">
                <span className="detail-label">Subject:</span>
                <span className="detail-value">{selectedFeedback.subject}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Description:</span>
                <p className="detail-description">{selectedFeedback.description}</p>
              </div>

              <div className="detail-row">
                <span className="detail-label">Submitted:</span>
                <span className="detail-value">{formatDate(selectedFeedback.createdAt)}</span>
              </div>

              {selectedFeedback.response && (
                <div className="response-section">
                  <h4>Response from Support Team:</h4>
                  <p>{selectedFeedback.response}</p>
                  {selectedFeedback.resolvedAt && (
                    <span className="resolved-date">
                      Resolved on {formatDate(selectedFeedback.resolvedAt)}
                    </span>
                  )}
                </div>
              )}

              {selectedFeedback.status === 'resolved' && !selectedFeedback.rating && (
                <div className="rating-section">
                  <h4>Rate our response:</h4>
                  <div className="rating-buttons">
                    <button className="rating-btn positive">
                      <ThumbsUp size={20} />
                      Helpful
                    </button>
                    <button className="rating-btn negative">
                      <ThumbsDown size={20} />
                      Not Helpful
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackSystem;