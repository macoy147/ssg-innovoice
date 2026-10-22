import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconSearch, 
  IconQrcode, 
  IconInfoCircle, 
  IconFolder, 
  IconFileText, 
  IconLayoutDashboard, 
  IconLogout 
} from '@tabler/icons-react';
import { useStudentAuth } from '../../context/StudentAuthContext';
import './StudentNavbar.scss';

const StudentNavbar = ({ onOpenTrack, onOpenQR, onOpenAbout }) => {
  const navigate = useNavigate();
  const { 
    student, 
    savedReports, 
    setIsMyReportsOpen, 
    loginWithGoogle, 
    logout 
  } = useStudentAuth();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [authError, setAuthError] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 480 : false);
  const menuRef = useRef(null);

  const avatarSrc = student?.picture || student?.avatarUrl;

  // Reset avatar error when student avatar URL changes
  useEffect(() => {
    setAvatarError(false);
  }, [student?.picture, student?.avatarUrl]);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Window resize listener for responsive Google button
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 480);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    if (credentialResponse?.credential) {
      setAuthError('');
      const res = await loginWithGoogle(credentialResponse.credential);
      if (!res.success) {
        setAuthError(res.message);
      }
    }
  };

  const handleGoogleError = () => {
    setAuthError('Google sign in was unsuccessful. Please try again.');
  };

  return (
    <header className="student-navbar">
      <div className="navbar-container">
        {/* Brand / Dual Logo Emblems */}
        <div className="navbar-brand">
          <div className="brand-logos">
            <img src="/ctu_logo.jpg" alt="CTU Logo" className="brand-logo-img ctu" />
            <img src="/ssg-logo.png" alt="SSG Logo" className="brand-logo-img ssg" />
          </div>
          <div className="brand-title-wrap">
            <div className="brand-top-row">
              <h1 className="brand-title">SSG InnoVoice</h1>
              <span className="brand-badge">CTU Daanbantayan</span>
            </div>
            <span className="brand-tagline">Speak Ideas. Spark Change.</span>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="navbar-actions">
          {/* Quick Track Code Button */}
          <button 
            type="button" 
            className="nav-btn nav-btn-outline" 
            onClick={onOpenTrack}
            title="Track existing suggestion"
          >
            <IconSearch size={16} className="btn-icon-svg" />
            <span className="btn-text">Track Code</span>
          </button>

          {/* QR Code Share Button */}
          <button 
            type="button" 
            className="nav-btn nav-btn-ghost" 
            onClick={onOpenQR}
            title="Show QR Code"
          >
            <IconQrcode size={16} className="btn-icon-svg" />
            <span className="btn-text">QR Code</span>
          </button>

          {/* About Modal */}
          <button 
            type="button" 
            className="nav-btn nav-btn-ghost" 
            onClick={onOpenAbout}
            title="About InnoVoice"
          >
            <IconInfoCircle size={16} className="btn-icon-svg" />
            <span className="btn-text">About</span>
          </button>

          {/* User Section */}
          {student ? (
            <div className="user-section" ref={menuRef}>
              {/* My Reports Quick Button */}
              <button 
                type="button" 
                className="my-reports-btn"
                onClick={() => setIsMyReportsOpen(true)}
              >
                <IconFolder size={16} className="reports-icon-svg" />
                <span className="reports-label">My Reports</span>
                {savedReports.length > 0 && (
                  <span className="reports-badge">{savedReports.length}</span>
                )}
              </button>

              {/* User Avatar Button */}
              <button 
                type="button" 
                className="user-avatar-btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                aria-label="Student Account Menu"
              >
                {avatarSrc && !avatarError ? (
                  <img 
                    src={avatarSrc} 
                    alt={student.name || 'Student Profile'} 
                    className="avatar-img"
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {(student.name || student.email || 'S').charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div 
                    className="profile-dropdown"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="dropdown-header">
                      <div className="dropdown-user-row">
                        <div className="dropdown-avatar">
                          {avatarSrc && !avatarError ? (
                            <img 
                              src={avatarSrc} 
                              alt={student.name || 'Student Profile'} 
                              className="dropdown-avatar-img"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="dropdown-avatar-placeholder">
                              {(student.name || student.email || 'S').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="dropdown-user-details">
                          <p className="user-name">{student.name || 'Student'}</p>
                          <p className="user-email">{student.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="dropdown-divider" />

                    <button 
                      type="button"
                      className="dropdown-item"
                      onClick={() => {
                        setIsMyReportsOpen(true);
                        setIsProfileMenuOpen(false);
                      }}
                    >
                      <IconFileText size={16} className="item-icon-svg" />
                      <span>My Saved Reports ({savedReports.length})</span>
                    </button>

                    {student?.isAdmin && (
                      <>
                        <div className="dropdown-divider" />
                        <button 
                          type="button"
                          className="dropdown-item dropdown-admin-item"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            navigate('/admin');
                          }}
                        >
                          <div className="admin-item-content">
                            <div className="admin-item-left">
                              <IconLayoutDashboard size={16} className="item-icon-svg admin-icon" />
                              <span className="admin-title">Admin Dashboard</span>
                            </div>
                            <span 
                              className="admin-role-pill" 
                              style={{ 
                                borderColor: student.adminColor ? `${student.adminColor}50` : '#6366f150',
                                background: student.adminColor ? `${student.adminColor}18` : '#6366f118',
                                color: student.adminColor || '#818cf8' 
                              }}
                            >
                              {student.adminLabel || 'Officer'}
                            </span>
                          </div>
                        </button>
                      </>
                    )}

                    <div className="dropdown-divider" />

                    <button 
                      type="button"
                      className="dropdown-item dropdown-logout"
                      onClick={() => {
                        logout();
                        setIsProfileMenuOpen(false);
                      }}
                    >
                      <IconLogout size={16} className="item-icon-svg" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="google-auth-container">
              {googleClientId && googleClientId !== 'your_google_client_id.apps.googleusercontent.com' ? (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="medium"
                  shape={isMobile ? "circle" : "pill"}
                  type={isMobile ? "icon" : "standard"}
                  text="signin_with"
                  locale="en"
                />
              ) : (
                <button 
                  type="button" 
                  className="google-signin-btn-mock"
                  onClick={() => alert('Google Sign-In ready! To connect live Google accounts, please set VITE_GOOGLE_CLIENT_ID in client/.env and server/.env.')}
                  title="Sign in with Google"
                >
                  <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span className="google-btn-text">Sign in with Google</span>
                </button>
              )}
              {authError && <span className="auth-error-msg">{authError}</span>}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default StudentNavbar;
