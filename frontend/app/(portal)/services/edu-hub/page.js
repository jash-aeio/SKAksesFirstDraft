'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import styles from './eduhub.module.css';

const LEVELS = ['all', 'barangay', 'city', 'national', 'international'];

export default function EduHubPage() {
  const [scholarships, setScholarships] = useState([]);
  const [level, setLevel] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get(`/scholarships?level=${level}`);
        setScholarships(data.scholarships || []);
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    load();
  }, [level]);

  async function openDetail(s) {
    try {
      const full = await api.get(`/scholarships/${s.id}`);
      setShowDetail(full);
      // Mark as interested/applied internally if they view it
      if (full.application_url) {
        api.post(`/scholarships/${s.id}/apply`).catch(() => {}); // silent fail if already applied
      }
    } catch (err) { setShowDetail(s); }
  }

  return (
    <div className={styles.eduhub}>
      <div className={styles.header}>
        <h1>🎓 Edu-Hub Scholarship Matcher</h1>
        <p className={styles.subtitle}>Discover and secure funding for your educational journey</p>
      </div>

      <div className={styles.toolbar}>
        {LEVELS.map(lvl => (
          <button key={lvl} className={`${styles.filterBtn} ${level === lvl ? styles.filterBtnActive : ''}`}
            onClick={() => setLevel(lvl)}>
            {lvl}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.emptyState}><p>Loading scholarships...</p></div>
      ) : scholarships.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No scholarships found</h3>
          <p>We couldn't find any open scholarships for this category right now.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {scholarships.map((s, i) => (
            <div key={s.id} className={styles.card} style={{ animationDelay: `${i * 0.08}s` }}
                 onClick={() => openDetail(s)}>
              <span className={`${styles.levelTag} ${styles[s.level] || ''}`}>{s.level}</span>
              <h3 className={styles.title}>{s.title}</h3>
              <div className={styles.provider}>🏛️ {s.provider}</div>
              <p className={styles.desc}>{s.description}</p>
              
              <div className={styles.footer}>
                <span className={styles.deadline}>📅 Ends: {new Date(s.deadline).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <button className={styles.viewBtn}>Details</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className={styles.overlay} onClick={() => setShowDetail(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className={`${styles.levelTag} ${styles[showDetail.level] || ''}`}>{showDetail.level}</span>
                <h2>{showDetail.title}</h2>
                <div className={styles.provider} style={{ marginBottom: 0, fontSize: '1rem' }}>🏛️ {showDetail.provider}</div>
              </div>
              <button className={styles.closeBtn} onClick={() => setShowDetail(null)}>✕</button>
            </div>

            <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: '#1E293B', marginBottom: '24px' }}>
              {showDetail.description}
            </p>

            <div className={styles.detailBlock}>
              <h4>🎁 Benefits & Coverage</h4>
              <p>{showDetail.benefits || 'Not specified. Refer to the application link.'}</p>
            </div>

            <div className={styles.detailBlock}>
              <h4>📋 Requirements</h4>
              <p>{showDetail.requirements || 'Check the provider\'s official guidelines.'}</p>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '24px', color: '#475569', fontSize: '0.9rem' }}>
              <div><strong>Slots:</strong> {showDetail.slots || 'Unspecified'}</div>
              <div><strong>Deadline:</strong> {new Date(showDetail.deadline).toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>

            {showDetail.application_url && (
              <a href={showDetail.application_url} target="_blank" rel="noopener noreferrer" className={styles.applyLink}>
                🌐 Proceed to Official Application Form
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
