import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { outreachAPI, jobPostingAPI } from '../services/api';
import OutreachForm from '../components/OutreachForm';
import JobPostingForm from '../components/JobPostingForm';
import OutreachList from '../components/OutreachList';
import JobPostingList from '../components/JobPostingList';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('outreach');
  const [showForm, setShowForm] = useState(false);
  const [outreachData, setOutreachData] = useState([]);
  const [jobPostingsData, setJobPostingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'outreach') {
        const data = await outreachAPI.getAllOutreach();
        setOutreachData(data);
      } else {
        const data = await jobPostingAPI.getAllJobPostings();
        setJobPostingsData(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchData();
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__header-content">
          <h1 className="dashboard__title">Sales Tracker</h1>
          <div className="dashboard__user">
            <span className="dashboard__user-name">
              {user?.name}
              {isAdmin && <span className="dashboard__badge">Admin</span>}
            </span>
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="dashboard__button dashboard__button--secondary"
              >
                Admin View
              </button>
            )}
            <button
              onClick={handleLogout}
              className="dashboard__button dashboard__button--logout"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard__main">
        <div className="dashboard__tabs">
          <button
            className={`dashboard__tab ${activeTab === 'outreach' ? 'dashboard__tab--active' : ''}`}
            onClick={() => {
              setActiveTab('outreach');
              setShowForm(false);
            }}
          >
            Contact Outreach
          </button>
          <button
            className={`dashboard__tab ${activeTab === 'jobs' ? 'dashboard__tab--active' : ''}`}
            onClick={() => {
              setActiveTab('jobs');
              setShowForm(false);
            }}
          >
            Job Postings
          </button>
        </div>

        <div className="dashboard__content">
          {error && (
            <div className="dashboard__error">
              {error}
            </div>
          )}

          {!showForm && (
            <div className="dashboard__actions">
              <button
                onClick={() => setShowForm(true)}
                className="dashboard__button dashboard__button--primary"
              >
                {activeTab === 'outreach' ? '+ Log Outreach' : '+ Log Job Posting'}
              </button>
            </div>
          )}

          {showForm ? (
            <div className="dashboard__form-container">
              {activeTab === 'outreach' ? (
                <OutreachForm
                  onSuccess={handleFormSuccess}
                  onCancel={() => setShowForm(false)}
                />
              ) : (
                <JobPostingForm
                  onSuccess={handleFormSuccess}
                  onCancel={() => setShowForm(false)}
                />
              )}
            </div>
          ) : (
            <div className="dashboard__list">
              {loading ? (
                <div className="dashboard__loading">Loading...</div>
              ) : activeTab === 'outreach' ? (
                <OutreachList data={outreachData} onUpdate={fetchData} />
              ) : (
                <JobPostingList data={jobPostingsData} onUpdate={fetchData} />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

