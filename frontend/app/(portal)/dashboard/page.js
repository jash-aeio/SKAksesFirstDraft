'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [threads, setThreads] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [newsData, eventsData, forumData, statsData] = await Promise.all([
          api.get('/news?limit=3'),
          api.get('/skillup?status=upcoming&limit=3'),
          api.get('/forum?limit=4'),
          api.get('/dashboard/stats'),
        ]);
        setNews(newsData.items || []);
        setEvents(eventsData.events || []);
        setThreads(forumData.threads || []);
        setStats(statsData);
      } catch (err) { console.error(err); }
    }
    loadData();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <p className={styles.greeting}>{greeting()},</p>
          <h1 className={styles.welcome}>{user?.full_name?.split(' ')[0] || 'Kabataan'}! 👋</h1>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.pointsCard}>
            <span className={styles.pointsIcon}>🏆</span>
            <div>
              <span className={styles.pointsNum}>{user?.total_points || 0}</span>
              <span className={styles.pointsLabel}>Points</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className={styles.heroBanner}>
        <div className={styles.bannerContent}>
          <h2>Welcome to <span className={styles.bannerHighlight}>Katips</span></h2>
          <p>Your Katipunan Central Hub. Access community forums, join events, earn rewards, and stay connected.</p>
          <Link href="/skillup" className="btn btn-primary">Explore SKill Up →</Link>
        </div>
        <div className={styles.bannerArt}>
          <div className={styles.bannerEmoji}>🏛️</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={styles.statsGrid}>
        {[
          { icon: '👥', label: 'Community Members', value: stats?.totalUsers || 0, color: '#7C3AED' },
          { icon: '💬', label: 'Forum Threads', value: stats?.totalThreads || 0, color: '#F472B6' },
          { icon: '🚀', label: 'Upcoming Events', value: stats?.upcomingEvents || 0, color: '#10B981' },
          { icon: '🛠️', label: 'Services Available', value: stats?.totalServices || 0, color: '#F59E0B' },
        ].map((s, i) => (
          <div key={i} className={`glass-card ${styles.statCard}`}>
            <div className={styles.statIcon} style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Recent News */}
        <div className={`glass-card ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <h3>📰 Latest News & Events</h3>
            <Link href="/news" className={styles.seeAll}>See All →</Link>
          </div>
          <div className={styles.newsList}>
            {news.length === 0 && <p className={styles.empty}>No news yet.</p>}
            {news.map(item => (
              <div key={item.id} className={styles.newsItem}>
                <div className={`badge ${item.type === 'event' ? 'badge-primary' : item.type === 'announcement' ? 'badge-warning' : 'badge-info'}`}>
                  {item.type}
                </div>
                <h4 className={styles.newsTitle}>{item.title}</h4>
                <p className={styles.newsDesc}>{item.description?.substring(0, 100)}...</p>
                <span className={styles.newsDate}>{new Date(item.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming SKill Up Events */}
        <div className={`glass-card ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <h3>🚀 Upcoming Events</h3>
            <Link href="/skillup" className={styles.seeAll}>See All →</Link>
          </div>
          <div className={styles.eventsList}>
            {events.length === 0 && <p className={styles.empty}>No upcoming events.</p>}
            {events.map(evt => (
              <div key={evt.id} className={styles.eventCard}>
                <div className={styles.eventDate}>
                  <span className={styles.eventMonth}>{new Date(evt.event_date).toLocaleDateString('en-PH', { month: 'short' })}</span>
                  <span className={styles.eventDay}>{new Date(evt.event_date).getDate()}</span>
                </div>
                <div className={styles.eventInfo}>
                  <h4>{evt.title}</h4>
                  <p>📍 {evt.location || 'TBA'}</p>
                  <div className={styles.eventMeta}>
                    <span className="badge badge-success">+{evt.points_reward} pts</span>
                    <span className={styles.eventSlots}>{evt.current_participants}/{evt.max_participants || '∞'} joined</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Forum Activity */}
        <div className={`glass-card ${styles.section} ${styles.forumSection}`}>
          <div className={styles.sectionHeader}>
            <h3>💬 Community Forum</h3>
            <Link href="/forum" className={styles.seeAll}>See All →</Link>
          </div>
          <div className={styles.threadList}>
            {threads.length === 0 && <p className={styles.empty}>No threads yet.</p>}
            {threads.map(thread => (
              <Link key={thread.id} href={`/forum/${thread.id}`} className={styles.threadItem}>
                <div className={styles.threadAvatar}>{thread.full_name?.charAt(0)}</div>
                <div className={styles.threadInfo}>
                  <h4>{thread.title}</h4>
                  <span className={styles.threadMeta}>by {thread.username} · {thread.reply_count || 0} replies</span>
                </div>
                <span className={`badge badge-primary`}>{thread.category}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
