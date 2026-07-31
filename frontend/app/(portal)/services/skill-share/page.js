'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import styles from './skillshare.module.css';

const TYPES = ['all', 'notes', 'reviewer', 'presentation', 'ebook', 'link', 'other'];
const ICONS = { notes: '📝', reviewer: '📖', presentation: '📊', ebook: '📚', link: '🔗', other: '📦' };

export default function SkillSharePage() {
  const [resources, setResources] = useState([]);
  const [type, setType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get(`/resources?type=${type}`);
        setResources(data.resources || []);
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    load();
  }, [type]);

  async function handleDownload(resId, link) {
    try {
      await api.post(`/resources/${resId}/download`);
      if (link) window.open(link, '_blank');
      else alert('Resource provider will be notified. Download feature currently requires external links in this demo.');
    } catch (err) { alert(err.message); }
  }

  return (
    <div className={styles.skillshare}>
      <div className={styles.header}>
        <h1>📚 SKill-Share Resource Bank</h1>
        <p className={styles.subtitle}>Peer-to-peer sharing of educational materials and reviewers</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          {TYPES.map(t => (
            <button key={t} className={`${styles.filterBtn} ${type === t ? styles.filterBtnActive : ''}`}
              onClick={() => setType(t)}>
              {t}
            </button>
          ))}
        </div>
        <button className={styles.uploadBtn} onClick={() => alert('Upload feature coming in next sprint.')}>
          ☁️ Share a Resource
        </button>
      </div>

      {loading ? (
        <div className={styles.emptyState}><p>Loading resources...</p></div>
      ) : resources.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No resources found</h3>
          <p>Be the first to share notes or a reviewer!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {resources.map((r, i) => (
            <div key={r.id} className={styles.card} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={styles.cardTop}>
                <div className={styles.typeIcon}>{ICONS[r.type] || '📁'}</div>
                {r.is_verified ? <div className={styles.verifiedBadge}>✓ Verified</div> : null}
              </div>
              <h3 className={styles.title}>{r.title}</h3>
              <div className={styles.provider}>Shared by {r.provider_name}</div>
              <p className={styles.desc}>{r.description}</p>
              
              <div className={styles.footer}>
                <span className={styles.subject}>{r.subject || 'General'}</span>
                <button className={styles.downloadBtn} onClick={() => handleDownload(r.id, r.external_link || r.file_url)}>
                  📥 {r.download_count} Downloads
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
