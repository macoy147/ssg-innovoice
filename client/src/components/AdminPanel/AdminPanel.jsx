import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useStudentAuth } from '../../context/StudentAuthContext';
import {
  IconLayoutDashboard,
  IconInbox,
  IconHistory,
  IconArrowLeft,
  IconLogout,
  IconSun,
  IconMoon,
  IconRefresh,
  IconSearch,
  IconX,
  IconCheck,
  IconTrash,
  IconArchive,
  IconShieldLock,
  IconUser,
  IconMail,
  IconEye,
  IconEyeOff,
  IconChevronDown,
  IconChevronRight,
  IconChevronLeft,
  IconSparkles,
  IconCalendar,
  IconFilter,
  IconSchool,
  IconShieldCheck,
  IconShield,
  IconTrendingUp,
  IconAlertTriangle,
  IconClock,
  IconExternalLink,
  IconChecklist,
  IconBellRinging,
  IconVolume,
  IconVolumeOff,
  IconArrowBackUp,
  IconTrashX,
  IconArchiveOff,
  IconTable,
  IconTimeline,
  IconDownload,
  IconFileSpreadsheet,
  IconFlame,
  IconInfoCircle,
  IconActivity,
  IconArrowsExchange,
  IconLogin,
  IconDevices,
  IconFileText,
  IconBuildingSkyscraper,
  IconUsers,
  IconUserCheck,
  IconPhoto,
  IconSortDescending,
  IconSortAscending,
  IconTrendingDown,
  IconFolder
} from '@tabler/icons-react';
import NotFound from '../NotFound/NotFound';
import './AdminPanel.scss';
import API_URL from '../../config/api';

const STATUS_OPTIONS = [
  { value: 'submitted', label: 'Submitted', color: '#374151', bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' },
  { value: 'under_review', label: 'Under Review', color: '#92400E', bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
  { value: 'forwarded', label: 'Forwarded', color: '#374151', bg: '#E5E7EB', text: '#374151', border: '#D1D5DB' },
  { value: 'action_taken', label: 'Action Taken', color: '#9F1239', bg: '#FCE7F3', text: '#9F1239', border: 'rgba(159, 18, 57, 0.25)' },
  { value: 'resolved', label: 'Resolved', color: '#03543F', bg: '#DEF7EC', text: '#03543F', border: '#BCF0DA' },
  { value: 'rejected', label: 'Rejected', color: '#B91C1C', bg: '#FEE2E2', text: '#B91C1C', border: '#F8B4B4' }
];

const REJECTION_PRESETS = [
  { label: 'Duplicate report', text: 'Duplicate submission — this issue is already actively being addressed by SSG.' },
  { label: 'Outside SSG scope', text: 'This concern falls outside SSG jurisdiction and has been forwarded directly to university administration.' },
  { label: 'Policy / budget limits', text: 'Currently infeasible due to school term budget or institutional policy guidelines.' },
  { label: 'Insufficient details', text: 'Insufficient details provided to take actionable steps. Please submit again with more context or proof.' }
];

const TRASH_PRESETS = [
  { label: 'Duplicate entry', text: 'Duplicate submission' },
  { label: 'Spam / test', text: 'Test or invalid submission' },
  { label: 'Out of scope', text: 'Forwarded to external university office' },
  { label: 'Resolved previously', text: 'Already resolved in prior semester' }
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'academic', label: 'Academic' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'extracurricular', label: 'Extracurricular' },
  { value: 'general', label: 'General' }
];

const renderCategoryIcon = (category, size = 16) => {
  switch (category) {
    case 'academic': return <IconSchool size={size} />;
    case 'administrative': return <IconBuildingSkyscraper size={size} />;
    case 'extracurricular': return <IconFlame size={size} />;
    case 'general': return <IconInfoCircle size={size} />;
    default: return <IconFolder size={size} />;
  }
};

const renderIdentityIcon = (identity, size = 16) => {
  switch (identity) {
    case 'anonymous': return <IconShieldLock size={size} />;
    case 'identified': return <IconUserCheck size={size} />;
    default: return <IconUsers size={size} />;
  }
};

const renderSortIcon = (sortValue, size = 16) => {
  switch (sortValue) {
    case 'oldest': return <IconSortAscending size={size} />;
    case 'recently_updated': return <IconRefresh size={size} />;
    case 'priority_high': return <IconTrendingUp size={size} />;
    case 'priority_low': return <IconTrendingDown size={size} />;
    default: return <IconSortDescending size={size} />;
  }
};

// Helper to get category info with Tabler SVG icon
const getCategoryInfo = (category) => {
  const cat = CATEGORY_OPTIONS.find(c => c.value === category);
  return {
    label: cat?.label || category || 'General',
    icon: renderCategoryIcon(category)
  };
};

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: '#374151', bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' },
  { value: 'medium', label: 'Medium', color: '#92400E', bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
  { value: 'high', label: 'High', color: '#B91C1C', bg: '#FEE2E2', text: '#B91C1C', border: '#F8B4B4' },
  { value: 'urgent', label: 'Urgent', color: '#B91C1C', bg: '#FEE2E2', text: '#B91C1C', border: '#F8B4B4' }
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
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'recently_updated', label: 'Recently Updated' },
  { value: 'priority_high', label: 'Priority (High to Low)' },
  { value: 'priority_low', label: 'Priority (Low to High)' }
];

