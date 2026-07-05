# Two-Factor Authentication (2FA) Implementation

## Overview
Enhanced security with SMS/Email OTP for user login.

## Features

### 1. 2FA Setup Options
- **SMS OTP** - Send 6-digit code via SMS
- **Email OTP** - Send 6-digit code via email
- **Authenticator App** - QR code for Google Authenticator

### 2. Database Schema
```javascript
// Users Collection (updated)
{
  id: string,
  email: string,
  fullName: string,
  role: string,
  status: 'ACTIVE' | 'INACTIVE',
  // New fields for 2FA
  twoFactorEnabled: boolean,
  twoFactorMethod: 'SMS' | 'EMAIL' | 'AUTHENTICATOR',
  phone: string, // for SMS OTP
  authenticatorSecret: string, // encrypted QR secret
  backupCodes: string[], // emergency backup codes
  lastLoginTime: ISO 8601,
  loginAttempts: number,
  lockedUntil: ISO 8601 (optional)
}

// OTP Sessions Collection
{
  id: string,
  userId: string,
  email: string,
  otp: string, // hashed
  method: 'SMS' | 'EMAIL',
  createdAt: ISO 8601,
  expiresAt: ISO 8601,
  attempts: number,
  verified: boolean
}
```

### 3. Implementation Flow

```javascript
// Step 1: Initial Login
const handleLogin = async (e) => {
  e.preventDefault();
  const email = e.target.email.value.trim();
  const password = e.target.password.value;
  
  try {
    setIsInitializing(true);
    await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
    const result = await firebase.auth().signInWithEmailAndPassword(email, password);
    
    // Check if user has 2FA enabled
    const userDoc = await window.db.collection('users').where('email', '==', email).get();
    const userData = userDoc.docs[0].data();
    
    if (userData.twoFactorEnabled) {
      // Proceed to OTP verification
      setShowOTPVerification(true);
      await sendOTP(email, userData.twoFactorMethod);
    } else {
      // Traditional login complete
      setUser({ id: userDoc.docs[0].id, ...userData });
    }
  } catch (err) {
    alert('Authentication Failed: Invalid Email or Password.');
    setIsInitializing(false);
  }
};

// Step 2: Send OTP
const sendOTP = async (email, method) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Store OTP in Firestore
    await window.db.collection('otpSessions').add({
      email,
      otp: hashOTP(otp), // Hash for security
      method,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      attempts: 0,
      verified: false
    });
    
    // Send OTP via email or SMS
    if (method === 'EMAIL') {
      await sendEmailOTP(email, otp);
    } else if (method === 'SMS') {
      await sendSMSOTP(userData.phone, otp);
    }
    
    setOTPMessage(`${method === 'SMS' ? 'SMS' : 'Email'} with OTP sent to ${email}`);
  } catch (error) {
    console.error('OTP send failed:', error);
  }
};

// Step 3: Verify OTP
const verifyOTP = async (enteredOTP) => {
  try {
    const otpSession = await window.db.collection('otpSessions')
      .where('email', '==', userEmail)
      .where('verified', '==', false)
      .limit(1)
      .get();
    
    if (otpSession.empty) {
      alert('OTP expired. Please login again.');
      return;
    }
    
    const session = otpSession.docs[0].data();
    
    // Check expiry
    if (new Date() > new Date(session.expiresAt)) {
      alert('OTP has expired. Request a new one.');
      return;
    }
    
    // Verify OTP
    if (hashOTP(enteredOTP) !== session.otp) {
      const newAttempts = session.attempts + 1;
      if (newAttempts >= 3) {
        alert('Too many failed attempts. Please login again.');
        setShowOTPVerification(false);
      }
      alert('Invalid OTP. Please try again.');
      return;
    }
    
    // Mark OTP as verified
    await window.db.collection('otpSessions').doc(otpSession.docs[0].id).update({
      verified: true
    });
    
    // Complete login
    const userDoc = await window.db.collection('users').where('email', '==', userEmail).get();
    setUser({ id: userDoc.docs[0].id, ...userDoc.docs[0].data() });
    setView('DASHBOARD');
    
  } catch (error) {
    console.error('OTP verification failed:', error);
  }
};
```

### 4. 2FA Management UI

```javascript
// Settings view for 2FA configuration
const twoFactorSettings = (
  <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
    <h3 className="text-xl font-black text-emerald-500 mb-4">Two-Factor Authentication</h3>
    
    {!user.twoFactorEnabled ? (
      <div className="space-y-4">
        <p className="text-slate-400 text-sm">Secure your account with 2FA</p>
        <select value={twoFactorMethod} onChange={(e) => setTwoFactorMethod(e.target.value)} 
                className="w-full p-4 bg-black rounded-xl text-white">
          <option value="SMS">📱 SMS OTP</option>
          <option value="EMAIL">📧 Email OTP</option>
          <option value="AUTHENTICATOR">🔐 Authenticator App</option>
        </select>
        <button onClick={() => setupTwoFactor()} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-black">Enable 2FA</button>
      </div>
    ) : (
      <div className="space-y-3">
        <p className="text-green-400 font-bold">✅ 2FA Enabled ({user.twoFactorMethod})</p>
        <button onClick={() => disableTwoFactor()} className="w-full bg-rose-600 text-white py-3 rounded-xl font-black">Disable 2FA</button>
        <button onClick={() => downloadBackupCodes()} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black">Download Backup Codes</button>
      </div>
    )}
  </div>
);
```

### 5. Security Benefits
✅ Prevents unauthorized account access
✅ Protects against password breaches
✅ Compliance with security standards
✅ Emergency backup codes for recovery
✅ Audit trail of login attempts

### 6. Integration with Existing System
- Modify login form to show OTP input when 2FA is enabled
- Store OTP preferences in user profile
- Add 2FA setup in user settings/profile page
- Log all login attempts (successful and failed)
