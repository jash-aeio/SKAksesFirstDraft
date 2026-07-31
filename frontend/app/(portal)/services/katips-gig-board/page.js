'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import styles from './gigs.module.css';

const CATEGORIES = ['all', 'retail', 'food', 'tutoring', 'tech', 'manual_labor', 'events', 'admin_work', 'general'];

export default function GigBoardPage() {
  const { user } = useAuth();
  const [gigs, setGigs] = useState([]);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(null);
  const [appMessage, setAppMessage] = useState('');

  const fetchGigs = useCallback(async () => {
    try {
      const data = await api.get(`/gigs?category=${category}`);
      setGigs(data.gigs || []);
      setTotal(data.total || 0);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [category]);

  useEffect(() => { fetchGigs(); }, [fetchGigs]);

  async function openGig(gig) {
    try {
      const full = await api.get(`/gigs/${gig.id}`);
      setShowDetail(full);
    } catch (err) { setShowDetail(gig); }
  }

  async function handleApply(e) {
    e.preventDefault();
    if (!user.is_verified) return alert('Only verified users (QCID/LHY holders) can apply for gigs.');
    try {
      await api.post(`/gigs/${showDetail.id}/apply`, { message: appMessage });
      alert('Application sent successfully!');
      setShowDetail(null);
      setAppMessage('');
    } catch (err) { alert(err.message); }
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    return `${days}d ago`;
  }

  return (
    <div className={styles.gigs}>
      <div className={styles.header}>
        <h1>💼 Katips Gig Board</h1>
        <p className={styles.subtitle}>Find local micro-jobs, freelance work, and part-time opportunities</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          {CATEGORIES.map(cat => (
            <button key={cat} className={`${styles.filterBtn} ${category === cat ? styles.filterBtnActive : ''}`}
              onClick={() => setCategory(cat)}>
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.emptyState}><p>Loading gigs...</p></div>
      ) : gigs.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No gigs available</h3>
          <p>Check back later for new local opportunities.</p>
        </div>
      ) : (
        <div className={styles.gigGrid}>
          {gigs.map((gig, i) => (
            <div key={gig.id} className={styles.gigCard} style={{ animationDelay: `${i * 0.05}s` }}
                 onClick={() => openGig(gig)}>
              <div className={styles.gigTop}>
                <div>
                  <h3 className={styles.gigTitle}>{gig.title}</h3>
                  <div className={styles.gigCompany}>🏢 {gig.company_name || 'Local Resident'}</div>
                </div>
                <div className={styles.payBadge}>
                  💰 {gig.pay_range}
                </div>
              </div>

              <p className={styles.gigDesc}>{gig.description}</p>

              <div className={styles.gigMetaRow}>
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}>📍</span> {gig.location}
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}>⏳</span> {timeAgo(gig.created_at)}
                </div>
              </div>

              <div className={styles.gigFooter}>
                <span className={styles.catTag}>{gig.category.replace('_', ' ')}</span>
                <button className={styles.applyBtn}>View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Detail Modal ─── */}
      {showDetail && (
        <div className={styles.overlay} onClick={() => setShowDetail(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 style={{ color: '#065F46', fontSize: '1.4rem', marginBottom: '4px' }}>{showDetail.title}</h2>
                <div className={styles.gigCompany}>🏢 {showDetail.company_name} • 📍 {showDetail.location}</div>
              </div>
              <button className={styles.closeBtn} onClick={() => setShowDetail(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <div className={styles.payBadge}>💰 {showDetail.pay_range} ({showDetail.pay_type.replace('_', ' ')})</div>
              <div className={styles.payBadge} style={{ background: '#F3F4F6', color: '#4B5563' }}>
                📅 Deadline: {new Date(showDetail.deadline).toLocaleDateString('en-PH')}
              </div>
            </div>

            <div className={styles.detailSection}>
              <h4>Description</h4>
              <p>{showDetail.description}</p>
            </div>

            {showDetail.requirements && (
              <div className={styles.detailSection}>
                <h4>Requirements</h4>
                <p>{showDetail.requirements}</p>
              </div>
            )}

            <form className={styles.formGroup} onSubmit={handleApply}>
              <label>Send a message to the employer</label>
              <textarea placeholder="Briefly explain why you're a good fit for this gig..."
                value={appMessage} onChange={e => setAppMessage(e.target.value)} required />
              <button type="submit" className={styles.submitBtn}>🚀 Apply Now</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
