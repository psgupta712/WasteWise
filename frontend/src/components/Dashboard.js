import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Calendar, Recycle, Award, Leaf, 
  Package, CheckCircle, Clock, AlertCircle,
  Users, Target, Zap, ChevronRight, Star
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    totalPickups: 0,
    completedPickups: 0,
    pendingPickups: 0,
    wasteRecycled: 0,
    points: 0,
    level: 1,
    badges: 0,
    co2Saved: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch user profile
      const profileRes = await fetch('http://localhost:5000/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUserData(profileData);
        
        setStats({
          totalPickups: profileData.totalPickups || 0,
          completedPickups: profileData.completedPickups || 0,
          pendingPickups: profileData.pendingPickups || 0,
          wasteRecycled: profileData.wasteRecycled || 0,
          points: profileData.points || 0,
          level: profileData.level || 1,
          badges: 3, // Would come from badges API
          co2Saved: ((profileData.wasteRecycled || 0) * 0.5).toFixed(1)
        });
      }

      // Fetch recent pickups for activity
      const pickupsRes = await fetch('http://localhost:5000/api/pickup/my-pickups?limit=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (pickupsRes.ok) {
        const pickupsData = await pickupsRes.json();
        setRecentActivity(pickupsData.data || []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { id: 'schedule', label: 'Schedule Pickup', icon: Calendar, color: '#667eea', action: 'schedule' },
    { id: 'track', label: 'Track Pickups', icon: Package, color: '#2196f3', action: 'my-pickups' },
    { id: 'guide', label: 'Waste Guide', icon: Recycle, color: '#4caf50', action: 'waste-guide' },
    { id: 'rewards', label: 'View Rewards', icon: Award, color: '#ffc107', action: 'rewards' }
  ];

  const monthlyData = [
    { month: 'Jan', waste: 12, pickups: 4 },
    { month: 'Feb', waste: 15, pickups: 5 },
    { month: 'Mar', waste: 18, pickups: 6 },
    { month: 'Apr', waste: 14, pickups: 5 },
    { month: 'May', waste: 20, pickups: 7 },
    { month: 'Jun', waste: 22, pickups: 8 }
  ];

  const wasteBreakdown = [
    { type: 'Biodegradable', percentage: 40, color: '#4caf50', icon: '🍃' },
    { type: 'Recyclable', percentage: 35, color: '#2196f3', icon: '♻️' },
    { type: 'E-waste', percentage: 15, color: '#ff9800', icon: '📱' },
    { type: 'Hazardous', percentage: 10, color: '#f44336', icon: '⚠️' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="status-icon-complete" />;
      case 'scheduled':
      case 'confirmed':
        return <Clock size={16} className="status-icon-pending" />;
      default:
        return <AlertCircle size={16} className="status-icon-alert" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-overview">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1 className="welcome-title">Welcome back, {userData?.name || 'User'}! 👋</h1>
          <p className="welcome-text">
            You've recycled <strong>{stats.wasteRecycled}kg</strong> of waste and saved <strong>{stats.co2Saved}kg CO₂</strong> this month!
          </p>
        </div>
        <div className="welcome-badge">
          <div className="badge-circle">
            <Leaf size={32} />
          </div>
          <span className="badge-label">Eco Warrior</span>
        </div>
      </div>

      {/* Key Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-header">
            <div className="stat-icon primary-icon">
              <Package size={24} />
            </div>
            <div className="stat-trend up">
              <TrendingUp size={16} />
              <span>+12%</span>
            </div>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalPickups}</h3>
            <p className="stat-label">Total Pickups</p>
          </div>
          <div className="stat-footer">
            <span className="stat-detail">{stats.completedPickups} completed</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-header">
            <div className="stat-icon success-icon">
              <Recycle size={24} />
            </div>
            <div className="stat-trend up">
              <TrendingUp size={16} />
              <span>+25%</span>
            </div>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.wasteRecycled}kg</h3>
            <p className="stat-label">Waste Recycled</p>
          </div>
          <div className="stat-footer">
            <span className="stat-detail">This month</span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-header">
            <div className="stat-icon warning-icon">
              <Award size={24} />
            </div>
            <div className="stat-trend up">
              <TrendingUp size={16} />
              <span>+15%</span>
            </div>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.points}</h3>
            <p className="stat-label">Reward Points</p>
          </div>
          <div className="stat-footer">
            <span className="stat-detail">Level {stats.level}</span>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-header">
            <div className="stat-icon info-icon">
              <Zap size={24} />
            </div>
            <div className="stat-trend neutral">
              <Target size={16} />
              <span>85%</span>
            </div>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.co2Saved}kg</h3>
            <p className="stat-label">CO₂ Saved</p>
          </div>
          <div className="stat-footer">
            <span className="stat-detail">Environmental impact</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action) => (
            <button 
              key={action.id} 
              className="quick-action-card"
              style={{ '--action-color': action.color }}
            >
              <div className="action-icon">
                <action.icon size={28} />
              </div>
              <span className="action-label">{action.label}</span>
              <ChevronRight size={20} className="action-arrow" />
            </button>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Monthly Waste Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Monthly Waste Collection</h3>
            <select className="chart-filter">
              <option>Last 6 months</option>
              <option>Last year</option>
              <option>All time</option>
            </select>
          </div>
          <div className="chart-content">
            <div className="bar-chart">
              {monthlyData.map((data, index) => (
                <div key={index} className="bar-group">
                  <div className="bar-container">
                    <div 
                      className="bar bar-primary"
                      style={{ height: `${(data.waste / 25) * 100}%` }}
                      data-tooltip={`${data.waste}kg`}
                    >
                      <span className="bar-value">{data.waste}</span>
                    </div>
                  </div>
                  <span className="bar-label">{data.month}</span>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-color primary"></span>
                <span className="legend-label">Waste (kg)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Waste Breakdown */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Waste Type Breakdown</h3>
            <span className="chart-subtitle">Current month</span>
          </div>
          <div className="chart-content">
            <div className="donut-chart">
              <svg viewBox="0 0 200 200" className="donut-svg">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#4caf50"
                  strokeWidth="40"
                  strokeDasharray={`${40 * 5.03} ${100 * 5.03}`}
                  transform="rotate(-90 100 100)"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#2196f3"
                  strokeWidth="40"
                  strokeDasharray={`${35 * 5.03} ${100 * 5.03}`}
                  strokeDashoffset={`${-40 * 5.03}`}
                  transform="rotate(-90 100 100)"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#ff9800"
                  strokeWidth="40"
                  strokeDasharray={`${15 * 5.03} ${100 * 5.03}`}
                  strokeDashoffset={`${-(40 + 35) * 5.03}`}
                  transform="rotate(-90 100 100)"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#f44336"
                  strokeWidth="40"
                  strokeDasharray={`${10 * 5.03} ${100 * 5.03}`}
                  strokeDashoffset={`${-(40 + 35 + 15) * 5.03}`}
                  transform="rotate(-90 100 100)"
                />
                <text x="100" y="95" textAnchor="middle" className="donut-center-value">100%</text>
                <text x="100" y="115" textAnchor="middle" className="donut-center-label">Total</text>
              </svg>
            </div>
            <div className="breakdown-list">
              {wasteBreakdown.map((item, index) => (
                <div key={index} className="breakdown-item">
                  <span className="breakdown-icon">{item.icon}</span>
                  <div className="breakdown-info">
                    <span className="breakdown-type">{item.type}</span>
                    <div className="breakdown-bar">
                      <div 
                        className="breakdown-fill"
                        style={{ 
                          width: `${item.percentage}%`,
                          background: item.color 
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="breakdown-percentage">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Achievements */}
      <div className="bottom-section">
        {/* Recent Activity */}
        <div className="activity-card">
          <div className="activity-header">
            <h3 className="activity-title">Recent Activity</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="activity-list">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity._id} className="activity-item">
                  <div className="activity-icon-wrapper">
                    {getStatusIcon(activity.status)}
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">
                      <strong>{activity.wasteType}</strong> pickup {activity.status}
                    </p>
                    <span className="activity-date">{formatDate(activity.pickupDate)}</span>
                  </div>
                  <div className="activity-badge">
                    +{activity.pointsAwarded || 0} pts
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-activity">
                <Package size={48} className="empty-icon" />
                <p>No recent activity</p>
                <span>Schedule your first pickup to get started!</span>
              </div>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="achievements-card">
          <div className="achievements-header">
            <h3 className="achievements-title">Recent Achievements</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="achievements-list">
            <div className="achievement-item unlocked">
              <div className="achievement-icon">🌱</div>
              <div className="achievement-info">
                <h4>First Step</h4>
                <p>Completed first pickup</p>
              </div>
              <Star size={20} className="achievement-star" />
            </div>

            <div className="achievement-item unlocked">
              <div className="achievement-icon">♻️</div>
              <div className="achievement-info">
                <h4>Recycling Hero</h4>
                <p>Recycled 50kg of waste</p>
              </div>
              <Star size={20} className="achievement-star" />
            </div>

            <div className="achievement-item locked">
              <div className="achievement-icon">🏆</div>
              <div className="achievement-info">
                <h4>Eco Champion</h4>
                <p>Complete 25 pickups</p>
              </div>
              <span className="achievement-progress">15/25</span>
            </div>

            <div className="achievement-item locked">
              <div className="achievement-icon">👑</div>
              <div className="achievement-info">
                <h4>Consistency King</h4>
                <p>30 day streak</p>
              </div>
              <span className="achievement-progress">12/30</span>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Summary */}
      <div className="impact-summary">
        <h3 className="impact-title">Your Environmental Impact</h3>
        <div className="impact-grid">
          <div className="impact-item">
            <div className="impact-icon">🌍</div>
            <div className="impact-details">
              <span className="impact-value">{stats.co2Saved}kg</span>
              <span className="impact-label">CO₂ Reduced</span>
            </div>
          </div>

          <div className="impact-item">
            <div className="impact-icon">🌳</div>
            <div className="impact-details">
              <span className="impact-value">{Math.floor(stats.wasteRecycled / 10)}</span>
              <span className="impact-label">Trees Saved</span>
            </div>
          </div>

          <div className="impact-item">
            <div className="impact-icon">💧</div>
            <div className="impact-details">
              <span className="impact-value">{(stats.wasteRecycled * 1.5).toFixed(0)}L</span>
              <span className="impact-label">Water Saved</span>
            </div>
          </div>

          <div className="impact-item">
            <div className="impact-icon">⚡</div>
            <div className="impact-details">
              <span className="impact-value">{(stats.wasteRecycled * 2).toFixed(0)}kWh</span>
              <span className="impact-label">Energy Saved</span>
            </div>
          </div>
        </div>
        <p className="impact-message">
          Keep up the great work! You're making a real difference for our planet. 🌱
        </p>
      </div>
    </div>
  );
};

export default Dashboard;