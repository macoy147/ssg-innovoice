import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  IconSchool,
  IconBuildingBank,
  IconUsersGroup,
  IconBulb,
  IconShieldLock,
  IconShieldCheck,
  IconUserCheck,
  IconPhotoPlus,
  IconX,
  IconCheck,
  IconAlertCircle,
  IconInfoCircle,
  IconSparkles,
  IconCpu,
  IconCopy,
  IconFolder,
  IconSearch,
  IconQrcode,
  IconArrowRight,
  IconArrowLeft,
  IconTarget,
  IconScale,
  IconUsers,
  IconActivity,
  IconAlertTriangle,
  IconHelpCircle
} from '@tabler/icons-react';
import './SuggestionForm.scss';
import TrackSuggestion from '../TrackSuggestion/TrackSuggestion';
import QRCodeModal from '../QRCodeModal/QRCodeModal';
import StudentNavbar from '../StudentNavbar/StudentNavbar';
import MyReportsModal from '../MyReportsModal/MyReportsModal';
import UserGuideModal from '../UserGuideModal/UserGuideModal';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { useBodyScrollLock } from '../../utils/scrollLock';
import API_URL from '../../config/api';

// Toast Notification Component - Chat Head Style
const Toast = ({ message, type, onClose, duration = 3500 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'error': return <IconAlertCircle size={16} />;
      case 'success': return <IconCheck size={16} />;
      case 'info': return <IconInfoCircle size={16} />;
      default: return <IconAlertCircle size={16} />;
    }
  };

  const handleBubbleClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  return (
    <div className={`chat-head-toast chat-head-${type} ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Floating Bubble */}
      <motion.div
        className="chat-bubble"
        onClick={handleBubbleClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          rotate: isExpanded ? 0 : [0, -10, 10, -10, 0],
        }}
        transition={{
          rotate: { duration: 0.5, delay: 0.5, repeat: isExpanded ? 0 : Infinity, repeatDelay: 3 }
        }}
      >
        <span className="bubble-icon">{getIcon()}</span>
        {/* Progress ring */}
        <svg className="progress-ring" viewBox="0 0 44 44">
          <circle
            className="progress-ring-bg"
            cx="22" cy="22" r="20"
            fill="none"
            strokeWidth="3"
          />
          <circle
            className="progress-ring-fill"
            cx="22" cy="22" r="20"
            fill="none"
            strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
            transform="rotate(-90 22 22)"
          />
        </svg>
      </motion.div>

      {/* Message Bubble */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="message-bubble"
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="message-content">
              <div className="message-text-group">
                <span className="message-title">
                  {type === 'error' ? 'Action Required' : type === 'success' ? 'Success' : 'Notice'}
                </span>
                <p className="message-text">{message}</p>
              </div>
              <button
                className="message-close"
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                aria-label="Dismiss"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1L11 11M1 11L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="message-tail" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SuggestionForm = () => {
  const { student, isMyReportsOpen, setIsMyReportsOpen, fetchMyReports } = useStudentAuth();
  const [step, setStep] = useState(1);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [aiPriority, setAiPriority] = useState(null);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [isShaking, setIsShaking] = useState(false);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 320);
  };
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [activeTrackCode, setActiveTrackCode] = useState('');
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Lock background scrolling whenever any user-side modal is active
  useBodyScrollLock(Boolean(isTrackModalOpen || isQRModalOpen || isAboutModalOpen || isMyReportsOpen || isGuideModalOpen));
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: '',
    submitter: {
      name: '',
      studentId: '',
      email: '',
      contactNumber: '',
      course: '',
      yearLevel: '',
      wantsFollowUp: false
    }
  });

  const categories = [
    { value: 'academic', label: 'Academic Services', Icon: IconSchool, description: 'Curriculum, teaching methods, learning resources, classroom facilities' },
    { value: 'administrative', label: 'Administrative Matters', Icon: IconBuildingBank, description: 'Policies, procedures, enrollment, records, campus facilities' },
    { value: 'extracurricular', label: 'Extracurricular Activities', Icon: IconUsersGroup, description: 'Events, student organizations, sports, clubs, activities' },
    { value: 'general', label: 'General Improvements', Icon: IconBulb, description: 'Overall campus life, welfare, safety, and other concerns' }
  ];

  const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const ctuCourses = [
    'BIT ET',
    'BIT AT',
    'BIT CT',
    'BSIT',
    'BSIE',
    'BSFI',
    'BSHM',
    'BSED MATH',
    'BTLED',
    'BEED'
  ];

  // Auto-fill Google Account details into contact fields when Include My Details is chosen
  const handleSelectIncludeDetails = () => {
    setIsAnonymous(false);
    if (student) {
      setFormData(prev => ({
        ...prev,
        submitter: {
          ...prev.submitter,
          name: prev.submitter.name || student.name || '',
          email: prev.submitter.email || student.email || '',
          wantsFollowUp: true
        }
      }));
    }
  };

  const handleSelectAnonymous = () => {
    setIsAnonymous(true);
  };

  // Sync Google account details when student is authenticated and not anonymous
  useEffect(() => {
    if (!isAnonymous && student) {
      setFormData(prev => ({
        ...prev,
        submitter: {
          ...prev.submitter,
          name: prev.submitter.name || student.name || '',
          email: prev.submitter.email || student.email || ''
        }
      }));
    }
  }, [isAnonymous, student]);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  // Image handling
  const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB max
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  const processSelectedFile = (file) => {
    if (!file) return false;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        photo: 'Unsupported file type. Please upload a valid image (JPEG, PNG, GIF, or WebP).'
      }));
      setImageFile(null);
      setImagePreview(null);
      const fileInput = document.getElementById('photo-input');
      if (fileInput) fileInput.value = '';
      return false;
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      setErrors(prev => ({
        ...prev,
        photo: 'File size exceeds the maximum limit of 2MB. Please upload a smaller image.'
      }));
      setImageFile(null);
      setImagePreview(null);
      const fileInput = document.getElementById('photo-input');
      if (fileInput) fileInput.value = '';
      return false;
    }

    // Valid file selected: clear any previous photo validation errors
    setErrors(prev => {
      const updated = { ...prev };
      delete updated.photo;
      return updated;
    });

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onerror = () => {
      setErrors(prev => ({
        ...prev,
        photo: 'Failed to read image file. Please try another image.'
      }));
      setImageFile(null);
      setImagePreview(null);
    };
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    return true;
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setErrors(prev => {
      const updated = { ...prev };
      delete updated.photo;
      return updated;
    });
    const fileInput = document.getElementById('photo-input');
    if (fileInput) fileInput.value = '';
  };

  const handleInputChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name.startsWith('submitter.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        submitter: {
          ...prev.submitter,
          [field]: inputType === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.category) {
        newErrors.category = 'Please select a category for your suggestion';
        setErrors(newErrors);
        triggerShake();
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
      } else if (formData.title.length < 5) {
        newErrors.title = 'Title must be at least 5 characters';
      }

      if (!formData.content.trim()) {
        newErrors.content = 'Please describe your suggestion';
      } else if (formData.content.length < 20) {
        newErrors.content = 'Please provide more details (at least 20 characters)';
      }

      if (errors.photo) {
        newErrors.photo = errors.photo;
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        triggerShake();
        return false;
      }
    }

    if (currentStep === 3 && !isAnonymous) {
      if (formData.submitter.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.submitter.email)) {
        newErrors['submitter.email'] = 'Please enter a valid email address';
        setErrors(newErrors);
        triggerShake();
        return false;
      }
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(3)) return;

    setIsSubmitting(true);

    try {
      const submissionData = {
        category: formData.category,
        title: formData.title,
        content: formData.content,
        isAnonymous: isAnonymous
      };

      if (!isAnonymous) {
        submissionData.submitter = formData.submitter;
      }

      // Include image if attached
      if (imagePreview) {
        submissionData.image = imagePreview;
      }

      // Retrieve auth token if student is logged in
      const token = localStorage.getItem('innovoice_student_jwt_token');
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post(`${API_URL}/api/suggestions`, submissionData, {
        headers: {
          ...authHeaders
        },
        withCredentials: true
      });

      if (response.data.success) {
        setTrackingCode(response.data.data.trackingCode);
        // Store AI priority info
        setAiPriority({
          priority: response.data.data.priority,
          reason: response.data.data.aiPriorityReason,
          analyzed: response.data.data.aiAnalyzed
        });

        // Refresh saved reports immediately so newly submitted report appears without refresh
        try {
          await fetchMyReports();
        } catch (fetchErr) {
          console.warn('Could not refresh saved reports:', fetchErr);
        }

        showToast('Suggestion submitted successfully!', 'success');
        setStep(4);
      }
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      showToast(error.response?.data?.message || 'Failed to submit suggestion. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  const resetForm = () => {
    setStep(1);
    setIsAnonymous(true);
    setTrackingCode('');
    setAiPriority(null);
    setErrors({});
    setImageFile(null);
    setImagePreview(null);
    setFormData({
      category: '',
      title: '',
      content: '',
      submitter: {
        name: '',
        studentId: '',
        email: '',
        contactNumber: '',
        course: '',
        yearLevel: '',
        wantsFollowUp: false
      }
    });
  };

  const copyTrackingCode = () => {
    navigator.clipboard.writeText(trackingCode);
    showToast('Tracking code copied to clipboard!', 'success');
  };

  return (
    <div className="suggestion-app-wrapper">
      {/* Top Navbar */}
      <StudentNavbar
        onOpenTrack={() => {
          setActiveTrackCode('');
          setIsTrackModalOpen(true);
        }}
        onOpenQR={() => setIsQRModalOpen(true)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
      />

      <div className="suggestion-form-container">

        {/* Portal Hero Banner */}
        <motion.div
          className="portal-hero-banner"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="hero-badge">
            <span className="pulse-dot"></span>
            <span>Student Suggestion Portal • S. 2025–2026</span>
          </div>
          <h2 className="hero-heading">Share Your Voice & Help Improve CTU-DB</h2>
          <p className="hero-description">
            Submit academic suggestions, report campus maintenance, or propose student welfare initiatives. Submissions can be made 100% anonymously.
          </p>
        </motion.div>

        {/* Progress Indicator */}
        {step < 4 && (
          <div className="progress-wrapper">
            <motion.div
              className="progress-steps"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {[1, 2, 3].map((num) => (
                <div key={num} className="step-wrapper">
                  <div className={`step ${step >= num ? 'active' : ''} ${step > num ? 'completed' : ''}`}>
                    <div className="step-number">
                      {step > num ? '✓' : num}
                    </div>
                    <div className="step-label">
                      {num === 1 && 'Category'}
                      {num === 2 && 'Details'}
                      {num === 3 && 'Submit'}
                    </div>
                  </div>
                  {num < 3 && <div className={`step-connector ${step > num ? 'active' : ''}`} />}
                </div>
              ))}
            </motion.div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="suggestion-form">
          {/* Step 1: Category Selection */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="form-step"
              >
                <div className="step-header">
                  <h2>What's your suggestion about?</h2>
                  <p>Select the category that best describes your feedback</p>
                </div>

                {/* Step 1 Compact Inline Validation Message (Minimal Enterprise UI) */}
                <AnimatePresence>
                  {errors.category && (
                    <motion.div
                      className="category-inline-error"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      role="alert"
                    >
                      <div className="error-icon">
                        <IconAlertCircle size={16} />
                      </div>
                      <div className="error-text">
                        <span className="error-title">Category selection required</span>
                        <span className="error-separator">—</span>
                        <span className="error-desc">Please select a category before continuing.</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={`category-grid ${errors.category ? 'has-error' : ''}`}>
                  {categories.map((cat, index) => {
                    const CatIcon = cat.Icon;
                    return (
                      <motion.div
                        key={cat.value}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`category-card ${formData.category === cat.value ? 'selected' : ''}`}
                        role="button"
                        tabIndex={0}
                        aria-pressed={formData.category === cat.value}
                        onClick={() => {
                          if (formData.category === cat.value) {
                            // Unselect if already selected
                            setFormData({ ...formData, category: '' });
                          } else {
                            // Select new category
                            setFormData({ ...formData, category: cat.value });
                            setErrors(prev => ({ ...prev, category: '' }));
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (formData.category === cat.value) {
                              setFormData({ ...formData, category: '' });
                            } else {
                              setFormData({ ...formData, category: cat.value });
                              setErrors(prev => ({ ...prev, category: '' }));
                            }
                          }
                        }}
                      >
                        <div className="category-icon">
                          <CatIcon size={26} />
                        </div>
                        <div className="category-info">
                          <h3>{cat.label}</h3>
                          <p>{cat.description}</p>
                        </div>
                        <div className="selection-indicator">
                          <IconCheck size={13} strokeWidth={3} className="checkmark" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="form-actions">
                  <div></div>
                  <button type="button" onClick={nextStep} className="btn btn-primary">
                    Continue
                    <IconArrowRight size={16} className="btn-icon" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Suggestion Details */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="form-step"
              >
                <div className="step-header">
                  <h2>Share your suggestion</h2>
                  <p>Provide details about your idea or feedback</p>
                </div>

                <div className="selected-category-badge">
                  {(() => {
                    const selectedCat = categories.find(c => c.value === formData.category);
                    const SelectedIcon = selectedCat?.Icon || IconBulb;
                    return (
                      <>
                        <span className="badge-icon">
                          <SelectedIcon size={16} />
                        </span>
                        <span className="badge-text">
                          {selectedCat?.label}
                        </span>
                      </>
                    );
                  })()}
                  <button type="button" className="change-btn" onClick={() => setStep(1)}>
                    Change
                  </button>
                </div>

                {/* Step 2 Compact Inline Validation Message (Minimal Enterprise UI) */}
                <AnimatePresence>
                  {(errors.title || errors.content || errors.photo) && (
                    <motion.div
                      className="compact-inline-error"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      role="alert"
                    >
                      <div className="error-icon">
                        <IconAlertCircle size={16} />
                      </div>
                      <div className="error-text">
                        <span className="error-title">Required details missing</span>
                        <span className="error-separator">—</span>
                        <span className="error-desc">Please complete the highlighted fields before continuing.</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={`form-group ${errors.title ? 'has-error' : ''}`}>
                  <label htmlFor="title">
                    Suggestion Title <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Give your suggestion a clear, brief title"
                    maxLength="200"
                    className={errors.title ? 'error' : ''}
                  />
                  <div className="input-footer">
                    {errors.title && (
                      <span className="field-error">
                        <IconAlertCircle size={13} /> {errors.title}
                      </span>
                    )}
                    <span className="char-count">{formData.title.length}/200</span>
                  </div>
                </div>

                <div className={`form-group ${errors.content ? 'has-error' : ''}`}>
                  <label htmlFor="content">
                    Detailed Description <span className="required">*</span>
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Describe your suggestion in detail. What is the issue or opportunity? How would your suggestion help? Who would benefit from this change?"
                    rows="4"
                    maxLength="2000"
                    className={errors.content ? 'error' : ''}
                  />
                  <div className="input-footer">
                    {errors.content && (
                      <span className="field-error">
                        <IconAlertCircle size={13} /> {errors.content}
                      </span>
                    )}
                    <span className="char-count">{formData.content.length}/2000</span>
                  </div>
                </div>

                {/* Photo Attachment Section */}
                <div className={`form-group photo-upload-section ${errors.photo ? 'has-error' : ''}`}>
                  <label htmlFor="photo-input">
                    Attach Photo <span className="optional">(optional)</span>
                  </label>
                  <p className="photo-hint">Add a photo to support your suggestion (max 2MB)</p>

                  {!imagePreview ? (
                    <>
                      <div
                        className={`photo-upload-area ${errors.photo ? 'has-error' : ''} ${isDragging ? 'is-dragging' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          id="photo-input"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          onChange={handleImageSelect}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="photo-input" className="photo-upload-label">
                          <div className="upload-icon">
                            <IconPhotoPlus size={26} />
                          </div>
                          <span className="upload-text">Click to upload photo evidence</span>
                          <span className="upload-formats">JPEG, PNG, GIF, WebP • Max 2MB</span>
                        </label>
                      </div>
                      {errors.photo && (
                        <div className="photo-error-wrapper">
                          <span className="field-error">
                            <IconAlertCircle size={13} /> {errors.photo}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="photo-preview-container">
                      <div className="photo-preview">
                        <img src={imagePreview} alt="Preview" />
                        <button
                          type="button"
                          className="remove-photo-btn"
                          onClick={removeImage}
                          aria-label="Remove photo"
                        >
                          <IconX size={16} />
                        </button>
                      </div>
                      <div className="photo-info">
                        <span className="photo-name">{imageFile?.name}</span>
                        <span className="photo-size">{(imageFile?.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="button" onClick={prevStep} className="btn btn-secondary">
                    <IconArrowLeft size={16} className="btn-icon" />
                    Back
                  </button>
                  <button type="button" onClick={nextStep} className="btn btn-primary">
                    Continue
                    <IconArrowRight size={16} className="btn-icon" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Contact Information */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="form-step step-submit"
              >
                <div className="step-header">
                  <h2>How would you like to submit?</h2>
                  <p>Choose whether to remain anonymous or include your details</p>
                </div>

                {student && (
                  <div className="logged-in-privacy-notice">
                    <span className="notice-icon">
                      <IconShieldCheck size={16} />
                    </span>
                    <div className="notice-content">
                      <strong>Signed in as {student.name || student.email}</strong>
                      <p>
                        {isAnonymous
                          ? 'Because Anonymous is selected, your identity remains 100% hidden from SSG officers, but this report will automatically appear in your personal "My Reports" dashboard.'
                          : 'Your contact details can help SSG officers follow up with you directly regarding this suggestion.'}
                      </p>
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {errors['submitter.email'] && (
                    <motion.div
                      className="step-error-banner"
                      initial={{ opacity: 0, y: -10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="error-banner-icon">
                        <IconAlertCircle size={20} />
                      </div>
                      <div className="error-banner-content">
                        <span className="error-banner-title">Invalid Email Address</span>
                        <span className="error-banner-desc">{errors['submitter.email']}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="submission-type-toggle">
                  <motion.div
                    className={`toggle-option ${isAnonymous ? 'active' : ''}`}
                    onClick={handleSelectAnonymous}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="option-icon">
                      <IconShieldLock size={20} />
                    </div>
                    <div className="option-content">
                      <h3>Anonymous</h3>
                      <p>Your identity will remain completely private</p>
                    </div>
                    <div className="option-radio">
                      <div className="radio-dot"></div>
                    </div>
                  </motion.div>

                  <motion.div
                    className={`toggle-option ${!isAnonymous ? 'active' : ''}`}
                    onClick={handleSelectIncludeDetails}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="option-icon">
                      <IconUserCheck size={20} />
                    </div>
                    <div className="option-content">
                      <h3>Include My Details</h3>
                      <p>Get updates and follow-ups on your suggestion</p>
                    </div>
                    <div className="option-radio">
                      <div className="radio-dot"></div>
                    </div>
                  </motion.div>
                </div>

                <AnimatePresence>
                  {!isAnonymous && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="contact-fields"
                    >
                      <div className="fields-header">
                        <h4>Your Information</h4>
                        {student ? (
                          <button
                            type="button"
                            className="btn-autofill-info"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                submitter: {
                                  ...prev.submitter,
                                  name: student.name || '',
                                  email: student.email || ''
                                }
                              }));
                            }}
                            title="Click to reset info to Google account details"
                          >
                            <IconCheck size={14} /> Auto-filled from Google ({student.email})
                          </button>
                        ) : (
                          <span className="optional-note">All fields are optional</span>
                        )}
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="name">Full Name</label>
                          <input
                            type="text"
                            id="name"
                            name="submitter.name"
                            value={formData.submitter.name}
                            onChange={handleInputChange}
                            placeholder="Juan Dela Cruz"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="studentId">Student ID</label>
                          <input
                            type="text"
                            id="studentId"
                            name="submitter.studentId"
                            value={formData.submitter.studentId}
                            onChange={handleInputChange}
                            placeholder="82XXXXX"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className={`form-group ${errors['submitter.email'] ? 'has-error' : ''}`}>
                          <label htmlFor="email">Email Address</label>
                          <input
                            type="email"
                            id="email"
                            name="submitter.email"
                            value={formData.submitter.email}
                            onChange={handleInputChange}
                            placeholder="student@ctu.edu.ph"
                            className={errors['submitter.email'] ? 'error' : ''}
                          />
                          {errors['submitter.email'] && (
                            <span className="field-error">
                              <IconAlertCircle size={13} /> {errors['submitter.email']}
                            </span>
                          )}
                        </div>

                        <div className="form-group">
                          <label htmlFor="contactNumber">Contact Number</label>
                          <input
                            type="tel"
                            id="contactNumber"
                            name="submitter.contactNumber"
                            value={formData.submitter.contactNumber}
                            onChange={handleInputChange}
                            placeholder="09XX-XXX-XXXX"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="course">Course/Program</label>
                          <select
                            id="course"
                            name="submitter.course"
                            value={formData.submitter.course}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Course/Program</option>
                            {ctuCourses.map(course => (
                              <option key={course} value={course}>{course}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label htmlFor="yearLevel">Year Level</label>
                          <select
                            id="yearLevel"
                            name="submitter.yearLevel"
                            value={formData.submitter.yearLevel}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Year Level</option>
                            {yearLevels.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="submitter.wantsFollowUp"
                            checked={formData.submitter.wantsFollowUp}
                            onChange={handleInputChange}
                          />
                          <span className="checkbox-custom"></span>
                          <span className="checkbox-text">
                            I want to receive updates about my suggestion via email
                          </span>
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Summary Preview */}
                <div className="submission-summary">
                  <h4>Submission Summary</h4>
                  <div className="summary-item">
                    <span className="summary-label">Category:</span>
                    <span className="summary-value">
                      {categories.find(c => c.value === formData.category)?.label}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Title:</span>
                    <span className="summary-value">{formData.title}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Submission Type:</span>
                    <span className="summary-value summary-type-value">
                      {isAnonymous ? (
                        <>
                          <IconShieldLock size={15} className="summary-type-icon" />
                          <span>Anonymous</span>
                        </>
                      ) : (
                        <>
                          <IconUserCheck size={15} className="summary-type-icon" />
                          <span>With Contact Details</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={prevStep} className="btn btn-secondary">
                    <IconArrowLeft size={16} className="btn-icon" />
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary btn-submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="spinner"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Suggestion
                        <IconCheck size={16} className="btn-icon" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="form-step success-step"
              >
                <motion.div
                  className="success-icon"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                >
                  <span>✓</span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Suggestion Submitted!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="success-message"
                >
                  Thank you for helping improve CTU Daanbantayan Campus
                </motion.p>

                {/* AI Priority Badge */}
                {aiPriority && (
                  <motion.div
                    className={`ai-priority-badge ${!aiPriority.analyzed ? 'ai-fallback' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                  >
                    <div className="ai-badge-header">
                      <IconCpu size={18} className="ai-icon" />
                      <span className="ai-label">AI Priority Analysis</span>
                      {aiPriority.analyzed ? (
                        <span className="ai-verified">
                          <IconCheck size={12} strokeWidth={2.5} className="verified-check-svg" />
                          <span>Analyzed</span>
                        </span>
                      ) : (
                        <span className="ai-pending">Pending Review</span>
                      )}
                    </div>
                    <div className={`ai-priority-level priority-${aiPriority.priority}`}>
                      {aiPriority.priority.toUpperCase()}
                    </div>
                    <p className="ai-reason">
                      {aiPriority.reason || 'Priority assigned based on suggestion content.'}
                    </p>
                  </motion.div>
                )}

                <motion.div
                  className="tracking-code-box"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label>Your Tracking Code</label>
                  <div className="tracking-code-display">
                    <span className="tracking-code">{trackingCode}</span>
                    <button type="button" className="copy-btn" onClick={copyTrackingCode}>
                      <IconCopy size={14} style={{ marginRight: '4px' }} />
                      Copy
                    </button>
                  </div>
                  <p className="tracking-note">
                    Save this code to track the status of your suggestion
                  </p>
                </motion.div>

                {student ? (
                  <motion.div
                    className="account-save-status"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                  >
                    <span className="save-icon">
                      <IconFolder size={22} color="#16a34a" />
                    </span>
                    <div>
                      <strong>Saved to Your Account!</strong>
                      <p>This report has been automatically linked to your personal <em>My Reports</em> list for easy tracking across devices.</p>
                      <button
                        type="button"
                        className="btn-view-reports"
                        onClick={() => setIsMyReportsOpen(true)}
                      >
                        Open My Reports ({student.email})
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    className="guest-tip-box"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                  >
                    <span className="tip-icon">
                      <IconSparkles size={20} color="#2563eb" />
                    </span>
                    <div>
                      <strong>Tip for next time:</strong>
                      <p>Sign in with your Google account anytime to keep all your tracking codes saved automatically without needing to memorize them.</p>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  className="success-actions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <button type="button" onClick={resetForm} className="btn btn-primary">
                    Submit Another Suggestion
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Footer */}
        <motion.footer
          className="form-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="footer-org">Supreme Student Government • Cebu Technological University - Daanbantayan Campus</p>
          <p className="footer-resolution">SSG Resolution No. 031, Series of 2025–2026 • Feedback & Suggestions Committee</p>
        </motion.footer>

        {/* My Reports Modal */}
        <MyReportsModal
          isOpen={isMyReportsOpen}
          onClose={() => setIsMyReportsOpen(false)}
          onTrackCode={(code) => {
            setActiveTrackCode(code);
            setIsTrackModalOpen(true);
          }}
        />

        {/* Track Suggestion Modal */}
        <TrackSuggestion
          isOpen={isTrackModalOpen}
          onClose={() => {
            setIsTrackModalOpen(false);
            setActiveTrackCode('');
          }}
          initialCode={activeTrackCode}
        />

        {/* About System Modal */}
        <AnimatePresence>
          {isAboutModalOpen && (
            <motion.div
              className="about-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAboutModalOpen(false)}
            >
              <motion.div
                className="about-modal"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="about-modal-header">
                  <div className="about-modal-icon">
                    <IconInfoCircle size={22} color="#fca5a5" />
                  </div>
                  <h2>About SSG InnoVoice</h2>
                  <button
                    className="about-modal-close"
                    onClick={() => setIsAboutModalOpen(false)}
                    aria-label="Close"
                  >
                    <IconX size={20} />
                  </button>
                </div>

                <div className="about-modal-content">
                  <div className="about-section">
                    <h3>
                      <IconTarget size={16} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                      Purpose
                    </h3>
                    <p>SSG InnoVoice is a digital student suggestion system that provides an accessible online platform for students to share feedback, suggestions, and innovative ideas to improve campus life, academic services, and student welfare.</p>
                  </div>

                  <div className="about-section">
                    <h3>
                      <IconScale size={16} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                      Legal Basis
                    </h3>
                    <p>Established under <strong>SSG Resolution No. 031, Series of 2025-2026</strong>, authored by Hon. Marco C. Montellano and co-authored by Hon. Leslie Jane Dela Peña.</p>
                  </div>

                  <div className="about-section">
                    <h3>
                      <IconSparkles size={16} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                      Key Features
                    </h3>
                    <ul>
                      <li><strong>Anonymous Submission</strong> – Your identity remains completely private</li>
                      <li><strong>Tracking System</strong> – Monitor your suggestion's status with a unique code</li>
                      <li><strong>Multiple Categories</strong> – Academic, Administrative, Extracurricular, and more</li>
                      <li><strong>24/7 Accessibility</strong> – Submit anytime, anywhere via web browser</li>
                    </ul>
                  </div>

                  <div className="about-section">
                    <h3>
                      <IconUsers size={16} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                      Feedback Committee
                    </h3>
                    <p>Suggestions are reviewed by the SSG Feedback Committee, chaired by Hon. Marco C. Montellano, and forwarded to appropriate campus departments for action.</p>
                  </div>

                  <div className="about-section">
                    <h3>
                      <IconActivity size={16} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                      Status Updates
                    </h3>
                    <ul className="status-list">
                      <li><span className="status-badge submitted">Submitted</span> Your suggestion has been received</li>
                      <li><span className="status-badge review">Under Review</span> Being evaluated by the committee</li>
                      <li><span className="status-badge forwarded">Forwarded</span> Sent to the appropriate department</li>
                      <li><span className="status-badge action">Action Taken</span> Steps are being implemented</li>
                      <li><span className="status-badge resolved">Resolved</span> Successfully addressed</li>
                      <li><span className="status-badge rejected">Rejected</span> Cannot be implemented</li>
                    </ul>
                  </div>

                  <div className="about-section guidelines">
                    <h3>
                      <IconAlertTriangle size={16} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                      Submission Guidelines
                    </h3>
                    <ul>
                      <li>Be respectful and constructive in your feedback</li>
                      <li>Avoid offensive language or personal attacks</li>
                      <li>Provide clear and detailed descriptions</li>
                      <li>One suggestion per submission for better tracking</li>
                    </ul>
                  </div>
                </div>

                <div className="about-modal-footer">
                  <p>Supreme Student Government • CTU Daanbantayan Campus</p>
                  <p className="resolution-note">Resolution No. 031, S. 2025-2026</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* QR Code Share Modal */}
        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
        />

        {/* User Guide Modal */}
        <UserGuideModal
          isOpen={isGuideModalOpen}
          onClose={() => setIsGuideModalOpen(false)}
          onStartSubmitting={() => {
            setIsGuideModalOpen(false);
            setStep(1);
          }}
        />
      </div>
    </div>
  );
};

export default SuggestionForm;
