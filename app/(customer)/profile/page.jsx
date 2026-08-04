'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Save, ShieldCheck, Upload, Camera, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';

// Helper to compress local uploaded profile photo before saving
const compressProfileImage = (file, maxWidth = 500, maxHeight = 500, quality = 0.8) => {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(event.target.result);
      img.src = event.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

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
  const [uploading, setUploading] = useState(false);

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
        country: user.address?.country || 'India',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Local File Upload Handler
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const compressedData = await compressProfileImage(file);
      if (compressedData) {
        setFormData((prev) => ({ ...prev, profileImage: compressedData }));
        addToast('Profile photo updated! Click "Save Profile Changes" to save.', 'success');
      } else {
        addToast('Failed to process image file. Please try another photo.', 'error');
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      addToast('Error uploading local photo.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleTriggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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

  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

  return (
    <div className="container profile-page-wrapper">
      <h1 className="profile-title">Account & Profile Settings</h1>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <div className="profile-grid">
        {/* User Avatar & Upload Sidebar */}
        <div className="user-summary-card glass-panel text-center">
          <div className="avatar-upload-wrapper" onClick={handleTriggerFileSelect} title="Click to Upload Local Photo">
            <img
              src={formData.profileImage || user.profileImage || defaultAvatar}
              alt={user.name}
              className="profile-avatar"
            />
            <div className="avatar-camera-overlay">
              <Camera size={22} className="camera-icon" />
              <span className="overlay-text">Upload</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTriggerFileSelect}
            disabled={uploading}
            className="btn btn-secondary btn-sm mt-3 upload-btn"
          >
            <Upload size={15} /> {uploading ? 'Processing Photo...' : 'Upload Photo from Device'}
          </button>

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
                <label className="form-label">Profile Image (Local Upload or Web URL)</label>
                <div className="image-input-group">
                  <input
                    type="text"
                    name="profileImage"
                    placeholder="Upload local photo above or paste image URL"
                    value={formData.profileImage}
                    onChange={handleChange}
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={handleTriggerFileSelect}
                    className="btn btn-secondary"
                  >
                    <Upload size={16} /> Choose File
                  </button>
                </div>
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

            <button type="submit" disabled={saving || uploading} className="btn btn-primary mt-3">
              <Save size={18} /> {saving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .profile-page-wrapper {
          padding-top: 2rem;
          padding-bottom: 4rem;
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
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .avatar-upload-wrapper {
          position: relative;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          cursor: pointer;
          margin: 0 auto;
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }

        .profile-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border: 3px solid var(--accent-primary);
          border-radius: 50%;
          transition: transform 0.3s ease;
        }

        .avatar-camera-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(2px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.25s ease;
          border-radius: 50%;
        }

        .avatar-upload-wrapper:hover .avatar-camera-overlay {
          opacity: 1;
        }

        .avatar-upload-wrapper:hover .profile-avatar {
          transform: scale(1.05);
        }

        .overlay-text {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 2px;
        }

        .upload-btn {
          width: 100%;
          justify-content: center;
        }

        .user-name { font-size: 1.4rem; font-weight: 800; }
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

        .image-input-group {
          display: flex;
          gap: 0.5rem;
        }

        @media (max-width: 900px) {
          .profile-grid { grid-template-columns: 1fr; }
          .form-grid { grid-template-columns: 1fr; }
          .span-2 { grid-column: span 1; }
          .image-input-group { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}

