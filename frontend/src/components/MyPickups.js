import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, MapPin, Package, User, Star, 
  CheckCircle, XCircle, AlertCircle, Loader, 
  Phone, FileText, TrendingUp, Filter
} from 'lucide-react';
import './MyPickups.css';

const MyPickups = () => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    scheduled: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchPickups();
  }, [filterStatus]);

  const fetchPickups = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = filterStatus === 'all' 
        ? 'http://localhost:5000/api/pickup/my-pickups'
        : `http://localhost:5000/api/pickup/my-pickups?status=${filterStatus}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPickups(data.data || []);
        calculateStats(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching pickups:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (pickupData) => {
    const stats = {
      total: pickupData.length,
      completed: pickupData.filter(p => p.status === 'completed').length,
      scheduled: pickupData.filter(p => p.status === 'scheduled' || p.status === 'confirmed').length,
      cancelled: pickupData.filter(p => p.status === 'cancelled').length
    };
    setStats(stats);
  };

  const handleCancelPickup = async (pickupId) => {
    if (!window.confirm('Are you sure you want to cancel this pickup?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/pickup/${pickupId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cancellationReason: 'Cancelled by user'
        })
      });

      if (response.ok) {
        alert('Pickup cancelled successfully');
        fetchPickups();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to cancel pickup');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Error cancelling pickup');
    }
  };

  const openRatingModal = (pickup) => {
    setSelectedPickup(pickup);
    setRating(pickup.rating || 0);
    setFeedback(pickup.feedback || '');
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/pickup/${selectedPickup._id}/rate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating, feedback })
      });

      if (response.ok) {
        alert('Rating submitted successfully!');
        setShowRatingModal(false);
        fetchPickups();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Rating error:', error);
      alert('Error submitting rating');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="status-icon completed" />;
      case 'cancelled':
        return <XCircle size={20} className="status-icon cancelled" />;
      case 'in-progress':
        return <Loader size={20} className="status-icon in-progress" />;
      default:
        return <Clock size={20} className="status-icon scheduled" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      case 'in-progress': return 'status-in-progress';
      case 'confirmed': return 'status-confirmed';
      default: return 'status-scheduled';
    }
  };

  const getWasteIcon = (wasteType) => {
    switch (wasteType) {
      case 'biodegradable': return '🍃';
      case 'recyclable': return '♻️';
      case 'e-waste': return '📱';
      case 'hazardous': return '⚠️';
      default: return '📦';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimeSlot = (slot) => {
    const slots = {
      morning: '6 AM - 10 AM',
      afternoon: '10 AM - 2 PM',
      evening: '2 PM - 6 PM'
    };
    return slots[slot] || slot;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Loading your pickups...</p>
      </div>
    );
  }

  return (
    <div className="my-pickups-container">
      {/* Header with Stats */}
      <div className="pickups-header">
        <div className="stats-cards">
          <div className="stat-card-small total">
            <div className="stat-icon-wrapper">
              <Package size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total Pickups</span>
            </div>
          </div>

          <div className="stat-card-small completed">
            <div className="stat-icon-wrapper">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>

          <div className="stat-card-small scheduled">
            <div className="stat-icon-wrapper">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.scheduled}</span>
              <span className="stat-label">Scheduled</span>
            </div>
          </div>

          <div className="stat-card-small cancelled">
            <div className="stat-icon-wrapper">
              <XCircle size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.cancelled}</span>
              <span className="stat-label">Cancelled</span>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="filter-section">
          <div className="filter-label">
            <Filter size={18} />
            <span>Filter by Status:</span>
          </div>
          <div className="filter-buttons">
            {['all', 'scheduled', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                onClick={() => setFilterStatus(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pickups List */}
      <div className="pickups-list">
        {pickups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No pickups found</h3>
            <p>Schedule your first pickup to see it here!</p>
          </div>
        ) : (
          pickups.map((pickup) => (
            <div key={pickup._id} className="pickup-card">
              <div className="pickup-header-row">
                <div className="pickup-type">
                  <span className="type-icon">{getWasteIcon(pickup.wasteType)}</span>
                  <span className="type-name">{pickup.wasteType}</span>
                </div>
                <div className={`pickup-status ${getStatusColor(pickup.status)}`}>
                  {getStatusIcon(pickup.status)}
                  <span>{pickup.status}</span>
                </div>
              </div>

              <div className="pickup-details">
                <div className="detail-row">
                  <Calendar size={16} />
                  <span><strong>Date:</strong> {formatDate(pickup.pickupDate)}</span>
                </div>
                <div className="detail-row">
                  <Clock size={16} />
                  <span><strong>Time:</strong> {formatTimeSlot(pickup.timeSlot)}</span>
                </div>
                <div className="detail-row">
                  <MapPin size={16} />
                  <span><strong>Address:</strong> {pickup.address}</span>
                </div>
                {pickup.estimatedWeight > 0 && (
                  <div className="detail-row">
                    <TrendingUp size={16} />
                    <span><strong>Weight:</strong> {pickup.estimatedWeight} kg</span>
                  </div>
                )}
                {pickup.verificationCode && (
                  <div className="detail-row verification">
                    <FileText size={16} />
                    <span><strong>Code:</strong> <code>{pickup.verificationCode}</code></span>
                  </div>
                )}
                {pickup.assignedCollector && (
                  <div className="detail-row">
                    <User size={16} />
                    <span><strong>Collector:</strong> {pickup.assignedCollector.name}</span>
                    {pickup.assignedCollector.phone && (
                      <a href={`tel:${pickup.assignedCollector.phone}`} className="phone-link">
                        <Phone size={14} />
                        {pickup.assignedCollector.phone}
                      </a>
                    )}
                  </div>
                )}
                {pickup.specialInstructions && (
                  <div className="detail-row instructions">
                    <AlertCircle size={16} />
                    <span><em>{pickup.specialInstructions}</em></span>
                  </div>
                )}
              </div>

              {/* Points Badge */}
              {pickup.pointsAwarded > 0 && (
                <div className="points-badge">
                  +{pickup.pointsAwarded} Points Earned! 🎉
                </div>
              )}

              {/* Rating Display */}
              {pickup.rating && (
                <div className="rating-display">
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        fill={star <= pickup.rating ? '#ffc107' : 'none'}
                        stroke={star <= pickup.rating ? '#ffc107' : '#ccc'}
                      />
                    ))}
                  </div>
                  {pickup.feedback && (
                    <p className="feedback-text">"{pickup.feedback}"</p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pickup-actions">
                {(pickup.status === 'scheduled' || pickup.status === 'confirmed') && (
                  <button
                    className="action-btn cancel-btn"
                    onClick={() => handleCancelPickup(pickup._id)}
                  >
                    <XCircle size={16} />
                    Cancel Pickup
                  </button>
                )}
                {pickup.status === 'completed' && !pickup.rating && (
                  <button
                    className="action-btn rate-btn"
                    onClick={() => openRatingModal(pickup)}
                  >
                    <Star size={16} />
                    Rate Service
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="modal-overlay" onClick={() => setShowRatingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rate Your Experience</h3>
              <button className="close-btn" onClick={() => setShowRatingModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <p className="modal-subtitle">How was your pickup service?</p>
              
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={40}
                    className={`star-btn ${star <= rating ? 'active' : ''}`}
                    fill={star <= rating ? '#ffc107' : 'none'}
                    stroke={star <= rating ? '#ffc107' : '#ccc'}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>

              <textarea
                className="feedback-input"
                placeholder="Share your feedback (optional)..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows="4"
              />

              <button className="submit-rating-btn" onClick={submitRating}>
                <CheckCircle size={20} />
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPickups;