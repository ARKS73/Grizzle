'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Plus, Trash2, Edit2, Search, Save, DollarSign, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminShippingPage() {
  const [rates, setRates] = useState([]);
  const [defaultFee, setDefaultFee] = useState(49);
  const [loading, setLoading] = useState(true);
  const [savingDefault, setSavingDefault] = useState(false);
  const [submittingCity, setSubmittingCity] = useState(false);
  const { addToast } = useToast();

  const [cityForm, setCityForm] = useState({
    city: '',
    state: 'Tamil Nadu',
    shippingFee: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editFee, setEditFee] = useState('');

  const fetchRates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/shipping');
      const data = await res.json();
      if (data.success) {
        setRates(data.rates || []);
        setDefaultFee(data.defaultShippingFee !== undefined ? data.defaultShippingFee : 49);
      } else {
        addToast(data.message || 'Failed to fetch shipping rates', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Error loading shipping data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleUpdateDefaultFee = async (e) => {
    e.preventDefault();
    try {
      setSavingDefault(true);
      const res = await fetch('/api/admin/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_default',
          defaultShippingFee: Number(defaultFee),
        }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Default shipping fee updated to ₹${data.defaultShippingFee}`, 'success');
      } else {
        addToast(data.message || 'Failed to update default fee', 'error');
      }
    } catch (err) {
      addToast('Error saving default shipping fee', 'error');
    } finally {
      setSavingDefault(false);
    }
  };

  const handleAddCityRate = async (e) => {
    e.preventDefault();
    if (!cityForm.city.trim() || cityForm.shippingFee === '') {
      addToast('Please enter city name and shipping fee', 'error');
      return;
    }

    try {
      setSubmittingCity(true);
      const res = await fetch('/api/admin/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: cityForm.city.trim(),
          state: cityForm.state || 'Tamil Nadu',
          shippingFee: Number(cityForm.shippingFee),
        }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(data.message || 'City rate saved successfully!', 'success');
        setCityForm({ city: '', state: 'Tamil Nadu', shippingFee: '' });
        fetchRates();
      } else {
        addToast(data.message || 'Failed to add city shipping rate', 'error');
      }
    } catch (err) {
      addToast('Error adding city shipping fee', 'error');
    } finally {
      setSubmittingCity(false);
    }
  };

  const handleQuickEditSave = async (rate) => {
    if (editFee === '') return;
    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: rate.city,
          state: rate.state,
          shippingFee: Number(editFee),
        }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Updated ${rate.city} shipping fee to ₹${editFee}`, 'success');
        setEditingId(null);
        fetchRates();
      } else {
        addToast(data.message, 'error');
      }
    } catch (e) {
      addToast('Error updating rate', 'error');
    }
  };

  const handleDeleteRate = async (id, cityName) => {
    if (!confirm(`Are you sure you want to delete shipping rate for ${cityName}?`)) return;
    try {
      const res = await fetch(`/api/admin/shipping?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Deleted rate for ${cityName}`, 'info');
        fetchRates();
      } else {
        addToast(data.message || 'Failed to delete rate', 'error');
      }
    } catch (err) {
      addToast('Error deleting city shipping rate', 'error');
    }
  };

  const filteredRates = rates.filter((r) =>
    r.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.state && r.state.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="admin-shipping-container p-4">
      <div className="header-title flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Truck color="var(--accent-primary)" /> City-Wise Shipping Rates
          </h1>
          <p className="text-sm text-muted">
            Configure custom delivery charges for specific cities. Unconfigured cities will use the default shipping fee.
          </p>
        </div>
        <button onClick={fetchRates} className="btn btn-secondary btn-sm flex items-center gap-1">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Card 1: Global Default Fee */}
        <div className="glass-panel p-4 rounded-xl border border-white/10">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            <DollarSign size={18} className="text-amber-400" /> Default Shipping Fee
          </h3>
          <p className="text-xs text-muted mb-3">
            Applied automatically when a customer selects a city without a custom rate.
          </p>

          <form onSubmit={handleUpdateDefaultFee} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Standard Default Rate (₹)</label>
              <input
                type="number"
                min="0"
                value={defaultFee}
                onChange={(e) => setDefaultFee(e.target.value)}
                className="form-input font-bold text-lg"
                required
              />
            </div>
            <button
              type="submit"
              disabled={savingDefault}
              className="btn btn-primary btn-sm w-full flex items-center justify-center gap-2"
            >
              <Save size={14} /> {savingDefault ? 'Saving...' : 'Save Default Fee'}
            </button>
          </form>
        </div>

        {/* Card 2: Add New City Rate */}
        <div className="glass-panel p-4 rounded-xl border border-white/10 md:col-span-2">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            <Plus size={18} className="text-emerald-400" /> Set City-Wise Shipping Fee
          </h3>
          <p className="text-xs text-muted mb-3">
            Add or update custom delivery charge for any specific city in Tamil Nadu or India.
          </p>

          <form onSubmit={handleAddCityRate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">City Name *</label>
              <input
                type="text"
                placeholder="e.g. Chennai, Madurai, Salem"
                value={cityForm.city}
                onChange={(e) => setCityForm({ ...cityForm, city: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">State</label>
              <input
                type="text"
                placeholder="e.g. Tamil Nadu"
                value={cityForm.state}
                onChange={(e) => setCityForm({ ...cityForm, state: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Shipping Fee (₹) *</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 40, 60, 0 for FREE"
                value={cityForm.shippingFee}
                onChange={(e) => setCityForm({ ...cityForm, shippingFee: e.target.value })}
                className="form-input font-bold"
                required
              />
            </div>

            <div className="sm:col-span-3 text-right">
              <button
                type="submit"
                disabled={submittingCity}
                className="btn btn-primary btn-sm flex items-center gap-2 ml-auto"
              >
                <Plus size={14} /> {submittingCity ? 'Saving Rate...' : 'Add / Update City Rate'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Configured City Rates Table */}
      <div className="glass-panel p-4 rounded-xl border border-white/10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <MapPin size={18} className="text-sky-400" /> Configured City Rates ({rates.length})
            </h3>
            <span className="text-xs text-muted">Active admin-defined city delivery charges</span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-9 text-xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-muted">Loading city shipping rates...</div>
        ) : filteredRates.length === 0 ? (
          <div className="py-8 text-center text-muted border border-dashed border-white/10 rounded-lg">
            <AlertCircle size={28} className="mx-auto mb-2 opacity-50" />
            <p>No city-specific shipping rates configured yet.</p>
            <p className="text-xs text-muted mt-1">All orders will use the Default Shipping Fee (₹{defaultFee}).</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs text-muted uppercase">
                  <th className="py-2 px-3">City Name</th>
                  <th className="py-2 px-3">State</th>
                  <th className="py-2 px-3">Shipping Fee</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRates.map((rate) => (
                  <tr key={rate._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-bold">{rate.city}</td>
                    <td className="py-3 px-3 text-muted">{rate.state || 'Tamil Nadu'}</td>
                    <td className="py-3 px-3">
                      {editingId === rate._id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs">₹</span>
                          <input
                            type="number"
                            value={editFee}
                            onChange={(e) => setEditFee(e.target.value)}
                            className="form-input text-xs w-20 p-1"
                            autoFocus
                          />
                          <button
                            onClick={() => handleQuickEditSave(rate)}
                            className="btn btn-primary btn-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="btn btn-secondary btn-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className={`font-bold ${rate.shippingFee === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {rate.shippingFee === 0 ? 'FREE (₹0)' : `₹${rate.shippingFee}`}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {editingId !== rate._id && (
                          <button
                            onClick={() => {
                              setEditingId(rate._id);
                              setEditFee(rate.shippingFee);
                            }}
                            className="text-sky-400 hover:text-sky-300 p-1"
                            title="Edit Shipping Fee"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteRate(rate._id, rate.city)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                          title="Delete Rate"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
