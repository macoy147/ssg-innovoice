import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './TrackSuggestion.scss';
import API_URL from '../../config/api';

const TrackSuggestion = ({ isOpen, onClose }) => {
  const [trackingCode, setTrackingCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState(null);

  const statusConfig = {
    submitted: { label: 'Submitted', color: '#6b7280', icon: '📝', step: 1 },
    under_review: { label: 'Under Review', color: '#f59e0b', icon: '🔍', step: 2 },
    forwarded: { label: 'Forwarded', color: '#3b82f6', icon: '📤', step: 3 },
    action_taken: { label: 'Action Taken', color: '#8b5cf6', icon: '⚡', step: 4 },
    resolved: { label: 'Resolved', color: '#22c55e', icon: '✅', step: 5 },
    rejected: { label: 'Rejected', color: '#ef4444', icon: '❌', step: -1 }
  };

  const categoryLabels = {
    academic: { label: 'Academic Services', icon: '📚' },
    administrative: { label: 'Administrative Matters', icon: '🏛️' },
    extracurricular: { label: 'Extracurricular Activities', icon: '🎭' },
    general: { label: 'General Improvements', icon: '💡' }
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    
    if (!trackingCode.trim()) {
      setError('Please enter a tracking code');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuggestion(null);

    try {
      const response = await axios.get(
        `${API_URL}/api/suggestions/track/${trackingCode.trim().toUpperCase()}`
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
            <div className="header-icon">🔍</div>
            <div className="header-text">
              <h2>Track Your Suggestion</h2>
              <p>Enter your tracking code to check the status</p>
            </div>
            <button className="close-btn" onClick={handleClose} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 4L16 16M4 16L16 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
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
                placeholder="Enter tracking code (e.g., VISI-XXXXX-XXXX)"
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
                <motion.div 
                  className="error-icon"
                  animate={{ 
                    rotate: [0, -10, 10, -10, 10, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 0.5,
                    delay: 0.2
                  }}
                >
                  ⚠️
                </motion.div>
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
                <div className={`status-banner status-${suggestion.status}`}>
                  <span className="status-icon">{statusConfig[suggestion.status]?.icon}</span>
                  <span className="status-label">{statusConfig[suggestion.status]?.label}</span>
                </div>

                {/* Progress Timeline */}
                {suggestion.status !== 'rejected' && (
                  <div className="progress-timeline">
                    {['submitted', 'under_review', 'forwarded', 'action_taken', 'resolved'].map((status, index) => {
                      const currentStep = getStatusStep(suggestion.status);
                      const stepNum = index + 1;
                      const isCompleted = stepNum < currentStep;
                      const isCurrent = stepNum === currentStep;
                      
                      return (
                        <div key={status} className="timeline-step">
                          <div className={`step-dot ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                            {isCompleted ? '✓' : stepNum}
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
                      <span className="category-badge">
                        <span>{categoryLabels[suggestion.category]?.icon}</span>
                        {categoryLabels[suggestion.category]?.label}
                      </span>
                      <span className="tracking-code">{suggestion.trackingCode}</span>
                    </div>
                    
                    <h3 className="suggestion-title">{suggestion.title}</h3>
                    
                    <div className="suggestion-content">
                      <p>{suggestion.content}</p>
                    </div>

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

                {/* Action Button */}
                <button className="new-search-btn" onClick={() => {
                  setSuggestion(null);
                  setTrackingCode('');
                }}>
                  Track Another Suggestion
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TrackSuggestion;
