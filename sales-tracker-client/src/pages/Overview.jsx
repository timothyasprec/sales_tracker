import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { outreachAPI, jobPostingAPI, builderAPI, activityAPI } from '../services/api';
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
  const [sectorData, setSectorData] = useState([]);
  const [contributorData, setContributorData] = useState([]);

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
      const activitiesData = await activityAPI.getAllActivities();

      // Store raw data for modals
      window.overviewData = {
        outreach: outreachData,
        jobPostings: jobPostingsData,
        builders: buildersData,
        activities: activitiesData
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

      // Calculate sector data for bar chart
      const sectorCounts = {};
      outreachData.forEach(lead => {
        if (lead.lead_type === 'contact' || !lead.lead_type) {
          const sectors = typeof lead.aligned_sector === 'string' 
            ? JSON.parse(lead.aligned_sector || '[]') 
            : lead.aligned_sector || [];
          
          sectors.forEach(sector => {
            if (sector) {
              if (!sectorCounts[sector]) {
                sectorCounts[sector] = { count: 0, companies: [] };
              }
              sectorCounts[sector].count++;
              sectorCounts[sector].companies.push({
                name: lead.company_name,
                contact: lead.contact_name,
                temperature: lead.lead_temperature
              });
            }
          });
        }
      });

      const sectorArray = Object.entries(sectorCounts).map(([sector, data]) => ({
        sector,
        count: data.count,
        companies: data.companies
      })).sort((a, b) => b.count - a.count);

      setSectorData(sectorArray);

      // Calculate Top 5 Contributors (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const contributorCounts = {};

      // Count leads created by each user in last 30 days
      outreachData.forEach(lead => {
        if (lead.lead_type === 'contact' || !lead.lead_type) {
          const createdDate = new Date(lead.created_at);
          if (createdDate >= thirtyDaysAgo && lead.ownership) {
            if (!contributorCounts[lead.ownership]) {
              contributorCounts[lead.ownership] = { leads: 0, jobPosts: 0, builders: 0, updates: 0 };
            }
            contributorCounts[lead.ownership].leads++;
          }
        }
      });

      // Count job postings created by each user in last 30 days
      jobPostingsData.forEach(job => {
        const createdDate = new Date(job.created_at);
        if (createdDate >= thirtyDaysAgo && job.ownership) {
          if (!contributorCounts[job.ownership]) {
            contributorCounts[job.ownership] = { leads: 0, jobPosts: 0, builders: 0, updates: 0 };
          }
          contributorCounts[job.ownership].jobPosts++;
        }
      });

      // Count builders created by each user in last 30 days
      buildersData.forEach(builder => {
        const createdDate = new Date(builder.created_at);
        if (createdDate >= thirtyDaysAgo) {
          // Try to get the creator from activities or use a default
          const creator = builder.created_by || 'System';
          if (!contributorCounts[creator]) {
            contributorCounts[creator] = { leads: 0, jobPosts: 0, builders: 0, updates: 0 };
          }
          contributorCounts[creator].builders++;
        }
      });

      // Count updates (activity log entries) by each user in last 30 days
      activitiesData.forEach(activity => {
        const activityDate = new Date(activity.created_at);
        if (activityDate >= thirtyDaysAgo && activity.user_name) {
          if (!contributorCounts[activity.user_name]) {
            contributorCounts[activity.user_name] = { leads: 0, jobPosts: 0, builders: 0, updates: 0 };
          }
          // Only count update-type activities
          if (activity.action_type?.includes('update')) {
            contributorCounts[activity.user_name].updates++;
          }
        }
      });

      // Calculate totals and sort
      const contributorArray = Object.entries(contributorCounts).map(([name, counts]) => ({
        name,
        leads: counts.leads,
        jobPosts: counts.jobPosts,
        builders: counts.builders,
        updates: counts.updates,
        total: counts.leads + counts.jobPosts + counts.builders + counts.updates
      }))
      .filter(c => c.total > 0) // Only include contributors with activity
      .sort((a, b) => b.total - a.total)
      .slice(0, 5); // Top 5 only

      setContributorData(contributorArray);
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

  const handleSectorClick = (sectorInfo) => {
    setModalData(sectorInfo.companies);
    setActiveModal('sector');
    setActiveModalTitle(`${sectorInfo.sector} - ${sectorInfo.count} Companies`);
  };

  const handleContributorClick = (contributor) => {
    setModalData(contributor);
    setActiveModal('contributor');
    setActiveModalTitle(`${contributor.name} - Activity Breakdown`);
  };

  const [activeModalTitle, setActiveModalTitle] = useState('');

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

          {/* Charts Section */}
          {!loading && (
            <div className="overview__charts">
              {/* Bar Chart - Aligned Sectors */}
              <div className="overview__chart-container">
                <div className="overview__chart-header">
                  <h3 className="overview__chart-title">Companies by Aligned Sector</h3>
                  <p className="overview__chart-subtitle">Click on a bar to see companies</p>
                </div>
                <div className="overview__bar-chart">
                  {sectorData.length > 0 ? (
                    <div className="overview__bar-chart-content">
                  {sectorData.map((item, index) => {
                    const maxCount = Math.max(...sectorData.map(s => s.count));
                    const widthPercent = (item.count / maxCount) * 100;
                    
                    // Generate color gradient: Green (highest) → Yellow (medium) → Red (lowest)
                    const colorPosition = (item.count / maxCount);
                    
                    // Use HSL color space: 120 (green) → 60 (yellow) → 0 (red)
                    const hue = 120 * colorPosition; // 0 (red) to 120 (green), higher count = greener
                    const saturation = 70; // Consistent saturation for cleaner look
                    const lightness = 65; // Consistent lightness
                    const barColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                    
                    return (
                      <div
                        key={item.sector}
                        className="overview__bar-item-horizontal"
                        onClick={() => handleSectorClick(item)}
                      >
                        <div className="overview__bar-label-horizontal">{item.sector}</div>
                        <div className="overview__bar-wrapper-horizontal">
                          <div
                            className="overview__bar-horizontal"
                            style={{ 
                              width: `${widthPercent}%`,
                              background: `linear-gradient(90deg, ${barColor}, ${barColor})`
                            }}
                          >
                            <span className="overview__bar-count-horizontal">{item.count}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                    </div>
                  ) : (
                    <div className="overview__chart-empty">
                      No sector data available yet
                    </div>
                  )}
                </div>
              </div>

              {/* Top 5 Contributors - Stacked Bar Chart */}
              <div className="overview__chart-container">
                <div className="overview__chart-header">
                  <h3 className="overview__chart-title">Top 5 Contributors (Last 30 Days)</h3>
                  <p className="overview__chart-subtitle">Leads, Job Posts, Builders, and Updates</p>
                </div>
                <div className="overview__contributors-chart">
                  {contributorData.length > 0 ? (
                    <div className="overview__contributors-content">
                      <div className="overview__contributors-legend">
                        <div className="overview__legend-item">
                          <div className="overview__legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
                          <span className="overview__legend-label">Leads</span>
                        </div>
                        <div className="overview__legend-item">
                          <div className="overview__legend-color" style={{ backgroundColor: '#eab308' }}></div>
                          <span className="overview__legend-label">Job Posts</span>
                        </div>
                        <div className="overview__legend-item">
                          <div className="overview__legend-color" style={{ backgroundColor: '#10b981' }}></div>
                          <span className="overview__legend-label">Builders</span>
                        </div>
                        <div className="overview__legend-item">
                          <div className="overview__legend-color" style={{ backgroundColor: '#a855f7' }}></div>
                          <span className="overview__legend-label">Updates</span>
                        </div>
                      </div>
                      {contributorData.map((contributor, index) => {
                        const maxTotal = Math.max(...contributorData.map(c => c.total));
                        const widthPercent = (contributor.total / maxTotal) * 100;
                        
                        // Calculate segment widths as percentages of the total bar
                        const leadsPercent = (contributor.leads / contributor.total) * 100;
                        const jobPostsPercent = (contributor.jobPosts / contributor.total) * 100;
                        const buildersPercent = (contributor.builders / contributor.total) * 100;
                        const updatesPercent = (contributor.updates / contributor.total) * 100;
                        
                        return (
                          <div
                            key={contributor.name}
                            className="overview__contributor-row"
                            onClick={() => handleContributorClick(contributor)}
                            title={`${contributor.name}: ${contributor.leads} leads, ${contributor.jobPosts} job posts, ${contributor.builders} builders, ${contributor.updates} updates (Total: ${contributor.total})`}
                          >
                            <div className="overview__contributor-name">{contributor.name}</div>
                            <div className="overview__contributor-bar-wrapper">
                              <div
                                className="overview__contributor-bar"
                                style={{ width: `${widthPercent}%` }}
                              >
                                {contributor.leads > 0 && (
                                  <div
                                    className="overview__contributor-segment overview__contributor-segment--leads"
                                    style={{ width: `${leadsPercent}%` }}
                                    title={`${contributor.leads} leads`}
                                  ></div>
                                )}
                                {contributor.jobPosts > 0 && (
                                  <div
                                    className="overview__contributor-segment overview__contributor-segment--jobs"
                                    style={{ width: `${jobPostsPercent}%` }}
                                    title={`${contributor.jobPosts} job posts`}
                                  ></div>
                                )}
                                {contributor.builders > 0 && (
                                  <div
                                    className="overview__contributor-segment overview__contributor-segment--builders"
                                    style={{ width: `${buildersPercent}%` }}
                                    title={`${contributor.builders} builders`}
                                  ></div>
                                )}
                                {contributor.updates > 0 && (
                                  <div
                                    className="overview__contributor-segment overview__contributor-segment--updates"
                                    style={{ width: `${updatesPercent}%` }}
                                    title={`${contributor.updates} updates`}
                                  ></div>
                                )}
                              </div>
                              <span className="overview__contributor-total">{contributor.total}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="overview__chart-empty">
                      No contributor data available yet
                    </div>
                  )}
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
                {(activeModal === 'sector' || activeModal === 'contributor') && activeModalTitle}
              </h2>
              <button className="overview__modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="overview__modal-content">
              <div className="overview__modal-metric">
                {activeModal === 'contributor' ? modalData.total : modalData.length}
              </div>
              <p className="overview__modal-description">
                {activeModal === 'leads' && 'Contact outreach leads from your "Add New Lead" form.'}
                {activeModal === 'jobPostings' && 'Job postings you\'ve added to track opportunities.'}
                {activeModal === 'builders' && 'Builders currently active in the pipeline.'}
                {activeModal === 'hired' && 'Builders who have been successfully placed.'}
                {activeModal === 'sector' && 'Companies in this aligned sector.'}
                {activeModal === 'contributor' && 'Total activity count in the last 30 days.'}
              </p>

              {(Array.isArray(modalData) && modalData.length > 0) || (activeModal === 'contributor' && modalData.total > 0) ? (
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

                  {activeModal === 'sector' && modalData.map((company, index) => (
                    <div key={index} className="overview__modal-item">
                      <div className="overview__modal-item-name">
                        {company.name}
                      </div>
                      <div className="overview__modal-item-detail">
                        {company.contact && `Contact: ${company.contact}`}
                        {company.temperature && ` | Temperature: ${company.temperature.toUpperCase()}`}
                      </div>
                    </div>
                  ))}

                  {activeModal === 'contributor' && (
                    <div className="overview__contributor-breakdown">
                      <div className="overview__contributor-stats">
                        <div className="overview__contributor-stat-item">
                          <div className="overview__contributor-stat-icon" style={{ backgroundColor: '#3b82f6' }}>
                            📋
                          </div>
                          <div className="overview__contributor-stat-info">
                            <div className="overview__contributor-stat-label">Leads</div>
                            <div className="overview__contributor-stat-value">{modalData.leads}</div>
                          </div>
                        </div>
                        <div className="overview__contributor-stat-item">
                          <div className="overview__contributor-stat-icon" style={{ backgroundColor: '#eab308' }}>
                            💼
                          </div>
                          <div className="overview__contributor-stat-info">
                            <div className="overview__contributor-stat-label">Job Posts</div>
                            <div className="overview__contributor-stat-value">{modalData.jobPosts}</div>
                          </div>
                        </div>
                        <div className="overview__contributor-stat-item">
                          <div className="overview__contributor-stat-icon" style={{ backgroundColor: '#10b981' }}>
                            👥
                          </div>
                          <div className="overview__contributor-stat-info">
                            <div className="overview__contributor-stat-label">Builders</div>
                            <div className="overview__contributor-stat-value">{modalData.builders}</div>
                          </div>
                        </div>
                        <div className="overview__contributor-stat-item">
                          <div className="overview__contributor-stat-icon" style={{ backgroundColor: '#a855f7' }}>
                            🔄
                          </div>
                          <div className="overview__contributor-stat-info">
                            <div className="overview__contributor-stat-label">Updates</div>
                            <div className="overview__contributor-stat-value">{modalData.updates}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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

