'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.success) {
      if (result.user?.role === 'admin' && (redirect === '/' || !redirect)) {
        router.push('/admin');
      } else {
        router.push(redirect);
      }
    }
  };

  return (
    <div className="auth-card glass-panel">
      <div className="auth-header text-center">
        <img src="/logo2.png" alt="Grizzle Apparel Logo" style={{ height: '64px', width: 'auto', maxWidth: '220px', borderRadius: '0px', marginBottom: '0.75rem', objectFit: 'contain', filter: 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.5))' }} />
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
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn btn-primary btn-lg submit-btn">
          {submitting ? 'Signing In...' : 'Sign In'} <ArrowRight size={18} />
        </button>
      </form>

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
        }
        .input-icon-wrapper input {
          padding-left: 2.6rem;
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
