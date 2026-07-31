'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import styles from '../admin.module.css';

export default function AdminNewsPage() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'news', event_date: '', event_location: '', hyperlink: '' });

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    try { const data = await api.get('/news?limit=50'); setItems(data.items || []); } catch (err) { console.error(err); }
  }

  async function createItem(e) {
    e.preventDefault();
    try {
      await api.post('/news', form);
      setShowForm(false);
      setForm({ title: '', description: '', type: 'news', event_date: '', event_location: '', hyperlink: '' });
      loadItems();
    } catch (err) { alert(err.message); }
  }

  async function deleteItem(id) {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/news/${id}`); loadItems(); } catch (err) { alert(err.message); }
  }

  return (
    <div className={styles.admin}>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>📰 News & Events Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Create and manage announcements, news, and events</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? '✕ Cancel' : '+ Create New'}</button>
      </div>

      {showForm && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '14px' }}>Create New Post</h3>
          <form onSubmit={createItem} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input className="input-field" placeholder="Title" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} required />
            <textarea className="input-field" placeholder="Description" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <select className="input-field" value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}>
                <option value="news">News</option>
                <option value="event">Event</option>
                <option value="announcement">Announcement</option>
              </select>
              <input type="datetime-local" className="input-field" value={form.event_date} onChange={e => setForm(p => ({...p, event_date: e.target.value}))} placeholder="Event date" />
              <input className="input-field" placeholder="Location" value={form.event_location} onChange={e => setForm(p => ({...p, event_location: e.target.value}))} />
            </div>
            <input className="input-field" placeholder="Hyperlink (optional, e.g. to SKill Up event)" value={form.hyperlink} onChange={e => setForm(p => ({...p, hyperlink: e.target.value}))} />
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Publish</button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map(item => (
          <div key={item.id} className="glass-card" style={{ padding: '18px 22px', display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                <span className={`badge ${item.type === 'event' ? 'badge-primary' : item.type === 'announcement' ? 'badge-warning' : 'badge-info'}`}>{item.type}</span>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{item.description?.substring(0, 100)}...</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {item.event_date && `📅 ${new Date(item.event_date).toLocaleDateString('en-PH')} · `}
                {item.event_location && `📍 ${item.event_location} · `}
                Posted {new Date(item.created_at).toLocaleDateString('en-PH')}
              </div>
            </div>
            <button className="btn btn-sm btn-ghost" style={{ color: 'var(--error)' }} onClick={() => deleteItem(item.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
