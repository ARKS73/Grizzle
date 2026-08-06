'use client';

import React, { useState } from 'react';
import { X, Ruler, CheckCircle2, Info, Sparkles } from 'lucide-react';

export default function SizeChartModal({ isOpen, onClose }) {
  const [unit, setUnit] = useState('in'); // 'in' or 'cm'

  if (!isOpen) return null;

  const sizingData = [
    { size: 'S', chestIn: '38-40"', chestCm: '96-102 cm', lengthIn: '27.5"', lengthCm: '70 cm', shoulderIn: '18.5"', shoulderCm: '47 cm', sleeveIn: '8.5"', sleeveCm: '21 cm' },
    { size: 'M', chestIn: '40-42"', chestCm: '102-107 cm', lengthIn: '28.5"', lengthCm: '72 cm', shoulderIn: '19.5"', shoulderCm: '49.5 cm', sleeveIn: '9.0"', sleeveCm: '23 cm' },
    { size: 'L', chestIn: '42-44"', chestCm: '107-112 cm', lengthIn: '29.5"', lengthCm: '75 cm', shoulderIn: '20.5"', shoulderCm: '52 cm', sleeveIn: '9.5"', sleeveCm: '24 cm' },
    { size: 'XL', chestIn: '44-46"', chestCm: '112-117 cm', lengthIn: '30.5"', lengthCm: '77 cm', shoulderIn: '21.5"', shoulderCm: '54.5 cm', sleeveIn: '10.0"', sleeveCm: '25.5 cm' },
    { size: 'XXL', chestIn: '46-48"', chestCm: '117-122 cm', lengthIn: '31.5"', lengthCm: '80 cm', shoulderIn: '22.5"', shoulderCm: '57 cm', sleeveIn: '10.5"', sleeveCm: '26.5 cm' },
  ];

  return (
    <div className="size-chart-modal-root" onClick={onClose}>
      <div className="size-chart-backdrop" />
      <div className="size-chart-sheet glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="title-group">
            <div className="icon-badge">
              <Ruler size={22} color="var(--accent-primary)" />
            </div>
            <div>
              <h3 className="modal-title">Grizzle Size Chart &amp; Fit Guide</h3>
              <p className="modal-sub">240 GSM Bio-Washed Heavyweight Cotton Oversized Cut</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-close-circle" title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Controls & Unit Switcher */}
        <div className="controls-bar">
          <div className="fit-pill">
            <Sparkles size={14} color="#f59e0b" />
            <span>Relaxed Dropped-Shoulder Streetwear Fit</span>
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

        {/* Table */}
        <div className="table-wrapper">
          <table className="size-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Chest / Bust</th>
                <th>Front Length</th>
                <th>Shoulder Width</th>
                <th>Sleeve Length</th>
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
            <Info size={16} color="var(--accent-primary)" /> How To Choose Your Perfect Size:
          </h4>
          <ul className="tips-list">
            <li><strong>Oversized Streetwear Fit (Recommended):</strong> Choose your standard t-shirt size for a relaxed, trendy dropped-shoulder silhouette.</li>
            <li><strong>Regular / Regular Slim Fit:</strong> If you prefer a traditional standard fit tee, order <strong>1 size smaller</strong> than your normal size.</li>
            <li><strong>Care &amp; Shrinkage:</strong> Pre-shrunk 240 GSM bio-washed heavy cotton with zero shrink rate across 50+ wash cycles.</li>
          </ul>
        </div>

        {/* Footer CTA */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-primary btn-block font-bold">
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
          padding: 1rem;
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
          max-width: 650px;
          background: var(--bg-secondary);
          border-radius: var(--radius-lg, 20px);
          border: 1px solid var(--border-color);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
          overflow: hidden;
          animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        .title-group {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .icon-badge {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: var(--accent-light);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-title {
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0;
          color: var(--text-primary);
        }
        .modal-sub {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .btn-close-circle {
          width: 34px;
          height: 34px;
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
          padding: 0.85rem 1.5rem;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-color);
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .fit-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .unit-toggle-group {
          display: flex;
          background: var(--bg-secondary);
          padding: 3px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }
        .unit-toggle-btn {
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.3rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .unit-toggle-btn.active {
          background: var(--accent-primary);
          color: white;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }

        .table-wrapper {
          overflow-x: auto;
          padding: 1rem 1.5rem;
        }
        .size-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .size-table th, .size-table td {
          padding: 0.75rem 0.85rem;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.88rem;
        }
        .size-table th {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }
        .size-pill-tag {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          height: 32px;
          padding: 0 0.5rem;
          border-radius: 8px;
          background: var(--accent-light);
          color: var(--accent-primary);
          font-weight: 900;
          font-size: 0.85rem;
        }

        .tips-box {
          margin: 0 1.5rem 1rem 1.5rem;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
        }
        .tips-title {
          font-size: 0.85rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }
        .tips-list {
          font-size: 0.78rem;
          color: var(--text-secondary);
          line-height: 1.55;
          margin: 0;
          padding-left: 1.1rem;
        }
        .tips-list li {
          margin-bottom: 0.25rem;
        }

        .modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }

        @keyframes modalPop {
          from {
            opacity: 0;
            transform: scale(0.94) translateY(10px);
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
