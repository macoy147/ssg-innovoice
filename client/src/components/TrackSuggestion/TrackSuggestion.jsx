import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconSearch, 
  IconAlertCircle, 
  IconCheck, 
  IconFileText, 
  IconEye, 
  IconSend, 
  IconBolt, 
  IconCircleCheck, 
  IconX,
  IconSchool,
  IconBuildingBank,
  IconUsersGroup,
  IconBulb,
  IconPhoto,
  IconX as IconClose,
  IconArchive,
  IconCircleX,
  IconInfoCircle
} from '@tabler/icons-react';
import axios from 'axios';
import './TrackSuggestion.scss';
import API_URL from '../../config/api';

const statusConfig = {
  submitted: { label: 'Submitted', color: '#9ca3af', Icon: IconFileText, step: 1 },
  under_review: { label: 'Under Review', color: '#f59e0b', Icon: IconEye, step: 2 },
  forwarded: { label: 'Forwarded', color: '#3b82f6', Icon: IconSend, step: 3 },
  action_taken: { label: 'Action Taken', color: '#8b5cf6', Icon: IconBolt, step: 4 },
  resolved: { label: 'Resolved', color: '#22c55e', Icon: IconCircleCheck, step: 5 },
  rejected: { label: 'Declined / Closed', color: '#ef4444', Icon: IconCircleX, step: -1 },
  dismissed: { label: 'Dismissed from Queue', color: '#64748b', Icon: IconArchive, step: -2 },
  purged: { label: 'Archived / Closed', color: '#64748b', Icon: IconArchive, step: -2 }
};

const categoryConfig = {
  academic: { label: 'Academic Services', Icon: IconSchool },
  administrative: { label: 'Administrative Matters', Icon: IconBuildingBank },
  extracurricular: { label: 'Extracurricular Activities', Icon: IconUsersGroup },
  general: { label: 'General Improvements', Icon: IconBulb }
};

