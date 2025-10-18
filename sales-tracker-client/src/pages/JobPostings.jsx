import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { jobPostingAPI, userAPI, activityAPI } from '../services/api';
import { exportJobPostingsToCSV } from '../utils/csvExport';
import '../styles/Overview.css';
import '../styles/AllLeads.css';
import '../styles/QuickActions.css';

const JobPostings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [jobPostings, setJobPostings] = useState([]);
  const [filteredJobPostings, setFilteredJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [activeModal, setActiveModal] = useState(null);
  const [staffMembers, setStaffMembers] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [newJobPostingForm, setNewJobPostingForm] = useState({
    lead_type: 'job',
    company_name: '',
    job_title: '',
    job_posting_url: '',
    experience_level: '',
    outreach_date: new Date().toISOString().split('T')[0],
    source: [],
    stage: 'Job Posted',
    ownership: user?.name || '',
    notes: '',
    aligned_sector: []
  });

  const [jobSectorInput, setJobSectorInput] = useState('');

  useEffect(() => {
    fetchJobPostings();
    fetchStaffMembers();
  }, []);

  useEffect(() => {
    filterJobPostings();
  }, [jobPostings, searchTerm]);

  const fetchJobPostings = async () => {
    setLoading(true);
    try {
      const data = await jobPostingAPI.getAllJobPostings();

      // Sort by most recent
      const sorted = data.sort((a, b) => {
        const dateA = new Date(a.created_at || a.updated_at);
        const dateB = new Date(b.created_at || b.updated_at);
        return dateB - dateA;
      });

      setJobPostings(sorted);
      setFilteredJobPostings(sorted);
    } catch (error) {
      console.error('Error fetching job postings:', error);
    } finally {
      setLoading(false);
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

  const filterJobPostings = () => {
    let filtered = [...jobPostings];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.ownership?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredJobPostings(filtered);
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
    setNewJobPostingForm({
      lead_type: 'job',
      company_name: '',
      job_title: '',
      job_posting_url: '',
      experience_level: '',
      outreach_date: new Date().toISOString().split('T')[0],
      source: [],
      stage: 'Job Posted',
      ownership: user?.name || '',
      notes: '',
      aligned_sector: []
    });
    setJobSectorInput('');
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
          experience_level: newJobPostingForm.experience_level
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
        <button
          className="overview__nav-item"
          onClick={() => navigate('/leads')}
        >
          All Leads
        </button>
        <button className="overview__nav-item overview__nav-item--active">
          Job Postings
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
          <h2 className="all-leads__title">Job Postings</h2>

          {/* Action Buttons */}
          <div className="all-leads__action-buttons">
            <button
              className="action-button action-button--blue"
              onClick={() => setActiveModal('newJobPosting')}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 5v10M5 10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add Job Posting
            </button>
            <button
              className="action-button action-button--green"
              onClick={() => exportJobPostingsToCSV(filteredJobPostings)}
              disabled={filteredJobPostings.length === 0}
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
                placeholder="Search job postings, companies, or roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Job Postings Grid */}
          {loading ? (
            <div className="all-leads__loading">Loading job postings...</div>
          ) : filteredJobPostings.length === 0 ? (
            <div className="all-leads__empty">
              <p>No job postings found. {searchTerm && 'Try a different search term.'}</p>
            </div>
          ) : (
            <div className="job-postings-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem',
              marginTop: '1.5rem'
            }}>
              {filteredJobPostings.map(job => (
                <div
                  key={job.id}
                  className="all-leads__card"
                  style={{ marginBottom: 0 }}
                >
                  <div className="all-leads__card-content">
                    <div className="all-leads__card-header">
                      <h3 className="all-leads__card-name" style={{ marginBottom: '0.5rem' }}>
                        {job.job_title || 'Untitled Position'}
                      </h3>
                    </div>
                    <p className="all-leads__company" style={{ marginBottom: '1rem' }}>{job.company_name}</p>

                    <div className="all-leads__meta" style={{ marginBottom: '1rem' }}>
                      {job.experience_level && (
                        <span className="all-leads__status">
                          Level: <strong>{job.experience_level}</strong>
                        </span>
                      )}
                      <span className="all-leads__contact">
                        Posted: <strong>{getTimeAgo(job.created_at)}</strong>
                      </span>
                      {job.ownership && (
                        <span className="all-leads__status">
                          Owner: <strong>{job.ownership}</strong>
                        </span>
                      )}
                    </div>

                    {(() => {
                      try {
                        let sectors = [];
                        if (job.aligned_sector) {
                          if (typeof job.aligned_sector === 'string') {
                            sectors = JSON.parse(job.aligned_sector);
                          } else if (Array.isArray(job.aligned_sector)) {
                            sectors = job.aligned_sector;
                          }
                        }
                        if (sectors.length > 0) {
                          return (
                            <div style={{ marginBottom: '1rem' }}>
                              <span style={{ fontSize: '0.875rem', color: '#6b7280', marginRight: '0.5rem' }}>
                                Sectors:
                              </span>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                {sectors.map((sector, index) => (
                                  <span key={index} style={{
                                    padding: '0.25rem 0.75rem',
                                    background: '#eff6ff',
                                    color: '#1e40af',
                                    border: '1px solid #bfdbfe',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem'
                                  }}>
                                    {sector}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      } catch (error) {
                        return null;
                      }
                    })()}

                    {job.notes && (
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        marginBottom: '1rem',
                        fontStyle: 'italic'
                      }}>
                        {job.notes}
                      </p>
                    )}

                    <div className="all-leads__card-actions" style={{ justifyContent: 'space-between', marginTop: '1rem' }}>
                      {(job.job_url || job.job_posting_url) && (
                        <a
                          href={job.job_url || job.job_posting_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="all-leads__view-details"
                          style={{ flex: 1, marginRight: '0.5rem' }}
                        >
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                          </svg>
                          View Job
                        </a>
                      )}
                      <button
                        className="all-leads__delete-btn"
                        onClick={() => handleDeleteJobPosting(job.id, `${job.job_title} - ${job.company_name}`)}
                      >
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Job Posting Modal */}
          {activeModal === 'newJobPosting' && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={closeModal}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>

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

                  {/* Aligned Sectors */}
                  <div className="form-section">
                    <label className="form-label">Aligned Sectors *</label>
                    <p className="form-help-text">Press Enter or Tab to add sectors (e.g., Technology, Finance, Healthcare)</p>
                    <div className="tags-input-container">
                      <div className="tags-display">
                        {newJobPostingForm.aligned_sector.map((tag, index) => (
                          <span key={index} className="tag-item">
                            {tag}
                            <button
                              type="button"
                              className="tag-remove"
                              onClick={() => {
                                const updatedTags = newJobPostingForm.aligned_sector.filter((_, i) => i !== index);
                                setNewJobPostingForm({...newJobPostingForm, aligned_sector: updatedTags});
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          className="tags-input"
                          placeholder={newJobPostingForm.aligned_sector.length === 0 ? "Add sector tags..." : ""}
                          value={jobSectorInput}
                          onChange={(e) => setJobSectorInput(e.target.value)}
                          onKeyDown={(e) => {
                            if ((e.key === 'Enter' || e.key === 'Tab') && jobSectorInput.trim()) {
                              e.preventDefault();
                              if (!newJobPostingForm.aligned_sector.includes(jobSectorInput.trim())) {
                                setNewJobPostingForm({
                                  ...newJobPostingForm,
                                  aligned_sector: [...newJobPostingForm.aligned_sector, jobSectorInput.trim()]
                                });
                              }
                              setJobSectorInput('');
                            } else if (e.key === 'Backspace' && !jobSectorInput && newJobPostingForm.aligned_sector.length > 0) {
                              const updatedTags = [...newJobPostingForm.aligned_sector];
                              updatedTags.pop();
                              setNewJobPostingForm({...newJobPostingForm, aligned_sector: updatedTags});
                            }
                          }}
                        />
                      </div>
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
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default JobPostings;
