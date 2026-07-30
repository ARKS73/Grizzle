'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Eye, EyeOff, Database, CheckCircle2 } from 'lucide-react';
import GrizzleLogo from '@/components/ui/GrizzleLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';

export default function SetupAdminPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();

  const [adminExists, setAdminExists] = useState(null);
  const [checkingDB, setCheckingDB] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    // If user is already admin, redirect to dashboard
    if (user?.role === 'admin') {
      router.replace('/admin');
      return;
    }

    // Check if admin exists in MongoDB
    const checkAdmin = async () => {
      try {
        setCheckingDB(true);
        const res = await fetch('/api/auth/setup-admin');
        const data = await res.json();
        setAdminExists(data.adminExists);
        if (data.adminExists) {
          // Admin already exists, redirect to login
          addToast('Admin already configured. Please log in.', 'info');
          router.replace('/login');
        }
      } catch (e) {
        console.error(e);
        setAdminExists(false);
      } finally {
        setCheckingDB(false);
      }
    };
    checkAdmin();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      addToast('All fields are required', 'error');
      return;
    }
    if (form.password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/auth/setup-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        addToast('Admin account created and saved to MongoDB! Redirecting...', 'success');
        await refreshUser();
        router.push('/admin');
      } else {
        addToast(data.message || 'Setup failed', 'error');
      }
    } catch (err) {
      addToast('Error connecting to MongoDB', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingDB) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Database size={40} style={{ opacity: 0.4, marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Checking MongoDB database...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '2rem 1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <GrizzleLogo size={56} />
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            First-Time Setup
          </div>
        </div>

        {/* Card */}
        <div className="glass-panel" style={{ padding: '2.25rem', borderRadius: '20px', border: '1px solid rgba(255,200,0,0.2)' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={22} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0 }}>Create Admin Account</h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Stored permanently in MongoDB</p>
            </div>
          </div>

          {/* Info Box */}
          <div style={{
            background: 'rgba(255,200,0,0.08)',
            border: '1px solid rgba(255,200,0,0.2)',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}>
            <Database size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
            No admin account found in your MongoDB database. Create one below — all future logins will use these credentials.
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Arjun (Store Owner)"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. admin@grizzle.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password * (min 6 characters)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Set a strong admin password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={submitting}
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 800, marginTop: '0.5rem' }}
            >
              {submitting ? 'Saving to MongoDB...' : (
                <>
                  <CheckCircle2 size={17} style={{ marginRight: '0.5rem' }} />
                  Create Admin & Go to Dashboard
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
