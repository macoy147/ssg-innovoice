import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const DATE_PRESETS = [
  { value: 'all', label: 'All Time', icon: 'infinity', desc: 'View everything' },
  { value: 'today', label: 'Today', icon: 'sun', desc: 'Just today' },
  { value: 'yesterday', label: 'Yesterday', icon: 'clock', desc: 'Previous day' },
  { value: 'week', label: 'This Week', icon: 'week', desc: 'Last 7 days' },
  { value: 'month', label: 'This Month', icon: 'calendar', desc: 'Current month' },
  { value: 'quarter', label: 'This Quarter', icon: 'quarter', desc: '3 months' },
  { value: 'year', label: 'This Year', icon: 'year', desc: 'Since January' },
  { value: 'custom', label: 'Custom Range', icon: 'custom', desc: 'Pick dates' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First', icon: '↓' },
  { value: 'oldest', label: 'Oldest First', icon: '↑' },
  { value: 'priority_high', label: 'Priority (High→Low)', icon: '🔴' },
  { value: 'priority_low', label: 'Priority (Low→High)', icon: '⚪' }
];

// Helper to get date range from preset
const getDateRange = (preset) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (preset) {
    case 'today':
      return { from: today.toISOString(), to: now.toISOString() };
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { from: yesterday.toISOString(), to: today.toISOString() };
    case 'week':
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      return { from: weekStart.toISOString(), to: now.toISOString() };
    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: monthStart.toISOString(), to: now.toISOString() };
    case 'quarter':
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
      const quarterStart = new Date(now.getFullYear(), quarterMonth, 1);
      return { from: quarterStart.toISOString(), to: now.toISOString() };
    case 'year':
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return { from: yearStart.toISOString(), to: now.toISOString() };
    default:
      return { from: null, to: null };
  }
};

