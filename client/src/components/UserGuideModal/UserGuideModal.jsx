import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconX, 
  IconChevronRight, 
  IconChevronLeft, 
  IconSchool, 
  IconBuildingBank, 
  IconUsersGroup, 
  IconBulb, 
  IconShieldLock, 
  IconUserCheck, 
  IconPhotoPlus, 
  IconCpu, 
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
  IconFileText,
  IconAlertCircle
} from '@tabler/icons-react';
import { useBodyScrollLock } from '../../utils/scrollLock';
import './UserGuideModal.scss';

const STEPS = [
  {
    id: 1,
    title: 'Select a Category',
    tabLabel: '1. Category',
    badge: 'Step 1 of 4 • Category',
    summary: 'Identify the exact area of campus life your feedback addresses to ensure it reaches the appropriate committee.'
  },
  {
    id: 2,
    title: 'Provide Details & Evidence',
    tabLabel: '2. Details',
    badge: 'Step 2 of 4 • Details',
    summary: 'Give your suggestion a clear title, specify details and locations, and optionally attach a photo up to 2MB.'
  },
  {
    id: 3,
    title: 'Choose How to Submit',
    tabLabel: '3. Privacy & Submit',
    badge: 'Step 3 of 4 • Submission',
    summary: 'Decide whether to submit 100% anonymously or include your contact details for direct committee follow-ups.'
  },
  {
    id: 4,
    title: 'AI Priority & Tracking',
    tabLabel: '4. Tracking',
    badge: 'Step 4 of 4 • Tracking & AI',
    summary: 'InnoVoice AI analyzes urgency, generates your unique tracking code, and provides real-time resolution updates.'
  }
];

const CATEGORIES_DATA = [
  {
    value: 'academic',
    label: 'Academic Services',
    Icon: IconSchool,
    desc: 'Curriculum, teaching methods, learning resources, classroom facilities'
  },
  {
    value: 'administrative',
    label: 'Administrative Matters',
    Icon: IconBuildingBank,
    desc: 'Policies, procedures, enrollment, records, campus facilities'
  },
  {
    value: 'extracurricular',
    label: 'Extracurricular Activities',
    Icon: IconUsersGroup,
    desc: 'Events, student organizations, sports, clubs, activities'
  },
  {
    value: 'general',
    label: 'General Improvements',
    Icon: IconBulb,
    desc: 'Overall campus life, welfare, safety, and other concerns'
  }
];

const STATUS_STAGES = [
  {
    key: 'submitted',
    label: 'Submitted',
    color: '#9CA3AF',
    desc: 'Your suggestion is received and registered in the SSG database with your tracking code.'
  },
  {
    key: 'under_review',
    label: 'Under Review',
    color: '#F59E0B',
    desc: 'The SSG Feedback Committee is actively reviewing the report and verifying details.'
  },
  {
    key: 'forwarded',
    label: 'Forwarded',
    color: '#3B82F6',
    desc: 'Official endorsement sent to the relevant department (e.g. Campus Maintenance, Dean, Registrar).'
  },
  {
    key: 'action_taken',
    label: 'Action Taken',
    color: '#8B5CF6',
    desc: 'Repairs, policy updates, or operational changes are actively underway on campus.'
  },
  {
    key: 'resolved',
    label: 'Resolved',
    color: '#10B981',
    desc: 'The issue has been successfully resolved or addressed with official committee remarks.'
  }
];

const FAQS = [
  {
    q: 'How does Anonymous Mode protect my identity?',
    a: 'When you choose "Anonymous" in Step 3, the database only stores the suggestion text and category. Your name, email, student ID, and IP address are never attached or revealed to SSG officers.'
  },
  {
    q: 'What happens if I sign in with my Google account?',
    a: 'Signing in allows your submissions to be automatically saved into your personal "My Reports" vault. You can track progress across devices with one click without needing to remember tracking codes.'
  },
  {
    q: 'What image formats and file sizes are supported?',
    a: 'InnoVoice supports JPEG, PNG, GIF, and WebP image attachments up to 2MB in size. Clear photo proof of damaged chairs, broken facilities, or schedules helps speed up resolution.'
  },
  {
    q: 'How does the AI Priority analysis work?',
    a: 'Upon submission, InnoVoice uses Gemini AI to evaluate urgency. Urgent facility repairs or health/safety concerns are automatically flagged so student leaders can take rapid action.'
  }
];

