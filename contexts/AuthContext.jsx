'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch user session:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        addToast(data.message || 'Login failed', 'error');
        return { success: false, message: data.message };
      }

      if (data.requiresMfa) {
        addToast('Authenticator Security Verification Required', 'info');
        return { success: true, requiresMfa: true, tempToken: data.tempToken };
      }

      setUser(data.user);
      addToast(`Welcome back, ${data.user.name.split(' ')[0]}!`, 'success');
      return { success: true, user: data.user, requiresMfaSetup: data.requiresMfaSetup };
    } catch (err) {
      addToast('An error occurred during login', 'error');
      return { success: false, message: err.message };
    }
  };

  const verifyMfa = async (tempToken, otpCode) => {
    try {
      const res = await fetch('/api/auth/verify-mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, otpCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        addToast(data.message || 'OTP verification failed', 'error');
        return { success: false, message: data.message };
      }
      setUser(data.user);
      addToast(`Admin verification successful! Welcome ${data.user.name.split(' ')[0]}.`, 'success');
      return { success: true, user: data.user };
    } catch (err) {
      addToast('MFA Verification error', 'error');
      return { success: false, message: err.message };
    }
  };

  const loginWithGoogle = async (idToken) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        addToast(data.message || 'Google Sign-In failed', 'error');
        return { success: false, message: data.message };
      }

      if (data.requiresMfa) {
        addToast('Authenticator Security Verification Required', 'info');
        return { success: true, requiresMfa: true, tempToken: data.tempToken };
      }

      setUser(data.user);
      addToast(`Welcome to Grizzle, ${data.user.name.split(' ')[0]}!`, 'success');
      return { success: true, user: data.user };
    } catch (err) {
      addToast('Google authentication error', 'error');
      return { success: false, message: err.message };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        addToast(data.message || 'Registration failed', 'error');
        return { success: false, message: data.message };
      }
      setUser(data.user);
      addToast('Account created successfully!', 'success');
      return { success: true, user: data.user };
    } catch (err) {
      addToast('An error occurred during registration', 'error');
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      addToast('Logged out successfully', 'info');
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        addToast('Profile updated successfully!', 'success');
        return true;
      } else {
        addToast(data.message || 'Failed to update profile', 'error');
        return false;
      }
    } catch (err) {
      addToast('Error updating profile', 'error');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, verifyMfa, register, logout, updateProfile, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
