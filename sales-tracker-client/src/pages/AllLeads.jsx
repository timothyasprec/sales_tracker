import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { outreachAPI, jobPostingAPI, userAPI, activityAPI } from '../services/api';
import { exportLeadsToCSV, exportJobPostingsToCSV } from '../utils/csvExport';
import '../styles/Overview.css';
import '../styles/AllLeads.css';
import '../styles/QuickActions.css';

const AllLeads = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [jobPostings, setJobPostings] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [filteredJobPostings, setFilteredJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Modal state
  const [activeModal, setActiveModal] = useState(null);
  const [staffMembers, setStaffMembers] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedLeadDetails, setSelectedLeadDetails] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editingUpdateIndex, setEditingUpdateIndex] = useState(null);
  
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
    aligned_sector: []
  });

  const [newJobPostingForm, setNewJobPostingForm] = useState({
    lead_type: 'job',
    company_name: '',
    job_title: '',
    job_posting_url: '',
    experience_level: '',
    outreach_date: new Date().toISOString().split('T')[0],
    lead_temperature: 'cold',
    source: 'job_board',
    stage: 'Job Posted',
    ownership: user?.name || '',
    notes: '',
    aligned_sector: []
  });
  
  const [updateLeadForm, setUpdateLeadForm] = useState({
    search: '',
    selectedLead: null,
    stage: '',
    lead_temperature: '',
    notes: '',
    next_steps: '',
    update_date: new Date().toISOString().split('T')[0]
  });
  
  const [leadSearchResults, setLeadSearchResults] = useState([]);
  const [showMyLeadsOnly, setShowMyLeadsOnly] = useState(false);

  useEffect(() => {
    fetchLeads();
    fetchJobPostings();
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
      // Fetch outreach data (contact leads only)
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

  const fetchJobPostings = async () => {
    try {
      const data = await jobPostingAPI.getAllJobPostings();
      
      // Filter to show only job postings from the past 2 months
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      
      const recentJobs = data.filter(job => {
        const jobDate = new Date(job.created_at);
        return jobDate >= twoMonthsAgo;
      });
      
      // Sort by most recent
      const sorted = recentJobs.sort((a, b) => {
        const dateA = new Date(a.created_at || a.updated_at);
        const dateB = new Date(b.created_at || b.updated_at);
        return dateB - dateA;
      });
      
      setJobPostings(sorted);
      setFilteredJobPostings(sorted);
    } catch (error) {
      console.error('Error fetching job postings:', error);
    }
  };
  
  const fetchStaffMembers = async () => {
    try {
      const users = await userAPI.getAllUsers();
      // Include all active users for ownership dropdown
      setStaffMembers(users.filter(u => u.is_active !== false));
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
          lead.lead_temperature?.toLowerCase() === 'hot'
        );
      } else if (activeFilter === 'warm') {
        filtered = filtered.filter(lead =>
          lead.lead_temperature?.toLowerCase() === 'warm'
        );
      } else if (activeFilter === 'cold') {
        filtered = filtered.filter(lead =>
          !lead.lead_temperature || lead.lead_temperature?.toLowerCase() === 'cold'
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
    setSelectedLeadDetails(null);
    setIsEditMode(false);
    setEditFormData({});
    setEditingUpdateIndex(null);
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
      aligned_sector: []
    });
    setNewJobPostingForm({
      lead_type: 'job',
      company_name: '',
      job_title: '',
      job_posting_url: '',
      experience_level: '',
      outreach_date: new Date().toISOString().split('T')[0],
      lead_temperature: 'cold',
      source: 'job_board',
      stage: 'Job Posted',
      ownership: user?.name || '',
      notes: '',
      aligned_sector: []
    });
    setUpdateLeadForm({
      search: '',
      selectedLead: null,
      stage: '',
      lead_temperature: '',
      notes: '',
      next_steps: '',
      update_date: new Date().toISOString().split('T')[0]
    });
    setShowMyLeadsOnly(false);
  };

  const handleSaveLeadDetails = async () => {
    if (!selectedLeadDetails) return;
    
    setLoading(true);
    try {
      await outreachAPI.updateOutreach(selectedLeadDetails.id, editFormData);
      
      await activityAPI.createActivity({
        user_name: user.name,
        action_type: 'updated_lead',
        entity_type: 'lead',
        entity_name: `${selectedLeadDetails.contact_name} - ${selectedLeadDetails.company_name}`,
        details: {
          updated_fields: Object.keys(editFormData).join(', ')
        }
      });
      
      showMessage('success', 'Lead details updated successfully!');
      setIsEditMode(false);
      setEditFormData({});
      fetchLeads();
      
      // Refresh the selected lead details
      const updatedLeads = await outreachAPI.getAllOutreach();
      const updatedLead = updatedLeads.find(l => l.id === selectedLeadDetails.id);
      if (updatedLead) {
        setSelectedLeadDetails(updatedLead);
      }
    } catch (error) {
      showMessage('error', 'Failed to update lead details.');
      console.error('Error updating lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteNextStep = async () => {
    if (!selectedLeadDetails) return;
    
    setLoading(true);
    try {
      const updateData = {
        next_steps: null, // Clear next steps when completed
        notes: selectedLeadDetails.notes 
          ? `${selectedLeadDetails.notes}\n\n[${new Date().toLocaleDateString()}] ✅ Completed: ${selectedLeadDetails.next_steps}`
          : `✅ Completed: ${selectedLeadDetails.next_steps}`
      };
      
      await outreachAPI.updateOutreach(selectedLeadDetails.id, updateData);
      
      await activityAPI.createActivity({
        user_name: user.name,
        action_type: 'completed_next_step',
        entity_type: 'lead',
        entity_name: `${selectedLeadDetails.contact_name} - ${selectedLeadDetails.company_name}`,
        details: {
          completed_task: selectedLeadDetails.next_steps
        }
      });
      
      showMessage('success', 'Next step marked as completed!');
      fetchLeads();
      
      // Refresh the selected lead details
      const updatedLeads = await outreachAPI.getAllOutreach();
      const updatedLead = updatedLeads.find(l => l.id === selectedLeadDetails.id);
      if (updatedLead) {
        setSelectedLeadDetails(updatedLead);
      }
    } catch (error) {
      showMessage('error', 'Failed to complete next step.');
      console.error('Error completing next step:', error);
    } finally {
      setLoading(false);
    }
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

  const handleAddJobPosting = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await jobPostingAPI.createJobPosting(newJobPostingForm);
      
      await activityAPI.createActivity({
        user_name: user.name,
        action_type: 'added_job_posting',
        entity_type: 'job_posting',
        entity_name: `${newJobPostingForm.job_title} - ${newJobPostingForm.company_name}`,
        details: {
          company: newJobPostingForm.company_name,
          job_title: newJobPostingForm.job_title,
          experience_level: newJobPostingForm.experience_level,
          temperature: newJobPostingForm.lead_temperature
        }
      });
      
      showMessage('success', 'Job posting added successfully!');
      closeModal();
      fetchJobPostings();
    } catch (error) {
      showMessage('error', 'Failed to add job posting. Please try again.');
      console.error('Error adding job posting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLead = async (leadId, leadName) => {
    if (!window.confirm(`Are you sure you want to delete "${leadName}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      await outreachAPI.deleteOutreach(leadId);
      
      await activityAPI.createActivity({
        user_name: user.name,
        action_type: 'deleted_lead',
        entity_type: 'lead',
        entity_name: leadName,
        details: {}
      });
      
      showMessage('success', 'Lead deleted successfully!');
      fetchLeads();
    } catch (error) {
      showMessage('error', 'Failed to delete lead. Please try again.');
      console.error('Error deleting lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJobPosting = async (jobId, jobName) => {
    if (!window.confirm(`Are you sure you want to delete "${jobName}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      await jobPostingAPI.deleteJobPosting(jobId);
      
      await activityAPI.createActivity({
        user_name: user.name,
        action_type: 'deleted_job_posting',
        entity_type: 'job_posting',
        entity_name: jobName,
        details: {}
      });
      
      showMessage('success', 'Job posting deleted successfully!');
      fetchJobPostings();
    } catch (error) {
      showMessage('error', 'Failed to delete job posting. Please try again.');
      console.error('Error deleting job posting:', error);
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
      // Use the selected update date instead of today's date
      const updateDate = updateLeadForm.update_date 
        ? new Date(updateLeadForm.update_date).toLocaleDateString()
        : new Date().toLocaleDateString();
      
      const updateData = {
        stage: updateLeadForm.stage,
        lead_temperature: updateLeadForm.lead_temperature,
        next_steps: updateLeadForm.next_steps,
        notes: updateLeadForm.selectedLead.notes 
          ? `${updateLeadForm.selectedLead.notes}\n\n[${updateDate}] ${updateLeadForm.notes}`
          : `[${updateDate}] ${updateLeadForm.notes}`
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
            <button
              className="action-button action-button--green"
              onClick={() => exportLeadsToCSV(filteredLeads)}
              disabled={filteredLeads.length === 0}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3v12m0 0l-4-4m4 4l4-4M3 17h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Download CSV
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

          {/* Two-Column Layout: Contact Leads + Job Postings */}
          {loading ? (
            <div className="all-leads__loading">Loading leads...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="all-leads__empty">
              <p>No leads found. {searchTerm && 'Try a different search term.'}</p>
            </div>
          ) : (
            <div className="all-leads__split-view">
              {/* Main Section - Contact Leads (3/4 width) */}
              <div className="all-leads__main-section">
                <div className="all-leads__list">
                  {filteredLeads
                    .filter(lead => lead.lead_type === 'contact' || !lead.lead_type) // Contact outreach leads
                    .map(lead => (
                <div key={lead.id} className="all-leads__card">
                  <div className="all-leads__card-content">
                    <div className="all-leads__card-header">
                      <div className="all-leads__card-title-row">
                        <h3 className="all-leads__card-name">
                          {lead.contact_name || 'Unknown Contact'}
                        </h3>
                        <span className={`all-leads__temp-badge all-leads__temp-badge--${(lead.lead_temperature || 'cold').toLowerCase()}`}>
                          {(lead.lead_temperature || 'cold').toUpperCase()}
                        </span>
                        <span className="all-leads__source-badge">
                          {lead.contact_method || 'Professional Network'}
                        </span>
                      </div>
                      <div className="all-leads__card-actions">
                        <button 
                          className="all-leads__view-details"
                          onClick={() => {
                            console.log('View Details clicked for:', lead);
                            setSelectedLeadDetails(lead);
                            setActiveModal('viewDetails');
                            console.log('Modal state set to viewDetails');
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          View Details
                        </button>
                        <button 
                          className="all-leads__delete-btn"
                          onClick={() => handleDeleteLead(lead.id, `${lead.contact_name} - ${lead.company_name}`)}
                        >
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="all-leads__company">{lead.company_name}</p>
                    <div className="all-leads__meta">
                      <span className="all-leads__status">
                        Status: <strong>{lead.stage || lead.status.replace(/_/g, ' ')}</strong>
                      </span>
                      <span className="all-leads__contact">
                        Last Contact: <strong>{getTimeAgo(lead.updated_at || lead.outreach_date)}</strong>
                      </span>
                      {(() => {
                        try {
                          let sectors = [];
                          if (lead.aligned_sector) {
                            if (typeof lead.aligned_sector === 'string') {
                              sectors = JSON.parse(lead.aligned_sector);
                            } else if (Array.isArray(lead.aligned_sector)) {
                              sectors = lead.aligned_sector;
                            }
                          }
                          if (sectors.length > 0) {
                            return (
                              <span className="all-leads__sectors">
                                Sectors: <strong>{sectors.join(', ')}</strong>
                              </span>
                            );
                          }
                          return null;
                        } catch (error) {
                          return null;
                        }
                      })()}
                    </div>
                    {lead.next_steps && (
                      <div className="all-leads__next-steps">
                        <span className="all-leads__next-steps-label">📌 Next Steps:</span>
                        <span className="all-leads__next-steps-text">{lead.ownership || 'Team'} will {lead.next_steps}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
                </div>
              </div>

              {/* Sidebar - Job Postings (1/4 width) */}
              <div className="all-leads__sidebar-section">
                <div className="all-leads__sidebar-header">
                  <div className="all-leads__sidebar-header-left">
                    <h3 className="all-leads__sidebar-title">Job Postings</h3>
                    <span className="all-leads__sidebar-count">
                      {filteredJobPostings.length}
                    </span>
                  </div>
                  <button
                    className="all-leads__download-jobs-btn"
                    onClick={() => exportJobPostingsToCSV(filteredJobPostings)}
                    disabled={filteredJobPostings.length === 0}
                    title="Download job postings as CSV"
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                {/* Add Job Posting Button */}
                <button 
                  className="all-leads__add-job-btn"
                  onClick={() => setActiveModal('newJobPosting')}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                  </svg>
                  Add Job Posting
                </button>
                
                <div className="all-leads__job-list">
                  {filteredJobPostings.length === 0 ? (
                    <div className="all-leads__sidebar-empty">
                      <p>No job postings yet</p>
                    </div>
                  ) : (
                    filteredJobPostings.map(job => (
                      <div
                        key={job.id}
                        className="all-leads__job-item"
                      >
                        <div className="all-leads__job-header">
                          <h4 className="all-leads__job-title">{job.job_title || 'Untitled Position'}</h4>
                        </div>
                        
                        <div className="all-leads__job-info-row">
                          <span className="all-leads__job-label">Company:</span>
                          <span className="all-leads__job-value">{job.company_name || 'Company Name'}</span>
                        </div>
                        
                        {job.experience_level && (
                          <div className="all-leads__job-info-row">
                            <span className="all-leads__job-label">Level:</span>
                            <span className="all-leads__job-value">{job.experience_level}</span>
                          </div>
                        )}
                        
                        {job.aligned_sector && job.aligned_sector.length > 0 && (
                          <div className="all-leads__job-info-row">
                            <span className="all-leads__job-label">Sectors:</span>
                            <div className="all-leads__job-sectors">
                              {(typeof job.aligned_sector === 'string' 
                                ? JSON.parse(job.aligned_sector) 
                                : job.aligned_sector
                              ).slice(0, 2).map((sector, index) => (
                                <span key={index} className="all-leads__job-sector-tag">
                                  {sector}
                                </span>
                              ))}
                              {(typeof job.aligned_sector === 'string' 
                                ? JSON.parse(job.aligned_sector).length 
                                : job.aligned_sector.length
                              ) > 2 && (
                                <span className="all-leads__job-sector-more">
                                  +{(typeof job.aligned_sector === 'string' 
                                    ? JSON.parse(job.aligned_sector).length 
                                    : job.aligned_sector.length
                                  ) - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {job.created_at && (
                          <div className="all-leads__job-info-row">
                            <span className="all-leads__job-label">Posted:</span>
                            <span className="all-leads__job-value">
                              {new Date(job.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </span>
                          </div>
                        )}
                        
                        {/* Job Actions */}
                        <div className="all-leads__job-actions">
                          {(job.job_url || job.job_posting_url) && (
                            <a 
                              href={job.job_url || job.job_posting_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="all-leads__job-link-btn"
                            >
                              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                              </svg>
                              View Job
                            </a>
                          )}
                          <button 
                            className="all-leads__job-delete-btn"
                            onClick={() => handleDeleteJobPosting(job.id, `${job.job_title} - ${job.company_name}`)}
                          >
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Modals */}
          {activeModal && activeModal !== 'viewDetails' && (
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

                    {/* Date Field */}
                    <div className="form-section">
                      <label className="form-label">Date *</label>
                      <p className="form-help-text">Select the date for this lead entry (useful for recording past leads)</p>
                      <input
                        type="date"
                        value={newLeadForm.outreach_date}
                        onChange={(e) => setNewLeadForm({...newLeadForm, outreach_date: e.target.value})}
                        className="form-input"
                        required
                      />
                    </div>

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

                    {/* Aligned Sectors */}
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
                      <p className="form-help-text">Please select your name below</p>
                      <select
                        required
                        value={newLeadForm.ownership}
                        onChange={(e) => setNewLeadForm({...newLeadForm, ownership: e.target.value})}
                        className="form-select"
                      >
                        <option value="">Please select your name below</option>
                        {staffMembers.map(member => (
                          <option key={member.id} value={member.name}>{member.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Notes / Comments */}
                    <div className="form-section">
                      <label className="form-label">Notes / Comments</label>
                      <p className="form-help-text">
                        Add any relevant notes about your relationship, the role, or the stage
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

                {activeModal === 'newJobPosting' && (
                  <form className="modal-form" onSubmit={handleAddJobPosting}>
                    <h2 className="modal-title">Add Job Posting</h2>

                    {/* Date Field */}
                    <div className="form-section">
                      <label className="form-label">Date *</label>
                      <p className="form-help-text">Select the date for this job posting entry</p>
                      <input
                        type="date"
                        value={newJobPostingForm.outreach_date}
                        onChange={(e) => setNewJobPostingForm({...newJobPostingForm, outreach_date: e.target.value})}
                        className="form-input"
                        required
                      />
                    </div>

                    {/* Job Posting Fields */}
                    <div className="form-section">
                      <label className="form-label">Job Title *</label>
                      <input
                        type="text"
                        required
                        value={newJobPostingForm.job_title}
                        onChange={(e) => setNewJobPostingForm({...newJobPostingForm, job_title: e.target.value})}
                        className="form-input"
                        placeholder="e.g., Full Stack Developer"
                      />
                    </div>

                    <div className="form-section">
                      <label className="form-label">Company Name *</label>
                      <input
                        type="text"
                        required
                        value={newJobPostingForm.company_name}
                        onChange={(e) => setNewJobPostingForm({...newJobPostingForm, company_name: e.target.value})}
                        className="form-input"
                        placeholder="e.g., TechCorp Inc."
                      />
                    </div>

                    <div className="form-section">
                      <label className="form-label">Job Posting URL *</label>
                      <input
                        type="url"
                        required
                        value={newJobPostingForm.job_posting_url}
                        onChange={(e) => setNewJobPostingForm({...newJobPostingForm, job_posting_url: e.target.value})}
                        className="form-input"
                        placeholder="https://..."
                      />
                    </div>

                    <div className="form-section">
                      <label className="form-label">Experience Level *</label>
                      <select
                        required
                        value={newJobPostingForm.experience_level}
                        onChange={(e) => setNewJobPostingForm({...newJobPostingForm, experience_level: e.target.value})}
                        className="form-select"
                      >
                        <option value="">Select Level</option>
                        {experienceLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-section">
                      <label className="form-label">Source *</label>
                      <select
                        required
                        value={newJobPostingForm.source}
                        onChange={(e) => setNewJobPostingForm({...newJobPostingForm, source: e.target.value})}
                        className="form-select"
                      >
                        <option value="">Select Source</option>
                        {jobPostingSources.map(source => (
                          <option key={source} value={source.toLowerCase()}>{source}</option>
                        ))}
                      </select>
                    </div>

                    {/* Aligned Sectors */}
                    <div className="form-section">
                      <label className="form-label">Aligned Sectors *</label>
                      <p className="form-help-text">Select all sectors where this job would be a good fit</p>
                      <div className="sector-checkboxes">
                        {sectors.map(sector => (
                          <label key={sector} className="sector-checkbox-item">
                            <input
                              type="checkbox"
                              checked={newJobPostingForm.aligned_sector.includes(sector)}
                              onChange={(e) => {
                                const updatedSectors = e.target.checked
                                  ? [...newJobPostingForm.aligned_sector, sector]
                                  : newJobPostingForm.aligned_sector.filter(s => s !== sector);
                                setNewJobPostingForm({...newJobPostingForm, aligned_sector: updatedSectors});
                              }}
                              className="sector-checkbox"
                            />
                            <span className="sector-checkbox-text">{sector}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Ownership */}
                    <div className="form-section">
                      <label className="form-label">Ownership *</label>
                      <p className="form-help-text">Please select your name below</p>
                      <select
                        required
                        value={newJobPostingForm.ownership}
                        onChange={(e) => setNewJobPostingForm({...newJobPostingForm, ownership: e.target.value})}
                        className="form-select"
                      >
                        <option value="">Please select your name below</option>
                        {staffMembers.map(member => (
                          <option key={member.id} value={member.name}>{member.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Notes / Comments */}
                    <div className="form-section">
                      <label className="form-label">Notes / Comments</label>
                      <p className="form-help-text">
                        e.g., "Looks aligned with AI Builders" or "Company is known for hiring apprentices"
                      </p>
                      <textarea
                        value={newJobPostingForm.notes}
                        onChange={(e) => setNewJobPostingForm({...newJobPostingForm, notes: e.target.value})}
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
                        {loading ? 'Adding...' : 'Add Job Posting'}
                      </button>
                    </div>
                  </form>
                )}

                {activeModal === 'updateLead' && (
                  <form className="modal-form" onSubmit={handleUpdateLead}>
                    <h2 className="modal-title">Update Lead Status</h2>

                    {/* Date Field */}
                    <div className="form-section">
                      <label className="form-label">Update Date *</label>
                      <p className="form-help-text">Select the date for this update (useful for recording past interactions)</p>
                      <input
                        type="date"
                        value={updateLeadForm.update_date}
                        onChange={(e) => setUpdateLeadForm({...updateLeadForm, update_date: e.target.value})}
                        className="form-input"
                        required
                      />
                    </div>

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

          {/* View Details Modal - Separate from standard modals */}
          {activeModal === 'viewDetails' && selectedLeadDetails && (() => {
            console.log('Rendering View Details Modal for:', selectedLeadDetails);
            return (
              <div className="modal-overlay" onClick={() => {
                setActiveModal(null);
                setSelectedLeadDetails(null);
              }} style={{ zIndex: 9999 }}>
                <div className="lead-details-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={(e) => {
                  e.stopPropagation();
                  setActiveModal(null);
                  setSelectedLeadDetails(null);
                }} style={{ zIndex: 10000 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>

                <div className="lead-details">
                  {/* Header */}
                  <div className="lead-details__header">
                    <div>
                      <h2 className="lead-details__title">{selectedLeadDetails.contact_name || 'Lead Details'}</h2>
                      <p className="lead-details__company">{selectedLeadDetails.company_name}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span className={`all-leads__temp-badge all-leads__temp-badge--${(selectedLeadDetails.lead_temperature || 'cold').toLowerCase()}`}>
                        {(selectedLeadDetails.lead_temperature || 'cold').toUpperCase()}
                      </span>
                      {!isEditMode ? (
                        <button 
                          className="lead-details__edit-btn"
                          onClick={() => {
                            setIsEditMode(true);
                            setEditFormData({
                              source: selectedLeadDetails.source || selectedLeadDetails.contact_method || '',
                              contact_email: selectedLeadDetails.contact_email || '',
                              linkedin_url: selectedLeadDetails.linkedin_url || ''
                            });
                          }}
                        >
                          ✏️ Edit
                        </button>
                      ) : (
                        <>
                          <button 
                            className="lead-details__save-btn"
                            onClick={handleSaveLeadDetails}
                            disabled={loading}
                          >
                            {loading ? 'Saving...' : '💾 Save'}
                          </button>
                          <button 
                            className="lead-details__cancel-btn"
                            onClick={() => {
                              setIsEditMode(false);
                              setEditFormData({});
                            }}
                          >
                            ✖️ Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Current Info */}
                  <div className="lead-details__current-info">
                    <div className="lead-details__info-item">
                      <span className="lead-details__label">Current Stage:</span>
                      <span className="lead-details__value">{selectedLeadDetails.stage || 'Initial Outreach'}</span>
                    </div>
                    <div className="lead-details__info-item">
                      <span className="lead-details__label">Owner:</span>
                      <span className="lead-details__value">{selectedLeadDetails.ownership || 'Unassigned'}</span>
                    </div>
                    <div className="lead-details__info-item">
                      <span className="lead-details__label">Source:</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          className="lead-details__input"
                          value={editFormData.source || ''}
                          onChange={(e) => setEditFormData({...editFormData, source: e.target.value})}
                          placeholder="e.g., LinkedIn, Referral, etc."
                        />
                      ) : (
                        <span className="lead-details__value">{selectedLeadDetails.source || selectedLeadDetails.contact_method || 'N/A'}</span>
                      )}
                    </div>
                    <div className="lead-details__info-item">
                      <span className="lead-details__label">Email:</span>
                      {isEditMode ? (
                        <input
                          type="email"
                          className="lead-details__input"
                          value={editFormData.contact_email || ''}
                          onChange={(e) => setEditFormData({...editFormData, contact_email: e.target.value})}
                          placeholder="email@company.com"
                        />
                      ) : (
                        <span className="lead-details__value">{selectedLeadDetails.contact_email || 'N/A'}</span>
                      )}
                    </div>
                    <div className="lead-details__info-item">
                      <span className="lead-details__label">LinkedIn:</span>
                      {isEditMode ? (
                        <input
                          type="url"
                          className="lead-details__input"
                          value={editFormData.linkedin_url || ''}
                          onChange={(e) => setEditFormData({...editFormData, linkedin_url: e.target.value})}
                          placeholder="https://linkedin.com/in/..."
                        />
                      ) : selectedLeadDetails.linkedin_url ? (
                        <a href={selectedLeadDetails.linkedin_url} target="_blank" rel="noopener noreferrer" className="lead-details__link">
                          View Profile
                        </a>
                      ) : (
                        <span className="lead-details__value">N/A</span>
                      )}
                    </div>
                  </div>

                  {/* Next Steps */}
                  {selectedLeadDetails.next_steps && (
                    <div className="lead-details__next-steps">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 className="lead-details__section-title" style={{ margin: 0 }}>📌 Next Steps</h3>
                        <button 
                          className="lead-details__complete-btn"
                          onClick={handleCompleteNextStep}
                          disabled={loading}
                        >
                          ✓ Mark as Completed
                        </button>
                      </div>
                      <p className="lead-details__next-steps-text">
                        {selectedLeadDetails.ownership || 'Team'} will {selectedLeadDetails.next_steps}
                      </p>
                      {(() => {
                        // Calculate days since next step was created (using updated_at as a proxy)
                        const lastUpdate = new Date(selectedLeadDetails.updated_at || selectedLeadDetails.outreach_date);
                        const today = new Date();
                        const diffTime = Math.abs(today - lastUpdate);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        return (
                          <div className="lead-details__next-steps-days">
                            📅 Created {diffDays} day{diffDays !== 1 ? 's' : ''} ago
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Update History */}
                  <div className="lead-details__history">
                    <h3 className="lead-details__section-title">📝 Update History</h3>
                    <div className="lead-details__timeline">
                      {(() => {
                        const notes = selectedLeadDetails.notes || '';
                        const updates = [];
                        
                        // Split notes by date pattern [MM/DD/YYYY]
                        const datePattern = /\[(\d{1,2}\/\d{1,2}\/\d{4})\]/g;
                        const parts = notes.split(datePattern);
                        
                        // Parse into update objects
                        for (let i = 1; i < parts.length; i += 2) {
                          if (parts[i] && parts[i + 1]) {
                            updates.push({
                              date: parts[i],
                              content: parts[i + 1].trim()
                            });
                          }
                        }
                        
                        // If no timestamped updates, show the raw notes
                        if (updates.length === 0 && notes.trim()) {
                          updates.push({
                            date: new Date(selectedLeadDetails.outreach_date).toLocaleDateString(),
                            content: notes
                          });
                        }
                        
                        // If still no updates, show initial outreach
                        if (updates.length === 0) {
                          updates.push({
                            date: new Date(selectedLeadDetails.outreach_date).toLocaleDateString(),
                            content: 'Initial outreach created'
                          });
                        }
                        
                        // Reverse to show most recent first
                        const reversedUpdates = [...updates].reverse();
                        
                        return reversedUpdates.map((update, index) => {
                          // Calculate the original index for editing
                          const originalIndex = updates.length - 1 - index;
                          const isEditing = editingUpdateIndex === index;
                          
                          return (
                            <div key={index} className="lead-details__update-card">
                              {isEditing ? (
                                <>
                                  <input
                                    type="text"
                                    className="lead-details__update-date-input"
                                    value={editFormData[`update_${index}_date`] || update.date}
                                    onChange={(e) => setEditFormData({
                                      ...editFormData,
                                      [`update_${index}_date`]: e.target.value
                                    })}
                                    placeholder="MM/DD/YYYY"
                                  />
                                  <textarea
                                    className="lead-details__update-content-input"
                                    value={editFormData[`update_${index}_content`] || update.content}
                                    onChange={(e) => setEditFormData({
                                      ...editFormData,
                                      [`update_${index}_content`]: e.target.value
                                    })}
                                    rows="3"
                                  />
                                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    <button
                                      className="lead-details__update-save-btn"
                                      onClick={async () => {
                                        // Rebuild notes with updated values
                                        const updatedUpdates = updates.map((u, i) => ({
                                          date: i === index ? (editFormData[`update_${index}_date`] || u.date) : u.date,
                                          content: i === index ? (editFormData[`update_${index}_content`] || u.content) : u.content
                                        }));
                                        
                                        const newNotes = updatedUpdates
                                          .map(u => `[${u.date}] ${u.content}`)
                                          .join('\n\n');
                                        
                                        setLoading(true);
                                        try {
                                          await outreachAPI.updateOutreach(selectedLeadDetails.id, { notes: newNotes });
                                          showMessage('success', 'Update history edited successfully!');
                                          setEditingUpdateIndex(null);
                                          fetchLeads();
                                          
                                          const updatedLeads = await outreachAPI.getAllOutreach();
                                          const updatedLead = updatedLeads.find(l => l.id === selectedLeadDetails.id);
                                          if (updatedLead) {
                                            setSelectedLeadDetails(updatedLead);
                                          }
                                        } catch (error) {
                                          showMessage('error', 'Failed to update history.');
                                        } finally {
                                          setLoading(false);
                                        }
                                      }}
                                    >
                                      💾 Save
                                    </button>
                                    <button
                                      className="lead-details__update-cancel-btn"
                                      onClick={() => {
                                        setEditingUpdateIndex(null);
                                        setEditFormData({});
                                      }}
                                    >
                                      ✖️ Cancel
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="lead-details__update-date">{update.date}</div>
                                    <button
                                      className="lead-details__update-edit-btn"
                                      onClick={() => {
                                        setEditingUpdateIndex(index);
                                        setEditFormData({
                                          [`update_${index}_date`]: update.date,
                                          [`update_${index}_content`]: update.content
                                        });
                                      }}
                                    >
                                      ✏️ Edit
                                    </button>
                                  </div>
                                  <div className="lead-details__update-content">{update.content}</div>
                                </>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Aligned Sectors */}
                  {(() => {
                    try {
                      let sectors = [];
                      if (selectedLeadDetails.aligned_sector) {
                        if (typeof selectedLeadDetails.aligned_sector === 'string') {
                          sectors = JSON.parse(selectedLeadDetails.aligned_sector);
                        } else if (Array.isArray(selectedLeadDetails.aligned_sector)) {
                          sectors = selectedLeadDetails.aligned_sector;
                        }
                      }
                      
                      if (sectors.length === 0) return null;
                      
                      return (
                        <div className="lead-details__sectors">
                          <h3 className="lead-details__section-title">🎯 Aligned Sectors</h3>
                          <div className="lead-details__sector-tags">
                            {sectors.map((sector, index) => (
                              <span key={index} className="lead-details__sector-tag">{sector}</span>
                            ))}
                          </div>
                        </div>
                      );
                    } catch (error) {
                      console.error('Error parsing aligned sectors:', error);
                      return null;
                    }
                  })()}
                </div>
              </div>
            </div>
            );
          })()}
        </div>
      </main>
    </div>
  );
};

export default AllLeads;

