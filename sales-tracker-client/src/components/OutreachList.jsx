import { useState } from 'react';
import { outreachAPI } from '../services/api';
import OutreachForm from './OutreachForm';
import '../styles/List.css';

const OutreachList = ({ data, onUpdate }) => {
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleEdit = (item) => {
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this outreach record?')) {
      return;
    }

    setDeletingId(id);
    try {
      await outreachAPI.deleteOutreach(id);
      onUpdate();
    } catch (error) {
      alert('Error deleting outreach: ' + error.message);
      setDeletingId(null);
    }
  };

  const handleEditSuccess = () => {
    setEditingId(null);
    onUpdate();
  };

  const getStatusColor = (status) => {
    const colors = {
      attempted: '#6c757d',
      responded: '#17a2b8',
      interested: '#ffc107',
      meeting_scheduled: '#28a745',
      opportunity_created: '#007bff',
      not_interested: '#dc3545',
      no_response: '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  if (editingId) {
    const editData = data.find(item => item.id === editingId);
    return (
      <OutreachForm
        editData={editData}
        onSuccess={handleEditSuccess}
        onCancel={() => setEditingId(null)}
      />
    );
  }

  if (data.length === 0) {
    return (
      <div className="list__empty">
        <p>No outreach records yet. Click "Log Outreach" to create one!</p>
      </div>
    );
  }

  return (
    <div className="list">
      <div className="list__header">
        <h3 className="list__title">Your Outreach Activity</h3>
        <p className="list__count">{data.length} record{data.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="list__grid">
        {data.map(item => (
          <div key={item.id} className="list__card">
            <div className="list__card-header">
              <h4 className="list__card-title">{item.company_name}</h4>
              <span
                className="list__badge"
                style={{ backgroundColor: getStatusColor(item.status) }}
              >
                {item.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="list__card-body">
              {item.contact_name && (
                <p className="list__detail">
                  <strong>Contact:</strong> {item.contact_name}
                  {item.contact_title && ` - ${item.contact_title}`}
                </p>
              )}
              <p className="list__detail">
                <strong>Date:</strong> {new Date(item.outreach_date).toLocaleDateString()}
              </p>
              {item.contact_method && (
                <p className="list__detail">
                  <strong>Method:</strong> {item.contact_method}
                </p>
              )}
              {item.linkedin_url && (
                <p className="list__detail">
                  <strong>LinkedIn:</strong>{' '}
                  <a
                    href={item.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="list__link"
                  >
                    View Profile
                  </a>
                </p>
              )}
              {item.notes && (
                <p className="list__notes">
                  <strong>Notes:</strong> {item.notes}
                </p>
              )}
              {item.response_notes && (
                <p className="list__notes">
                  <strong>Response:</strong> {item.response_notes}
                </p>
              )}
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

export default OutreachList;

