'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import styles from '../admin.module.css';

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', points_cost: 0, quantity_available: 0 });
  const [tab, setTab] = useState('catalog');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setRewards(await api.get('/rewards'));
      setRedemptions(await api.get('/rewards/redemptions/all'));
    } catch (err) { console.error(err); }
  }

  async function createReward(e) {
    e.preventDefault();
    try {
      await api.post('/rewards', { ...form, points_cost: Number(form.points_cost), quantity_available: Number(form.quantity_available) });
      setShowForm(false);
      setForm({ name: '', description: '', points_cost: 0, quantity_available: 0 });
      loadData();
    } catch (err) { alert(err.message); }
  }

  return (
    <div className={styles.admin}>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>🎁 Rewards Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage reward catalog and view redemption history</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? '✕ Cancel' : '+ Add Reward'}</button>
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--bg-card)', padding: '4px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', maxWidth: '320px' }}>
        <button className={`btn btn-sm ${tab === 'catalog' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }} onClick={() => setTab('catalog')}>Catalog</button>
        <button className={`btn btn-sm ${tab === 'redemptions' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }} onClick={() => setTab('redemptions')}>Redemptions</button>
      </div>

      {showForm && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
          <form onSubmit={createReward} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input className="input-field" placeholder="Reward name" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required />
            <textarea className="input-field" placeholder="Description" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input type="number" className="input-field" placeholder="Points cost" value={form.points_cost} onChange={e => setForm(p => ({...p, points_cost: e.target.value}))} min="1" required />
              <input type="number" className="input-field" placeholder="Quantity available" value={form.quantity_available} onChange={e => setForm(p => ({...p, quantity_available: e.target.value}))} min="0" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Add Reward</button>
          </form>
        </div>
      )}

      {tab === 'catalog' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {rewards.map(rwd => (
            <div key={rwd.id} className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎁</div>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '6px' }}>{rwd.name}</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{rwd.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{rwd.points_cost} pts</span>
                <span style={{ color: 'var(--text-muted)' }}>{rwd.quantity_available} left</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'redemptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {redemptions.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>No redemptions yet.</p>}
          {redemptions.map(r => (
            <div key={r.id} className="glass-card" style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.full_name} (@{r.username})</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Redeemed: {r.reward_name} · {r.points_spent} pts</div>
              </div>
              <span className={`badge ${r.status === 'claimed' ? 'badge-success' : 'badge-warning'}`}>{r.status}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(r.redeemed_at).toLocaleDateString('en-PH')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
