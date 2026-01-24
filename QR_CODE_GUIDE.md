# QR Code Implementation Guide

## 📱 Overview

This guide shows how to generate QR codes for your SSG InnoVoice web app using `qrcode.react` - a free, open-source library that generates QR codes directly in the browser.

## ✅ Why qrcode.react?

- ✅ **Free & Open Source** - No API keys or costs
- ✅ **Works Offline** - Generates QR codes in the browser
- ✅ **Fast** - Instant generation, no server calls
- ✅ **Customizable** - Colors, size, error correction, logo
- ✅ **React Native** - Works with React components
- ✅ **Lightweight** - Small bundle size (~10KB)
- ✅ **No External Dependencies** - No third-party services

## 📦 Installation

Already installed! ✅

```bash
npm install qrcode.react
```

## 🎨 Basic Usage

### 1. Simple QR Code

```jsx
import { QRCodeSVG } from 'qrcode.react';

function MyComponent() {
  return (
    <QRCodeSVG 
      value="https://voiceitshapeit.vercel.app" 
      size={200}
    />
  );
}
```

### 2. Customized QR Code

```jsx
import { QRCodeSVG } from 'qrcode.react';

function CustomQRCode() {
  return (
    <QRCodeSVG 
      value="https://voiceitshapeit.vercel.app"
      size={256}
      bgColor="#ffffff"
      fgColor="#000000"
      level="H" // Error correction level: L, M, Q, H
      includeMargin={true}
    />
  );
}
```

### 3. QR Code with Logo (SSG Logo)

```jsx
import { QRCodeSVG } from 'qrcode.react';

function QRCodeWithLogo() {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <QRCodeSVG 
        value="https://voiceitshapeit.vercel.app"
        size={300}
        level="H" // High error correction for logo overlay
        includeMargin={true}
      />
      {/* Center logo */}
      <img 
        src="/ssg-logo.png"
        alt="SSG Logo"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60px',
          height: '60px',
          backgroundColor: 'white',
          padding: '5px',
          borderRadius: '8px'
        }}
      />
    </div>
  );
}
```

## 🎯 Use Cases for Your App

### 1. Main App QR Code (Homepage)

Generate a QR code that links to your web app:

```jsx
<QRCodeSVG 
  value="https://voiceitshapeit.vercel.app"
  size={200}
  level="M"
  includeMargin={true}
/>
```

### 2. Tracking Code QR (After Submission)

Generate a QR code for tracking a specific suggestion:

```jsx
function TrackingQRCode({ trackingCode }) {
  const trackingUrl = `https://voiceitshapeit.vercel.app/track/${trackingCode}`;
  
  return (
    <div className="tracking-qr">
      <h3>Scan to Track Your Suggestion</h3>
      <QRCodeSVG 
        value={trackingUrl}
        size={200}
        level="M"
      />
      <p>Tracking Code: {trackingCode}</p>
    </div>
  );
}
```

### 3. Downloadable QR Code

Allow users to download the QR code:

```jsx
import { QRCodeCanvas } from 'qrcode.react';
import { useRef } from 'react';

function DownloadableQR({ url }) {
  const qrRef = useRef();

  const downloadQR = () => {
    const canvas = qrRef.current.querySelector('canvas');
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'ssg-innovoice-qr.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div>
      <div ref={qrRef}>
        <QRCodeCanvas 
          value={url}
          size={300}
          level="H"
        />
      </div>
      <button onClick={downloadQR}>Download QR Code</button>
    </div>
  );
}
```

### 4. Printable QR Code Poster

Create a printable poster with QR code:

```jsx
function PrintableQRPoster() {
  const appUrl = "https://voiceitshapeit.vercel.app";

  return (
    <div className="qr-poster" style={{
      width: '8.5in',
      height: '11in',
      padding: '1in',
      backgroundColor: 'white',
      textAlign: 'center'
    }}>
      <h1>SSG InnoVoice</h1>
      <h2>Speak Ideas. Spark Change.</h2>
      
      <div style={{ margin: '40px 0' }}>
        <QRCodeSVG 
          value={appUrl}
          size={400}
          level="H"
          includeMargin={true}
        />
      </div>
      
      <h3>Scan to Submit Your Suggestion</h3>
      <p style={{ fontSize: '18px' }}>
        Or visit: {appUrl}
      </p>
      
      <div style={{ marginTop: '40px', fontSize: '14px', color: '#666' }}>
        <p>CTU Daanbantayan Campus</p>
        <p>Supreme Student Government</p>
      </div>
    </div>
  );
}
```

## 🎨 Styling Examples

### Colored QR Code (SSG Colors)

```jsx
<QRCodeSVG 
  value="https://voiceitshapeit.vercel.app"
  size={250}
  bgColor="#ffffff"
  fgColor="#667eea" // Purple gradient color
  level="M"
  includeMargin={true}
/>
```

### QR Code with Border

```jsx
<div style={{
  padding: '20px',
  backgroundColor: 'white',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  display: 'inline-block'
}}>
  <QRCodeSVG 
    value="https://voiceitshapeit.vercel.app"
    size={200}
    level="M"
  />
