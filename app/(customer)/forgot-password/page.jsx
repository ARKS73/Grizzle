'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, KeyRound, ArrowRight, CheckCircle2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function ForgotPasswordPage() {
  const { addToast } = useToast();
  
  // Step 1: Send OTP | Step 2: Verify OTP & New Password | Step 3: Success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Request 6-digit OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setStep(2);
        setOtp('');
        addToast(data.message, 'success');
      } else {
        addToast(data.message || 'Failed to send OTP code', 'error');
      }
    } catch (err) {
      addToast('An error occurred while requesting OTP', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Verify OTP & Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setStep(3);
        addToast('Password reset successfully!', 'success');
      } else {
        addToast(data.message || 'Invalid or expired OTP code', 'error');
      }
    } catch (err) {
      addToast('Error verifying OTP and resetting password', 'error');
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
              height: '56px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.5))',
            }}
          />
          <h2>
            {step === 1 && 'Forgot Password?'}
            {step === 2 && 'Verify OTP Code'}
            {step === 3 && 'Password Reset!'}
          </h2>
          <p>
            {step === 1 && 'Enter your registered email address to receive a 6-digit OTP code.'}
            {step === 2 && `Enter the 6-digit OTP code sent to ${email}`}
            {step === 3 && 'Your password has been updated. You can now sign in.'}
          </p>
        </div>

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="auth-form">
            <div className="form-group">
              <label className="form-label">Registered Account Email</label>
              <div className="input-icon-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary btn-lg submit-btn">
              {submitting ? 'Sending OTP Code...' : 'Send 6-Digit OTP'} <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP & New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="form-group">
              <label className="form-label">6-Digit OTP Code *</label>
              <div className="input-icon-wrapper">
                <KeyRound size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="e.g. 849201"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="form-input otp-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Secure Password *</label>
              <div className="input-icon-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-btn"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                  aria-label={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary btn-lg submit-btn">
              {submitting ? 'Verifying OTP...' : 'Verify OTP & Reset Password'} <ArrowRight size={18} />
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn btn-secondary btn-sm w-100 mt-2"
            >
              Resend OTP Code
            </button>
          </form>
        )}

        {/* STEP 3: Success Screen */}
        {step === 3 && (
          <div className="success-box text-center py-4">
            <CheckCircle2 size={56} className="text-success mb-2" />
            <h3>Password Changed Successfully!</h3>
            <p className="mt-2 text-muted">Use your new password to sign in to your Grizzle account.</p>
            <Link href="/login" className="btn btn-primary btn-lg mt-4 w-100">
              Sign In to Your Account <ArrowRight size={18} />
            </Link>
          </div>
        )}

        <div className="auth-footer text-center mt-4">
          Remembered password? <Link href="/login" className="auth-link">Back to Login</Link>
        </div>
      </div>

      <style jsx>{`
        .auth-page-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 200px);
          padding: 2rem 0;
        }
        .auth-card {
          width: 100%;
          max-width: 440px;
          padding: 2.5rem;
          border-radius: var(--radius-lg);
        }
        .auth-header h2 { font-size: 1.6rem; }
        .auth-header p { font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem; }

        .input-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          pointer-events: none;
        }
        .input-icon-wrapper input {
          padding-left: 2.6rem;
          padding-right: 2.6rem;
        }
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

        .otp-input {
          letter-spacing: 4px;
          font-weight: 800;
          font-size: 1.1rem;
        }

        .otp-badge {
          background: var(--accent-gradient);
          color: white;
          padding: 2px 10px;
          border-radius: 6px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .submit-btn { width: 100%; margin-top: 1rem; }

        .auth-footer {
          font-size: 0.85rem;
          color: var(--text-secondary);
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }
        .auth-link { color: var(--accent-primary); font-weight: 700; }
      `}</style>
    </div>
  );
}
