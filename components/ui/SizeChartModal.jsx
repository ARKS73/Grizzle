'use client';

import React, { useState, useEffect } from 'react';
import { X, Ruler, CheckCircle2, Info, Sparkles } from 'lucide-react';

export default function SizeChartModal({ isOpen, onClose }) {
  const [unit, setUnit] = useState('in'); // 'in' or 'cm'
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    async function fetchChartSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      } catch (e) {
        console.error('Error fetching size chart settings:', e);
      }
    }
    fetchChartSettings();
  }, [isOpen]);

  if (!isOpen) return null;

  const defaultSizingData = [
    { size: 'S', chestIn: '38-40"', chestCm: '96-102 cm', lengthIn: '27.5"', lengthCm: '70 cm', shoulderIn: '18.5"', shoulderCm: '47 cm', sleeveIn: '8.5"', sleeveCm: '21 cm' },
    { size: 'M', chestIn: '40-42"', chestCm: '102-107 cm', lengthIn: '28.5"', lengthCm: '72 cm', shoulderIn: '19.5"', shoulderCm: '49.5 cm', sleeveIn: '9.0"', sleeveCm: '23 cm' },
    { size: 'L', chestIn: '42-44"', chestCm: '107-112 cm', lengthIn: '29.5"', lengthCm: '75 cm', shoulderIn: '20.5"', shoulderCm: '52 cm', sleeveIn: '9.5"', sleeveCm: '24 cm' },
    { size: 'XL', chestIn: '44-46"', chestCm: '112-117 cm', lengthIn: '30.5"', lengthCm: '77 cm', shoulderIn: '21.5"', shoulderCm: '54.5 cm', sleeveIn: '10.0"', sleeveCm: '25.5 cm' },
    { size: 'XXL', chestIn: '46-48"', chestCm: '117-122 cm', lengthIn: '31.5"', lengthCm: '80 cm', shoulderIn: '22.5"', shoulderCm: '57 cm', sleeveIn: '10.5"', sleeveCm: '26.5 cm' },
  ];

  const sizingData = (settings?.sizeChartData && settings.sizeChartData.length > 0)
    ? settings.sizeChartData
    : defaultSizingData;

  const fitTips = settings?.sizeChartTips ||
    'Oversized Streetwear Fit: Choose your standard size for a relaxed dropped-shoulder silhouette. For regular fit, size down 1 size.';

  return (
    <div className="size-chart-modal-root" onClick={onClose}>
      <div className="size-chart-backdrop" />
      <div className="size-chart-sheet glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="title-group">
            <div className="icon-badge">
              <Ruler size={18} color="var(--accent-primary)" />
            </div>
            <div>
              <h3 className="modal-title">Size Chart &amp; Fit Guide</h3>
              <p className="modal-sub">240 GSM Bio-Washed Heavyweight Cotton</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-close-circle" title="Close">
            <X size={16} />
          </button>
        </div>

        {/* Controls & Unit Switcher */}
        <div className="controls-bar">
          <div className="fit-pill">
            <Sparkles size={13} color="#f59e0b" />
            <span>Streetwear Oversized Fit</span>
          </div>

          <div className="unit-toggle-group">
            <button
              onClick={() => setUnit('in')}
              className={`unit-toggle-btn ${unit === 'in' ? 'active' : ''}`}
            >
              Inches (in)
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`unit-toggle-btn ${unit === 'cm' ? 'active' : ''}`}
            >
              Centimeters (cm)
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="modal-body-scroll">
          {/* Table */}
          <div className="table-wrapper">
            <table className="size-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest</th>
                  <th>Length</th>
                  <th>Shoulder</th>
                  <th>Sleeve</th>
                </tr>
              </thead>
              <tbody>
                {sizingData.map((row) => (
                  <tr key={row.size}>
                    <td>
                      <span className="size-pill-tag">{row.size}</span>
                    </td>
                    <td><strong>{unit === 'in' ? row.chestIn : row.chestCm}</strong></td>
                    <td>{unit === 'in' ? row.lengthIn : row.lengthCm}</td>
                    <td>{unit === 'in' ? row.shoulderIn : row.shoulderCm}</td>
                    <td>{unit === 'in' ? row.sleeveIn : row.sleeveCm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tips & Recommendations */}
          <div className="tips-box">
            <h4 className="tips-title">
              <Info size={14} color="var(--accent-primary)" /> Fit Recommendation:
            </h4>
            <p className="tips-text">{fitTips}</p>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-primary btn-block btn-sm font-bold" style={{ padding: '0.6rem 1rem' }}>
            Got It, Back to Shopping
          </button>
        </div>
      </div>

      <style jsx>{`
        .size-chart-modal-root {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem;
        }
        .size-chart-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          z-index: 1;
        }
        .size-chart-sheet {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 520px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          border-radius: var(--radius-lg, 18px);
          border: 1px solid var(--border-color);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          overflow: hidden;
          animation: modalPop 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.1rem;
          border-bottom: 1px solid var(--border-color);
          flex-shrink: 0;
        }
        .title-group {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .icon-badge {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: var(--accent-light);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .modal-title {
          font-size: 1rem;
          font-weight: 800;
          margin: 0;
          color: var(--text-primary);
          line-height: 1.2;
        }
        .modal-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
          margin-top: 1px;
        }
        .btn-close-circle {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .controls-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.6rem 1.1rem;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-color);
          flex-wrap: wrap;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        .fit-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .unit-toggle-group {
          display: flex;
          background: var(--bg-secondary);
          padding: 2px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
        }
        .unit-toggle-btn {
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .unit-toggle-btn.active {
          background: var(--accent-primary);
          color: white;
          box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
        }

        .modal-body-scroll {
          overflow-y: auto;
          flex: 1;
          -webkit-overflow-scrolling: touch;
        }

        .table-wrapper {
          overflow-x: auto;
          padding: 0.75rem 1.1rem;
        }
        .size-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .size-table th, .size-table td {
          padding: 0.55rem 0.6rem;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.78rem;
        }
        .size-table th {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.04em;
        }
        .size-pill-tag {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 26px;
          height: 26px;
          padding: 0 0.4rem;
          border-radius: 6px;
          background: var(--accent-light);
          color: var(--accent-primary);
          font-weight: 900;
          font-size: 0.78rem;
        }

        .tips-box {
          margin: 0.25rem 1.1rem 0.85rem 1.1rem;
          padding: 0.75rem 0.9rem;
          border-radius: 10px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
        }
        .tips-title {
          font-size: 0.78rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-bottom: 0.3rem;
          color: var(--text-primary);
        }
        .tips-text {
          font-size: 0.74rem;
          color: var(--text-secondary);
          line-height: 1.45;
          margin: 0;
        }

        .modal-footer {
          padding: 0.75rem 1.1rem;
          border-top: 1px solid var(--border-color);
          background: var(--bg-secondary);
          flex-shrink: 0;
        }

        @media (max-width: 600px) {
          .size-chart-sheet {
            max-width: 95%;
            max-height: 82vh;
            border-radius: 16px;
          }
          .table-wrapper {
            padding: 0.5rem 0.75rem;
          }
          .size-table th, .size-table td {
            padding: 0.45rem 0.4rem;
            font-size: 0.72rem;
          }
          .modal-header, .controls-bar, .modal-footer {
            padding-left: 0.85rem;
            padding-right: 0.85rem;
          }
          .tips-box {
            margin-left: 0.85rem;
            margin-right: 0.85rem;
          }
        }

        @keyframes modalPop {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
