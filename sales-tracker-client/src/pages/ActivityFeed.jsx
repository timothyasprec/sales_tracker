import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { activityAPI } from '../services/api';
import PursuitLogo from '../assets/PursuitLogo';
import '../styles/Overview.css';
import '../styles/ActivityFeed.css';

const ActivityFeed = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    // Refresh feed every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async () => {
    try {
      const data = await activityAPI.getAllActivities(50, 0);
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get emoji based on action type and details
  const getActivityEmoji = (activity) => {
    switch (activity.action_type) {
      case 'added_lead':
        const temp = activity.details?.temperature;
        if (temp === 'hot') return '🔥';
        if (temp === 'warm') return '☀️';
        return '❄️';
      case 'updated_lead':
        const newStage = activity.details?.new_stage;
        if (newStage === 'Interested') return '🎉';
        if (newStage === 'Sales Pitch Meeting') return '🤝';
        if (newStage === 'Follow-up Resources Sent') return '📧';
        if (newStage === 'Not Interested') return '😔';
        return '📈';
      case 'added_builder':
        return '⭐';
      default:
        return '✨';
    }
  };

  // Get message based on action type
  const getActivityMessage = (activity) => {
    switch (activity.action_type) {
      case 'added_lead':
        const temp = activity.details?.temperature;
        const tempLabel = temp === 'hot' ? '🔥 HOT' : temp === 'warm' ? '☀️ Warm' : '❄️ Cold';
        return (
          <>
            just added a new <strong>{tempLabel}</strong> lead: <strong>{activity.entity_name}</strong>
          </>
        );
      case 'updated_lead':
        const oldStage = activity.details?.old_stage;
        const newStage = activity.details?.new_stage;
        const isPositive = ['Sales Pitch Meeting', 'Interested', 'Follow-up Resources Sent'].includes(newStage);
        return (
          <>
            moved <strong>{activity.entity_name}</strong> from <span className="stage-badge">{oldStage}</span> to <span className={`stage-badge ${isPositive ? 'stage-badge--positive' : ''}`}>{newStage}</span>
          </>
        );
      case 'added_builder':
        const cohort = activity.details?.cohort;
        const role = activity.details?.role;
        return (
          <>
            added a new Builder to <strong>{cohort}</strong>: <strong>{activity.entity_name}</strong>
            {role && ` (${role})`}
          </>
        );
      default:
        return activity.entity_name;
    }
  };

  // Get celebration message for positive updates
  const getCelebration = (activity) => {
    if (activity.action_type === 'updated_lead') {
      const newStage = activity.details?.new_stage;
      switch (newStage) {
        case 'Interested':
          return 'They\'re interested! Great work! 🎊';
        case 'Sales Pitch Meeting':
          return 'Meeting secured! Let\'s go! 💪';
        case 'Follow-up Resources Sent':
          return 'Resources sent! Keep the momentum! 🚀';
        default:
          return null;
      }
    }
    if (activity.action_type === 'added_lead' && activity.details?.temperature === 'hot') {
      return 'Hot lead alert! This one\'s promising! 🎯';
    }
    if (activity.action_type === 'added_builder') {
      return 'Welcome to the team! 🎈';
    }
    return null;
  };

  // Format time ago
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const created = new Date(timestamp);
    const seconds = Math.floor((now - created) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return created.toLocaleDateString();
  };

  // Get avatar color based on name
  const getAvatarColor = (name) => {
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div className="overview">
      <header className="overview__header">
        <div className="overview__header-content">
          <div className="overview__title-container">
            <PursuitLogo className="overview__logo" width="140" height="50" />
            <h1 className="overview__title">Talent & Partnership Tracker</h1>
          </div>
          <div className="overview__user">
            <span className="overview__user-name">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="overview__button overview__button--logout"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="overview__nav">
        <button 
          className="overview__nav-item"
          onClick={() => navigate('/overview')}
        >
          Overview
        </button>
        <button 
          className="overview__nav-item"
          onClick={() => navigate('/leads')}
        >
          All Leads
        </button>
        <button 
          className="overview__nav-item"
          onClick={() => navigate('/builders')}
        >
          Builders
        </button>
        <button className="overview__nav-item overview__nav-item--active">
          Activity Feed
        </button>
        <button 
          className="overview__nav-item"
          onClick={() => navigate('/actions')}
        >
          Quick Actions
        </button>
      </nav>

      <main className="overview__main">
        <div className="activity-feed">
          <div className="activity-feed__header">
            <h2 className="activity-feed__title">🎉 Activity Feed</h2>
            <p className="activity-feed__subtitle">See what the team has been up to!</p>
          </div>

          {loading ? (
            <div className="activity-feed__loading">
              <div className="spinner"></div>
              <p>Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="activity-feed__empty">
              <div className="activity-feed__empty-icon">📭</div>
              <h3>No activity yet!</h3>
              <p>Start adding leads and builders to see activity here.</p>
            </div>
          ) : (
            <div className="activity-feed__list">
              {activities.map((activity) => {
                const celebration = getCelebration(activity);
                return (
                  <div key={activity.id} className="activity-card">
                    <div className="activity-card__avatar" style={{ backgroundColor: getAvatarColor(activity.user_name) }}>
                      {activity.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="activity-card__content">
                      <div className="activity-card__header">
                        <span className="activity-card__user">{activity.user_name}</span>
                        <span className="activity-card__time">{getTimeAgo(activity.created_at)}</span>
                      </div>
                      <div className="activity-card__message">
                        <span className="activity-card__emoji">{getActivityEmoji(activity)}</span>
                        {getActivityMessage(activity)}
                      </div>
                      {celebration && (
                        <div className="activity-card__celebration">
                          {celebration}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ActivityFeed;
