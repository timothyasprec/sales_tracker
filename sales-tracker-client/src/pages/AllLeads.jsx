import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { outreachAPI, userAPI, activityAPI } from '../services/api';
import '../styles/Overview.css';
import '../styles/AllLeads.css';
import '../styles/QuickActions.css';

const AllLeads = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Modal state
  const [activeModal, setActiveModal] = useState(null);
  const [staffMembers, setStaffMembers] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form states
  const [newLeadForm, setNewLeadForm] = useState({
    lead_type: 'contact',
    company_name: '',
    contact_name: '',
    contact_title: '',
    contact_email: '',
    linkedin_url: '',
    outreach_date: new Date().toISOString().split('T')[0],
    lead_temperature: 'cold',
    source: 'personal',
    stage: 'Initial Outreach',
    ownership: user?.name || '',
    notes: '',
    aligned_sector: [], // New field for matching builders
    // Job posting specific fields
    job_title: '',
    job_posting_url: '',
    experience_level: ''
  });
  
  const [updateLeadForm, setUpdateLeadForm] = useState({
    search: '',
    selectedLead: null,
    stage: '',
    lead_temperature: '',
    notes: '',
    next_steps: ''
  });
  
  const [leadSearchResults, setLeadSearchResults] = useState([]);
  const [showMyLeadsOnly, setShowMyLeadsOnly] = useState(false);

  useEffect(() => {
    fetchLeads();
    fetchStaffMembers();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, activeFilter]);
  
  // Handle lead search for update form
  useEffect(() => {
    if (updateLeadForm.search.length > 1) {
      let filtered = leads.filter(lead =>
        lead.company_name?.toLowerCase().includes(updateLeadForm.search.toLowerCase()) ||
        lead.contact_name?.toLowerCase().includes(updateLeadForm.search.toLowerCase()) ||
        lead.contact_email?.toLowerCase().includes(updateLeadForm.search.toLowerCase())
      );
      
      if (showMyLeadsOnly) {
        filtered = filtered.filter(lead => lead.ownership === user?.name);
      }
      
      setLeadSearchResults(filtered.slice(0, 5));
    } else {
      setLeadSearchResults([]);
    }
  }, [updateLeadForm.search, leads, showMyLeadsOnly, user]);

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
  
  const fetchStaffMembers = async () => {
    try {
      const users = await userAPI.getAllUsers();
      setStaffMembers(users.filter(u => u.role === 'staff' || u.role === 'admin'));
    } catch (error) {
      console.error('Error fetching staff:', error);
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

  // Constants for forms
  const stages = [
    'Initial Outreach',
    'Email Campaign',
    'Follow-up',
    'Sales Pitch Meeting',
    'Follow-up Resources Sent',
    'Interested',
    'Not Interested'
  ];

  const sectors = [
    'Finance',
    'Marketing',
    'Government',
    'Health',
    'Technology',
    'Education',
    'Non-Profit',
    'Retail',
    'Other'
  ];

  const jobPostingSources = [
    'LinkedIn',
    'Indeed',
    'Company Site',
    'Referral'
  ];

  const experienceLevels = [
    'Entry-Level',
    'Mid-Level',
    'Senior'
  ];

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const closeModal = () => {
    setActiveModal(null);
    setNewLeadForm({
      lead_type: 'contact',
      company_name: '',
      contact_name: '',
      contact_title: '',
      contact_email: '',
      linkedin_url: '',
      outreach_date: new Date().toISOString().split('T')[0],
      lead_temperature: 'cold',
      source: 'personal',
      stage: 'Initial Outreach',
      ownership: user?.name || '',
      notes: '',
      aligned_sector: [],
      job_title: '',
      job_posting_url: '',
      experience_level: ''
    });
    setUpdateLeadForm({
      search: '',
      selectedLead: null,
      stage: '',
      lead_temperature: '',
      notes: '',
      next_steps: ''
    });
    setShowMyLeadsOnly(false);
  };

  const handleAddNewLead = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await outreachAPI.createOutreach(newLeadForm);
      
      await activityAPI.createActivity({
        user_name: user.name,
        action_type: 'added_lead',
        entity_type: 'lead',
        entity_name: `${newLeadForm.contact_name} - ${newLeadForm.company_name}`,
        details: {
          company: newLeadForm.company_name,
          temperature: newLeadForm.lead_temperature,
          source: newLeadForm.source
        }
      });
      
      showMessage('success', 'New lead added successfully!');
      closeModal();
      fetchLeads();
    } catch (error) {
      showMessage('error', 'Failed to add lead. Please try again.');
      console.error('Error adding lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLead = async (e) => {
    e.preventDefault();
    if (!updateLeadForm.selectedLead) {
      showMessage('error', 'Please select a lead to update.');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        stage: updateLeadForm.stage,
        lead_temperature: updateLeadForm.lead_temperature,
        notes: updateLeadForm.selectedLead.notes 
          ? `${updateLeadForm.selectedLead.notes}\n\n[${new Date().toLocaleDateString()}] ${updateLeadForm.notes}\nNext Steps: ${updateLeadForm.next_steps}`
          : `${updateLeadForm.notes}\nNext Steps: ${updateLeadForm.next_steps}`
      };

      await outreachAPI.updateOutreach(updateLeadForm.selectedLead.id, updateData);
      
      await activityAPI.createActivity({
        user_name: user.name,
        action_type: 'updated_lead',
        entity_type: 'lead',
        entity_name: `${updateLeadForm.selectedLead.contact_name} - ${updateLeadForm.selectedLead.company_name}`,
        details: {
          old_stage: updateLeadForm.selectedLead.stage,
          new_stage: updateLeadForm.stage,
          temperature: updateLeadForm.lead_temperature,
          company: updateLeadForm.selectedLead.company_name
        }
      });
      
      showMessage('success', 'Lead status updated successfully!');
      closeModal();
      fetchLeads();
    } catch (error) {
      showMessage('error', 'Failed to update lead. Please try again.');
      console.error('Error updating lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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

          {/* Action Buttons */}
          <div className="all-leads__action-buttons">
            <button
              className="action-button action-button--blue"
              onClick={() => setActiveModal('newLead')}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 5v10M5 10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add New Lead
            </button>
            <button
              className="action-button action-button--gray"
              onClick={() => setActiveModal('updateLead')}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
              </svg>
              Update Lead Status
            </button>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`quick-actions__message quick-actions__message--${message.type}`}>
              {message.text}
            </div>
          )}

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

          {/* Modals */}
          {activeModal && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={closeModal}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>

                {activeModal === 'newLead' && (
                  <form className="modal-form" onSubmit={handleAddNewLead}>
                    <h2 className="modal-title">Add New Lead</h2>

                    {/* Lead Type */}
                    <div className="form-section">
                      <label className="form-label">Lead Type</label>
                      <div className="button-group">
                        <button
                          type="button"
                          className={`button-option ${newLeadForm.lead_type === 'contact' ? 'button-option--active' : ''}`}
                          onClick={() => setNewLeadForm({...newLeadForm, lead_type: 'contact'})}
                        >
                          <div className="button-option__title">Contact Outreach</div>
                          <div className="button-option__subtitle">Individual contact at a company</div>
                        </button>
                        <button
                          type="button"
                          className={`button-option ${newLeadForm.lead_type === 'job' ? 'button-option--active' : ''}`}
                          onClick={() => setNewLeadForm({...newLeadForm, lead_type: 'job'})}
                        >
                          <div className="button-option__title">Job Posting</div>
                          <div className="button-option__subtitle">Specific job opportunity</div>
                        </button>
                      </div>
                    </div>

                    {/* Conditional Fields Based on Lead Type */}
                    {newLeadForm.lead_type === 'contact' ? (
                      <>
                        {/* Contact Outreach Fields */}
                        <div className="form-section">
                          <label className="form-label">Contact Name *</label>
                          <input
                            type="text"
                            required
                            value={newLeadForm.contact_name}
                            onChange={(e) => setNewLeadForm({...newLeadForm, contact_name: e.target.value})}
                            className="form-input"
                            placeholder="e.g., Sarah Chen"
                          />
                        </div>

                        <div className="form-section">
                          <label className="form-label">Company *</label>
                          <input
                            type="text"
                            required
                            value={newLeadForm.company_name}
                            onChange={(e) => setNewLeadForm({...newLeadForm, company_name: e.target.value})}
                            className="form-input"
                            placeholder="e.g., TechCorp Inc."
                          />
                        </div>

                        <div className="form-row">
                          <div className="form-section">
                            <label className="form-label">Role/Title</label>
                            <input
                              type="text"
                              value={newLeadForm.contact_title}
                              onChange={(e) => setNewLeadForm({...newLeadForm, contact_title: e.target.value})}
                              className="form-input"
                              placeholder="e.g., VP of Engineering"
                            />
                          </div>
                          <div className="form-section">
                            <label className="form-label">Email</label>
                            <input
                              type="email"
                              value={newLeadForm.contact_email}
                              onChange={(e) => setNewLeadForm({...newLeadForm, contact_email: e.target.value})}
                              className="form-input"
                              placeholder="email@company.com"
                            />
                          </div>
                        </div>

                        <div className="form-section">
                          <label className="form-label">LinkedIn URL</label>
                          <input
                            type="url"
                            value={newLeadForm.linkedin_url}
                            onChange={(e) => setNewLeadForm({...newLeadForm, linkedin_url: e.target.value})}
                            className="form-input"
                            placeholder="https://linkedin.com/in/..."
                          />
                        </div>

                        <div className="form-section">
                          <label className="form-label">Lead Temperature *</label>
                          <div className="button-group button-group--three">
                            <button
                              type="button"
                              className={`button-temp ${newLeadForm.lead_temperature === 'cold' ? 'button-temp--active button-temp--cold' : ''}`}
                              onClick={() => setNewLeadForm({...newLeadForm, lead_temperature: 'cold'})}
                            >
                              Cold
                            </button>
                            <button
                              type="button"
                              className={`button-temp ${newLeadForm.lead_temperature === 'warm' ? 'button-temp--active button-temp--warm' : ''}`}
                              onClick={() => setNewLeadForm({...newLeadForm, lead_temperature: 'warm'})}
                            >
                              Warm
                            </button>
                            <button
                              type="button"
                              className={`button-temp ${newLeadForm.lead_temperature === 'hot' ? 'button-temp--active button-temp--hot' : ''}`}
                              onClick={() => setNewLeadForm({...newLeadForm, lead_temperature: 'hot'})}
                            >
                              Hot
                            </button>
                          </div>
                        </div>

                        <div className="form-section">
                          <label className="form-label">Source *</label>
                          <div className="button-group button-group--three">
                            <button
                              type="button"
                              className={`button-source button-source--personal ${newLeadForm.source === 'personal' ? 'button-source--active' : ''}`}
                              onClick={() => setNewLeadForm({...newLeadForm, source: 'personal'})}
                            >
                              Personal Network
                            </button>
                            <button
                              type="button"
                              className={`button-source button-source--professional ${newLeadForm.source === 'professional' ? 'button-source--active' : ''}`}
                              onClick={() => setNewLeadForm({...newLeadForm, source: 'professional'})}
                            >
                              Professional Network
                            </button>
                            <button
                              type="button"
                              className={`button-source button-source--online ${newLeadForm.source === 'online' ? 'button-source--active' : ''}`}
                              onClick={() => setNewLeadForm({...newLeadForm, source: 'online'})}
                            >
                              Online/Research
                            </button>
                          </div>
                        </div>

                        <div className="form-section">
                          <label className="form-label">Initial Status</label>
                          <p className="form-help-text">Select the starting point for this lead based on your relationship</p>
                          <select
                            value={newLeadForm.stage}
                            onChange={(e) => setNewLeadForm({...newLeadForm, stage: e.target.value})}
                            className="form-select"
                          >
                            {stages.map(stage => (
                              <option key={stage} value={stage}>{stage}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Job Posting Fields */}
                        <div className="form-section">
                          <label className="form-label">Job Title *</label>
                          <input
                            type="text"
                            required
                            value={newLeadForm.job_title}
                            onChange={(e) => setNewLeadForm({...newLeadForm, job_title: e.target.value, contact_name: e.target.value})}
                            className="form-input"
                            placeholder="e.g., Full Stack Developer"
                          />
                        </div>

                        <div className="form-section">
                          <label className="form-label">Company Name *</label>
                          <input
                            type="text"
                            required
                            value={newLeadForm.company_name}
                            onChange={(e) => setNewLeadForm({...newLeadForm, company_name: e.target.value})}
                            className="form-input"
                            placeholder="e.g., TechCorp Inc."
                          />
                        </div>

                        <div className="form-section">
                          <label className="form-label">Job Posting URL *</label>
                          <input
                            type="url"
                            required
                            value={newLeadForm.job_posting_url}
                            onChange={(e) => setNewLeadForm({...newLeadForm, job_posting_url: e.target.value, linkedin_url: e.target.value})}
                            className="form-input"
                            placeholder="https://..."
                          />
                        </div>

                        <div className="form-row">
                          <div className="form-section">
                            <label className="form-label">Date Posted</label>
                            <input
                              type="date"
                              value={newLeadForm.outreach_date}
                              onChange={(e) => setNewLeadForm({...newLeadForm, outreach_date: e.target.value})}
                              className="form-input"
                            />
                          </div>
                          <div className="form-section">
                            <label className="form-label">Experience Level *</label>
                            <select
                              required
                              value={newLeadForm.experience_level}
                              onChange={(e) => setNewLeadForm({...newLeadForm, experience_level: e.target.value})}
                              className="form-select"
                            >
                              <option value="">Select Level</option>
                              {experienceLevels.map(level => (
                                <option key={level} value={level}>{level}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="form-section">
                          <label className="form-label">Source *</label>
                          <select
                            required
                            value={newLeadForm.source}
                            onChange={(e) => setNewLeadForm({...newLeadForm, source: e.target.value})}
                            className="form-select"
                          >
                            <option value="">Select Source</option>
                            {jobPostingSources.map(source => (
                              <option key={source} value={source.toLowerCase()}>{source}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {/* Aligned Sectors - For Both Types */}
                    <div className="form-section">
                      <label className="form-label">Aligned Sectors *</label>
                      <p className="form-help-text">Select all sectors where this lead would be a good fit</p>
                      <div className="sector-checkboxes">
                        {sectors.map(sector => (
                          <label key={sector} className="sector-checkbox-item">
                            <input
                              type="checkbox"
                              checked={newLeadForm.aligned_sector.includes(sector)}
                              onChange={(e) => {
                                const updatedSectors = e.target.checked
                                  ? [...newLeadForm.aligned_sector, sector]
                                  : newLeadForm.aligned_sector.filter(s => s !== sector);
                                setNewLeadForm({...newLeadForm, aligned_sector: updatedSectors});
                              }}
                              className="sector-checkbox"
                            />
                            <span className="sector-checkbox-text">{sector}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Ownership - For Both Types */}
                    <div className="form-section">
                      <label className="form-label">Ownership *</label>
                      <select
                        required
                        value={newLeadForm.ownership}
                        onChange={(e) => setNewLeadForm({...newLeadForm, ownership: e.target.value})}
                        className="form-select"
                      >
                        <option value="">Select Staff Member</option>
                        {staffMembers.map(member => (
                          <option key={member.id} value={member.name}>{member.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Notes / Comments - For Both Types */}
                    <div className="form-section">
                      <label className="form-label">Notes / Comments</label>
                      <p className="form-help-text">
                        {newLeadForm.lead_type === 'contact' 
                          ? 'Add any relevant notes about your relationship, the role, or the stage'
                          : 'e.g., "Looks aligned with AI Builders" or "Company is known for hiring apprentices"'
                        }
                      </p>
                      <textarea
                        value={newLeadForm.notes}
                        onChange={(e) => setNewLeadForm({...newLeadForm, notes: e.target.value})}
                        className="form-textarea"
                        rows="3"
                        placeholder="Add any relevant notes..."
                      />
                    </div>

                    {/* Actions */}
                    <div className="modal-actions">
                      <button type="button" onClick={closeModal} className="btn-secondary">
                        Cancel
                      </button>
                      <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Adding...' : 'Add Lead'}
                      </button>
                    </div>
                  </form>
                )}

                {activeModal === 'updateLead' && (
                  <form className="modal-form" onSubmit={handleUpdateLead}>
                    <h2 className="modal-title">Update Lead Status</h2>

                    {/* Search */}
                    <div className="form-section">
                      <label className="form-label">Select Contact/Lead</label>
                      <div className="search-container">
                        <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <input
                          type="text"
                          value={updateLeadForm.search}
                          onChange={(e) => setUpdateLeadForm({...updateLeadForm, search: e.target.value, selectedLead: null})}
                          className="form-input form-input--search"
                          placeholder="Search by name, company, or email..."
                        />
                      </div>
                      
                      {/* My Leads Toggle */}
                      <div className="my-leads-toggle">
                        <button
                          type="button"
                          className={`toggle-button ${showMyLeadsOnly ? 'toggle-button--active' : ''}`}
                          onClick={() => setShowMyLeadsOnly(!showMyLeadsOnly)}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: '6px' }}>
                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8 9.5c-2.67 0-8 1.34-8 4v1.5h16v-1.5c0-2.66-5.33-4-8-4z" fill="currentColor"/>
                          </svg>
                          My Leads Only
                        </button>
                      </div>
                    </div>

                    {/* Recent Contacts or Search Results */}
                    {!updateLeadForm.selectedLead && (
                      <div className="form-section">
                        <div className="contacts-label">
                          {updateLeadForm.search ? 'SEARCH RESULTS' : (showMyLeadsOnly ? 'MY RECENT LEADS' : 'RECENT CONTACTS')}
                        </div>
                        <div className="contacts-list">
                          {(() => {
                            let leadsToShow = updateLeadForm.search ? leadSearchResults : leads.slice(0, 5);
                            
                            if (showMyLeadsOnly && !updateLeadForm.search) {
                              leadsToShow = leads.filter(lead => lead.ownership === user?.name).slice(0, 5);
                            }
                            
                            return leadsToShow.map(lead => (
                              <button
                                key={lead.id}
                                type="button"
                                className="contact-item"
                                onClick={() => {
                                  setUpdateLeadForm({
                                    ...updateLeadForm,
                                    selectedLead: lead,
                                    stage: lead.stage || 'Initial Outreach',
                                    lead_temperature: lead.lead_temperature || 'warm',
                                    search: lead.contact_name
                                  });
                                }}
                              >
                                <div className="contact-item__name">{lead.contact_name}</div>
                                <div className="contact-item__company">{lead.company_name} - {lead.stage}</div>
                              </button>
                            ));
                          })()}
                          {(() => {
                            let leadsToShow = updateLeadForm.search ? leadSearchResults : leads;
                            if (showMyLeadsOnly && !updateLeadForm.search) {
                              leadsToShow = leads.filter(lead => lead.ownership === user?.name);
                            }
                            return leadsToShow.length === 0 && (
                              <div className="contacts-empty">
                                {showMyLeadsOnly ? 'No leads found that you own' : 'No contacts found'}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Selected Lead Form */}
                    {updateLeadForm.selectedLead && (
                      <>
                        {/* New Status */}
                        <div className="form-section">
                          <label className="form-label">New Status *</label>
                          <select
                            required
                            value={updateLeadForm.stage}
                            onChange={(e) => setUpdateLeadForm({...updateLeadForm, stage: e.target.value})}
                            className="form-select"
                          >
                            {stages.map(stage => (
                              <option key={stage} value={stage}>{stage}</option>
                            ))}
                          </select>
                        </div>

                        {/* Update Lead Temperature */}
                        <div className="form-section">
                          <label className="form-label">Update Lead Temperature</label>
                          <div className="button-group button-group--three">
                            <button
                              type="button"
                              className={`button-temp ${updateLeadForm.lead_temperature === 'cold' ? 'button-temp--active button-temp--cold' : ''}`}
                              onClick={() => setUpdateLeadForm({...updateLeadForm, lead_temperature: 'cold'})}
                            >
                              Cold
                            </button>
                            <button
                              type="button"
                              className={`button-temp ${updateLeadForm.lead_temperature === 'warm' ? 'button-temp--active button-temp--warm' : ''}`}
                              onClick={() => setUpdateLeadForm({...updateLeadForm, lead_temperature: 'warm'})}
                            >
                              Warm
                            </button>
                            <button
                              type="button"
                              className={`button-temp ${updateLeadForm.lead_temperature === 'hot' ? 'button-temp--active button-temp--hot' : ''}`}
                              onClick={() => setUpdateLeadForm({...updateLeadForm, lead_temperature: 'hot'})}
                            >
                              Hot
                            </button>
                          </div>
                        </div>

                        {/* Activity Notes */}
                        <div className="form-section">
                          <label className="form-label">Activity Notes *</label>
                          <textarea
                            required
                            value={updateLeadForm.notes}
                            onChange={(e) => setUpdateLeadForm({...updateLeadForm, notes: e.target.value})}
                            className="form-textarea"
                            rows="4"
                            placeholder="What happened? Record details about the conversation, meeting, or outreach..."
                          />
                        </div>

                        {/* Next Steps */}
                        <div className="form-section">
                          <label className="form-label">Next Steps</label>
                          <input
                            type="text"
                            value={updateLeadForm.next_steps}
                            onChange={(e) => setUpdateLeadForm({...updateLeadForm, next_steps: e.target.value})}
                            className="form-input"
                            placeholder="e.g., Follow up next week, Send resources, Schedule demo"
                          />
                        </div>
                      </>
                    )}

                    {/* Actions */}
                    <div className="modal-actions">
                      <button type="button" onClick={closeModal} className="btn-secondary">
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={loading || !updateLeadForm.selectedLead} 
                        className="btn-primary"
                      >
                        {loading ? 'Updating...' : 'Update Status'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AllLeads;

