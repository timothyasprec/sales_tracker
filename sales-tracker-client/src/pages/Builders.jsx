import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { builderAPI, activityAPI } from '../services/api';
import '../styles/Overview.css';
import '../styles/Builders.css';
import '../styles/QuickActions.css';

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
  
  // Modal state
  const [activeModal, setActiveModal] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form state
  const [newBuilderForm, setNewBuilderForm] = useState({
    name: '',
    cohort: '',
    email: '',
    linkedin_url: '',
    portfolio_url: '',
    years_experience: '',
    education: '',
    university: '',
    major: '',
    education_completed: false,
    date_of_birth: '',
    aligned_sector: [],
    sector_alignment_notes: '',
    role: '',
    skills: ''
  });

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

  // Constants for forms
  const educationLevels = [
    'High School',
    'Vocational',
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
    'Other'
  ];

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const closeModal = () => {
    setActiveModal(null);
    setNewBuilderForm({
      name: '',
      cohort: '',
      email: '',
      linkedin_url: '',
      portfolio_url: '',
      years_experience: '',
      education: '',
      university: '',
      major: '',
      education_completed: false,
      date_of_birth: '',
      aligned_sector: [],
      sector_alignment_notes: '',
      role: '',
      skills: ''
    });
  };

  const handleAddBuilder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await builderAPI.createBuilder(newBuilderForm);
      
      await activityAPI.createActivity({
        user_name: user.name,
        action_type: 'added_builder',
        entity_type: 'builder',
        entity_name: newBuilderForm.name,
        details: {
          cohort: newBuilderForm.cohort,
          role: newBuilderForm.role,
          sectors: newBuilderForm.aligned_sector
        }
      });
      
      showMessage('success', 'New builder added successfully!');
      closeModal();
      fetchData();
    } catch (error) {
      showMessage('error', 'Failed to add builder. Please try again.');
      console.error('Error adding builder:', error);
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

          {/* Action Button */}
          <div className="builders__action-buttons">
            <button
              className="action-button action-button--purple"
              onClick={() => setActiveModal('newBuilder')}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 5v10M5 10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add Builder
            </button>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`quick-actions__message quick-actions__message--${message.type}`}>
              {message.text}
            </div>
          )}

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

          {/* Modal */}
          {activeModal && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={closeModal}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>

                <form className="modal-form" onSubmit={handleAddBuilder}>
                  <h2 className="modal-title">Add New Builder</h2>

                  <div className="form-row">
                    <div className="form-section">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={newBuilderForm.name}
                        onChange={(e) => setNewBuilderForm({...newBuilderForm, name: e.target.value})}
                        className="form-input"
                        placeholder="Jane Smith"
                      />
                    </div>
                    <div className="form-section">
                      <label className="form-label">Cohort *</label>
                      <input
                        type="text"
                        required
                        value={newBuilderForm.cohort}
                        onChange={(e) => setNewBuilderForm({...newBuilderForm, cohort: e.target.value})}
                        className="form-input"
                        placeholder="Cohort 1"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-section">
                      <label className="form-label">Pursuit Email *</label>
                      <input
                        type="email"
                        required
                        value={newBuilderForm.email}
                        onChange={(e) => setNewBuilderForm({...newBuilderForm, email: e.target.value})}
                        className="form-input"
                        placeholder="jane@pursuit.org"
                      />
                    </div>
                    <div className="form-section">
                      <label className="form-label">Years of Experience</label>
                      <input
                        type="number"
                        value={newBuilderForm.years_experience}
                        onChange={(e) => setNewBuilderForm({...newBuilderForm, years_experience: e.target.value})}
                        className="form-input"
                        placeholder="2"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="form-row">
                    <div className="form-section">
                      <label className="form-label">Date of Birth</label>
                      <input
                        type="date"
                        value={newBuilderForm.date_of_birth}
                        onChange={(e) => setNewBuilderForm({...newBuilderForm, date_of_birth: e.target.value})}
                        className="form-input"
                      />
                    </div>
                    <div className="form-section">
                      <label className="form-label">Education Level</label>
                      <select
                        value={newBuilderForm.education}
                        onChange={(e) => setNewBuilderForm({...newBuilderForm, education: e.target.value})}
                        className="form-select"
                      >
                        <option value="">Select Education</option>
                        {educationLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* University and Major */}
                  <div className="form-row">
                    <div className="form-section">
                      <label className="form-label">University Name</label>
                      <input
                        type="text"
                        value={newBuilderForm.university}
                        onChange={(e) => setNewBuilderForm({...newBuilderForm, university: e.target.value})}
                        className="form-input"
                        placeholder="e.g., City University of New York"
                      />
                    </div>
                    <div className="form-section">
                      <label className="form-label">Major/Field of Study</label>
                      <input
                        type="text"
                        value={newBuilderForm.major}
                        onChange={(e) => setNewBuilderForm({...newBuilderForm, major: e.target.value})}
                        className="form-input"
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                  </div>

                  {/* Education Completed */}
                  <div className="form-section">
                    <label className="form-checkbox-container">
                      <input
                        type="checkbox"
                        checked={newBuilderForm.education_completed}
                        onChange={(e) => setNewBuilderForm({...newBuilderForm, education_completed: e.target.checked})}
                        className="form-checkbox"
                      />
                      <span className="form-checkbox-label">Education Completed</span>
                    </label>
                  </div>

                  {/* Aligned Sectors - Multi-select */}
                  <div className="form-section">
                    <label className="form-label">Aligned Sectors *</label>
                    <p className="form-help-text">Select all sectors where this builder would be a good fit</p>
                    <div className="sector-checkboxes">
                      {sectors.map(sector => (
                        <label key={sector} className="sector-checkbox-item">
                          <input
                            type="checkbox"
                            checked={newBuilderForm.aligned_sector.includes(sector)}
                            onChange={(e) => {
                              const updatedSectors = e.target.checked
                                ? [...newBuilderForm.aligned_sector, sector]
                                : newBuilderForm.aligned_sector.filter(s => s !== sector);
                              setNewBuilderForm({...newBuilderForm, aligned_sector: updatedSectors});
                            }}
                            className="sector-checkbox"
                          />
                          <span className="sector-checkbox-text">{sector}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sector Alignment Notes */}
                  <div className="form-section">
                    <label className="form-label">Sector Alignment Notes</label>
                    <p className="form-help-text">Explain why this builder would be a good fit for the selected sectors</p>
                    <textarea
                      value={newBuilderForm.sector_alignment_notes}
                      onChange={(e) => setNewBuilderForm({...newBuilderForm, sector_alignment_notes: e.target.value})}
                      className="form-textarea"
                      rows="3"
                      placeholder="e.g., Has experience with healthcare APIs and regulatory compliance, strong interest in fintech..."
                    />
                  </div>

                  <div className="form-section">
                    <label className="form-label">Builder's Desired Role *</label>
                    <input
                      type="text"
                      required
                      value={newBuilderForm.role}
                      onChange={(e) => setNewBuilderForm({...newBuilderForm, role: e.target.value})}
                      className="form-input"
                      placeholder="Full-Stack Developer"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-section">
                      <label className="form-label">LinkedIn Profile</label>
                      <input
                        type="url"
                        value={newBuilderForm.linkedin_url}
                        onChange={(e) => setNewBuilderForm({...newBuilderForm, linkedin_url: e.target.value})}
                        className="form-input"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    <div className="form-section">
                      <label className="form-label">Resume URL</label>
                      <input
                        type="url"
                        value={newBuilderForm.portfolio_url}
                        onChange={(e) => setNewBuilderForm({...newBuilderForm, portfolio_url: e.target.value})}
                        className="form-input"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="form-section">
                    <label className="form-label">Skills & Technologies</label>
                    <textarea
                      value={newBuilderForm.skills}
                      onChange={(e) => setNewBuilderForm({...newBuilderForm, skills: e.target.value})}
                      className="form-textarea"
                      rows="3"
                      placeholder="React, Node.js, PostgreSQL, AWS, etc."
                    />
                  </div>

                  {/* Actions */}
                  <div className="modal-actions">
                    <button type="button" onClick={closeModal} className="btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary">
                      {loading ? 'Adding...' : 'Add Builder'}
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

export default Builders;

