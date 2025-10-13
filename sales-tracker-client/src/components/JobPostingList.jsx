import { useState } from 'react';
import { jobPostingAPI } from '../services/api';
import JobPostingForm from './JobPostingForm';
import '../styles/List.css';

const JobPostingList = ({ data, onUpdate }) => {
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleEdit = (item) => {
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) {
      return;
    }

    setDeletingId(id);
    try {
      await jobPostingAPI.deleteJobPosting(id);
      onUpdate();
    } catch (error) {
      alert('Error deleting job posting: ' + error.message);
      setDeletingId(null);
    }
  };

  const handleEditSuccess = () => {
    setEditingId(null);
    onUpdate();
  };

  const getStatusColor = (status) => {
    const colors = {
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

  if (editingId) {
    const editData = data.find(item => item.id === editingId);
    return (
      <JobPostingForm
        editData={editData}
        onSuccess={handleEditSuccess}
        onCancel={() => setEditingId(null)}
      />
    );
  }

  if (data.length === 0) {
    return (
      <div className="list__empty">
        <p>No job postings yet. Click "Log Job Posting" to create one!</p>
      </div>
    );
  }

  return (
    <div className="list">
      <div className="list__header">
        <h3 className="list__title">Your Job Postings</h3>
        <p className="list__count">{data.length} posting{data.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="list__grid">
        {data.map(item => (
          <div key={item.id} className="list__card">
            <div className="list__card-header">
              <h4 className="list__card-title">{item.job_title}</h4>
              <span
                className="list__badge"
                style={{ backgroundColor: getStatusColor(item.status) }}
              >
                {item.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="list__card-body">
              <p className="list__detail">
                <strong>Company:</strong> {item.company_name}
              </p>
              {item.location && (
                <p className="list__detail">
                  <strong>Location:</strong> {item.location}
                </p>
              )}
              {item.salary_range && (
                <p className="list__detail">
                  <strong>Salary:</strong> {item.salary_range}
                </p>
              )}
              {item.source && (
                <p className="list__detail">
                  <strong>Source:</strong> {item.source.replace(/_/g, ' ')}
                </p>
              )}
              {item.job_url && (
                <p className="list__detail">
                  <strong>URL:</strong>{' '}
                  <a
                    href={item.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="list__link"
                  >
                    View Posting
                  </a>
                </p>
              )}
              {item.description && (
                <p className="list__notes">
                  <strong>Description:</strong> {item.description}
                </p>
              )}
              {item.notes && (
                <p className="list__notes">
                  <strong>Notes:</strong> {item.notes}
                </p>
              )}
              <p className="list__detail list__detail--meta">
                Posted: {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="list__card-footer">
              <button
                onClick={() => handleEdit(item)}
                className="list__button list__button--edit"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="list__button list__button--delete"
                disabled={deletingId === item.id}
              >
                {deletingId === item.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobPostingList;

