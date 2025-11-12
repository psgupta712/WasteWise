import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Calendar, Recycle, Trophy, BookOpen, 
  MessageSquare, LogOut, User, Search, CheckCircle, X 
} from 'lucide-react';
import ProfileDescription from '../components/ProfileDescription';
import SchedulePickup from '../components/SchedulePickup';
import MyPickups from '../components/MyPickups';
import WasteGuide from '../components/WasteGuide';
import RewardsSystem from '../components/RewardsSystem';
import FeedbackSystem from '../components/FeedbackSystem';
import Dashboard from '../components/Dashboard';
import NotificationCenter from '../components/NotificationCenter';
import './CitizenDashboard.css';

const CitizenDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  const handlePickupSuccess = () => {
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 3000);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'schedule', label: 'Schedule Pickup', icon: Calendar },
    { id: 'my-pickups', label: 'My Pickups', icon: Recycle },
    { id: 'waste-guide', label: 'Waste Guide', icon: BookOpen },
    { id: 'rewards', label: 'Rewards', icon: Trophy },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <ProfileDescription />;
      case 'schedule':
        return <SchedulePickup onSuccess={handlePickupSuccess} />;
      case 'my-pickups':
        return <MyPickups />;
      case 'waste-guide':
        return <WasteGuide />;
      case 'rewards':
        return <RewardsSystem />;
      case 'feedback':
        return <FeedbackSystem />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="success-modal">
            <button 
              className="modal-close"
              onClick={() => setShowSuccessModal(false)}
            >
              <X size={24} />
            </button>
            <div className="success-icon-large">
              <CheckCircle size={80} />
            </div>
            <h2 className="success-modal-title">Pickup Scheduled Successfully!</h2>
            <p className="success-modal-text">
              Your waste pickup has been scheduled. You'll receive a confirmation notification shortly.
            </p>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside 
        className={`sidebar ${sidebarHovered ? 'open' : 'closed'}`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="logo-icon">♻️</div>
            {sidebarHovered && <h1 className="logo-text1">WasteWise</h1>}
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={20} />
              {sidebarHovered && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            {sidebarHovered && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarHovered ? 'sidebar-open' : 'sidebar-closed'}`}>
        <header className="dashboard-header">
          <div className="header-left">
            <h2 className="page-title">
              {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h2>
            <p className="page-subtitle">Welcome back! Manage your waste responsibly 🌱</p>
          </div>

          {/* ✅ Updated Header Right with clickable Profile Icon */}
          <div className="header-right">
            <div className="search-bar">
              <Search size={20} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="search-input"
              />
            </div>
            
            <NotificationCenter />
            
            {/* 👇 Added click event to open ProfileDescription */}
            <div 
              className="profile-icon"
              onClick={() => setActiveTab('profile')}
              style={{ cursor: 'pointer' }}
            >
              <User size={20} />
            </div>
          </div>
        </header>

        <div className="content-area">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default CitizenDashboard;
