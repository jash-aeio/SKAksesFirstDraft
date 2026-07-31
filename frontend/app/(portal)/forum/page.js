'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import styles from './forum.module.css';

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ForumPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [category, setCategory] = useState('all');
  const [showNew, setShowNew] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', content: '', category: 'general' });
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'general', 'sports', 'education', 'community', 'announcement'];

  useEffect(() => { loadThreads(); }, [category]);

  async function loadThreads() {
    try {
      setLoading(true);
      const data = await api.get(`/forum?category=${category}&status=all`);
      setThreads(data.threads || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function createThread(e) {
    e.preventDefault();
    try {
      await api.post('/forum', newThread);
      setShowNew(false);
      setNewThread({ title: '', content: '', category: 'general' });
      loadThreads();
    } catch (err) { alert(err.message); }
  }

  async function handleLike(id) {
    try {
      const res = await api.post(`/forum/${id}/like`);
      setThreads(prev => prev.map(t => {
        if (t.id === id) {
          return { ...t, likes: res.liked ? t.likes + 1 : Math.max(0, t.likes - 1), hasLiked: res.liked };
        }
        return t;
      }));
    } catch (err) { console.error(err); }
  }

  return (
    <div className={styles.forumContainer}>
      <div className={styles.feedColumn}>
        <div className={styles.header}>
          <h1>💬 Community Feed</h1>
          <p className={styles.subtitle}>Connect and share with the Katipunan youth</p>
        </div>

        {!showNew ? (
          <div className={styles.createPostCard} onClick={() => setShowNew(true)}>
            <div className={styles.userAvatar} style={{background: `hsl(${(user?.id * 47) % 360 || 200}, 60%, 65%)`}}>
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className={styles.createInputFake}>
              What's on your mind, {user?.full_name?.split(' ')[0] || 'youth'}?
            </div>
          </div>
        ) : (
          <div className={`glass-card ${styles.newThreadCard}`}>
            <form onSubmit={createThread} className={styles.newForm}>
              <input className="input-field" placeholder="Title your post..." value={newThread.title} onChange={e => setNewThread(p => ({...p, title: e.target.value}))} required autoFocus />
              <textarea className="input-field" placeholder="Share your thoughts..." value={newThread.content} onChange={e => setNewThread(p => ({...p, content: e.target.value}))} required />
              <div className={styles.newFormActions}>
                <select className="input-field" style={{width: 'auto', marginRight: 'auto'}} value={newThread.category} onChange={e => setNewThread(p => ({...p, category: e.target.value}))}>
                  {categories.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowNew(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Post</button>
              </div>
            </form>
          </div>
        )}

        <div className={styles.threadList}>
          {loading && <div className={styles.loading}>Loading feed...</div>}
          {!loading && threads.length === 0 && <div className={styles.empty}>No posts found here yet. Be the first!</div>}
          
          {threads.map((thread, i) => (
            <div key={thread.id} className={styles.threadCard} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={styles.threadHeader}>
                <div className={styles.userAvatar} style={{background: `hsl(${(thread.user_id * 47) % 360}, 60%, 65%)`}}>
                  {thread.full_name?.charAt(0) || 'U'}
                </div>
                <div className={styles.threadMeta}>
                  <div className={styles.threadAuthor}>
                    {thread.full_name || thread.username}
                    {thread.is_verified ? <span className={styles.verifiedIcon} title="Verified User">✓</span> : null}
                  </div>
                  <div className={styles.threadTimeCategory}>
                    <span>{timeAgo(thread.created_at)}</span>
                    <span className={styles.dot}></span>
                    <span className={styles.threadCategory}>{thread.category}</span>
                  </div>
                </div>
              </div>

              <Link href={`/forum/${thread.id}`} className={styles.threadBody}>
                <h3 className={styles.threadTitle}>{thread.title}</h3>
                <p className={styles.threadContent}>{thread.content}</p>
              </Link>

              <div className={styles.threadFooter}>
                <button 
                  className={`${styles.actionBtn} ${thread.hasLiked ? styles.liked : ''}`} 
                  onClick={() => handleLike(thread.id)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                  </svg>
                  {thread.likes || 'Like'}
                </button>
                <Link href={`/forum/${thread.id}`} className={styles.actionBtn}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  {thread.reply_count || 'Comment'}
                </Link>
                <button className={styles.actionBtn} onClick={() => navigator.clipboard.writeText(`${window.location.origin}/forum/${thread.id}`)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.sidebarColumn}>
        <div className={`glass-card ${styles.categoriesCard}`}>
          <h3>Categories</h3>
          <div className={styles.catList}>
            {categories.map(c => (
              <button 
                key={c} 
                className={`${styles.catBtn} ${category === c ? styles.catActive : ''}`} 
                onClick={() => setCategory(c)}
              >
                {c === 'all' ? '🏠 All Posts' : 
                 c === 'general' ? '💬 General' :
                 c === 'sports' ? '🏀 Sports' :
                 c === 'education' ? '📚 Education' :
                 c === 'community' ? '🌿 Community' :
                 '📢 Announcements'}
              </button>
            ))}
          </div>
        </div>
        
        <div className={`glass-card ${styles.categoriesCard}`} style={{marginTop: '16px'}}>
          <h3>Trending</h3>
          <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Trending topics will appear here based on community engagement.</p>
        </div>
      </div>
    </div>
  );
}

