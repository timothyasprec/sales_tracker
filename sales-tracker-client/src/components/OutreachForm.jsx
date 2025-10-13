import { useState } from 'react';
import { outreachAPI } from '../services/api';
import '../styles/Form.css';

const OutreachForm = ({ onSuccess, onCancel, editData = null }) => {
  const [formData, setFormData] = useState(editData || {
    contact_name: '',
    contact_title: '',
    company_name: '',
    linkedin_url: '',
    contact_method: 'email',
    outreach_date: new Date().toISOString().split('T')[0],
    status: 'attempted',
    notes: '',
    response_notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editData?.id) {
        await outreachAPI.updateOutreach(editData.id, formData);
      } else {
        await outreachAPI.createOutreach(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2 className="form__title">
        {editData ? 'Edit Outreach' : 'Log New Outreach'}
      </h2>

      {error && (
        <div className="form__error">{error}</div>
      )}

      <div className="form__row">
        <div className="form__group">
          <label htmlFor="company_name" className="form__label">
            Company Name *
          </label>
          <input
            type="text"
            id="company_name"
            name="company_name"
            className="form__input"
            value={formData.company_name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form__group">
          <label htmlFor="outreach_date" className="form__label">
            Outreach Date *
          </label>
          <input
            type="date"
            id="outreach_date"
            name="outreach_date"
            className="form__input"
            value={formData.outreach_date}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="form__row">
        <div className="form__group">
          <label htmlFor="contact_name" className="form__label">
            Contact Name
          </label>
          <input
            type="text"
            id="contact_name"
            name="contact_name"
            className="form__input"
            value={formData.contact_name}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form__group">
          <label htmlFor="contact_title" className="form__label">
            Contact Title
          </label>
          <input
            type="text"
            id="contact_title"
            name="contact_title"
            className="form__input"
            value={formData.contact_title}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>

      <div className="form__row">
        <div className="form__group">
          <label htmlFor="linkedin_url" className="form__label">
            LinkedIn URL
          </label>
          <input
            type="url"
            id="linkedin_url"
            name="linkedin_url"
            className="form__input"
            value={formData.linkedin_url}
            onChange={handleChange}
            disabled={loading}
            placeholder="https://linkedin.com/in/..."
          />
        </div>

        <div className="form__group">
          <label htmlFor="contact_method" className="form__label">
            Contact Method
          </label>
          <select
            id="contact_method"
            name="contact_method"
            className="form__select"
            value={formData.contact_method}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="email">Email</option>
            <option value="linkedin">LinkedIn</option>
            <option value="phone">Phone</option>
            <option value="in_person">In Person</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="form__group">
        <label htmlFor="status" className="form__label">
          Status
        </label>
        <select
          id="status"
          name="status"
          className="form__select"
          value={formData.status}
          onChange={handleChange}
          disabled={loading}
        >
          <option value="attempted">Attempted</option>
          <option value="responded">Responded</option>
          <option value="interested">Interested</option>
          <option value="meeting_scheduled">Meeting Scheduled</option>
          <option value="opportunity_created">Opportunity Created</option>
          <option value="not_interested">Not Interested</option>
          <option value="no_response">No Response</option>
        </select>
      </div>

      <div className="form__group">
        <label htmlFor="notes" className="form__label">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          className="form__textarea"
          value={formData.notes}
          onChange={handleChange}
          disabled={loading}
          rows="3"
          placeholder="General notes about the outreach..."
        />
      </div>

      <div className="form__group">
        <label htmlFor="response_notes" className="form__label">
          Response Notes
        </label>
        <textarea
          id="response_notes"
          name="response_notes"
          className="form__textarea"
          value={formData.response_notes}
          onChange={handleChange}
          disabled={loading}
          rows="3"
          placeholder="Details about their response..."
        />
      </div>

      <div className="form__actions">
        <button
          type="button"
          onClick={onCancel}
          className="form__button form__button--secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="form__button form__button--primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : editData ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default OutreachForm;

