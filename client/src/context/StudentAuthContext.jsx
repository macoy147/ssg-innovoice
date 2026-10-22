import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_URL from '../config/api';

const StudentAuthContext = createContext(null);
const TOKEN_STORAGE_KEY = 'innovoice_student_jwt_token';
const USER_STORAGE_KEY = 'innovoice_student_profile';

export const StudentAuthProvider = ({ children }) => {
  // Initialize student from localStorage so state persists immediately across refreshes
  const [student, setStudent] = useState(() => {
    try {
      const cached = localStorage.getItem(USER_STORAGE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [savedReports, setSavedReports] = useState([]);
  const [isReportsLoading, setIsReportsLoading] = useState(false);
  const [isMyReportsOpen, setIsMyReportsOpen] = useState(false);

  // Helper to retrieve auth header
  const getAuthHeaders = () => {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
      return {};
    }
  };

  // Check auth session on mount or refresh
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_URL}/api/auth/student/me`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });

      if (res.data?.success && res.data.student) {
        setStudent(res.data.student);
        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data.student));
        } catch (e) {}
      } else if (res.data?.success && res.data.student === null) {
        // Token was invalid or revoked on server
        setStudent(null);
        try {
          localStorage.removeItem(USER_STORAGE_KEY);
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        } catch (e) {}
      }
    } catch (err) {
      // On network error, keep cached profile so offline/flicker doesn't kick user out
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Fetch reports when student is authenticated
  const fetchMyReports = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!student && !token) {
      setSavedReports([]);
      return [];
    }

    try {
      setIsReportsLoading(true);
      const res = await axios.get(`${API_URL}/api/student/my-reports`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      if (res.data?.success) {
        setSavedReports(res.data.data || []);
        return res.data.data;
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch saved reports', err);
      return [];
    } finally {
      setIsReportsLoading(false);
    }
  }, [student]);

  useEffect(() => {
    if (student) {
      fetchMyReports();
    } else {
      setSavedReports([]);
    }
  }, [student, fetchMyReports]);

  // Login with Google credential token (JWT)
  const loginWithGoogle = async (credential) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/student/google`, 
        { credential },
        { withCredentials: true }
      );

      if (res.data?.success && res.data.student) {
        setStudent(res.data.student);
        try {
          if (res.data.token) {
            localStorage.setItem(TOKEN_STORAGE_KEY, res.data.token);
          }
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data.student));
        } catch (e) {
          console.warn('LocalStorage unavailable', e);
        }
        return { success: true, student: res.data.student };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to sign in with Google';
      return { success: false, message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/student/logout`, {}, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      try {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
      } catch (e) {}
      setStudent(null);
      setSavedReports([]);
      setIsMyReportsOpen(false);
    }
  };

  // Manually bookmark a tracking code
  const bookmarkCode = async (trackingCode) => {
    if (!student) return { success: false, message: 'Please sign in first' };
    try {
      const res = await axios.post(`${API_URL}/api/student/save-code`, 
        { trackingCode },
        { 
          headers: getAuthHeaders(),
          withCredentials: true 
        }
      );
      if (res.data?.success) {
        await fetchMyReports();
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Failed to save code' };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to save code' 
      };
    }
  };

  // Remove a saved tracking code
  const removeSavedCode = async (trackingCode) => {
    if (!student) return { success: false };
    try {
      const res = await axios.delete(`${API_URL}/api/student/save-code/${trackingCode}`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      if (res.data?.success) {
        setSavedReports(prev => prev.filter(r => r.trackingCode !== trackingCode));
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to remove' };
    }
  };

  return (
    <StudentAuthContext.Provider
      value={{
        student,
        isLoading,
        savedReports,
        isReportsLoading,
        isMyReportsOpen,
        setIsMyReportsOpen,
        loginWithGoogle,
        logout,
        fetchMyReports,
        bookmarkCode,
        removeSavedCode,
        checkAuthStatus,
        getAuthHeaders
      }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
};

export const useStudentAuth = () => {
  const context = useContext(StudentAuthContext);
  if (!context) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
};

export default StudentAuthContext;
