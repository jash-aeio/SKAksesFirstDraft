'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import styles from './agriconnect.module.css';

export default function AgriConnectPage() {
  const [content, setContent] = useState([]);
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({ kit_type: 'starter', address: '', notes: '' });

  useEffect(() => {
    async function load() {
      try {
        const [cRes, kRes] = await Promise.all([
          api.get('/agri-connect/content'),
          api.get('/agri-connect/kits')
        ]);
        setContent(cRes || []);
        setKits(kRes || []);
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    load();
  }, []);

  async function handleRequest(e) {
    e.preventDefault();
    try {
      await api.post('/agri-connect/kits/request', formData);
      alert('Seed kit requested successfully! We will review your request.');
      setFormData({ ...formData, address: '', notes: '' });
    } catch (err) {
      alert(err.message || 'Failed to request seed kit.');
    }
  }

  return (
    <div className={styles.agriconnect}>
      <div className={styles.header}>
        <h1>🪴 Agri-Connect</h1>
        <p className={styles.subtitle}>Learn urban farming and request free seed kits for your home garden.</p>
      </div>

      <div className={styles.layout}>
        {/* Left: Articles */}
        <div className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Farming Guides & Updates</h2>
          {loading ? (
            <p style={{ color: '#64748B' }}>Loading content...</p>
          ) : content.length === 0 ? (
            <p style={{ color: '#64748B' }}>No guides available yet.</p>
          ) : (
            <div className={styles.articlesGrid}>
              {content.map((art) => (
                <div key={art.id} className={styles.articleCard}>
                  <span className={styles.articleCat}>{art.category.replace('_', ' ')}</span>
                  <h3 className={styles.articleTitle}>{art.title}</h3>
                  <p className={styles.articleBody}>{art.body}</p>
                  <span className={styles.articleDate}>Published on {new Date(art.created_at).toLocaleDateString('en-PH')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Seed Kits */}
        <div>
          <div className={styles.kitCard}>
            <h3>🌱 Free Seed Kits</h3>
            <p className={styles.kitDesc}>
              Start your own urban garden! Request a free starter kit. One active request per household.
            </p>

            <div className={styles.inventoryList}>
              {kits.map(k => (
                <div key={k.id} className={styles.inventoryItem}>
                  <span className={styles.inventoryType}>{k.kit_type} Kit</span>
                  <span className={`${styles.inventoryQty} ${k.quantity_available === 0 ? styles.out : k.quantity_available < 10 ? styles.low : ''}`}>
                    {k.quantity_available} left
                  </span>
                </div>
              ))}
            </div>

            <form className={styles.requestForm} onSubmit={handleRequest}>
              <div className={styles.formGroup}>
                <label>Select Kit Type</label>
                <select className={styles.select} value={formData.kit_type} onChange={e => setFormData({...formData, kit_type: e.target.value})} required>
                  {kits.filter(k => k.quantity_available > 0).map(k => (
                    <option key={k.id} value={k.kit_type}>{k.kit_type.charAt(0).toUpperCase() + k.kit_type.slice(1)} Kit</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Delivery Address in Barangay</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="Street name, House #, etc."
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  required 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Additional Notes (Optional)</label>
                <textarea 
                  className={styles.textarea} 
                  placeholder="Any specific delivery instructions..."
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <button type="submit" className={styles.submitBtn}>Submit Request</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
