'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import styles from './panukala.module.css';

const CATEGORIES = ['all', 'infrastructure', 'education', 'health', 'sports', 'environment', 'livelihood', 'general'];
const UPVOTE_THRESHOLD = 100;

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

function getStatusClass(status) {
  const map = {
    published: styles.statusPublished,
    mandatory_agenda: styles.statusMandatory,
    approved: styles.statusApproved,
    rejected: styles.statusRejected,
    under_review: styles.statusReview,
  };
  return map[status] || styles.statusPublished;
}

export default function EPanukalaPage() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [votes, setVotes] = useState({});
  const [showCompose, setShowCompose] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState({ title: '', summary: '', body: '', category: 'general' });
  const [loading, setLoading] = useState(true);

  const fetchProposals = useCallback(async () => {
    try {
      const sortParam = sort === 'newest' ? 'newest' : sort === 'top' ? 'top' : 'oldest';
      const data = await api.get(`/proposals?category=${category}&sort=${sortParam}`);
      setProposals(data.proposals || []);
      setTotal(data.total || 0);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [category, sort]);

  useEffect(() => { fetchProposals(); }, [fetchProposals]);

  // Check user's votes on load
  useEffect(() => {
    if (!user || proposals.length === 0) return;
    const checkVotes = async () => {
      const voteMap = {};
      for (const p of proposals) {
        try {
          const data = await api.get(`/proposals/${p.id}/my-vote`);
          voteMap[p.id] = data.voted;
        } catch (_) { voteMap[p.id] = false; }
      }
      setVotes(voteMap);
    };
    checkVotes();
  }, [user, proposals.length]);

  async function handleVote(e, proposalId) {
    e.stopPropagation();
    try {
      const data = await api.post(`/proposals/${proposalId}/vote`);
      setVotes(prev => ({ ...prev, [proposalId]: data.voted }));
      setProposals(prev => prev.map(p =>
        p.id === proposalId ? { ...p, upvote_count: data.upvote_count } : p
      ));
      if (showDetail && showDetail.id === proposalId) {
        setShowDetail(prev => ({ ...prev, upvote_count: data.upvote_count }));
      }
    } catch (err) { alert(err.message); }
  }

  async function handleSubmit(publish) {
    try {
      if (!form.title || !form.summary || !form.body) {
        return alert('Please fill in all fields.');
      }
      await api.post('/proposals', { ...form, publish });
      setShowCompose(false);
      setForm({ title: '', summary: '', body: '', category: 'general' });
      fetchProposals();
    } catch (err) { alert(err.message); }
  }

  async function openDetail(proposal) {
    try {
      const full = await api.get(`/proposals/${proposal.id}`);
      setShowDetail(full);
    } catch (err) { setShowDetail(proposal); }
  }

  const progress = (count) => Math.min((count / UPVOTE_THRESHOLD) * 100, 100);

  return (
    <div className={styles.panukala}>
      <div className={styles.header}>
        <h1><span>🏛️</span> E-Panukala</h1>
        <p className={styles.subtitle}>Empowering the youth to draft, propose, and vote on community resolutions</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          {CATEGORIES.map(cat => (
            <button key={cat} className={`${styles.filterBtn} ${category === cat ? styles.filterBtnActive : ''}`}
              onClick={() => setCategory(cat)}>{cat}</button>
          ))}
        </div>
        <select className={styles.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="top">Top Voted</option>
          <option value="oldest">Oldest</option>
        </select>
        <button className={styles.composeBtn} onClick={() => setShowCompose(true)}>
          ✍️ Draft Proposal
        </button>
      </div>

      <div className={styles.feed}>
        {loading ? (
          <div className={styles.emptyState}><p>Loading proposals...</p></div>
        ) : proposals.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No proposals yet</h3>
            <p>Be the first to draft a community resolution!</p>
          </div>
        ) : proposals.map((p, i) => (
          <div key={p.id} className={styles.proposalCard} style={{ animationDelay: `${i * 0.08}s` }}
            onClick={() => openDetail(p)}>
            <div className={styles.voteCol}>
              <button className={`${styles.voteBtn} ${votes[p.id] ? styles.voteBtnActive : ''}`}
                onClick={(e) => handleVote(e, p.id)} title={votes[p.id] ? 'Remove vote' : 'Upvote'}>
                ▲
              </button>
              <span className={styles.voteCount}>{p.upvote_count}</span>
              <span className={styles.voteLabel}>votes</span>
            </div>
            <div className={styles.contentCol}>
              <div className={styles.proposalMeta}>
                <span className={styles.authorName}>{p.author_name}</span>
                <span className={styles.dot}>•</span>
                <span className={styles.timeAgo}>{timeAgo(p.created_at)}</span>
              </div>
              <h3 className={styles.proposalTitle}>{p.title}</h3>
              <p className={styles.proposalSummary}>{p.summary}</p>
              <div className={styles.proposalTags}>
                <span className={styles.categoryBadge}>{p.category}</span>
                <span className={`${styles.statusBadge} ${getStatusClass(p.status)}`}>
                  {p.status.replace('_', ' ')}
                </span>
                {p.is_mandatory_agenda ? (
                  <span className={styles.mandatoryFlag}>🔥 Mandatory Agenda</span>
                ) : null}
              </div>
              {!p.is_mandatory_agenda && (
                <div className={styles.thresholdBar}>
                  <div className={styles.progressTrack}>
                    <div className={`${styles.progressFill} ${progress(p.upvote_count) >= 100 ? styles.progressFillComplete : ''}`}
                      style={{ width: `${progress(p.upvote_count)}%` }} />
                  </div>
                  <span className={styles.thresholdText}>{p.upvote_count}/{UPVOTE_THRESHOLD} for agenda</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Compose Modal ─── */}
      {showCompose && (
        <div className={styles.overlay} onClick={() => setShowCompose(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>✍️ Draft a Proposal</h2>
              <button className={styles.closeBtn} onClick={() => setShowCompose(false)}>✕</button>
            </div>
            <div className={styles.formGroup}>
              <label>Title</label>
              <input placeholder="e.g., Free Wi-Fi Zones in Public Areas" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.filter(c => c !== 'all').map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Summary (1-2 sentences)</label>
              <input placeholder="A brief summary that appears in the feed..." value={form.summary}
                onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label>Full Proposal</label>
              <textarea placeholder="Describe the problem, your proposed solution, estimated costs, and expected impact..."
                value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={6} />
            </div>
            <div className={styles.formActions}>
              <button className={styles.draftBtn} onClick={() => handleSubmit(false)}>💾 Save Draft</button>
              <button className={styles.publishBtn} onClick={() => handleSubmit(true)}>🚀 Publish</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Detail Modal ─── */}
      {showDetail && (
        <div className={styles.overlay} onClick={() => setShowDetail(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.proposalMeta} style={{ marginBottom: 4 }}>
                  <span className={styles.authorName}>{showDetail.author_name || 'Unknown'}</span>
                  <span className={styles.dot}>•</span>
                  <span className={styles.timeAgo}>{timeAgo(showDetail.created_at)}</span>
                </div>
                <h2>{showDetail.title}</h2>
              </div>
              <button className={styles.closeBtn} onClick={() => setShowDetail(null)}>✕</button>
            </div>

            <div className={styles.proposalTags} style={{ marginBottom: 16 }}>
              <span className={styles.categoryBadge}>{showDetail.category}</span>
              <span className={`${styles.statusBadge} ${getStatusClass(showDetail.status)}`}>
                {showDetail.status.replace('_', ' ')}
              </span>
              {showDetail.is_mandatory_agenda ? <span className={styles.mandatoryFlag}>🔥 Mandatory Agenda</span> : null}
            </div>

            <div className={styles.detailStats}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{showDetail.upvote_count}</div>
                <div className={styles.statLabel}>Upvotes</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{UPVOTE_THRESHOLD}</div>
                <div className={styles.statLabel}>Threshold</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{Math.min(progress(showDetail.upvote_count), 100).toFixed(0)}%</div>
                <div className={styles.statLabel}>Progress</div>
              </div>
            </div>

            <div className={styles.detailBody}>{showDetail.body}</div>

            <button className={`${styles.detailVoteBtn} ${votes[showDetail.id] ? styles.detailVoteBtnActive : styles.detailVoteBtnDefault}`}
              onClick={(e) => handleVote(e, showDetail.id)}>
              {votes[showDetail.id] ? '✓ You voted for this proposal' : '▲ Upvote This Proposal'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
