import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { outreachAPI } from '../services/api';
import '../styles/Overview.css';
import '../styles/AllLeads.css';

const AllLeads = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, activeFilter]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await outreachAPI.getAllOutreach();
      // Sort by most recent interaction (updated_at or outreach_date)
      const sorted = data.sort((a, b) => {
        const dateA = new Date(a.updated_at || a.outreach_date);
        const dateB = new Date(b.updated_at || b.outreach_date);
        return dateB - dateA;
      });
      setLeads(sorted);
      setFilteredLeads(sorted);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = [...leads];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.contact_title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'hot') {
        filtered = filtered.filter(lead =>
          ['interested', 'meeting_scheduled', 'opportunity_created'].includes(lead.status)
        );
      } else if (activeFilter === 'warm') {
        filtered = filtered.filter(lead =>
          ['responded'].includes(lead.status)
        );
      } else if (activeFilter === 'cold') {
        filtered = filtered.filter(lead =>
          ['attempted', 'no_response', 'not_interested'].includes(lead.status)
        );
      } else if (activeFilter === 'my-leads') {
        filtered = filtered.filter(lead => lead.staff_user_id === user?.id);
      }
    }

    setFilteredLeads(filtered);
  };

  const getLeadTemp = (status) => {
    if (['interested', 'meeting_scheduled', 'opportunity_created'].includes(status)) {
      return 'HOT';
    } else if (['responded'].includes(status)) {
      return 'WARM';
    } else {
      return 'COLD';
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffTime = Math.abs(now - past);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
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
        <button className="overview__nav-item overview__nav-item--active">
          All Leads
        </button>
        <button 
          className="overview__nav-item"
          onClick={() => navigate('/builders')}
        >
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
        <div className="all-leads">
          <h2 className="all-leads__title">All Leads</h2>

          {/* Search Bar */}
          <div className="all-leads__search-container">
            <div className="all-leads__search-box">
              <svg className="all-leads__search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                className="all-leads__search-input"
                placeholder="Search leads, companies, or contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="all-leads__filter-button">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2.5 5.83h15M5.83 10h8.34M8.33 14.17h3.34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Filters
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="all-leads__tabs">
            <button
              className={`all-leads__tab ${activeFilter === 'all' ? 'all-leads__tab--active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Leads
            </button>
            <button
              className={`all-leads__tab ${activeFilter === 'hot' ? 'all-leads__tab--active' : ''}`}
              onClick={() => setActiveFilter('hot')}
            >
              Hot
            </button>
            <button
              className={`all-leads__tab ${activeFilter === 'warm' ? 'all-leads__tab--active' : ''}`}
              onClick={() => setActiveFilter('warm')}
            >
              Warm
            </button>
            <button
              className={`all-leads__tab ${activeFilter === 'cold' ? 'all-leads__tab--active' : ''}`}
              onClick={() => setActiveFilter('cold')}
            >
              Cold
            </button>
            <button
              className={`all-leads__tab ${activeFilter === 'my-leads' ? 'all-leads__tab--active' : ''}`}
              onClick={() => setActiveFilter('my-leads')}
            >
              My Leads
            </button>
          </div>

          {/* Leads List */}
          {loading ? (
            <div className="all-leads__loading">Loading leads...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="all-leads__empty">
              <p>No leads found. {searchTerm && 'Try a different search term.'}</p>
            </div>
          ) : (
            <div className="all-leads__list">
              {filteredLeads.map(lead => (
                <div key={lead.id} className="all-leads__card">
                  <div className="all-leads__card-content">
                    <div className="all-leads__card-header">
                      <div className="all-leads__card-title-row">
                        <h3 className="all-leads__card-name">
                          {lead.contact_name || 'Unknown Contact'}
                        </h3>
                        <span className={`all-leads__temp-badge all-leads__temp-badge--${getLeadTemp(lead.status).toLowerCase()}`}>
                          {getLeadTemp(lead.status)}
                        </span>
                        <span className="all-leads__source-badge">
                          {lead.contact_method || 'Professional Network'}
                        </span>
                      </div>
                      <button className="all-leads__view-details">
                        View Details
                      </button>
                    </div>
                    <p className="all-leads__company">{lead.company_name}</p>
                    <div className="all-leads__meta">
                      <span className="all-leads__status">
                        Status: <strong>{lead.status.replace(/_/g, ' ')}</strong>
                      </span>
                      <span className="all-leads__contact">
                        Last Contact: <strong>{getTimeAgo(lead.updated_at || lead.outreach_date)}</strong>
                      </span>
                    </div>
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

export default AllLeads;

