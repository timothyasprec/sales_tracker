import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { builderAPI } from '../services/api';
import '../styles/Overview.css';
import '../styles/Builders.css';

const Builders = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [builders, setBuilders] = useState([]);
  const [filteredBuilders, setFilteredBuilders] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCohort, setSelectedCohort] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterBuilders();
  }, [builders, searchTerm, selectedCohort, selectedStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [buildersData, cohortsData] = await Promise.all([
        builderAPI.getAllBuilders(),
        builderAPI.getAllCohorts()
      ]);
      setBuilders(buildersData);
      setFilteredBuilders(buildersData);
      setCohorts(cohortsData);
    } catch (error) {
      console.error('Error fetching builders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBuilders = () => {
    let filtered = [...builders];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(builder =>
        builder.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        builder.skills?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        builder.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply cohort filter
    if (selectedCohort !== 'all') {
      filtered = filtered.filter(builder => builder.cohort === selectedCohort);
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(builder => builder.status === selectedStatus);
    }

    setFilteredBuilders(filtered);
  };

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
        <div className="builders">
          <h2 className="builders__title">Builders</h2>

          {/* Search Bar */}
          <div className="builders__search-container">
            <div className="builders__search-box">
              <svg className="builders__search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                className="builders__search-input"
                placeholder="Search builders by name or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className="builders__filter-button"
              onClick={() => setShowFilters(!showFilters)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2.5 5.83h15M5.83 10h8.34M8.33 14.17h3.34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="builders__filters-panel">
              <div className="builders__filter-group">
                <label className="builders__filter-label">Cohort:</label>
                <select
                  value={selectedCohort}
                  onChange={(e) => setSelectedCohort(e.target.value)}
                  className="builders__filter-select"
                >
                  <option value="all">All Cohorts</option>
                  {cohorts.map(cohort => (
                    <option key={cohort} value={cohort}>{cohort}</option>
                  ))}
                </select>
              </div>

              <div className="builders__filter-group">
                <label className="builders__filter-label">Status:</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="builders__filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="placed">Placed</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSelectedCohort('all');
                  setSelectedStatus('all');
                  setSearchTerm('');
                }}
                className="builders__clear-filters"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Builders List */}
          {loading ? (
            <div className="builders__loading">Loading builders...</div>
          ) : filteredBuilders.length === 0 ? (
            <div className="builders__empty">
              <p>No builders found. {searchTerm && 'Try a different search term.'}</p>
            </div>
          ) : (
            <div className="builders__list">
              {filteredBuilders.map(builder => (
                <div key={builder.id} className="builders__card">
                  <div className="builders__card-content">
                    <div className="builders__card-header">
                      <div className="builders__card-title-row">
                        <h3 className="builders__card-name">{builder.name}</h3>
                        <span className={`builders__status-badge builders__status-badge--${builder.status}`}>
                          {builder.status.charAt(0).toUpperCase() + builder.status.slice(1)}
                        </span>
                      </div>
                      <button className="builders__edit-button">
                        Edit Profile
                      </button>
                    </div>
                    <p className="builders__role">{builder.role || 'No role specified'}</p>
                    <p className="builders__meta">
                      {builder.potential_matches} potential match{builder.potential_matches !== 1 ? 'es' : ''}
                    </p>
                    {builder.cohort && (
                      <span className="builders__cohort-badge">{builder.cohort}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Builders;

