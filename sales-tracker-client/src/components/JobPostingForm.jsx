import { useState } from 'react';
import { jobPostingAPI } from '../services/api';
import '../styles/Form.css';

const JobPostingForm = ({ onSuccess, onCancel, editData = null }) => {
  const [formData, setFormData] = useState(editData || {
    company_name: '',
    job_title: '',
    job_url: '',
    source: 'job_board',
    outreach_id: '',
    status: 'new',
    description: '',
    salary_range: '',
    location: '',
    notes: ''
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
      // Clean up empty fields
      const submitData = { ...formData };
      if (!submitData.outreach_id) delete submitData.outreach_id;
      
      if (editData?.id) {
        await jobPostingAPI.updateJobPosting(editData.id, submitData);
      } else {
        await jobPostingAPI.createJobPosting(submitData);
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
        {editData ? 'Edit Job Posting' : 'Log New Job Posting'}
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
          <label htmlFor="job_title" className="form__label">
            Job Title *
          </label>
          <input
            type="text"
            id="job_title"
            name="job_title"
            className="form__input"
            value={formData.job_title}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="form__group">
        <label htmlFor="job_url" className="form__label">
          Job Posting URL
        </label>
        <input
          type="url"
          id="job_url"
          name="job_url"
          className="form__input"
          value={formData.job_url}
          onChange={handleChange}
          disabled={loading}
          placeholder="https://..."
        />
      </div>

      <div className="form__row">
        <div className="form__group">
          <label htmlFor="source" className="form__label">
            Source
          </label>
          <select
            id="source"
            name="source"
            className="form__select"
            value={formData.source}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="job_board">Job Board</option>
            <option value="outreach">Outreach</option>
            <option value="referral">Referral</option>
            <option value="other">Other</option>
          </select>
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
            <option value="new">New</option>
            <option value="reviewing">Reviewing</option>
            <option value="shared_with_builders">Shared with Builders</option>
            <option value="builders_applied">Builders Applied</option>
            <option value="interview_stage">Interview Stage</option>
            <option value="offer_received">Offer Received</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="form__row">
        <div className="form__group">
          <label htmlFor="location" className="form__label">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            className="form__input"
            value={formData.location}
            onChange={handleChange}
            disabled={loading}
            placeholder="City, State or Remote"
          />
        </div>

        <div className="form__group">
          <label htmlFor="salary_range" className="form__label">
            Salary Range
          </label>
          <input
            type="text"
            id="salary_range"
            name="salary_range"
            className="form__input"
            value={formData.salary_range}
            onChange={handleChange}
            disabled={loading}
            placeholder="e.g., $60k - $80k"
          />
        </div>
      </div>

      <div className="form__group">
        <label htmlFor="description" className="form__label">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className="form__textarea"
          value={formData.description}
          onChange={handleChange}
          disabled={loading}
          rows="4"
          placeholder="Job description, requirements, etc..."
        />
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
          placeholder="Additional notes..."
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

export default JobPostingForm;

