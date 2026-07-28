'use client';

import React, { useState, useEffect } from 'react';
import { Users, Shield, ShieldOff, Trash2, CheckCircle, AlertOctagon } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminUsersPage() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (userId, currentBlockedStatus) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isBlocked: !currentBlockedStatus }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`User ${!currentBlockedStatus ? 'Blocked' : 'Unblocked'}`, 'info');
        fetchUsers();
      }
    } catch (e) {
      addToast('Failed to update user status', 'error');
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'customer' : 'admin';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: nextRole }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`User role changed to ${nextRole.toUpperCase()}`, 'success');
        fetchUsers();
      }
    } catch (e) {
      addToast('Failed to update role', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          addToast('User deleted', 'info');
          fetchUsers();
        }
      } catch (e) {
        addToast('Failed to delete user', 'error');
      }
    }
  };

  return (
    <div className="admin-users-wrapper">
      <div className="page-header mb-4">
        <div>
          <h1>User Management & Security Access</h1>
          <p>Control customer accounts, block suspicious accounts, and manage admin privileges.</p>
        </div>
      </div>

      <div className="table-card glass-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Account Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center p-4">Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="text-center p-4">No users found.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-cell">
                      <img src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} alt={user.name} className="table-avatar" />
                      <strong>{user.name}</strong>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone || 'N/A'}</td>
                  <td>
                    <button
                      onClick={() => handleToggleRole(user._id, user.role)}
                      className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'} role-btn`}
                      title="Click to toggle role"
                    >
                      {user.role?.toUpperCase()}
                    </button>
                  </td>
                  <td>
                    {user.isBlocked ? (
                      <span className="badge badge-danger"><AlertOctagon size={12} /> Blocked</span>
                    ) : (
                      <span className="badge badge-success"><CheckCircle size={12} /> Active</span>
                    )}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button
                        onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                        className={`btn ${user.isBlocked ? 'btn-secondary' : 'btn-danger'} btn-xs`}
                      >
                        {user.isBlocked ? 'Unblock' : 'Block User'}
                      </button>
                      <button onClick={() => handleDeleteUser(user._id)} className="btn btn-secondary btn-xs">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .table-card { padding: 1.5rem; border-radius: var(--radius-lg); overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th, .admin-table td { padding: 0.85rem; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; }
        .user-cell { display: flex; align-items: center; gap: 0.75rem; }
        .table-avatar { width: 32px; height: 32px; border-radius: var(--radius-full); object-fit: cover; }
        .role-btn { cursor: pointer; border: none; }
        .action-btns { display: flex; gap: 0.35rem; }
      `}</style>
    </div>
  );
}