const IDENTITY_OPTIONS = [
  { value: 'all', label: 'All Submissions' },
  { value: 'anonymous', label: 'Anonymous Only' },
  { value: 'identified', label: 'Identified Only' }
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
  const { student, logout, loginWithGoogle, isLoading: isAuthLoading } = useStudentAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Refresh loading states
  const [dashboardRefreshing, setDashboardRefreshing] = useState(false);
  const [activityRefreshing, setActivityRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState(new Date());

  // Real-time live alerts and notification sounds
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Synthesize a pleasant two-tone melodic chime via Web Audio API
  const playNotificationChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440, now); // A4
      osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5

      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(0.18, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.65);
      osc2.stop(now + 0.65);
    } catch {
      // Audio playback gracefully suppressed if not yet interacted
    }
  };

  // Browser desktop notification for background tab monitoring
  const triggerDesktopNotification = (suggestion) => {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        const n = new Notification('SSG InnoVoice • New Suggestion Received', {
          body: `[${(suggestion.priority || 'Normal').toUpperCase()}] ${suggestion.title || 'New feedback received'}\nCategory: ${suggestion.category || 'General'}`,
          icon: '/ssg-logo.png',
          badge: '/ssg-logo.png',
          tag: suggestion.trackingCode || 'innovoice-notification',
          renotify: true
        });
        n.onclick = () => {
          window.focus();
          setActiveTab('suggestions');
          setSelectedSuggestion(suggestion);
        };
      }
    } catch {
      // Notification suppressed
    }
  };

  const formatSyncedTime = (date) => {
    if (!date) return 'Just now';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Admin info (role, label, color)
  const [adminInfo, setAdminInfo] = useState(null);

  // Online admins state
  const [onlineAdmins, setOnlineAdmins] = useState([]);

  // Activity logs state
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityStats, setActivityStats] = useState(null);
  const [activityLoading, setActivityLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
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
  const [activitySearchExpanded, setActivitySearchExpanded] = useState(false);
  const [activityViewMode, setActivityViewMode] = useState('timeline'); // 'timeline' | 'table'
  const [inspectingLog, setInspectingLog] = useState(null);
  const [activityCategoryFilter, setActivityCategoryFilter] = useState('all');

  // Dashboard state
  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    recentCount: 0,
    anonymousCount: 0,
    identifiedCount: 0,
    unreadCount: 0,
    activeCount: 0,
    byCategory: [],
    byStatus: [],
    byPriority: []
  });
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    search: '',
    datePreset: 'all',
    dateFrom: '',
    dateTo: '',
    sort: 'newest',
    view: 'active',
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
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const isSidebarExpanded = sidebarHovered;
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState('trash'); // 'trash' | 'restore' | 'permanent'
  const [bulkSelectMode, setBulkSelectMode] = useState(false);

  // Cascading filter state
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('adminDarkMode');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Status update modal state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [statusNote, setStatusNote] = useState('');

  // Delete & Trash confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteModalAction, setDeleteModalAction] = useState('trash'); // 'trash' | 'permanent'
  const [pendingDelete, setPendingDelete] = useState(null);
  const [emptyTrashModalOpen, setEmptyTrashModalOpen] = useState(false);
  const [trashReason, setTrashReason] = useState('');

  // Cleanup logs modal state
  const [cleanupModalOpen, setCleanupModalOpen] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [deprecatedLogsCount, setDeprecatedLogsCount] = useState(null);

  // Sync refs to avoid stale closures in SSE listeners and polling intervals
  const filtersRef = useRef(filters);
  const paginationRef = useRef(pagination);
  const activityFiltersRef = useRef(activityFilters);
  const activityPaginationRef = useRef(activityPagination);
  const activeTabRef = useRef(activeTab);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    activityFiltersRef.current = activityFilters;
  }, [activityFilters]);

  useEffect(() => {
    activityPaginationRef.current = activityPagination;
  }, [activityPagination]);

  // Authenticated Admin Fetch helper (attaches Bearer token for Google RBAC SSO)
  const adminFetch = (url, options = {}) => {
    const token = localStorage.getItem('innovoice_student_jwt_token');
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.headers || {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
  };

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

    const isReadNormalized =
      suggestion &&
      (suggestion.isRead === true || suggestion.isRead === 'true');

    if (isReadNormalized) {
      return;
    }

    try {
      const res = await adminFetch(`${API_URL}/api/admin/suggestions/${suggestionId}/read`, {
        method: 'PUT'
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Mark as read response:', data);

        // Update local state immediately for responsiveness
        setSuggestions(prev => prev.map(s =>
          s._id === suggestionId ? { ...s, isRead: true, readAt: new Date().toISOString(), readBy: data.data?.readBy } : s
        ));
        // Update stats
        if (stats?.unreadCount > 0) {
          setStats(prev => ({ ...prev, unreadCount: prev.unreadCount - 1 }));
        }

        console.log('Local state updated successfully');
      } else {
        const error = await res.json();
        console.error('Failed to mark as read:', error);
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Check if suggestion is unread
  const isUnread = (suggestionId) => {
    const suggestion = suggestions.find(s => s._id === suggestionId);
    if (!suggestion) return false;

    const isReadNormalized =
      suggestion.isRead === true || suggestion.isRead === 'true';

    return !isReadNormalized;
  };

  useEffect(() => {
    // 1. If currently signed in with authorized Google Admin account
    if (student?.isAdmin) {
      const officerInfo = {
        role: student.adminRole || 'executive',
        label: student.adminLabel || 'SSG Officer',
        color: student.adminColor || '#8b5cf6',
        email: student.email,
        name: student.name,
        picture: student.picture
      };
      setAdminInfo(officerInfo);
      sessionStorage.setItem('adminInfo', JSON.stringify(officerInfo));
      setIsAuthenticated(true);
      return;
    }

    const savedAdminInfo = sessionStorage.getItem('adminInfo');

    // Hydrate UI quickly (not used as primary authentication)
    if (savedAdminInfo) {
      try {
        setAdminInfo(JSON.parse(savedAdminInfo));
      } catch {
        // ignore
      }
    }

    // Validate session cookie / Bearer token with the server
    (async () => {
      try {
        const token = localStorage.getItem('innovoice_student_jwt_token');
        const res = await fetch(`${API_URL}/api/admin/me`, {
          credentials: 'include',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        const data = await res.json();
        if (data.success && data.admin) {
          setAdminInfo(data.admin);
          sessionStorage.setItem('adminInfo', JSON.stringify(data.admin));
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    })();
  }, [student]);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchSuggestions();
      fetchOnlineAdmins();
    }
  }, [isAuthenticated, filters, pagination.page]);

  // Heartbeat and online admins synchronization - only when tab is visible
  useEffect(() => {
    if (!isAuthenticated) return;

    let heartbeatInterval;

    const performHeartbeat = async () => {
      try {
        const res = await adminFetch(`${API_URL}/api/admin/heartbeat`, {
          method: 'POST'
        });
        if (res.ok) {
          const data = await res.json();
          if (data.onlineAdmins) {
            setOnlineAdmins(data.onlineAdmins);
          }
        }
      } catch (err) {
        console.error('Heartbeat error:', err);
      }
    };

    const startPolling = () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);

      // Send heartbeat and sync online admins every 30 seconds
      heartbeatInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          performHeartbeat();
        }
      }, 30000);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        performHeartbeat();
      }
    };

    // Handle tab/browser close - notify server admin went offline
    const handleBeforeUnload = () => {
      const data = JSON.stringify({});
      navigator.sendBeacon(
        `${API_URL}/api/admin/logout-beacon`,
        data
      );
    };

    // Initial heartbeat sync
    performHeartbeat();

    // Start polling
    startPolling();

    // Listen for visibility changes and tab close
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(heartbeatInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthenticated]);

  // Real-time EventSource (SSE) Live Stream & Notification Listener
  useEffect(() => {
    if (!isAuthenticated) return;

    // Request desktop notification permission once if unprompted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    const token = localStorage.getItem('innovoice_student_jwt_token');
    const sseUrl = `${API_URL}/api/admin/live-stream${token ? `?token=${encodeURIComponent(token)}` : ''}`;

    let eventSource = null;
    try {
      eventSource = new EventSource(sseUrl, { withCredentials: true });

      eventSource.addEventListener('new_suggestion', (e) => {
        try {
          const newSuggestion = JSON.parse(e.data);

          // 1. Play audio chime if sound is enabled
          if (soundEnabled) {
            playNotificationChime();
          }

          // 2. Trigger desktop notification if tab is in background
          if (document.visibilityState === 'hidden') {
            triggerDesktopNotification(newSuggestion);
          }

          // 3. Add to live toast alert queue (keep max 3)
          const alertItem = {
            ...newSuggestion,
            alertId: Date.now() + Math.random()
          };
          setLiveAlerts(prev => [alertItem, ...prev.slice(0, 2)]);

          // 4. Update sync timestamp and refresh stats & suggestions list
          setLastSynced(new Date());
          fetchStats();
          fetchSuggestions();
        } catch (err) {
          console.error('Error processing real-time suggestion event:', err);
        }
      });
    } catch (err) {
      console.error('Failed to establish EventSource connection:', err);
    }

    // Smart background live polling fallback (every 30 seconds, scoped to active tabs)
    const liveSyncInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        const currentTab = activeTabRef.current;
        if (currentTab === 'dashboard' || currentTab === 'suggestions') {
          fetchStats();
          fetchSuggestions();
        }
      }
    }, 30000);

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(liveSyncInterval);
    };
  }, [isAuthenticated, soundEnabled]);

  // Auto-dismiss live alerts after 9 seconds
  useEffect(() => {
    if (liveAlerts.length === 0) return;
    const timer = setTimeout(() => {
      setLiveAlerts(prev => prev.slice(0, prev.length - 1));
    }, 9000);
    return () => clearTimeout(timer);
  }, [liveAlerts]);

  // Fetch activity stats only when entering activity tab or when role/action filters change
  useEffect(() => {
    if (isAuthenticated && activeTab === 'activity') {
      fetchActivityStats();
    }
  }, [isAuthenticated, activeTab, activityFilters.adminRole, activityFilters.action]);

  // Fetch activity logs when on activity tab and filters or pagination page change
  useEffect(() => {
    if (isAuthenticated && activeTab === 'activity') {
      fetchActivityLogs();
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

  // Close filter dropdowns when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (filterDropdownOpen || dateDropdownOpen || sortDropdownOpen || identityDropdownOpen) {
        if (!e.target.closest('.cascading-filter') && !e.target.closest('.custom-select')) {
          closeAllDropdowns();
        }
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [filterDropdownOpen, dateDropdownOpen, sortDropdownOpen, identityDropdownOpen]);

  // Toggle bulk select mode
  const toggleBulkSelectMode = () => {
    if (bulkSelectMode) {
      // Exiting bulk mode - clear selections
      setSelectedIds([]);
    }
    setBulkSelectMode(!bulkSelectMode);
  };

  // Fetch activity logs
  const fetchActivityLogs = async () => {
    setActivityLoading(true);
    const activeFilters = activityFiltersRef.current;
    const activePagination = activityPaginationRef.current;
    try {
      // Get date range from preset or custom dates
      let dateFrom = activeFilters.dateFrom;
      let dateTo = activeFilters.dateTo;

      if (activeFilters.datePreset !== 'all' && activeFilters.datePreset !== 'custom') {
        const range = getDateRange(activeFilters.datePreset);
        dateFrom = range.from;
        dateTo = range.to;
      }

      const params = new URLSearchParams({
        page: activePagination.page,
        limit: activePagination.limit,
        ...(activeFilters.adminRole !== 'all' && { adminRole: activeFilters.adminRole }),
        ...(activeFilters.action !== 'all' && { action: activeFilters.action }),
        ...(activeFilters.search && { search: activeFilters.search }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      });

      const res = await adminFetch(`${API_URL}/api/admin/activity-logs?${params}`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setActivityLogs(data.data);
        setActivityPagination(prev => ({ ...prev, ...data.pagination }));
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  // Fetch activity stats
  const fetchActivityStats = async () => {
    try {
      const res = await adminFetch(`${API_URL}/api/admin/activity-logs/stats`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setActivityStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching activity stats:', error);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await adminFetch(`${API_URL}/api/admin/stats`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchOnlineAdmins = async () => {
    try {
      const res = await adminFetch(`${API_URL}/api/admin/online`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) setOnlineAdmins(data.data);
    } catch (error) {
      console.error('Error fetching online admins:', error);
    }
  };

  const fetchSuggestions = async (overrideFilters = null) => {
    setIsLoading(true);
    const activeFilters = overrideFilters || filtersRef.current;
    const activePagination = paginationRef.current;
    try {
      // Get date range from preset or custom dates
      let dateFrom = activeFilters.dateFrom;
      let dateTo = activeFilters.dateTo;

      if (activeFilters.datePreset !== 'all' && activeFilters.datePreset !== 'custom') {
        const range = getDateRange(activeFilters.datePreset);
        dateFrom = range.from;
        dateTo = range.to;
      }

      const params = new URLSearchParams({
        page: activePagination.page,
        limit: activePagination.limit,
        sort: activeFilters.sort,
        view: activeFilters.view || 'active',
        ...(activeFilters.category !== 'all' && { category: activeFilters.category }),
        ...(activeFilters.status !== 'all' && { status: activeFilters.status }),
        ...(activeFilters.search && { search: activeFilters.search }),
        ...(activeFilters.identity !== 'all' && { identity: activeFilters.identity }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      });

      const res = await adminFetch(`${API_URL}/api/admin/suggestions?${params}`);
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
      const res = await adminFetch(`${API_URL}/api/admin/suggestions/${id}/archive`, {
        method: 'PUT'
      });

      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        if (selectedSuggestion?._id === id) {
          setSelectedSuggestion(data.data);
        }
        fetchSuggestions();
        fetchStats();
      } else {
        showNotification(data.message || 'Error updating archive status', 'error');
      }
    } catch (error) {
      console.error('Archive error:', error);
      showNotification('Error updating archive status', 'error');
    }
  };

  const moveToTrash = async (id, reason = '') => {
    try {
      const finalReason = reason || trashReason || '';
      const res = await adminFetch(`${API_URL}/api/admin/suggestions/${id}/trash`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: finalReason })
      });

      const data = await res.json();
      if (data.success) {
        showNotification('Suggestion moved to trash');
        if (selectedSuggestion?._id === id) setSelectedSuggestion(null);
        setDeleteModalOpen(false);
        setPendingDelete(null);
        setTrashReason('');
        fetchSuggestions();
        fetchStats();
      } else {
        showNotification(data.message || 'Failed to move to trash', 'error');
      }
    } catch (error) {
      console.error('Move to trash error:', error);
      showNotification('Error moving suggestion to trash', 'error');
    }
  };

  const restoreSuggestion = async (id) => {
    try {
      const res = await adminFetch(`${API_URL}/api/admin/suggestions/${id}/restore`, {
        method: 'PUT'
      });

      const data = await res.json();
      if (data.success) {
        showNotification('Suggestion restored to inbox');
        if (selectedSuggestion?._id === id) setSelectedSuggestion(null);
        fetchSuggestions();
        fetchStats();
      } else {
        showNotification(data.message || 'Failed to restore suggestion', 'error');
      }
    } catch (error) {
      console.error('Restore error:', error);
      showNotification('Error restoring suggestion', 'error');
    }
  };

  const permanentDeleteSuggestion = async (id) => {
    try {
      const res = await adminFetch(`${API_URL}/api/admin/suggestions/${id}/permanent`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (data.success) {
        showNotification('Suggestion permanently deleted');
        if (selectedSuggestion?._id === id) setSelectedSuggestion(null);
        setDeleteModalOpen(false);
        setPendingDelete(null);
        fetchSuggestions();
        fetchStats();
      } else {
        showNotification(data.message || 'Failed to delete permanently', 'error');
      }
    } catch (error) {
      console.error('Permanent delete error:', error);
      showNotification('Error permanently deleting suggestion', 'error');
    }
  };

  const handleEmptyTrash = async () => {
    try {
      const res = await adminFetch(`${API_URL}/api/admin/suggestions/empty-trash`, {
        method: 'POST'
      });

      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        setEmptyTrashModalOpen(false);
        fetchSuggestions();
        fetchStats();
      } else {
        showNotification(data.message || 'Failed to empty trash', 'error');
      }
    } catch (error) {
      console.error('Empty trash error:', error);
      showNotification('Error emptying trash', 'error');
    }
  };

  const updateStatus = async (id, status, notes = '') => {
    try {
      const res = await adminFetch(`${API_URL}/api/admin/suggestions/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
      const res = await adminFetch(`${API_URL}/api/admin/suggestions/${id}/priority`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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

  const handleBulkAction = async () => {
    if (selectedIds.length === 0) return;

    try {
      if (bulkActionType === 'restore') {
        const res = await adminFetch(`${API_URL}/api/admin/suggestions/bulk-restore`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds })
        });
        const data = await res.json();
        if (data.success) {
          showNotification(`${selectedIds.length} suggestion(s) restored to inbox`);
          setSelectedIds([]);
          setBulkSelectMode(false);
          setBulkDeleteModalOpen(false);
          fetchSuggestions();
          fetchStats();
        }
      } else if (bulkActionType === 'permanent') {
        const res = await adminFetch(`${API_URL}/api/admin/suggestions/bulk-delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds })
        });
        const data = await res.json();
        if (data.success) {
          showNotification(`${selectedIds.length} suggestion(s) permanently deleted`);
          setSelectedIds([]);
          setBulkSelectMode(false);
          setBulkDeleteModalOpen(false);
          fetchSuggestions();
          fetchStats();
        }
      } else {
        // Bulk Move to Trash (soft delete)
        const res = await adminFetch(`${API_URL}/api/admin/suggestions/bulk-trash`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds })
        });
        const data = await res.json();
        if (data.success) {
          showNotification(`${selectedIds.length} suggestion(s) moved to trash`);
          setSelectedIds([]);
          setBulkSelectMode(false);
          setBulkDeleteModalOpen(false);
          fetchSuggestions();
          fetchStats();
        }
      }
    } catch (error) {
      showNotification('Error performing bulk operation', 'error');
    }
  };

  const handleLogout = async () => {
    // Log logout activity to server (records audit log and sets admin presence offline)
    try {
      await adminFetch(`${API_URL}/api/admin/logout`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error logging logout:', error);
    }

    // Clear student auth & Google session
    if (logout) {
      await logout();
    }

    // Clear admin session data
    sessionStorage.removeItem('adminInfo');
    setIsAuthenticated(false);
    setAdminInfo(null);

    // Redirect to home page
    navigate('/');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusInfo = (status) => STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  const getPriorityInfo = (priority) => PRIORITY_OPTIONS.find(p => p.value === priority) || PRIORITY_OPTIONS[1];

  // Helper to get admin color by role (Institutional University/Government Palette)
  const getAdminColor = (role) => {
    const colors = {
      'executive': '#9F1239',         // Burgundy (Institutional Primary)
      'developer': '#374151',         // Dark Slate
      'press_secretary': '#475569',   // Medium Slate
      'network_secretary': '#64748B'  // Neutral Slate
    };
    return colors[role] || '#475569';
  };

  // Helper to format action names
  const formatAction = (action) => {
    const actionLabels = {
      'login': 'logged in',
      'logout': 'logged out',
      'session_ended': 'session ended (tab closed)',
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

  // Helper to get structured badge info for an action (Strictly Semantic & Neutral)
  const getActionBadge = (action) => {
    switch (action) {
      case 'update_status':
        return { label: 'Status Changed', color: '#03543F', bg: '#DEF7EC', border: '#BCF0DA', icon: <IconArrowsExchange size={14} />, category: 'status' };
      case 'update_priority':
        return { label: 'Priority Changed', color: '#92400E', bg: '#FEF3C7', border: '#FDE68A', icon: <IconFlame size={14} />, category: 'status' };
      case 'archive_suggestion':
        return { label: 'Archived', color: '#374151', bg: '#F1F5F9', border: '#CBD5E1', icon: <IconArchive size={14} />, category: 'triage' };
      case 'unarchive_suggestion':
        return { label: 'Unarchived', color: '#374151', bg: '#F1F5F9', border: '#CBD5E1', icon: <IconArchiveOff size={14} />, category: 'triage' };
      case 'delete_suggestion':
        return { label: 'Moved to Trash', color: '#B91C1C', bg: '#FEE2E2', border: '#F8B4B4', icon: <IconTrash size={14} />, category: 'triage' };
      case 'restore_suggestion':
        return { label: 'Restored from Trash', color: '#03543F', bg: '#DEF7EC', border: '#BCF0DA', icon: <IconArrowBackUp size={14} />, category: 'triage' };
      case 'permanent_delete':
      case 'empty_trash':
        return { label: 'Permanently Deleted', color: '#B91C1C', bg: '#FEE2E2', border: '#F8B4B4', icon: <IconTrashX size={14} />, category: 'triage' };
      case 'bulk_delete':
        return { label: 'Permanently Deleted (Bulk)', color: '#B91C1C', bg: '#FEE2E2', border: '#F8B4B4', icon: <IconChecklist size={14} />, category: 'bulk' };
      case 'login':
        return { label: 'Officer Signed In', color: '#9F1239', bg: '#FCE7F3', border: 'rgba(159, 18, 57, 0.25)', icon: <IconLogin size={14} />, category: 'auth' };
      case 'logout':
        return { label: 'Officer Signed Out', color: '#475569', bg: '#F1F5F9', border: '#CBD5E1', icon: <IconLogout size={14} />, category: 'auth' };
      case 'session_ended':
        return { label: 'Session Ended', color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0', icon: <IconClock size={14} />, category: 'auth' };
      case 'view_suggestion':
        return { label: 'Viewed Suggestion', color: '#374151', bg: '#F1F5F9', border: '#CBD5E1', icon: <IconEye size={14} />, category: 'status' };
      case 'mark_read':
        return { label: 'Marked as Read', color: '#374151', bg: '#F1F5F9', border: '#CBD5E1', icon: <IconCheck size={14} />, category: 'status' };
      default:
        return { label: formatAction(action), color: '#475569', bg: '#F1F5F9', border: '#CBD5E1', icon: <IconActivity size={14} />, category: 'other' };
    }
  };

  // Helper for human-friendly relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 45) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Known Google admin directory for authentic Gmail profiles
  const GOOGLE_ADMIN_PROFILES = {
    'montellano.marco.c@gmail.com': {
      name: 'Marco Montellano',
      picture: 'https://lh3.googleusercontent.com/a/ACg8ocJxhyAEyQtkAR8owBo613vu72QEWt0z72RkHcEmRtpXheoK1StZ=s96-c'
    },
    'montellanomarco.it@gmail.com': {
      name: 'Marco Montellano',
      picture: 'https://lh3.googleusercontent.com/a/ACg8ocJjHAnmj6yh-5MX8ssOke_sKS384hXX44L9GxDI48X43TqudLcH=s96-c'
    },
    'macoyzzz333@gmail.com': {
      name: 'Macoy',
      picture: 'https://lh3.googleusercontent.com/a/ACg8ocLAje_L8F0z606JOq-Ee3ZrTirz3XtlrZOJYucDuRUJGCtAJg=s96-c'
    }
  };

  const getLogAdminAvatar = (log) => {
    if (!log) return null;
    if (log.adminPicture) return log.adminPicture;

    const email = (log.adminEmail || '').toLowerCase().trim();
    if (email && GOOGLE_ADMIN_PROFILES[email]) {
      return GOOGLE_ADMIN_PROFILES[email].picture;
    }

    if (student?.picture && (email === student?.email?.toLowerCase() || log.adminRole === adminInfo?.role || log.adminLabel === adminInfo?.label)) {
      return student.picture;
    }
    if (adminInfo?.picture && (email === adminInfo?.email?.toLowerCase() || log.adminRole === adminInfo?.role || log.adminLabel === adminInfo?.label)) {
      return adminInfo.picture;
    }

    // Check online admins
    const matchedOnline = onlineAdmins.find(a => 
      (a.email && a.email.toLowerCase() === email) || 
      (a.role && a.role === log.adminRole) || 
      (a.label && a.label === log.adminLabel)
    );
    if (matchedOnline?.picture) return matchedOnline.picture;

    // Role-based fallbacks to known Google accounts
    if (log.adminRole === 'developer') {
      return GOOGLE_ADMIN_PROFILES['montellano.marco.c@gmail.com'].picture;
    }
    if (log.adminLabel === 'President' || log.adminRole === 'executive') {
      return GOOGLE_ADMIN_PROFILES['montellanomarco.it@gmail.com'].picture;
    }

    return null;
  };

  const getLogAdminName = (log) => {
    if (!log) return 'SSG Admin';
    if (log.adminName) return log.adminName;

    const email = (log.adminEmail || '').toLowerCase().trim();
    if (email && GOOGLE_ADMIN_PROFILES[email]) {
      return GOOGLE_ADMIN_PROFILES[email].name;
    }

    if (student?.name && (email === student?.email?.toLowerCase() || log.adminRole === adminInfo?.role || log.adminLabel === adminInfo?.label)) {
      return student.name;
    }
    if (adminInfo?.name && (log.adminRole === adminInfo?.role || log.adminLabel === adminInfo?.label)) {
      return adminInfo.name;
    }

    if (log.adminRole === 'developer') {
      return 'Marco Montellano';
    }
    if (log.adminLabel === 'President') {
      return 'Marco Montellano';
    }

    return log.adminLabel || log.adminRole?.replace('_', ' ') || 'SSG Admin';
  };

  // Skeleton Loaders for Panel Items
  const renderDashboardSkeleton = () => (
    <div className="dashboard-skeleton-wrapper">
      <div className="banner-skeleton-card skeleton-box" />
      <div className="stats-grid-skeleton">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="stat-skeleton-card skeleton-box" />
        ))}
      </div>
      <div className="charts-row-skeleton">
        <div className="chart-skeleton-card skeleton-box" />
        <div className="chart-skeleton-card skeleton-box" />
      </div>
    </div>
  );

  const renderSuggestionsSkeleton = () => (
    <div className="suggestions-skeleton-wrapper">
      <div className="list-skeleton-col">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="card-skeleton-item skeleton-box" />
        ))}
      </div>
      <div className="detail-skeleton-col desktop-only">
        <div className="panel-skeleton-item skeleton-box" />
        <div className="panel-skeleton-item skeleton-box" />
      </div>
    </div>
  );

  const renderActivityLogsSkeleton = () => (
    <div className="activity-skeleton-wrapper">
      <div className="stats-skeleton-row">
        {[1, 2, 3].map(i => (
          <div key={i} className="stat-skeleton-item skeleton-box" />
        ))}
      </div>
      <div className="timeline-skeleton-list">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="timeline-skeleton-item skeleton-box" />
        ))}
      </div>
    </div>
  );

  // Export Activity Logs as CSV (exports full filtered dataset up to 1,000 logs)
  const exportActivityLogsCSV = async () => {
    try {
      showNotification('Preparing CSV export...', 'info');

      const activeFilters = activityFiltersRef.current;
      let dateFrom = activeFilters.dateFrom;
      let dateTo = activeFilters.dateTo;
      if (activeFilters.datePreset !== 'all' && activeFilters.datePreset !== 'custom') {
        const range = getDateRange(activeFilters.datePreset);
        dateFrom = range.from;
        dateTo = range.to;
      }

      const params = new URLSearchParams({
        page: 1,
        limit: 1000,
        ...(activeFilters.adminRole !== 'all' && { adminRole: activeFilters.adminRole }),
        ...(activeFilters.action !== 'all' && { action: activeFilters.action }),
        ...(activeFilters.search && { search: activeFilters.search }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      });

      const res = await adminFetch(`${API_URL}/api/admin/activity-logs?${params}`);
      const data = await res.json();
      const logsToExport = (data.success && data.data && data.data.length > 0) ? data.data : activityLogs;

      if (!logsToExport || logsToExport.length === 0) {
        showNotification('No activity logs match the selected filter to export', 'error');
        return;
      }

      const headers = ['Timestamp', 'Officer Name', 'Officer Email', 'Officer Role', 'Officer Label', 'Action Type', 'Tracking Code', 'Suggestion Title', 'Details'];
      const rows = logsToExport.map(log => {
        const adminName = getLogAdminName(log);
        const adminEmail = log.adminEmail || '';
        const detailsStr = log.details ? JSON.stringify(log.details).replace(/"/g, '""') : '';
        return [
          `"${new Date(log.createdAt).toISOString()}"`,
          `"${(adminName || '').replace(/"/g, '""')}"`,
          `"${adminEmail.replace(/"/g, '""')}"`,
          `"${log.adminRole || ''}"`,
          `"${log.adminLabel || ''}"`,
          `"${formatAction(log.action)}"`,
          `"${log.suggestionTrackingCode || ''}"`,
          `"${(log.suggestionTitle || '').replace(/"/g, '""')}"`,
          `"${detailsStr}"`
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `innovice-activity-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification(`Exported ${logsToExport.length} activity log(s) to CSV successfully!`, 'success');
    } catch (err) {
      console.error('Error exporting CSV:', err);
      showNotification('Failed to export activity logs to CSV', 'error');
    }
  };

  // Lock body scroll when inspector or critical modals are open
  useEffect(() => {
    if (inspectingLog || cleanupModalOpen || bulkDeleteModalOpen || statusModalOpen || deleteModalOpen || photoModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [inspectingLog, cleanupModalOpen, bulkDeleteModalOpen, statusModalOpen, deleteModalOpen, photoModalOpen]);

  // Open suggestion directly from an activity log item
  const handleOpenReportFromLog = async (log) => {
    const rawTrackingCode = log.suggestionTrackingCode;
    const cleanTrackingCode = rawTrackingCode ? rawTrackingCode.replace(/^#/, '').trim() : '';
    const reportId = log.suggestionId;
    if (!cleanTrackingCode && !reportId) {
      showNotification('This event is not linked to a specific suggestion', 'info');
      return;
    }

    setInspectingLog(null);
    setActiveTab('suggestions');

    // First check in-memory suggestions list
    const match = suggestions.find(s => 
      (cleanTrackingCode && (s.trackingCode === cleanTrackingCode || s.trackingCode === rawTrackingCode)) || 
      (reportId && s._id === reportId)
    );

    if (match) {
      setSelectedSuggestion(match);
      markAsRead(match._id);
      if (cleanTrackingCode) {
        setFilters(prev => ({ ...prev, search: cleanTrackingCode, view: 'active', category: 'all', status: 'all' }));
      }
      showNotification(`Viewing report #${match.trackingCode || 'selected'}`, 'success');
      return;
    }

    // Direct lookup by ID if available, otherwise fallback to search
    try {
      if (reportId) {
        const idRes = await adminFetch(`${API_URL}/api/admin/suggestions/${reportId}`);
        if (idRes.ok) {
          const idData = await idRes.json();
          if (idData.success && idData.data) {
            const found = idData.data;
            setSelectedSuggestion(found);
            markAsRead(found._id);
            setSuggestions(prev => {
              const exists = prev.some(p => p._id === found._id);
              return exists ? prev : [found, ...prev];
            });
            showNotification(`Viewing report #${found.trackingCode || 'selected'}`, 'success');
            return;
          }
        }
      }

      // Search by tracking code
      if (cleanTrackingCode) {
        const res = await adminFetch(`${API_URL}/api/admin/suggestions?search=${encodeURIComponent(cleanTrackingCode)}&view=all&limit=10`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data && data.data.length > 0) {
            const found = data.data.find(s => 
              s.trackingCode === cleanTrackingCode || 
              (reportId && s._id === reportId)
            ) || data.data[0];

            setSelectedSuggestion(found);
            markAsRead(found._id);
            setSuggestions(prev => {
              const exists = prev.some(p => p._id === found._id);
              return exists ? prev : [found, ...prev];
            });
            setFilters(prev => ({ ...prev, search: cleanTrackingCode, view: 'active', category: 'all', status: 'all' }));
            showNotification(`Viewing report #${found.trackingCode || 'selected'}`, 'success');
            return;
          }
        }
      }
      showNotification(`Report #${cleanTrackingCode || 'selected'} opened`, 'info');
    } catch (err) {
      console.error('Error opening report from log:', err);
    }
  };

  // While validating student session/token on initial mount, avoid flashing the login card
  if (!isAuthenticated && isAuthLoading && !student) {
    return (
      <div className="admin-page">
        <div className="admin-login-page">
          <div className="login-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: '1rem' }}>
            <span className="lock-icon"><IconShieldCheck size={48} color="#6366f1" /></span>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Verifying administrative credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  // Login Screen / Google Officer Access Guard
  if (!isAuthenticated) {
    return (
      <div className="admin-page">
        <div className="admin-login-page">
          <div className="login-card">
            <button className="back-home-btn" onClick={() => navigate('/')}>
              ← Back to Student View
            </button>
            <div className="login-header">
              <span className="lock-icon"><IconShieldCheck size={48} color="#6366f1" /></span>
              <h2>SSG Officer Portal</h2>
              <p>Restricted access for authorized SSG Officers & Administrators</p>
            </div>

            {student ? (
              <div className="admin-restricted-notice">
                <div className="restricted-badge">
                  <IconAlertTriangle size={20} color="#f59e0b" />
                  <span>Access Restricted</span>
                </div>
                <p className="restricted-desc">
                  You are signed in as <strong>{student.email}</strong>, but this account is not in the authorized SSG Officer directory.
                </p>
                <div className="restricted-actions">
                  <button 
                    type="button" 
                    className="switch-account-btn" 
                    onClick={async () => {
                      await logout();
                    }}
                  >
                    Switch Google Account
                  </button>
                  <button 
                    type="button" 
                    className="return-home-btn" 
                    onClick={() => navigate('/')}
                  >
                    Return to Student Portal
                  </button>
                </div>
              </div>
            ) : (
              <div className="admin-google-auth-box">
                <p className="auth-instructions">
                  Please sign in with your official CTU / SSG Google Account to verify your administrative credentials.
                </p>
                <div className="google-login-center">
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      if (credentialResponse?.credential) {
                        setIsLoading(true);
                        setLoginError('');
                        const res = await loginWithGoogle(credentialResponse.credential);
                        setIsLoading(false);
                        if (!res.success) {
                          setLoginError(res.message || 'Authentication failed');
                        }
                      }
                    }}
                    onError={() => {
                      setLoginError('Google sign-in was canceled or failed.');
                    }}
                    theme="filled_blue"
                    size="large"
                    shape="pill"
                    text="continue_with"
                    locale="en"
                  />
                </div>
                {loginError && <div className="error-msg">{loginError}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard with Sidebar
  return (
    <div className={`admin-page ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className={`admin-layout ${sidebarHovered ? 'sidebar-hovered' : 'sidebar-collapsed'}`}>
        {notification && (
          <div className={`admin-notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        {/* Real-time Incoming Live Suggestion Toast Alerts */}
        <div className="live-alert-container">
          {liveAlerts.map((alert) => (
            <div key={alert.alertId} className={`live-alert-toast priority-${alert.priority || 'medium'}`}>
              <div className="live-alert-icon-wrap">
                <span className="live-alert-ping" />
                <IconBellRinging size={20} className="bell-svg" />
              </div>
              <div className="live-alert-body">
                <div className="live-alert-header">
                  <span className="live-alert-tag"><IconFlame size={13} /> NEW SUBMISSION</span>
                  <span className="live-alert-time">Just now</span>
                </div>
                <h4 className="live-alert-title">{alert.title}</h4>
                <div className="live-alert-meta">
                  <span className="meta-pill cat">{alert.category}</span>
                  <span className={`meta-pill pri pri-${alert.priority}`}>{alert.priority}</span>
                  <span className="meta-sub">
                    {alert.isAnonymous ? (
                      <span className="sub-tag"><IconShieldLock size={13} /> Anonymous</span>
                    ) : (
                      <span className="sub-tag"><IconUser size={13} /> {alert.submitterName || 'Verified Student'}</span>
                    )}
                  </span>
                </div>
              </div>
              <div className="live-alert-actions">
                <button
                  type="button"
                  className="btn-view-alert"
                  onClick={() => {
                    setActiveTab('suggestions');
                    setSelectedSuggestion(alert);
                    setLiveAlerts(prev => prev.filter(a => a.alertId !== alert.alertId));
                  }}
                >
                  View
                </button>
                <button
                  type="button"
                  className="btn-dismiss-alert"
                  onClick={() => setLiveAlerts(prev => prev.filter(a => a.alertId !== alert.alertId))}
                  title="Dismiss alert"
                >
                  <IconX size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Date Range Modal */}
        {dateRangeModalOpen && (
          <>
            <div className="date-modal-overlay" onClick={() => setDateRangeModalOpen(false)} />
            <div className="date-range-modal">
              <div className="date-modal-header">
                <h3>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                  </svg>
                  Select Date Range
                </h3>
                <button className="close-modal-btn" onClick={() => setDateRangeModalOpen(false)}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
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
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z" />
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
                        <path d="M16.01 11H4v2h12.01v3L20 12l-3.99-4z" />
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
                          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
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
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          </button>
          <div className="mobile-brand">
            <div className="brand-logos-mobile">
              <img src="/ctu_logo.jpg" alt="CTU" className="brand-logo-seal" />
              <img src="/ssg-logo.png" alt="SSG" className="brand-logo-seal ssg" />
            </div>
            <div className="mobile-brand-text">
              <span className="mobile-title">InnoVoice</span>
              <span className="mobile-pill">Admin</span>
            </div>
          </div>
          <button className="mobile-refresh" onClick={() => { fetchStats(); fetchSuggestions(); }}>
            <IconRefresh size={20} />
          </button>
        </div>

        {/* Sidebar Overlay for Mobile */}
        <div
          className={`sidebar-overlay ${mobileSidebarOpen ? 'active' : ''}`}
          onClick={() => setMobileSidebarOpen(false)}
        />

        {/* Sidebar */}
        <aside
          className={`admin-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''} ${sidebarHovered ? 'sidebar-hovered' : 'sidebar-collapsed'}`}
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
        >
          <div className="sidebar-header">
            <div className="brand">
              <div className="brand-logos-pair">
                <img src="/ctu_logo.jpg" alt="CTU Logo" className="brand-logo-seal" />
                <img src="/ssg-logo.png" alt="SSG Logo" className="brand-logo-seal ssg" />
              </div>
              <div className="brand-text-block">
                <div className="brand-title-row">
                  <span className="brand-main-title">SSG InnoVoice</span>
                  <span className="brand-officer-pill">Admin</span>
                </div>
                <span className="brand-sub-tag">Student Suggestion Portal</span>
              </div>
            </div>
            <button
              className="close-sidebar mobile-only"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <IconX size={20} />
            </button>
          </div>

          {/* Quick Switch to Student Portal View */}
          <div className="portal-switch-wrapper">
            <button
              type="button"
              className="portal-switch-btn"
              onClick={() => navigate('/')}
              title="Switch to Student Portal (keeps admin session active)"
            >
              <span className="nav-icon-slot">
                <IconArrowLeft size={18} />
              </span>
              <span className="portal-switch-label">Switch to Student View</span>
            </button>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              title="Dashboard Overview"
            >
              <span className="nav-icon-slot">
                <IconLayoutDashboard size={20} />
              </span>
              <span className="nav-label">Overview</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'suggestions' ? 'active' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`}
              onClick={() => setActiveTab('suggestions')}
              title="Review Suggestions"
            >
              <span className="nav-icon-slot nav-icon-wrapper">
                <IconInbox size={20} />
                {unreadCount > 0 && <span className="unread-indicator">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </span>
              <span className="nav-label">Suggestions</span>
              <span className="nav-badge">{pagination.total}</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
              title="Activity Logs"
            >
              <span className="nav-icon-slot">
                <IconHistory size={20} />
              </span>
              <span className="nav-label">Activity Logs</span>
            </button>
          </nav>

          {/* Online Admins Section */}
          {onlineAdmins.length > 0 && (
            <div className="online-admins-section" title={`Online Officers (${onlineAdmins.length})`}>
              {/* Mini Collapsed Indicator */}
              <div className="online-collapsed-indicator">
                <div className="avatar-stack-mini">
                  {onlineAdmins.slice(0, 2).map((admin, idx) => (
                    <div
                      key={admin.label}
                      className="stack-avatar"
                      style={{
                        zIndex: 2 - idx,
                        marginLeft: idx > 0 ? '-8px' : '0',
                        background: admin.color || '#6366f1'
                      }}
                    >
                      {admin.picture ? (
                        <img src={admin.picture} alt={admin.label} referrerPolicy="no-referrer" />
                      ) : (
                        <span>{admin.label.charAt(0)}</span>
                      )}
                    </div>
                  ))}
                  <span className="online-pulse-dot" />
                </div>
              </div>

              {/* Expanded List Content */}
              <div className="online-expanded-content">
                <div className="online-header">
                  <span className="online-dot"></span>
                  <span className="online-title">Online Officers ({onlineAdmins.length})</span>
                </div>
                <div className="online-list">
                  {onlineAdmins.map(admin => (
                    <div key={admin.label} className="online-admin-item" title={`${admin.label}${admin.name ? ` (${admin.name})` : ''}`}>
                      {admin.picture ? (
                        <img src={admin.picture} alt={admin.label} className="online-avatar-img" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="online-avatar" style={{ background: admin.color || '#6366f1' }}>
                          {admin.label.charAt(0)}
                        </div>
                      )}
                      <div className="online-info">
                        <span className="online-name">{admin.label}</span>
                        {admin.name && <span className="online-sub">{admin.name}</span>}
                      </div>
                      {admin.label === adminInfo?.label && <span className="you-badge">You</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="sidebar-footer">
            {/* Synchronized Google Officer Profile Card */}
            <div className="sidebar-user-card" title={student?.name || adminInfo?.label || 'SSG Officer'}>
              <div className="user-avatar-wrap">
                {student?.picture || adminInfo?.picture ? (
                  <img
                    src={student?.picture || adminInfo?.picture}
                    alt={student?.name || 'Admin'}
                    className="user-google-avatar"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="user-fallback-avatar" style={{ background: adminInfo?.color || '#8b5cf6' }}>
                    {(student?.name || adminInfo?.label || 'A').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="online-pulse-dot" />
              </div>
              <div className="user-text-info">
                <span className="user-full-name">{student?.name || adminInfo?.label || 'SSG Officer'}</span>
                <span className="user-email-address">{student?.email || adminInfo?.email || 'Officer Session'}</span>
                <div
                  className="user-role-tag"
                  style={{
                    backgroundColor: `${adminInfo?.color || '#8b5cf6'}20`,
                    borderColor: `${adminInfo?.color || '#8b5cf6'}50`,
                    color: adminInfo?.color || '#a78bfa'
                  }}
                >
                  <IconShieldCheck size={12} />
                  <span>{adminInfo?.label || 'SSG Officer'}</span>
                </div>
              </div>
            </div>

            <div className="sidebar-footer-controls">
              {/* Utility Toggles Row */}
              <div className="sidebar-controls-row">
                {/* Sound Alert Toggle */}
                <button
                  type="button"
                  className={`sidebar-control-btn sound ${soundEnabled ? 'active' : 'muted'}`}
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  title={soundEnabled ? 'Live Audio Alerts: ON (Click to mute)' : 'Live Audio Alerts: MUTED (Click to unmute)'}
                >
                  <span className="control-icon">
                    {soundEnabled ? <IconVolume size={18} /> : <IconVolumeOff size={18} />}
                  </span>
                  <span className="control-label">{soundEnabled ? 'Sound' : 'Muted'}</span>
                </button>

                {/* Theme Toggle */}
                <button
                  type="button"
                  className={`sidebar-control-btn theme ${darkMode ? 'dark' : 'light'}`}
                  onClick={() => setDarkMode(!darkMode)}
                  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  <span className="control-icon">
                    {darkMode ? <IconMoon size={18} /> : <IconSun size={18} />}
                  </span>
                  <span className="control-label">{darkMode ? 'Dark' : 'Light'}</span>
                </button>
              </div>

              {/* Dedicated Sign Out Button */}
              <button 
                type="button" 
                className="sidebar-signout-btn" 
                onClick={handleLogout} 
                title="Sign out and end admin session"
              >
                <span className="control-icon">
                  <IconLogout size={18} className="signout-icon" />
                </span>
                <span className="signout-label">Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-main">

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            (statsLoading && !stats?.total) ? (
              <div className="dashboard-content">
                {renderDashboardSkeleton()}
              </div>
            ) : (
              <div className="dashboard-content">
                {/* Institutional Welcome Banner */}
              <div className="dashboard-welcome-banner">
                <div className="welcome-left">
                  <div className="welcome-badge">
                    <IconSchool size={14} />
                    <span>CTU Daanbantayan Campus • SSG Administration</span>
                  </div>
                  <h2 className="welcome-title">
                    Welcome back, {student?.name ? student.name.split(' ')[0] : (adminInfo?.label || 'Officer')}!
                  </h2>
                  <p className="welcome-subtitle">
                    Real-time overview of student feedback, voice suggestions, and institutional resolution metrics.
                  </p>
                </div>
                <div className="welcome-actions">
                  <button
                    type="button"
                    className="btn-quick-triage"
                    onClick={() => setActiveTab('suggestions')}
                  >
                    <IconInbox size={16} />
                    <span>Review Suggestions ({unreadCount})</span>
                  </button>

                  <div className="sync-control-group">
                    <div className="sync-status-badge">
                      <span className="sync-pulse-dot" />
                      <span className="sync-label">Live</span>
                      <span className="sync-time">{formatSyncedTime(lastSynced)}</span>
                    </div>

                    <button
                      type="button"
                      className={`btn-sync-action ${dashboardRefreshing ? 'refreshing' : ''}`}
                      disabled={dashboardRefreshing}
                      onClick={async () => {
                        setDashboardRefreshing(true);
                        await Promise.all([fetchStats(), fetchSuggestions()]);
                        setLastSynced(new Date());
                        setDashboardRefreshing(false);
                      }}
                      title="Sync latest suggestions & metrics"
                    >
                      <IconRefresh size={15} className={`sync-icon ${dashboardRefreshing ? 'spinning' : ''}`} />
                      <span>{dashboardRefreshing ? 'Syncing...' : 'Refresh'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Enhanced Stats Metrics Grid */}
              <div className="stats-grid">
                <div className="stat-card total">
                  <div className="stat-icon">
                    <IconInbox size={26} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{stats?.total ?? 0}</span>
                    <span className="stat-label">Total Submissions</span>
                  </div>
                  <span className="stat-chip total">All Time</span>
                </div>

                <div className="stat-card recent">
                  <div className="stat-icon">
                    <IconClock size={26} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{stats?.recentCount ?? 0}</span>
                    <span className="stat-label">Recent Submissions</span>
                  </div>
                  <span className="stat-chip recent">Last 7 Days</span>
                </div>

                <div className="stat-card resolution">
                  <div className="stat-icon">
                    <IconTrendingUp size={26} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">
                      {Math.round((((stats?.byStatus?.find(s => s._id === 'resolved')?.count || 0) + (stats?.byStatus?.find(s => s._id === 'action_taken')?.count || 0)) / (stats?.total || 1)) * 100)}%
                    </span>
                    <span className="stat-label">Resolution Rate</span>
                  </div>
                  <span className="stat-chip resolution">Actioned / Resolved</span>
                </div>

                <div className="stat-card anonymous">
                  <div className="stat-icon">
                    <IconShieldLock size={26} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{stats?.anonymousCount ?? 0}</span>
                    <span className="stat-label">Anonymous Voice</span>
                  </div>
                  <span className="stat-chip anonymous">Shielded Identity</span>
                </div>

                <div className="stat-card identified">
                  <div className="stat-icon">
                    <IconUser size={26} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{stats?.identifiedCount ?? 0}</span>
                    <span className="stat-label">Verified Students</span>
                  </div>
                  <span className="stat-chip identified">Direct Follow-up</span>
                </div>
              </div>

              <div className="charts-row">
                <div className="chart-card">
                  <h3>By Category</h3>
                  <div className="bar-chart">
                    {(stats?.byCategory || []).map(item => (
                      <div key={item._id} className="bar-item">
                        <span className="bar-label">{item._id}</span>
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{ width: `${(item.count / (stats?.total || 1)) * 100}%` }}
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
                    {(stats?.byStatus || []).map(item => {
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
            )
          )}

          {/* Suggestions Tab */}
          {activeTab === 'suggestions' && (
            <div className="suggestions-content">
              <div className="content-header suggestions-header-with-views">
                <div className="header-titles">
                  <h2>Manage Suggestions</h2>
                  <p className="header-subtitle">
                    {filters.view === 'trash'
                      ? 'Review and restore deleted suggestions before permanent deletion.'
                      : filters.view === 'archived'
                      ? 'Archived suggestions saved for official campus records.'
                      : 'Active student suggestions, concerns, and feedback.'}
                  </p>
                </div>

                {/* 3-View Segmented Switcher: Inbox, Archive, Trash */}
                <div className="suggestions-view-switcher">
                  <button
                    type="button"
                    className={`view-switch-btn ${filters.view === 'active' || !filters.view ? 'active' : ''}`}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, view: 'active' }));
                      setSelectedIds([]);
                      setSelectedSuggestion(null);
                    }}
                  >
                    <IconInbox size={16} />
                    <span>Inbox</span>
                    <span className="view-count-badge active">{stats?.activeCount ?? pagination.total}</span>
                  </button>

                  <button
                    type="button"
                    className={`view-switch-btn ${filters.view === 'archived' ? 'active' : ''}`}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, view: 'archived' }));
                      setSelectedIds([]);
                      setSelectedSuggestion(null);
                    }}
                  >
                    <IconArchive size={16} />
                    <span>Archived</span>
                    <span className="view-count-badge archived">{stats?.archivedCount ?? 0}</span>
                  </button>

                  <button
                    type="button"
                    className={`view-switch-btn trash ${filters.view === 'trash' ? 'active' : ''}`}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, view: 'trash' }));
                      setSelectedIds([]);
                      setSelectedSuggestion(null);
                    }}
                  >
                    <IconTrash size={16} />
                    <span>Trash</span>
                    <span className="view-count-badge trash">{stats?.trashCount ?? stats?.deletedCount ?? 0}</span>
                  </button>
                </div>
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
                      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
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
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
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
                      <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
                    </svg>
                    <span className="filter-value">
                      {filters.category === 'all' && filters.status === 'all'
                        ? 'All Filters'
                        : `${filters.category !== 'all' ? getCategoryInfo(filters.category).label : 'All'}${filters.status !== 'all' ? ` • ${getStatusInfo(filters.status).label}` : ''}`
                      }
                    </span>
                    {(filters.category !== 'all' || filters.status !== 'all') && (
                      <span className="active-filter-badge">{(filters.category !== 'all' ? 1 : 0) + (filters.status !== 'all' ? 1 : 0)}</span>
                    )}
                    <span className="filter-arrow">
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path fill="currentColor" d="M7 10l5 5 5-5z" />
                      </svg>
                    </span>
                  </div>

                  <div className="filter-dropdown">
                    <div className="filter-categories">
                      <div className="filter-section-title">
                        <span className="section-title-icon"><IconFolder size={14} /></span>
                        <span className="section-title-text">Category</span>
                      </div>
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
                          <span className="category-icon">{renderCategoryIcon(cat.value, 16)}</span>
                          <span className="category-label">{cat.label}</span>
                          {cat.value !== 'all' && (
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="arrow-icon">
                              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                            </svg>
                          )}
                          {filters.category === cat.value && filters.status === 'all' && (
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="check-icon">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Status Sub-menu */}
                    {hoveredCategory && hoveredCategory !== 'all' && (
                      <div className="filter-statuses">
                        <div className="filter-section-title">
                          <span className="section-title-icon">{renderCategoryIcon(hoveredCategory, 14)}</span>
                          <span className="section-title-text">{getCategoryInfo(hoveredCategory).label} Status</span>
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
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
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
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
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
                      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
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
                        <path fill="currentColor" d="M7 10l5 5 5-5z" />
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
                              <path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L12 10.66 10.48 12h.01L7.8 14.39c-.64.64-1.49.99-2.4.99-1.87 0-3.39-1.51-3.39-3.38S3.53 8.62 5.4 8.62c.91 0 1.76.35 2.44 1.03l1.13 1 1.51-1.34L9.22 8.2C8.2 7.18 6.84 6.62 5.4 6.62 2.42 6.62 0 9.04 0 12s2.42 5.38 5.4 5.38c1.44 0 2.8-.56 3.77-1.53l2.83-2.5.01.01L13.52 12h-.01l2.69-2.39c.64-.64 1.49-.99 2.4-.99 1.87 0 3.39 1.51 3.39 3.38s-1.52 3.38-3.39 3.38c-.9 0-1.76-.35-2.44-1.03l-1.14-1.01-1.51 1.34 1.27 1.12c1.02 1.01 2.37 1.57 3.82 1.57 2.98 0 5.4-2.41 5.4-5.38s-2.42-5.37-5.4-5.37z" />
                            </svg>
                          )}
                          {opt.icon === 'sun' && (
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
                            </svg>
                          )}
                          {opt.icon === 'clock' && (
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                            </svg>
                          )}
                          {opt.icon === 'week' && (
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z" />
                            </svg>
                          )}
                          {opt.icon === 'calendar' && (
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
                            </svg>
                          )}
                          {opt.icon === 'quarter' && (
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z" />
                            </svg>
                          )}
                          {opt.icon === 'year' && (
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                            </svg>
                          )}
                          {opt.icon === 'custom' && (
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm-4.5-7.5l-5 5-2.5-2.5 1.41-1.41 1.09 1.09 3.59-3.59z" />
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
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
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
                      <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
                    </svg>
                    <span className="select-value">
                      {SORT_OPTIONS.find(opt => opt.value === filters.sort)?.label || 'Newest First'}
                    </span>
                    <span className="select-arrow">
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path fill="currentColor" d="M7 10l5 5 5-5z" />
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
                    <span className="select-icon">
                      {renderIdentityIcon(filters.identity, 16)}
                    </span>
                    <span className="select-value">
                      {IDENTITY_OPTIONS.find(opt => opt.value === filters.identity)?.label || 'All Submissions'}
                    </span>
                    <span className="select-arrow">
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path fill="currentColor" d="M7 10l5 5 5-5z" />
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
                        <span className="identity-icon">{renderIdentityIcon(opt.value, 16)}</span>
                        <span>{opt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clear Filters Button placed right beside the filters bar */}
                {(filters.category !== 'all' || filters.status !== 'all' || filters.datePreset !== 'all' || filters.search || filters.identity !== 'all') && (
                  <button
                    type="button"
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
                    title="Reset all applied filters"
                  >
                    <IconX size={15} />
                    <span>Clear Filters</span>
                  </button>
                )}
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
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                          </svg>
                          Cancel
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
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
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          Deselect All
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                            <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                          </svg>
                          Select All
                        </>
                      )}
                    </button>
                  )}

                  <span className="results-count">
                    {pagination.total > 0 ? (
                      pagination.pages === 1 ? (
                        <>
                          <strong>{pagination.total}</strong>{' '}
                          {filters.view === 'trash' ? 'trashed ' : (filters.view === 'archived' ? 'archived ' : 'active ')}
                          suggestion{pagination.total !== 1 ? 's' : ''}
                        </>
                      ) : (
                        <>
                          Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                          <strong>{pagination.total.toLocaleString()}</strong>{' '}
                          {filters.view === 'trash' ? 'trashed ' : (filters.view === 'archived' ? 'archived ' : 'active ')}
                          suggestions
                        </>
                      )
                    ) : (
                      filters.view === 'trash'
                        ? 'Trash is empty'
                        : filters.view === 'archived'
                        ? 'No archived suggestions'
                        : 'No active suggestions found'
                    )}
                  </span>

                  {/* Empty Trash Action Button (Shown only in Trash View when items exist) */}
                  {filters.view === 'trash' && (stats?.trashCount > 0 || suggestions.length > 0) && (
                    <button
                      type="button"
                      className="btn-empty-trash"
                      onClick={() => setEmptyTrashModalOpen(true)}
                      title="Permanently empty all items in trash"
                    >
                      <IconTrashX size={15} />
                      <span>Empty Trash</span>
                    </button>
                  )}
                </div>
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
                      <IconX size={16} />
                      Cancel
                    </button>

                    {filters.view === 'trash' ? (
                      <>
                        <button
                          className="bulk-btn restore-btn"
                          onClick={() => {
                            setBulkActionType('restore');
                            setBulkDeleteModalOpen(true);
                          }}
                        >
                          <IconArrowBackUp size={16} />
                          Restore {selectedIds.length}
                        </button>
                        <button
                          className="bulk-btn delete-btn danger"
                          onClick={() => {
                            setBulkActionType('permanent');
                            setBulkDeleteModalOpen(true);
                          }}
                        >
                          <IconTrashX size={16} />
                          Delete Permanently
                        </button>
                      </>
                    ) : (
                      <button
                        className="bulk-btn delete-btn"
                        onClick={() => {
                          setBulkActionType('trash');
                          setBulkDeleteModalOpen(true);
                        }}
                      >
                        <IconTrash size={16} />
                        Move {selectedIds.length} to Trash
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="suggestions-layout">
                {/* Suggestions List */}
                <div className="suggestions-list">
                  {isLoading && suggestions.length === 0 ? (
                    renderSuggestionsSkeleton()
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
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                              </span>
                            </label>
                          )}
                          {unread && <span className="unread-dot" />}
                          <div className="card-header">
                            <span className="tracking-code">{suggestion.trackingCode}</span>
                            <span
                              className="priority-badge"
                              style={{
                                background: priorityInfo.bg || priorityInfo.color,
                                color: priorityInfo.text || '#ffffff',
                                border: priorityInfo.border || 'none'
                              }}
                            >
                              {priorityInfo.label}
                            </span>
                          </div>
                          <h4 className="card-title">{suggestion.title}</h4>
                          <div className="card-meta">
                            <span className="category">
                              <span className="category-icon">{renderCategoryIcon(suggestion.category, 14)}</span>
                              <span className="category-text">{getCategoryInfo(suggestion.category).label}</span>
                            </span>
                            <span
                              className="status-badge"
                              style={{
                                background: statusInfo.bg || statusInfo.color,
                                color: statusInfo.text || '#ffffff',
                                border: statusInfo.border || 'none'
                              }}
                            >
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="card-footer">
                            <span className="date">{formatDate(suggestion.createdAt)}</span>
                            <div className="footer-right">
                              {suggestion.imageUrl && (
                                <span className="photo-indicator" title="Photo attachment included">
                                  <IconEye size={13} />
                                  <span>Photo</span>
                                </span>
                              )}
                              {suggestion.isAnonymous ? (
                                <span className="submitter-chip anonymous" title="Submitted Anonymously">
                                  <IconShieldLock size={12} />
                                  <span>Anonymous</span>
                                </span>
                              ) : (
                                <span className="submitter-chip verified" title={suggestion.submitter?.email ? `Verified: ${suggestion.submitter.email}` : 'Verified Submitter'}>
                                  <IconUser size={12} />
                                  <span>{suggestion.submitter?.name ? suggestion.submitter.name.split(' ')[0] : 'Identified'}</span>
                                </span>
                              )}
                            </div>
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
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                          </svg>
                        </button>
                      </div>

                      <div className="detail-scroll-content">
                        {/* Hero Card - Title, Priority & Status */}
                        <div className="detail-hero-card">
                          <div className="hero-top">
                            <span className={`priority-badge priority-${selectedSuggestion.priority}`}>
                              <span className="priority-dot" style={{ background: getPriorityInfo(selectedSuggestion.priority).color }} />
                              {selectedSuggestion.priority?.toUpperCase()}
                            </span>
                            <span
                              className="status-badge-hero"
                              style={{
                                background: getStatusInfo(selectedSuggestion.status).bg || getStatusInfo(selectedSuggestion.status).color,
                                color: getStatusInfo(selectedSuggestion.status).text || '#ffffff',
                                border: getStatusInfo(selectedSuggestion.status).border || 'none'
                              }}
                            >
                              {getStatusInfo(selectedSuggestion.status).label}
                            </span>
                          </div>
                          <h2 className="hero-title">{selectedSuggestion.title}</h2>
                          <div className="hero-meta">
                            <span className="meta-item">
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                              </svg>
                              {selectedSuggestion.trackingCode}
                            </span>
                            <span className="meta-item">
                              {getCategoryInfo(selectedSuggestion.category).icon} {getCategoryInfo(selectedSuggestion.category).label}
                            </span>
                            <span className="meta-item">
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                              </svg>
                              {formatDate(selectedSuggestion.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Quick Actions Bar */}
                        <div className="quick-actions-bar">
                          {filters.view === 'trash' ? (
                            <>
                              {/* Trash View: Restore + Delete Permanently */}
                              <button
                                className="quick-action-btn restore-btn"
                                onClick={() => restoreSuggestion(selectedSuggestion._id)}
                              >
                                <IconArrowBackUp size={18} />
                                Restore to Inbox
                              </button>
                              {selectedSuggestion.imageUrl && (
                                <button
                                  className="quick-action-btn photo-btn"
                                  onClick={() => setPhotoModalOpen(true)}
                                >
                                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                  </svg>
                                  View Evidence
                                </button>
                              )}
                              <button
                                className="quick-action-btn danger-btn"
                                onClick={() => {
                                  setPendingDelete(selectedSuggestion);
                                  setDeleteModalAction('permanent');
                                  setDeleteModalOpen(true);
                                }}
                              >
                                <IconTrashX size={18} />
                                Delete Permanently
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Active / Archive View: Archive toggle + Move to Trash */}
                              <button
                                className={`quick-action-btn ${selectedSuggestion.isArchived ? 'archived' : ''}`}
                                onClick={() => archiveSuggestion(selectedSuggestion._id)}
                              >
                                {selectedSuggestion.isArchived ? (
                                  <IconArchiveOff size={18} />
                                ) : (
                                  <IconArchive size={18} />
                                )}
                                {selectedSuggestion.isArchived ? 'Unarchive' : 'Archive'}
                              </button>
                              {selectedSuggestion.imageUrl && (
                                <button
                                  className="quick-action-btn photo-btn"
                                  onClick={() => setPhotoModalOpen(true)}
                                >
                                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                  </svg>
                                  View Evidence
                                </button>
                              )}
                              <button
                                className="quick-action-btn delete-btn"
                                onClick={() => {
                                  setPendingDelete(selectedSuggestion);
                                  setDeleteModalAction('trash');
                                  setDeleteModalOpen(true);
                                }}
                              >
                                <IconTrash size={18} />
                                Move to Trash
                              </button>
                            </>
                          )}
                        </div>

                        {/* Content Card */}
                        <div className="detail-card content-card">
                          <div className="card-header">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            </svg>
                            <span>Suggestion Details</span>
                          </div>
                          <div className="card-body">
                            <p className="content-text">{selectedSuggestion.content}</p>
                          </div>
                        </div>

                        {/* Submitter Information Card */}
                        <div className="detail-card submitter-card">
                          <div className="card-header">
                            {selectedSuggestion.isAnonymous ? (
                              <>
                                <IconShieldLock size={18} />
                                <span>Student Identity Status</span>
                              </>
                            ) : (
                              <>
                                <IconUser size={18} />
                                <span>Verified Submitter Information</span>
                              </>
                            )}
                          </div>
                          <div className="card-body">
                            {selectedSuggestion.isAnonymous ? (
                              <div className="anonymous-identity-box">
                                <div className="identity-shield-icon">
                                  <IconShieldLock size={28} />
                                </div>
                                <div className="identity-shield-text">
                                  <h4>Anonymous Submission</h4>
                                  <p>The student selected full anonymity. Personal information was withheld from this submission record to protect their privacy.</p>
                                </div>
                              </div>
                            ) : (
                              <div className="submitter-profile-layout">
                                <div className="submitter-avatar-badge">
                                  {(selectedSuggestion.submitter?.name || 'S').charAt(0).toUpperCase()}
                                </div>
                                <div className="submitter-details-grid">
                                  {selectedSuggestion.submitter?.name && (
                                    <div className="submitter-field">
                                      <span className="field-title">Full Name</span>
                                      <span className="field-content">{selectedSuggestion.submitter.name}</span>
                                    </div>
                                  )}
                                  {selectedSuggestion.submitter?.email && (
                                    <div className="submitter-field">
                                      <span className="field-title">Email Address</span>
                                      <a href={`mailto:${selectedSuggestion.submitter.email}`} className="field-content email-link">
                                        <IconMail size={13} />
                                        <span>{selectedSuggestion.submitter.email}</span>
                                      </a>
                                    </div>
                                  )}
                                  {selectedSuggestion.submitter?.studentId && (
                                    <div className="submitter-field">
                                      <span className="field-title">Student ID</span>
                                      <span className="field-content code-text">{selectedSuggestion.submitter.studentId}</span>
                                    </div>
                                  )}
                                  {selectedSuggestion.submitter?.course && (
                                    <div className="submitter-field">
                                      <span className="field-title">Program / Course</span>
                                      <span className="field-content">{selectedSuggestion.submitter.course}</span>
                                    </div>
                                  )}
                                  {selectedSuggestion.submitter?.yearLevel && (
                                    <div className="submitter-field">
                                      <span className="field-title">Year Level</span>
                                      <span className="field-content">{selectedSuggestion.submitter.yearLevel}</span>
                                    </div>
                                  )}
                                  {selectedSuggestion.submitter?.contactNumber && (
                                    <div className="submitter-field">
                                      <span className="field-title">Contact Number</span>
                                      <span className="field-content">{selectedSuggestion.submitter.contactNumber}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status & Priority Controls */}
                        <div className="controls-grid">
                          <div className="detail-card control-card">
                            <div className="card-header">
                              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
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
                                <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
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
                                    <span className="pill-dot" style={{ background: opt.color }}></span>
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
                                <path d="M13 3a9 9 0 00-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0013 21a9 9 0 000-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
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

          {/* Activity Logs & Audit Trail Tab */}
          {activeTab === 'activity' && (
            <div className="activity-content">
              <div className="content-header">
                <div className="header-title-group">
                  <h2>Activity Logs & History</h2>
                  {(activityStats?.totalLogs || activityStats?.total) > 0 && (
                    <span className="header-counter-pill">{(activityStats.totalLogs || activityStats.total).toLocaleString()} total activities</span>
                  )}
                </div>
                <div className="header-actions">
                  {/* View Mode Switcher */}
                  <div className="activity-view-switcher">
                    <button
                      type="button"
                      className={`view-mode-btn ${activityViewMode === 'timeline' ? 'active' : ''}`}
                      onClick={() => setActivityViewMode('timeline')}
                      title="Timeline View"
                    >
                      <IconTimeline size={16} />
                      <span>Timeline</span>
                    </button>
                    <button
                      type="button"
                      className={`view-mode-btn ${activityViewMode === 'table' ? 'active' : ''}`}
                      onClick={() => setActivityViewMode('table')}
                      title="Table View"
                    >
                      <IconTable size={16} />
                      <span>Table</span>
                    </button>
                  </div>

                  {/* Export CSV Button */}
                  <button
                    type="button"
                    className="export-logs-btn"
                    onClick={exportActivityLogsCSV}
                    title="Export activity logs to CSV"
                  >
                    <IconDownload size={16} />
                    <span>Export CSV</span>
                  </button>

                  {/* Developer Cleanup Modal */}
                  {adminInfo?.role === 'developer' && (
                    <button
                      className="cleanup-btn"
                      onClick={async () => {
                        setCleanupModalOpen(true);
                        setDeprecatedLogsCount(null);
                        try {
                          const res = await adminFetch(`${API_URL}/api/admin/activity-logs/deprecated-count`);
                          const data = await res.json();
                          if (data.success) {
                            setDeprecatedLogsCount(data.count);
                          }
                        } catch (error) {
                          console.error('Error fetching deprecated count:', error);
                        }
                      }}
                    >
                      <IconTrash size={15} />
                      <span>Cleanup Logs</span>
                    </button>
                  )}

                  {/* Refresh Button */}
                  <button
                    className={`refresh-btn ${activityRefreshing ? 'refreshing' : ''}`}
                    disabled={activityRefreshing}
                    onClick={async () => {
                      setActivityRefreshing(true);
                      await Promise.all([fetchActivityLogs(), fetchActivityStats()]);
                      setActivityRefreshing(false);
                      showNotification('Activity feed refreshed');
                    }}
                  >
                    <IconRefresh size={16} className="refresh-icon" />
                    <span>{activityRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                </div>
              </div>

              {/* Activity Stats Row */}
              {activityStats && (
                <div className="activity-stats-row">
                  <div className="activity-stat-card compact total">
                    <div className="stat-icon total">
                      <IconActivity size={20} />
                    </div>
                    <div className="stat-info">
                      <span className="stat-value">{(activityStats.totalLogs ?? activityStats.total ?? 0).toLocaleString()}</span>
                      <span className="stat-label">Total Logs</span>
                    </div>
                  </div>
                  <div className="activity-stat-card compact today">
                    <div className="stat-icon today">
                      <IconSun size={20} />
                    </div>
                    <div className="stat-info">
                      <span className="stat-value">{(activityStats.todayCount ?? 0).toLocaleString()}</span>
                      <span className="stat-label">Today</span>
                    </div>
                  </div>
                  <div className="activity-stat-card compact week">
                    <div className="stat-icon week">
                      <IconCalendar size={20} />
                    </div>
                    <div className="stat-info">
                      <span className="stat-value">{(activityStats.weekCount ?? 0).toLocaleString()}</span>
                      <span className="stat-label">This Week</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Filter Category Chips */}
              <div className="activity-quick-chips">
                {[
                  { id: 'all', label: 'All Activities', icon: <IconActivity size={14} />, actions: 'all' },
                  { id: 'status', label: 'Status & Priority', icon: <IconArrowsExchange size={14} />, actions: 'update_status' },
                  { id: 'triage', label: 'Trash & Deletions', icon: <IconTrash size={14} />, actions: 'delete_suggestion' },
                  { id: 'auth', label: 'Officer Sign-ins', icon: <IconLogin size={14} />, actions: 'login' },
                  { id: 'bulk', label: 'Bulk Actions', icon: <IconChecklist size={14} />, actions: 'bulk_delete' }
                ].map(chip => (
                  <button
                    key={chip.id}
                    type="button"
                    className={`quick-chip ${activityCategoryFilter === chip.id ? 'active' : ''}`}
                    onClick={() => {
                      setActivityCategoryFilter(chip.id);
                      setActivityFilters(prev => ({ ...prev, action: chip.actions }));
                    }}
                  >
                    {chip.icon}
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>

              {/* Admin Activity Breakdown */}
              {activityStats && activityStats.byAdmin && activityStats.byAdmin.length > 0 && (
                <div className="admin-breakdown">
                  <h3 className="breakdown-title">
                    <IconUser size={16} />
                    <span>Activity Share by Officer</span>
                  </h3>
                  <div className="breakdown-cards">
                    {activityStats.byAdmin.map(admin => {
                      const adminColor = getAdminColor(admin._id);
                      const isSelected = activityFilters.adminRole === admin._id;
                      return (
                        <div
                          key={admin._id}
                          className={`breakdown-card ${isSelected ? 'active' : ''}`}
                          onClick={() => setActivityFilters(prev => ({
                            ...prev,
                            adminRole: prev.adminRole === admin._id ? 'all' : admin._id
                          }))}
                          style={{ '--admin-color': adminColor }}
                        >
                          <div className="breakdown-avatar" style={{ background: adminColor }}>
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
                                width: `${Math.max(6, (admin.count / (activityStats.totalLogs || 1)) * 100)}%`,
                                background: adminColor
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Activity Filters Toolbar */}
              <div className="activity-filters">
                {/* Search Input */}
                <div className={`search-input-wrapper ${activitySearchExpanded || activityFilters.search ? 'expanded' : ''}`}>
                  <button
                    className="search-toggle"
                    onClick={() => setActivitySearchExpanded(!activitySearchExpanded)}
                    title="Search activity logs"
                  >
                    <IconSearch size={18} />
                  </button>
                  <input
                    type="text"
                    placeholder="Search tracking code (#TRK-XXXX) or report title..."
                    value={activityFilters.search}
                    onChange={(e) => setActivityFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                  {activityFilters.search && (
                    <button
                      className="search-clear"
                      onClick={() => {
                        setActivityFilters(prev => ({ ...prev, search: '' }));
                      }}
                      title="Clear search"
                    >
                      <IconX size={14} />
                    </button>
                  )}
                </div>

                <div className="filter-group">
                  <select
                    value={activityFilters.adminRole}
                    onChange={(e) => setActivityFilters(prev => ({ ...prev, adminRole: e.target.value }))}
                    className="activity-filter-select"
                  >
                    <option value="all">All Officers</option>
                    <option value="executive">Executive</option>
                    <option value="press_secretary">Press Secretary</option>
                    <option value="network_secretary">Secretary on Networks</option>
                    <option value="developer">Developer</option>
                  </select>

                  <select
                    value={activityFilters.action}
                    onChange={(e) => {
                      setActivityFilters(prev => ({ ...prev, action: e.target.value }));
                      setActivityCategoryFilter('all');
                    }}
                    className="activity-filter-select"
                  >
                    <option value="all">All Actions</option>
                    <option value="login">Officer Sign-ins</option>
                    <option value="logout">Officer Sign-outs</option>
                    <option value="view_suggestion">Viewed Suggestions</option>
                    <option value="update_status">Status Updates</option>
                    <option value="update_priority">Priority Updates</option>
                    <option value="archive_suggestion">Archived Suggestions</option>
                    <option value="unarchive_suggestion">Unarchived Suggestions</option>
                    <option value="delete_suggestion">Moved to Trash</option>
                    <option value="restore_suggestion">Restored from Trash</option>
                    <option value="permanent_delete">Permanently Deleted</option>
                    <option value="bulk_delete">Bulk Actions</option>
                    <option value="mark_read">Marked as Read</option>
                  </select>

                  {/* Date Preset Dropdown */}
                  <div className={`custom-select date-select ${activityDateDropdownOpen ? 'open' : ''} ${activityFilters.datePreset === 'custom' ? 'has-custom-range' : ''}`}>
                    <div
                      className="select-trigger"
                      onClick={() => setActivityDateDropdownOpen(!activityDateDropdownOpen)}
                    >
                      <span className="select-icon">
                        <IconCalendar size={16} />
                      </span>
                      <span className="select-value">
                        {activityFilters.datePreset === 'custom' && activityFilters.dateFrom && activityFilters.dateTo
                          ? `${new Date(activityFilters.dateFrom).toLocaleDateString()} - ${new Date(activityFilters.dateTo).toLocaleDateString()}`
                          : DATE_PRESETS.find(d => d.value === activityFilters.datePreset)?.label || 'All Time'}
                      </span>
                      <span className="select-arrow">
                        <IconChevronDown size={16} />
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
                              <div className="date-option-content">
                                <span className="date-option-label">{preset.label}</span>
                                <span className="date-option-desc">{preset.desc}</span>
                              </div>
                              {activityFilters.datePreset === preset.value && (
                                <div className="date-option-check">
                                  <IconCheck size={14} />
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
                        <IconCalendar size={22} />
                        Select Date Range
                      </h3>
                      <button className="close-modal-btn" onClick={() => setActivityDateModalOpen(false)}>
                        <IconX size={20} />
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
                            <IconChevronRight size={20} />
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

              {/* Feed Content: Timeline Mode vs Table Mode */}
              {activityLoading && activityLogs.length === 0 ? (
                renderActivityLogsSkeleton()
              ) : activityLogs.length === 0 ? (
                <div className="empty-logs">
                  <IconHistory size={48} />
                  <h3>No activity logs found</h3>
                  <p>Try adjusting your search criteria, role filters, or date range.</p>
                </div>
              ) : activityViewMode === 'timeline' ? (
                /* ================= TIMELINE MODE ================= */
                <div className="activity-timeline">
                  <div className="timeline-container">
                    {activityLogs.map((log, index) => {
                      const adminColor = getAdminColor(log.adminRole);
                      const badge = getActionBadge(log.action);
                      const relativeTime = formatRelativeTime(log.createdAt);
                      const exactDate = formatDate(log.createdAt);
                      const avatarUrl = getLogAdminAvatar(log);
                      const adminName = getLogAdminName(log);
                      const roleLabel = log.adminLabel || log.adminRole?.replace('_', ' ');

                      return (
                        <div
                          key={log._id || log.id || `act-log-${index}`}
                          className="timeline-item"
                          style={{ '--delay': `${index * 0.04}s` }}
                          onClick={() => setInspectingLog(log)}
                        >
                          <div className="timeline-line">
                            <div className="timeline-dot" style={{ background: adminColor }}>
                              <div className="dot-pulse" style={{ background: adminColor }} />
                            </div>
                          </div>
                          <div className="timeline-content">
                            <div className="timeline-card">
                              <div className="timeline-header">
                                <div className="timeline-avatar" style={{ background: adminColor }}>
                                  {avatarUrl ? (
                                    <img
                                      src={avatarUrl}
                                      alt={adminName}
                                      className="timeline-avatar-img"
                                      referrerPolicy="no-referrer"
                                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                  ) : (
                                    <span>{(adminName || 'A').charAt(0).toUpperCase()}</span>
                                  )}
                                </div>
                                <div className="timeline-meta">
                                  <div className="timeline-actor-row">
                                    <span className="timeline-admin" style={{ color: darkMode ? '#f8fafc' : '#1e293b' }}>
                                      {adminName}
                                    </span>
                                    <span className="timeline-role-pill" style={{ borderColor: adminColor, color: adminColor }}>
                                      {roleLabel}
                                    </span>
                                  </div>
                                  <div className="timeline-badge-row">
                                    <span
                                      className="action-semantic-badge"
                                      style={{ color: badge.color, background: badge.bg, borderColor: badge.border }}
                                    >
                                      {badge.icon}
                                      <span>{badge.label}</span>
                                    </span>
                                  </div>
                                </div>
                                <div className="timeline-time-block" title={exactDate}>
                                  <IconClock size={13} />
                                  <span className="timeline-relative-time">{relativeTime}</span>
                                  <span className="timeline-exact-time">{exactDate}</span>
                                </div>
                              </div>

                              {(log.suggestionTrackingCode || (log.details && Object.keys(log.details).length > 0)) && (
                                <div className="timeline-body">
                                  {log.suggestionTrackingCode && (
                                    <div className="timeline-target">
                                      <span className="tracking-code-pill">#{log.suggestionTrackingCode}</span>
                                      {log.suggestionTitle && (
                                        <span className="suggestion-title">{log.suggestionTitle}</span>
                                      )}
                                    </div>
                                  )}
                                  {log.details && Object.keys(log.details).length > 0 && (
                                    <div className="timeline-details">
                                      {log.details.oldStatus && log.details.newStatus && (
                                        <span className="detail-diff status">
                                          <span className="diff-from">{log.details.oldStatus}</span>
                                          <IconChevronRight size={13} className="diff-arrow" />
                                          <span className="diff-to">{log.details.newStatus}</span>
                                        </span>
                                      )}
                                      {log.details.oldPriority && log.details.newPriority && (
                                        <span className="detail-diff priority">
                                          <IconFlame size={13} />
                                          <span className="diff-from">{log.details.oldPriority}</span>
                                          <IconChevronRight size={13} className="diff-arrow" />
                                          <span className="diff-to">{log.details.newPriority}</span>
                                        </span>
                                      )}
                                      {log.details.count && (
                                        <span className="detail-diff bulk">
                                          <IconChecklist size={13} />
                                          <span>{log.details.count} submissions affected</span>
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="timeline-card-footer">
                                <span className="inspect-hint">Click to view details</span>
                                {log.suggestionTrackingCode && (
                                  <button
                                    type="button"
                                    className="quick-open-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenReportFromLog(log);
                                    }}
                                  >
                                    <IconExternalLink size={13} />
                                    <span>View Suggestion</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* ================= COMPACT AUDIT TABLE MODE ================= */
                <div className="activity-table-wrapper">
                  <table className="activity-audit-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Officer</th>
                        <th>Action</th>
                        <th>Related Suggestion</th>
                        <th>Details</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityLogs.map((log, index) => {
                        const adminColor = getAdminColor(log.adminRole);
                        const badge = getActionBadge(log.action);
                        const relativeTime = formatRelativeTime(log.createdAt);
                        const exactDate = formatDate(log.createdAt);
                        const avatarUrl = getLogAdminAvatar(log);
                        const adminName = getLogAdminName(log);
                        const roleLabel = log.adminLabel || log.adminRole?.replace('_', ' ');

                        return (
                          <tr
                            key={log._id || log.id || `table-log-${index}`}
                            onClick={() => setInspectingLog(log)}
                            className="audit-table-row"
                          >
                            <td className="table-col-time" title={exactDate}>
                              <div className="time-primary">{relativeTime}</div>
                              <div className="time-secondary">{exactDate}</div>
                            </td>
                            <td className="table-col-actor">
                              <div className="table-actor-wrap">
                                <div className="table-actor-avatar" style={{ background: adminColor }}>
                                  {avatarUrl ? (
                                    <img
                                      src={avatarUrl}
                                      alt={adminName}
                                      className="timeline-avatar-img"
                                      referrerPolicy="no-referrer"
                                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                  ) : (
                                    <span>{(adminName || 'A').charAt(0).toUpperCase()}</span>
                                  )}
                                </div>
                                <div className="table-actor-info">
                                  <span className="table-actor-name">{adminName}</span>
                                  <span className="table-actor-role">{roleLabel}</span>
                                </div>
                              </div>
                            </td>
                            <td className="table-col-action">
                              <span
                                className="action-semantic-badge"
                                style={{ color: badge.color, background: badge.bg, borderColor: badge.border }}
                              >
                                {badge.icon}
                                <span>{badge.label}</span>
                              </span>
                            </td>
                            <td className="table-col-target">
                              {log.suggestionTrackingCode ? (
                                <div className="table-target-info">
                                  <span className="tracking-code-pill">#{log.suggestionTrackingCode}</span>
                                  <span className="table-target-title" title={log.suggestionTitle}>
                                    {log.suggestionTitle || 'Suggestion Report'}
                                  </span>
                                </div>
                              ) : (
                                <span className="table-target-none">—</span>
                              )}
                            </td>
                            <td className="table-col-details">
                              {log.details && (log.details.oldStatus || log.details.oldPriority || log.details.count) ? (
                                <div className="table-diff-wrap">
                                  {log.details.oldStatus && log.details.newStatus && (
                                    <span className="detail-diff status">
                                      <span>{log.details.oldStatus}</span>
                                      <IconChevronRight size={11} />
                                      <span className="diff-to">{log.details.newStatus}</span>
                                    </span>
                                  )}
                                  {log.details.oldPriority && log.details.newPriority && (
                                    <span className="detail-diff priority">
                                      <span>{log.details.oldPriority}</span>
                                      <IconChevronRight size={11} />
                                      <span className="diff-to">{log.details.newPriority}</span>
                                    </span>
                                  )}
                                  {log.details.count && (
                                    <span className="detail-diff bulk">
                                      <span>{log.details.count} items</span>
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="table-diff-none">—</span>
                              )}
                            </td>
                            <td className="table-col-actions" style={{ textAlign: 'right' }}>
                              <button
                                type="button"
                                className="table-inspect-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInspectingLog(log);
                                }}
                              >
                                <IconInfoCircle size={15} />
                                <span>View Details</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Activity Pagination */}
              {activityPagination.pages > 1 && (
                <div className="activity-pagination-footer">
                  <span className="page-summary">
                    Showing page {activityPagination.page} of {activityPagination.pages} ({activityPagination.total} logs)
                  </span>
                  <div className="pagination-controls">
                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={activityPagination.page === 1}
                      onClick={() => setActivityPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      <IconChevronLeft size={16} />
                      <span>Previous</span>
                    </button>
                    <div className="page-number-pill">{activityPagination.page} / {activityPagination.pages}</div>
                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={activityPagination.page === activityPagination.pages}
                      onClick={() => setActivityPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      <span>Next</span>
                      <IconChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Top-Level Event Inspector Drawer / Modal (outside transform-containing layout) */}
        {inspectingLog && (
          <div className="event-inspector-overlay" onClick={() => setInspectingLog(null)}>
            <div className="event-inspector-modal" onClick={(e) => e.stopPropagation()}>
              <div className="inspector-header">
                <div className="inspector-title-wrap">
                  <div className="inspector-icon-tile">
                    <IconShieldCheck size={22} className="shield-icon" />
                  </div>
                  <div className="inspector-header-info">
                    <h3>Activity Details</h3>
                    <span className="event-id">Event ID: <code>{inspectingLog._id || inspectingLog.id || 'N/A'}</code></span>
                  </div>
                </div>
                <button className="inspector-close-btn" onClick={() => setInspectingLog(null)} aria-label="Close Details">
                  <IconX size={18} />
                </button>
              </div>

              <div className="inspector-body">
                {/* Officer Identity Card */}
                <div className="inspector-section">
                  <h4 className="section-title">
                    <IconShield size={16} />
                    <span>Officer</span>
                  </h4>
                  <div className="inspector-officer-card">
                    {(() => {
                      const avatarUrl = getLogAdminAvatar(inspectingLog);
                      const adminName = getLogAdminName(inspectingLog);
                      const roleLabel = inspectingLog.adminLabel || inspectingLog.adminRole?.replace('_', ' ');

                      return (
                        <>
                          <div className="officer-avatar-box">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={adminName}
                                className="officer-avatar-img"
                                referrerPolicy="no-referrer"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            ) : (
                              <span className="officer-avatar-fallback">{(adminName || 'A').charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="officer-details">
                            <div className="officer-name">{adminName}</div>
                            <div className="officer-role-pill">{roleLabel?.toUpperCase()}</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Event Action & Badges */}
                <div className="inspector-section">
                  <h4 className="section-title">
                    <IconActivity size={16} />
                    <span>Action Taken</span>
                  </h4>
                  <div className="inspector-action-box">
                    {(() => {
                      const b = getActionBadge(inspectingLog.action);
                      return (
                        <div className="action-name-display">
                          <span className="action-icon-wrap" style={{ color: b.color || '#9F1239' }}>
                            {b.icon}
                          </span>
                          <span className="action-label-text">{b.label}</span>
                        </div>
                      );
                    })()}
                    <div className="action-raw-badge">
                      <span className="raw-label">Action Key:</span>
                      <code>{inspectingLog.action}</code>
                    </div>
                  </div>
                </div>

                {/* Target Suggestion Report */}
                {inspectingLog.suggestionTrackingCode && (
                  <div className="inspector-section">
                    <h4 className="section-title">
                      <IconInbox size={16} />
                      <span>Related Suggestion</span>
                    </h4>
                    <div className="inspector-target-card">
                      <div className="target-tracking">
                        <span className="tracking-code-pill large">#{inspectingLog.suggestionTrackingCode}</span>
                      </div>
                      <div className="target-title">{inspectingLog.suggestionTitle || 'No title provided'}</div>
                      <button
                        type="button"
                        className="target-navigate-btn"
                        onClick={() => handleOpenReportFromLog(inspectingLog)}
                      >
                        <IconExternalLink size={16} />
                        <span>View Suggestion</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Before / After State Changes */}
                {inspectingLog.details && Object.keys(inspectingLog.details).length > 0 && (
                  <div className="inspector-section">
                    <h4 className="section-title">
                      <IconArrowsExchange size={16} />
                      <span>Changes Made (Before & After)</span>
                    </h4>
                    <div className="inspector-diff-grid">
                      {inspectingLog.details.oldStatus && inspectingLog.details.newStatus && (
                        <div className="diff-card">
                          <div className="diff-card-title">Status Change</div>
                          <div className="diff-values-row">
                            <div className="diff-box old">
                              <span className="box-label">OLD</span>
                              <span className="box-value">{inspectingLog.details.oldStatus}</span>
                            </div>
                            <IconChevronRight size={18} className="diff-arrow" />
                            <div className="diff-box new">
                              <span className="box-label">NEW</span>
                              <span className="box-value">{inspectingLog.details.newStatus}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {inspectingLog.details.oldPriority && inspectingLog.details.newPriority && (
                        <div className="diff-card">
                          <div className="diff-card-title">Priority Change</div>
                          <div className="diff-values-row">
                            <div className="diff-box old">
                              <span className="box-label">OLD</span>
                              <span className="box-value">{inspectingLog.details.oldPriority}</span>
                            </div>
                            <IconChevronRight size={18} className="diff-arrow" />
                            <div className="diff-box new">
                              <span className="box-label">NEW</span>
                              <span className="box-value">{inspectingLog.details.newPriority}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {inspectingLog.details.count && (
                        <div className="diff-card full">
                          <div className="diff-card-title">Submissions Affected</div>
                          <div className="diff-count-value">{inspectingLog.details.count} records affected</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Timestamp & Security Context */}
                <div className="inspector-section">
                  <h4 className="section-title">
                    <IconClock size={16} />
                    <span>Date & Time Recorded</span>
                  </h4>
                  <div className="inspector-metadata-grid">
                    <div className="meta-item">
                      <span className="meta-label">Date & Time:</span>
                      <span className="meta-value date-val">{formatDate(inspectingLog.createdAt)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Time Passed:</span>
                      <span className="meta-value age-val">{formatRelativeTime(inspectingLog.createdAt)}</span>
                    </div>
                    <div className="meta-item iso-item">
                      <span className="meta-label">System Timestamp:</span>
                      <span className="meta-value iso-val"><code>{new Date(inspectingLog.createdAt).toISOString()}</code></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="inspector-footer">
                <button
                  type="button"
                  className="inspector-done-btn"
                  onClick={() => setInspectingLog(null)}
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 1. Single Suggestion Delete / Move to Trash Modal */}
        {deleteModalOpen && pendingDelete && (
          <div className="delete-modal-overlay" onClick={() => { setDeleteModalOpen(false); setPendingDelete(null); setTrashReason(''); }}>
            <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="delete-modal-icon">
                <div className="icon-circle">
                  {deleteModalAction === 'permanent' ? <IconTrashX size={36} /> : <IconTrash size={36} />}
                </div>
              </div>
              <div className="delete-modal-content">
                <h3>{deleteModalAction === 'permanent' ? 'Delete Permanently?' : 'Move to Trash?'}</h3>
                <p>
                  {deleteModalAction === 'permanent'
                    ? 'This action cannot be undone. All suggestion data and attachments will be permanently deleted from the system.'
                    : 'This suggestion will be moved to the Trash bin. An update notice will be shown to the student if they check their tracking code.'}
                </p>
                <div className="delete-preview-card">
                  <div className="preview-header">
                    <span className="tracking-code">#{pendingDelete.trackingCode}</span>
                    <span className="category">
                      <span className="category-icon">{getCategoryInfo(pendingDelete.category).icon}</span>
                      {getCategoryInfo(pendingDelete.category).label}
                    </span>
                  </div>
                  <h4>{pendingDelete.title}</h4>
                  <p className="preview-content">{pendingDelete.content?.substring(0, 90)}...</p>
                </div>

                {deleteModalAction !== 'permanent' && (
                  <div className="trash-dismissal-box">
                    <label htmlFor="trash-dismissal-reason">
                      <IconInfoCircle size={14} />
                      <span>Reason for moving to Trash (Optional):</span>
                    </label>
                    <div className="reason-chips">
                      {TRASH_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`reason-chip ${trashReason === preset.text ? 'active' : ''}`}
                          onClick={() => setTrashReason(preset.text)}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <input
                      id="trash-dismissal-reason"
                      type="text"
                      className="trash-reason-input"
                      placeholder="e.g. Duplicate suggestion or forwarded to university administration..."
                      value={trashReason}
                      onChange={(e) => setTrashReason(e.target.value)}
                    />
                    <span className="trash-hint">
                      Students tracking this code will be able to see this reason.
                    </span>
                  </div>
                )}
              </div>
              <div className="delete-modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => { setDeleteModalOpen(false); setPendingDelete(null); setTrashReason(''); }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="confirm-delete-btn"
                  onClick={() => {
                    if (deleteModalAction === 'permanent') {
                      permanentDeleteSuggestion(pendingDelete._id);
                    } else {
                      moveToTrash(pendingDelete._id, trashReason);
                    }
                  }}
                >
                  {deleteModalAction === 'permanent' ? 'Delete Permanently' : 'Move to Trash'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Bulk Suggestion Actions Modal */}
        {bulkDeleteModalOpen && selectedIds.length > 0 && (
          <div className="delete-modal-overlay" onClick={() => setBulkDeleteModalOpen(false)}>
            <div className="delete-confirm-modal bulk-delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="delete-modal-icon">
                <div className="icon-circle bulk">
                  {bulkActionType === 'restore' ? (
                    <IconArrowBackUp size={36} />
                  ) : bulkActionType === 'permanent' ? (
                    <IconTrashX size={36} />
                  ) : (
                    <IconTrash size={36} />
                  )}
                </div>
              </div>
              <div className="delete-modal-content">
                <h3>
                  {bulkActionType === 'restore'
                    ? `Restore ${selectedIds.length} Suggestion(s)?`
                    : bulkActionType === 'permanent'
                    ? `Permanently Delete ${selectedIds.length} Suggestion(s)?`
                    : `Move ${selectedIds.length} Suggestion(s) to Trash?`}
                </h3>
                <p>
                  {bulkActionType === 'restore'
                    ? `These ${selectedIds.length} suggestion(s) will be restored back to your Inbox.`
                    : bulkActionType === 'permanent'
                    ? `Warning: This will permanently delete ${selectedIds.length} suggestion(s). This action cannot be undone.`
                    : `These ${selectedIds.length} suggestion(s) will be moved to the Trash bin.`}
                </p>
              </div>
              <div className="delete-modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setBulkDeleteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="confirm-delete-btn"
                  style={bulkActionType === 'restore' ? { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' } : {}}
                  onClick={handleBulkAction}
                >
                  {bulkActionType === 'restore'
                    ? 'Restore Suggestions'
                    : bulkActionType === 'permanent'
                    ? 'Delete Permanently'
                    : 'Move to Trash'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Empty Trash Bin Modal */}
        {emptyTrashModalOpen && (
          <div className="delete-modal-overlay" onClick={() => setEmptyTrashModalOpen(false)}>
            <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="delete-modal-icon">
                <div className="icon-circle">
                  <IconTrashX size={36} />
                </div>
              </div>
              <div className="delete-modal-content">
                <h3>Empty Trash Bin?</h3>
                <p>
                  Are you sure you want to permanently delete all items in the Trash bin? This action cannot be undone.
                </p>
              </div>
              <div className="delete-modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEmptyTrashModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="confirm-delete-btn"
                  onClick={handleEmptyTrash}
                >
                  Empty Trash Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. Update Status with Resolution Notes Modal */}
        {statusModalOpen && pendingStatus && selectedSuggestion && (
          <div className="status-modal-overlay" onClick={() => setStatusModalOpen(false)}>
            <div
              className="status-update-modal"
              onClick={(e) => e.stopPropagation()}
              style={{ '--status-color': pendingStatus.color }}
            >
              <div className="status-modal-header">
                <div className="status-modal-icon">
                  <IconArrowsExchange size={24} />
                </div>
                <div className="status-modal-title">
                  <h3>Update Suggestion Status</h3>
                  <p>
                    Report <strong>#{selectedSuggestion.trackingCode}</strong>
                  </p>
                </div>
                <button className="close-status-modal" onClick={() => setStatusModalOpen(false)}>
                  <IconX size={18} />
                </button>
              </div>
              <div className="status-modal-body">
                <div className="status-change-preview">
                  <div className="status-from">
                    <span className="status-label">Current</span>
                    <span
                      className="status-badge"
                      style={{
                        background: getStatusInfo(selectedSuggestion.status).bg || getStatusInfo(selectedSuggestion.status).color,
                        color: getStatusInfo(selectedSuggestion.status).text || '#ffffff',
                        border: getStatusInfo(selectedSuggestion.status).border || 'none'
                      }}
                    >
                      {getStatusInfo(selectedSuggestion.status).label}
                    </span>
                  </div>
                  <IconChevronRight size={24} className="status-arrow" />
                  <div className="status-to">
                    <span className="status-label">New Status</span>
                    <span
                      className="status-badge"
                      style={{
                        background: pendingStatus.bg || pendingStatus.color,
                        color: pendingStatus.text || '#ffffff',
                        border: pendingStatus.border || 'none'
                      }}
                    >
                      {pendingStatus.label}
                    </span>
                  </div>
                </div>

                <div className="note-input-section">
                  <label>
                    <IconFileText size={16} />
                    <span>{pendingStatus.value === 'rejected' ? 'Official Decline Reason (Visible to Student):' : 'Optional Resolution / Officer Note:'}</span>
                  </label>

                  {pendingStatus.value === 'rejected' && (
                    <div className="quick-reasons-group">
                      <span className="quick-reasons-label">
                        <IconInfoCircle size={14} />
                        <span>Select a quick decline reason:</span>
                      </span>
                      <div className="reason-chips">
                        {REJECTION_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={`reason-chip ${statusNote === preset.text ? 'active' : ''}`}
                            onClick={() => setStatusNote(preset.text)}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <textarea
                    placeholder={pendingStatus.value === 'rejected' ? "Explain why this suggestion was declined so the student understands..." : "Add internal notes or details on actions taken..."}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <div className="status-modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setStatusModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="confirm-btn"
                  style={{ '--btn-color': pendingStatus.color }}
                  onClick={() => {
                    updateStatus(selectedSuggestion._id, pendingStatus.value, statusNote);
                    setStatusModalOpen(false);
                  }}
                >
                  Confirm Status Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. Full Photo Evidence Modal */}
        {photoModalOpen && selectedSuggestion?.imageUrl && (
          <div className="photo-modal-overlay" onClick={() => setPhotoModalOpen(false)}>
            <div className="photo-modal" onClick={(e) => e.stopPropagation()}>
              <div className="photo-modal-header">
                <h3>Photo Evidence #{selectedSuggestion.trackingCode}</h3>
                <button className="photo-modal-close" onClick={() => setPhotoModalOpen(false)}>
                  <IconX size={20} />
                </button>
              </div>
              <div className="photo-modal-body">
                <img
                  src={
                    selectedSuggestion.imageUrl.startsWith('http')
                      ? selectedSuggestion.imageUrl
                      : `${API_URL}${selectedSuggestion.imageUrl}`
                  }
                  alt="Submission evidence attachment"
                />
              </div>
              <div className="photo-modal-footer">
                <a
                  href={
                    selectedSuggestion.imageUrl.startsWith('http')
                      ? selectedSuggestion.imageUrl
                      : `${API_URL}${selectedSuggestion.imageUrl}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="open-new-tab-btn"
                >
                  <IconExternalLink size={16} />
                  Open Full Resolution
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 6. Custom Date Range Filter Modal */}
        {dateRangeModalOpen && (
          <div className="date-modal-overlay" onClick={() => setDateRangeModalOpen(false)}>
            <div className="date-range-modal" onClick={(e) => e.stopPropagation()}>
              <div className="date-modal-header">
                <h3>
                  <IconCalendar size={20} />
                  <span>Custom Date Range Filter</span>
                </h3>
                <button className="close-modal-btn" onClick={() => setDateRangeModalOpen(false)}>
                  <IconX size={18} />
                </button>
              </div>
              <div className="date-modal-body">
                <div className="date-range-visual">
                  <div className={`date-picker-card ${tempDateFrom ? 'has-date' : ''}`}>
                    <div className="date-card-header">
                      <span className="date-label">START DATE</span>
                      <div className="date-icon"><IconCalendar size={16} /></div>
                    </div>
                    <input
                      type="date"
                      value={tempDateFrom}
                      onChange={(e) => setTempDateFrom(e.target.value)}
                    />
                    <div className="date-preview">
                      {tempDateFrom ? (
                        <>
                          <span className="day">{new Date(tempDateFrom).getDate()}</span>
                          <span className="month-year">
                            {new Date(tempDateFrom).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                        </>
                      ) : (
                        <span className="placeholder">Pick start date</span>
                      )}
                    </div>
                  </div>

                  <div className="date-connection">
                    <div className="connection-line">
                      <div className={`line-fill ${tempDateFrom && tempDateTo ? 'active' : ''}`} />
                    </div>
                    <div className={`connection-icon ${tempDateFrom && tempDateTo ? 'active' : ''}`}>
                      <IconCalendar size={18} />
                    </div>
                  </div>

                  <div className={`date-picker-card ${tempDateTo ? 'has-date' : ''}`}>
                    <div className="date-card-header">
                      <span className="date-label">END DATE</span>
                      <div className="date-icon"><IconCalendar size={16} /></div>
                    </div>
                    <input
                      type="date"
                      value={tempDateTo}
                      onChange={(e) => setTempDateTo(e.target.value)}
                    />
                    <div className="date-preview">
                      {tempDateTo ? (
                        <>
                          <span className="day">{new Date(tempDateTo).getDate()}</span>
                          <span className="month-year">
                            {new Date(tempDateTo).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                        </>
                      ) : (
                        <span className="placeholder">Pick end date</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="date-modal-footer">
                <button
                  type="button"
                  className="clear-btn"
                  onClick={() => {
                    setTempDateFrom('');
                    setTempDateTo('');
                    setFilters(prev => ({ ...prev, datePreset: 'all', dateFrom: '', dateTo: '' }));
                    setDateRangeModalOpen(false);
                  }}
                >
                  Reset to All Time
                </button>
                <button
                  type="button"
                  className="apply-btn"
                  onClick={() => {
                    if (tempDateFrom || tempDateTo) {
                      setFilters(prev => ({
                        ...prev,
                        datePreset: 'custom',
                        dateFrom: tempDateFrom ? `${tempDateFrom}T00:00:00.000Z` : '',
                        dateTo: tempDateTo ? `${tempDateTo}T23:59:59.999Z` : ''
                      }));
                    }
                    setDateRangeModalOpen(false);
                  }}
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 7. Developer Cleanup Modal */}
        {cleanupModalOpen && (
          <div className="delete-modal-overlay" onClick={() => setCleanupModalOpen(false)}>
            <div className="delete-confirm-modal cleanup-modal" onClick={(e) => e.stopPropagation()}>
              <div className="delete-modal-icon">
                <div className="icon-circle cleanup">
                  <IconTrash size={36} />
                </div>
              </div>
              <div className="delete-modal-content">
                <h3>Clean Up Outdated Logs</h3>
                <p>
                  Remove old and outdated activity logs recorded during earlier system updates.
                </p>
                <div className="cleanup-info">
                  <div className="cleanup-info-header">
                    <IconShieldCheck size={16} />
                    <span>System Maintenance</span>
                  </div>
                  {deprecatedLogsCount !== null && (
                    <p className="cleanup-count-text">
                      Found <strong>{deprecatedLogsCount}</strong> outdated log(s) ready for cleanup.
                    </p>
                  )}
                </div>
              </div>
              <div className="delete-modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setCleanupModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="confirm-delete-btn cleanup-confirm"
                  disabled={cleanupLoading}
                  onClick={async () => {
                    setCleanupLoading(true);
                    try {
                      const res = await adminFetch(`${API_URL}/api/admin/activity-logs/cleanup`, {
                        method: 'DELETE'
                      });
                      const data = await res.json();
                      if (data.success) {
                        showNotification(`Cleaned up ${data.deletedCount} outdated log(s)`, 'success');
                        setCleanupModalOpen(false);
                        fetchActivityLogs();
                        fetchActivityStats();
                      } else {
                        showNotification(data.message || 'Cleanup failed', 'error');
                      }
                    } catch (err) {
                      console.error('Cleanup error:', err);
                      showNotification('Cleanup failed', 'error');
                    } finally {
                      setCleanupLoading(false);
                    }
                  }}
                >
                  {cleanupLoading ? 'Cleaning...' : 'Clean Up Old Logs'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
