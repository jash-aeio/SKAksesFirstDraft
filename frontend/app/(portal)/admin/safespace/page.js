'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import styles from './safespaceAdmin.module.css';

export default function SafeSpaceAdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [updateData, setUpdateData] = useState({ status: '', counselor_notes: '' });

  useEffect(() => {
    // Only guidance counselors or admins can access
    if (user && user.role !== 'guidance_counselor' && user.role !== 'admin') {
      alert('Access Denied. Highly confidential module.');
      router.push('/admin');
      return;
    }

    fetchReports();
  }, [user, router]);

  async function fetchReports() {
    try {
      const data = await api.get('/safespace');
      setReports(data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function openReport(report) {
    try {
      // Backend logs the "view_report" action automatically on GET /:id
      const full = await api.get(`/safespace/${report.id}`);
      setSelectedReport(full);
      setUpdateData({ status: full.status, counselor_notes: full.counselor_notes || '' });
    } catch (err) {
      alert('Failed to load report securely.');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      await api.put(`/safespace/${selectedReport.id}`, updateData);
      alert('Report updated successfully. Action logged.');
      fetchReports();
      setSelectedReport(null);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className={styles.safespaceAdmin}>
      <div className={styles.header}>
        <div>
          <h1>🛡️ SafeSpace Counselor Portal</h1>
          <p className={styles.subtitle}>Confidential case management for mental health, VAWC, and bullying reports.</p>
        </div>
      </div>

      <div className={styles.securityBanner}>
        ⚠️ <strong>CONFIDENTIALITY WARNING:</strong> You are accessing the highly isolated SafeSpace module. All actions, views, and updates are securely logged for audit purposes. Do not share this information outside authorized channels.
      </div>

      {reports.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748B', padding: '40px' }}>No confidential reports found.</p>
      ) : (
        <div className={styles.grid}>
          {reports.map((report) => (
            <div key={report.id} className={styles.card} onClick={() => openReport(report)}>
              <div className={styles.cardTop}>
                <span className={`${styles.urgencyBadge} ${styles['urgency_' + report.urgency]}`}>
                  {report.urgency}
                </span>
                <span className={styles.statusBadge}>{report.status.replace('_', ' ')}</span>
              </div>
              <h3 className={styles.type}>{report.type.replace('_', ' ')}</h3>
              <div className={styles.reporter}>
                👤 {report.is_anonymous ? 'Anonymous Youth' : report.reporter_name}
              </div>
              <p className={styles.narrative}>{report.narrative}</p>
              <div className={styles.footer}>
                <span>Report ID: #{report.id}</span>
                <span>{new Date(report.created_at).toLocaleDateString('en-PH')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedReport && (
        <div className={styles.overlay} onClick={() => setSelectedReport(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className={`${styles.urgencyBadge} ${styles['urgency_' + selectedReport.urgency]}`}>
                  {selectedReport.urgency} Urgency
                </span>
                <h2 style={{ color: '#312E81', margin: '8px 0', textTransform: 'capitalize' }}>
                  {selectedReport.type.replace('_', ' ')} Report
                </h2>
                <div style={{ color: '#64748B', fontSize: '0.85rem' }}>
                  Submitted: {new Date(selectedReport.created_at).toLocaleString('en-PH')}
                </div>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedReport(null)}>✕</button>
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Reporter Identity</label>
                <span>{selectedReport.is_anonymous ? '⚠️ ANONYMOUS' : `${selectedReport.reporter_name} (ID: ${selectedReport.reporter_id})`}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Contact Preference</label>
                <span>{selectedReport.contact_preference.replace('_', ' ')}</span>
              </div>
              {selectedReport.contact_details && (
                <div className={styles.infoItem}>
                  <label>Contact Details provided</label>
                  <span>{selectedReport.contact_details}</span>
                </div>
              )}
            </div>

            <div className={styles.fullNarrative}>
              <strong>Narrative:</strong><br/><br/>
              {selectedReport.narrative}
            </div>

            <form className={styles.actionSection} onSubmit={handleUpdate}>
              <h3>Counselor Actions</h3>
              <div className={styles.formGroup}>
                <label>Update Case Status</label>
                <select className={styles.select} value={updateData.status} onChange={e => setUpdateData({...updateData, status: e.target.value})}>
                  <option value="new">New / Unread</option>
                  <option value="in_progress">In Progress / Contacted</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Counselor's Internal Notes (Private)</label>
                <textarea 
                  className={styles.textarea} 
                  placeholder="Record session notes, actions taken, or referrals made..."
                  value={updateData.counselor_notes} 
                  onChange={e => setUpdateData({...updateData, counselor_notes: e.target.value})} 
                />
              </div>
              <button type="submit" className={styles.saveBtn}>Save Case Updates</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
