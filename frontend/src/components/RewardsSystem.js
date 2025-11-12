import React, { useState, useEffect } from 'react';
import { 
  Award, TrendingUp, Trophy, Star, Gift, 
  Crown, Zap, Target, Users, ChevronRight,
  CheckCircle, Lock, Sparkles, Medal
} from 'lucide-react';
import './RewardsSystem.css';

const RewardsSystem = () => {
  const [userData, setUserData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, badges, leaderboard, redeem

  useEffect(() => {
    fetchUserData();
    fetchLeaderboard();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/rewards/leaderboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Use mock data for demo
      setLeaderboard(generateMockLeaderboard());
    }
  };

  const generateMockLeaderboard = () => {
    const names = ['Rahul Singh', 'Priya Sharma', 'Amit Kumar', 'Sneha Patel', 'Vikram Reddy', 
                   'Anita Desai', 'Rohan Gupta', 'Kavita Nair', 'Sanjay Mehta', 'Deepa Iyer'];
    return names.map((name, idx) => ({
      _id: `user${idx}`,
      name,
      points: 1200 - (idx * 100),
      level: 12 - idx,
      pickupsCompleted: 25 - (idx * 2),
      wasteRecycled: 150 - (idx * 10)
    }));
  };

  // Badge definitions
  const badges = [
    {
      id: 'first_pickup',
      name: 'First Step',
      icon: '🌱',
      description: 'Complete your first pickup',
      requirement: 'Complete 1 pickup',
      points: 50,
      unlocked: (userData?.totalPickups || 0) >= 1
    },
    {
      id: 'eco_warrior',
      name: 'Eco Warrior',
      icon: '🛡️',
      description: 'Complete 10 pickups',
      requirement: 'Complete 10 pickups',
      points: 100,
      unlocked: (userData?.totalPickups || 0) >= 10
    },
    {
      id: 'recycling_hero',
      name: 'Recycling Hero',
      icon: '♻️',
      description: 'Recycle 50kg of waste',
      requirement: 'Recycle 50kg waste',
      points: 200,
      unlocked: (userData?.wasteRecycled || 0) >= 50
    },
    {
      id: 'waste_master',
      name: 'Waste Master',
      icon: '🎓',
      description: 'Complete 25 pickups',
      requirement: 'Complete 25 pickups',
      points: 300,
      unlocked: (userData?.totalPickups || 0) >= 25
    },
    {
      id: 'green_champion',
      name: 'Green Champion',
      icon: '🏆',
      description: 'Reach Level 10',
      requirement: 'Reach Level 10',
      points: 500,
      unlocked: (userData?.level || 0) >= 10
    },
    {
      id: 'consistency_king',
      name: 'Consistency King',
      icon: '👑',
      description: 'Complete pickups for 30 days',
      requirement: '30 day streak',
      points: 400,
      unlocked: false // Would check streak from backend
    },
    {
      id: 'planet_saver',
      name: 'Planet Saver',
      icon: '🌍',
      description: 'Recycle 100kg of waste',
      requirement: 'Recycle 100kg waste',
      points: 600,
      unlocked: (userData?.wasteRecycled || 0) >= 100
    },
    {
      id: 'eco_legend',
      name: 'Eco Legend',
      icon: '⭐',
      description: 'Reach Level 20',
      requirement: 'Reach Level 20',
      points: 1000,
      unlocked: (userData?.level || 0) >= 20
    }
  ];

  // Reward items
  const rewardItems = [
    {
      id: 'discount_10',
      name: '10% Discount Coupon',
      icon: '🎟️',
      description: 'Get 10% off on eco-friendly products',
      points: 500,
      category: 'Shopping'
    },
    {
      id: 'plant_sapling',
      name: 'Free Plant Sapling',
      icon: '🌱',
      description: 'Claim a free plant sapling',
      points: 300,
      category: 'Environment'
    },
    {
      id: 'tote_bag',
      name: 'Eco Tote Bag',
      icon: '👜',
      description: 'Reusable shopping bag',
      points: 400,
      category: 'Products'
    },
    {
      id: 'discount_20',
      name: '20% Discount Coupon',
      icon: '🎫',
      description: 'Get 20% off on eco-friendly products',
      points: 800,
      category: 'Shopping'
    },
    {
      id: 'water_bottle',
      name: 'Steel Water Bottle',
      icon: '🍶',
      description: 'Reusable steel bottle',
      points: 600,
      category: 'Products'
    },
    {
      id: 'compost_bin',
      name: 'Compost Bin',
      icon: '🗑️',
      description: 'Home composting kit',
      points: 1000,
      category: 'Products'
    }
  ];

  const calculateNextLevelPoints = () => {
    const currentLevel = userData?.level || 1;
    const nextLevel = currentLevel + 1;
    const pointsNeeded = nextLevel * 100;
    const currentPoints = userData?.points || 0;
    const pointsToNext = pointsNeeded - currentPoints;
    const progress = (currentPoints / pointsNeeded) * 100;
    
    return { pointsToNext: Math.max(0, pointsToNext), progress: Math.min(100, progress) };
  };

  const handleRedeemReward = async (reward) => {
    if ((userData?.points || 0) < reward.points) {
      alert('Insufficient points to redeem this reward!');
      return;
    }

    if (window.confirm(`Redeem ${reward.name} for ${reward.points} points?`)) {
      alert('🎉 Reward redeemed successfully! Check your email for details.');
      // In production, call API to redeem
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Loading rewards...</p>
      </div>
    );
  }

  const { pointsToNext, progress } = calculateNextLevelPoints();

  return (
    <div className="rewards-container">
      {/* Header with Stats */}
      <div className="rewards-header">
        <div className="header-card points-card">
          <div className="card-icon">
            <Sparkles size={32} />
          </div>
          <div className="card-content">
            <span className="card-label">Total Points</span>
            <span className="card-value">{userData?.points || 0}</span>
          </div>
        </div>

        <div className="header-card level-card">
          <div className="card-icon">
            <TrendingUp size={32} />
          </div>
          <div className="card-content">
            <span className="card-label">Current Level</span>
            <span className="card-value">Level {userData?.level || 1}</span>
          </div>
        </div>

        <div className="header-card badges-card">
          <div className="card-icon">
            <Award size={32} />
          </div>
          <div className="card-content">
            <span className="card-label">Badges Earned</span>
            <span className="card-value">{badges.filter(b => b.unlocked).length}/{badges.length}</span>
          </div>
        </div>

        <div className="header-card rank-card">
          <div className="card-icon">
            <Trophy size={32} />
          </div>
          <div className="card-content">
            <span className="card-label">Community Rank</span>
            <span className="card-value">#15</span>
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="level-progress-section">
        <div className="progress-header">
          <div className="progress-info">
            <h3>Level {userData?.level || 1}</h3>
            <p>{pointsToNext} points to Level {(userData?.level || 1) + 1}</p>
          </div>
          <div className="level-badge">
            <Crown size={24} />
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}>
            <span className="progress-text">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="rewards-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Target size={18} />
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'badges' ? 'active' : ''}`}
          onClick={() => setActiveTab('badges')}
        >
          <Award size={18} />
          Badges
        </button>
        <button
          className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <Users size={18} />
          Leaderboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'redeem' ? 'active' : ''}`}
          onClick={() => setActiveTab('redeem')}
        >
          <Gift size={18} />
          Redeem
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="achievements-grid">
              <div className="achievement-card">
                <div className="achievement-icon pickups">
                  <CheckCircle size={32} />
                </div>
                <h4>{userData?.totalPickups || 0}</h4>
                <p>Total Pickups</p>
              </div>

              <div className="achievement-card">
                <div className="achievement-icon recycled">
                  <TrendingUp size={32} />
                </div>
                <h4>{userData?.wasteRecycled || 0} kg</h4>
                <p>Waste Recycled</p>
              </div>

              <div className="achievement-card">
                <div className="achievement-icon impact">
                  <Zap size={32} />
                </div>
                <h4>{((userData?.wasteRecycled || 0) * 0.5).toFixed(1)} kg</h4>
                <p>CO₂ Saved</p>
              </div>

              <div className="achievement-card">
                <div className="achievement-icon trees">
                  <Star size={32} />
                </div>
                <h4>{Math.floor((userData?.wasteRecycled || 0) / 10)}</h4>
                <p>Trees Saved</p>
              </div>
            </div>

            <div className="recent-badges">
              <h3>Recent Badges</h3>
              <div className="badges-row">
                {badges.filter(b => b.unlocked).slice(0, 4).map((badge) => (
                  <div key={badge.id} className="mini-badge unlocked">
                    <span className="badge-icon">{badge.icon}</span>
                    <span className="badge-name">{badge.name}</span>
                    <CheckCircle size={16} className="unlock-check" />
                  </div>
                ))}
              </div>
            </div>

            <div className="motivational-card">
              <div className="motivational-icon">🎯</div>
              <div className="motivational-content">
                <h3>Keep Going!</h3>
                <p>You're doing great! Complete {3} more pickups to unlock the "Eco Warrior" badge.</p>
                <button className="action-btn">Schedule Pickup</button>
              </div>
            </div>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="badges-section">
            <div className="badges-header">
              <h3>Your Badges Collection</h3>
              <p>{badges.filter(b => b.unlocked).length} of {badges.length} unlocked</p>
            </div>

            <div className="badges-grid">
              {badges.map((badge) => (
                <div key={badge.id} className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`}>
                  <div className="badge-icon-large">
                    {badge.unlocked ? badge.icon : <Lock size={40} />}
                  </div>
                  <h4>{badge.name}</h4>
                  <p className="badge-description">{badge.description}</p>
                  <div className="badge-requirement">
                    <span>{badge.requirement}</span>
                  </div>
                  {badge.unlocked ? (
                    <div className="badge-status unlocked">
                      <CheckCircle size={18} />
                      <span>Unlocked</span>
                    </div>
                  ) : (
                    <div className="badge-status locked">
                      <Lock size={18} />
                      <span>{badge.points} points</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="leaderboard-section">
            <div className="leaderboard-header">
              <h3>Community Leaderboard</h3>
              <p>Top eco-warriors this month</p>
            </div>

            <div className="leaderboard-list">
              {leaderboard.map((user, index) => (
                <div key={user._id} className={`leaderboard-item rank-${index + 1}`}>
                  <div className="rank-badge">
                    {index === 0 && <Trophy size={24} className="gold" />}
                    {index === 1 && <Medal size={24} className="silver" />}
                    {index === 2 && <Medal size={24} className="bronze" />}
                    {index > 2 && <span className="rank-number">#{index + 1}</span>}
                  </div>

                  <div className="user-avatar">
                    {user.name.charAt(0)}
                  </div>

                  <div className="user-details">
                    <h4>{user.name}</h4>
                    <div className="user-stats">
                      <span>Level {user.level}</span>
                      <span>•</span>
                      <span>{user.pickupsCompleted} pickups</span>
                      <span>•</span>
                      <span>{user.wasteRecycled}kg recycled</span>
                    </div>
                  </div>

                  <div className="user-points">
                    <Sparkles size={20} />
                    <span>{user.points}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="your-rank-card">
              <Star size={24} />
              <div>
                <h4>Your Rank: #15</h4>
                <p>Keep recycling to climb the leaderboard!</p>
              </div>
            </div>
          </div>
        )}

        {/* Redeem Tab */}
        {activeTab === 'redeem' && (
          <div className="redeem-section">
            <div className="redeem-header">
              <h3>Redeem Your Points</h3>
              <div className="available-points">
                <Sparkles size={20} />
                <span>{userData?.points || 0} points available</span>
              </div>
            </div>

            <div className="rewards-grid">
              {rewardItems.map((reward) => {
                const canRedeem = (userData?.points || 0) >= reward.points;
                
                return (
                  <div key={reward.id} className={`reward-card ${canRedeem ? 'available' : 'unavailable'}`}>
                    <div className="reward-badge">{reward.category}</div>
                    <div className="reward-icon-large">{reward.icon}</div>
                    <h4>{reward.name}</h4>
                    <p>{reward.description}</p>
                    <div className="reward-footer">
                      <div className="reward-points">
                        <Sparkles size={18} />
                        <span>{reward.points} points</span>
                      </div>
                      <button
                        className={`redeem-btn ${canRedeem ? 'active' : 'disabled'}`}
                        onClick={() => handleRedeemReward(reward)}
                        disabled={!canRedeem}
                      >
                        {canRedeem ? 'Redeem' : 'Need More'}
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsSystem;