'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-card toast-${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 size={18} className="toast-icon" />}
            {toast.type === 'error' && <AlertCircle size={18} className="toast-icon" />}
            {toast.type === 'info' && <Info size={18} className="toast-icon" />}
            <span className="toast-message">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="toast-close">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <style jsx>{`
        .toast-container {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-width: 380px;
          width: 100%;
          pointer-events: none;
        }
        .toast-card {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1.15rem;
          border-radius: var(--radius-md);
          background: var(--bg-elevated);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-lg);
          color: var(--text-primary);
          font-size: 0.9rem;
          font-weight: 500;
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .toast-success { border-left: 4px solid var(--success); }
        .toast-error { border-left: 4px solid var(--danger); }
        .toast-info { border-left: 4px solid var(--info); }
        .toast-icon { flex-shrink: 0; }
        .toast-success .toast-icon { color: var(--success); }
        .toast-error .toast-icon { color: var(--danger); }
        .toast-info .toast-icon { color: var(--info); }
        .toast-message { flex: 1; }
        .toast-close {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
        }
        .toast-close:hover { color: var(--text-primary); }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
