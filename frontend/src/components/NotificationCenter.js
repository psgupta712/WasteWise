import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, X, Check, CheckCircle, Calendar, 
  Award, AlertCircle, Recycle, Gift, MessageCircle,
  Trash2, Settings
} from 'lucide-react';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      } else {
        // Use mock notifications for demo
        const mockNotifications = generateMockNotifications();
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      const mockNotifications = generateMockNotifications();
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    }
  };

  const generateMockNotifications = () => {
    return [
      {
        _id: '1',
        type: 'pickup_scheduled',
        title: 'Pickup Scheduled',
        message: 'Your waste pickup has been scheduled for tomorrow at 10 AM',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        icon: 'calendar',
        color: '#667eea'
      },
      {
        _id: '2',
        type: 'pickup_completed',
        title: 'Pickup Completed',
        message: 'Your biodegradable waste pickup was completed successfully. +25 points earned!',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        icon: 'check',
        color: '#4caf50'
      },
      {
        _id: '3',
        type: 'badge_earned',
        title: 'New Badge Unlocked!',
        message: 'Congratulations! You\'ve earned the "Eco Warrior" badge',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        icon: 'award',
        color: '#ffc107'
      },
      {
        _id: '4',
        type: 'feedback_response',
        title: 'Feedback Response',
        message: 'Your complaint has been resolved. Thank you for your patience!',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        icon: 'message',
        color: '#2196f3'
      },
      {
        _id: '5',
        type: 'reward_available',
        title: 'Reward Available',
        message: 'You have enough points to redeem a 10% discount coupon!',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        icon: 'gift',
        color: '#9c27b0'
      },
      {
        _id: '6',
        type: 'reminder',
        title: 'Pickup Reminder',
        message: 'Your scheduled pickup is tomorrow. Please keep waste ready at the designated location.',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        icon: 'alert',
        color: '#ff9800'
      }
    ];
  };

  const getIcon = (iconType) => {
    const icons = {
      calendar: Calendar,
      check: CheckCircle,
      award: Award,
      message: MessageCircle,
      gift: Gift,
      alert: AlertCircle,
      recycle: Recycle
    };
    return icons[iconType] || Bell;
  };

  const formatTimestamp = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return notifDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Update local state
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Update locally anyway for demo
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const deletedNotif = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      if (deletedNotif && !deletedNotif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      const deletedNotif = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      if (deletedNotif && !deletedNotif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  return (
    <div className="notification-center" ref={dropdownRef}>
      {/* Notification Bell */}
      <button 
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="notification-dropdown">
          {/* Header */}
          <div className="notification-header">
            <div className="header-left">
              <h3 className="notification-title">Notifications</h3>
              {unreadCount > 0 && (
                <span className="unread-count">{unreadCount} new</span>
              )}
            </div>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="notification-filters">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread
            </button>
            <button
              className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
              onClick={() => setFilter('read')}
            >
              Read
            </button>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button 
                  className="action-btn"
                  onClick={markAllAsRead}
                >
                  <Check size={16} />
                  Mark all as read
                </button>
              )}
              <button 
                className="action-btn danger"
                onClick={clearAll}
              >
                <Trash2 size={16} />
                Clear all
              </button>
            </div>
          )}

          {/* Notification List */}
          <div className="notification-list">
            {filteredNotifications.length === 0 ? (
              <div className="empty-notifications">
                <Bell size={48} className="empty-icon" />
                <p className="empty-title">No notifications</p>
                <span className="empty-text">
                  {filter === 'unread' 
                    ? "You're all caught up!" 
                    : "You'll see notifications here when you get them"}
                </span>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const IconComponent = getIcon(notification.icon);
                
                return (
                  <div 
                    key={notification._id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => !notification.read && markAsRead(notification._id)}
                  >
                    <div 
                      className="notification-icon"
                      style={{ background: notification.color }}
                    >
                      <IconComponent size={20} />
                    </div>

                    <div className="notification-content">
                      <div className="notification-header-row">
                        <h4 className="notification-item-title">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="unread-dot"></span>
                        )}
                      </div>
                      <p className="notification-message">
                        {notification.message}
                      </p>
                      <span className="notification-time">
                        {formatTimestamp(notification.createdAt)}
                      </span>
                    </div>

                    <button 
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      aria-label="Delete notification"
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;