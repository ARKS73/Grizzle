'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function ForgotPasswordPage() {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        addToast('Password reset successfully!', 'success');
      } else {
        addToast(data.message || 'Password reset failed', 'error');
      }
    } catch (e) {
      addToast('Error resetting password', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container auth-page-wrapper">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <h2>Reset Your Password</h2>
          <p>Enter your email address and new password.</p>
        </div>

        {success ? (
          <div className="success-box text-center">
            <CheckCircle2 size={48} className="text-success mb-2" />
            <h3>Password Updated!</h3>
            <p className="mt-2 text-muted">Your account password has been updated successfully.</p>
            <Link href="/login" className="btn btn-primary mt-4">Sign In Now</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Account Email</label>
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
              <label className="form-label">New Password</label>
              <div className="input-icon-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="form-input"
                />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary btn-lg submit-btn">
              {submitting ? 'Resetting Password...' : 'Reset Password'} <ArrowRight size={18} />
            </button>
          </form>
        )}

        <div className="auth-footer">
          Remembered password? <Link href="/login" className="auth-link">Back to Login</Link>
        </div>
      </div>

      <style jsx>{`
        .auth-page-wrapper { display: flex; align-items: center; justify-content: center; min-height: calc(100vh - 200px); padding: 2rem 0; }
        .auth-card { width: 100%; max-width: 440px; padding: 2.5rem; border-radius: var(--radius-lg); }
        .auth-header { text-align: center; margin-bottom: 1.5rem; }
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
