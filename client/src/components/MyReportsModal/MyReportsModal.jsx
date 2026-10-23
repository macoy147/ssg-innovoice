import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconFolder, 
  IconShieldCheck, 
  IconSearch, 
  IconPlus, 
  IconCopy, 
  IconCheck, 
  IconHistory, 
  IconTrash, 
  IconRefresh, 
  IconInbox, 
  IconX,
  IconSchool,
  IconBuildingBank,
  IconUsersGroup,
  IconBulb,
  IconFileText,
  IconEye,
  IconSend,
  IconBolt,
  IconCircleCheck,
  IconAlertTriangle,
  IconArchive
} from '@tabler/icons-react';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { useBodyScrollLock } from '../../utils/scrollLock';
import './MyReportsModal.scss';

const statusConfig = {
  submitted: { label: 'Submitted', color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.15)', Icon: IconFileText },
  under_review: { label: 'Under Review', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', Icon: IconEye },
  forwarded: { label: 'Forwarded', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', Icon: IconSend },
  action_taken: { label: 'Action Taken', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', Icon: IconBolt },
  resolved: { label: 'Resolved', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', Icon: IconCircleCheck },
  rejected: { label: 'Declined / Closed', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', Icon: IconX },
  dismissed: { label: 'Dismissed', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)', Icon: IconArchive },
  purged: { label: 'Dismissed', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)', Icon: IconArchive },
  not_found: { label: 'Archived / Removed', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', Icon: IconArchive }
};

const categoryConfig = {
  academic: { label: 'Academic Services', Icon: IconSchool },
  administrative: { label: 'Administrative Matters', Icon: IconBuildingBank },
  extracurricular: { label: 'Extracurricular Activities', Icon: IconUsersGroup },
  general: { label: 'General Improvements', Icon: IconBulb }
};

const MyReportsModal = ({ isOpen, onClose, onTrackCode }) => {
  useBodyScrollLock(isOpen);

  const { 
    student, 
    savedReports, 
    isReportsLoading, 
    fetchMyReports, 
    bookmarkCode, 
    removeSavedCode 
  } = useStudentAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [newCodeInput, setNewCodeInput] = useState('');
  const [isAddingCode, setIsAddingCode] = useState(false);
  const [addFeedback, setAddFeedback] = useState({ message: '', isError: false });
  const [copiedCode, setCopiedCode] = useState(null);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Always fetch latest reports from backend when modal is opened
  useEffect(() => {
    if (isOpen) {
      fetchMyReports();
    }
  }, [isOpen, fetchMyReports]);

  if (!isOpen) return null;

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleConfirmRemove = async () => {
    if (!reportToDelete) return;
    setIsRemoving(true);
    await removeSavedCode(reportToDelete.trackingCode);
    setIsRemoving(false);
    setReportToDelete(null);
  };

  const handleAddCodeSubmit = async (e) => {
    e.preventDefault();
    if (!newCodeInput.trim()) return;

    setIsAddingCode(true);
    setAddFeedback({ message: '', isError: false });

    const res = await bookmarkCode(newCodeInput.trim());
    setIsAddingCode(false);

    if (res.success) {
      setAddFeedback({ message: res.message || 'Report added to your list!', isError: false });
      setNewCodeInput('');
      setTimeout(() => setAddFeedback({ message: '', isError: false }), 3000);
    } else {
      setAddFeedback({ message: res.message || 'Failed to find tracking code', isError: true });
    }
  };

  const filteredReports = savedReports.filter(report => {
    const term = searchTerm.toLowerCase();
    return (
      report.trackingCode?.toLowerCase().includes(term) ||
      report.title?.toLowerCase().includes(term) ||
      report.category?.toLowerCase().includes(term) ||
      report.status?.toLowerCase().includes(term)
    );
  });

  return (
    <AnimatePresence>
      <motion.div
        className="my-reports-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="my-reports-modal"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="header-title-wrap">
              <div className="header-icon">
                <IconFolder size={22} color="#fca5a5" />
              </div>
              <div>
                <h2 className="modal-title">My Saved Reports</h2>
                <p className="modal-subtitle">
                  Reports for account: <strong className="user-email-tag">{student?.email}</strong>
                </p>
              </div>
            </div>
            <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
              <IconX size={18} />
            </button>
          </div>

          {/* Privacy Banner */}
          <div className="privacy-banner">
            <IconShieldCheck size={20} className="privacy-shield" />
            <div>
              <strong>100% Zero-Knowledge Anonymity:</strong>
              <p>Reports submitted with "Anonymous" checked have no link to your name or Google account in SSG admin dashboards.</p>
            </div>
          </div>

          {/* Add Code Bar */}
          <form className="add-code-bar" onSubmit={handleAddCodeSubmit}>
            <input
              type="text"
              className="code-input"
              placeholder="Enter tracking code (e.g. VISI-XXXX-XXXX)"
              value={newCodeInput}
              onChange={(e) => setNewCodeInput(e.target.value.toUpperCase())}
            />
            <button 
              type="submit" 
              className="add-btn" 
              disabled={isAddingCode || !newCodeInput.trim()}
            >
              <IconPlus size={14} strokeWidth={2.5} className="add-plus-svg" />
              <span>{isAddingCode ? 'Checking...' : 'Save Code'}</span>
            </button>
          </form>

          {addFeedback.message && (
            <div className={`feedback-banner ${addFeedback.isError ? 'error' : 'success'}`}>
              {addFeedback.isError ? (
                <IconAlertTriangle size={15} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
              ) : (
                <IconCheck size={15} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
              )}
              {addFeedback.message}
            </div>
          )}

          {/* Search Bar */}
          {savedReports.length > 0 && (
            <div className="search-bar">
              <IconSearch size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search saved reports by title, code, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button type="button" className="clear-search-btn" onClick={() => setSearchTerm('')}>
                  <IconX size={14} />
                </button>
              )}
            </div>
          )}

          {/* Reports List */}
          <div className="reports-list-container">
            {isReportsLoading ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Loading your saved reports...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="empty-state">
                <IconInbox size={42} className="empty-icon" />
                <h3>{searchTerm ? 'No matching reports found' : 'No saved reports yet'}</h3>
                <p>
                  {searchTerm 
                    ? 'Try searching with different keywords or tracking codes.'
                    : 'When you submit suggestions while signed in, they will automatically appear here for easy tracking across your devices.'}
                </p>
              </div>
            ) : (
              <div className="reports-grid">
                {filteredReports.map((report) => {
                  const statusInfo = statusConfig[report.status] || statusConfig.submitted;
                  const StatusIcon = statusInfo.Icon;
                  const catInfo = categoryConfig[report.category] || categoryConfig.general;
                  const CatIcon = catInfo.Icon;

                  return (
                    <motion.div 
                      key={report.trackingCode} 
                      className="report-card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="card-top">
                        <span className="category-tag">
                          <CatIcon size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
                          {catInfo.label}
                        </span>
                        
                        <div 
                          className="status-badge"
                          style={{ color: statusInfo.color, backgroundColor: statusInfo.bg }}
                        >
                          <StatusIcon size={13} style={{ marginRight: '3px' }} />
                          {statusInfo.label}
                        </div>
                      </div>

                      <h4 className="report-title">{report.title || 'Untitled Suggestion'}</h4>

                      <div className="tracking-code-row">
                        <div className="code-pill">
                          <span className="code-label">CODE:</span>
                          <span className="code-value">{report.trackingCode}</span>
                        </div>
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={() => handleCopyCode(report.trackingCode)}
                          title="Copy tracking code"
                        >
                          {copiedCode === report.trackingCode ? (
                            <>
                              <IconCheck size={13} style={{ marginRight: '2px' }} />
                              Copied
                            </>
                          ) : (
                            <>
                              <IconCopy size={13} style={{ marginRight: '2px' }} />
                              Copy
                            </>
                          )}
                        </button>
                      </div>

                      {report.priority && (
                        <div className="priority-row">
                          <span className={`priority-tag priority-${report.priority}`}>
                            Priority: {report.priority.toUpperCase()}
                          </span>
                          {report.savedAt && (
                            <span className="saved-date">
                              Saved: {new Date(report.savedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}

                      {(report.dismissalReason || report.rejectionReason) && (
                        <div className={`report-closure-callout ${report.status === 'rejected' ? 'rejection' : 'dismissal'}`}>
                          <span className="closure-label">
                            <IconArchive size={12} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '3px' }} />
                            {report.status === 'rejected' ? 'Decline Reason:' : 'Dismissal Note:'}
                          </span>
                          <p className="closure-reason-text">
                            {report.dismissalReason || report.rejectionReason}
                          </p>
                        </div>
                      )}

                      <div className="card-actions">
                        <button
                          type="button"
                          className="track-live-btn"
                          onClick={() => {
                            onClose();
                            onTrackCode(report.trackingCode);
                          }}
                        >
                          <IconHistory size={15} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
                          <span>View Status Timeline</span>
                        </button>
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => setReportToDelete(report)}
                          title="Remove from saved list"
                        >
                          <IconTrash size={15} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="refresh-btn" onClick={fetchMyReports}>
              <IconRefresh size={14} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
              Refresh List
            </button>
            <button type="button" className="done-btn" onClick={onClose}>
              Done
            </button>
          </div>

          {/* Delete / Remove Confirmation Modal */}
          <AnimatePresence>
            {reportToDelete && (
              <motion.div 
                className="confirm-delete-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setReportToDelete(null)}
              >
                <motion.div 
                  className="confirm-delete-dialog"
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 15 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="confirm-header">
                    <div className="warning-icon-badge">
                      <IconAlertTriangle size={22} />
                    </div>
                    <h3>Remove Saved Report?</h3>
                  </div>
                  
                  <div className="confirm-body">
                    <p className="confirm-main-text">
                      Are you sure you want to remove <strong>{reportToDelete.trackingCode}</strong> from your saved reports?
                    </p>
                    {reportToDelete.title && (
                      <div className="confirm-report-preview">
                        <span className="preview-label">Title:</span>
                        <span className="preview-title">{reportToDelete.title}</span>
                      </div>
                    )}
                    <p className="confirm-sub-text">
                      <IconShieldCheck size={14} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
                      This will not delete the suggestion from SSG. You can always re-add it using the tracking code.
                    </p>
                  </div>

                  <div className="confirm-actions">
                    <button 
                      type="button" 
                      className="btn-cancel"
                      onClick={() => setReportToDelete(null)}
                      disabled={isRemoving}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="btn-confirm-delete"
                      onClick={handleConfirmRemove}
                      disabled={isRemoving}
                    >
                      <IconTrash size={15} />
                      <span>{isRemoving ? 'Removing...' : 'Remove Report'}</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MyReportsModal;
