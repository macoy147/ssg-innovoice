import { useState, useEffect } from 'react';
import './AdminPanel.scss';
import API_URL from '../../config/api';

const STATUS_OPTIONS = [
  { value: 'submitted', label: 'Submitted', color: '#6b7280' },
  { value: 'under_review', label: 'Under Review', color: '#f59e0b' },
  { value: 'forwarded', label: 'Forwarded', color: '#3b82f6' },
  { value: 'action_taken', label: 'Action Taken', color: '#8b5cf6' },
  { value: 'resolved', label: 'Resolved', color: '#10b981' },
  { value: 'rejected', label: 'Rejected', color: '#ef4444' }
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'academic', label: '📚 Academic' },
  { value: 'administrative', label: '🏛️ Administrative' },
  { value: 'extracurricular', label: '🎯 Extracurricular' },
  { value: 'general', label: '💡 General' }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: '#6b7280' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#f97316' },
  { value: 'urgent', label: 'Urgent', color: '#ef4444' }
];

function AdminPanel({ onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Dashboard state
  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [filters, setFilters] = useState({ category: 'all', status: 'all', search: '' });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notification, setNotification] = useState(null);

  // Check if already authenticated (session storage)
  useEffect(() => {
    const savedPassword = sessionStorage.getItem('adminPassword');
    if (savedPassword) {
      setPassword(savedPassword);
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchSuggestions();
    }
  }, [isAuthenticated, filters, pagination.page]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      const res = await fetch(`${API_URL}/api/admin/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('adminPassword', password);
        setIsAuthenticated(true);
      } else {
        setLoginError('Invalid password');
      }
    } catch (error) {
      setLoginError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/stats`, {
        headers: { 'x-admin-password': password }
      });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 20,
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      });

      const res = await fetch(`${API_URL}/api/admin/suggestions?${params}`, {
        headers: { 'x-admin-password': password }
      });
      const data = await res.json();
      
      if (data.success) {
        setSuggestions(data.data);
        setPagination(prev => ({ ...prev, ...data.pagination }));
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id, status, notes = '') => {
    try {
      const res = await fetch(`${API_URL}/api/admin/suggestions/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify({ status, notes })
      });

      const data = await res.json();
      if (data.success) {
        showNotification('Status updated successfully');
        fetchSuggestions();
        fetchStats();
        if (selectedSuggestion?._id === id) {
          setSelectedSuggestion(data.data);
        }
      }
    } catch (error) {
      showNotification('Error updating status', 'error');
    }
  };

  const updatePriority = async (id, priority) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/suggestions/${id}/priority`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify({ priority })
      });

      const data = await res.json();
      if (data.success) {
        showNotification('Priority updated');
        fetchSuggestions();
        if (selectedSuggestion?._id === id) {
          setSelectedSuggestion(data.data);
        }
      }
    } catch (error) {
      showNotification('Error updating priority', 'error');
    }
  };

  const deleteSuggestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this suggestion?')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/admin/suggestions/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': password }
      });

      const data = await res.json();
      if (data.success) {
        showNotification('Suggestion deleted');
        setSelectedSuggestion(null);
        fetchSuggestions();
        fetchStats();
      }
    } catch (error) {
      showNotification('Error deleting suggestion', 'error');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminPassword');
    setIsAuthenticated(false);
    setPassword('');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusInfo = (status) => STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  const getPriorityInfo = (priority) => PRIORITY_OPTIONS.find(p => p.value === priority) || PRIORITY_OPTIONS[1];

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="admin-overlay">
        <div className="admin-login">
          <button className="close-btn" onClick={onClose}>×</button>
          <div className="login-header">
            <span className="lock-icon">🔐</span>
            <h2>Admin Access</h2>
            <p>Enter password to access the admin panel</p>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
            />
            {loginError && <div className="error-msg">{loginError}</div>}
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="admin-overlay">
      <div className="admin-panel">
        {notification && (
          <div className={`admin-notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
        
        {/* Header */}
        <div className="admin-header">
          <div className="header-left">
            <h1>🛡️ Admin Panel</h1>
            <span className="subtitle">Voice It, Shape It - Management</span>
          </div>
          <div className="header-right">
            <button className="refresh-btn" onClick={() => { fetchStats(); fetchSuggestions(); }}>
              🔄 Refresh
            </button>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={activeTab === 'suggestions' ? 'active' : ''} 
            onClick={() => setActiveTab('suggestions')}
          >
            📝 Suggestions ({pagination.total})
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="dashboard-content">
            <div className="stats-grid">
              <div className="stat-card total">
                <span className="stat-icon">📊</span>
                <div className="stat-info">
                  <span className="stat-value">{stats.total}</span>
                  <span className="stat-label">Total Suggestions</span>
                </div>
              </div>
              <div className="stat-card recent">
                <span className="stat-icon">📅</span>
                <div className="stat-info">
                  <span className="stat-value">{stats.recentCount}</span>
                  <span className="stat-label">Last 7 Days</span>
                </div>
              </div>
              <div className="stat-card anonymous">
                <span className="stat-icon">👤</span>
                <div className="stat-info">
                  <span className="stat-value">{stats.anonymousCount}</span>
                  <span className="stat-label">Anonymous</span>
                </div>
              </div>
              <div className="stat-card identified">
                <span className="stat-icon">🎓</span>
                <div className="stat-info">
                  <span className="stat-value">{stats.identifiedCount}</span>
                  <span className="stat-label">Identified</span>
                </div>
              </div>
            </div>

            <div className="charts-row">
              <div className="chart-card">
                <h3>By Category</h3>
                <div className="bar-chart">
                  {stats.byCategory.map(item => (
                    <div key={item._id} className="bar-item">
                      <span className="bar-label">{item._id}</span>
                      <div className="bar-track">
                        <div 
                          className="bar-fill" 
                          style={{ width: `${(item.count / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="bar-value">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-card">
                <h3>By Status</h3>
                <div className="status-list">
                  {stats.byStatus.map(item => {
                    const statusInfo = getStatusInfo(item._id);
                    return (
                      <div key={item._id} className="status-item">
                        <span className="status-dot" style={{ background: statusInfo.color }} />
                        <span className="status-label">{statusInfo.label}</span>
                        <span className="status-count">{item.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="suggestions-content">
            {/* Filters */}
            <div className="filters-bar">
              <input
                type="text"
                placeholder="🔍 Search suggestions..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && fetchSuggestions()}
              />
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              >
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="all">All Status</option>
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="suggestions-layout">
              {/* Suggestions List */}
              <div className="suggestions-list">
                {isLoading ? (
                  <div className="loading">Loading...</div>
                ) : suggestions.length === 0 ? (
                  <div className="empty">No suggestions found</div>
                ) : (
                  suggestions.map(suggestion => {
                    const statusInfo = getStatusInfo(suggestion.status);
                    const priorityInfo = getPriorityInfo(suggestion.priority);
                    return (
                      <div
                        key={suggestion._id}
                        className={`suggestion-card ${selectedSuggestion?._id === suggestion._id ? 'selected' : ''}`}
                        onClick={() => setSelectedSuggestion(suggestion)}
                      >
                        <div className="card-header">
                          <span className="tracking-code">{suggestion.trackingCode}</span>
                          <span className="priority-badge" style={{ background: priorityInfo.color }}>
                            {priorityInfo.label}
                          </span>
                        </div>
                        <h4 className="card-title">{suggestion.title}</h4>
                        <div className="card-meta">
                          <span className="category">{suggestion.category}</span>
                          <span className="status-badge" style={{ background: statusInfo.color }}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="card-footer">
                          <span className="date">{formatDate(suggestion.createdAt)}</span>
                          <span className="anonymous">{suggestion.isAnonymous ? '👤 Anonymous' : '🎓 Identified'}</span>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="pagination">
                    <button
                      disabled={pagination.page === 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      ← Prev
                    </button>
                    <span>Page {pagination.page} of {pagination.pages}</span>
                    <button
                      disabled={pagination.page === pagination.pages}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>

              {/* Detail Panel */}
              {selectedSuggestion && (
                <div className="detail-panel">
                  <div className="detail-header">
                    <h3>{selectedSuggestion.title}</h3>
                    <button className="delete-btn" onClick={() => deleteSuggestion(selectedSuggestion._id)}>
                      🗑️ Delete
                    </button>
                  </div>

                  <div className="detail-info">
                    <div className="info-row">
                      <span className="label">Tracking Code:</span>
                      <span className="value code">{selectedSuggestion.trackingCode}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Category:</span>
                      <span className="value">{selectedSuggestion.category}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Submitted:</span>
                      <span className="value">{formatDate(selectedSuggestion.createdAt)}</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Content</h4>
                    <p className="content-text">{selectedSuggestion.content}</p>
                  </div>

                  {!selectedSuggestion.isAnonymous && selectedSuggestion.submitter && (
                    <div className="detail-section">
                      <h4>Submitter Info</h4>
                      <div className="submitter-info">
                        {selectedSuggestion.submitter.name && <p><strong>Name:</strong> {selectedSuggestion.submitter.name}</p>}
                        {selectedSuggestion.submitter.studentId && <p><strong>Student ID:</strong> {selectedSuggestion.submitter.studentId}</p>}
                        {selectedSuggestion.submitter.email && <p><strong>Email:</strong> {selectedSuggestion.submitter.email}</p>}
                        {selectedSuggestion.submitter.course && <p><strong>Course:</strong> {selectedSuggestion.submitter.course}</p>}
                        {selectedSuggestion.submitter.yearLevel && <p><strong>Year:</strong> {selectedSuggestion.submitter.yearLevel}</p>}
                        {selectedSuggestion.submitter.contactNumber && <p><strong>Contact:</strong> {selectedSuggestion.submitter.contactNumber}</p>}
                      </div>
                    </div>
                  )}

                  <div className="detail-section">
                    <h4>Update Status</h4>
                    <div className="status-actions">
                      {STATUS_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          className={`status-btn ${selectedSuggestion.status === opt.value ? 'active' : ''}`}
                          style={{ '--btn-color': opt.color }}
                          onClick={() => {
                            const notes = prompt('Add a note (optional):');
                            updateStatus(selectedSuggestion._id, opt.value, notes || '');
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Priority</h4>
                    <div className="priority-actions">
                      {PRIORITY_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          className={`priority-btn ${selectedSuggestion.priority === opt.value ? 'active' : ''}`}
                          style={{ '--btn-color': opt.color }}
                          onClick={() => updatePriority(selectedSuggestion._id, opt.value)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedSuggestion.statusHistory?.length > 0 && (
                    <div className="detail-section">
                      <h4>Status History</h4>
                      <div className="history-list">
                        {selectedSuggestion.statusHistory.map((entry, idx) => {
                          const statusInfo = getStatusInfo(entry.status);
                          return (
                            <div key={idx} className="history-item">
                              <span className="history-dot" style={{ background: statusInfo.color }} />
                              <div className="history-content">
                                <span className="history-status">{statusInfo.label}</span>
                                <span className="history-date">{formatDate(entry.changedAt)}</span>
                                {entry.notes && <p className="history-notes">{entry.notes}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
