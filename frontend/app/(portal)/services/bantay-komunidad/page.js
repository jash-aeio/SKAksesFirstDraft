'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import styles from './komunidad.module.css';

const CATEGORIES = ['all', 'streetlight', 'pothole', 'flooding', 'fallen_tree', 'garbage', 'electrical', 'structural', 'other'];
const CAT_ICONS = { streetlight: '💡', pothole: '🕳️', flooding: '🌊', fallen_tree: '🌳', garbage: '🗑️', electrical: '⚡', structural: '🏗️', other: '⚠️' };
const SEV_STYLES = { low: styles.sevLow, medium: styles.sevMedium, high: styles.sevHigh, critical: styles.sevCritical };
const SEV_STRIPES = { low: styles.severityLow, medium: styles.severityMedium, high: styles.severityHigh, critical: styles.severityCritical };
const STATUS_STYLES = { pending: styles.statusPending, acknowledged: styles.statusAcknowledged, in_progress: styles.statusInProgress, resolved: styles.statusResolved, dismissed: styles.statusDismissed };

export default function BantayKomunidadPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({});
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [form, setForm] = useState({
    category: 'pothole', description: '', severity: 'medium',
    latitude: '', longitude: '', address_text: '',
  });

  const fetchReports = useCallback(async () => {
    try {
      const data = await api.get(`/hazards?category=${category}`);
      setReports(data.reports || []);
      setStats(data.stats || {});
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [category]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  function handleGeolocate() {
    if (!navigator.geolocation) return alert('Geolocation not supported.');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
      },
      () => alert('Unable to get location. Please enter coordinates manually.')
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.description || !form.latitude || !form.longitude) {
      return alert('Description and location are required.');
    }
    try {
      await api.post('/hazards', {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      });
      setShowReport(false);
      setForm({ category: 'pothole', description: '', severity: 'medium', latitude: '', longitude: '', address_text: '' });
      fetchReports();
    } catch (err) { alert(err.message); }
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  return (
    <div className={styles.komunidad}>
      <div className={styles.header}>
        <h1>📍 Bantay-Komunidad</h1>
        <p className={styles.subtitle}>Geo-tagged hazard reporting for a safer, more responsive barangay</p>
      </div>

      {/* ─── Stats ─── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard} style={{ animationDelay: '0s' }}>
          <div className={styles.statNum}>{stats.total || 0}</div>
          <div className={styles.statLab}>Total Reports</div>
        </div>
        <div className={styles.statCard} style={{ animationDelay: '0.1s' }}>
          <div className={`${styles.statNum} ${styles.pending}`}>{stats.pending || 0}</div>
          <div className={styles.statLab}>Pending</div>
        </div>
        <div className={styles.statCard} style={{ animationDelay: '0.2s' }}>
          <div className={`${styles.statNum} ${styles.progress}`}>{stats.in_progress || 0}</div>
          <div className={styles.statLab}>In Progress</div>
        </div>
        <div className={styles.statCard} style={{ animationDelay: '0.3s' }}>
          <div className={`${styles.statNum} ${styles.resolved}`}>{stats.resolved || 0}</div>
          <div className={styles.statLab}>Resolved</div>
        </div>
      </div>

      {/* ─── Toolbar ─── */}
      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          {CATEGORIES.map(cat => (
            <button key={cat} className={`${styles.filterBtn} ${category === cat ? styles.filterBtnActive : ''}`}
              onClick={() => setCategory(cat)}>
              {cat === 'all' ? 'All' : `${CAT_ICONS[cat] || '⚠️'} ${cat.replace('_', ' ')}`}
            </button>
          ))}
        </div>
        <button className={styles.reportBtn} onClick={() => setShowReport(true)}>
          🚨 Report Hazard
        </button>
      </div>

      {/* ─── Reports Grid ─── */}
      {loading ? (
        <div className={styles.emptyState}><p>Loading reports...</p></div>
      ) : reports.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No hazard reports found</h3>
          <p>The community is safe — or be the first to report an issue!</p>
        </div>
      ) : (
        <div className={styles.reportGrid}>
          {reports.map((r, i) => (
            <div key={r.id} className={styles.reportCard} style={{ animationDelay: `${i * 0.06}s` }}>
              <div className={`${styles.severityStripe} ${SEV_STRIPES[r.severity] || ''}`} />
              <div className={styles.reportHeader}>
                <div className={styles.reportCategory}>
                  <div className={styles.catIcon}>{CAT_ICONS[r.category] || '⚠️'}</div>
                  <div>
                    <div className={styles.catName}>{r.category.replace('_', ' ')}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>by {r.reporter_name}</div>
                  </div>
                </div>
                <span className={`${styles.statusTag} ${STATUS_STYLES[r.status] || ''}`}>
                  {r.status.replace('_', ' ')}
                </span>
              </div>
              <p className={styles.reportDesc}>{r.description}</p>
              <div className={styles.reportFooter}>
                <span className={styles.reportLocation}>📍 {r.address_text || `${r.latitude}, ${r.longitude}`}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`${styles.severityBadge} ${SEV_STYLES[r.severity] || ''}`}>{r.severity}</span>
                  <span>{timeAgo(r.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Report Modal ─── */}
      {showReport && (
        <div className={styles.overlay} onClick={() => setShowReport(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>🚨 Report a Hazard</h2>
              <button className={styles.closeBtn} onClick={() => setShowReport(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Hazard Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.filter(c => c !== 'all').map(c => (
                    <option key={c} value={c}>{CAT_ICONS[c]} {c.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Severity</label>
                <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}>
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                  <option value="critical">🚨 Critical</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea placeholder="Describe the hazard in detail..." value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
              </div>
              <div className={styles.formGroup}>
                <label>Location</label>
                <button type="button" className={styles.geoBtn} onClick={handleGeolocate}>
                  📍 Use My Current Location
                </button>
                <div className={styles.coordRow}>
                  <input placeholder="Latitude" value={form.latitude}
                    onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} required />
                  <input placeholder="Longitude" value={form.longitude}
                    onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} required />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Address / Landmark (optional)</label>
                <input placeholder="e.g., Near Katipunan Elementary School" value={form.address_text}
                  onChange={e => setForm(f => ({ ...f, address_text: e.target.value }))} />
              </div>
              <button type="submit" className={styles.submitBtn}>📤 Submit Hazard Report</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
