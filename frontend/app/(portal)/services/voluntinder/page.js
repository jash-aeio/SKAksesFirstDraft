'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import styles from './voluntinder.module.css';

export default function VolunTinderPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeState, setSwipeState] = useState(''); // 'left' or 'right'

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get('/volunteer/opportunities');
        // Filter out ones already swiped (in a real app, backend would filter based on swipe history)
        // For demo, we just show them all
        setOpportunities(data.opportunities || []);
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    load();
  }, []);

  const handleSwipe = async (action) => {
    if (currentIndex >= opportunities.length) return;
    const currentOpp = opportunities[currentIndex];
    
    setSwipeState(action === 'skip' ? 'left' : 'right');
    
    try {
      await api.post('/volunteer/swipe', { opportunity_id: currentOpp.id, action });
    } catch (err) { console.error('Failed to register swipe'); }
    
    setTimeout(() => {
      setSwipeState('');
      setCurrentIndex(prev => prev + 1);
    }, 500); // Wait for animation
  };

  const currentOpp = opportunities[currentIndex];

  return (
    <div className={styles.voluntinder}>
      <div className={styles.header}>
        <h1>❤️ VolunTinder</h1>
        <p className={styles.subtitle}>Swipe right to commit to community service. Swipe left to pass.</p>
      </div>

      <div className={styles.cardContainer}>
        {loading ? (
          <p style={{ color: '#64748B' }}>Loading opportunities...</p>
        ) : currentIndex >= opportunities.length ? (
          <div className={styles.emptyState}>
            <h3>You're all caught up! 🎉</h3>
            <p>Check back later for new volunteer opportunities in your community.</p>
          </div>
        ) : (
          <div 
            className={`${styles.tinderCard} ${swipeState === 'left' ? styles.swipingLeft : swipeState === 'right' ? styles.swipingRight : ''}`}
          >
            <div className={styles.cardImage}>
              {currentOpp.category === 'environment' ? '🌳' : currentOpp.category === 'education' ? '📚' : '🤝'}
            </div>
            
            <div className={styles.cardBody}>
              <span className={styles.cardCat}>{currentOpp.category}</span>
              <h2 className={styles.cardTitle}>{currentOpp.title}</h2>
              <div className={styles.cardLoc}>📍 {currentOpp.location}</div>
              
              <p className={styles.cardDesc}>{currentOpp.description}</p>
              
              <div className={styles.cardMeta}>
                <span>📅 {new Date(currentOpp.event_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className={styles.cardPoints}>🌱 +{currentOpp.points_reward} pts</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {currentIndex < opportunities.length && !loading && (
        <div className={styles.controls}>
          <button className={`${styles.controlBtn} ${styles.skipBtn}`} onClick={() => handleSwipe('skip')} aria-label="Skip">
            ✕
          </button>
          <button className={`${styles.controlBtn} ${styles.commitBtn}`} onClick={() => handleSwipe('commit')} aria-label="Commit">
            ❤️
          </button>
        </div>
      )}
    </div>
  );
}
