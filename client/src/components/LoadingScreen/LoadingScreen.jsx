import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LoadingScreen.scss';

const LoadingScreen = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [connectionSpeed, setConnectionSpeed] = useState('fast');
  const [loadingText, setLoadingText] = useState('Initializing...');

  useEffect(() => {
    // Detect connection speed
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === '4g') {
        setConnectionSpeed('fast');
      } else if (effectiveType === '3g') {
        setConnectionSpeed('medium');
      } else {
        setConnectionSpeed('slow');
      }
    }

    // Simulate loading with dynamic speed
    const loadingSteps = [
      { progress: 20, text: 'Loading resources...' },
      { progress: 40, text: 'Connecting to server...' },
      { progress: 60, text: 'Preparing your experience...' },
      { progress: 80, text: 'Almost there...' },
      { progress: 100, text: 'Ready!' }
    ];

    let currentStep = 0;
    const baseSpeed = connectionSpeed === 'fast' ? 300 : connectionSpeed === 'medium' ? 500 : 800;

    const interval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        setProgress(loadingSteps[currentStep].progress);
        setLoadingText(loadingSteps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onLoadComplete();
        }, 500);
      }
    }, baseSpeed);

    return () => clearInterval(interval);
  }, [connectionSpeed, onLoadComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="loading-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated Background */}
        <div className="loading-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="grid-pattern"></div>
        </div>

        {/* Main Content */}
        <div className="loading-content">
          {/* Logo Animation */}
          <motion.div
            className="logo-container"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              duration: 1
            }}
          >
            <motion.div
              className="logo-ring"
              animate={{
                rotate: 360,
              }}
              transition={{
                rotate: { duration: 4, repeat: Infinity, ease: "linear" }
              }}
            />
            <motion.img 
              src="/ssg-logo.jpg" 
              alt="SSG Logo" 
              className="ssg-logo"
              animate={{
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            className="loading-title"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            SSG InnoVoice
          </motion.h1>

          <motion.p
            className="loading-subtitle"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Speak Ideas. Spark Change.
          </motion.p>

          <motion.p
            className="loading-campus"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            CTU Daanbantayan Campus
          </motion.p>

          {/* Progress Bar */}
          <motion.div
            className="progress-container"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="progress-info">
              <span className="progress-text">{loadingText}</span>
              <span className="progress-percentage">{progress}%</span>
            </div>
          </motion.div>

          {/* Connection Indicator */}
          <motion.div
            className={`connection-indicator ${connectionSpeed}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="connection-dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
            <span className="connection-text">
              {connectionSpeed === 'fast' && 'Fast Connection'}
              {connectionSpeed === 'medium' && 'Stable Connection'}
              {connectionSpeed === 'slow' && 'Loading...'}
            </span>
          </motion.div>
        </div>

        {/* Floating Particles */}
        <div className="particles">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: Math.random() * 0.5 + 0.5,
                opacity: 0
              }}
              animate={{
                y: [null, Math.random() * -100 - 50],
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingScreen;
