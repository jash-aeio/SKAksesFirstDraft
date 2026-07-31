'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import styles from './news.module.css';

export default function NewsPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get(`/news?type=${filter}`);
        setItems(data.items || []);
      } catch (err) { console.error(err); }
    }
    load();
  }, [filter]);

  return (
    <div className={styles.news}>
      <div className={styles.header}>
        <h1>📰 News & Events Board</h1>
        <p className={styles.subtitle}>Stay updated with the latest from SK Katipunan</p>
      </div>

      <div className={styles.filters}>
        {['all','news','event','announcement'].map(f => (
          <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? '📋 All' : f === 'event' ? '📅 Events' : f === 'announcement' ? '📢 Announcements' : '📰 News'}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {items.map((item, i) => (
          <div key={item.id} className={`glass-card ${styles.card}`} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className={styles.cardTop}>
              <span className={`badge ${item.type === 'event' ? 'badge-primary' : item.type === 'announcement' ? 'badge-warning' : 'badge-info'}`}>
                {item.type === 'event' ? '📅' : item.type === 'announcement' ? '📢' : '📰'} {item.type}
              </span>
              <span className={styles.date}>{new Date(item.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.cardDesc}>{item.description}</p>
            {item.event_date && (
              <div className={styles.eventInfo}>
                <span>📅 {new Date(item.event_date).toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                {item.event_location && <span>📍 {item.event_location}</span>}
              </div>
            )}
            <div className={styles.cardFooter}>
              <span className={styles.author}>By {item.author_name}</span>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className={styles.empty}>No items to show.</p>}
      </div>
    </div>
  );
}
