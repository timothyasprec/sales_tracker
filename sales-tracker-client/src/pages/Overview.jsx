import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { outreachAPI, jobPostingAPI, builderAPI } from '../services/api';
import '../styles/Overview.css';

const Overview = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    leadsThisWeek: 0,
    activeBuilders: 34,
    jobPostings: 0,
    jobPostingsThisWeek: 0,
    placements: 12,
    placementGoal: 34
  });
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState([]);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Fetch all data
      const outreachData = await outreachAPI.getAllOutreach();
      const jobPostingsData = await jobPostingAPI.getAllJobPostings();
      const buildersData = await builderAPI.getAllBuilders();

      // Store raw data for modals
      window.overviewData = {
        outreach: outreachData,
        jobPostings: jobPostingsData,
        builders: buildersData
      };

      // Calculate total leads (only contact outreach leads from "Add New Lead" form)
      const totalLeads = outreachData.filter(lead => 
        lead.lead_type === 'contact' || !lead.lead_type
      ).length;

      // Calculate job postings count
      const jobPostings = jobPostingsData.length;

      // Calculate leads this week (only contact outreach)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const leadsThisWeek = outreachData.filter(item => {
        const createdDate = new Date(item.created_at);
        const isContactLead = item.lead_type === 'contact' || !item.lead_type;
        return createdDate >= oneWeekAgo && isContactLead;
      }).length;

      // Calculate job postings this week
      const jobPostingsThisWeek = jobPostingsData.filter(item => {
        const createdDate = new Date(item.created_at);
        return createdDate >= oneWeekAgo;
      }).length;

      // Calculate active builders (status = 'active')
      const activeBuilders = buildersData.filter(builder => 
        builder.status === 'active'
      ).length;

      // Calculate placements (builders with status = 'placed')
      const placements = buildersData.filter(builder => 
        builder.status === 'placed'
      ).length;

      // Calculate placement goal (total active builders)
      const placementGoal = buildersData.length;

      setMetrics({
        totalLeads,
        leadsThisWeek,
        activeBuilders,
        jobPostings,
        jobPostingsThisWeek,
        placements,
        placementGoal
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCardClick = (type) => {
    const data = window.overviewData || { outreach: [], jobPostings: [], builders: [] };
    
    switch(type) {
      case 'leads':
        const leads = data.outreach.filter(lead => lead.lead_type === 'contact' || !lead.lead_type);
        setModalData(leads);
        setActiveModal('leads');
        break;
      case 'jobPostings':
        setModalData(data.jobPostings);
        setActiveModal('jobPostings');
        break;
      case 'builders':
        const activeBuilders = data.builders.filter(builder => builder.status === 'active');
        setModalData(activeBuilders);
        setActiveModal('builders');
        break;
      case 'hired':
        const hiredBuilders = data.builders.filter(builder => builder.status === 'placed');
        setModalData(hiredBuilders);
        setActiveModal('hired');
        break;
      default:
        break;
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData([]);
  };

  return (
    <div className="overview">
      <header className="overview__header">
        <div className="overview__header-content">
          <h1 className="overview__title">Pursuit, Talent & Partnership Tracker</h1>
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
        <button className="overview__nav-item overview__nav-item--active">
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
          <div className="overview__section-header">
            <h2 className="overview__section-title">Dashboard Overview</h2>
            <p className="overview__section-subtitle">Key metrics and performance indicators</p>
          </div>

          {loading ? (
            <div className="overview__loading">Loading metrics...</div>
          ) : (
            <div className="overview__metrics">
              {/* Total Leads */}
              <div className="overview__metric-card overview__metric-card--blue" onClick={() => handleCardClick('leads')}>
                <div className="overview__metric-header">
                  <span className="overview__metric-label">Total Leads</span>
                  <div className="overview__metric-icon overview__metric-icon--blue">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  </div>
                </div>
                <div className="overview__metric-value">{metrics.totalLeads}</div>
                <div className="overview__metric-footer">
                  <span className="overview__metric-change overview__metric-change--positive">
                    ↑ {metrics.leadsThisWeek} this week
                  </span>
                </div>
              </div>

              {/* Job Postings */}
              <div className="overview__metric-card overview__metric-card--yellow" onClick={() => handleCardClick('jobPostings')}>
                <div className="overview__metric-header">
                  <span className="overview__metric-label">Job Postings</span>
                  <div className="overview__metric-icon overview__metric-icon--yellow">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                </div>
                <div className="overview__metric-value">{metrics.jobPostings}</div>
                <div className="overview__metric-footer">
                  <span className="overview__metric-change overview__metric-change--positive">
                    ↑ {metrics.jobPostingsThisWeek} this week
                  </span>
                </div>
              </div>

              {/* Active Builders */}
              <div className="overview__metric-card overview__metric-card--red" onClick={() => handleCardClick('builders')}>
                <div className="overview__metric-header">
                  <span className="overview__metric-label">Active Builders</span>
                  <div className="overview__metric-icon overview__metric-icon--red">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                </div>
                <div className="overview__metric-value">{metrics.activeBuilders}</div>
                <div className="overview__metric-footer">
                  <span className="overview__metric-info">In pipeline</span>
                </div>
              </div>

              {/* Hired */}
              <div className="overview__metric-card overview__metric-card--green" onClick={() => handleCardClick('hired')}>
                <div className="overview__metric-header">
                  <span className="overview__metric-label">Hired</span>
                  <div className="overview__metric-icon overview__metric-icon--green">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                </div>
                <div className="overview__metric-value">{metrics.placements}</div>
                <div className="overview__metric-footer">
                  <span className="overview__metric-info">Goal: {metrics.placementGoal}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {activeModal && (
        <div className="overview__modal-overlay" onClick={closeModal}>
          <div className="overview__modal" onClick={(e) => e.stopPropagation()}>
            <div className="overview__modal-header">
              <h2 className="overview__modal-title">
                {activeModal === 'leads' && 'Total Leads Details'}
                {activeModal === 'jobPostings' && 'Job Postings Details'}
                {activeModal === 'builders' && 'Active Builders Details'}
                {activeModal === 'hired' && 'Hired Builders Details'}
              </h2>
              <button className="overview__modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="overview__modal-content">
              <div className="overview__modal-metric">{modalData.length}</div>
              <p className="overview__modal-description">
                {activeModal === 'leads' && 'Contact outreach leads from your "Add New Lead" form.'}
                {activeModal === 'jobPostings' && 'Job postings you\'ve added to track opportunities.'}
                {activeModal === 'builders' && 'Builders currently active in the pipeline.'}
                {activeModal === 'hired' && 'Builders who have been successfully placed.'}
              </p>

              {modalData.length > 0 ? (
                <div className="overview__modal-list">
                  {activeModal === 'leads' && modalData.map((lead) => (
                    <div key={lead.id} className="overview__modal-item">
                      <div className="overview__modal-item-name">
                        {lead.contact_name} - {lead.company_name}
                      </div>
                      <div className="overview__modal-item-detail">
                        Stage: {lead.stage} | Temperature: {lead.lead_temperature?.toUpperCase()}
                        {lead.ownership && ` | Owner: ${lead.ownership}`}
                      </div>
                    </div>
                  ))}

                  {activeModal === 'jobPostings' && modalData.map((job) => (
                    <div key={job.id} className="overview__modal-item">
                      <div className="overview__modal-item-name">
                        {job.job_title} at {job.company_name}
                      </div>
                      <div className="overview__modal-item-detail">
                        Level: {job.experience_level}
                        {job.ownership && ` | Posted by: ${job.ownership}`}
                      </div>
                    </div>
                  ))}

                  {(activeModal === 'builders' || activeModal === 'hired') && modalData.map((builder) => (
                    <div key={builder.id} className="overview__modal-item">
                      <div className="overview__modal-item-name">
                        {builder.name}
                      </div>
                      <div className="overview__modal-item-detail">
                        {builder.role && `Role: ${builder.role}`}
                        {builder.cohort && ` | Cohort: ${builder.cohort}`}
                        {builder.job_search_status && ` | Status: ${builder.job_search_status.replace(/_/g, ' ')}`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overview__modal-empty">
                  No data available yet. Start adding items to see them here!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;