</div>
```

## 📱 Responsive QR Code

```jsx
function ResponsiveQR({ value }) {
  const [size, setSize] = useState(200);

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 480) setSize(150);
      else if (width < 768) setSize(200);
      else setSize(250);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <QRCodeSVG 
      value={value}
      size={size}
      level="M"
    />
  );
}
```

## 🖨️ Print Functionality

```jsx
function PrintableQR() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-qr, .printable-qr * {
            visibility: visible;
          }
          .printable-qr {
            position: absolute;
            left: 0;
            top: 0;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
      
      <div className="printable-qr">
        <h1>SSG InnoVoice</h1>
        <QRCodeSVG 
          value="https://voiceitshapeit.vercel.app"
          size={400}
          level="H"
        />
        <p>Scan to submit your suggestion</p>
      </div>
      
      <button className="no-print" onClick={handlePrint}>
        Print QR Code
      </button>
    </>
  );
}
```

## 🎯 Implementation in Your App

### Update Your QR Modal Component

Find your QR modal in the app and update it:

```jsx
import { QRCodeSVG } from 'qrcode.react';

function QRModal({ isOpen, onClose }) {
  const appUrl = "https://voiceitshapeit.vercel.app";

  if (!isOpen) return null;

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="qr-modal-header">
          <h2>📱 Scan QR Code</h2>
          <button onClick={onClose}>×</button>
        </div>
        
        <div className="qr-modal-body">
          <div className="qr-container">
            <QRCodeSVG 
              value={appUrl}
              size={280}
              level="M"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
          
          <div className="qr-info">
            <p>Scan this QR code to access SSG InnoVoice</p>
            <p className="url">{appUrl}</p>
          </div>
        </div>
        
        <div className="qr-modal-footer">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
```

## 📊 QR Code Options

### Size
- Small: 150-200px (mobile screens)
- Medium: 200-300px (desktop, posters)
- Large: 300-500px (banners, print)

### Error Correction Levels
- **L (Low)**: ~7% correction - Use for clean environments
- **M (Medium)**: ~15% correction - Default, good for most uses
- **Q (Quartile)**: ~25% correction - Use with logos
- **H (High)**: ~30% correction - Use with logos or damaged codes

### Format
- **SVG** (`QRCodeSVG`): Scalable, smaller file size, better for web
- **Canvas** (`QRCodeCanvas`): Better for downloading as image

## 🆚 Alternative Options (If Needed)

### 1. QRCode.js (Vanilla JS)
```bash
npm install qrcodejs2
```
- Good for non-React projects
- More manual setup

### 2. react-qr-code
```bash
npm install react-qr-code
```
- Similar to qrcode.react
- Different API

### 3. Online QR Generators (Not Recommended)

If you absolutely need an online service:

**Free Options:**
- **QR Code Generator** - https://www.qr-code-generator.com/
- **QR Code Monkey** - https://www.qrcode-monkey.com/
- **GoQR.me** - https://goqr.me/

**Why not recommended:**
- ❌ Requires internet connection
- ❌ Slower (API calls)
- ❌ May have rate limits
- ❌ Less control over design
- ❌ Privacy concerns (your URLs sent to third party)

## 💡 Best Practices

1. **Use High Error Correction** when adding logos
2. **Test on Multiple Devices** to ensure scannability
3. **Include Margin** for better scanning
4. **Use Contrasting Colors** (dark on light background)
5. **Minimum Size**: 2cm x 2cm for print
6. **Test Distance**: Should scan from 10-15cm away

## 🎨 Example: Complete QR Section Component

```jsx
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import './QRSection.scss';

function QRSection() {
  const [showQR, setShowQR] = useState(false);
  const appUrl = "https://voiceitshapeit.vercel.app";

  return (
    <div className="qr-section">
      <button 
        className="show-qr-btn"
        onClick={() => setShowQR(true)}
      >
        📱 Show QR Code
      </button>

      {showQR && (
        <div className="qr-modal-overlay" onClick={() => setShowQR(false)}>
          <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowQR(false)}>
              ×
            </button>
            
            <h2>Scan to Access SSG InnoVoice</h2>
            
            <div className="qr-container">
              <QRCodeSVG 
                value={appUrl}
                size={280}
                level="M"
                includeMargin={true}
              />
            </div>
            
            <p className="qr-description">
              Scan this QR code with your phone camera to access the suggestion form
            </p>
            
            <div className="qr-url">
              <p>{appUrl}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QRSection;
```

## 📝 Summary

**Recommended Solution:** Use `qrcode.react` (already installed ✅)

**Benefits:**
- Free and open source
- Works offline
- Instant generation
- Fully customizable
- No external dependencies
- Perfect for your React app

**Next Steps:**
1. Import `QRCodeSVG` from 'qrcode.react'
2. Replace your current QR implementation
3. Customize colors and size to match your design
4. Test on mobile devices

Your QR codes will be generated instantly in the browser with no external services needed! 🎉
