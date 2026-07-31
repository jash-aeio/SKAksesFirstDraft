'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import styles from './thread.module.css';

export default function ThreadPage({ params }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [thread, setThread] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => { loadThread(); }, [id]);

  async function loadThread() {
    try {
      const data = await api.get(`/forum/${id}`);
      setThread(data);
    } catch (err) { console.error(err); }
  }

  async function submitReply(e) {
    e.preventDefault();
    if (!replyContent.trim()) return;
    try {
      await api.post(`/forum/${id}/replies`, { content: replyContent });
      setReplyContent('');
      loadThread();
    } catch (err) { alert(err.message); }
  }

  async function toggleLike() {
    try {
      await api.post(`/forum/${id}/like`);
      loadThread();
    } catch (err) { console.error(err); }
  }

  if (!thread) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.threadPage}>
      <button className={`btn btn-ghost ${styles.backBtn}`} onClick={() => router.push('/forum')}>
        ← Back to Forum
      </button>

      {/* Thread */}
      <div className={`glass-card ${styles.threadCard}`}>
        <div className={styles.threadHeader}>
          <div className={styles.threadAvatar} style={{background: `hsl(${(thread.user_id * 47) % 360}, 60%, 65%)`}}>
            {thread.full_name?.charAt(0)}
          </div>
          <div>
            <h1 className={styles.threadTitle}>{thread.title}</h1>
            <div className={styles.threadMeta}>
              <span className={styles.threadAuthor}>{thread.full_name} {thread.is_verified ? '✅' : ''}</span>
              <span>·</span>
              <span>@{thread.username}</span>
              <span>·</span>
              <span>{new Date(thread.created_at).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
          <span className={`badge badge-primary`}>{thread.category}</span>
        </div>
        <div className={styles.threadBody}>{thread.content}</div>
        <div className={styles.threadActions}>
          <button className={styles.actionBtn} onClick={toggleLike}>❤️ {thread.likes}</button>
          <span className={styles.actionBtn}>💬 {thread.replies?.length || 0}</span>
          <span className={styles.actionBtn}>👁️ {thread.views}</span>
        </div>
      </div>

      {/* Reply Form */}
      <div className={`glass-card ${styles.replyForm}`}>
        <form onSubmit={submitReply} className={styles.replyInner}>
          <div className={styles.replyAvatar}>{user?.full_name?.charAt(0)}</div>
          <textarea className="input-field" placeholder="Write a reply..." value={replyContent} onChange={e => setReplyContent(e.target.value)} required />
          <button type="submit" className="btn btn-primary btn-sm">Reply</button>
        </form>
      </div>

      {/* Replies */}
      <div className={styles.replies}>
        <h3 className={styles.repliesTitle}>Replies ({thread.replies?.length || 0})</h3>
        {thread.replies?.map((reply, i) => (
          <div key={reply.id} className={`glass-card ${styles.replyCard}`} style={{ animationDelay: `${i * 0.05}s` }}>
            <div className={styles.replyHeader}>
              <div className={styles.replyAvatar} style={{background: `hsl(${(reply.user_id * 47) % 360}, 60%, 65%)`}}>
                {reply.full_name?.charAt(0)}
              </div>
              <div>
                <span className={styles.replyAuthor}>{reply.full_name}</span>
                <span className={styles.replyTime}>{new Date(reply.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
              </div>
            </div>
            <p className={styles.replyContent}>{reply.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
