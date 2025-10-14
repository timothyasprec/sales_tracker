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
  const [sectorData, setSectorData] = useState([]);
  const [sourceData, setSourceData] = useState([]);

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

      // Calculate source data for donut chart
      const sourceCounts = {};
      outreachData.forEach(lead => {
        if (lead.lead_type === 'contact' || !lead.lead_type) {
          const source = lead.source || lead.contact_method || 'Unknown';
          if (!sourceCounts[source]) {
            sourceCounts[source] = { 
              count: 0, 
              hot: 0, 
              warm: 0, 
              cold: 0,
              leads: [] 
            };
          }
          sourceCounts[source].count++;
          sourceCounts[source].leads.push(lead);
          
          const temp = lead.lead_temperature?.toLowerCase() || 'cold';
          if (temp === 'hot') sourceCounts[source].hot++;
          else if (temp === 'warm') sourceCounts[source].warm++;
          else sourceCounts[source].cold++;
        }
      });

      const sourceArray = Object.entries(sourceCounts).map(([source, data]) => ({
        source,
        count: data.count,
        hot: data.hot,
        warm: data.warm,
        cold: data.cold,
        leads: data.leads
      })).sort((a, b) => b.count - a.count);

      setSourceData(sourceArray);
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

  const handleSourceClick = (sourceInfo) => {
    setModalData(sourceInfo.leads);
    setActiveModal('source');
    setActiveModalTitle(`${sourceInfo.source} - Temperature Breakdown`);
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
                        
                        // Generate color gradient from cool (pastel blue) to warm (pastel orange/red)
                        // Higher counts get warmer colors
                        const colorPosition = (item.count / maxCount);
                        const hue = 200 - (colorPosition * 160); // 200 (blue) to 40 (orange) to 0 (red)
                        const saturation = 60 + (colorPosition * 20); // 60% to 80%
                        const lightness = 75 - (colorPosition * 10); // 75% to 65%
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

              {/* Donut Chart - Lead Sources */}
              <div className="overview__chart-container">
                <div className="overview__chart-header">
                  <h3 className="overview__chart-title">Leads by Source</h3>
                  <p className="overview__chart-subtitle">Click on a segment to see temperature breakdown</p>
                </div>
                <div className="overview__donut-chart">
                  {sourceData.length > 0 ? (
                    <>
                      <svg viewBox="0 0 200 200" className="overview__donut-svg">
                        {(() => {
                          const total = sourceData.reduce((sum, item) => sum + item.count, 0);
                          let currentAngle = -90; // Start from top
                          const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
                          
                          return sourceData.map((item, index) => {
                            const percentage = (item.count / total) * 100;
                            const angle = (percentage / 100) * 360;
                            const startAngle = currentAngle;
                            const endAngle = currentAngle + angle;
                            
                            // Calculate arc path
                            const startRad = (startAngle * Math.PI) / 180;
                            const endRad = (endAngle * Math.PI) / 180;
                            const radius = 80;
                            const innerRadius = 0; // Changed to 0 for full pie chart
                            
                            const x1 = 100 + radius * Math.cos(startRad);
                            const y1 = 100 + radius * Math.sin(startRad);
                            const x2 = 100 + radius * Math.cos(endRad);
                            const y2 = 100 + radius * Math.sin(endRad);
                            
                            const largeArc = angle > 180 ? 1 : 0;
                            
                            // Pie chart path (from center)
                            const path = `
                              M 100 100
                              L ${x1} ${y1}
                              A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
                              Z
                            `;
                            
                            currentAngle = endAngle;
                            
                            return (
                              <path
                                key={item.source}
                                d={path}
                                fill={colors[index % colors.length]}
                                className="overview__donut-segment"
                                onClick={() => handleSourceClick(item)}
                              />
                            );
                          });
                        })()}
                        <text x="100" y="100" textAnchor="middle" dy="0.3em" className="overview__donut-center-text">
                          {sourceData.reduce((sum, item) => sum + item.count, 0)}
                        </text>
                      </svg>
                      <div className="overview__donut-legend">
                        {sourceData.map((item, index) => {
                          const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
                          return (
                            <div key={item.source} className="overview__legend-item" onClick={() => handleSourceClick(item)}>
                              <div
                                className="overview__legend-color"
                                style={{ backgroundColor: colors[index % colors.length] }}
                              ></div>
                              <span className="overview__legend-label">{item.source}</span>
                              <span className="overview__legend-value">{item.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="overview__chart-empty">
                      No source data available yet
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
                {(activeModal === 'sector' || activeModal === 'source') && activeModalTitle}
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
                {activeModal === 'sector' && 'Companies in this aligned sector.'}
                {activeModal === 'source' && 'Leads from this source, grouped by temperature.'}
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

                  {activeModal === 'source' && (() => {
                    const hotLeads = modalData.filter(l => l.lead_temperature?.toLowerCase() === 'hot');
                    const warmLeads = modalData.filter(l => l.lead_temperature?.toLowerCase() === 'warm');
                    const coldLeads = modalData.filter(l => l.lead_temperature?.toLowerCase() === 'cold');
                    
                    return (
                      <>
                        {hotLeads.length > 0 && (
                          <>
                            <div className="overview__modal-section-title">🔥 Hot Leads ({hotLeads.length})</div>
                            {hotLeads.map((lead) => (
                              <div key={lead.id} className="overview__modal-item">
                                <div className="overview__modal-item-name">
                                  {lead.contact_name} - {lead.company_name}
                                </div>
                                <div className="overview__modal-item-detail">
                                  Stage: {lead.stage}
                                  {lead.ownership && ` | Owner: ${lead.ownership}`}
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                        
                        {warmLeads.length > 0 && (
                          <>
                            <div className="overview__modal-section-title">🟠 Warm Leads ({warmLeads.length})</div>
                            {warmLeads.map((lead) => (
                              <div key={lead.id} className="overview__modal-item">
                                <div className="overview__modal-item-name">
                                  {lead.contact_name} - {lead.company_name}
                                </div>
                                <div className="overview__modal-item-detail">
                                  Stage: {lead.stage}
                                  {lead.ownership && ` | Owner: ${lead.ownership}`}
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                        
                        {coldLeads.length > 0 && (
                          <>
                            <div className="overview__modal-section-title">❄️ Cold Leads ({coldLeads.length})</div>
                            {coldLeads.map((lead) => (
                              <div key={lead.id} className="overview__modal-item">
                                <div className="overview__modal-item-name">
                                  {lead.contact_name} - {lead.company_name}
                                </div>
                                <div className="overview__modal-item-detail">
                                  Stage: {lead.stage}
                                  {lead.ownership && ` | Owner: ${lead.ownership}`}
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </>
                    );
                  })()}
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

