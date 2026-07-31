'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import styles from './ecopoints.module.css';

export default function EcoPointsPage() {
  const router = useRouter();
  const [data, setData] = useState({ totalPoints: 0, transactions: [] });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [transRes, actRes] = await Promise.all([
          api.get('/eco-points/transactions'),
          api.get('/eco-points/activities')
        ]);
        setData(transRes);
        setActivities(actRes || []);
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className={styles.ecopoints}>
      <div className={styles.header}>
        <h1>🌱 Eco-Points Dashboard</h1>
        <p className={styles.subtitle}>Track your eco-friendly activities and redeem rewards.</p>
      </div>

      <div className={styles.dashboardGrid}>
        {/* Total Points */}
        <div className={styles.pointsCard}>
          <div className={styles.pointsLabel}>My Eco-Balance</div>
          <div className={styles.pointsValue}>{data.totalPoints}</div>
          <button className={styles.pointsAction} onClick={() => router.push('/services/skill-up')}>
            Redeem in SKill Up
          </button>
        </div>

        {/* Transaction History */}
        <div className={styles.historyCard}>
          <h3>Recent Activities</h3>
          {loading ? (
            <div className={styles.emptyState}>Loading history...</div>
          ) : data.transactions.length === 0 ? (
            <div className={styles.emptyState}>No eco-activities yet. Start participating!</div>
          ) : (
            <div className={styles.list}>
              {data.transactions.map((t) => (
                <div key={t.id} className={styles.item}>
                  <div className={styles.itemLeft}>
                    <span className={styles.itemName}>{t.activity_name || 'Manual Award'}</span>
                    <span className={styles.itemDate}>
                      {new Date(t.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={styles.itemPoints}>+{t.points}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Available Activities */}
      <div className={styles.activitiesSection}>
        <h2>Ways to Earn Eco-Points</h2>
        <div className={styles.actGrid}>
          {activities.map((act, i) => (
            <div key={act.id} className={styles.actCard} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={styles.actTop}>
                <h3 className={styles.actTitle}>{act.name}</h3>
                <span className={styles.actPoints}>+{act.points_value} pts</span>
              </div>
              <p className={styles.actDesc}>{act.description}</p>
              <div className={styles.actFooter}>Category: {act.category.replace('_', ' ')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
