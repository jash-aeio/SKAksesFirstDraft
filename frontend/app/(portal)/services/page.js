'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import styles from './services.module.css';

const EXPANSION_FEATURES = [
  {
    module: 'Governance & Transparency',
    moduleColor: '#1E3A5F',
    features: [
      { icon: '🏛️', name: 'E-Panukala', desc: 'Draft, propose, and vote on community resolutions to be discussed by the SK Council.', path: '/services/e-panukala', accent: '#1E3A5F' },
      { icon: '💰', name: 'Bantay-Pondo', desc: 'Transparent visual dashboard tracking the SK budget and where youth funds are invested.', path: '/services/bantay-pondo', accent: '#D97706' },
      { icon: '📍', name: 'Bantay-Komunidad', desc: 'Geo-tag and report local hazards for a safer, more responsive barangay.', path: '/services/bantay-komunidad', accent: '#EA580C' },
    ],
  },
  {
    module: 'Economic & Educational Empowerment',
    moduleColor: '#059669',
    features: [
      { icon: '💼', name: 'Katips Gig Board', desc: 'Find local micro-jobs, freelance work, and part-time opportunities in the community.', path: '/services/katips-gig-board', accent: '#059669' },
      { icon: '🎓', name: 'Edu-Hub', desc: 'Discover and match with local and national scholarship opportunities for your studies.', path: '/services/edu-hub', accent: '#2563EB' },
      { icon: '📚', name: 'SKill-Share', desc: 'Peer-to-peer resource bank for sharing textbooks, electronics, and educational materials.', path: '/services/skill-share', accent: '#8B5CF6' },
      { icon: '✈️', name: 'Youth Exchange', desc: 'Explore national and international exchange programs, fellowships, and summits.', path: '/services/youth-exchange', accent: '#DB2777' },
    ],
  },
  {
    module: 'Environment & Volunteerism',
    moduleColor: '#16A34A',
    features: [
      { icon: '🌱', name: 'Eco-Points', desc: 'Track your eco-friendly activities and redeem rewards in the SKill Up catalog.', path: '/services/eco-points', accent: '#16A34A' },
      { icon: '🪴', name: 'Agri-Connect', desc: 'Urban farming guides and free seed kit requests for the community.', path: '/services/agri-connect', accent: '#059669' },
      { icon: '❤️', name: 'VolunTinder', desc: 'Swipe and match with local volunteer opportunities that fit your schedule.', path: '/services/voluntinder', accent: '#E11D48' },
    ],
  },
  {
    module: 'Privacy & Health',
    moduleColor: '#4F46E5',
    features: [
      { icon: '🛡️', name: 'SafeSpace', desc: 'Highly confidential reporting for mental health, VAWC, and bullying. Counselors only.', path: '/services/safespace', accent: '#4F46E5' },
    ],
  },
];

export default function ServicesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [logs, setLogs] = useState([]);
  const [newLog, setNewLog] = useState('');
  const [showLog, setShowLog] = useState(false);

  useEffect(() => {
    api.get('/services').then(setServices).catch(console.error);
  }, []);

  async function openService(service) {
    setSelectedService(service);
    if (service.maintenance_mode) { setShowLog(false); return; }
    try {
      const data = await api.get(`/services/${service.id}/logs`);
      setLogs(data);
      setShowLog(true);
    } catch (err) { console.error(err); }
  }

  async function submitLog(e) {
    e.preventDefault();
    try {
      await api.post(`/services/${selectedService.id}/logs`, { details: newLog });
      setNewLog('');
      const data = await api.get(`/services/${selectedService.id}/logs`);
      setLogs(data);
    } catch (err) { alert(err.message); }
  }

  const [activeTab, setActiveTab] = useState('all');
  const categories = ['all', 'printing', 'gym', 'other'];

  const filteredServices = activeTab === 'all' ? services : services.filter(s => s.type === activeTab);

  return (
    <div className={styles.services}>
      <div className={styles.header}>
        <h1>🛠️ Services Hub</h1>
        <p className={styles.subtitle}>Access various SK services with ease</p>
      </div>

      <div className={styles.tabs} style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
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

      <div className={styles.grid}>
        {filteredServices.map((service, i) => (
          <div key={service.id} className={`glass-card ${styles.serviceCard} ${service.maintenance_mode ? styles.maintenance : ''}`} onClick={() => openService(service)} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className={styles.serviceIcon}>{service.icon}</div>
            <h3 className={styles.serviceName}>{service.name}</h3>
            <p className={styles.serviceDesc}>{service.description}</p>
            <div className={styles.serviceStatus}>
              {service.maintenance_mode ? (
                <span className="badge badge-warning">🔧 Under Maintenance</span>
              ) : service.is_available ? (
                <span className="badge badge-success">✓ Available</span>
              ) : (
                <span className="badge badge-error">Unavailable</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Expansion Features ─── */}
      {EXPANSION_FEATURES.map((module, mi) => (
        <div key={mi}>
          <div className={styles.sectionDivider}>
            <h2>🗄️ {module.module}</h2>
            <p>Civic tech features for youth participation and governance</p>
          </div>
          <div className={styles.grid}>
            {module.features.map((feat, fi) => (
              <div key={fi} className={`glass-card ${styles.featureCard}`}
                style={{ borderLeftColor: feat.accent, animationDelay: `${fi * 0.1}s` }}
                onClick={() => router.push(feat.path)}>
                <div className={styles.featureIcon}>{feat.icon}</div>
                <h3 className={styles.featureName}>{feat.name}</h3>
                <p className={styles.featureDesc}>{feat.desc}</p>
                <span className={styles.featureArrow}>→</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Service Detail Modal */}
      {selectedService && (
        <div className={styles.overlay} onClick={() => { setSelectedService(null); setShowLog(false); }}>
          <div className={`glass-card ${styles.modal}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>{selectedService.icon}</div>
              <div>
                <h2>{selectedService.name}</h2>
                <p>{selectedService.description}</p>
              </div>
              <button className={styles.closeBtn} onClick={() => { setSelectedService(null); setShowLog(false); }}>✕</button>
            </div>

            {selectedService.maintenance_mode ? (
              <div className={styles.maintenanceMsg}>
                <span className={styles.maintenanceIcon}>🔧</span>
                <h3>Under Maintenance</h3>
                <p>{selectedService.maintenance_message}</p>
              </div>
            ) : (
              <>
                <form onSubmit={submitLog} className={styles.logForm}>
                  <h3>New Request</h3>
                  <textarea className="input-field" placeholder="Describe your request or log details..." value={newLog} onChange={e => setNewLog(e.target.value)} required />
                  <button type="submit" className="btn btn-primary">Submit Request</button>
                </form>

                <div className={styles.logList}>
                  <h3>Your Logs ({logs.length})</h3>
                  {logs.length === 0 && <p className={styles.empty}>No logs yet.</p>}
                  {logs.map(log => (
                    <div key={log.id} className={styles.logItem}>
                      <div className={styles.logTop}>
                        <span className={`badge ${log.status === 'completed' ? 'badge-success' : log.status === 'approved' ? 'badge-info' : log.status === 'rejected' ? 'badge-error' : 'badge-warning'}`}>
                          {log.status}
                        </span>
                        <span className={styles.logDate}>{new Date(log.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                      </div>
                      <p className={styles.logDetails}>{log.details}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
