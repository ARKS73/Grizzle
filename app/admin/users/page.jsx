'use client';

import React, { useState, useEffect } from 'react';
import { Users, Shield, ShieldOff, Trash2, CheckCircle, AlertOctagon, Plus, RefreshCw, UserPlus, X, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminUsersPage() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        addToast(data.message || 'Failed to load users', 'error');
      }
    } catch (e) {
      console.error(e);
      addToast('Error connecting to MongoDB', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      addToast('Name, email and password are required', 'error');
      return;
    }
    try {
      setCreating(true);
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (data.success) {
        addToast(data.message, 'success');
        setNewUser({ name: '', email: '', password: '', phone: '', role: 'customer' });
        setShowCreateForm(false);
        fetchUsers();
      } else {
        addToast(data.message || 'Failed to create user', 'error');
      }
    } catch (e) {
      addToast('Error creating user in MongoDB', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleBlock = async (userId, currentBlockedStatus, userName) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isBlocked: !currentBlockedStatus }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`${userName} has been ${!currentBlockedStatus ? 'blocked' : 'unblocked'}`, 'info');
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isBlocked: !currentBlockedStatus } : u))
        );
      } else {
        addToast(data.message || 'Failed to update user', 'error');
      }
    } catch (e) {
      addToast('Failed to update user status', 'error');
    }
  };

  const handleToggleRole = async (userId, currentRole, userName) => {
    const nextRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (!confirm(`Change ${userName}'s role from ${currentRole.toUpperCase()} → ${nextRole.toUpperCase()}?`)) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: nextRole }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`${userName}'s role changed to ${nextRole.toUpperCase()} in MongoDB`, 'success');
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: nextRole } : u))
        );
      } else {
        addToast(data.message || 'Failed to update role', 'error');
      }
    } catch (e) {
      addToast('Failed to update role', 'error');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Permanently delete "${userName}" from MongoDB? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast(`${userName} deleted from MongoDB`, 'info');
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      } else {
        addToast(data.message || 'Failed to delete user', 'error');
      }
    } catch (e) {
      addToast('Failed to delete user', 'error');
    }
  };

  const admins = users.filter((u) => u.role === 'admin');
  const customers = users.filter((u) => u.role === 'customer');

  return (
    <div className="admin-users-wrapper">
      {/* Header */}
      <div className="page-header mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>User Management</h1>
          <p>All users stored live in MongoDB. Create admins, manage customers, block accounts.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchUsers} className="btn btn-secondary">
            <RefreshCw size={15} /> Refresh
          </button>
          <button onClick={() => setShowCreateForm((v) => !v)} className="btn btn-primary">
            {showCreateForm ? <X size={15} /> : <UserPlus size={15} />}
            {showCreateForm ? 'Cancel' : 'Create User / Admin'}
          </button>
        </div>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="glass-panel mb-4" style={{ padding: '1.75rem', borderRadius: '16px', border: '1px solid rgba(255,200,0,0.2)' }}>
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1.05rem', fontWeight: 800 }}>
            <UserPlus size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Create New User — Stored in MongoDB
          </h3>
          <form onSubmit={handleCreateUser}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Arjun Kumar"
                  value={newUser.name}
                  onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. admin@grizzle.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Set a strong password"
                    value={newUser.password}
                    onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
                    required
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+91 9876543210"
                  value={newUser.phone}
                  onChange={(e) => setNewUser((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Role</label>
                <select
                  className="form-input"
                  value={newUser.role}
                  onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Saving to MongoDB...' : '+ Save User to Database'}
            </button>
          </form>
        </div>
      )}

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900 }}>{users.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total in MongoDB</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-primary)' }}>{admins.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admin Accounts</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900 }}>{customers.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customers</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-card glass-panel">
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 800 }}>
          All Users — Live from MongoDB ({users.length})
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading users from MongoDB...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center" style={{ padding: '2.5rem' }}>
                    <UserPlus size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No users found in MongoDB yet.</p>
                    <button onClick={() => setShowCreateForm(true)} className="btn btn-primary">
                      <Plus size={14} /> Create First Admin Account
                    </button>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} style={{ background: user.role === 'admin' ? 'rgba(255,200,0,0.04)' : 'transparent' }}>
                    <td>
                      <div className="user-cell">
                        <div className="avatar-circle" style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: user.role === 'admin'
                            ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.9rem', fontWeight: 800, color: '#fff', flexShrink: 0,
                        }}>
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <strong style={{ display: 'block' }}>{user.name}</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {user._id?.slice(-6)}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.83rem' }}>{user.email}</td>
                    <td style={{ fontSize: '0.83rem' }}>{user.phone || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td>
                      <button
                        onClick={() => handleToggleRole(user._id, user.role, user.name)}
                        className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}
                        style={{ cursor: 'pointer', border: 'none', fontWeight: 800 }}
                        title="Click to toggle role"
                      >
                        {user.role === 'admin' ? '👑 ADMIN' : '👤 CUSTOMER'}
                      </button>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td>
                      {user.isBlocked ? (
                        <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <AlertOctagon size={11} /> Blocked
                        </span>
                      ) : (
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={11} /> Active
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleToggleBlock(user._id, user.isBlocked, user.name)}
                          className={`btn ${user.isBlocked ? 'btn-secondary' : 'btn-danger'} btn-xs`}
                          title={user.isBlocked ? 'Unblock User' : 'Block User'}
                        >
                          {user.isBlocked ? <CheckCircle size={13} /> : <ShieldOff size={13} />}
                          {user.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          className="btn btn-secondary btn-xs"
                          title="Delete from MongoDB"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .table-card { padding: 1.5rem; border-radius: var(--radius-lg); }
        .admin-table { width: 100%; border-collapse: collapse; min-width: 700px; }
        .admin-table th { padding: 0.75rem 0.85rem; border-bottom: 2px solid var(--border-color); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 700; }
        .admin-table td { padding: 0.85rem; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; vertical-align: middle; }
        .admin-table tr:last-child td { border-bottom: none; }
        .admin-table tr:hover td { background: rgba(255,255,255,0.02); }
        .user-cell { display: flex; align-items: center; gap: 0.75rem; }
        .action-btns { display: flex; gap: 0.4rem; align-items: center; }
        .btn-xs { padding: 0.3rem 0.6rem; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 0.3rem; }
      `}</style>
    </div>
  );
}
