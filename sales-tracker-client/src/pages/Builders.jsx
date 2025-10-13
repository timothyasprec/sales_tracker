import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import '../styles/Overview.css';

const Builders = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="overview">
      <header className="overview__header">
        <div className="overview__header-content">
          <h1 className="overview__title">Sales & Hiring Tracker</h1>
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
        <button className="overview__nav-item overview__nav-item--active">
          Builders
        </button>
        <button 
          className="overview__nav-item"
          onClick={() => navigate('/activity')}
        >
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
        <div className="overview__content">
          <h2 className="overview__section-title">Builders</h2>
          <p className="overview__section-subtitle">Coming soon - Manage Fellowship builders and candidates</p>
        </div>
      </main>
    </div>
  );
};

export default Builders;

