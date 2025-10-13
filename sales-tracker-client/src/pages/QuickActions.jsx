import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { outreachAPI, builderAPI, userAPI } from '../services/api';
import '../styles/Overview.css';
import '../styles/QuickActions.css';

const QuickActions = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeAction, setActiveAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Staff list for ownership
  const [staffMembers, setStaffMembers] = useState([]);

  // Form states
  const [newLeadForm, setNewLeadForm] = useState({
    company_name: '',
    contact_name: '',
    contact_title: '',
    contact_email: '',
    contact_phone: '',
    outreach_date: new Date().toISOString().split('T')[0],
    lead_temperature: 'warm',
    role_consideration: '',
    job_description_url: '',
    stage: 'Initial Outreach',
    ownership: user?.name || '',
    notes: ''
  });

  const [updateLeadForm, setUpdateLeadForm] = useState({
    search: '',
    selectedLead: null,
    stage: '',
    notes: '',
    attachment: null
  });

  const [newBuilderForm, setNewBuilderForm] = useState({
    name: '',
    cohort: '',
    email: '',
    linkedin_url: '',
    portfolio_url: '',
    years_experience: '',
    education: '',
    aligned_sector: '',
    role: '',
    skills: ''
  });

  // Search results for leads
  const [leadSearchResults, setLeadSearchResults] = useState([]);
  const [allLeads, setAllLeads] = useState([]);

  useEffect(() => {
    fetchStaffMembers();
    fetchAllLeads();
  }, []);

  const fetchStaffMembers = async () => {
    try {
      const users = await userAPI.getAllUsers();
      setStaffMembers(users.filter(u => u.role === 'staff' || u.role === 'admin'));
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchAllLeads = async () => {
    try {
      const leads = await outreachAPI.getAllOutreach();
      setAllLeads(leads);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  // Handle lead search
  useEffect(() => {
    if (updateLeadForm.search.length > 1) {
      const filtered = allLeads.filter(lead =>
        lead.company_name?.toLowerCase().includes(updateLeadForm.search.toLowerCase()) ||
        lead.contact_name?.toLowerCase().includes(updateLeadForm.search.toLowerCase())
      );
      setLeadSearchResults(filtered.slice(0, 5));
    } else {
      setLeadSearchResults([]);
    }
  }, [updateLeadForm.search, allLeads]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // Add New Lead
  const handleAddNewLead = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await outreachAPI.createOutreach(newLeadForm);
      showMessage('success', 'New lead added successfully!');
      setNewLeadForm({
        company_name: '',
        contact_name: '',
        contact_title: '',
        contact_email: '',
        contact_phone: '',
        outreach_date: new Date().toISOString().split('T')[0],
        lead_temperature: 'warm',
        role_consideration: '',
        job_description_url: '',
        stage: 'Initial Outreach',
        ownership: user?.name || '',
        notes: ''
      });
      setActiveAction(null);
      fetchAllLeads(); // Refresh leads
    } catch (error) {
      showMessage('error', 'Failed to add lead. Please try again.');
      console.error('Error adding lead:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update Lead Status
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
        notes: updateLeadForm.selectedLead.notes 
          ? `${updateLeadForm.selectedLead.notes}\n\n[${new Date().toLocaleDateString()}] ${updateLeadForm.notes}`
          : updateLeadForm.notes
      };

      await outreachAPI.updateOutreach(updateLeadForm.selectedLead.id, updateData);
      showMessage('success', 'Lead status updated successfully!');
      setUpdateLeadForm({
        search: '',
        selectedLead: null,
        stage: '',
        notes: '',
        attachment: null
      });
      setActiveAction(null);
      fetchAllLeads(); // Refresh leads
    } catch (error) {
      showMessage('error', 'Failed to update lead. Please try again.');
      console.error('Error updating lead:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add Builder
  const handleAddBuilder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await builderAPI.createBuilder(newBuilderForm);
      showMessage('success', 'New builder added successfully!');
      setNewBuilderForm({
        name: '',
        cohort: '',
        email: '',
        linkedin_url: '',
        portfolio_url: '',
        years_experience: '',
        education: '',
        aligned_sector: '',
        role: '',
        skills: ''
      });
      setActiveAction(null);
    } catch (error) {
      showMessage('error', 'Failed to add builder. Please try again.');
      console.error('Error adding builder:', error);
    } finally {
      setLoading(false);
    }
  };

  const stages = [
    'Initial Outreach',
    'Email Campaign',
    'Follow-up',
    'Sales Pitch Meeting',
    'Follow-up Resources Sent',
    'Interested',
    'Not Interested'
  ];

  const educationLevels = [
    'High School',
    'Associate Degree (AA)',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'PhD',
    'Bootcamp/Certificate',
    'Other'
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
        <button className="overview__nav-item overview__nav-item--active">
          Quick Actions
        </button>
      </nav>

      <main className="overview__main">
        <div className="quick-actions">
          <h2 className="quick-actions__title">Quick Actions</h2>
          <p className="quick-actions__subtitle">Add new data and update existing records</p>

          {/* Message Display */}
          {message.text && (
            <div className={`quick-actions__message quick-actions__message--${message.type}`}>
              {message.text}
            </div>
          )}

          {/* Action Cards */}
          {!activeAction && (
            <div className="quick-actions__cards">
              {/* Add New Lead Card */}
              <button
                className="quick-actions__card quick-actions__card--blue"
                onClick={() => setActiveAction('newLead')}
              >
                <div className="quick-actions__card-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="quick-actions__card-title">Add New Lead</h3>
                <p className="quick-actions__card-description">Create a new contact or job posting lead</p>
              </button>

              {/* Update Lead Status Card */}
              <button
                className="quick-actions__card quick-actions__card--gray"
                onClick={() => setActiveAction('updateLead')}
              >
                <div className="quick-actions__card-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="quick-actions__card-title">Update Lead Status</h3>
                <p className="quick-actions__card-description">Log conversations and update pipeline</p>
              </button>

              {/* Add Builder Card */}
              <button
                className="quick-actions__card quick-actions__card--purple"
                onClick={() => setActiveAction('newBuilder')}
              >
                <div className="quick-actions__card-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M20 8v6M23 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="quick-actions__card-title">Add Builder</h3>
                <p className="quick-actions__card-description">Create a new Builder profile</p>
              </button>
            </div>
          )}

          {/* Add New Lead Form */}
          {activeAction === 'newLead' && (
            <div className="quick-actions__form-container">
              <button
                className="quick-actions__back"
                onClick={() => setActiveAction(null)}
              >
                ← Back to Actions
              </button>

              <form className="quick-actions__form" onSubmit={handleAddNewLead}>
                <h3 className="quick-actions__form-title">Add New Lead</h3>

                <div className="quick-actions__form-grid">
                  <div className="quick-actions__form-group">
                    <label className="quick-actions__label">Contact Name *</label>
                    <input
                      type="text"
                      required
                      value={newLeadForm.contact_name}
                      onChange={(e) => setNewLeadForm({...newLeadForm, contact_name: e.target.value})}
                      className="quick-actions__input"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="quick-actions__form-group">
                    <label className="quick-actions__label">Company *</label>
                    <input
                      type="text"
                      required
                      value={newLeadForm.company_name}
                      onChange={(e) => setNewLeadForm({...newLeadForm, company_name: e.target.value})}
                      className="quick-actions__input"
                      placeholder="Acme Corp"
                    />
                  </div>

                  <div className="quick-actions__form-group">
                    <label className="quick-actions__label">Contact Title</label>
                    <input
                      type="text"
                      value={newLeadForm.contact_title}
                      onChange={(e) => setNewLeadForm({...newLeadForm, contact_title: e.target.value})}
                      className="quick-actions__input"
                      placeholder="HR Manager"
                    />
                  </div>

                  <div className="quick-actions__form-group">
                    <label className="quick-actions__label">Contact Email</label>
                    <input
                      type="email"
                      value={newLeadForm.contact_email}
                      onChange={(e) => setNewLeadForm({...newLeadForm, contact_email: e.target.value})}
                      className="quick-actions__input"
                      placeholder="john@acme.com"
                    />
                  </div>

                  <div className="quick-actions__form-group">
                    <label className="quick-actions__label">Contact Phone</label>
                    <input
                      type="tel"
                      value={newLeadForm.contact_phone}
                      onChange={(e) => setNewLeadForm({...newLeadForm, contact_phone: e.target.value})}
                      className="quick-actions__input"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div className="quick-actions__form-group">
                    <label className="quick-actions__label">Date of Outreach *</label>
                    <input
                      type="date"
                      required
                      value={newLeadForm.outreach_date}
                      onChange={(e) => setNewLeadForm({...newLeadForm, outreach_date: e.target.value})}
                      className="quick-actions__input"
                    />
                  </div>

                  <div className="quick-actions__form-group">
                    <label className="quick-actions__label">Lead Temperature *</label>
                    <select
                      required
                      value={newLeadForm.lead_temperature}
                      onChange={(e) => setNewLeadForm({...newLeadForm, lead_temperature: e.target.value})}
                      className="quick-actions__select"
                    >
                      <option value="hot">Hot</option>
                      <option value="warm">Warm</option>
                      <option value="cold">Cold</option>
                    </select>
                  </div>

                  <div className="quick-actions__form-group">
                    <label className="quick-actions__label">Current Stage *</label>
                    <select
                      required
                      value={newLeadForm.stage}
                      onChange={(e) => setNewLeadForm({...newLeadForm, stage: e.target.value})}
                      className="quick-actions__select"
                    >
                      {stages.map(stage => (
                        <option key={stage} value={stage}>{stage}</option>
                      ))}
                    </select>
                  </div>

                  <div className="quick-actions__form-group">
                    <label className="quick-actions__label">Role for Consideration</label>
                    <input
                      type="text"
                      value={newLeadForm.role_consideration}
                      onChange={(e) => setNewLeadForm({...newLeadForm, role_consideration: e.target.value})}
                      className="quick-actions__input"
                      placeholder="Software Engineer"
                    />
                  </div>

                  <div className="quick-actions__form-group">
                    <label className="quick-actions__label">Ownership *</label>
                    <select
                      required
                      value={newLeadForm.ownership}
                      onChange={(e) => setNewLeadForm({...newLeadForm, ownership: e.target.value})}
                      className="quick-actions__select"
                    >
                      {staffMembers.map(staff => (
                        <option key={staff.id} value={staff.name}>{staff.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="quick-actions__form-group quick-actions__form-group--full">
                    <label className="quick-actions__label">Job Description URL (Optional)</label>
                    <input
                      type="url"
                      value={newLeadForm.job_description_url}
                      onChange={(e) => setNewLeadForm({...newLeadForm, job_description_url: e.target.value})}
                      className="quick-actions__input"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="quick-actions__form-group quick-actions__form-group--full">
                    <label className="quick-actions__label">Additional Notes (Optional)</label>
                    <textarea
                      value={newLeadForm.notes}
                      onChange={(e) => setNewLeadForm({...newLeadForm, notes: e.target.value})}
                      className="quick-actions__textarea"
                      placeholder="Describe your relationship, more about the role, and any relevant details..."
                      rows="4"
                    />
                  </div>
                </div>

                <div className="quick-actions__form-actions">
                  <button
                    type="button"
                    onClick={() => setActiveAction(null)}
                    className="quick-actions__button quick-actions__button--secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="quick-actions__button quick-actions__button--primary"
                  >
                    {loading ? 'Adding...' : 'Add Lead'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Update Lead Form */}
          {activeAction === 'updateLead' && (
            <div className="quick-actions__form-container">
              <button
                className="quick-actions__back"
                onClick={() => setActiveAction(null)}
              >
                ← Back to Actions
              </button>

              <form className="quick-actions__form" onSubmit={handleUpdateLead}>
                <h3 className="quick-actions__form-title">Update Lead Status</h3>

                <div className="quick-actions__form-group quick-actions__form-group--full">
                  <label className="quick-actions__label">Search for Lead *</label>
                  <div className="quick-actions__search-container">
                    <input
                      type="text"
                      value={updateLeadForm.search}
                      onChange={(e) => setUpdateLeadForm({...updateLeadForm, search: e.target.value})}
                      className="quick-actions__input"
                      placeholder="Type person's name or company..."
                    />
                    {leadSearchResults.length > 0 && (
                      <div className="quick-actions__dropdown">
                        {leadSearchResults.map(lead => (
                          <button
                            key={lead.id}
                            type="button"
                            className="quick-actions__dropdown-item"
                            onClick={() => {
                              setUpdateLeadForm({
                                ...updateLeadForm,
                                selectedLead: lead,
                                stage: lead.stage || '',
                                search: `${lead.contact_name} - ${lead.company_name}`
                              });
                              setLeadSearchResults([]);
                            }}
                          >
                            <div className="quick-actions__dropdown-name">{lead.contact_name}</div>
                            <div className="quick-actions__dropdown-company">{lead.company_name}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {updateLeadForm.selectedLead && (
                  <>
                    <div className="quick-actions__selected-lead">
                      <h4 className="quick-actions__selected-title">Selected Lead</h4>
                      <div className="quick-actions__selected-info">
                        <p><strong>Contact:</strong> {updateLeadForm.selectedLead.contact_name}</p>
                        <p><strong>Company:</strong> {updateLeadForm.selectedLead.company_name}</p>
                        <p><strong>Current Stage:</strong> {updateLeadForm.selectedLead.stage}</p>
                      </div>
                    </div>

                    <div className="quick-actions__form-group">
                      <label className="quick-actions__label">Update Stage *</label>
                      <select
                        required
                        value={updateLeadForm.stage}
                        onChange={(e) => setUpdateLeadForm({...updateLeadForm, stage: e.target.value})}
                        className="quick-actions__select"
                      >
                        {stages.map(stage => (
                          <option key={stage} value={stage}>{stage}</option>
                        ))}
                      </select>
                    </div>

                    <div className="quick-actions__form-group quick-actions__form-group--full">
                      <label className="quick-actions__label">Add Notes *</label>
                      <textarea
                        required
                        value={updateLeadForm.notes}
                        onChange={(e) => setUpdateLeadForm({...updateLeadForm, notes: e.target.value})}
                        className="quick-actions__textarea"
                        placeholder="Describe the update, email sent, conversation details, etc..."
                        rows="4"
                      />
                    </div>

                    <div className="quick-actions__form-group quick-actions__form-group--full">
                      <label className="quick-actions__label">Attach Email/Document (Optional)</label>
                      <input
                        type="file"
                        onChange={(e) => setUpdateLeadForm({...updateLeadForm, attachment: e.target.files[0]})}
                        className="quick-actions__file-input"
                        accept=".pdf,.doc,.docx,.txt,.eml"
                      />
                      <p className="quick-actions__help-text">Upload email or document related to this update</p>
                    </div>
                  </>
                )}

                <div className="quick-actions__form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setUpdateLeadForm({
                        search: '',
                        selectedLead: null,
                        stage: '',
                        notes: '',
                        attachment: null
                      });
                      setActiveAction(null);
                    }}
                    className="quick-actions__button quick-actions__button--secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !updateLeadForm.selectedLead}
                    className="quick-actions__button quick-actions__button--primary"
                  >
                    {loading ? 'Updating...' : 'Update Lead'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Add Builder Form */}
          {activeAction === 'newBuilder' && (
            <div className="quick-actions__form-container">
              <button
                className="quick-actions__back"
                onClick={() => setActiveAction(null)}
              >
                ← Back to Actions
              </button>

              <form className="quick-actions__form" onSubmit={handleAddBuilder}>
                <h3 className="quick-actions__form-title">Add New Builder</h3>

                <div className="quick-actions__form-grid">
                  <div className="quick-actions__form-group">
                    <label className="quick-actions__label">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newBuilderForm.name}
                      onChange={(e) => setNewBuilderForm({...newBuilderForm, name: e.target.value})}
                      className="quick-actions__input"
                      placeholder="Jane Smith"
                    />
                  </div>

                  <div className="quick-actions__form-group">
                    <label className="quick-actions__label">Cohort *</label>
                    <input
                      type="text"
                      required
                      value={newBuilderForm.cohort}
                      onChange={(e) => setNewBuilderForm({...newBuilderForm, cohort: e.target.value})}
                      className="quick-actions__input"
                      placeholder="Cohort 1"
                    />
                  </div>

                  <div className="quick-actions__form-group">
                    <label className="quick-actions__label">Pursuit Email *</label>
                    <input
                      type="email"
                      required
                      value={newBuilderForm.email}
                      onChange={(e) => setNewBuilderForm({...newBuilderForm, email: e.target.value})}
                      className="quick-actions__input"
                      placeholder="jane@pursuit.org"
                    />
                  </div>

                  <div className="quick-actions__form-group">
                    <label className="quick-actions__label">Years of Experience</label>
                    <input
                      type="number"
                      value={newBuilderForm.years_experience}
                      onChange={(e) => setNewBuilderForm({...newBuilderForm, years_experience: e.target.value})}
                      className="quick-actions__input"
                      placeholder="2"
                      min="0"
                    />
                  </div>

                  <div className="quick-actions__form-group">
                    <label className="quick-actions__label">Education Level</label>
                    <select
                      value={newBuilderForm.education}
                      onChange={(e) => setNewBuilderForm({...newBuilderForm, education: e.target.value})}
                      className="quick-actions__select"
                    >
                      <option value="">Select Education</option>
                      {educationLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  <div className="quick-actions__form-group">
                    <label className="quick-actions__label">Aligned Sector</label>
                    <select
                      value={newBuilderForm.aligned_sector}
                      onChange={(e) => setNewBuilderForm({...newBuilderForm, aligned_sector: e.target.value})}
                      className="quick-actions__select"
                    >
                      <option value="">Select Sector</option>
                      {sectors.map(sector => (
                        <option key={sector} value={sector}>{sector}</option>
                      ))}
                    </select>
                  </div>

                  <div className="quick-actions__form-group">
                    <label className="quick-actions__label">Builder's Desired Role *</label>
                    <input
                      type="text"
                      required
                      value={newBuilderForm.role}
                      onChange={(e) => setNewBuilderForm({...newBuilderForm, role: e.target.value})}
                      className="quick-actions__input"
                      placeholder="Full-Stack Developer"
                    />
                  </div>

                  <div className="quick-actions__form-group">
                    <label className="quick-actions__label">LinkedIn Profile</label>
                    <input
                      type="url"
                      value={newBuilderForm.linkedin_url}
                      onChange={(e) => setNewBuilderForm({...newBuilderForm, linkedin_url: e.target.value})}
                      className="quick-actions__input"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>

                  <div className="quick-actions__form-group quick-actions__form-group--full">
                    <label className="quick-actions__label">Resume URL</label>
                    <input
                      type="url"
                      value={newBuilderForm.portfolio_url}
                      onChange={(e) => setNewBuilderForm({...newBuilderForm, portfolio_url: e.target.value})}
                      className="quick-actions__input"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="quick-actions__form-group quick-actions__form-group--full">
                    <label className="quick-actions__label">Skills & Technologies</label>
                    <textarea
                      value={newBuilderForm.skills}
                      onChange={(e) => setNewBuilderForm({...newBuilderForm, skills: e.target.value})}
                      className="quick-actions__textarea"
                      placeholder="React, Node.js, PostgreSQL, AWS, etc."
                      rows="3"
                    />
                  </div>
                </div>

                <div className="quick-actions__form-actions">
                  <button
                    type="button"
                    onClick={() => setActiveAction(null)}
                    className="quick-actions__button quick-actions__button--secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="quick-actions__button quick-actions__button--primary"
                  >
                    {loading ? 'Adding...' : 'Add Builder'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default QuickActions;