function AdminPanel() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Dashboard state
  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [filters, setFilters] = useState({ 
    category: 'all', 
    status: 'all', 
    search: '',
    datePreset: 'all',
    dateFrom: '',
    dateTo: '',
    sort: 'newest',
    archived: 'false'
  });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notification, setNotification] = useState(null);
  
  // Dropdown & sidebar states
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [dateRangeModalOpen, setDateRangeModalOpen] = useState(false);
  const [tempDateFrom, setTempDateFrom] = useState('');
  const [tempDateTo, setTempDateTo] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('adminDarkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('adminDarkMode', JSON.stringify(darkMode));
  }, [darkMode]);
  
  // Calculate unread count from server data
  const unreadCount = stats?.unreadCount || 0;
  
  // Mark suggestion as read (server-side)
  const markAsRead = async (suggestionId) => {
    // Find the suggestion and check if already read
    const suggestion = suggestions.find(s => s._id === suggestionId);
    if (suggestion?.isRead) return;
    
    try {
      const res = await fetch(`${API_URL}/api/admin/suggestions/${suggestionId}/read`, {
        method: 'PUT',
        headers: { 'x-admin-password': password }
      });
      
      if (res.ok) {
        // Update local state immediately for responsiveness
        setSuggestions(prev => prev.map(s => 
          s._id === suggestionId ? { ...s, isRead: true, readAt: new Date().toISOString() } : s
        ));
        // Update stats
        if (stats?.unreadCount > 0) {
          setStats(prev => ({ ...prev, unreadCount: prev.unreadCount - 1 }));
        }
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };
  
  // Check if suggestion is unread
  const isUnread = (suggestionId) => {
    const suggestion = suggestions.find(s => s._id === suggestionId);
    return suggestion ? !suggestion.isRead : false;
  };

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

  // Close mobile sidebar when tab changes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [activeTab]);

  const handleClose = () => {
    navigate('/');
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const closeAllDropdowns = () => {
    setCategoryDropdownOpen(false);
    setStatusDropdownOpen(false);
    setDateDropdownOpen(false);
    setSortDropdownOpen(false);
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
      // Get date range from preset or custom dates
      let dateFrom = filters.dateFrom;
      let dateTo = filters.dateTo;
      
      if (filters.datePreset !== 'all' && filters.datePreset !== 'custom') {
        const range = getDateRange(filters.datePreset);
        dateFrom = range.from;
        dateTo = range.to;
      }
      
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sort: filters.sort,
        archived: filters.archived,
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
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

  const archiveSuggestion = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/suggestions/${id}/archive`, {
        method: 'PUT',
        headers: { 'x-admin-password': password }
      });

      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        setSelectedSuggestion(data.data);
        fetchSuggestions();
        fetchStats();
      }
    } catch (error) {
      showNotification('Error archiving suggestion', 'error');
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
      <div className="admin-page">
        <div className="admin-login-page">
          <div className="login-card">
            <button className="back-home-btn" onClick={handleClose}>
              ← Back to Home
            </button>
            <div className="login-header">
              <span className="lock-icon">🔐</span>
              <h2>Admin Access</h2>
              <p>Enter password to access the admin panel</p>
            </div>
            <form onSubmit={handleLogin}>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                />
                <button 
                  type="button" 
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {loginError && <div className="error-msg">{loginError}</div>}
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard with Sidebar
  return (
    <div className={`admin-page ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className={`admin-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {notification && (
          <div className={`admin-notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        {/* Date Range Modal */}
        {dateRangeModalOpen && (
          <>
            <div className="date-modal-overlay" onClick={() => setDateRangeModalOpen(false)} />
            <div className="date-range-modal">
              <div className="date-modal-header">
                <h3>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                  </svg>
                  Select Date Range
                </h3>
                <button className="close-modal-btn" onClick={() => setDateRangeModalOpen(false)}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
              
              <div className="date-modal-body">
                <div className="date-range-visual">
                  {/* From Date */}
                  <div className={`date-picker-card ${tempDateFrom ? 'has-date' : ''}`}>
                    <div className="date-card-header">
                      <span className="date-label">FROM</span>
                      <div className="date-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/>
                        </svg>
                      </div>
                    </div>
                    <input 
                      type="date" 
                      value={tempDateFrom}
                      onChange={(e) => setTempDateFrom(e.target.value)}
                      max={tempDateTo || undefined}
                    />
                    <div className="date-preview">
                      {tempDateFrom ? (
                        <>
                          <span className="day">{new Date(tempDateFrom + 'T00:00:00').getDate()}</span>
                          <span className="month-year">
                            {new Date(tempDateFrom + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                        </>
                      ) : (
                        <span className="placeholder">Select start date</span>
                      )}
                    </div>
                  </div>

                  {/* Connection Line */}
                  <div className="date-connection">
                    <div className="connection-line">
                      <div className={`line-fill ${tempDateFrom && tempDateTo ? 'active' : ''}`} />
                    </div>
                    <div className={`connection-icon ${tempDateFrom && tempDateTo ? 'active' : ''}`}>
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M16.01 11H4v2h12.01v3L20 12l-3.99-4z"/>
                      </svg>
                    </div>
                    {tempDateFrom && tempDateTo && (
                      <div className="days-between">
                        {Math.ceil((new Date(tempDateTo) - new Date(tempDateFrom)) / (1000 * 60 * 60 * 24))} days
                      </div>
                    )}
                  </div>

                  {/* To Date */}
                  <div className={`date-picker-card ${tempDateTo ? 'has-date' : ''}`}>
                    <div className="date-card-header">
                      <span className="date-label">TO</span>
                      <div className="date-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                        </svg>
                      </div>
                    </div>
                    <input 
                      type="date" 
                      value={tempDateTo}
                      onChange={(e) => setTempDateTo(e.target.value)}
                      min={tempDateFrom || undefined}
                    />
                    <div className="date-preview">
                      {tempDateTo ? (
                        <>
                          <span className="day">{new Date(tempDateTo + 'T00:00:00').getDate()}</span>
                          <span className="month-year">
                            {new Date(tempDateTo + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                        </>
                      ) : (
                        <span className="placeholder">Select end date</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="quick-presets">
                  <span className="presets-label">Quick select:</span>
                  <div className="preset-buttons">
                    {[
                      { label: 'Last 7 days', days: 7 },
                      { label: 'Last 30 days', days: 30 },
                      { label: 'Last 90 days', days: 90 },
                      { label: 'This year', days: 'year' }
                    ].map(preset => (
                      <button 
                        key={preset.label}
                        className="preset-btn"
                        onClick={() => {
                          const to = new Date();
                          const from = new Date();
                          if (preset.days === 'year') {
                            from.setMonth(0, 1);
                          } else {
                            from.setDate(from.getDate() - preset.days);
                          }
                          setTempDateFrom(from.toISOString().split('T')[0]);
                          setTempDateTo(to.toISOString().split('T')[0]);
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="date-modal-footer">
                <button 
                  className="clear-btn"
                  onClick={() => {
                    setTempDateFrom('');
                    setTempDateTo('');
                  }}
                >
                  Clear
                </button>
                <button 
                  className="apply-btn"
                  disabled={!tempDateFrom && !tempDateTo}
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      datePreset: 'custom',
                      dateFrom: tempDateFrom ? new Date(tempDateFrom).toISOString() : '',
                      dateTo: tempDateTo ? new Date(tempDateTo + 'T23:59:59').toISOString() : ''
                    }));
                    setDateRangeModalOpen(false);
                  }}
                >
                  Apply Range
                </button>
              </div>
            </div>
          </>
        )}

        {/* Mobile Header */}
        <div className="mobile-header">
          <button className="menu-toggle" onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>
          <div className="mobile-brand">
            <img src="/ssg-logo.png" alt="SSG Logo" className="mobile-logo" />
            <span>Admin</span>
          </div>
          <button className="mobile-refresh" onClick={() => { fetchStats(); fetchSuggestions(); }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
          </button>
        </div>

        {/* Sidebar Overlay for Mobile */}
        <div 
          className={`sidebar-overlay ${mobileSidebarOpen ? 'active' : ''}`}
          onClick={() => setMobileSidebarOpen(false)}
        />

        {/* Sidebar */}
        <aside className={`admin-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            <div className="brand">
              <img src="/ssg-logo.png" alt="SSG Logo" className="brand-logo" />
              {!sidebarCollapsed && <span className="brand-text">Admin Panel</span>}
            </div>
            <button 
              className="collapse-btn desktop-only"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                {sidebarCollapsed ? (
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                ) : (
                  <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
                )}
              </svg>
            </button>
            <button 
              className="close-sidebar mobile-only"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              title="Dashboard"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
              {!sidebarCollapsed && <span>Dashboard</span>}
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'suggestions' ? 'active' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`}
              onClick={() => setActiveTab('suggestions')}
              title="Suggestions"
            >
              <span className="nav-icon-wrapper">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
                {unreadCount > 0 && <span className="unread-indicator">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </span>
              {!sidebarCollapsed && (
                <>
                  <span>Suggestions</span>
                  <span className="nav-badge">{pagination.total}</span>
                </>
              )}
            </button>
          </nav>

          <div className="sidebar-footer">
            {/* Theme Toggle - Simplified for collapsed/mobile */}
            <button 
              className={`theme-toggle-simple ${darkMode ? 'dark' : 'light'}`}
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <span className="toggle-icon">
                {darkMode ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
                  </svg>
                )}
              </span>
              {!sidebarCollapsed && <span className="toggle-label">{darkMode ? 'Dark' : 'Light'}</span>}
            </button>
            
            <button className="nav-item" onClick={handleClose} title="Back to Site">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
              {!sidebarCollapsed && <span>Back to Site</span>}
            </button>
            
            <button className="nav-item logout" onClick={handleLogout} title="Logout">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-main">

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && stats && (
            <div className="dashboard-content">
              <div className="content-header">
                <h2>Dashboard Overview</h2>
                <button className="refresh-btn" onClick={() => { fetchStats(); fetchSuggestions(); }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                  </svg>
                  Refresh
                </button>
              </div>

              <div className="stats-grid">
                <div className="stat-card total">
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                    </svg>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.total}</span>
                    <span className="stat-label">Total Suggestions</span>
                  </div>
                </div>
                <div className="stat-card recent">
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
                    </svg>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.recentCount}</span>
                    <span className="stat-label">Last 7 Days</span>
                  </div>
                </div>
                <div className="stat-card anonymous">
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.anonymousCount}</span>
                    <span className="stat-label">Anonymous</span>
                  </div>
                </div>
                <div className="stat-card identified">
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                      <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                    </svg>
                  </div>
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
                  <div className="status-chart">
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
              <div className="content-header">
                <h2>Manage Suggestions</h2>
              </div>

              {/* Filters */}
              <div className="filters-bar">
                <div className="search-input-wrapper">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="search-icon">
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search suggestions..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && fetchSuggestions()}
                  />
                </div>
                
                {/* Custom Category Dropdown */}
                <div className={`custom-select ${categoryDropdownOpen ? 'open' : ''}`}>
                  <div 
                    className="select-trigger"
                    onClick={() => {
                      const wasOpen = categoryDropdownOpen;
                      closeAllDropdowns();
                      if (!wasOpen) setCategoryDropdownOpen(true);
                    }}
                  >
                    <span className="select-value">
                      {CATEGORY_OPTIONS.find(opt => opt.value === filters.category)?.label || 'All Categories'}
                    </span>
                    <span className="select-arrow">
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path fill="currentColor" d="M7 10l5 5 5-5z"/>
                      </svg>
                    </span>
                  </div>
                  <div className="select-options">
                    {CATEGORY_OPTIONS.map(opt => (
                      <div 
                        key={opt.value} 
                        className={`select-option ${filters.category === opt.value ? 'selected' : ''}`}
                        onClick={() => {
                          setFilters(prev => ({ ...prev, category: opt.value }));
                          setCategoryDropdownOpen(false);
                        }}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Custom Status Dropdown */}
                <div className={`custom-select ${statusDropdownOpen ? 'open' : ''}`}>
                  <div 
                    className="select-trigger"
                    onClick={() => {
                      const wasOpen = statusDropdownOpen;
                      closeAllDropdowns();
                      if (!wasOpen) setStatusDropdownOpen(true);
                    }}
                  >
                    <span className="select-value">
                      {filters.status === 'all' ? 'All Status' : STATUS_OPTIONS.find(opt => opt.value === filters.status)?.label}
                    </span>
                    <span className="select-arrow">
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path fill="currentColor" d="M7 10l5 5 5-5z"/>
                      </svg>
                    </span>
                  </div>
                  <div className="select-options">
                    <div 
                      className={`select-option ${filters.status === 'all' ? 'selected' : ''}`}
                      onClick={() => {
                        setFilters(prev => ({ ...prev, status: 'all' }));
                        setStatusDropdownOpen(false);
                      }}
                    >
                      All Status
                    </div>
                    {STATUS_OPTIONS.map(opt => (
                      <div 
                        key={opt.value} 
                        className={`select-option ${filters.status === opt.value ? 'selected' : ''}`}
                        onClick={() => {
                          setFilters(prev => ({ ...prev, status: opt.value }));
                          setStatusDropdownOpen(false);
                        }}
                      >
                        <span className="status-dot" style={{ background: opt.color }}></span>
                        {opt.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date Range Dropdown */}
                <div className={`custom-select date-select ${dateDropdownOpen ? 'open' : ''} ${filters.datePreset === 'custom' && (filters.dateFrom || filters.dateTo) ? 'has-custom-range' : ''}`}>
                  <div 
                    className="select-trigger"
                    onClick={() => {
                      const wasOpen = dateDropdownOpen;
                      closeAllDropdowns();
                      if (!wasOpen) setDateDropdownOpen(true);
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="select-icon">
                      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
                    </svg>
                    <span className="select-value">
                      {filters.datePreset === 'custom' && (filters.dateFrom || filters.dateTo) 
                        ? `${filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString() : '...'} - ${filters.dateTo ? new Date(filters.dateTo).toLocaleDateString() : '...'}`
                        : DATE_PRESETS.find(opt => opt.value === filters.datePreset)?.label || 'All Time'
                      }
                    </span>
                    {filters.datePreset === 'custom' && (filters.dateFrom || filters.dateTo) && (
                      <span className="custom-range-badge">Custom</span>
                    )}
                    <span className="select-arrow">
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path fill="currentColor" d="M7 10l5 5 5-5z"/>
                      </svg>
                    </span>
                  </div>
                  <div className="select-options date-options">
                    {DATE_PRESETS.map(opt => (
                      <div 
                        key={opt.value} 
                        className={`date-option ${filters.datePreset === opt.value ? 'selected' : ''} ${opt.value === 'custom' ? 'custom-option' : ''}`}
                        onClick={() => {
                          if (opt.value === 'custom') {
                            setTempDateFrom(filters.dateFrom ? filters.dateFrom.split('T')[0] : '');
                            setTempDateTo(filters.dateTo ? filters.dateTo.split('T')[0] : '');
                            setDateRangeModalOpen(true);
                            setDateDropdownOpen(false);
                          } else {
                            setFilters(prev => ({ ...prev, datePreset: opt.value, dateFrom: '', dateTo: '' }));
                            setDateDropdownOpen(false);
                          }
                        }}
                      >
                        <div className="date-option-icon">
                          {opt.icon === 'infinity' && (
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L12 10.66 10.48 12h.01L7.8 14.39c-.64.64-1.49.99-2.4.99-1.87 0-3.39-1.51-3.39-3.38S3.53 8.62 5.4 8.62c.91 0 1.76.35 2.44 1.03l1.13 1 1.51-1.34L9.22 8.2C8.2 7.18 6.84 6.62 5.4 6.62 2.42 6.62 0 9.04 0 12s2.42 5.38 5.4 5.38c1.44 0 2.8-.56 3.77-1.53l2.83-2.5.01.01L13.52 12h-.01l2.69-2.39c.64-.64 1.49-.99 2.4-.99 1.87 0 3.39 1.51 3.39 3.38s-1.52 3.38-3.39 3.38c-.9 0-1.76-.35-2.44-1.03l-1.14-1.01-1.51 1.34 1.27 1.12c1.02 1.01 2.37 1.57 3.82 1.57 2.98 0 5.4-2.41 5.4-5.38s-2.42-5.37-5.4-5.37z"/>
                            </svg>
                          )}
                          {opt.icon === 'sun' && (
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
                            </svg>
                          )}
                          {opt.icon === 'clock' && (
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                            </svg>
                          )}
                          {opt.icon === 'week' && (
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/>
                            </svg>
                          )}
                          {opt.icon === 'calendar' && (
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
                            </svg>
                          )}
                          {opt.icon === 'quarter' && (
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>
                            </svg>
                          )}
                          {opt.icon === 'year' && (
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                            </svg>
                          )}
                          {opt.icon === 'custom' && (
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm-4.5-7.5l-5 5-2.5-2.5 1.41-1.41 1.09 1.09 3.59-3.59z"/>
                            </svg>
                          )}
                        </div>
                        <div className="date-option-content">
                          <span className="date-option-label">{opt.label}</span>
                          <span className="date-option-desc">{opt.desc}</span>
                        </div>
                        {filters.datePreset === opt.value && (
                          <div className="date-option-check">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sort Dropdown */}
                <div className={`custom-select sort-select ${sortDropdownOpen ? 'open' : ''}`}>
                  <div 
                    className="select-trigger"
                    onClick={() => {
                      const wasOpen = sortDropdownOpen;
                      closeAllDropdowns();
                      if (!wasOpen) setSortDropdownOpen(true);
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="select-icon">
                      <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
                    </svg>
                    <span className="select-value">
                      {SORT_OPTIONS.find(opt => opt.value === filters.sort)?.label || 'Newest First'}
                    </span>
                    <span className="select-arrow">
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path fill="currentColor" d="M7 10l5 5 5-5z"/>
                      </svg>
                    </span>
                  </div>
                  <div className="select-options">
                    {SORT_OPTIONS.map(opt => (
                      <div 
                        key={opt.value} 
                        className={`select-option ${filters.sort === opt.value ? 'selected' : ''}`}
                        onClick={() => {
                          setFilters(prev => ({ ...prev, sort: opt.value }));
                          setSortDropdownOpen(false);
                        }}
                      >
                        <span className="sort-icon">{opt.icon}</span>
                        {opt.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Results Info Bar */}
              <div className="results-info-bar">
                <div className="results-left">
                  <span className="results-count">
                    {pagination.total > 0 ? (
                      pagination.pages === 1 ? (
                        <><strong>{pagination.total}</strong> {filters.archived === 'true' ? 'archived ' : ''}suggestion{pagination.total !== 1 ? 's' : ''}</>
                      ) : (
                        <>Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of <strong>{pagination.total.toLocaleString()}</strong> {filters.archived === 'true' ? 'archived ' : ''}suggestions</>
                      )
                    ) : (
                      filters.archived === 'true' ? 'No archived suggestions' : 'No suggestions found'
                    )}
                  </span>
                  
                  {/* Archive Toggle */}
                  <div className="archive-toggle">
                    <button 
                      className={`toggle-btn ${filters.archived === 'false' ? 'active' : ''}`}
                      onClick={() => setFilters(prev => ({ ...prev, archived: 'false' }))}
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
                      </svg>
                      Active
                    </button>
                    <button 
                      className={`toggle-btn ${filters.archived === 'true' ? 'active' : ''}`}
                      onClick={() => setFilters(prev => ({ ...prev, archived: 'true' }))}
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
                      </svg>
                      Archived
                      {stats?.archivedCount > 0 && (
                        <span className="archive-count">{stats.archivedCount}</span>
                      )}
                    </button>
                  </div>
                </div>
                
                {(filters.category !== 'all' || filters.status !== 'all' || filters.datePreset !== 'all' || filters.search) && (
                  <button 
                    className="clear-filters-btn"
                    onClick={() => setFilters(prev => ({ 
                      ...prev,
                      category: 'all', 
                      status: 'all', 
                      search: '', 
                      datePreset: 'all',
                      dateFrom: '',
                      dateTo: '',
                      sort: 'newest'
                    }))}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                    Clear Filters
                  </button>
                )}
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
                      const unread = isUnread(suggestion._id);
                      return (
                        <div
                          key={suggestion._id}
                          className={`suggestion-card ${selectedSuggestion?._id === suggestion._id ? 'selected' : ''} ${unread ? 'unread' : ''}`}
                          onClick={() => {
                            setSelectedSuggestion(suggestion);
                            markAsRead(suggestion._id);
                          }}
                        >
                          {unread && <span className="unread-dot" />}
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
                        onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
                        title="First page"
                      >
                        ««
                      </button>
                      <button
                        disabled={pagination.page === 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      >
                        ← Prev
                      </button>
                      <div className="page-numbers">
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          let pageNum;
                          if (pagination.pages <= 5) {
                            pageNum = i + 1;
                          } else if (pagination.page <= 3) {
                            pageNum = i + 1;
                          } else if (pagination.page >= pagination.pages - 2) {
                            pageNum = pagination.pages - 4 + i;
                          } else {
                            pageNum = pagination.page - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              className={`page-num ${pagination.page === pageNum ? 'active' : ''}`}
                              onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        disabled={pagination.page === pagination.pages}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      >
                        Next →
                      </button>
                      <button
                        disabled={pagination.page === pagination.pages}
                        onClick={() => setPagination(prev => ({ ...prev, page: pagination.pages }))}
                        title="Last page"
                      >
                        »»
                      </button>
                    </div>
                  )}
                </div>

                {/* Detail Panel - Modal on Mobile */}
                {selectedSuggestion && (
                  <>
                    <div className="detail-overlay" onClick={() => setSelectedSuggestion(null)} />
                    <div className="detail-panel">
                      <div className="detail-modal-header">
                        <span className="modal-title">Suggestion Details</span>
                        <button className="close-detail-btn" onClick={() => setSelectedSuggestion(null)}>
                          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                          </svg>
                        </button>
                      </div>
                      
                      <div className="detail-scroll-content">
                        <div className="detail-header">
                          <h3>{selectedSuggestion.title}</h3>
                          <div className="detail-actions">
                            <button 
                              className={`archive-btn ${selectedSuggestion.isArchived ? 'archived' : ''}`}
                              onClick={() => archiveSuggestion(selectedSuggestion._id)}
                            >
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                {selectedSuggestion.isArchived ? (
                                  <path d="M20.55 5.22l-1.39-1.68A1.51 1.51 0 0018 3H6c-.47 0-.88.21-1.15.55L3.46 5.22C3.17 5.57 3 6.01 3 6.5V19a2 2 0 002 2h14a2 2 0 002-2V6.5c0-.49-.17-.93-.45-1.28zM12 9.5l5.5 5.5H14v2h-4v-2H6.5L12 9.5zM5.12 5l.82-1h12l.93 1H5.12z"/>
                                ) : (
                                  <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
                                )}
                              </svg>
                              {selectedSuggestion.isArchived ? 'Unarchive' : 'Archive'}
                            </button>
                            <button className="delete-btn" onClick={() => deleteSuggestion(selectedSuggestion._id)}>
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                              </svg>
                              Delete
                            </button>
                          </div>
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
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminPanel;
