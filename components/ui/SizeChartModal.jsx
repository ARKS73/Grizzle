'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Ruler, CheckCircle2, Info, Sparkles } from 'lucide-react';

export default function SizeChartModal({ isOpen, onClose, product }) {
  const [settings, setSettings] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!isOpen || !mounted) return null;

  // Resolve tables: Product-specific sizeCharts vs Store Settings vs Defaults
  let tablesList = [];
  if (Array.isArray(product?.sizeCharts) && product.sizeCharts.length > 0) {
    tablesList = product.sizeCharts.filter(t => t && t.columns && t.columns.length > 0);
  }

  if (tablesList.length === 0) {
    // Fall back to StoreSettings master table or standard defaults
    if (Array.isArray(settings?.sizeChartColumns) && Array.isArray(settings?.sizeChartRows)) {
      tablesList = [{
        title: 'Master Size Chart',
        columns: settings.sizeChartColumns,
        rows: settings.sizeChartRows,
      }];
    } else {
      tablesList = [{
        title: 'Standard Size Chart',
        columns: ['Size', 'Chest (in)', 'Chest (cm)', 'Length (in)', 'Length (cm)', 'Shoulder (in)', 'Shoulder (cm)'],
        rows: [
          ['S', '38-40"', '96-102 cm', '27.5"', '70 cm', '18.5"', '47 cm'],
          ['M', '40-42"', '102-107 cm', '28.5"', '72 cm', '19.5"', '49.5 cm'],
          ['L', '42-44"', '107-112 cm', '29.5"', '75 cm', '20.5"', '52 cm'],
          ['XL', '44-46"', '112-117 cm', '30.5"', '77 cm', '21.5"', '54.5 cm'],
          ['XXL', '46-48"', '117-122 cm', '31.5"', '80 cm', '22.5"', '57 cm'],
          ['3XL', '48-50"', '122-127 cm', '32.5"', '82 cm', '23.5"', '59.5 cm'],
        ],
      }];
    }
  }

  const currentTable = tablesList[activeTabIdx] || tablesList[0];

  const fitTips = product?.sizeChartTips || settings?.sizeChartTips ||
    'Oversized Streetwear Fit: Choose your standard size for a relaxed dropped-shoulder silhouette. For regular fit, size down 1 size.';

  const modalContent = (
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
              <h3 className="modal-title">{product?.name ? `${product.name} Size Guide` : 'Size Chart & Fit Guide'}</h3>
              <p className="modal-sub">{product?.fabricFit || 'Bio-Washed Heavyweight Cotton'}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-close-circle" title="Close">
            <X size={16} />
          </button>
        </div>

        {/* Multi-Table Tabs Header */}
        {tablesList.length > 1 && (
          <div className="table-tabs-bar">
            {tablesList.map((tbl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTabIdx(idx)}
                className={`table-tab-btn ${activeTabIdx === idx ? 'active' : ''}`}
              >
                {tbl.title || `Table ${idx + 1}`}
              </button>
            ))}
          </div>
        )}

        {/* Fit Pill */}
        <div className="controls-bar">
          <div className="fit-pill">
            <Sparkles size={13} color="#f59e0b" />
            <span>{currentTable?.title || 'Streetwear Fit Guide'}</span>
          </div>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="modal-body-scroll">
          {/* Dynamic Table */}
          <div className="table-wrapper">
            <table className="size-table">
              <thead>
                <tr>
                  {(currentTable?.columns || []).map((colName, cIdx) => (
                    <th key={cIdx}>{colName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(currentTable?.rows || []).map((rowArr, rIdx) => (
                  <tr key={rIdx}>
                    {(rowArr || []).map((cellVal, cIdx) => (
                      <td key={cIdx}>
                        {cIdx === 0 ? (
                          <span className="size-pill-tag">{cellVal || '-'}</span>
                        ) : (
                          cellVal || '-'
                        )}
                      </td>
                    ))}
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
          max-width: 580px;
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

        .table-tabs-bar {
          display: flex;
          gap: 0.35rem;
          padding: 0.5rem 1.1rem;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          overflow-x: auto;
          flex-shrink: 0;
        }
        .table-tab-btn {
          padding: 0.4rem 0.85rem;
          border-radius: 20px;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }
        .table-tab-btn.active {
          background: var(--accent-gradient);
          color: white;
          border-color: transparent;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
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

  return createPortal(modalContent, document.body);
}