const UserGuideModal = ({ isOpen, onClose, onStartSubmitting }) => {
  useBodyScrollLock(isOpen);

  const [activeStep, setActiveStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [selectedDemoCat, setSelectedDemoCat] = useState('administrative');
  const [demoIncludeDetails, setDemoIncludeDetails] = useState(false);
  const [demoShowPhoto, setDemoShowPhoto] = useState(true);
  const [demoCopied, setDemoCopied] = useState(false);
  const [activeStatusKey, setActiveStatusKey] = useState('under_review');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Keyboard navigation: Escape closes, Arrow keys navigate steps
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
    setTimeout(() => setDemoCopied(false), 2000);
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
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 18 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          >
            {/* Modal Header */}
            <div className="guide-modal-header">
              <div className="header-branding">
                <div className="guide-badge">
                  <span className="guide-badge-dot"></span>
                  <span>How InnoVoice Works</span>
                </div>
                <h2>Student Submission Guide</h2>
                <p className="header-subtitle">
                  A 4-step walkthrough of the official SSG suggestion, review, and resolution process.
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

            {/* Stepper Navigation Tabs */}
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
                  initial={{ opacity: 0, x: direction > 0 ? 24 : -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -24 : 24 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="step-content-grid"
                >
                  {/* LEFT: Instructions & Best Practices */}
                  <div className="step-text-column">
                    <div className="step-tag">{STEPS[activeStep - 1].badge}</div>
                    <h3 className="step-title">{STEPS[activeStep - 1].title}</h3>
                    <p className="step-summary">{STEPS[activeStep - 1].summary}</p>

                    {/* Step 1: Category Selection */}
                    {activeStep === 1 && (
                      <div className="guidance-list">
                        <div className="guidance-item">
                          <div className="item-bullet">1</div>
                          <div>
                            <strong>Accurate Routing:</strong> Selecting the proper domain ensures your submission directly reaches the right student committee and university department.
                          </div>
                        </div>
                        <div className="guidance-item">
                          <div className="item-bullet">2</div>
                          <div>
                            <strong>4 Official Categories:</strong>
                            <ul className="sub-bullets">
                              <li><strong>Academic Services:</strong> Classrooms, curriculum, learning resources, and teaching concerns.</li>
                              <li><strong>Administrative Matters:</strong> Campus infrastructure, facilities, repairs, enrollment, and policies.</li>
                              <li><strong>Extracurricular Activities:</strong> Student clubs, sports, campus events, and cultural affairs.</li>
                              <li><strong>General Improvements:</strong> Campus safety, canteens, clean water, Wi-Fi, and student welfare.</li>
                            </ul>
                          </div>
                        </div>
                        <div className="pro-tip-box">
                          <IconSparkles size={18} className="tip-icon" />
                          <span><strong>Tip:</strong> If your issue covers multiple areas (e.g. broken AC in a computer lab), choose <em>Administrative Matters</em> for physical repairs or <em>Academic Services</em> for instructional equipment.</span>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Details & Evidence */}
                    {activeStep === 2 && (
                      <div className="guidance-list">
                        <div className="guidance-item">
                          <div className="item-bullet">1</div>
                          <div>
                            <strong>Clear Title (Max 200 characters):</strong> Summarize the specific issue in 5–10 words (e.g., <em>"Main Library 2nd Floor Wi-Fi Disconnection"</em>).
                          </div>
                        </div>
                        <div className="guidance-item">
                          <div className="item-bullet">2</div>
                          <div>
                            <strong>Detailed Description (Max 2000 characters):</strong> State the exact building, floor, room number, or date. Explain the root problem and who is affected.
                          </div>
                        </div>
                        <div className="guidance-item">
                          <div className="item-bullet">3</div>
                          <div>
                            <strong>Attach Photo Evidence (Max 2MB):</strong> Uploading an image (JPEG, PNG, GIF, WebP) gives committee officers visual proof to fast-track repairs.
                          </div>
                        </div>
                        <div className="pro-tip-box">
                          <IconPhotoPlus size={18} className="tip-icon" />
                          <span><strong>Evidence Guideline:</strong> Photos of facility maintenance, broken chairs, water dispensers, or classroom equipment help the university inspect without delay.</span>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Choose How to Submit */}
                    {activeStep === 3 && (
                      <div className="guidance-list">
                        <div className="guidance-item">
                          <div className="item-bullet">1</div>
                          <div>
                            <strong>Anonymous Mode (Default):</strong> Your name, email, student ID, and IP address are never stored or shown to SSG officers. You receive a unique tracking code to follow updates.
                          </div>
                        </div>
                        <div className="guidance-item">
                          <div className="item-bullet">2</div>
                          <div>
                            <strong>Include My Details:</strong> Share your contact info (Name, CTU Course, Year Level, Email) if you want student council officers to coordinate with you directly.
                          </div>
                        </div>
                        <div className="guidance-item">
                          <div className="item-bullet">3</div>
                          <div>
                            <strong>Google Sign-In Sync:</strong> Sign in with your Google account anytime. Even if you choose Anonymous, the report is saved automatically to your private <em>"My Reports"</em> list!
                          </div>
                        </div>
                        <div className="pro-tip-box">
                          <IconShieldLock size={18} className="tip-icon" />
                          <span><strong>100% Privacy Guarantee:</strong> Anonymous submissions never reveal identity, allowing every student to speak freely and safely.</span>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Tracking & AI Resolution */}
                    {activeStep === 4 && (
                      <div className="guidance-list">
                        <div className="guidance-item">
                          <div className="item-bullet">1</div>
                          <div>
                            <strong>Instant AI Priority:</strong> Built-in Gemini AI reviews your suggestion severity and flags urgent safety or facility concerns for immediate attention.
                          </div>
                        </div>
                        <div className="guidance-item">
                          <div className="item-bullet">2</div>
                          <div>
                            <strong>Save Your Code (e.g. <code>IV-8X4K9</code>):</strong> Copy and save the tracking code from the success screen. You can track it anytime via <em>"Track Code"</em> in the navbar.
                          </div>
                        </div>
                        <div className="guidance-item">
                          <div className="item-bullet">3</div>
                          <div>
                            <strong>5-Stage Resolution Pipeline:</strong> Track progress through <em>Submitted</em> ➔ <em>Under Review</em> ➔ <em>Forwarded</em> ➔ <em>Action Taken</em> ➔ <em>Resolved</em>, including official committee remarks.
                          </div>
                        </div>
                        <div className="pro-tip-box">
                          <IconCircleCheck size={18} className="tip-icon" />
                          <span><strong>Follow Up Anytime:</strong> Resolution decisions, university endorsements, and SSG committee actions will appear live on your tracking card.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RIGHT: High-Fidelity Interactive Preview Widget */}
                  <div className="step-mockup-column">
                    {/* Step 1 Interactive Replica */}
                    {activeStep === 1 && (
                      <div className="mockup-card">
                        <div className="mockup-header">
                          <span className="mockup-dot red"></span>
                          <span className="mockup-dot yellow"></span>
                          <span className="mockup-dot green"></span>
                          <span className="mockup-label">Step 1 • Category Selection</span>
                        </div>
                        <div className="mockup-content">
                          <p className="mockup-hint">Click a category card below to preview selection:</p>
                          <div className="demo-categories-grid">
                            {CATEGORIES_DATA.map((cat) => {
                              const CatIcon = cat.Icon;
                              const isSelected = selectedDemoCat === cat.value;
                              return (
                                <div 
                                  key={cat.value}
                                  className={`demo-cat-card ${isSelected ? 'active' : ''}`}
                                  onClick={() => setSelectedDemoCat(cat.value)}
                                >
                                  <div className="cat-icon-wrap">
                                    <CatIcon size={20} />
                                  </div>
                                  <div className="cat-meta">
                                    <strong>{cat.label}</strong>
                                    <span>{cat.desc}</span>
                                  </div>
                                  <div className="cat-check-circle">
                                    {isSelected && <IconCheck size={12} stroke={3} />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="demo-continue-preview">
                            <span className="status-note">
                              Selected: <strong>{CATEGORIES_DATA.find(c => c.value === selectedDemoCat)?.label}</strong>
                            </span>
                            <div className="demo-btn-pill">
                              <span>Continue</span>
                              <IconChevronRight size={14} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2 Interactive Replica */}
                    {activeStep === 2 && (
                      <div className="mockup-card">
                        <div className="mockup-header">
                          <span className="mockup-dot red"></span>
                          <span className="mockup-dot yellow"></span>
                          <span className="mockup-dot green"></span>
                          <span className="mockup-label">Step 2 • Form Details & Photo</span>
                        </div>
                        <div className="mockup-content">
                          <div className="demo-category-pill">
                            <IconBuildingBank size={14} />
                            <span>Administrative Matters</span>
                            <span className="badge-change">Change</span>
                          </div>

                          <div className="demo-field">
                            <div className="demo-field-top">
                              <span className="demo-label">Suggestion Title *</span>
                              <span className="demo-counter">46/200</span>
                            </div>
                            <div className="demo-input-box strong">
                              Broken Ceiling Fan in Room 204 (BIT Building)
                            </div>
                          </div>

                          <div className="demo-field">
                            <div className="demo-field-top">
                              <span className="demo-label">Detailed Description *</span>
                              <span className="demo-counter">164/2000</span>
                            </div>
                            <div className="demo-textarea-box">
                              "The ceiling fan in Room 204 makes a loud clicking noise and stops spinning during afternoon classes. Room temperature is very hot for 40 students. Inspection needed."
                            </div>
                          </div>

                          <div className="demo-field">
                            <div className="demo-field-top">
                              <span className="demo-label">Attach Photo (Optional • Max 2MB)</span>
                              <button 
                                type="button" 
                                className="toggle-photo-demo"
                                onClick={() => setDemoShowPhoto(!demoShowPhoto)}
                              >
                                {demoShowPhoto ? 'Hide Preview' : 'Show Photo'}
                              </button>
                            </div>

                            {demoShowPhoto ? (
                              <div className="demo-attached-chip">
                                <span className="photo-icon">📷</span>
                                <div className="photo-details">
                                  <strong>fan-room-204-ctu.jpg</strong>
                                  <span>1.2 MB • Ready to submit</span>
                                </div>
                                <span className="photo-badge">Attached</span>
                              </div>
                            ) : (
                              <div className="demo-upload-placeholder">
                                <IconPhotoPlus size={20} />
                                <span>Click or drag photo here (Max 2MB)</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3 Interactive Replica */}
                    {activeStep === 3 && (
                      <div className="mockup-card">
                        <div className="mockup-header">
                          <span className="mockup-dot red"></span>
                          <span className="mockup-dot yellow"></span>
                          <span className="mockup-dot green"></span>
                          <span className="mockup-label">Step 3 • Privacy & Contact Options</span>
                        </div>
                        <div className="mockup-content">
                          <p className="mockup-hint">Toggle between submission modes to preview:</p>
                          <div className="demo-privacy-toggle">
                            <div 
                              className={`toggle-option ${!demoIncludeDetails ? 'active' : ''}`}
                              onClick={() => setDemoIncludeDetails(false)}
                            >
                              <div className="opt-icon">
                                <IconShieldLock size={18} />
                              </div>
                              <div className="opt-text">
                                <strong>Anonymous</strong>
                                <span>100% private, no identity saved</span>
                              </div>
                              <div className="opt-radio">
                                {!demoIncludeDetails && <div className="radio-inner" />}
                              </div>
                            </div>

                            <div 
                              className={`toggle-option ${demoIncludeDetails ? 'active' : ''}`}
                              onClick={() => setDemoIncludeDetails(true)}
                            >
                              <div className="opt-icon">
                                <IconUserCheck size={18} />
                              </div>
                              <div className="opt-text">
                                <strong>Include My Details</strong>
                                <span>Share course & email for follow-up</span>
                              </div>
                              <div className="opt-radio">
                                {demoIncludeDetails && <div className="radio-inner" />}
                              </div>
                            </div>
                          </div>

                          {/* Dynamic fields preview */}
                          <AnimatePresence mode="wait">
                            {demoIncludeDetails ? (
                              <motion.div
                                key="details-open"
                                className="demo-contact-details"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="demo-sub-row">
                                  <div className="mini-field">
                                    <span className="lbl">Full Name</span>
                                    <div className="val">Student Name</div>
                                  </div>
                                  <div className="mini-field">
                                    <span className="lbl">Course</span>
                                    <div className="val">BSIT (Information Tech)</div>
                                  </div>
                                </div>
                                <div className="demo-sub-row">
                                  <div className="mini-field">
                                    <span className="lbl">Year Level</span>
                                    <div className="val">3rd Year</div>
                                  </div>
                                  <div className="mini-field">
                                    <span className="lbl">Email Address</span>
                                    <div className="val">student@ctu.edu.ph</div>
                                  </div>
                                </div>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="anon-badge"
                                className="demo-anon-badge"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <IconShieldLock size={18} className="shield-svg" />
                                <div>
                                  <strong>Protected by Anonymous Mode</strong>
                                  <p>SSG officers will only see your suggestion content and category.</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="demo-submit-bar">
                            <IconCheck size={16} />
                            <span>Submit Suggestion</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4 Interactive Replica */}
                    {activeStep === 4 && (
                      <div className="mockup-card">
                        <div className="mockup-header">
                          <span className="mockup-dot red"></span>
                          <span className="mockup-dot yellow"></span>
                          <span className="mockup-dot green"></span>
                          <span className="mockup-label">Step 4 • Tracking & Resolution</span>
                        </div>
                        <div className="mockup-content">
                          {/* AI Priority Banner */}
                          <div className="demo-ai-box">
                            <div className="ai-icon-chip">
                              <IconCpu size={16} />
                            </div>
                            <div className="ai-meta">
                              <div className="ai-top">
                                <span className="ai-tag high">HIGH PRIORITY</span>
                                <span className="ai-badge-verified">
                                  <IconCheck size={11} stroke={3} /> Gemini AI Analyzed
                                </span>
                              </div>
                              <p className="ai-desc">
                                "Classroom maintenance issue affecting daily student learning conditions."
                              </p>
                            </div>
                          </div>

                          {/* Tracking Code with real Copy button */}
                          <div className="demo-tracking-card">
                            <span className="card-label">Your Unique Tracking Code:</span>
                            <div className="tracking-code-row">
                              <code className="code-text">IV-8X4K9</code>
                              <button 
                                type="button" 
                                className="copy-action-btn"
                                onClick={handleCopyDemoCode}
                              >
                                {demoCopied ? <IconCheck size={15} /> : <IconCopy size={15} />}
                                <span>{demoCopied ? 'Copied!' : 'Copy Code'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Interactive Status Pipeline */}
                          <div className="demo-lifecycle-container">
                            <span className="lifecycle-label">Interactive Status Roadmap (Click to inspect):</span>
                            <div className="status-chips-row">
                              {STATUS_STAGES.map((st) => (
                                <button
                                  key={st.key}
                                  type="button"
                                  className={`stage-chip ${activeStatusKey === st.key ? 'active' : ''}`}
                                  onClick={() => setActiveStatusKey(st.key)}
                                >
                                  {st.label}
                                </button>
                              ))}
                            </div>
                            <div className="active-stage-desc">
                              <IconInfoCircle size={15} className="info-icon" />
                              <span>{STATUS_STAGES.find(s => s.key === activeStatusKey)?.desc}</span>
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
                  <h4>Frequently Asked Questions & Submission Rules</h4>
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
                              transition={{ duration: 0.18 }}
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
                  Close Guide
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
