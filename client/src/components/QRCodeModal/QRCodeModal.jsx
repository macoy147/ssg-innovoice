import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { QR_CONFIG } from '../../config/app';
import './QRCodeModal.scss';

function QRCodeModal({ isOpen, onClose, url, title, description }) {
  if (!isOpen) return null;

  // Use provided values or defaults from config
  const qrUrl = url || QR_CONFIG.url;
  const qrTitle = title || QR_CONFIG.title;
  const qrDescription = description || QR_CONFIG.description;

  const handleDownload = () => {
    // Create a temporary canvas to convert SVG to PNG
    const svg = document.querySelector('.qr-code-svg');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // Get SVG data
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Download as PNG
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'ssg-innovoice-qr.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="qr-modal-overlay" 
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div 
          className="qr-modal-content" 
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            duration: 0.3
          }}
        >
          <div className="qr-modal-header">
            <h2>📱 {qrTitle}</h2>
            <motion.button 
              className="close-btn" 
              onClick={onClose} 
              aria-label="Close"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              ×
            </motion.button>
          </div>

          <motion.div 
            className="qr-modal-body"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <div className="qr-code-container">
              <QRCodeSVG 
                className="qr-code-svg"
                value={qrUrl}
                size={QR_CONFIG.size}
                level={QR_CONFIG.level}
                bgColor={QR_CONFIG.bgColor}
                fgColor={QR_CONFIG.fgColor}
              />
            </div>

            <div className="qr-info">
              <p className="qr-description">
                {qrDescription}
              </p>
              <div className="qr-url">
                <span className="url-label">URL:</span>
                <span className="url-text">{qrUrl}</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="qr-modal-footer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <motion.button 
              className="qr-action-btn download-btn" 
              onClick={handleDownload}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              Download
            </motion.button>
            <motion.button 
              className="qr-action-btn print-btn" 
              onClick={handlePrint}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
              </svg>
              Print
            </motion.button>
            <motion.button 
              className="qr-action-btn close-btn-footer" 
              onClick={onClose}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              Close
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .qr-modal-content,
          .qr-modal-content * {
            visibility: visible;
          }
          .qr-modal-overlay {
            position: static;
            background: white;
          }
          .qr-modal-content {
            position: static;
            box-shadow: none;
            max-width: 100%;
          }
          .qr-modal-header button,
          .qr-modal-footer {
            display: none;
          }
          .qr-code-container {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </AnimatePresence>
  );
}

export default QRCodeModal;
