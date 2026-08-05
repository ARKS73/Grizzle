'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Phone, ArrowRight, ShieldCheck, KeyRound, RefreshCw, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import GoogleSignInButton from '@/components/ui/GoogleSignInButton';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneDigits, setPhoneDigits] = useState('');

  // OTP Verification state
  const [step, setStep] = useState('FORM'); // 'FORM' | 'OTP'
  const [serverOtp, setServerOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) {
      setPhoneDigits(val);
    }
  };

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      addToast('Please enter your Full Name', 'error');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      addToast('Please enter a valid Email Address', 'error');
      return;
    }
    if (!phoneDigits || phoneDigits.length !== 10 || !/^[6-9]\d{9}$/.test(phoneDigits)) {
      addToast('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9', 'error');
      return;
    }
    if (!password || password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      setSendingOtp(true);
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (data.success) {
        setServerOtp(data.otp);
        setStep('OTP');
        if (data.emailSent) {
          addToast(`📩 Verification OTP sent to ${email}. Please check your email inbox!`, 'success', 8000);
        } else {
          addToast(`🔐 Your Email OTP Code is: ${data.otp}`, 'info', 12000);
        }
      } else {
        addToast(data.message || 'Failed to send OTP', 'error');
      }
    } catch (err) {
      addToast('An error occurred while sending OTP', 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2: Verify OTP and Register Account
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();

    if (!userOtp || userOtp.trim().length !== 6) {
      addToast('Please enter the 6-digit OTP code', 'error');
      return;
    }

    if (userOtp.trim() !== serverOtp) {
      addToast('❌ Invalid OTP code! Please check and enter the correct code.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const fullPhone = `+91 ${phoneDigits}`;
      const res = await register(name, email, password, fullPhone);
      
      if (res.success) {
        addToast('🎉 OTP Verified! Account created successfully!', 'success');
        router.push('/');
      } else {
        addToast(res.message || 'Registration failed', 'error');
      }
    } catch (err) {
      addToast('Error creating account', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container auth-page-wrapper">
      <div className="auth-card glass-panel">
        <div className="auth-header text-center">
          <img
            src="/logo2.png"
            alt="Grizzle Apparel Logo"
            style={{
              display: 'block',
              margin: '0 auto 0.75rem auto',
              height: '64px',
              width: 'auto',
              maxWidth: '220px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.5))',
            }}
          />
          <h2>Create Your Grizzle Account</h2>
          <p>Verify your email OTP & join to unlock members-only drops & tracking.</p>
        </div>

        {step === 'FORM' ? (
          <form onSubmit={handleSendOtp} className="auth-form">
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div className="input-icon-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label className="form-label">Email Address * (OTP will be sent here)</label>
              <div className="input-icon-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
            </div>

            {/* Mandatory Phone Number with +91 Prefix */}
            <div className="form-group">
              <label className="form-label d-flex justify-content-between align-items-center">
                <span>Mobile Phone Number * (Starts with +91)</span>
                <span className={phoneDigits.length === 10 ? "text-success font-bold" : "text-muted"} style={{ fontSize: '0.75rem' }}>
                  {phoneDigits.length === 10 ? '✓ 10 Digits Valid' : `${phoneDigits.length}/10 digits`}
                </span>
              </label>
              <div className="phone-input-wrapper">
                <span className="phone-prefix-badge">+91 🇮🇳</span>
                <input
                  type="tel"
                  value={phoneDigits}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  required
                  placeholder="e.g. 9876543210"
                  className="phone-number-input"
                />
              </div>
              <small className="subtext mt-1 d-block">
                Enter 10-digit Indian mobile number starting with 6, 7, 8, or 9.
              </small>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password * (Min 6 characters)</label>
              <div className="input-icon-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="form-input"
                />
              </div>
            </div>

            <button type="submit" disabled={sendingOtp} className="btn btn-primary btn-lg submit-btn">
              {sendingOtp ? 'Sending Email OTP...' : 'Send Email OTP & Continue'} <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          /* Step 2: OTP Verification Mode */
          <form onSubmit={handleVerifyAndRegister} className="auth-form otp-step-box">
            <div className="otp-alert-box bg-secondary p-3 rounded mb-3 text-center border border-primary-light">
              <KeyRound size={32} className="text-primary mb-2" />
              <h4 className="font-bold m-0">Enter 6-Digit Verification OTP</h4>
              <p className="subtext mt-1 mb-0">
                We sent an OTP code to <strong>{email}</strong>
              </p>
            </div>

            <div className="form-group">
              <label className="form-label text-center font-bold d-block">6-Digit Email OTP Code *</label>
              <input
                type="text"
                value={userOtp}
                onChange={(e) => setUserOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
                autoFocus
                placeholder="e.g. 849201"
                className="form-input otp-input-large"
              />
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary btn-lg submit-btn">
              {submitting ? 'Verifying OTP...' : '✓ Verify OTP & Create Account'}
            </button>

            <div className="d-flex justify-content-between align-items-center mt-3">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="btn-link-subtext d-flex align-items-center gap-1"
              >
                <RefreshCw size={14} /> Resend OTP
              </button>

              <button
                type="button"
                onClick={() => setStep('FORM')}
                className="btn-link-subtext"
              >
                Edit Email / Info
              </button>
            </div>
          </form>
        )}

        {step === 'FORM' && (
          <>
            <div className="auth-divider">
              <span>OR</span>
            </div>

            <div className="google-btn-wrapper">
              <GoogleSignInButton text="Sign Up with Google" />
            </div>
          </>
        )}

        <div className="auth-footer">
          Already registered? <Link href="/login" className="auth-link">Sign In</Link>
        </div>
      </div>

      <style jsx>{`
        .auth-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 1.25rem 0;
          color: var(--text-muted, #64748b);
          font-size: 0.78rem;
          font-weight: 700;
        }
        .auth-divider::before, .auth-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.1));
        }
        .auth-divider span {
          padding: 0 0.75rem;
        }
        .google-btn-wrapper {
          margin-bottom: 1.25rem;
        }
        .auth-page-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 200px);
          padding: 2rem 0;
        }
        .auth-card {
          width: 100%;
          max-width: 480px;
          padding: 2.5rem;
          border-radius: var(--radius-lg);
        }
        .auth-header { text-align: center; margin-bottom: 1.5rem; }

        .input-icon-wrapper { position: relative; display: flex; align-items: center; }
        .input-icon { position: absolute; left: 14px; color: var(--text-muted); pointer-events: none; }
        .input-icon-wrapper input { padding-left: 2.6rem; padding-right: 2.6rem; }
        .password-toggle-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          transition: color 0.2s ease;
          border-radius: 4px;
        }
        .password-toggle-btn:hover {
          color: var(--text-primary);
        }

        /* Phone input +91 prefix badge */
        .phone-input-wrapper {
          display: flex;
          align-items: center;
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--bg-secondary);
          transition: border-color 0.2s ease;
        }
        .phone-input-wrapper:focus-within {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px var(--accent-light);
        }
        .phone-prefix-badge {
          padding: 0.65rem 0.85rem;
          background: var(--bg-tertiary);
          border-right: 1.5px solid var(--border-color);
          font-weight: 800;
          font-size: 0.9rem;
          color: var(--text-primary);
          white-space: nowrap;
          user-select: none;
        }
        .phone-number-input {
          flex: 1;
          border: none !important;
          outline: none !important;
          background: transparent !important;
          padding: 0.65rem 0.85rem !important;
          font-size: 0.95rem !important;
          font-weight: 700 !important;
          color: var(--text-primary) !important;
        }

        .otp-input-large {
          font-size: 1.6rem !important;
          letter-spacing: 0.4em !important;
          text-align: center !important;
          font-weight: 900 !important;
          padding: 0.75rem !important;
          border-color: var(--accent-primary) !important;
        }

        .btn-link-subtext {
          background: none;
          border: none;
          color: var(--accent-primary);
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
        }

        .submit-btn { width: 100%; margin-top: 1rem; }
        .auth-footer { text-align: center; font-size: 0.85rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color); }
        .auth-link { color: var(--accent-primary); font-weight: 700; }
        .font-bold { font-weight: 800; }
      `}</style>
    </div>
  );
}
