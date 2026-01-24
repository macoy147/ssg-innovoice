import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { QR_CONFIG, APP_NAME } from '../../config/app';
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
            {/* Print-only header */}
            <div className="print-header">
              <img src="/ctu_logo.jpg" alt="CTU Logo" className="print-logo" />
              <h1 className="print-title">{APP_NAME}</h1>
            </div>

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

            {/* Print-only scan button */}
            <div className="print-scan-button">
              SCAN ME!
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
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .qr-modal-overlay {
            visibility: visible;
            position: fixed;
            background: linear-gradient(135deg, #8B0000 0%, #DC143C 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
          }
          .qr-modal-content,
          .qr-modal-content * {
            visibility: visible;
          }
          .qr-modal-content {
            position: static;
            box-shadow: none;
            max-width: 100%;
            background: transparent;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .qr-modal-header,
          .qr-modal-footer,
          .qr-info {
            display: none !important;
          }
          .qr-modal-body {
            padding: 60px 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 40px;
          }
          .print-header {
            display: flex !important;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            margin-bottom: 20px;
          }
          .print-logo {
            display: block !important;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
          }
          .print-title {
            display: block !important;
            color: white;
            font-size: 48px;
            font-weight: bold;
            margin: 0;
            text-align: center;
          }
          .qr-code-container {
            background: white;
            padding: 30px;
            border-radius: 30px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
          }
          .qr-code-svg {
            width: 400px !important;
            height: 400px !important;
          }
          .print-scan-button {
            display: block !important;
            background: rgba(255, 255, 255, 0.9);
            color: #8B0000;
            font-size: 36px;
            font-weight: bold;
            padding: 20px 60px;
            border-radius: 50px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            margin-top: 20px;
          }
          .qr-url {
            display: block !important;
            background: rgba(255, 255, 255, 0.15);
            padding: 20px 40px;
            border-radius: 15px;
            margin-top: 30px;
          }
          .qr-url .url-label {
            display: inline !important;
            color: white;
            font-size: 18px;
            font-weight: 600;
            margin-right: 10px;
          }
          .qr-url .url-text {
            display: inline !important;
            color: white;
            font-size: 20px;
            font-weight: 500;
          }
        }
      `}</style>
    </AnimatePresence>
  );
}

export default QRCodeModal;
