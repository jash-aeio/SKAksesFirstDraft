'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import styles from '../admin.module.css';

export default function AdminTransparencyPage() {
  const [docs, setDocs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'financial', description: '' });

  useEffect(() => { loadDocs(); }, []);
  async function loadDocs() { try { setDocs(await api.get('/transparency')); } catch (err) { console.error(err); } }

  async function createDoc(e) {
    e.preventDefault();
    try { await api.post('/transparency', form); setShowForm(false); setForm({ title: '', type: 'financial', description: '' }); loadDocs(); } catch (err) { alert(err.message); }
  }

  async function deleteDoc(id) {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/transparency/${id}`); loadDocs(); } catch (err) { alert(err.message); }
  }

  return (
    <div className={styles.admin}>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>📋 Transparency Management</h1><p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Upload and manage transparency documents</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? '✕ Cancel' : '+ Add Document'}</button>
      </div>

      {showForm && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
          <form onSubmit={createDoc} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input className="input-field" placeholder="Document title" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} required />
            <select className="input-field" value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}>
              <option value="financial">Financial Report</option><option value="resolution">Resolution</option><option value="minutes">Meeting Minutes</option><option value="other">Other</option>
            </select>
            <textarea className="input-field" placeholder="Description" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} />
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Publish Document</button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {docs.map(doc => (
          <div key={doc.id} className="glass-card" style={{ padding: '18px 22px', display: 'flex', gap: '14px', alignItems: 'center' }}>
            <span style={{ fontSize: '1.5rem' }}>{doc.type === 'financial' ? '💰' : doc.type === 'resolution' ? '📜' : doc.type === 'minutes' ? '📝' : '📄'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>{doc.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.type} · Published {new Date(doc.published_at).toLocaleDateString('en-PH')}</div>
            </div>
            <button className="btn btn-sm btn-ghost" style={{ color: 'var(--error)' }} onClick={() => deleteDoc(doc.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
