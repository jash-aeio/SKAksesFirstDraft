'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard/stats').then(setStats).catch(console.error);
  }, []);

  const cards = [
    { href: '/admin/users', icon: '👥', label: 'User Management', desc: 'Review and manage youth profiles', color: '#7C3AED' },
    { href: '/admin/forum', icon: '💬', label: 'Forum Review', desc: 'Moderate community discussions', color: '#F472B6' },
    { href: '/admin/news', icon: '📰', label: 'News & Events', desc: 'Create and manage announcements', color: '#3B82F6' },
    { href: '/admin/services', icon: '🛠️', label: 'Services', desc: 'Manage service availability', color: '#10B981' },
    { href: '/admin/skillup', icon: '🚀', label: 'SKill Up', desc: 'Create events and manage points', color: '#F59E0B' },
    { href: '/admin/rewards', icon: '🎁', label: 'Rewards', desc: 'Manage rewards catalog', color: '#EF4444' },
    { href: '/admin/safespace', icon: '🛡️', label: 'SafeSpace', desc: 'Confidential case management', color: '#4338CA' },
  ];

  return (
    <div className={styles.admin}>
      <div className={styles.header}>
        <div>
          <p className={styles.greeting}>Admin Dashboard</p>
          <h1>Welcome, {user?.full_name?.split(' ')[0]} ⚙️</h1>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {[
          { icon: '👥', label: 'Total Youth', value: stats?.totalUsers || 0 },
          { icon: '💬', label: 'Forum Threads', value: stats?.totalThreads || 0 },
          { icon: '📅', label: 'Total Events', value: stats?.totalEvents || 0 },
          { icon: '⏳', label: 'Pending Logs', value: stats?.pendingLogs || 0 },
        ].map((s, i) => (
          <div key={i} className={`glass-card ${styles.statCard}`}>
            <span className={styles.statIcon}>{s.icon}</span>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className={styles.sectionTitle}>Quick Actions</h2>
      <div className={styles.actionGrid}>
        {cards.map((card, i) => (
          <Link key={i} href={card.href} className={`glass-card ${styles.actionCard}`} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className={styles.actionIcon} style={{ background: `${card.color}15`, color: card.color }}>{card.icon}</div>
            <h3>{card.label}</h3>
            <p>{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
