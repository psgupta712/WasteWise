import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Award, Recycle, Calendar, Edit2 } from 'lucide-react';
import './ProfileDescription.css';

const ProfileDescription = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        console.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-error">
        <p>Unable to load profile. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2 className="profile-title">My Profile</h2>
        <button 
          className="edit-btn"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit2 size={18} />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="profile-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="avatar-badge">
              <Award size={16} />
            </div>
          </div>

          <div className="profile-info">
            <h3 className="profile-name">{userData.name || 'User'}</h3>
            <p className="profile-type">Citizen Member</p>
            <div className="profile-level">
              <span className="level-badge">Level {userData.level || 1}</span>
              <span className="eco-warrior">🌱 Eco Warrior</span>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="details-section">
          <h4 className="section-heading">Contact Information</h4>
          
          <div className="detail-item">
            <div className="detail-icon">
              <Mail size={20} />
            </div>
            <div className="detail-content">
              <span className="detail-label">Email</span>
              <span className="detail-value">{userData.email || 'Not provided'}</span>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">
              <Phone size={20} />
            </div>
            <div className="detail-content">
              <span className="detail-label">Phone</span>
              <span className="detail-value">{userData.phone || 'Not provided'}</span>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">
              <MapPin size={20} />
            </div>
            <div className="detail-content">
              <span className="detail-label">Address</span>
              <span className="detail-value">{userData.address || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Environmental Stats */}
        <div className="stats-section">
          <h4 className="section-heading">Environmental Impact</h4>
          
          <div className="stats-grid">
            <div className="stat-card green">
              <div className="stat-icon">
                <Calendar size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{userData.totalPickups || 0}</span>
                <span className="stat-label">Pickups Scheduled</span>
              </div>
              <div className="stat-trend">+12% this month</div>
            </div>

            <div className="stat-card blue">
              <div className="stat-icon">
                <Recycle size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{userData.wasteRecycled || 0} kg</span>
                <span className="stat-label">Waste Recycled</span>
              </div>
              <div className="stat-trend">+25% this month</div>
            </div>

            <div className="stat-card purple">
              <div className="stat-icon">
                <Award size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{userData.points || 0}</span>
                <span className="stat-label">Reward Points</span>
              </div>
              <div className="stat-trend">Top 15%</div>
            </div>
          </div>
        </div>

        {/* Achievement Summary */}
        <div className="achievement-summary">
          <div className="achievement-item">
            <span className="achievement-icon">🌍</span>
            <div>
              <p className="achievement-title">CO₂ Saved</p>
              <p className="achievement-value">{(userData.wasteRecycled * 0.5).toFixed(1)} kg</p>
            </div>
          </div>

          <div className="achievement-item">
            <span className="achievement-icon">🌳</span>
            <div>
              <p className="achievement-title">Trees Saved</p>
              <p className="achievement-value">{Math.floor((userData.wasteRecycled || 0) / 10)}</p>
            </div>
          </div>

          <div className="achievement-item">
            <span className="achievement-icon">♻️</span>
            <div>
              <p className="achievement-title">Recycling Rate</p>
              <p className="achievement-value">85%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDescription;