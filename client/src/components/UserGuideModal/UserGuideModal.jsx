import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconHelpCircle, 
  IconX, 
  IconChevronRight, 
  IconChevronLeft, 
  IconSchool, 
  IconBuildingBank, 
  IconUsersGroup, 
  IconBulb, 
  IconShieldCheck, 
  IconUpload, 
  IconSparkles, 
  IconSearch, 
  IconCopy, 
  IconCheck, 
  IconEye, 
  IconSend, 
  IconBolt, 
  IconCircleCheck, 
  IconRocket,
  IconInfoCircle,
  IconChevronDown,
  IconFileText
} from '@tabler/icons-react';
import { useBodyScrollLock } from '../../utils/scrollLock';
import './UserGuideModal.scss';

const STEPS = [
  {
    id: 1,
    title: 'Select Category & Privacy',
    tabLabel: '1. Categorize',
    badge: 'Step 1 of 4',
    summary: 'Choose the relevant campus area and decide whether to remain completely anonymous or sign in for tracking.'
  },
  {
    id: 2,
    title: 'Describe & Attach Evidence',
    tabLabel: '2. Describe',
    badge: 'Step 2 of 4',
    summary: 'Give your concern a clear title, provide specific location and details, and attach photos for faster resolution.'
  },
  {
    id: 3,
    title: 'AI Evaluation & Review',
    tabLabel: '3. AI Review',
    badge: 'Step 3 of 4',
    summary: 'InnoVoice AI automatically evaluates severity and priority so urgent safety and facility issues are addressed immediately.'
  },
  {
    id: 4,
    title: 'Save Code & Track Progress',
    tabLabel: '4. Track & Resolve',
    badge: 'Step 4 of 4',
    summary: 'Receive your unique tracking code, monitor the committee status in real-time, and view resolution updates.'
  }
];

const FAQS = [
  {
    q: 'Is anonymous submission truly 100% private?',
    a: 'Yes! When you choose Anonymous Mode, InnoVoice does NOT record your name, student ID, Google account, or IP address. The SSG committee will only see your report content.'
  },
  {
    q: 'Why should I sign in with my Google account?',
    a: 'Signing in allows InnoVoice to automatically save all your submitted suggestions in the "My Reports" tab. You can check updates with one click without having to remember tracking codes.'
  },
  {
    q: 'How long does it take for the SSG to review a suggestion?',
    a: 'Reports are typically evaluated by the SSG Feedback Committee within 24–48 hours. Urgent maintenance or safety concerns flagged by AI are prioritized for immediate department dispatch.'
  },
  {
    q: 'What makes an effective report?',
    a: 'Be specific! State the exact location (e.g., "Library 2nd Floor"), clearly describe the issue or suggestion, and attach a photo whenever possible. Avoid offensive language to ensure your report can be officially forwarded.'
  }
];

const UserGuideModal = ({ isOpen, onClose, onStartSubmitting }) => {
  useBodyScrollLock(isOpen);

  const [activeStep, setActiveStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [selectedDemoCat, setSelectedDemoCat] = useState('academic');
  const [demoCopied, setDemoCopied] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Keyboard navigation: Escape to close, Left/Right arrows to step
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        if (activeStep < STEPS.length) {
          setDirection(1);
          setActiveStep((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (activeStep > 1) {
          setDirection(-1);
          setActiveStep((prev) => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeStep, onClose]);

  const handleNext = () => {
    if (activeStep < STEPS.length) {
      setDirection(1);
      setActiveStep((prev) => prev + 1);
    } else {
      if (onStartSubmitting) {
        onStartSubmitting();
      } else {
        onClose();
      }
    }
  };

  const handlePrev = () => {
    if (activeStep > 1) {
      setDirection(-1);
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleTabClick = (stepId) => {
    setDirection(stepId > activeStep ? 1 : -1);
    setActiveStep(stepId);
  };

  const handleCopyDemoCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('IV-8X4K9');
    }
    setDemoCopied(true);
    setTimeout(() => setDemoCopied(false), 2200);
  };

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="guide-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="guide-modal-container"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          >
            {/* Modal Header */}
            <div className="guide-modal-header">
              <div className="header-branding">
                <div className="guide-badge">
                  <span className="guide-badge-dot"></span>
                  <span>Interactive Walkthrough</span>
                </div>
                <h2>How to Use SSG InnoVoice</h2>
                <p className="header-subtitle">
                  Learn how to submit suggestions, upload evidence, and track university responses in 4 simple steps.
                </p>
              </div>

              <motion.button
                type="button"
                className="guide-close-btn"
                onClick={onClose}
                aria-label="Close Guide"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                <IconX size={18} />
              </motion.button>
            </div>

            {/* Stepper Tabs */}
            <div className="guide-stepper-nav" role="tablist">
              {STEPS.map((step) => {
                const isActive = activeStep === step.id;
                const isPassed = activeStep > step.id;
                return (
                  <button
                    key={step.id}
                    type="button"
                    className={`step-tab-btn ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                    onClick={() => handleTabClick(step.id)}
                    role="tab"
                    aria-selected={isActive}
                  >
                    <span className="step-tab-number">
                      {isPassed ? <IconCheck size={13} stroke={3} /> : step.id}
                    </span>
                    <span className="step-tab-text">{step.tabLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Step Body Content with Slide Animation */}
            <div className="guide-modal-body">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeStep}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 30 : -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -30 : 30 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="step-content-grid"
                >
                  {/* LEFT: Instructions & Best Practices */}
                  <div className="step-text-column">
                    <div className="step-tag">{STEPS[activeStep - 1].badge}</div>
                    <h3 className="step-title">{STEPS[activeStep - 1].title}</h3>
                    <p className="step-summary">{STEPS[activeStep - 1].summary}</p>

                    {/* Step-specific Guidance */}
                    {activeStep === 1 && (
                      <div className="guidance-list">
                        <div className="guidance-item">
                          <div className="item-bullet">1</div>
                          <div>
                            <strong>Choose the Right Domain:</strong> Categorizing correctly ensures your feedback is routed to the exact committee and campus department.
                          </div>
                        </div>
                        <div className="guidance-item">
                          <div className="item-bullet">2</div>
                          <div>
                            <strong>Anonymous vs. Verified:</strong> Choose <em>100% Anonymous</em> for complete privacy, or <em>Include Details / Google Login</em> if you wish to receive personal follow-ups and auto-save in "My Reports".
                          </div>
                        </div>
                        <div className="pro-tip-box">
                          <IconShieldCheck size={18} className="tip-icon" />
                          <span><strong>Privacy Guarantee:</strong> Anonymous submissions never store cookies, device identifiers, or student IDs.</span>
                        </div>
                      </div>
                    )}

                    {activeStep === 2 && (
                      <div className="guidance-list">
                        <div className="guidance-item">
                          <div className="item-bullet">1</div>
                          <div>
                            <strong>Descriptive Title:</strong> Summarize the core issue or idea in 5–10 words (e.g. <em>"Slow Wi-Fi in Main Library 2nd Floor"</em>).
                          </div>
                        </div>
                        <div className="guidance-item">
                          <div className="item-bullet">2</div>
                          <div>
                            <strong>Actionable Details:</strong> Specify the exact building, room number, or event name. Describe the root problem and your suggested improvement.
                          </div>
                        </div>
                        <div className="guidance-item">
                          <div className="item-bullet">3</div>
                          <div>
                            <strong>Attach Photo Evidence:</strong> Uploading photos (damaged chairs, maintenance issues, notice boards) helps the committee inspect and act instantly.
                          </div>
                        </div>
                        <div className="pro-tip-box">
                          <IconUpload size={18} className="tip-icon" />
                          <span><strong>Photo Tip:</strong> JPG and PNG files up to 5MB are supported. Clear photos expedite university approval.</span>
                        </div>
                      </div>
                    )}

                    {activeStep === 3 && (
                      <div className="guidance-list">
                        <div className="guidance-item">
                          <div className="item-bullet">1</div>
                          <div>
                            <strong>Gemini AI Intelligence:</strong> InnoVoice analyzes your text to automatically determine urgency (Urgent, High, Medium, Low) and verify appropriate categorization.
                          </div>
                        </div>
                        <div className="guidance-item">
                          <div className="item-bullet">2</div>
                          <div>
                            <strong>Safety & Urgent Matters:</strong> Hazards, safety risks, or urgent electrical/sanitary repairs are immediately prioritized on the SSG Admin dashboard.
                          </div>
                        </div>
                        <div className="guidance-item">
                          <div className="item-bullet">3</div>
                          <div>
                            <strong>Preview Before Finalizing:</strong> Verify your title, category, and attachments in Step 3 before officially submitting.
                          </div>
                        </div>
                        <div className="pro-tip-box">
                          <IconSparkles size={18} className="tip-icon" />
                          <span><strong>Smart Routing:</strong> High-priority suggestions notify student leaders quickly for urgent faculty and campus coordination.</span>
                        </div>
                      </div>
                    )}

                    {activeStep === 4 && (
                      <div className="guidance-list">
                        <div className="guidance-item">
                          <div className="item-bullet">1</div>
                          <div>
                            <strong>Keep Your Tracking Code:</strong> Save the code shown on the success screen (e.g. <code>IV-8X4K9</code>). You can copy it with one click.
                          </div>
                        </div>
                        <div className="guidance-item">
                          <div className="item-bullet">2</div>
                          <div>
                            <strong>Track Anytime:</strong> Click <strong>"Track Code"</strong> in the top navigation bar at any time to see official committee updates and actions taken.
                          </div>
                        </div>
                        <div className="guidance-item">
                          <div className="item-bullet">3</div>
                          <div>
                            <strong>Automated My Reports:</strong> If logged in with Google, your report is permanently synced to your personal "My Reports" vault!
                          </div>
                        </div>
                        <div className="pro-tip-box">
                          <IconCheck size={18} className="tip-icon" />
                          <span><strong>Resolution Notes:</strong> Committee responses, department endorsements, and university decisions will appear on your tracking card.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RIGHT: Interactive UI Mockup / Visual Demonstration */}
                  <div className="step-mockup-column">
                    {activeStep === 1 && (
                      <div className="mockup-card">
                        <div className="mockup-header">
                          <span className="mockup-dot red"></span>
                          <span className="mockup-dot yellow"></span>
                          <span className="mockup-dot green"></span>
                          <span className="mockup-label">Interactive Category Preview</span>
                        </div>
                        <div className="mockup-content">
                          <p className="mockup-hint">Click a category below to test selection:</p>
                          <div className="demo-categories-grid">
                            <div 
                              className={`demo-cat-card ${selectedDemoCat === 'academic' ? 'active' : ''}`}
                              onClick={() => setSelectedDemoCat('academic')}
                            >
                              <IconSchool size={20} className="cat-icon" />
                              <div className="cat-meta">
                                <strong>Academic Services</strong>
                                <span>Curriculum, faculties, teaching, classrooms</span>
                              </div>
                            </div>
                            <div 
                              className={`demo-cat-card ${selectedDemoCat === 'administrative' ? 'active' : ''}`}
                              onClick={() => setSelectedDemoCat('administrative')}
                            >
                              <IconBuildingBank size={20} className="cat-icon" />
                              <div className="cat-meta">
                                <strong>Administrative Matters</strong>
                                <span>Policies, facilities, campus repairs, offices</span>
                              </div>
                            </div>
                            <div 
                              className={`demo-cat-card ${selectedDemoCat === 'extracurricular' ? 'active' : ''}`}
                              onClick={() => setSelectedDemoCat('extracurricular')}
                            >
                              <IconUsersGroup size={20} className="cat-icon" />
                              <div className="cat-meta">
                                <strong>Extracurricular Activities</strong>
                                <span>Clubs, sports, cultural events, student life</span>
                              </div>
                            </div>
                            <div 
                              className={`demo-cat-card ${selectedDemoCat === 'general' ? 'active' : ''}`}
                              onClick={() => setSelectedDemoCat('general')}
                            >
                              <IconBulb size={20} className="cat-icon" />
                              <div className="cat-meta">
                                <strong>General Improvements</strong>
                                <span>Campus safety, canteen, Wi-Fi, suggestions</span>
                              </div>
                            </div>
                          </div>

                          <div className="demo-privacy-pill-group">
                            <span className="pill active">
                              <IconShieldCheck size={14} /> 100% Anonymous
                            </span>
                            <span className="pill">
                              <IconCheck size={14} /> Include Google Profile
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStep === 2 && (
                      <div className="mockup-card">
                        <div className="mockup-header">
                          <span className="mockup-dot red"></span>
                          <span className="mockup-dot yellow"></span>
                          <span className="mockup-dot green"></span>
                          <span className="mockup-label">Example Quality Report</span>
                        </div>
                        <div className="mockup-content">
                          <div className="demo-field">
                            <span className="demo-label">Title</span>
                            <div className="demo-input-box strong">
                              Broken Electric Fan in Room 204 (BIT Building)
                            </div>
                          </div>

                          <div className="demo-field">
                            <span className="demo-label">Description & Context</span>
                            <div className="demo-textarea-box">
                              "The ceiling fan in Room 204 makes a loud clicking noise and stops spinning during afternoon classes. Students find it very hot and hard to concentrate. Maintenance check needed."
                            </div>
                          </div>

                          <div className="demo-field">
                            <span className="demo-label">Attached Photo Proof</span>
                            <div className="demo-upload-preview">
                              <div className="demo-file-chip">
                                <span className="demo-file-icon">📷</span>
                                <div className="demo-file-info">
                                  <strong>fan-room-204-inspection.jpg</strong>
                                  <span>1.4 MB • Uploaded & Ready</span>
                                </div>
                                <span className="demo-file-tag">Attached</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStep === 3 && (
                      <div className="mockup-card">
                        <div className="mockup-header">
                          <span className="mockup-dot red"></span>
                          <span className="mockup-dot yellow"></span>
                          <span className="mockup-dot green"></span>
                          <span className="mockup-label">AI Priority & Submission Review</span>
                        </div>
                        <div className="mockup-content">
                          <div className="ai-eval-banner">
                            <div className="ai-icon-wrap">
                              <IconSparkles size={20} />
                            </div>
                            <div className="ai-text-wrap">
                              <div className="ai-badge-row">
                                <span className="ai-tag high">HIGH PRIORITY</span>
                                <span className="ai-conf">AI Assessed</span>
                              </div>
                              <p className="ai-note">
                                Identified as classroom maintenance affecting learning conditions. Flagged for committee review.
                              </p>
                            </div>
                          </div>

                          <div className="demo-review-summary">
                            <div className="summary-row">
                              <span className="lbl">Selected Category:</span>
                              <span className="val">Administrative Matters</span>
                            </div>
                            <div className="summary-row">
                              <span className="lbl">Submitter Identity:</span>
                              <span className="val highlight">Anonymous Student</span>
                            </div>
                            <div className="summary-row">
                              <span className="lbl">Target Campus:</span>
                              <span className="val">CTU Daanbantayan Campus</span>
                            </div>
                          </div>

                          <div className="demo-submit-btn-preview">
                            <IconSend size={16} />
                            <span>Submit Suggestion to SSG</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStep === 4 && (
                      <div className="mockup-card">
                        <div className="mockup-header">
                          <span className="mockup-dot red"></span>
                          <span className="mockup-dot yellow"></span>
                          <span className="mockup-dot green"></span>
                          <span className="mockup-label">Tracking Code & Status Pipeline</span>
                        </div>
                        <div className="mockup-content">
                          <div className="demo-code-box">
                            <span className="code-caption">Your Unique Tracking Code:</span>
                            <div className="code-display-row">
                              <code className="sample-code">IV-8X4K9</code>
                              <button 
                                type="button" 
                                className="copy-demo-btn"
                                onClick={handleCopyDemoCode}
                              >
                                {demoCopied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                <span>{demoCopied ? 'Copied!' : 'Copy'}</span>
                              </button>
                            </div>
                            <p className="code-help-text">Use this code under "Track Code" in the navbar to check progress anytime.</p>
                          </div>

                          {/* 5-step status pipeline */}
                          <div className="status-pipeline-box">
                            <span className="pipeline-title">Resolution Lifecycle:</span>
                            <div className="pipeline-steps">
                              <div className="pipe-step done">
                                <span className="pipe-dot"><IconCheck size={10} stroke={3} /></span>
                                <span className="pipe-lbl">Submitted</span>
                              </div>
                              <div className="pipe-connector done"></div>
                              <div className="pipe-step current">
                                <span className="pipe-dot"><IconEye size={10} /></span>
                                <span className="pipe-lbl">Under Review</span>
                              </div>
                              <div className="pipe-connector"></div>
                              <div className="pipe-step">
                                <span className="pipe-dot"><IconSend size={10} /></span>
                                <span className="pipe-lbl">Forwarded</span>
                              </div>
                              <div className="pipe-connector"></div>
                              <div className="pipe-step">
                                <span className="pipe-dot"><IconBolt size={10} /></span>
                                <span className="pipe-lbl">Action Taken</span>
                              </div>
                              <div className="pipe-connector"></div>
                              <div className="pipe-step">
                                <span className="pipe-dot"><IconCircleCheck size={10} /></span>
                                <span className="pipe-lbl">Resolved</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Collapsible FAQ Section */}
              <div className="guide-faq-accordion">
                <div className="faq-section-header">
                  <IconInfoCircle size={16} className="faq-info-icon" />
                  <h4>Frequently Asked Questions & Tips</h4>
                </div>
                <div className="faq-list">
                  {FAQS.map((faq, idx) => {
                    const isOpenFaq = openFaqIndex === idx;
                    return (
                      <div key={idx} className={`faq-item ${isOpenFaq ? 'open' : ''}`}>
                        <button
                          type="button"
                          className="faq-question-btn"
                          onClick={() => toggleFaq(idx)}
                          aria-expanded={isOpenFaq}
                        >
                          <span>{faq.q}</span>
                          <IconChevronDown size={16} className={`chevron-icon ${isOpenFaq ? 'rotated' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {isOpenFaq && (
                            <motion.div
                              className="faq-answer-wrap"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <p className="faq-answer-text">{faq.a}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="guide-modal-footer">
              <div className="footer-left">
                <button
                  type="button"
                  className="btn-skip"
                  onClick={onClose}
                >
                  Skip Guide
                </button>
              </div>

              {/* Progress Dots */}
              <div className="footer-center">
                {STEPS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`nav-dot ${activeStep === s.id ? 'active' : ''}`}
                    onClick={() => handleTabClick(s.id)}
                    aria-label={`Go to step ${s.id}`}
                  />
                ))}
              </div>

              {/* Nav Controls */}
              <div className="footer-right">
                {activeStep > 1 && (
                  <button
                    type="button"
                    className="btn-prev"
                    onClick={handlePrev}
                  >
                    <IconChevronLeft size={16} />
                    <span>Back</span>
                  </button>
                )}

                {activeStep < STEPS.length ? (
                  <button
                    type="button"
                    className="btn-next"
                    onClick={handleNext}
                  >
                    <span>Next Step</span>
                    <IconChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-finish"
                    onClick={handleNext}
                  >
                    <IconRocket size={17} />
                    <span>Got It! Start Submitting</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserGuideModal;
