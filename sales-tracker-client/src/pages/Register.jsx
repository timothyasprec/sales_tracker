import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import '../styles/Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await register({ name, email, password });

    if (result.success) {
      navigate('/overview');
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__container">
        <div className="auth__header">
          <h1 className="auth__title">Sales Tracker</h1>
          <h2 className="auth__subtitle">Create your account</h2>
        </div>

        {error && (
          <div className="auth__error">
            {error}
          </div>
        )}

        <form className="auth__form" onSubmit={handleSubmit}>
          <div className="auth__form-group">
            <label htmlFor="name" className="auth__label">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              className="auth__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="auth__form-group">
            <label htmlFor="email" className="auth__label">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="auth__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="auth__form-group">
            <label htmlFor="password" className="auth__label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="auth__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength="6"
            />
          </div>

          <div className="auth__form-group">
            <label htmlFor="confirmPassword" className="auth__label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="auth__input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              minLength="6"
            />
          </div>

          <button
            type="submit"
            className="auth__button"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth__footer">
          Already have an account?{' '}
          <Link to="/login" className="auth__link">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

