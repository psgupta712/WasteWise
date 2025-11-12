import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import './SchedulePickup.css';

const SchedulePickup = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    wasteType: '',
    pickupDate: '',
    timeSlot: '',
    address: '',
    estimatedWeight: '',
    specialInstructions: '',
    contactPhone: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userAddress, setUserAddress] = useState('');

  useEffect(() => {
    fetchUserAddress();
  }, []);

  const fetchUserAddress = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserAddress(data.address || '');
        setFormData(prev => ({
          ...prev,
          address: data.address || '',
          contactPhone: data.phone || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const wasteTypes = [
    { 
      value: 'biodegradable', 
      label: 'Biodegradable',
      icon: '🍃',
      desc: 'Food waste, garden waste, paper'
    },
    { 
      value: 'recyclable', 
      label: 'Recyclable',
      icon: '♻️',
      desc: 'Plastic, glass, metal, cardboard'
    },
    { 
      value: 'e-waste', 
      label: 'E-Waste',
      icon: '📱',
      desc: 'Electronics, batteries, cables'
    },
    { 
      value: 'hazardous', 
      label: 'Hazardous',
      icon: '⚠️',
      desc: 'Chemicals, paints, medical waste'
    }
  ];

  const timeSlots = [
    { value: 'morning', label: 'Morning (6 AM - 10 AM)', icon: '🌅' },
    { value: 'afternoon', label: 'Afternoon (10 AM - 2 PM)', icon: '☀️' },
    { value: 'evening', label: 'Evening (2 PM - 6 PM)', icon: '🌆' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.wasteType) {
      setError('Please select a waste type');
      return;
    }
    if (!formData.pickupDate) {
      setError('Please select a pickup date');
      return;
    }
    if (!formData.timeSlot) {
      setError('Please select a time slot');
      return;
    }
    if (!formData.address) {
      setError('Please provide a pickup address');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/pickup/schedule', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Call the onSuccess callback to show modal
        if (onSuccess) {
          onSuccess();
        }
        
        // Reset form
        setFormData({
          wasteType: '',
          pickupDate: '',
          timeSlot: '',
          address: userAddress,
          estimatedWeight: '',
          specialInstructions: '',
          contactPhone: formData.contactPhone
        });
      } else {
        setError(data.message || 'Failed to schedule pickup');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Schedule pickup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="schedule-pickup-container">
      {/* Header Section */}
      <div className="schedule-header">
        <div className="header-content">
          <h2 className="schedule-title">Schedule a Pickup</h2>
          <p className="schedule-subtitle">
            Request waste collection at your convenience. We'll handle the rest! 🚛
          </p>
        </div>
        <div className="header-decoration">
          <div className="deco-circle circle-1"></div>
          <div className="deco-circle circle-2"></div>
          <div className="deco-circle circle-3"></div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-alert">
          <AlertCircle size={24} />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="pickup-form">
        {/* Waste Type Selection */}
        <div className="form-section">
          <label className="section-label">
            <Package size={20} />
            Select Waste Type
          </label>
          <div className="waste-type-grid">
            {wasteTypes.map((type) => (
              <div
                key={type.value}
                className={`waste-type-card ${formData.wasteType === type.value ? 'selected' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, wasteType: type.value }))}
              >
                <div className="waste-icon">{type.icon}</div>
                <h4>{type.label}</h4>
                <p>{type.desc}</p>
                <div className="selection-indicator">
                  {formData.wasteType === type.value && <CheckCircle size={20} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date and Time Selection */}
        <div className="form-section">
          <label className="section-label">
            <Calendar size={20} />
            Choose Date & Time
          </label>
          <div className="date-time-grid">
            <div className="form-group">
              <label htmlFor="pickupDate">Pickup Date</label>
              <input
                type="date"
                id="pickupDate"
                name="pickupDate"
                value={formData.pickupDate}
                onChange={handleInputChange}
                min={getTomorrowDate()}
                className="date-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="timeSlot">Time Slot</label>
              <select
                id="timeSlot"
                name="timeSlot"
                value={formData.timeSlot}
                onChange={handleInputChange}
                className="select-input"
              >
                <option value="">Select time slot</option>
                {timeSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.icon} {slot.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="form-section">
          <label className="section-label">
            <MapPin size={20} />
            Pickup Address
          </label>
          <div className="form-group">
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your complete pickup address..."
              rows="3"
              className="textarea-input"
            />
          </div>
        </div>

        {/* Additional Details */}
        <div className="form-section">
          <label className="section-label">
            <Clock size={20} />
            Additional Details
          </label>
          <div className="details-grid">
            <div className="form-group">
              <label htmlFor="estimatedWeight">Estimated Weight (kg)</label>
              <input
                type="number"
                id="estimatedWeight"
                name="estimatedWeight"
                value={formData.estimatedWeight}
                onChange={handleInputChange}
                placeholder="e.g., 5"
                min="0"
                step="0.5"
                className="number-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactPhone">Contact Phone</label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                placeholder="Your phone number"
                className="text-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="specialInstructions">Special Instructions (Optional)</label>
            <textarea
              id="specialInstructions"
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleInputChange}
              placeholder="Any specific instructions for the collector..."
              rows="3"
              className="textarea-input"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Scheduling...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Schedule Pickup
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info Cards */}
      <div className="info-cards">
        <div className="info-card">
          <div className="info-icon">⏰</div>
          <h4>Quick Response</h4>
          <p>Get confirmation within 30 minutes</p>
        </div>
        <div className="info-card">
          <div className="info-icon">📍</div>
          <h4>Track in Real-time</h4>
          <p>Know exactly when we'll arrive</p>
        </div>
        <div className="info-card">
          <div className="info-icon">🎁</div>
          <h4>Earn Rewards</h4>
          <p>Get points for every pickup</p>
        </div>
      </div>
    </div>
  );
};

export default SchedulePickup;