'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowRight, ShieldCheck, Key, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GoogleSignInButton from '@/components/ui/GoogleSignInButton';
import GrizzleLogo from '@/components/ui/GrizzleLogo';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { login, verifyMfa } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Step 2 MFA State
  const [step, setStep] = useState('credentials'); // 'credentials' | 'mfa'
  const [tempToken, setTempToken] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      if (result.requiresMfa) {
        setTempToken(result.tempToken);
        setStep('mfa');
        return;
      }

      if (result.user?.role === 'admin') {
        router.push('/admin');
      } else if (redirect && redirect !== '/login' && redirect !== '/') {
        router.push(redirect);
      } else {
        router.push('/');
      }
    }
  };

  const handleVerifyMfa = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) return;

    setSubmitting(true);
    const result = await verifyMfa(tempToken, otpCode.trim());
    setSubmitting(false);

    if (result.success) {
      router.push('/admin');
    }
  };

  if (step === 'mfa') {
    return (
      <div className="auth-card glass-panel text-center">
        <div className="auth-header text-center mb-4">
          <div className="mfa-icon-badge">
            <ShieldCheck size={36} color="#ef4444" />
          </div>
          <h2 style={{ marginTop: '1rem', color: '#ffffff' }}>Admin Security Verification</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            Multi-Factor Authentication (MFA) is enabled on your admin account. Open your <strong>Google Authenticator</strong> or <strong>Authy</strong> app and enter the 6-digit OTP code below:
          </p>
        </div>

        <form onSubmit={handleVerifyMfa} className="auth-form">
          <div className="form-group my-4">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
              required
              autoFocus
              className="otp-input-field"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || otpCode.length !== 6}
            className="btn btn-primary btn-lg submit-btn"
          >
            {submitting ? 'Verifying OTP...' : 'Verify & Enter Admin Dashboard'} <ArrowRight size={18} />
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setStep('credentials');
            setOtpCode('');
            setTempToken('');
          }}
          className="btn-back-login"
        >
          ← Back to Standard Sign In
        </button>

        <style jsx>{`
          .auth-card {
            width: 100%;
            max-width: 440px;
            padding: 2.5rem;
            border-radius: var(--radius-lg);
          }
          .mfa-icon-badge {
            width: 64px;
            height: 64px;
            background: rgba(239, 68, 68, 0.15);
            border: 2px solid #ef4444;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
          .otp-input-field {
            width: 100%;
            font-size: 2.2rem;
            font-weight: 800;
            letter-spacing: 12px;
            text-align: center;
            padding: 0.75rem;
            background: rgba(15, 23, 42, 0.8);
            border: 2px solid var(--accent-primary);
            border-radius: 12px;
            color: #ffffff;
            outline: none;
            box-shadow: 0 0 16px rgba(239, 68, 68, 0.3);
          }
          .submit-btn { width: 100%; margin-top: 1rem; }
          .btn-back-login {
            background: none;
            border: none;
            color: var(--text-muted);
            font-size: 0.85rem;
            margin-top: 1.5rem;
            cursor: pointer;
          }
          .btn-back-login:hover { color: #ffffff; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="auth-card glass-panel">
      <div className="auth-header text-center">
        <div style={{ marginBottom: '0.75rem' }}>
          <GrizzleLogo size="large" />
        </div>
        <h2>Welcome Back to Grizzle</h2>
        <p>Sign in to your Grizzle account to access orders, wishlist, profile & account settings.</p>
      </div>

      <form onSubmit={handleLogin} className="auth-form">
        <div className="form-group">
          <label className="form-label">Email Address</label>
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

        <div className="form-group">
          <div className="label-row">
            <label className="form-label">Password</label>
            <Link href="/forgot-password" className="forgot-link">Forgot password?</Link>
          </div>
          <div className="input-icon-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
          {submitting ? 'Signing In...' : 'Sign In'} <ArrowRight size={18} />
        </button>
      </form>

      <div className="auth-divider">
        <span>OR</span>
      </div>

      <div className="google-btn-wrapper">
        <GoogleSignInButton text="Continue with Google" redirect={redirect} />
      </div>

      <div className="auth-footer">
        Don&apos;t have an account? <Link href="/register" className="auth-link">Create Account</Link>
      </div>


      <style jsx>{`
        .auth-card {
          width: 100%;
          max-width: 440px;
          padding: 2.5rem;
          border-radius: var(--radius-lg);
        }
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
        .auth-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .logo-badge {
          width: 44px;
          height: 44px;
          background: var(--accent-gradient);
          color: white;
          font-weight: 800;
          font-size: 1.4rem;
          border-radius: var(--radius-md);
          display: inline-flex;
          align-items: center;
          justify-content: center;
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

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .forgot-link { font-size: 0.8rem; color: var(--accent-primary); }

        .submit-btn { width: 100%; margin-top: 1rem; }

        .auth-footer {
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }
        .auth-link { color: var(--accent-primary); font-weight: 700; }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="container auth-page-wrapper">
      <Suspense fallback={<div className="skeleton" style={{ height: '400px', width: '440px', borderRadius: '16px' }} />}>
        <LoginContent />
      </Suspense>
      <style jsx>{`
        .auth-page-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 200px);
          padding: 2rem 0;
        }
      `}</style>
    </div>
  );
}
