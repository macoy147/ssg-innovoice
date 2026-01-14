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
  { value: 'all', label: 'All Categories', icon: '📋' },
  { value: 'academic', label: 'Academic', icon: '📚' },
  { value: 'administrative', label: 'Administrative', icon: '🏛️' },
  { value: 'extracurricular', label: 'Extracurricular', icon: '🎭' },
  { value: 'general', label: 'General', icon: '💡' }
];

// Helper to get category info
const getCategoryInfo = (category) => {
  const cat = CATEGORY_OPTIONS.find(c => c.value === category);
  return cat || { label: category, icon: '📋' };
};

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
  { value: 'recently_updated', label: 'Recently Updated', icon: '🔄' },
  { value: 'priority_high', label: 'Priority (High→Low)', icon: '🔴' },
  { value: 'priority_low', label: 'Priority (Low→High)', icon: '⚪' }
];

const IDENTITY_OPTIONS = [
  { value: 'all', label: 'All Submissions', icon: '👥' },
  { value: 'anonymous', label: 'Anonymous Only', icon: '🔒' },
  { value: 'identified', label: 'Identified Only', icon: '👤' }
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
  
  // Admin info (role, label, color)
  const [adminInfo, setAdminInfo] = useState(null);
  
  // Online admins state
  const [onlineAdmins, setOnlineAdmins] = useState([]);
  
  // Activity logs state
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityStats, setActivityStats] = useState(null);
  const [activityFilters, setActivityFilters] = useState({
    adminRole: 'all',
    action: 'all',
    datePreset: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const [activityPagination, setActivityPagination] = useState({ page: 1, pages: 1, total: 0, limit: 50 });
  const [activityDateDropdownOpen, setActivityDateDropdownOpen] = useState(false);
  const [activityDateModalOpen, setActivityDateModalOpen] = useState(false);
  const [activityTempDateFrom, setActivityTempDateFrom] = useState('');
  const [activityTempDateTo, setActivityTempDateTo] = useState('');
  const [activitySearchExpanded, setActivitySearchExpanded] = useState(false);
  
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
    archived: 'false',
    identity: 'all'
  });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notification, setNotification] = useState(null);
  
  // Dropdown & sidebar states
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [identityDropdownOpen, setIdentityDropdownOpen] = useState(false);
  const [dateRangeModalOpen, setDateRangeModalOpen] = useState(false);
  const [tempDateFrom, setTempDateFrom] = useState('');
  const [tempDateTo, setTempDateTo] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  
  // Cascading filter state
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('adminDarkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  // Status update modal state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [statusNote, setStatusNote] = useState('');
  
  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('adminDarkMode', JSON.stringify(darkMode));
  }, [darkMode]);
  
  // Calculate unread count - use stats if available, otherwise count from suggestions
  const unreadCount = stats?.unreadCount !== undefined 
    ? stats.unreadCount 
    : suggestions.filter(s => !s.isRead).length;
  
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
    return suggestion ? suggestion.isRead !== true : false;
  };

  // Check if already authenticated (session storage)
  useEffect(() => {
    const savedPassword = sessionStorage.getItem('adminPassword');
    const savedAdminInfo = sessionStorage.getItem('adminInfo');
    if (savedPassword) {
      setPassword(savedPassword);
      if (savedAdminInfo) {
        setAdminInfo(JSON.parse(savedAdminInfo));
      }
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchSuggestions();
      fetchOnlineAdmins();
    }
  }, [isAuthenticated, filters, pagination.page]);

  // Heartbeat and online admins polling - 5 second intervals for real-time feel
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Send heartbeat every 5 seconds for real-time online status
    const heartbeatInterval = setInterval(() => {
      fetch(`${API_URL}/api/admin/heartbeat`, {
        method: 'POST',
        headers: { 'x-admin-password': password }
      }).catch(err => console.error('Heartbeat error:', err));
    }, 5000);
    
    // Fetch online admins every 5 seconds for real-time updates
    const onlineInterval = setInterval(() => {
      fetchOnlineAdmins();
    }, 5000);
    
    // Initial heartbeat
    fetch(`${API_URL}/api/admin/heartbeat`, {
      method: 'POST',
      headers: { 'x-admin-password': password }
    }).catch(err => console.error('Heartbeat error:', err));
    
    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(onlineInterval);
    };
  }, [isAuthenticated, password]);

  // Fetch activity logs when on activity tab
  useEffect(() => {
    if (isAuthenticated && activeTab === 'activity') {
      fetchActivityLogs();
      fetchActivityStats();
    }
  }, [isAuthenticated, activeTab, activityFilters, activityPagination.page]);

  // Close mobile sidebar and all dropdowns when tab changes
  useEffect(() => {
    setMobileSidebarOpen(false);
    // Close all dropdowns from Suggestions panel
    closeAllDropdowns();
    // Close Activity panel dropdowns
    setActivityDateDropdownOpen(false);
    setActivitySearchExpanded(false);
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
    setIdentityDropdownOpen(false);
    setFilterDropdownOpen(false);
    setHoveredCategory(null);
  };

  // Toggle bulk select mode
  const toggleBulkSelectMode = () => {
    if (bulkSelectMode) {
      // Exiting bulk mode - clear selections
      setSelectedIds([]);
    }
    setBulkSelectMode(!bulkSelectMode);
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
        if (data.admin) {
          sessionStorage.setItem('adminInfo', JSON.stringify(data.admin));
          setAdminInfo(data.admin);
          // Show welcome notification after a brief delay to ensure UI is ready
          setTimeout(() => {
            showNotification(`Welcome, ${data.admin.label}! 👋`, 'welcome');
          }, 300);
        }
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

  // Fetch activity logs
  const fetchActivityLogs = async () => {
    try {
      // Get date range from preset or custom dates
      let dateFrom = activityFilters.dateFrom;
      let dateTo = activityFilters.dateTo;
      
      if (activityFilters.datePreset !== 'all' && activityFilters.datePreset !== 'custom') {
        const range = getDateRange(activityFilters.datePreset);
        dateFrom = range.from;
        dateTo = range.to;
      }
      
      const params = new URLSearchParams({
        page: activityPagination.page,
        limit: activityPagination.limit,
        ...(activityFilters.adminRole !== 'all' && { adminRole: activityFilters.adminRole }),
        ...(activityFilters.action !== 'all' && { action: activityFilters.action }),
        ...(activityFilters.search && { search: activityFilters.search }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      });

      const res = await fetch(`${API_URL}/api/admin/activity-logs?${params}`, {
        headers: { 'x-admin-password': password }
      });
      const data = await res.json();
      if (data.success) {
        setActivityLogs(data.data);
        setActivityPagination(prev => ({ ...prev, ...data.pagination }));
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
  };

  // Fetch activity stats
  const fetchActivityStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/activity-logs/stats`, {
        headers: { 'x-admin-password': password }
      });
      const data = await res.json();
      if (data.success) {
        setActivityStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching activity stats:', error);
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

  const fetchOnlineAdmins = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/online`, {
        headers: { 'x-admin-password': password }
      });
      const data = await res.json();
      if (data.success) setOnlineAdmins(data.data);
    } catch (error) {
      console.error('Error fetching online admins:', error);
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
        ...(filters.identity !== 'all' && { identity: filters.identity }),
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
      } else {
        showNotification(data.message || 'Error archiving suggestion', 'error');
      }
    } catch (error) {
      console.error('Archive error:', error);
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
    try {
      const res = await fetch(`${API_URL}/api/admin/suggestions/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': password }
      });

      const data = await res.json();
      if (data.success) {
        showNotification('Suggestion deleted');
        setSelectedSuggestion(null);
        setDeleteModalOpen(false);
        setPendingDelete(null);
        
        // If this was the last item on the current page and we're not on page 1,
        // go back to the previous page
        if (suggestions.length === 1 && pagination.page > 1) {
          setPagination(prev => ({ ...prev, page: prev.page - 1 }));
        } else {
          fetchSuggestions();
        }
        fetchStats();
      } else {
        showNotification(data.message || 'Error deleting suggestion', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('Error deleting suggestion', 'error');
    }
  };

  // Bulk selection functions
  const toggleSelectItem = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === suggestions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(suggestions.map(s => s._id));
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const bulkDeleteSuggestions = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      // Delete all selected items
      const deletePromises = selectedIds.map(id => 
        fetch(`${API_URL}/api/admin/suggestions/${id}`, {
          method: 'DELETE',
          headers: { 'x-admin-password': password }
        })
      );
      
      await Promise.all(deletePromises);
      
      showNotification(`${selectedIds.length} suggestion${selectedIds.length > 1 ? 's' : ''} deleted`);
      setBulkDeleteModalOpen(false);
      setSelectedIds([]);
      setSelectedSuggestion(null);
      setBulkSelectMode(false);
      
      // Handle pagination after bulk delete
      const remainingItems = suggestions.length - selectedIds.length;
      if (remainingItems === 0 && pagination.page > 1) {
        setPagination(prev => ({ ...prev, page: 1 }));
      } else {
        fetchSuggestions();
      }
      fetchStats();
    } catch (error) {
      showNotification('Error deleting suggestions', 'error');
    }
  };

  const handleLogout = async () => {
    // Log logout activity
    try {
      await fetch(`${API_URL}/api/admin/logout`, {
        method: 'POST',
        headers: { 'x-admin-password': password }
      });
    } catch (error) {
      console.error('Error logging logout:', error);
    }
    
    sessionStorage.removeItem('adminPassword');
    sessionStorage.removeItem('adminInfo');
    setIsAuthenticated(false);
    setPassword('');
    setAdminInfo(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusInfo = (status) => STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  const getPriorityInfo = (priority) => PRIORITY_OPTIONS.find(p => p.value === priority) || PRIORITY_OPTIONS[1];

  // Helper to get admin color by role (simplified roles)
  const getAdminColor = (role) => {
    const colors = {
      'executive': '#8b5cf6',
      'press_secretary': '#f59e0b',
      'network_secretary': '#10b981',
      'developer': '#6366f1'
    };
    return colors[role] || '#6b7280';
  };

  // Helper to format action names
  const formatAction = (action) => {
    const actionLabels = {
      'login': 'logged in',
      'logout': 'logged out',
      'view_suggestion': 'viewed suggestion',
      'update_status': 'updated status',
      'update_priority': 'updated priority',
      'archive_suggestion': 'archived suggestion',
      'unarchive_suggestion': 'unarchived suggestion',
      'delete_suggestion': 'deleted suggestion',
      'bulk_delete': 'bulk deleted suggestions',
      'restore_suggestion': 'restored suggestion',
      'permanent_delete': 'permanently deleted',
      'empty_trash': 'emptied trash',
      'mark_read': 'marked as read'
    };
    return actionLabels[action] || action;
  };

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

        {/* Status Update Modal */}
        {statusModalOpen && pendingStatus && (
          <>
            <div className="status-modal-overlay" onClick={() => setStatusModalOpen(false)} />
            <div className="status-update-modal">
              <div className="status-modal-header" style={{ '--status-color': pendingStatus.color }}>
                <div className="status-modal-icon">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div className="status-modal-title">
                  <h3>Update Status</h3>
                  <p>Change to <strong>{pendingStatus.label}</strong></p>
                </div>
                <button className="close-status-modal" onClick={() => setStatusModalOpen(false)}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
              
              <div className="status-modal-body">
                <div className="status-change-preview">
                  <div className="status-from">
                    <span className="status-label">Current</span>
                    <span 
                      className="status-badge" 
                      style={{ background: getStatusInfo(selectedSuggestion?.status).color }}
                    >
                      {getStatusInfo(selectedSuggestion?.status).label}
                    </span>
                  </div>
                  <div className="status-arrow">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                      <path d="M16.01 11H4v2h12.01v3L20 12l-3.99-4z"/>
                    </svg>
                  </div>
                  <div className="status-to">
                    <span className="status-label">New</span>
                    <span 
                      className="status-badge" 
                      style={{ background: pendingStatus.color }}
                    >
                      {pendingStatus.label}
                    </span>
                  </div>
                </div>
                
                <div className="note-input-section">
                  <label htmlFor="status-note">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                    Add a note (optional)
                  </label>
                  <textarea
                    id="status-note"
                    placeholder="Enter any notes about this status change..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="status-modal-footer">
                <button className="cancel-btn" onClick={() => setStatusModalOpen(false)}>
                  Cancel
                </button>
                <button 
                  className="confirm-btn"
                  style={{ '--btn-color': pendingStatus.color }}
                  onClick={() => {
                    updateStatus(selectedSuggestion._id, pendingStatus.value, statusNote);
                    setStatusModalOpen(false);
                    setStatusNote('');
                    setPendingStatus(null);
                  }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  Update Status
                </button>
              </div>
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && pendingDelete && (
          <>
            <div className="delete-modal-overlay" onClick={() => setDeleteModalOpen(false)} />
            <div className="delete-confirm-modal">
              <div className="delete-modal-icon">
                <div className="icon-circle">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </div>
              </div>
              
              <div className="delete-modal-content">
                <h3>Delete Suggestion?</h3>
                <p>This action cannot be undone. The following suggestion will be permanently removed:</p>
                
                <div className="delete-preview-card">
                  <div className="preview-header">
                    <span className="tracking-code">{pendingDelete.trackingCode}</span>
                    <span className="category">{pendingDelete.category}</span>
                  </div>
                  <h4>{pendingDelete.title}</h4>
                  <p className="preview-content">{pendingDelete.content?.substring(0, 100)}{pendingDelete.content?.length > 100 ? '...' : ''}</p>
                </div>
              </div>
              
              <div className="delete-modal-actions">
                <button className="cancel-btn" onClick={() => {
                  setDeleteModalOpen(false);
                  setPendingDelete(null);
                }}>
                  Cancel
                </button>
                <button className="confirm-delete-btn" onClick={() => deleteSuggestion(pendingDelete._id)}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                  Delete Permanently
                </button>
              </div>
            </div>
          </>
        )}

        {/* Photo Evidence Modal */}
        {photoModalOpen && selectedSuggestion?.imageUrl && (
          <>
            <div className="photo-modal-overlay" onClick={() => setPhotoModalOpen(false)} />
            <div className="photo-modal">
              <div className="photo-modal-header">
                <h3>📷 Photo Evidence</h3>
                <button 
                  className="photo-modal-close"
                  onClick={() => setPhotoModalOpen(false)}
                  aria-label="Close"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
              <div className="photo-modal-body">
                <img 
                  src={selectedSuggestion.imageUrl} 
                  alt="Suggestion evidence" 
                />
              </div>
              <div className="photo-modal-footer">
                <button 
                  className="open-new-tab-btn"
                  onClick={() => window.open(selectedSuggestion.imageUrl, '_blank')}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                  </svg>
                  Open in New Tab
                </button>
              </div>
            </div>
          </>
        )}

        {/* Bulk Delete Confirmation Modal */}
        {bulkDeleteModalOpen && selectedIds.length > 0 && (
          <>
            <div className="delete-modal-overlay" onClick={() => setBulkDeleteModalOpen(false)} />
            <div className="delete-confirm-modal bulk-delete-modal">
              <div className="delete-modal-icon">
                <div className="icon-circle bulk">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </div>
              </div>
              
              <div className="delete-modal-content">
                <h3>Delete {selectedIds.length} Suggestion{selectedIds.length > 1 ? 's' : ''}?</h3>
                <p>This action cannot be undone. The selected suggestions will be permanently removed.</p>
                
                <div className="bulk-delete-preview">
                  <div className="bulk-count-badge">
                    <span className="count">{selectedIds.length}</span>
                    <span className="label">items selected</span>
                  </div>
                  <div className="bulk-items-list">
                    {suggestions
                      .filter(s => selectedIds.includes(s._id))
                      .slice(0, 3)
                      .map(s => (
                        <div key={s._id} className="bulk-item-preview">
                          <span className="tracking">{s.trackingCode}</span>
                          <span className="title">{s.title.substring(0, 30)}{s.title.length > 30 ? '...' : ''}</span>
                        </div>
                      ))
                    }
                    {selectedIds.length > 3 && (
                      <div className="bulk-more">
                        +{selectedIds.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="delete-modal-actions">
                <button className="cancel-btn" onClick={() => setBulkDeleteModalOpen(false)}>
                  Cancel
                </button>
                <button className="confirm-delete-btn" onClick={bulkDeleteSuggestions}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                  Delete {selectedIds.length} Item{selectedIds.length > 1 ? 's' : ''}
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
            
            <button 
              className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
              title="Activity Logs"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0013 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
              </svg>
              {!sidebarCollapsed && <span>Activity Logs</span>}
            </button>
          </nav>

          {/* Online Admins Section */}
          {!sidebarCollapsed && onlineAdmins.length > 0 && (
            <div className="online-admins-section">
              <div className="online-header">
                <span className="online-dot"></span>
                <span className="online-title">Online Now ({onlineAdmins.length})</span>
              </div>
              <div className="online-list">
                {onlineAdmins.map(admin => (
                  <div key={admin.role} className="online-admin-item">
                    <div className="online-avatar" style={{ background: admin.color }}>
                      {admin.label.charAt(0)}
                    </div>
                    <span className="online-name">{admin.label}</span>
                    {admin.role === adminInfo?.role && <span className="you-badge">You</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

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
                <div className={`search-input-wrapper ${searchExpanded ? 'expanded' : ''}`}>
                  <button 
                    className="search-toggle"
                    onClick={() => setSearchExpanded(!searchExpanded)}
                    aria-label="Toggle search"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                  </button>
                  <input
                    type="text"
                    placeholder="Search suggestions..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && fetchSuggestions()}
                    onFocus={() => setSearchExpanded(true)}
                    onBlur={(e) => {
                      if (!e.target.value) setSearchExpanded(false);
                    }}
                  />
                  {searchExpanded && filters.search && (
                    <button 
                      className="search-clear"
                      onClick={() => {
                        setFilters(prev => ({ ...prev, search: '' }));
                        setSearchExpanded(false);
                      }}
                      aria-label="Clear search"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  )}
                </div>
                
                {/* Cascading Category + Status Filter */}
                {filterDropdownOpen && (
                  <div className="filter-overlay" onClick={() => setFilterDropdownOpen(false)} />
                )}
                <div 
                  className={`cascading-filter ${filterDropdownOpen ? 'open' : ''}`}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div 
                    className="filter-trigger"
                    onClick={() => {
                      const wasOpen = filterDropdownOpen;
                      closeAllDropdowns();
                      if (!wasOpen) setFilterDropdownOpen(true);
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="filter-icon">
                      <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
                    </svg>
                    <span className="filter-value">
                      {filters.category === 'all' && filters.status === 'all' 
                        ? 'All Filters'
                        : `${filters.category !== 'all' ? getCategoryInfo(filters.category).label : 'All'}${filters.status !== 'all' ? ` • ${getStatusInfo(filters.status).label}` : ''}`
                      }
                    </span>
                    {(filters.category !== 'all' || filters.status !== 'all') && (
                      <span className="active-filter-badge">
                        {(filters.category !== 'all' ? 1 : 0) + (filters.status !== 'all' ? 1 : 0)}
                      </span>
                    )}
                    <span className="filter-arrow">
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path fill="currentColor" d="M7 10l5 5 5-5z"/>
                      </svg>
                    </span>
                  </div>
                  
                  <div className="filter-dropdown">
                    <div className="filter-categories">
                      <div className="filter-section-title">Category</div>
                      {CATEGORY_OPTIONS.map(cat => (
                        <div 
                          key={cat.value}
                          className={`filter-category-item ${filters.category === cat.value ? 'selected' : ''} ${hoveredCategory === cat.value ? 'hovered' : ''}`}
                          onMouseEnter={() => setHoveredCategory(cat.value)}
                          onClick={() => {
                            if (cat.value === 'all') {
                              setFilters(prev => ({ ...prev, category: 'all', status: 'all' }));
                              setFilterDropdownOpen(false);
                            }
                          }}
                        >
                          <span className="category-icon">{cat.icon}</span>
                          <span className="category-label">{cat.label}</span>
                          {cat.value !== 'all' && (
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="arrow-icon">
                              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                            </svg>
                          )}
                          {filters.category === cat.value && filters.status === 'all' && (
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="check-icon">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Status Sub-menu */}
                    {hoveredCategory && hoveredCategory !== 'all' && (
                      <div className="filter-statuses">
                        <div className="filter-section-title">
                          {getCategoryInfo(hoveredCategory).icon} {getCategoryInfo(hoveredCategory).label} Status
                        </div>
                        <div 
                          className={`filter-status-item ${filters.category === hoveredCategory && filters.status === 'all' ? 'selected' : ''}`}
                          onClick={() => {
                            setFilters(prev => ({ ...prev, category: hoveredCategory, status: 'all' }));
                            setFilterDropdownOpen(false);
                          }}
                        >
                          <span className="status-dot all"></span>
                          <span>All Status</span>
                          {filters.category === hoveredCategory && filters.status === 'all' && (
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="check-icon">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          )}
                        </div>
                        {STATUS_OPTIONS.map(status => (
                          <div 
                            key={status.value}
                            className={`filter-status-item ${filters.category === hoveredCategory && filters.status === status.value ? 'selected' : ''}`}
                            onClick={() => {
                              setFilters(prev => ({ ...prev, category: hoveredCategory, status: status.value }));
                              setFilterDropdownOpen(false);
                            }}
                          >
                            <span className="status-dot" style={{ background: status.color }}></span>
                            <span>{status.label}</span>
                            {filters.category === hoveredCategory && filters.status === status.value && (
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="check-icon">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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

                {/* Identity Filter Dropdown */}
                <div className={`custom-select identity-select ${identityDropdownOpen ? 'open' : ''}`}>
                  <div 
                    className="select-trigger"
                    onClick={() => {
                      const wasOpen = identityDropdownOpen;
                      closeAllDropdowns();
                      if (!wasOpen) setIdentityDropdownOpen(true);
                    }}
                  >
                    <span className="select-icon-emoji">
                      {IDENTITY_OPTIONS.find(opt => opt.value === filters.identity)?.icon || '👥'}
                    </span>
                    <span className="select-value">
                      {IDENTITY_OPTIONS.find(opt => opt.value === filters.identity)?.label || 'All Submissions'}
                    </span>
                    <span className="select-arrow">
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path fill="currentColor" d="M7 10l5 5 5-5z"/>
                      </svg>
                    </span>
                  </div>
                  <div className="select-options">
                    {IDENTITY_OPTIONS.map(opt => (
                      <div 
                        key={opt.value} 
                        className={`select-option ${filters.identity === opt.value ? 'selected' : ''}`}
                        onClick={() => {
                          setFilters(prev => ({ ...prev, identity: opt.value }));
                          setIdentityDropdownOpen(false);
                        }}
                      >
                        <span className="identity-icon">{opt.icon}</span>
                        {opt.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Results Info Bar */}
              <div className="results-info-bar">
                <div className="results-left">
                  {/* Select Multiple Toggle Button */}
                  {suggestions.length > 0 && (
                    <button 
                      className={`select-multiple-btn ${bulkSelectMode ? 'active' : ''}`}
                      onClick={toggleBulkSelectMode}
                    >
                      {bulkSelectMode ? (
                        <>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                          </svg>
                          Cancel
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
                          </svg>
                          Select
                        </>
                      )}
                    </button>
                  )}
                  
                  {/* Select All - Only show when in bulk select mode */}
                  {bulkSelectMode && suggestions.length > 0 && (
                    <button 
                      className="select-all-btn"
                      onClick={toggleSelectAll}
                    >
                      {selectedIds.length === suggestions.length ? (
                        <>
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          Deselect All
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                            <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                          </svg>
                          Select All
                        </>
                      )}
                    </button>
                  )}
                  
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
                
                {(filters.category !== 'all' || filters.status !== 'all' || filters.datePreset !== 'all' || filters.search || filters.identity !== 'all') && (
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
                      sort: 'newest',
                      identity: 'all'
                    }))}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Floating Bulk Action Bar */}
              {selectedIds.length > 0 && bulkSelectMode && (
                <div className="bulk-action-bar">
                  <div className="bulk-info">
                    <span className="bulk-count">{selectedIds.length}</span>
                    <span className="bulk-text">selected</span>
                  </div>
                  <div className="bulk-actions">
                    <button className="bulk-btn clear-btn" onClick={() => {
                      clearSelection();
                      setBulkSelectMode(false);
                    }}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                      Cancel
                    </button>
                    <button className="bulk-btn delete-btn" onClick={() => setBulkDeleteModalOpen(true)}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                      Delete {selectedIds.length}
                    </button>
                  </div>
                </div>
              )}

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
                      const isChecked = selectedIds.includes(suggestion._id);
                      return (
                        <div
                          key={suggestion._id}
                          className={`suggestion-card ${selectedSuggestion?._id === suggestion._id ? 'selected' : ''} ${unread ? 'unread' : ''} ${isChecked ? 'bulk-selected' : ''} ${bulkSelectMode ? 'bulk-mode' : ''}`}
                          onClick={() => {
                            if (bulkSelectMode) {
                              toggleSelectItem(suggestion._id);
                            } else {
                              setSelectedSuggestion(suggestion);
                              markAsRead(suggestion._id);
                            }
                          }}
                        >
                          {/* Bulk Select Checkbox - Only show in bulk select mode */}
                          {bulkSelectMode && (
                            <label 
                              className="bulk-checkbox"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelectItem(suggestion._id)}
                              />
                              <span className="checkbox-custom">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                </svg>
                              </span>
                            </label>
                          )}
                          {unread && <span className="unread-dot" />}
                          <div className="card-header">
                            <span className="tracking-code">{suggestion.trackingCode}</span>
                            <span className="priority-badge" style={{ background: priorityInfo.color }}>
                              {priorityInfo.label}
                            </span>
                          </div>
                          <h4 className="card-title">{suggestion.title}</h4>
                          <div className="card-meta">
                            <span className="category">
                              <span className="category-icon">{getCategoryInfo(suggestion.category).icon}</span>
                              {getCategoryInfo(suggestion.category).label}
                            </span>
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
                        {/* Hero Card - Title, Priority & Status */}
                        <div className="detail-hero-card">
                          <div className="hero-top">
                            <span className={`priority-badge priority-${selectedSuggestion.priority}`}>
                              {selectedSuggestion.priority === 'urgent' && '🔴'}
                              {selectedSuggestion.priority === 'high' && '🟠'}
                              {selectedSuggestion.priority === 'medium' && '🟡'}
                              {selectedSuggestion.priority === 'low' && '🟢'}
                              {selectedSuggestion.priority?.toUpperCase()}
                            </span>
                            <span 
                              className="status-badge-hero"
                              style={{ background: getStatusInfo(selectedSuggestion.status).color }}
                            >
                              {getStatusInfo(selectedSuggestion.status).label}
                            </span>
                          </div>
                          <h2 className="hero-title">{selectedSuggestion.title}</h2>
                          <div className="hero-meta">
                            <span className="meta-item">
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                              </svg>
                              {selectedSuggestion.trackingCode}
                            </span>
                            <span className="meta-item">
                              {getCategoryInfo(selectedSuggestion.category).icon} {getCategoryInfo(selectedSuggestion.category).label}
                            </span>
                            <span className="meta-item">
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                              </svg>
                              {formatDate(selectedSuggestion.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Quick Actions Bar */}
                        <div className="quick-actions-bar">
                          <button 
                            className={`quick-action-btn ${selectedSuggestion.isArchived ? 'archived' : ''}`}
                            onClick={() => archiveSuggestion(selectedSuggestion._id)}
                          >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              {selectedSuggestion.isArchived ? (
                                <path d="M20.55 5.22l-1.39-1.68A1.51 1.51 0 0018 3H6c-.47 0-.88.21-1.15.55L3.46 5.22C3.17 5.57 3 6.01 3 6.5V19a2 2 0 002 2h14a2 2 0 002-2V6.5c0-.49-.17-.93-.45-1.28zM12 9.5l5.5 5.5H14v2h-4v-2H6.5L12 9.5zM5.12 5l.82-1h12l.93 1H5.12z"/>
                              ) : (
                                <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
                              )}
                            </svg>
                            {selectedSuggestion.isArchived ? 'Unarchive' : 'Archive'}
                          </button>
                          {selectedSuggestion.imageUrl && (
                            <button 
                              className="quick-action-btn photo-btn"
                              onClick={() => setPhotoModalOpen(true)}
                            >
                              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                              </svg>
                              View Evidence
                            </button>
                          )}
                          <button 
                            className="quick-action-btn delete-btn"
                            onClick={() => {
                              setPendingDelete(selectedSuggestion);
                              setDeleteModalOpen(true);
                            }}
                          >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                            Delete
                          </button>
                        </div>

                        {/* Content Card */}
                        <div className="detail-card content-card">
                          <div className="card-header">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                            </svg>
                            <span>Suggestion Details</span>
                          </div>
                          <div className="card-body">
                            <p className="content-text">{selectedSuggestion.content}</p>
                          </div>
                        </div>

                        {/* Submitter Card - Only if not anonymous */}
                        {!selectedSuggestion.isAnonymous && selectedSuggestion.submitter && (
                          <div className="detail-card submitter-card">
                            <div className="card-header">
                              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                              </svg>
                              <span>Submitter Information</span>
                            </div>
                            <div className="card-body">
                              <div className="submitter-grid">
                                {selectedSuggestion.submitter.name && (
                                  <div className="submitter-item">
                                    <span className="item-label">Name</span>
                                    <span className="item-value">{selectedSuggestion.submitter.name}</span>
                                  </div>
                                )}
                                {selectedSuggestion.submitter.studentId && (
                                  <div className="submitter-item">
                                    <span className="item-label">Student ID</span>
                                    <span className="item-value">{selectedSuggestion.submitter.studentId}</span>
                                  </div>
                                )}
                                {selectedSuggestion.submitter.email && (
                                  <div className="submitter-item">
                                    <span className="item-label">Email</span>
                                    <span className="item-value">{selectedSuggestion.submitter.email}</span>
                                  </div>
                                )}
                                {selectedSuggestion.submitter.contactNumber && (
                                  <div className="submitter-item">
                                    <span className="item-label">Contact</span>
                                    <span className="item-value">{selectedSuggestion.submitter.contactNumber}</span>
                                  </div>
                                )}
                                {selectedSuggestion.submitter.course && (
                                  <div className="submitter-item">
                                    <span className="item-label">Course</span>
                                    <span className="item-value">{selectedSuggestion.submitter.course}</span>
                                  </div>
                                )}
                                {selectedSuggestion.submitter.yearLevel && (
                                  <div className="submitter-item">
                                    <span className="item-label">Year Level</span>
                                    <span className="item-value">{selectedSuggestion.submitter.yearLevel}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Anonymous Badge */}
                        {selectedSuggestion.isAnonymous && (
                          <div className="anonymous-badge">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                            </svg>
                            <span>Anonymous Submission</span>
                          </div>
                        )}

                        {/* Status & Priority Controls */}
                        <div className="controls-grid">
                          <div className="detail-card control-card">
                            <div className="card-header">
                              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                              <span>Update Status</span>
                            </div>
                            <div className="card-body">
                              <div className="status-pills">
                                {STATUS_OPTIONS.map(opt => (
                                  <button
                                    key={opt.value}
                                    className={`status-pill ${selectedSuggestion.status === opt.value ? 'active' : ''}`}
                                    style={{ '--pill-color': opt.color }}
                                    onClick={() => {
                                      setPendingStatus(opt);
                                      setStatusNote('');
                                      setStatusModalOpen(true);
                                    }}
                                  >
                                    <span className="pill-dot" style={{ background: opt.color }}></span>
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="detail-card control-card">
                            <div className="card-header">
                              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
                              </svg>
                              <span>Set Priority</span>
                            </div>
                            <div className="card-body">
                              <div className="priority-pills">
                                {PRIORITY_OPTIONS.map(opt => (
                                  <button
                                    key={opt.value}
                                    className={`priority-pill ${selectedSuggestion.priority === opt.value ? 'active' : ''}`}
                                    style={{ '--pill-color': opt.color }}
                                    onClick={() => updatePriority(selectedSuggestion._id, opt.value)}
                                  >
                                    {opt.value === 'urgent' && '🔴'}
                                    {opt.value === 'high' && '🟠'}
                                    {opt.value === 'medium' && '🟡'}
                                    {opt.value === 'low' && '🟢'}
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status History Timeline */}
                        {selectedSuggestion.statusHistory?.length > 0 && (
                          <div className="detail-card history-card">
                            <div className="card-header">
                              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M13 3a9 9 0 00-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0013 21a9 9 0 000-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                              </svg>
                              <span>Activity Timeline</span>
                            </div>
                            <div className="card-body">
                              <div className="timeline">
                                {selectedSuggestion.statusHistory.map((entry, idx) => {
                                  const statusInfo = getStatusInfo(entry.status);
                                  return (
                                    <div key={idx} className="timeline-item">
                                      <div className="timeline-marker" style={{ background: statusInfo.color }}></div>
                                      <div className="timeline-content">
                                        <div className="timeline-header">
                                          <span className="timeline-status" style={{ color: statusInfo.color }}>
                                            {statusInfo.label}
                                          </span>
                                          <span className="timeline-date">{formatDate(entry.changedAt)}</span>
                                        </div>
                                        {entry.notes && (
                                          <p className="timeline-notes">{entry.notes}</p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
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

          {/* Activity Logs Tab */}
          {activeTab === 'activity' && (
            <div className="activity-content">
              <div className="content-header">
                <h2>Activity Logs</h2>
                <div className="header-actions">
                  {adminInfo?.role === 'developer' && (
                    <button 
                      className="cleanup-btn" 
                      onClick={async () => {
                        if (window.confirm('This will remove old activity logs with deprecated role names. Continue?')) {
                          try {
                            const res = await fetch(`${API_URL}/api/admin/activity-logs/cleanup`, {
                              method: 'DELETE',
                              headers: { 'x-admin-password': password }
                            });
                            const data = await res.json();
                            if (data.success) {
                              showNotification(data.message);
                              fetchActivityLogs();
                              fetchActivityStats();
                            } else {
                              showNotification(data.message, 'error');
                            }
                          } catch (error) {
                            showNotification('Error cleaning up logs', 'error');
                          }
                        }
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                      Cleanup Old Logs
                    </button>
                  )}
                  <button className="refresh-btn" onClick={() => { fetchActivityLogs(); fetchActivityStats(); }}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                    </svg>
                    Refresh
                  </button>
                </div>
              </div>

              {/* Activity Stats Row */}
              {activityStats && (
                <div className="activity-stats-row">
                  <div className="activity-stat-card compact">
                    <div className="stat-icon total">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                      </svg>
                    </div>
                    <div className="stat-info">
                      <span className="stat-value">{activityStats.totalLogs}</span>
                      <span className="stat-label">Total</span>
                    </div>
                  </div>
                  <div className="activity-stat-card compact">
                    <div className="stat-icon today">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/>
                      </svg>
                    </div>
                    <div className="stat-info">
                      <span className="stat-value">{activityStats.todayCount}</span>
                      <span className="stat-label">Today</span>
                    </div>
                  </div>
                  <div className="activity-stat-card compact">
                    <div className="stat-icon week">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                      </svg>
                    </div>
                    <div className="stat-info">
                      <span className="stat-value">{activityStats.weekCount}</span>
                      <span className="stat-label">This Week</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Activity Breakdown */}
              {activityStats && activityStats.byAdmin && activityStats.byAdmin.length > 0 && (
                <div className="admin-breakdown">
                  <h3 className="breakdown-title">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                    </svg>
                    Activity by Admin
                  </h3>
                  <div className="breakdown-cards">
                    {activityStats.byAdmin.map(admin => (
                      <div 
                        key={admin._id} 
                        className={`breakdown-card ${activityFilters.adminRole === admin._id ? 'active' : ''}`}
                        onClick={() => setActivityFilters(prev => ({ 
                          ...prev, 
                          adminRole: prev.adminRole === admin._id ? 'all' : admin._id 
                        }))}
                        style={{ '--admin-color': getAdminColor(admin._id) }}
                      >
                        <div className="breakdown-avatar" style={{ background: getAdminColor(admin._id) }}>
                          {admin.label ? admin.label.charAt(0) : admin._id.charAt(0).toUpperCase()}
                        </div>
                        <div className="breakdown-info">
                          <span className="breakdown-name">{admin.label || admin._id}</span>
                          <span className="breakdown-count">{admin.count} actions</span>
                        </div>
                        <div className="breakdown-bar">
                          <div 
                            className="breakdown-fill" 
                            style={{ 
                              width: `${(admin.count / activityStats.totalLogs) * 100}%`,
                              background: getAdminColor(admin._id)
                            }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Filters */}
              <div className="activity-filters">
                {/* Search Input */}
                <div className={`search-input-wrapper ${activitySearchExpanded ? 'expanded' : ''}`}>
                  <button 
                    className="search-toggle"
                    onClick={() => setActivitySearchExpanded(!activitySearchExpanded)}
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                  </button>
                  <input
                    type="text"
                    placeholder="Search tracking code or title..."
                    value={activityFilters.search}
                    onChange={(e) => setActivityFilters(prev => ({ ...prev, search: e.target.value }))}
                    onBlur={() => !activityFilters.search && setActivitySearchExpanded(false)}
                  />
                  {activityFilters.search && (
                    <button 
                      className="search-clear"
                      onClick={() => {
                        setActivityFilters(prev => ({ ...prev, search: '' }));
                        setActivitySearchExpanded(false);
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  )}
                </div>

                <div className="filter-group">
                  <select 
                    value={activityFilters.adminRole}
                    onChange={(e) => setActivityFilters(prev => ({ ...prev, adminRole: e.target.value }))}
                    className="activity-filter-select"
                  >
                    <option value="all">All Admins</option>
                    <option value="executive">Executive</option>
                    <option value="press_secretary">Press Secretary</option>
                    <option value="network_secretary">Secretary on Networks</option>
                    <option value="developer">Developer</option>
                  </select>
                  
                  <select 
                    value={activityFilters.action}
                    onChange={(e) => setActivityFilters(prev => ({ ...prev, action: e.target.value }))}
                    className="activity-filter-select"
                  >
                    <option value="all">All Actions</option>
                    <option value="login">Login</option>
                    <option value="logout">Logout</option>
                    <option value="view_suggestion">View Suggestion</option>
                    <option value="update_status">Update Status</option>
                    <option value="update_priority">Update Priority</option>
                    <option value="archive_suggestion">Archive</option>
                    <option value="unarchive_suggestion">Unarchive</option>
                    <option value="delete_suggestion">Delete</option>
                    <option value="bulk_delete">Bulk Delete</option>
                    <option value="mark_read">Mark Read</option>
                  </select>
                  
                  {/* Date Preset Dropdown */}
                  <div className={`custom-select date-select ${activityDateDropdownOpen ? 'open' : ''} ${activityFilters.datePreset === 'custom' ? 'has-custom-range' : ''}`}>
                    <div 
                      className="select-trigger"
                      onClick={() => setActivityDateDropdownOpen(!activityDateDropdownOpen)}
                    >
                      <span className="select-icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/>
                        </svg>
                      </span>
                      <span className="select-value">
                        {activityFilters.datePreset === 'custom' && activityFilters.dateFrom && activityFilters.dateTo
                          ? `${new Date(activityFilters.dateFrom).toLocaleDateString()} - ${new Date(activityFilters.dateTo).toLocaleDateString()}`
                          : DATE_PRESETS.find(d => d.value === activityFilters.datePreset)?.label || 'All Time'}
                      </span>
                      <span className="select-arrow">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                          <path d="M7 10l5 5 5-5z"/>
                        </svg>
                      </span>
                    </div>
                    {activityDateDropdownOpen && (
                      <>
                        <div className="dropdown-backdrop" onClick={() => setActivityDateDropdownOpen(false)} />
                        <div className="select-options date-options">
                          {DATE_PRESETS.map(preset => (
                            <div
                              key={preset.value}
                              className={`date-option ${activityFilters.datePreset === preset.value ? 'selected' : ''} ${preset.value === 'custom' ? 'custom-option' : ''}`}
                              onClick={() => {
                                if (preset.value === 'custom') {
                                  setActivityTempDateFrom(activityFilters.dateFrom);
                                  setActivityTempDateTo(activityFilters.dateTo);
                                  setActivityDateModalOpen(true);
                                } else {
                                  setActivityFilters(prev => ({ ...prev, datePreset: preset.value, dateFrom: '', dateTo: '' }));
                                }
                                setActivityDateDropdownOpen(false);
                              }}
                            >
                              <div className="date-option-icon">
                                {preset.icon === 'infinity' && <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L12 10.66 10.48 12h.01L7.8 14.39c-.64.64-1.49.99-2.4.99-1.87 0-3.39-1.51-3.39-3.38S3.53 8.62 5.4 8.62c.91 0 1.76.35 2.44 1.03l1.13 1 1.51-1.34L9.22 8.2A5.37 5.37 0 005.4 6.62C2.42 6.62 0 9.04 0 12s2.42 5.38 5.4 5.38c1.44 0 2.8-.56 3.77-1.53l2.83-2.5.01.01L13.52 12h-.01l2.69-2.39c.64-.64 1.49-.99 2.4-.99 1.87 0 3.39 1.51 3.39 3.38s-1.52 3.38-3.39 3.38c-.9 0-1.76-.35-2.44-1.03l-1.14-1.01-1.51 1.34 1.27 1.12a5.386 5.386 0 003.82 1.57c2.98 0 5.4-2.41 5.4-5.38s-2.42-5.37-5.4-5.37z"/></svg>}
                                {preset.icon === 'sun' && <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/></svg>}
                                {preset.icon === 'clock' && <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>}
                                {preset.icon === 'week' && <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/></svg>}
                                {preset.icon === 'calendar' && <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>}
                                {preset.icon === 'quarter' && <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/></svg>}
                                {preset.icon === 'year' && <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>}
                                {preset.icon === 'custom' && <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm-4.5-7.5l-5 5-2.5-2.5 1.41-1.41 1.09 1.09 3.59-3.59 1.41 1.41z"/></svg>}
                              </div>
                              <div className="date-option-content">
                                <span className="date-option-label">{preset.label}</span>
                                <span className="date-option-desc">{preset.desc}</span>
                              </div>
                              {activityFilters.datePreset === preset.value && (
                                <div className="date-option-check">
                                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Activity Date Range Modal */}
              {activityDateModalOpen && (
                <>
                  <div className="date-modal-overlay" onClick={() => setActivityDateModalOpen(false)} />
                  <div className="date-range-modal">
                    <div className="date-modal-header">
                      <h3>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                        </svg>
                        Select Date Range
                      </h3>
                      <button className="close-modal-btn" onClick={() => setActivityDateModalOpen(false)}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                      </button>
                    </div>
                    
                    <div className="date-modal-body">
                      <div className="date-range-visual">
                        <div className={`date-picker-card ${activityTempDateFrom ? 'has-date' : ''}`}>
                          <div className="date-card-header">
                            <span className="date-label">FROM</span>
                          </div>
                          <input 
                            type="date" 
                            value={activityTempDateFrom}
                            onChange={(e) => setActivityTempDateFrom(e.target.value)}
                            max={activityTempDateTo || undefined}
                          />
                          <div className="date-preview">
                            {activityTempDateFrom ? (
                              <>
                                <span className="day">{new Date(activityTempDateFrom + 'T00:00:00').getDate()}</span>
                                <span className="month-year">
                                  {new Date(activityTempDateFrom + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </span>
                              </>
                            ) : (
                              <span className="placeholder">Select start</span>
                            )}
                          </div>
                        </div>

                        <div className="date-connection">
                          <div className="connection-line">
                            <div className={`line-fill ${activityTempDateFrom && activityTempDateTo ? 'active' : ''}`} />
                          </div>
                          <div className={`connection-icon ${activityTempDateFrom && activityTempDateTo ? 'active' : ''}`}>
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                              <path d="M16.01 11H4v2h12.01v3L20 12l-3.99-4z"/>
                            </svg>
                          </div>
                          {activityTempDateFrom && activityTempDateTo && (
                            <div className="days-between">
                              {Math.ceil((new Date(activityTempDateTo) - new Date(activityTempDateFrom)) / (1000 * 60 * 60 * 24))} days
                            </div>
                          )}
                        </div>

                        <div className={`date-picker-card ${activityTempDateTo ? 'has-date' : ''}`}>
                          <div className="date-card-header">
                            <span className="date-label">TO</span>
                          </div>
                          <input 
                            type="date" 
                            value={activityTempDateTo}
                            onChange={(e) => setActivityTempDateTo(e.target.value)}
                            min={activityTempDateFrom || undefined}
                          />
                          <div className="date-preview">
                            {activityTempDateTo ? (
                              <>
                                <span className="day">{new Date(activityTempDateTo + 'T00:00:00').getDate()}</span>
                                <span className="month-year">
                                  {new Date(activityTempDateTo + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </span>
                              </>
                            ) : (
                              <span className="placeholder">Select end</span>
                            )}
                          </div>
                        </div>
                      </div>

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
                                setActivityTempDateFrom(from.toISOString().split('T')[0]);
                                setActivityTempDateTo(to.toISOString().split('T')[0]);
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
                          setActivityTempDateFrom('');
                          setActivityTempDateTo('');
                        }}
                      >
                        Clear
                      </button>
                      <button 
                        className="apply-btn"
                        disabled={!activityTempDateFrom && !activityTempDateTo}
                        onClick={() => {
                          setActivityFilters(prev => ({
                            ...prev,
                            datePreset: 'custom',
                            dateFrom: activityTempDateFrom,
                            dateTo: activityTempDateTo
                          }));
                          setActivityDateModalOpen(false);
                        }}
                      >
                        Apply Range
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Timeline View */}
              <div className="activity-timeline">
                {activityLogs.length === 0 ? (
                  <div className="empty-logs">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                      <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0013 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                    </svg>
                    <p>No activity logs found</p>
                  </div>
                ) : (
                  <div className="timeline-container">
                    {activityLogs.map((log, index) => (
                      <div key={log._id} className="timeline-item" style={{ '--delay': `${index * 0.05}s` }}>
                        <div className="timeline-line">
                          <div className="timeline-dot" style={{ background: getAdminColor(log.adminRole) }}>
                            <div className="dot-pulse" style={{ background: getAdminColor(log.adminRole) }} />
                          </div>
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-card">
                            <div className="timeline-header">
                              <div className="timeline-avatar" style={{ background: getAdminColor(log.adminRole) }}>
                                {log.adminLabel.charAt(0)}
                              </div>
                              <div className="timeline-meta">
                                <span className="timeline-admin" style={{ color: getAdminColor(log.adminRole) }}>
                                  {log.adminLabel}
                                </span>
                                <span className="timeline-action">{formatAction(log.action)}</span>
                              </div>
                              <span className="timeline-time">{formatDate(log.createdAt)}</span>
                            </div>
                            {(log.suggestionTrackingCode || (log.details && Object.keys(log.details).length > 0)) && (
                              <div className="timeline-body">
                                {log.suggestionTrackingCode && (
                                  <div className="timeline-target">
                                    <span className="tracking-code">{log.suggestionTrackingCode}</span>
                                    {log.suggestionTitle && (
                                      <span className="suggestion-title">{log.suggestionTitle}</span>
                                    )}
                                  </div>
                                )}
                                {log.details && Object.keys(log.details).length > 0 && (
                                  <div className="timeline-details">
                                    {log.details.oldStatus && log.details.newStatus && (
                                      <span className="detail-badge status">
                                        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                        </svg>
                                        {log.details.oldStatus} → {log.details.newStatus}
                                      </span>
                                    )}
                                    {log.details.oldPriority && log.details.newPriority && (
                                      <span className="detail-badge priority">
                                        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                                          <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
                                        </svg>
                                        {log.details.oldPriority} → {log.details.newPriority}
                                      </span>
                                    )}
                                    {log.details.count && (
                                      <span className="detail-badge bulk">
                                        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                        </svg>
                                        {log.details.count} items
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity Pagination */}
              {activityPagination.pages > 1 && (
                <div className="pagination">
                  <button
                    disabled={activityPagination.page === 1}
                    onClick={() => setActivityPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    ← Prev
                  </button>
                  <span className="page-info">
                    Page {activityPagination.page} of {activityPagination.pages}
                  </span>
                  <button
                    disabled={activityPagination.page === activityPagination.pages}
                    onClick={() => setActivityPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminPanel;
