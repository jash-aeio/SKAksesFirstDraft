'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import styles from '../admin.module.css';

export default function AdminForumPage() {
  const [threads, setThreads] = useState([]);

  useEffect(() => { loadThreads(); }, []);

  async function loadThreads() {
    try {
      const data = await api.get('/forum?status=all&limit=50');
      setThreads(data.threads || []);
    } catch (err) { console.error(err); }
  }

  async function updateStatus(id, status) {
    try { await api.put(`/forum/${id}/status`, { status }); loadThreads(); } catch (err) { alert(err.message); }
  }

  async function deleteThread(id) {
    if (!confirm('Delete this thread?')) return;
    try { await api.delete(`/forum/${id}`); loadThreads(); } catch (err) { alert(err.message); }
  }

  return (
    <div className={styles.admin}>
      <div className={styles.header}>
        <h1>💬 Forum Review</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Moderate and manage community discussions</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {threads.map(thread => (
          <div key={thread.id} className="glass-card" style={{ padding: '18px 22px', display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: `hsl(${(thread.user_id * 47) % 360}, 60%, 65%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
              {thread.full_name?.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>{thread.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>by @{thread.username} · {thread.reply_count || 0} replies · ❤️ {thread.likes} · {thread.category}</div>
            </div>
            <span className={`badge ${thread.status === 'active' ? 'badge-success' : thread.status === 'flagged' ? 'badge-error' : thread.status === 'resolved' ? 'badge-info' : 'badge-warning'}`}>
              {thread.status}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {thread.status !== 'resolved' && <button className="btn btn-sm btn-secondary" onClick={() => updateStatus(thread.id, 'resolved')}>Resolve</button>}
              {thread.status !== 'flagged' && <button className="btn btn-sm btn-ghost" style={{ color: 'var(--warning)' }} onClick={() => updateStatus(thread.id, 'flagged')}>Flag</button>}
              <button className="btn btn-sm btn-ghost" style={{ color: 'var(--error)' }} onClick={() => deleteThread(thread.id)}>Delete</button>
            </div>
          </div>
        ))}
        {threads.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No threads found.</p>}
      </div>
    </div>
  );
}
