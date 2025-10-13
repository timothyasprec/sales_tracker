import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { outreachAPI, jobPostingAPI, userAPI } from '../services/api';
import '../styles/Admin.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('outreach');
  const [outreachData, setOutreachData] = useState([]);
  const [jobPostingsData, setJobPostingsData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    staff_user_id: '',
    status: '',
    company_name: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeView, filters]);

  const fetchUsers = async () => {
    try {
      const data = await userAPI.getAllUsers();
      setUsersData(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );

      if (activeView === 'outreach') {
        const data = await outreachAPI.getAllOutreach(cleanFilters);
        setOutreachData(data);
      } else if (activeView === 'jobs') {
        const data = await jobPostingAPI.getAllJobPostings(cleanFilters);
        setJobPostingsData(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      staff_user_id: '',
      status: '',
      company_name: ''
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    const colors = {
      attempted: '#6c757d',
      responded: '#17a2b8',
      interested: '#ffc107',
      meeting_scheduled: '#28a745',
      opportunity_created: '#007bff',
      not_interested: '#dc3545',
      no_response: '#6c757d',
      new: '#6c757d',
      reviewing: '#17a2b8',
      shared_with_builders: '#ffc107',
      builders_applied: '#fd7e14',
      interview_stage: '#28a745',
      offer_received: '#007bff',
      closed: '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  return (
    <div className="admin">
      <header className="admin__header">
        <div className="admin__header-content">
          <h1 className="admin__title">Admin Dashboard</h1>
          <div className="admin__user">
            <span className="admin__user-name">{user?.name}</span>
            <button
              onClick={() => navigate('/dashboard')}
              className="admin__button admin__button--secondary"
            >
              Staff View
            </button>
            <button
              onClick={handleLogout}
              className="admin__button admin__button--logout"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="admin__main">
        <div className="admin__tabs">
          <button
            className={`admin__tab ${activeView === 'outreach' ? 'admin__tab--active' : ''}`}
            onClick={() => setActiveView('outreach')}
          >
            All Outreach
          </button>
          <button
            className={`admin__tab ${activeView === 'jobs' ? 'admin__tab--active' : ''}`}
            onClick={() => setActiveView('jobs')}
          >
            All Job Postings
          </button>
        </div>

        <div className="admin__filters">
          <div className="admin__filters-title">Filters:</div>
          <select
            name="staff_user_id"
            value={filters.staff_user_id}
            onChange={handleFilterChange}
            className="admin__filter-select"
          >
            <option value="">All Staff Members</option>
            {usersData.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="admin__filter-select"
          >
            <option value="">All Statuses</option>
            {activeView === 'outreach' ? (
              <>
                <option value="attempted">Attempted</option>
                <option value="responded">Responded</option>
                <option value="interested">Interested</option>
                <option value="meeting_scheduled">Meeting Scheduled</option>
                <option value="opportunity_created">Opportunity Created</option>
                <option value="not_interested">Not Interested</option>
                <option value="no_response">No Response</option>
              </>
            ) : (
              <>
                <option value="new">New</option>
                <option value="reviewing">Reviewing</option>
                <option value="shared_with_builders">Shared with Builders</option>
                <option value="builders_applied">Builders Applied</option>
                <option value="interview_stage">Interview Stage</option>
                <option value="offer_received">Offer Received</option>
                <option value="closed">Closed</option>
              </>
            )}
          </select>

          <input
            type="text"
            name="company_name"
            value={filters.company_name}
            onChange={handleFilterChange}
            placeholder="Search company..."
            className="admin__filter-input"
          />

          <button onClick={clearFilters} className="admin__button admin__button--clear">
            Clear Filters
          </button>
        </div>

        <div className="admin__content">
          {error && <div className="admin__error">{error}</div>}

          {loading ? (
            <div className="admin__loading">Loading...</div>
          ) : (
            <div className="admin__table-container">
              {activeView === 'outreach' ? (
                <table className="admin__table">
                  <thead>
                    <tr>
                      <th>Staff Member</th>
                      <th>Company</th>
                      <th>Contact</th>
                      <th>Date</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outreachData.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="admin__table-empty">
                          No outreach records found
                        </td>
                      </tr>
                    ) : (
                      outreachData.map(item => (
                        <tr key={item.id}>
                          <td>{item.staff_name}</td>
                          <td><strong>{item.company_name}</strong></td>
                          <td>
                            {item.contact_name || '-'}
                            {item.contact_title && <><br /><small>{item.contact_title}</small></>}
                          </td>
                          <td>{new Date(item.outreach_date).toLocaleDateString()}</td>
                          <td>{item.contact_method || '-'}</td>
                          <td>
                            <span
                              className="admin__badge"
                              style={{ backgroundColor: getStatusColor(item.status) }}
                            >
                              {item.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="admin__notes-cell">
                            {item.notes || item.response_notes || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="admin__table">
                  <thead>
                    <tr>
                      <th>Staff Member</th>
                      <th>Company</th>
                      <th>Job Title</th>
                      <th>Location</th>
                      <th>Source</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobPostingsData.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="admin__table-empty">
                          No job postings found
                        </td>
                      </tr>
                    ) : (
                      jobPostingsData.map(item => (
                        <tr key={item.id}>
                          <td>{item.staff_name}</td>
                          <td><strong>{item.company_name}</strong></td>
                          <td>{item.job_title}</td>
                          <td>{item.location || '-'}</td>
                          <td>{item.source?.replace(/_/g, ' ') || '-'}</td>
                          <td>
                            <span
                              className="admin__badge"
                              style={{ backgroundColor: getStatusColor(item.status) }}
                            >
                              {item.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td>{new Date(item.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}

          <div className="admin__stats">
            <p>
              Total Records: {activeView === 'outreach' ? outreachData.length : jobPostingsData.length}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

