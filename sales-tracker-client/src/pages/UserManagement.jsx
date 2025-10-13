import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import '../styles/UserManagement.css';

const UserManagement = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, [isAdmin, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update role');
      }

      fetchUsers();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'activate' : 'deactivate';

    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: newStatus })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update status');
      }

      fetchUsers();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="user-management">
      <header className="user-management__header">
        <div className="user-management__header-content">
          <h1 className="user-management__title">User Management</h1>
          <div className="user-management__nav">
            <button
              onClick={() => navigate('/admin')}
              className="user-management__button user-management__button--secondary"
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="user-management__button user-management__button--secondary"
            >
              Staff View
            </button>
            <button
              onClick={handleLogout}
              className="user-management__button user-management__button--logout"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="user-management__main">
        <div className="user-management__content">
          <div className="user-management__header-row">
            <h2>All Users</h2>
            <p className="user-management__count">
              {users.length} user{users.length !== 1 ? 's' : ''}
            </p>
          </div>

          {error && (
            <div className="user-management__error">{error}</div>
          )}

          {loading ? (
            <div className="user-management__loading">Loading users...</div>
          ) : (
            <div className="user-management__table-container">
              <table className="user-management__table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="user-management__empty">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>
                          <strong>{u.name}</strong>
                          {u.id === user?.id && (
                            <span className="user-management__you-badge">You</span>
                          )}
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`user-management__role-badge user-management__role-badge--${u.role}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span className={`user-management__status-badge ${u.is_active ? 'user-management__status-badge--active' : 'user-management__status-badge--inactive'}`}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="user-management__actions">
                          {u.id !== user?.id && (
                            <>
                              <button
                                onClick={() => handleRoleChange(u.id, u.role === 'admin' ? 'staff' : 'admin')}
                                className={`user-management__action-btn ${u.role === 'admin' ? 'user-management__action-btn--demote' : 'user-management__action-btn--promote'}`}
                              >
                                {u.role === 'admin' ? 'Demote to Staff' : 'Promote to Admin'}
                              </button>
                              <button
                                onClick={() => handleStatusToggle(u.id, u.is_active)}
                                className={`user-management__action-btn ${u.is_active ? 'user-management__action-btn--deactivate' : 'user-management__action-btn--activate'}`}
                              >
                                {u.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserManagement;

