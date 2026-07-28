'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Save, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profileImage: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        profileImage: user.profileImage || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        postalCode: user.address?.postalCode || '',
        country: user.address?.country || 'United States',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const success = await updateProfile({
      name: formData.name,
      phone: formData.phone,
      profileImage: formData.profileImage,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      },
    });
    setSaving(false);
  };

  if (!user) return null;

  return (
    <div className="container profile-page-wrapper">
      <h1 className="profile-title">Account & Profile Settings</h1>

      <div className="profile-grid">
        {/* User Card Sidebar */}
        <div className="user-summary-card glass-panel text-center">
          <img src={formData.profileImage || user.profileImage} alt={user.name} className="profile-avatar" />
          <h2 className="user-name mt-3">{user.name}</h2>
          <p className="user-email">{user.email}</p>
          <span className="badge badge-primary mt-2">Role: {user.role?.toUpperCase()}</span>
        </div>

        {/* Profile Details Form */}
        <div className="profile-form-box glass-panel">
          <h3>Personal Details & Address</h3>

          <form onSubmit={handleSubmit} className="profile-form mt-3">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group span-2">
                <label className="form-label">Profile Image URL</label>
                <input
                  type="text"
                  name="profileImage"
                  value={formData.profileImage}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group span-2">
                <label className="form-label">Default Shipping Street</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">State / Province</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postal / Zip Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary mt-3">
              <Save size={18} /> {saving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .profile-page-wrapper {
          padding-top: 2rem;
        }
        .profile-title {
          font-size: 2.2rem;
          margin-bottom: 2rem;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 2rem;
        }

        .user-summary-card {
          padding: 2.5rem 1.5rem;
          border-radius: var(--radius-lg);
          height: fit-content;
        }
        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: var(--radius-full);
          object-fit: cover;
          margin: 0 auto;
          border: 3px solid var(--accent-primary);
        }
        .user-name { font-size: 1.4rem; }
        .user-email { font-size: 0.85rem; color: var(--text-muted); }

        .profile-form-box {
          padding: 2rem;
          border-radius: var(--radius-lg);
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .span-2 { grid-column: span 2; }

        @media (max-width: 900px) {
          .profile-grid { grid-template-columns: 1fr; }
          .form-grid { grid-template-columns: 1fr; }
          .span-2 { grid-column: span 1; }
        }
      `}</style>
    </div>
  );
}
