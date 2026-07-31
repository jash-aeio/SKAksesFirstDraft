'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import styles from './transparency.module.css';

export default function TransparencyPage() {
  const [docs, setDocs] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/transparency').then(setDocs).catch(console.error);
  }, []);

  const filtered = filter === 'all' ? docs : docs.filter(d => d.type === filter);
  const typeIcons = { financial: '💰', resolution: '📜', minutes: '📝', other: '📄' };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>📋 Transparency Board</h1>
        <p className={styles.subtitle}>Full transparency for the youth. View financial reports, resolutions, and meeting minutes.</p>
      </div>

      <div className={styles.filters}>
        {['all','financial','resolution','minutes'].map(f => (
          <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? '📋 All' : `${typeIcons[f]} ${f.charAt(0).toUpperCase() + f.slice(1)}`}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {filtered.map((doc, i) => (
          <div key={doc.id} className={`glass-card ${styles.card}`} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className={styles.cardIcon}>{typeIcons[doc.type] || '📄'}</div>
            <span className={`badge badge-primary`}>{doc.type}</span>
            <h3 className={styles.cardTitle}>{doc.title}</h3>
            <p className={styles.cardDesc}>{doc.description}</p>
            <div className={styles.cardFooter}>
              <span>By {doc.author}</span>
              <span>{new Date(doc.published_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className={styles.empty}>No documents found.</p>}
      </div>
    </div>
  );
}
