// Application Configuration

// Primary domain (custom domain)
export const APP_URL = 'https://ssginnovoice.filipino.gg';

// Alternative URLs (for reference)
export const VERCEL_URL = 'https://voiceitshapeit.vercel.app';

// App Information
export const APP_NAME = 'SSG InnoVoice';
export const APP_TAGLINE = 'Speak Ideas. Spark Change.';
export const APP_DESCRIPTION = 'Student Suggestion System - CTU Daanbantayan Campus';

// Organization
export const ORG_NAME = 'CTU Daanbantayan Campus';
export const ORG_DEPARTMENT = 'Supreme Student Government';
export const ORG_SERIES = 'Series 2025-2026';

// QR Code Configuration
export const QR_CONFIG = {
  // Main app URL for QR codes
  url: APP_URL,
  
  // QR Code settings
  size: 200,
  level: 'M', // Error correction: L, M, Q, H
  bgColor: '#ffffff',
  fgColor: '#000000',
  
  // Modal settings
  title: 'Scan to Access SSG InnoVoice',
  description: 'Scan this QR code with your phone camera to access the suggestion form',
};

// Tracking URL builder
export const getTrackingUrl = (trackingCode) => {
  return `${APP_URL}/track/${trackingCode}`;
};

// Admin URL
export const getAdminUrl = () => {
  return `${APP_URL}/admin`;
};

export default {
  APP_URL,
  VERCEL_URL,
  APP_NAME,
  APP_TAGLINE,
  APP_DESCRIPTION,
  ORG_NAME,
  ORG_DEPARTMENT,
  ORG_SERIES,
  QR_CONFIG,
  getTrackingUrl,
  getAdminUrl,
};
