'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';

const GOOGLE_CLIENT_ID = '898635454432-ncld09i6nkkn87m4k5rb6nv2s15nn9nl.apps.googleusercontent.com';

export default function GoogleSignInButton({ text = 'Continue with Google', redirect = '/' }) {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Load official Google Identity Services (GIS) script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scriptId = 'google-gsi-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleGoogleClick = async () => {
    if (loading) return;
    setLoading(true);

    // Try Google Identity Services (GIS) native prompt first
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            if (response.credential) {
              const result = await loginWithGoogle(response.credential);
              if (result?.success) {
                if (result.user?.role === 'admin') {
                  router.push('/admin');
                } else if (redirect && redirect !== '/login' && redirect !== '/') {
                  router.push(redirect);
                } else {
                  router.push('/');
                }
              } else {
                addToast(result?.message || 'Google sign in failed', 'error');
              }
            }
            setLoading(false);
          },
        });

        // Prompt Google Account Chooser
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to Firebase Auth Popup if GIS prompt is skipped
            fallbackFirebasePopup();
          }
        });
        return;
      } catch (gisErr) {
        console.warn('GIS prompt skipped, invoking Firebase popup:', gisErr);
      }
    }

    // Fallback: Firebase Auth Popup
    await fallbackFirebasePopup();
  };

  const fallbackFirebasePopup = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const idToken = await userCredential.user.getIdToken();

      const result = await loginWithGoogle(idToken);
      if (result?.success) {
        if (result.user?.role === 'admin') {
          router.push('/admin');
        } else if (redirect && redirect !== '/login' && redirect !== '/') {
          router.push(redirect);
        } else {
          router.push('/');
        }
      } else {
        addToast(result?.message || 'Google Authentication failed', 'error');
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        // Closed by user
      } else if (error.code === 'auth/unauthorized-domain') {
        addToast('Domain not authorized! Add your current domain in Firebase Console -> Settings -> Authorized Domains', 'error');
      } else {
        addToast(error.message || 'Google Sign-In failed', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      disabled={loading}
      className="btn-google-auth"
    >
      <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>{loading ? 'Signing in with Google...' : text}</span>

      <style jsx>{`
        .btn-google-auth {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          background: #ffffff;
          color: #1e293b;
          border: 1px solid #cbd5e1;
          border-radius: var(--radius-md, 10px);
          font-weight: 700;
          font-size: 0.92rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }
        .btn-google-auth:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #94a3b8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }
        .btn-google-auth:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </button>
  );
}
