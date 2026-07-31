'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import styles from './exchange.module.css';

const SCOPES = ['all', 'local', 'national', 'international'];

export default function ExchangePage() {
  const [opportunities, setOpportunities] = useState([]);
  const [scope, setScope] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get(`/exchange?scope=${scope}`);
        setOpportunities(data.opportunities || []);
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    load();
  }, [scope]);

  async function openDetail(opp) {
    try {
      const full = await api.get(`/exchange/${opp.id}`);
      setShowDetail(full);
    } catch (err) { setShowDetail(opp); }
  }

  return (
    <div className={styles.exchange}>
      <div className={styles.header}>
        <h1>✈️ Youth Exchange & Opportunities</h1>
        <p className={styles.subtitle}>Explore seminars, fellowships, and international exchanges</p>
      </div>

      <div className={styles.toolbar}>
        {SCOPES.map(s => (
          <button key={s} className={`${styles.filterBtn} ${scope === s ? styles.filterBtnActive : ''}`}
            onClick={() => setScope(s)}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.emptyState}><p>Loading opportunities...</p></div>
      ) : opportunities.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No opportunities found</h3>
          <p>Check back later for new programs.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {opportunities.map((opp, i) => (
            <div key={opp.id} className={styles.card} style={{ animationDelay: `${i * 0.08}s` }}
                 onClick={() => openDetail(opp)}>
              <div className={styles.cardImage}>
                {opp.type === 'seminar' ? '🗣️' : opp.type === 'summit' ? '⛰️' : opp.type === 'fellowship' ? '🎓' : '🌍'}
              </div>
              <div className={styles.cardContent}>
                <div className={styles.metaRow}>
                  <span className={styles.scopeTag}>{opp.scope}</span>
                  <span className={styles.typeTag}>{opp.type}</span>
                </div>
                <h3 className={styles.title}>{opp.title}</h3>
                <div className={styles.organizer}>🏢 {opp.organizer}</div>
                <p className={styles.desc}>{opp.description}</p>
                
                <div className={styles.footer}>
                  <span className={styles.deadline}>⏳ Deadline: {new Date(opp.deadline).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
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
              <button className={styles.closeBtn} onClick={() => setShowDetail(null)}>✕</button>
              <div className={styles.metaRow} style={{ justifyContent: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                <span className={styles.scopeTag}>{showDetail.scope}</span>
                <span className={styles.typeTag}>{showDetail.type}</span>
              </div>
              <h2>{showDetail.title}</h2>
              <div className={styles.organizer} style={{ fontSize: '1rem', color: '#64748B' }}>🏢 Organizer: {showDetail.organizer}</div>
              {showDetail.location && <div className={styles.organizer} style={{ fontSize: '1rem', color: '#64748B' }}>📍 Location: {showDetail.location}</div>}
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailBlock}>
                <h4>About the Program</h4>
                <p>{showDetail.description}</p>
              </div>

              <div style={{ display: 'flex', gap: '20px', marginTop: '24px', padding: '16px', background: '#F8FAFC', borderRadius: '8px', color: '#334155' }}>
                <div><strong>Application Deadline:</strong><br/>{new Date(showDetail.deadline).toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>

              {showDetail.application_url && (
                <a href={showDetail.application_url} target="_blank" rel="noopener noreferrer" className={styles.applyBtn}>
                  Go to Application Form 🌍
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
