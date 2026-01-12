import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './SuggestionForm.scss';
import TrackSuggestion from '../TrackSuggestion/TrackSuggestion';
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
    switch(type) {
      case 'error': return '!';
      case 'success': return '✓';
      case 'info': return 'i';
      default: return '!';
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
              <p className="message-text">{message}</p>
              <button 
                className="message-close" 
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                aria-label="Dismiss"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1L11 11M1 11L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
  const [step, setStep] = useState(1);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [aiPriority, setAiPriority] = useState(null);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
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
    { value: 'academic', label: 'Academic Services', icon: '📚', description: 'Curriculum, teaching methods, learning resources, classroom facilities' },
    { value: 'administrative', label: 'Administrative Matters', icon: '🏛️', description: 'Policies, procedures, enrollment, records, campus facilities' },
    { value: 'extracurricular', label: 'Extracurricular Activities', icon: '🎭', description: 'Events, student organizations, sports, clubs, activities' },
    { value: 'general', label: 'General Improvements', icon: '💡', description: 'Overall campus life, welfare, safety, and other concerns' }
  ];

  const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
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
        showToast('Please select a category before proceeding', 'error');
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
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        showToast('Please fill in all required fields correctly', 'error');
        return false;
      }
    }

    if (currentStep === 3 && !isAnonymous) {
      if (formData.submitter.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.submitter.email)) {
        newErrors['submitter.email'] = 'Please enter a valid email address';
        setErrors(newErrors);
        showToast('Please enter a valid email address', 'error');
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

      const response = await axios.post(`${API_URL}/api/suggestions`, submissionData);

      if (response.data.success) {
        setTrackingCode(response.data.data.trackingCode);
        // Store AI priority info
        setAiPriority({
          priority: response.data.data.priority,
          reason: response.data.data.aiPriorityReason,
          analyzed: response.data.data.aiAnalyzed
        });
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
    <div className="suggestion-form-container">

      {/* Header */}
      <motion.div 
        className="form-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Decorative floating shapes */}
        <div className="header-decorations">
          <span className="deco-shape shape-1"></span>
          <span className="deco-shape shape-2"></span>
          <span className="deco-shape shape-3"></span>
          <span className="deco-shape shape-4"></span>
        </div>
        
        <div className="header-content">
          <div className="logo-wrapper">
            <img src="/ctu_logo.jpg" alt="CTU Logo" className="ctu-logo" />
          </div>
          <div className="header-text">
            <h1>SSG InnoVoice</h1>
            <p>Speak Ideas. Spark Change.</p>
            <span className="campus-name">CTU Daanbantayan Campus</span>
          </div>
          <div className="logo-wrapper">
            <img src="/ssg-logo.png" alt="SSG Logo" className="ssg-logo" />
          </div>
        </div>
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
          
          {/* Chat Head Notification - Beside Progress */}
          <AnimatePresence>
            {toast && (
              <motion.div
                className="chat-head-container"
                initial={{ opacity: 0, scale: 0, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0, x: -20 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 30,
                  mass: 0.8
                }}
              >
                <Toast
                  message={toast.message}
                  type={toast.type}
                  onClose={closeToast}
                  duration={4000}
                />
              </motion.div>
            )}
          </AnimatePresence>
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
              
              <div className={`category-grid ${errors.category ? 'has-error' : ''}`}>
                {categories.map((cat, index) => (
                  <motion.div
                    key={cat.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`category-card ${formData.category === cat.value ? 'selected' : ''}`}
                    onClick={() => {
                      setFormData({ ...formData, category: cat.value });
                      setErrors({ ...errors, category: '' });
                    }}
                  >
                    <div className="category-icon">{cat.icon}</div>
                    <h3>{cat.label}</h3>
                    <p>{cat.description}</p>
                    <div className="selection-indicator">
                      <span className="checkmark">✓</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {errors.category && (
                <motion.div 
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="error-icon">⚠️</span>
                  {errors.category}
                </motion.div>
              )}

              <div className="form-actions">
                <div></div>
                <button type="button" onClick={nextStep} className="btn btn-primary">
                  Continue
                  <span className="btn-icon">→</span>
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
                <span className="badge-icon">
                  {categories.find(c => c.value === formData.category)?.icon}
                </span>
                <span className="badge-text">
                  {categories.find(c => c.value === formData.category)?.label}
                </span>
                <button type="button" className="change-btn" onClick={() => setStep(1)}>
                  Change
                </button>
              </div>

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
                  {errors.title && <span className="field-error">{errors.title}</span>}
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
                  rows="8"
                  maxLength="2000"
                  className={errors.content ? 'error' : ''}
                />
                <div className="input-footer">
                  {errors.content && <span className="field-error">{errors.content}</span>}
                  <span className="char-count">{formData.content.length}/2000</span>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={prevStep} className="btn btn-secondary">
                  <span className="btn-icon">←</span>
                  Back
                </button>
                <button type="button" onClick={nextStep} className="btn btn-primary">
                  Continue
                  <span className="btn-icon">→</span>
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
              className="form-step"
            >
              <div className="step-header">
                <h2>How would you like to submit?</h2>
                <p>Choose whether to remain anonymous or include your details</p>
              </div>

              <div className="submission-type-toggle">
                <motion.div
                  className={`toggle-option ${isAnonymous ? 'active' : ''}`}
                  onClick={() => setIsAnonymous(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="option-icon">🔒</div>
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
                  onClick={() => setIsAnonymous(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="option-icon">👤</div>
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
                      <span className="optional-note">All fields are optional</span>
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
                          <span className="field-error">{errors['submitter.email']}</span>
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
                        <input
                          type="text"
                          id="course"
                          name="submitter.course"
                          value={formData.submitter.course}
                          onChange={handleInputChange}
                          placeholder="e.g., BSIT, BSED, BSHM"
                        />
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
                  <span className="summary-value">
                    {isAnonymous ? '🔒 Anonymous' : '👤 With Contact Details'}
                  </span>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={prevStep} className="btn btn-secondary">
                  <span className="btn-icon">←</span>
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
                      <span className="btn-icon">✓</span>
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
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
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
                    <span className="ai-icon">🤖</span>
                    <span className="ai-label">AI Priority Analysis</span>
                    {aiPriority.analyzed ? (
                      <span className="ai-verified">✓ Analyzed</span>
                    ) : (
                      <span className="ai-pending">⏳ Pending Review</span>
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
                    📋 Copy
                  </button>
                </div>
                <p className="tracking-note">
                  Save this code to track the status of your suggestion
                </p>
              </motion.div>

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
        transition={{ delay: 0.5 }}
      >
        <div className="footer-buttons">
          <button 
            className="track-suggestion-btn"
            onClick={() => setIsTrackModalOpen(true)}
          >
            🔍 Track My Suggestion
          </button>
          <button 
            className="about-info-btn"
            onClick={() => setIsAboutModalOpen(true)}
            aria-label="About this system"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </button>
          <button 
            className="qr-share-btn"
            onClick={() => setIsQRModalOpen(true)}
            aria-label="Share QR Code"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
            </svg>
          </button>
        </div>
        <p>Supreme Student Government • CTU Daanbantayan Campus</p>
        <p className="policy-link">SSG InnoVoice: Student Suggestion System</p>
      </motion.footer>

      {/* Track Suggestion Modal */}
      <TrackSuggestion 
        isOpen={isTrackModalOpen} 
        onClose={() => setIsTrackModalOpen(false)} 
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
                <div className="about-modal-icon">📜</div>
                <h2>About SSG InnoVoice</h2>
                <button 
                  className="about-modal-close"
                  onClick={() => setIsAboutModalOpen(false)}
                  aria-label="Close"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              
              <div className="about-modal-content">
                <div className="about-section">
                  <h3>🎯 Purpose</h3>
                  <p>SSG InnoVoice is a digital student suggestion system that provides an accessible online platform for students to share feedback, suggestions, and innovative ideas to improve campus life, academic services, and student welfare.</p>
                </div>

                <div className="about-section">
                  <h3>📋 Legal Basis</h3>
                  <p>Established under <strong>SSG Resolution No. 031, Series of 2025-2026</strong>, authored by Hon. Marco C. Montellano and co-authored by Hon. Leslie Jane Dela Peña.</p>
                </div>

                <div className="about-section">
                  <h3>✨ Key Features</h3>
                  <ul>
                    <li><strong>Anonymous Submission</strong> – Your identity remains completely private</li>
                    <li><strong>Tracking System</strong> – Monitor your suggestion's status with a unique code</li>
                    <li><strong>Multiple Categories</strong> – Academic, Administrative, Extracurricular, and more</li>
                    <li><strong>24/7 Accessibility</strong> – Submit anytime, anywhere via web browser</li>
                  </ul>
                </div>

                <div className="about-section">
                  <h3>👥 Feedback Committee</h3>
                  <p>Suggestions are reviewed by the SSG Feedback Committee, chaired by Hon. Marco C. Montellano, and forwarded to appropriate campus departments for action.</p>
                </div>

                <div className="about-section">
                  <h3>📊 Status Updates</h3>
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
                  <h3>⚠️ Submission Guidelines</h3>
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
      <AnimatePresence>
        {isQRModalOpen && (
          <motion.div 
            className="qr-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsQRModalOpen(false)}
          >
            <motion.div 
              className="qr-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="qr-modal-header">
                <div className="qr-modal-icon">📱</div>
                <h2>Share SSG InnoVoice</h2>
                <button 
                  className="qr-modal-close"
                  onClick={() => setIsQRModalOpen(false)}
                  aria-label="Close"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              
              <div className="qr-modal-content">
                <div className="qr-image-wrapper">
                  <img src="/SSG nnoVoiceQR.png" alt="SSG InnoVoice QR Code" className="qr-image" />
                </div>
                <p className="qr-instruction">Scan this QR code to access SSG InnoVoice</p>
              </div>

              <div className="qr-modal-footer">
                <p>Share with fellow students!</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuggestionForm;
