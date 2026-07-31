'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import styles from './skillup.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const CATEGORIES = ['all', 'leadership', 'education', 'environment', 'sports', 'culture', 'general'];
const CATEGORY_ICONS = { all: '🔥', leadership: '👑', education: '📚', environment: '🌿', sports: '⚽', culture: '🎭', general: '📌' };

export default function SkillUpPage() {
  const { user, fetchUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [tab, setTab] = useState('events');
  const [category, setCategory] = useState('all');
  const [pointsHistory, setPointsHistory] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetail, setEventDetail] = useState(null);
  const [showTicket, setShowTicket] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [userRegistrations, setUserRegistrations] = useState({});
  const ticketRef = useRef(null);

  useEffect(() => { loadData(); }, [category]);

  async function loadData() {
    try {
      const [evtData, rwdData, lbData, ptsData] = await Promise.all([
        api.get(`/skillup?category=${category}`),
        api.get('/rewards'),
        api.get('/skillup/leaderboard/top'),
        api.get('/rewards/points/history'),
      ]);
      setEvents(evtData.events || []);
      setRewards(rwdData || []);
      setLeaderboard(lbData || []);
      setPointsHistory(ptsData.history || []);

      // Check which events the user is registered for
      const regs = {};
      for (const evt of (evtData.events || [])) {
        try {
          const ticket = await api.get(`/skillup/${evt.id}/my-ticket`);
          if (ticket && ticket.ticket_code) regs[evt.id] = ticket;
        } catch (e) { /* not registered */ }
      }
      setUserRegistrations(regs);
    } catch (err) { console.error(err); }
  }

  async function openEventDetail(eventId) {
    try {
      const detail = await api.get(`/skillup/${eventId}`);
      let extra = {};
      try { extra = JSON.parse(detail.extra_data || '{}'); } catch(e) {}
      setEventDetail({ ...detail, extra });
      setSelectedEvent(eventId);
    } catch (err) { console.error(err); }
  }

  async function registerEvent() {
    if (!eventDetail) return;
    setRegistering(true);
    try {
      const result = await api.post(`/skillup/${eventDetail.id}/register`);
      setShowTicket({ ...result.ticket, event: eventDetail });
      setUserRegistrations(prev => ({ ...prev, [eventDetail.id]: result.ticket }));
      setSelectedEvent(null);
      setEventDetail(null);
      loadData();
    } catch (err) {
      if (err.message === 'Already registered.') {
        // Fetch existing ticket
        try {
          const ticket = await api.get(`/skillup/${eventDetail.id}/my-ticket`);
          setShowTicket({ ...ticket, event: eventDetail });
        } catch(e) {}
      } else {
        alert(err.message);
      }
    } finally { setRegistering(false); }
  }

  async function cancelRegistration(eventId) {
    if (!confirm('Are you sure you want to cancel your registration?')) return;
    try {
      await api.delete(`/skillup/${eventId}/register`);
      setUserRegistrations(prev => { const n = {...prev}; delete n[eventId]; return n; });
      setSelectedEvent(null);
      setEventDetail(null);
      loadData();
    } catch (err) { alert(err.message); }
  }

  async function viewMyTicket(eventId) {
    try {
      const ticket = await api.get(`/skillup/${eventId}/my-ticket`);
      const eventData = events.find(e => e.id === eventId);
      setShowTicket({ ...ticket, event: eventData });
    } catch (err) { alert(err.message); }
  }

  async function redeemReward(rewardId) {
    if (!confirm('Are you sure you want to redeem this reward?')) return;
    try {
      await api.post(`/rewards/${rewardId}/redeem`);
      alert('Reward redeemed successfully! 🎁');
      loadData();
      fetchUser();
    } catch (err) { alert(err.message); }
  }

  function getStatusColor(status) {
    switch(status) {
      case 'upcoming': return 'badge-primary';
      case 'ongoing': return 'badge-success';
      case 'completed': return 'badge-info';
      case 'cancelled': return 'badge-error';
      default: return 'badge-primary';
    }
  }

  function getTimeUntil(dateStr) {
    const diff = new Date(dateStr) - new Date();
    if (diff < 0) return 'Already started';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Starting soon';
  }

  return (
    <div className={styles.skillup}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>🚀 SKill Up</h1>
          <p className={styles.subtitle}>Join events, earn points, and unlock rewards</p>
        </div>
        <div className={styles.pointsWallet}>
          <div className={styles.walletIcon}>🏆</div>
          <div>
            <span className={styles.walletPoints}>{user?.total_points || 0}</span>
            <span className={styles.walletLabel}>Total Points</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {[
          { key: 'events', label: '📅 Events' },
          { key: 'rewards', label: '🎁 Rewards' },
          { key: 'leaderboard', label: '🏆 Leaderboard' },
          { key: 'history', label: '📊 My Points' },
        ].map(t => (
          <button key={t.key} className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Events Tab */}
      {tab === 'events' && (
        <>
          <div className={styles.filters}>
            {CATEGORIES.map(c => (
              <button key={c} className={`${styles.filterBtn} ${category === c ? styles.filterActive : ''}`} onClick={() => setCategory(c)}>
                {CATEGORY_ICONS[c] || ''} {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
          <div className={styles.eventsGrid}>
            {events.map((evt, i) => {
              const isRegistered = !!userRegistrations[evt.id];
              return (
                <div key={evt.id} className={`${styles.eventCard}`} style={{ animationDelay: `${i * 0.06}s` }} onClick={() => openEventDetail(evt.id)}>
                  {/* Poster Image */}
                  <div className={styles.eventPoster}>
                    {evt.image ? (
                      <img src={`${API_BASE}${evt.image}`} alt={evt.title} className={styles.posterImg} />
                    ) : (
                      <div className={styles.posterPlaceholder}>
                        <span>{CATEGORY_ICONS[evt.category] || '📌'}</span>
                      </div>
                    )}
                    <div className={styles.posterOverlay}>
                      <span className={`badge ${getStatusColor(evt.status)}`}>{evt.status}</span>
                      {evt.status === 'upcoming' && (
                        <span className={styles.countdown}>{getTimeUntil(evt.event_date)}</span>
                      )}
                    </div>
                    {isRegistered && (
                      <div className={styles.registeredBadge}>
                        <span>✓ Registered</span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className={styles.eventBody}>
                    <div className={styles.eventBadge}>
                      <span className={`badge badge-primary`}>{evt.category}</span>
                      <span className={`badge badge-success`}>+{evt.points_reward} pts</span>
                    </div>
                    <h3 className={styles.eventTitle}>{evt.title}</h3>
                    <p className={styles.eventDesc}>{evt.description?.substring(0, 100)}{evt.description?.length > 100 ? '...' : ''}</p>
                    <div className={styles.eventMeta}>
                      <div className={styles.metaItem}>
                        <span className={styles.metaIcon}>📅</span>
                        <span>{new Date(evt.event_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <span className={styles.metaIcon}>📍</span>
                        <span>{evt.location || 'TBA'}</span>
                      </div>
                    </div>
                    <div className={styles.eventFooter}>
                      <div className={styles.participantBar}>
                        <div className={styles.progressBar}>
                          <div className={styles.progressFill} style={{ width: `${evt.max_participants ? Math.min((evt.current_participants / evt.max_participants) * 100, 100) : 30}%` }} />
                        </div>
                        <span className={styles.participantCount}>👥 {evt.current_participants}/{evt.max_participants || '∞'}</span>
                      </div>
                      <button className={`${styles.viewBtn}`} onClick={(e) => { e.stopPropagation(); openEventDetail(evt.id); }}>
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {events.length === 0 && <p className={styles.empty}>No events found for this category.</p>}
          </div>
        </>
      )}

      {/* Rewards Tab */}
      {tab === 'rewards' && (
        <div className={styles.rewardsGrid}>
          {rewards.map((rwd, i) => (
            <div key={rwd.id} className={`glass-card ${styles.rewardCard}`} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className={styles.rewardEmoji}>🎁</div>
              <h3 className={styles.rewardName}>{rwd.name}</h3>
              <p className={styles.rewardDesc}>{rwd.description}</p>
              <div className={styles.rewardMeta}>
                <span className={styles.rewardCost}>{rwd.points_cost} pts</span>
                <span className={styles.rewardQty}>{rwd.quantity_available} left</span>
              </div>
              <button className={`btn ${(user?.total_points || 0) >= rwd.points_cost ? 'btn-accent' : 'btn-secondary'} ${styles.redeemBtn}`} onClick={() => redeemReward(rwd.id)} disabled={(user?.total_points || 0) < rwd.points_cost || rwd.quantity_available <= 0}>
                {(user?.total_points || 0) >= rwd.points_cost ? 'Redeem' : `Need ${rwd.points_cost - (user?.total_points || 0)} more pts`}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard Tab */}
      {tab === 'leaderboard' && (
        <div className={`glass-card ${styles.leaderboardCard}`}>
          <h3>🏆 Top Youth Leaders</h3>
          <div className={styles.lbList}>
            {leaderboard.map((lb, i) => (
              <div key={lb.id} className={`${styles.lbItem} ${i < 3 ? styles.lbTop3 : ''}`}>
                <span className={styles.lbRank}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <div className={styles.lbAvatar} style={{background: `hsl(${(lb.id * 47) % 360}, 60%, 65%)`}}>
                  {lb.full_name?.charAt(0)}
                </div>
                <div className={styles.lbInfo}>
                  <span className={styles.lbName}>{lb.full_name}</span>
                  <span className={styles.lbUsername}>@{lb.username}</span>
                </div>
                <span className={styles.lbPoints}>{lb.total_points} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Points History Tab */}
      {tab === 'history' && (
        <div className={`glass-card ${styles.historyCard}`}>
          <h3>📊 Points History</h3>
          <div className={styles.historyList}>
            {pointsHistory.length === 0 && <p className={styles.empty}>No points history yet. Join events to earn points!</p>}
            {pointsHistory.map(pt => (
              <div key={pt.id} className={styles.historyItem}>
                <div className={`${styles.historyIcon} ${pt.type === 'spent' ? styles.spent : styles.earned}`}>
                  {pt.type === 'spent' ? '−' : '+'}
                </div>
                <div className={styles.historyInfo}>
                  <span className={styles.historyDesc}>{pt.description}</span>
                  <span className={styles.historyDate}>{new Date(pt.earned_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</span>
                </div>
                <span className={`${styles.historyPts} ${pt.type === 'spent' ? styles.spent : styles.earned}`}>
                  {pt.type === 'spent' ? '' : '+'}{pt.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== EVENT DETAIL MODAL ===== */}
      {selectedEvent && eventDetail && (
        <div className={styles.modalOverlay} onClick={() => { setSelectedEvent(null); setEventDetail(null); }}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => { setSelectedEvent(null); setEventDetail(null); }}>✕</button>

            {/* Hero Image */}
            <div className={styles.modalHero}>
              {eventDetail.image ? (
                <img src={`${API_BASE}${eventDetail.image}`} alt={eventDetail.title} className={styles.modalHeroImg} />
              ) : (
                <div className={styles.modalHeroPlaceholder}>
                  <span>{CATEGORY_ICONS[eventDetail.category] || '📌'}</span>
                </div>
              )}
              <div className={styles.modalHeroOverlay}>
                <span className={`badge ${getStatusColor(eventDetail.status)}`}>{eventDetail.status}</span>
              </div>
            </div>

            {/* Event Info */}
            <div className={styles.modalBody}>
              <div className={styles.modalBadges}>
                <span className="badge badge-primary">{eventDetail.category}</span>
                <span className="badge badge-success">+{eventDetail.points_reward} pts</span>
                {eventDetail.registration_deadline && (
                  <span className="badge badge-warning">Deadline: {new Date(eventDetail.registration_deadline).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</span>
                )}
              </div>

              <h2 className={styles.modalTitle}>{eventDetail.title}</h2>
              <p className={styles.modalOrganizer}>Organized by <strong>{eventDetail.organizer}</strong></p>

              {/* Key Info Grid */}
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>📅</span>
                  <div>
                    <strong>Date & Time</strong>
                    <span>{new Date(eventDetail.event_date).toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <span>{new Date(eventDetail.event_date).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                      {eventDetail.event_end_date && ` — ${new Date(eventDetail.event_end_date).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}`}
                    </span>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>📍</span>
                  <div>
                    <strong>Location</strong>
                    <span>{eventDetail.location || 'To Be Announced'}</span>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>👥</span>
                  <div>
                    <strong>Participants</strong>
                    <span>{eventDetail.current_participants} / {eventDetail.max_participants || '∞'} slots</span>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>🏆</span>
                  <div>
                    <strong>Points Reward</strong>
                    <span>{eventDetail.points_reward} points upon attendance</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className={styles.modalSection}>
                <h4>📝 About This Event</h4>
                <p className={styles.modalDescription}>{eventDetail.description}</p>
              </div>

              {/* Agenda */}
              {eventDetail.extra?.agenda && (
                <div className={styles.modalSection}>
                  <h4>📋 Agenda / Schedule</h4>
                  <p className={styles.modalDescription}>{eventDetail.extra.agenda}</p>
                </div>
              )}

              {/* Requirements */}
              {eventDetail.extra?.requirements && (
                <div className={styles.modalSection}>
                  <h4>📌 Requirements</h4>
                  <p className={styles.modalDescription}>{eventDetail.extra.requirements}</p>
                </div>
              )}

              {/* Tags */}
              {eventDetail.extra?.tags?.length > 0 && (
                <div className={styles.modalSection}>
                  <h4>🏷️ Tags</h4>
                  <div className={styles.tagsList}>
                    {eventDetail.extra.tags.map((tag, i) => (
                      <span key={i} className={styles.tag}>#{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact */}
              {(eventDetail.extra?.contact_email || eventDetail.extra?.contact_phone) && (
                <div className={styles.modalSection}>
                  <h4>📞 Contact Information</h4>
                  <div className={styles.contactInfo}>
                    {eventDetail.extra.contact_email && <span>📧 {eventDetail.extra.contact_email}</span>}
                    {eventDetail.extra.contact_phone && <span>📱 {eventDetail.extra.contact_phone}</span>}
                  </div>
                </div>
              )}

              {/* Capacity Bar */}
              <div className={styles.modalCapacity}>
                <div className={styles.capacityHeader}>
                  <span>Event Capacity</span>
                  <span>{eventDetail.max_participants ? `${Math.round((eventDetail.current_participants / eventDetail.max_participants) * 100)}%` : 'Open'}</span>
                </div>
                <div className={styles.capacityBar}>
                  <div className={styles.capacityFill} style={{ width: `${eventDetail.max_participants ? Math.min((eventDetail.current_participants / eventDetail.max_participants) * 100, 100) : 30}%` }} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className={styles.modalActions}>
                {userRegistrations[eventDetail.id] ? (
                  <>
                    <button className={`btn btn-primary ${styles.actionBtnFull}`} onClick={() => { viewMyTicket(eventDetail.id); setSelectedEvent(null); setEventDetail(null); }}>
                      🎫 View My Ticket
                    </button>
                    {eventDetail.status !== 'completed' && eventDetail.status !== 'ongoing' && (
                      <button className={`btn btn-ghost ${styles.cancelBtn}`} onClick={() => cancelRegistration(eventDetail.id)}>
                        Cancel Registration
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    className={`btn btn-primary ${styles.actionBtnFull}`}
                    onClick={registerEvent}
                    disabled={registering || eventDetail.status === 'completed' || eventDetail.status === 'cancelled' || (eventDetail.max_participants > 0 && eventDetail.current_participants >= eventDetail.max_participants)}
                  >
                    {registering ? 'Registering...' : eventDetail.status === 'completed' ? 'Event Completed' : eventDetail.status === 'cancelled' ? 'Event Cancelled' : (eventDetail.max_participants > 0 && eventDetail.current_participants >= eventDetail.max_participants) ? 'Event Full' : '🎟️ Reserve My Spot'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== TICKET MODAL ===== */}
      {showTicket && (
        <div className={styles.modalOverlay} onClick={() => setShowTicket(null)}>
          <div className={styles.ticketModal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowTicket(null)}>✕</button>
            <div className={styles.ticketContent} ref={ticketRef}>
              {/* Ticket Header */}
              <div className={styles.ticketHeader}>
                <div className={styles.ticketLogo}>
                  <span>K</span>
                </div>
                <div>
                  <h3 className={styles.ticketBrand}>KATIPS</h3>
                  <p className={styles.ticketSub}>SKill Up Event Ticket</p>
                </div>
              </div>

              <div className={styles.ticketDivider}>
                <div className={styles.ticketNotchLeft}></div>
                <div className={styles.ticketDividerLine}></div>
                <div className={styles.ticketNotchRight}></div>
              </div>

              {/* Event Info */}
              <div className={styles.ticketEventInfo}>
                <h2 className={styles.ticketEventTitle}>{showTicket.event_title || showTicket.event?.title}</h2>
                <div className={styles.ticketInfoGrid}>
                  <div className={styles.ticketInfoItem}>
                    <span className={styles.ticketLabel}>DATE</span>
                    <span className={styles.ticketValue}>{new Date(showTicket.event_date || showTicket.event?.event_date).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className={styles.ticketInfoItem}>
                    <span className={styles.ticketLabel}>TIME</span>
                    <span className={styles.ticketValue}>{new Date(showTicket.event_date || showTicket.event?.event_date).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className={styles.ticketInfoItem}>
                    <span className={styles.ticketLabel}>LOCATION</span>
                    <span className={styles.ticketValue}>{showTicket.location || showTicket.event?.location || 'TBA'}</span>
                  </div>
                  <div className={styles.ticketInfoItem}>
                    <span className={styles.ticketLabel}>CATEGORY</span>
                    <span className={styles.ticketValue}>{showTicket.category || showTicket.event?.category || 'General'}</span>
                  </div>
                </div>
              </div>

              <div className={styles.ticketDivider}>
                <div className={styles.ticketNotchLeft}></div>
                <div className={styles.ticketDividerLine}></div>
                <div className={styles.ticketNotchRight}></div>
              </div>

              {/* Attendee Info */}
              <div className={styles.ticketAttendee}>
                <div className={styles.ticketInfoItem}>
                  <span className={styles.ticketLabel}>ATTENDEE</span>
                  <span className={styles.ticketValue}>{showTicket.user?.full_name || user?.full_name}</span>
                </div>
                <div className={styles.ticketInfoItem}>
                  <span className={styles.ticketLabel}>STATUS</span>
                  <span className={`${styles.ticketValue} ${styles.ticketStatusConfirmed}`}>
                    {showTicket.attended ? '✓ Attended' : showTicket.status === 'confirmed' ? '✓ Confirmed' : showTicket.status || 'Confirmed'}
                  </span>
                </div>
              </div>

              {/* Ticket Code */}
              <div className={styles.ticketCodeSection}>
                <div className={styles.ticketCodeBox}>
                  <span className={styles.ticketCodeLabel}>TICKET CODE</span>
                  <span className={styles.ticketCode}>{showTicket.ticket_code}</span>
                </div>
                {/* Barcode visualization */}
                <div className={styles.barcode}>
                  {showTicket.ticket_code?.split('').map((char, i) => (
                    <div key={i} className={styles.barcodeBar} style={{ height: `${20 + (char.charCodeAt(0) % 20)}px`, width: i % 3 === 0 ? '3px' : '2px', opacity: 0.7 + (i % 3) * 0.1 }} />
                  ))}
                </div>
              </div>

              <p className={styles.ticketFooter}>Present this ticket at the event entrance. Ticket code is unique and non-transferable.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
