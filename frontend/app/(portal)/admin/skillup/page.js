'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import styles from './skillup-admin.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const CATEGORIES = ['general', 'leadership', 'education', 'environment', 'sports', 'culture'];
const CATEGORY_ICONS = { general: '📌', leadership: '👑', education: '📚', environment: '🌿', sports: '⚽', culture: '🎭' };

export default function AdminSkillUpPage() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetail, setEventDetail] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '', description: '', category: 'general', location: '',
    points_reward: 0, max_participants: 0, event_date: '', event_end_date: '',
    registration_deadline: '', image: '', agenda: '', contact_email: '',
    contact_phone: '', requirements: '', tags: '',
  });

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents() {
    try {
      const data = await api.get('/skillup?limit=100');
      setEvents(data.events || []);
    } catch (err) { console.error(err); }
  }

  function resetForm() {
    setForm({
      title: '', description: '', category: 'general', location: '',
      points_reward: 0, max_participants: 0, event_date: '', event_end_date: '',
      registration_deadline: '', image: '', agenda: '', contact_email: '',
      contact_phone: '', requirements: '', tags: '',
    });
    setPosterFile(null);
    setPosterPreview('');
    setEditingEvent(null);
  }

  function openEditForm(evt) {
    let extra = {};
    try { extra = JSON.parse(evt.extra_data || '{}'); } catch(e) {}
    setForm({
      title: evt.title, description: evt.description, category: evt.category,
      location: evt.location || '', points_reward: evt.points_reward,
      max_participants: evt.max_participants, event_date: evt.event_date?.slice(0, 16) || '',
      event_end_date: evt.event_end_date?.slice(0, 16) || '',
      registration_deadline: evt.registration_deadline?.slice(0, 16) || '',
      image: evt.image || '', agenda: extra.agenda || '', contact_email: extra.contact_email || '',
      contact_phone: extra.contact_phone || '', requirements: extra.requirements || '',
      tags: (extra.tags || []).join(', '),
    });
    setPosterPreview(evt.image ? `${API_BASE}${evt.image}` : '');
    setEditingEvent(evt);
    setShowForm(true);
  }

  function handlePosterChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrl = form.image;

      // Upload poster if there's a new file
      if (posterFile) {
        const formData = new FormData();
        formData.append('poster', posterFile);
        const uploadResult = await api.upload('/skillup/upload-poster', formData);
        imageUrl = uploadResult.url;
      }

      const payload = {
        ...form,
        image: imageUrl,
        points_reward: Number(form.points_reward),
        max_participants: Number(form.max_participants),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };

      if (editingEvent) {
        await api.put(`/skillup/${editingEvent.id}`, payload);
      } else {
        await api.post('/skillup', payload);
      }

      setShowForm(false);
      resetForm();
      loadEvents();
    } catch (err) { alert(err.message); }
    finally { setSubmitting(false); }
  }

  async function updateStatus(id, status) {
    try { await api.put(`/skillup/${id}`, { status }); loadEvents(); } catch (err) { alert(err.message); }
  }

  async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    try { await api.delete(`/skillup/${id}`); loadEvents(); setSelectedEvent(null); setEventDetail(null); } catch (err) { alert(err.message); }
  }

  async function openEventDetail(id) {
    try {
      const detail = await api.get(`/skillup/${id}`);
      let extra = {};
      try { extra = JSON.parse(detail.extra_data || '{}'); } catch(e) {}
      setEventDetail({ ...detail, extra });
      setSelectedEvent(id);
    } catch (err) { console.error(err); }
  }

  async function toggleAttendance(eventId, userId, currentStatus) {
    try {
      await api.put(`/skillup/${eventId}/attendance`, { user_id: userId, attended: !currentStatus });
      openEventDetail(eventId);
    } catch (err) { alert(err.message); }
  }

  const filteredEvents = activeTab === 'all' ? events : events.filter(e => e.status === activeTab);
  const stats = {
    total: events.length,
    upcoming: events.filter(e => e.status === 'upcoming').length,
    ongoing: events.filter(e => e.status === 'ongoing').length,
    completed: events.filter(e => e.status === 'completed').length,
    totalParticipants: events.reduce((acc, e) => acc + (e.current_participants || 0), 0),
  };

  return (
    <div className={styles.admin}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>🚀 SKill Up Management</h1>
          <p className={styles.headerSub}>Create and manage events — changes go live instantly</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? '✕ Close Form' : '+ Create Event'}
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📅</span>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>Total Events</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>⏳</span>
          <span className={styles.statValue}>{stats.upcoming}</span>
          <span className={styles.statLabel}>Upcoming</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🟢</span>
          <span className={styles.statValue}>{stats.ongoing}</span>
          <span className={styles.statLabel}>Ongoing</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>✅</span>
          <span className={styles.statValue}>{stats.completed}</span>
          <span className={styles.statLabel}>Completed</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>👥</span>
          <span className={styles.statValue}>{stats.totalParticipants}</span>
          <span className={styles.statLabel}>Registrations</span>
        </div>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className={`glass-card ${styles.formCard}`}>
          <h3 className={styles.formTitle}>{editingEvent ? '✏️ Edit Event' : '🆕 Create New Event'}</h3>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Poster Upload */}
            <div className={styles.posterUpload}>
              <label className={styles.posterLabel}>Event Poster / Cover Image</label>
              <div className={styles.posterDropzone} onClick={() => fileInputRef.current?.click()}>
                {posterPreview ? (
                  <img src={posterPreview} alt="Preview" className={styles.posterPreviewImg} />
                ) : (
                  <div className={styles.posterPlaceholder}>
                    <span className={styles.uploadIcon}>📷</span>
                    <span>Click to upload poster image</span>
                    <span className={styles.uploadHint}>JPEG, PNG, WebP — Max 5MB</span>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handlePosterChange} accept="image/*" style={{ display: 'none' }} />
              </div>
              {posterPreview && (
                <button type="button" className={styles.removePoster} onClick={() => { setPosterFile(null); setPosterPreview(''); setForm(p => ({...p, image: ''})); }}>
                  ✕ Remove Image
                </button>
              )}
            </div>

            {/* Basic Info */}
            <div className={styles.formSection}>
              <label className={styles.formLabel}>Event Title *</label>
              <input className="input-field" placeholder="e.g. Youth Leadership Summit 2026" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} required />
            </div>

            <div className={styles.formSection}>
              <label className={styles.formLabel}>Description *</label>
              <textarea className="input-field" placeholder="Provide a detailed description of the event, what participants can expect, goals, etc." value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} required rows={4} />
            </div>

            <div className={styles.formGrid3}>
              <div className={styles.formSection}>
                <label className={styles.formLabel}>Category</label>
                <select className="input-field" value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div className={styles.formSection}>
                <label className={styles.formLabel}>Location</label>
                <input className="input-field" placeholder="e.g. SK Hall, Katipunan" value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))} />
              </div>
              <div className={styles.formSection}>
                <label className={styles.formLabel}>Points Reward</label>
                <input type="number" className="input-field" placeholder="0" value={form.points_reward} onChange={e => setForm(p => ({...p, points_reward: e.target.value}))} min="0" />
              </div>
            </div>

            <div className={styles.formGrid3}>
              <div className={styles.formSection}>
                <label className={styles.formLabel}>Event Start *</label>
                <input type="datetime-local" className="input-field" value={form.event_date} onChange={e => setForm(p => ({...p, event_date: e.target.value}))} required />
              </div>
              <div className={styles.formSection}>
                <label className={styles.formLabel}>Event End</label>
                <input type="datetime-local" className="input-field" value={form.event_end_date} onChange={e => setForm(p => ({...p, event_end_date: e.target.value}))} />
              </div>
              <div className={styles.formSection}>
                <label className={styles.formLabel}>Registration Deadline</label>
                <input type="datetime-local" className="input-field" value={form.registration_deadline} onChange={e => setForm(p => ({...p, registration_deadline: e.target.value}))} />
              </div>
            </div>

            <div className={styles.formGrid2}>
              <div className={styles.formSection}>
                <label className={styles.formLabel}>Max Participants (0 = unlimited)</label>
                <input type="number" className="input-field" placeholder="0" value={form.max_participants} onChange={e => setForm(p => ({...p, max_participants: e.target.value}))} min="0" />
              </div>
              <div className={styles.formSection}>
                <label className={styles.formLabel}>Tags (comma-separated)</label>
                <input className="input-field" placeholder="e.g. workshop, free, seminar" value={form.tags} onChange={e => setForm(p => ({...p, tags: e.target.value}))} />
              </div>
            </div>

            {/* Extended Info */}
            <div className={styles.formSection}>
              <label className={styles.formLabel}>Agenda / Schedule</label>
              <textarea className="input-field" placeholder="Outline the event schedule, sessions, speakers, etc." value={form.agenda} onChange={e => setForm(p => ({...p, agenda: e.target.value}))} rows={3} />
            </div>

            <div className={styles.formSection}>
              <label className={styles.formLabel}>Requirements / What to Bring</label>
              <textarea className="input-field" placeholder="e.g. Valid ID, notebook, laptop, etc." value={form.requirements} onChange={e => setForm(p => ({...p, requirements: e.target.value}))} rows={2} />
            </div>

            <div className={styles.formGrid2}>
              <div className={styles.formSection}>
                <label className={styles.formLabel}>Contact Email</label>
                <input type="email" className="input-field" placeholder="organizer@email.com" value={form.contact_email} onChange={e => setForm(p => ({...p, contact_email: e.target.value}))} />
              </div>
              <div className={styles.formSection}>
                <label className={styles.formLabel}>Contact Phone</label>
                <input className="input-field" placeholder="09XX-XXX-XXXX" value={form.contact_phone} onChange={e => setForm(p => ({...p, contact_phone: e.target.value}))} />
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : editingEvent ? '💾 Save Changes' : '🚀 Create Event (Goes Live Instantly)'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        {['all', 'upcoming', 'ongoing', 'completed', 'cancelled'].map(t => (
          <button key={t} className={`${styles.filterTab} ${activeTab === t ? styles.filterTabActive : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'all' ? '📋 All' : t === 'upcoming' ? '⏳ Upcoming' : t === 'ongoing' ? '🟢 Ongoing' : t === 'completed' ? '✅ Completed' : '❌ Cancelled'}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className={styles.eventsList}>
        {filteredEvents.map(evt => (
          <div key={evt.id} className={styles.eventRow}>
            {/* Thumbnail */}
            <div className={styles.eventThumb} onClick={() => openEventDetail(evt.id)}>
              {evt.image ? (
                <img src={`${API_BASE}${evt.image}`} alt="" className={styles.thumbImg} />
              ) : (
                <div className={styles.thumbPlaceholder}>
                  <span>{CATEGORY_ICONS[evt.category] || '📌'}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className={styles.eventInfo} onClick={() => openEventDetail(evt.id)}>
              <div className={styles.eventRowTitle}>{evt.title}</div>
              <div className={styles.eventRowMeta}>
                <span>📅 {new Date(evt.event_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span>📍 {evt.location || 'TBA'}</span>
                <span>🏆 {evt.points_reward} pts</span>
                <span>👥 {evt.current_participants}/{evt.max_participants || '∞'}</span>
                <span className={styles.categoryTag}>{evt.category}</span>
              </div>
            </div>

            {/* Status Badge */}
            <span className={`badge ${evt.status === 'upcoming' ? 'badge-primary' : evt.status === 'ongoing' ? 'badge-success' : evt.status === 'completed' ? 'badge-info' : 'badge-error'}`}>
              {evt.status}
            </span>

            {/* Actions */}
            <div className={styles.eventActions}>
              <button className="btn btn-sm btn-ghost" onClick={() => openEditForm(evt)} title="Edit">✏️</button>
              {evt.status === 'upcoming' && <button className="btn btn-sm btn-primary" onClick={() => updateStatus(evt.id, 'ongoing')}>Start</button>}
              {evt.status === 'ongoing' && <button className="btn btn-sm btn-primary" onClick={() => updateStatus(evt.id, 'completed')}>Complete</button>}
              {evt.status !== 'cancelled' && evt.status !== 'completed' && (
                <button className="btn btn-sm btn-ghost" style={{ color: 'var(--error)' }} onClick={() => updateStatus(evt.id, 'cancelled')}>Cancel</button>
              )}
              <button className="btn btn-sm btn-ghost" style={{ color: 'var(--error)' }} onClick={() => deleteEvent(evt.id)} title="Delete">🗑️</button>
            </div>
          </div>
        ))}
        {filteredEvents.length === 0 && <p className={styles.empty}>No events in this category.</p>}
      </div>

      {/* ===== EVENT DETAIL MODAL (Admin) ===== */}
      {selectedEvent && eventDetail && (
        <div className={styles.modalOverlay} onClick={() => { setSelectedEvent(null); setEventDetail(null); }}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => { setSelectedEvent(null); setEventDetail(null); }}>✕</button>

            {/* Hero */}
            <div className={styles.modalHero}>
              {eventDetail.image ? (
                <img src={`${API_BASE}${eventDetail.image}`} alt={eventDetail.title} className={styles.modalHeroImg} />
              ) : (
                <div className={styles.modalHeroPlaceholder}>
                  <span>{CATEGORY_ICONS[eventDetail.category] || '📌'}</span>
                </div>
              )}
            </div>

            <div className={styles.modalBody}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span className={`badge ${eventDetail.status === 'upcoming' ? 'badge-primary' : eventDetail.status === 'ongoing' ? 'badge-success' : eventDetail.status === 'completed' ? 'badge-info' : 'badge-error'}`}>{eventDetail.status}</span>
                <span className="badge badge-primary">{eventDetail.category}</span>
                <span className="badge badge-success">+{eventDetail.points_reward} pts</span>
              </div>

              <h2 className={styles.modalTitle}>{eventDetail.title}</h2>
              <p className={styles.modalOrganizer}>Organized by <strong>{eventDetail.organizer}</strong></p>

              {/* Detail Grid */}
              <div className={styles.detailGrid}>
                <div><strong>📅 Start:</strong> {new Date(eventDetail.event_date).toLocaleString('en-PH')}</div>
                {eventDetail.event_end_date && <div><strong>🏁 End:</strong> {new Date(eventDetail.event_end_date).toLocaleString('en-PH')}</div>}
                {eventDetail.registration_deadline && <div><strong>⏰ Deadline:</strong> {new Date(eventDetail.registration_deadline).toLocaleString('en-PH')}</div>}
                <div><strong>📍 Location:</strong> {eventDetail.location || 'TBA'}</div>
                <div><strong>👥 Participants:</strong> {eventDetail.current_participants}/{eventDetail.max_participants || '∞'}</div>
                <div><strong>🏆 Reward:</strong> {eventDetail.points_reward} pts</div>
              </div>

              {eventDetail.description && (
                <div className={styles.sectionBlock}>
                  <h4>📝 Description</h4>
                  <p>{eventDetail.description}</p>
                </div>
              )}
              {eventDetail.extra?.agenda && (
                <div className={styles.sectionBlock}>
                  <h4>📋 Agenda</h4>
                  <p>{eventDetail.extra.agenda}</p>
                </div>
              )}
              {eventDetail.extra?.requirements && (
                <div className={styles.sectionBlock}>
                  <h4>📌 Requirements</h4>
                  <p>{eventDetail.extra.requirements}</p>
                </div>
              )}

              {/* Registrations / Attendees */}
              <div className={styles.attendeesSection}>
                <h4>👥 Registered Attendees ({eventDetail.registrations?.length || 0})</h4>
                {eventDetail.registrations?.length > 0 ? (
                  <div className={styles.attendeesList}>
                    <div className={styles.attendeeHeader}>
                      <span>Attendee</span>
                      <span>Ticket Code</span>
                      <span>Registered</span>
                      <span>Status</span>
                      {(eventDetail.status === 'ongoing' || eventDetail.status === 'completed') && <span>Attendance</span>}
                    </div>
                    {eventDetail.registrations.map(reg => (
                      <div key={reg.id} className={styles.attendeeRow}>
                        <div className={styles.attendeeInfo}>
                          <div className={styles.attendeeAvatar} style={{background: `hsl(${(reg.user_id * 47) % 360}, 60%, 65%)`}}>
                            {reg.full_name?.charAt(0)}
                          </div>
                          <div>
                            <span className={styles.attendeeName}>{reg.full_name}</span>
                            <span className={styles.attendeeUsername}>@{reg.username}</span>
                          </div>
                        </div>
                        <span className={styles.ticketCodeSmall}>{reg.ticket_code || '—'}</span>
                        <span className={styles.regDate}>{new Date(reg.registered_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</span>
                        <span className={`badge ${reg.attended ? 'badge-success' : 'badge-primary'}`}>
                          {reg.attended ? '✓ Attended' : reg.status || 'Confirmed'}
                        </span>
                        {(eventDetail.status === 'ongoing' || eventDetail.status === 'completed') && (
                          <button
                            className={`btn btn-sm ${reg.attended ? 'btn-ghost' : 'btn-primary'}`}
                            onClick={() => toggleAttendance(eventDetail.id, reg.user_id, reg.attended)}
                          >
                            {reg.attended ? 'Undo' : 'Mark Present'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.empty}>No registrations yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
