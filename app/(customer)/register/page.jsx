'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await register(name, email, password, phone);
    setSubmitting(false);
    if (res.success) {
      router.push('/');
    }
  };

  return (
    <div className="container auth-page-wrapper">
      <div className="auth-card glass-panel">
        <div className="auth-header text-center">
          <img src="/logo.jpeg" alt="Grizzle Apparel Logo" style={{ width: '56px', height: '56px', borderRadius: '50%', marginBottom: '0.75rem', objectFit: 'cover', boxShadow: '0 0 12px rgba(239, 68, 68, 0.4)' }} />
          <h2>Create Your Grizzle Account</h2>
          <p>Join to unlock members-only discount drops and order tracking.</p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-icon-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Alex Mercer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number (Optional)</label>
            <div className="input-icon-wrapper">
              <Phone size={18} className="input-icon" />
              <input
                type="text"
                placeholder="+1 (555) 019-2834"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
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

          <button type="submit" disabled={submitting} className="btn btn-primary btn-lg submit-btn">
            {submitting ? 'Creating Account...' : 'Create Account'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          Already registered? <Link href="/login" className="auth-link">Sign In</Link>
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
          max-width: 460px;
          padding: 2.5rem;
          border-radius: var(--radius-lg);
        }
        .auth-header { text-align: center; margin-bottom: 1.5rem; }
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
        .input-icon-wrapper { position: relative; display: flex; align-items: center; }
        .input-icon { position: absolute; left: 14px; color: var(--text-muted); }
        .input-icon-wrapper input { padding-left: 2.6rem; }
        .submit-btn { width: 100%; margin-top: 1rem; }
        .auth-footer { text-align: center; font-size: 0.85rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color); }
        .auth-link { color: var(--accent-primary); font-weight: 700; }
      `}</style>
    </div>
  );
}
