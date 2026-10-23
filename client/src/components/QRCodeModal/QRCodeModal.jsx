import { motion, AnimatePresence } from 'framer-motion';
import { IconDeviceMobile, IconX, IconDownload } from '@tabler/icons-react';
import { QR_CONFIG } from '../../config/app';
import { useBodyScrollLock } from '../../utils/scrollLock';
import './QRCodeModal.scss';

function QRCodeModal({ isOpen, onClose, url, title, description }) {
  useBodyScrollLock(isOpen);

  // Use provided values or defaults from config
  const qrUrl = url || QR_CONFIG.url;
  const qrTitle = title || QR_CONFIG.title;
  const qrDescription = description || QR_CONFIG.description;
  const qrImage = QR_CONFIG.image || '/ssg-qr-code.png';

  return (
    <AnimatePresence>
      {isOpen && (
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
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ 
              type: "spring", 
              stiffness: 350, 
              damping: 28 
            }}
          >
            <div className="qr-modal-header">
              <div className="modal-title-lockup">
                <IconDeviceMobile size={22} className="modal-header-icon" />
                <h2>{qrTitle}</h2>
              </div>
              <motion.button 
                className="close-btn" 
                onClick={onClose} 
                aria-label="Close"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <IconX size={18} />
              </motion.button>
            </div>

            <motion.div 
              className="qr-modal-body"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <div className="qr-code-container">
                <img 
                  src={qrImage} 
                  alt="SSG InnoVoice Official QR Code" 
                  className="qr-code-img"
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

              {/* Action buttons */}
              <div className="qr-actions">
                <a 
                  href={qrImage} 
                  download="SSG-InnoVoice-QR-Code.png" 
                  className="qr-btn qr-btn-primary"
                >
                  <IconDownload size={18} />
                  <span>Download QR Code</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default QRCodeModal;
