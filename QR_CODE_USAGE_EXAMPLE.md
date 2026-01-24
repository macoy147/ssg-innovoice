# QR Code Usage Example

## ✅ Installation Complete

The `qrcode.react` library has been installed and a ready-to-use QR Code Modal component has been created!

**Your Custom Domain:** `https://ssginnovoice.filipino.gg` 🎉

## 📁 Files Created

1. **Component:** `client/src/components/QRCodeModal/QRCodeModal.jsx`
2. **Styles:** `client/src/components/QRCodeModal/QRCodeModal.scss`
3. **Config:** `client/src/config/app.js` - Centralized app configuration
4. **Guide:** `QR_CODE_GUIDE.md`

## 🚀 How to Use

### 1. Import the Component

```jsx
import QRCodeModal from './components/QRCodeModal/QRCodeModal';
import { useState } from 'react';
```

### 2. Add State

```jsx
function YourComponent() {
  const [showQR, setShowQR] = useState(false);
  
  // Your component code...
}
```

### 3. Add the Modal (Uses Your Custom Domain by Default!)

```jsx
<QRCodeModal 
  isOpen={showQR}
  onClose={() => setShowQR(false)}
  // No need to specify URL - uses https://ssginnovoice.filipino.gg by default!
/>
```

### 4. Add a Button to Open It

```jsx
<button onClick={() => setShowQR(true)}>
  📱 Show QR Code
</button>
```

## 📝 Complete Example

```jsx
import { useState } from 'react';
import QRCodeModal from './components/QRCodeModal/QRCodeModal';

function HomePage() {
  const [showQR, setShowQR] = useState(false);

  return (
    <div className="home-page">
      <h1>SSG InnoVoice</h1>
      <p>Speak Ideas. Spark Change.</p>
      
      <button 
        className="qr-button"
        onClick={() => setShowQR(true)}
      >
        📱 Show QR Code
      </button>

      {/* Uses https://ssginnovoice.filipino.gg by default */}
      <QRCodeModal 
        isOpen={showQR}
        onClose={() => setShowQR(false)}
      />
    </div>
  );
}

export default HomePage;
```

## 🎨 Features Included

### ✅ Download QR Code
- Click "Download" button
- Saves as PNG image
- Perfect for sharing

### ✅ Print QR Code
- Click "Print" button
- Opens print dialog
- Optimized for printing

### ✅ Responsive Design
- Works on mobile, tablet, desktop
- QR code scales appropriately
- Touch-friendly buttons

### ✅ Smooth Animations
- Fade in overlay
- Slide up modal
- Hover effects

## 🎯 Use Cases

### 1. Homepage QR Button

```jsx
<button onClick={() => setShowQR(true)}>
  📱 Scan QR Code
</button>
```

### 2. After Submission (with Tracking Code)

```jsx
<QRCodeModal 
  isOpen={showQR}
  onClose={() => setShowQR(false)}
  url={`https://voiceitshapeit.vercel.app/track/${trackingCode}`}
  title="Scan to Track Your Suggestion"
/>
```

### 3. Admin Panel (Share Link)

```jsx
<QRCodeModal 
  isOpen={showQR}
  onClose={() => setShowQR(false)}
  url="https://voiceitshapeit.vercel.app"
  title="Share SSG InnoVoice"
/>
```

## 🎨 Customization

### Change QR Code Size

Edit `QRCodeModal.jsx`:
```jsx
<QRCodeSVG 
  size={280}  // Change this number (150-500)
  // ... other props
/>
```

### Change Colors

Edit `QRCodeModal.jsx`:
```jsx
<QRCodeSVG 
  bgColor="#ffffff"  // Background color
  fgColor="#000000"  // QR code color (try #667eea for purple)
  // ... other props
/>
```

### Add Logo to QR Code

```jsx
<div style={{ position: 'relative', display: 'inline-block' }}>
  <QRCodeSVG 
    value={url}
    size={280}
    level="H"  // High error correction for logo
  />
  <img 
    src="/ssg-logo.png"
    alt="SSG Logo"
    style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '50px',
      height: '50px',
      backgroundColor: 'white',
      padding: '4px',
      borderRadius: '8px'
    }}
  />
</div>
```

## 📱 Testing

1. **Open your app**
2. **Click the QR button**
3. **Scan with your phone camera**
4. **Should open your web app**

## 🖨️ Creating Printable Posters

### Option 1: Use the Print Button
1. Click "Show QR Code"
2. Click "Print"
3. Select printer or "Save as PDF"
4. Print!

### Option 2: Download and Design
1. Click "Download"
2. Open in design software (Canva, Photoshop, etc.)
3. Add text, logos, decorations
4. Print

## 💡 Tips

### For Best Scanning
- ✅ Use high contrast (black on white)
- ✅ Minimum size: 2cm x 2cm
- ✅ Test from 10-15cm distance
- ✅ Ensure good lighting

### For Printing
- ✅ Use 300 DPI or higher
- ✅ Print on white paper
- ✅ Avoid glossy paper (can reflect)
- ✅ Test scan before mass printing

### For Sharing
- ✅ Download as PNG
- ✅ Share on social media
- ✅ Include in presentations
- ✅ Add to posters/flyers

## 🎉 You're All Set!

Your QR code feature is ready to use! No external services needed - everything generates instantly in the browser.

**Benefits:**
- ✅ Free forever
- ✅ Works offline
- ✅ Instant generation
- ✅ Fully customizable
- ✅ Download & print ready

## 📚 More Information

See `QR_CODE_GUIDE.md` for:
- Advanced customization
- More examples
- Best practices
- Troubleshooting

---

**Need help?** Check the QR_CODE_GUIDE.md or ask! 🚀
