'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import styles from '../admin.module.css';

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', type: 'other', icon: '📋' });
  const [selectedService, setSelectedService] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => { loadServices(); }, []);

  async function loadServices() {
    try { setServices(await api.get('/services')); } catch (err) { console.error(err); }
  }

  async function createService(e) {
    e.preventDefault();
    try { await api.post('/services', form); setShowForm(false); setForm({ name: '', description: '', type: 'other', icon: '📋' }); loadServices(); } catch (err) { alert(err.message); }
  }

  async function toggleMaintenance(service) {
    try {
      await api.put(`/services/${service.id}`, { maintenance_mode: service.maintenance_mode ? 0 : 1 });
      loadServices();
    } catch (err) { alert(err.message); }
  }

  async function viewLogs(service) {
    setSelectedService(service);
    try { setLogs(await api.get(`/services/${service.id}/logs`)); } catch (err) { console.error(err); }
  }

  async function updateLogStatus(logId, status) {
    try { await api.put(`/services/logs/${logId}/status`, { status }); viewLogs(selectedService); } catch (err) { alert(err.message); }
  }

  const [activeTab, setActiveTab] = useState('all');
  const categories = ['all', 'printing', 'gym', 'other'];

  const filteredServices = activeTab === 'all' ? services : services.filter(s => s.type === activeTab);

  return (
    <div className={styles.admin}>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>🛠️ Services Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage services, maintenance mode, and service logs</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? '✕ Cancel' : '+ Add Service'}</button>
      </div>

      <div className="tabs" style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
        {categories.map(cat => (
          <button 
            key={cat}
            className={`btn btn-sm ${activeTab === cat ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(cat)}
            style={{ textTransform: 'capitalize' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '14px' }}>Add New Service</h3>
          <form onSubmit={createService} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px' }}>
              <input className="input-field" placeholder="Service name" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required />
              <input className="input-field" placeholder="Icon emoji" value={form.icon} onChange={e => setForm(p => ({...p, icon: e.target.value}))} style={{ width: '80px' }} />
            </div>
            <textarea className="input-field" placeholder="Description" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} />
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Create Service</button>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {filteredServices.map(service => (
          <div key={service.id} className="glass-card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{service.icon}</div>
            <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>{service.name}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>{service.description?.substring(0, 80)}</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className={`btn btn-sm ${service.maintenance_mode ? 'btn-primary' : 'btn-secondary'}`} onClick={() => toggleMaintenance(service)}>
                {service.maintenance_mode ? '🟢 Enable' : '🔧 Maintenance'}
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => viewLogs(service)}>📊 Logs</button>
            </div>
            {service.maintenance_mode && <div className="badge badge-warning" style={{ marginTop: '10px' }}>⚠️ Under Maintenance</div>}
          </div>
        ))}
      </div>

      {/* Logs Modal */}
      {selectedService && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px' }} onClick={() => setSelectedService(null)}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', padding: '28px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.1rem' }}>{selectedService.icon} {selectedService.name} — Logs</h2>
              <button style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSelectedService(null)}>✕</button>
            </div>
            {logs.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>No logs yet.</p>}
            {logs.map(log => (
              <div key={log.id} style={{ padding: '14px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.full_name} (@{log.username})</span>
                  <span className={`badge ${log.status === 'completed' ? 'badge-success' : log.status === 'approved' ? 'badge-info' : log.status === 'rejected' ? 'badge-error' : 'badge-warning'}`}>{log.status}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{log.details}</p>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                  {log.status === 'pending' && <>
                    <button className="btn btn-sm btn-primary" onClick={() => updateLogStatus(log.id, 'approved')}>Approve</button>
                    <button className="btn btn-sm btn-ghost" style={{ color: 'var(--error)' }} onClick={() => updateLogStatus(log.id, 'rejected')}>Reject</button>
                  </>}
                  {log.status === 'approved' && <button className="btn btn-sm btn-primary" onClick={() => updateLogStatus(log.id, 'completed')}>Complete</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