const TrackSuggestion = ({ isOpen, onClose, initialCode = '' }) => {
  const [trackingCode, setTrackingCode] = useState(initialCode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState(null);

  const fetchSuggestion = useCallback(async (codeToTrack) => {
    if (!codeToTrack || !codeToTrack.trim()) return;

    setIsLoading(true);
    setError('');
    setSuggestion(null);

    try {
      const response = await axios.get(
        `${API_URL}/api/suggestions/track/${codeToTrack.trim().toUpperCase()}`
      );

      if (response.data.success) {
        setSuggestion(response.data.data);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No suggestion found with this tracking code. Please check and try again.');
      } else {
        setError('Unable to track suggestion. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (initialCode) {
        setTrackingCode(initialCode);
        fetchSuggestion(initialCode);
      }
    } else {
      setTrackingCode('');
      setError('');
      setSuggestion(null);
    }
  }, [isOpen, initialCode, fetchSuggestion]);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingCode.trim()) {
      setError('Please enter a tracking code');
      return;
    }
    fetchSuggestion(trackingCode);
  };

  const handleClose = () => {
    setTrackingCode('');
    setError('');
    setSuggestion(null);
    onClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusStep = (status) => {
    return statusConfig[status]?.step || 1;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="track-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="track-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="track-modal-header">
            <div className="header-icon">
              <IconSearch size={22} color="#fca5a5" />
            </div>
            <div className="header-text">
              <h2>Track Suggestion</h2>
              <p>Enter your tracking code to view status and timeline updates</p>
            </div>
            <button className="close-btn" onClick={handleClose} aria-label="Close">
              <IconClose size={20} />
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleTrack} className="track-form">
            <div className="input-group">
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => {
                  setTrackingCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="Enter tracking code (e.g. VISI-XXXXX-XXXX)"
                className={error ? 'error' : ''}
                autoFocus
              />
              <button type="submit" disabled={isLoading} className="track-btn">
                {isLoading ? (
                  <span className="spinner"></span>
                ) : (
                  'Track'
                )}
              </button>
            </div>
            {error && (
              <motion.div 
                className="error-notification"
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 500,
                    damping: 25
                  }
                }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
              >
                <IconAlertCircle size={18} className="error-icon-svg" />
                <p>{error}</p>
              </motion.div>
            )}
          </form>

          {/* Results */}
          <AnimatePresence mode="wait">
            {suggestion && (
              <motion.div
                className="track-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Status Badge */}
                {(() => {
                  const statusInfo = statusConfig[suggestion.status] || statusConfig.submitted;
                  const StatusIcon = statusInfo.Icon;
                  return (
                    <div className={`status-banner status-${suggestion.status}`}>
                      <StatusIcon size={18} className="status-icon" />
                      <span className="status-label">{statusInfo.label}</span>
                    </div>
                  );
                })()}

                {/* Institutional Notice Banner for Closed / Dismissed / Rejected Reports */}
                {['rejected', 'dismissed', 'purged'].includes(suggestion.status) && (
                  <div className={`institutional-notice-banner notice-${suggestion.status}`}>
                    <div className="notice-header">
                      <div className="notice-badge">
                        {suggestion.status === 'rejected' ? (
                          <>
                            <IconCircleX size={18} />
                            <span>Official Resolution: Declined / Closed</span>
                          </>
                        ) : (
                          <>
                            <IconArchive size={18} />
                            <span>Administrative Notice: Dismissed from Queue</span>
                          </>
                        )}
                      </div>
                      <span className="notice-date">
                        {formatDate(suggestion.dismissedAt || suggestion.purgedAt || suggestion.updatedAt)}
                      </span>
                    </div>
                    <div className="notice-body">
                      <p className="notice-reason-title">Official Reason from SSG:</p>
                      <p className="notice-reason-text">
                        {suggestion.dismissalReason || suggestion.rejectionReason || "This suggestion was reviewed and closed by SSG administration."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Progress Timeline */}
                {!['rejected', 'dismissed', 'purged'].includes(suggestion.status) && (
                  <div className="progress-timeline">
                    {['submitted', 'under_review', 'forwarded', 'action_taken', 'resolved'].map((status, index) => {
                      const currentStep = getStatusStep(suggestion.status);
                      const stepNum = index + 1;
                      const isCompleted = stepNum < currentStep;
                      const isCurrent = stepNum === currentStep;
                      
                      return (
                        <div key={status} className="timeline-step">
                          <div className={`step-dot ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                            {isCompleted ? <IconCheck size={12} strokeWidth={3} /> : stepNum}
                          </div>
                          <span className={`step-label ${isCompleted || isCurrent ? 'active' : ''}`}>
                            {statusConfig[status]?.label}
                          </span>
                          {index < 4 && (
                            <div className={`step-line ${isCompleted ? 'completed' : ''}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Suggestion Details */}
                <div className="suggestion-details">
                  <div className="detail-card">
                    <div className="detail-header">
                      {(() => {
                        const catInfo = categoryConfig[suggestion.category] || categoryConfig.general;
                        const CatIcon = catInfo.Icon;
                        return (
                          <span className="category-badge">
                            <CatIcon size={14} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
                            {catInfo.label}
                          </span>
                        );
                      })()}
                      <span className="tracking-code">{suggestion.trackingCode}</span>
                    </div>
                    
                    <h3 className="suggestion-title">{suggestion.title}</h3>
                    
                    <div className="suggestion-content">
                      <p>{suggestion.content}</p>
                    </div>

                    {suggestion.imageUrl && (
                      <div className="suggestion-evidence-preview">
                        <span className="evidence-label">
                          <IconPhoto size={14} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
                          Attached Evidence:
                        </span>
                        <a href={suggestion.imageUrl} target="_blank" rel="noopener noreferrer" className="evidence-link">
                          <img src={suggestion.imageUrl} alt="Evidence" className="evidence-thumb" />
                        </a>
                      </div>
                    )}

                    <div className="detail-footer">
                      <div className="footer-item">
                        <span className="label">Submitted:</span>
                        <span className="value">{formatDate(suggestion.createdAt)}</span>
                      </div>
                      {suggestion.updatedAt !== suggestion.createdAt && (
                        <div className="footer-item">
                          <span className="label">Last Updated:</span>
                          <span className="value">{formatDate(suggestion.updatedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status History */}
                  {suggestion.statusHistory && suggestion.statusHistory.length > 0 && (
                    <div className="status-history">
                      <h4>Status History</h4>
                      <div className="history-list">
                        {suggestion.statusHistory.map((history, index) => (
                          <div key={index} className="history-item">
                            <div className={`history-dot dot-${history.status}`}></div>
                            <div className="history-content">
                              <span className={`history-status status-${history.status}`}>
                                {statusConfig[history.status]?.label || history.status}
                              </span>
                              <span className="history-date">
                                {formatDate(history.changedAt)}
                              </span>
                              {history.notes && (
                                <p className="history-notes">{history.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TrackSuggestion;
