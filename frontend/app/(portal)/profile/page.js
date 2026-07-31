'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import styles from './profile.module.css';
import YouthProfilingForm from '@/components/YouthProfilingForm';

// Helper to parse youth profiling JSON
function parseProfilingData(raw) {
  if (!raw) return null;
  try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return null; }
}

// Toast component
function Toast({ message, type, onClose }) {
  const [fading, setFading] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 2500);
    const t2 = setTimeout(onClose, 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onClose]);
  return (
    <div className={`${styles.toast} ${type === 'success' ? styles.toastSuccess : styles.toastError} ${fading ? styles.toastFadeOut : ''}`}>
      {type === 'success' ? '✅' : '❌'} {message}
    </div>
  );
}

// Confirm modal component
function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className={styles.confirmOverlay} onClick={onCancel}>
      <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
        <div className={styles.confirmIcon}>💾</div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className={styles.confirmActions}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={onConfirm}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, fetchUser } = useAuth();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('display');
  const [editingDisplay, setEditingDisplay] = useState(false);
  const [editingProfiling, setEditingProfiling] = useState(false);
  const [showProfilingForm, setShowProfilingForm] = useState(false);
  const [localPhoto, setLocalPhoto] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  // Display info form
  const [displayForm, setDisplayForm] = useState({
    full_name: '', bio: '', barangay: '', birthdate: ''
  });

  // Profiling form
  const [profilingForm, setProfilingForm] = useState(null);

  // Sync forms with user data
  useEffect(() => {
    if (user) {
      setDisplayForm({
        full_name: user.full_name || '',
        bio: user.bio || '',
        barangay: user.barangay || '',
        birthdate: user.birthdate || ''
      });
      const pd = parseProfilingData(user.youth_profiling_data);
      if (pd) setProfilingForm({ ...pd });
    }
  }, [user]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setLocalPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  // Save display info
  const saveDisplayInfo = async () => {
    try {
      await api.put(`/users/${user.id}`, {
        ...displayForm,
        profile_photo: localPhoto || undefined
      });
      await fetchUser();
      setEditingDisplay(false);
      setLocalPhoto(null);
      showToast('Display information updated successfully!');
    } catch (err) {
      showToast('Failed to save changes.', 'error');
    }
  };

  // Save profiling info
  const saveProfilingInfo = async () => {
    try {
      await api.put(`/users/${user.id}`, { youth_profiling_data: profilingForm });
      await fetchUser();
      setEditingProfiling(false);
      showToast('Youth profiling data updated successfully!');
    } catch (err) {
      showToast('Failed to save profiling data.', 'error');
    }
  };

  // Submit first-time profiling form
  const submitProfilingForm = async (data) => {
    try {
      await api.put(`/users/${user.id}`, { youth_profiling_data: data });
      await fetchUser();
      showToast('Youth Profiling Form submitted! Your account will be reviewed.');
      setShowProfilingForm(false);
    } catch (err) {
      showToast('Failed to submit form.', 'error');
    }
  };

  // Request confirmation before saving
  const requestSaveDisplay = (e) => {
    e.preventDefault();
    setConfirmAction({
      title: 'Save Display Information?',
      message: 'Your display information will be visible to other users. Are you sure you want to save these changes?',
      onConfirm: () => { setConfirmAction(null); saveDisplayInfo(); }
    });
  };

  const requestSaveProfiling = (e) => {
    e.preventDefault();
    setConfirmAction({
      title: 'Save Youth Profiling Data?',
      message: 'This will update your youth profiling records. Are you sure you want to save these changes?',
      onConfirm: () => { setConfirmAction(null); saveProfilingInfo(); }
    });
  };

  const cancelEditDisplay = () => {
    setEditingDisplay(false);
    setLocalPhoto(null);
    setDisplayForm({
      full_name: user?.full_name || '', bio: user?.bio || '',
      barangay: user?.barangay || '', birthdate: user?.birthdate || ''
    });
  };

  const cancelEditProfiling = () => {
    setEditingProfiling(false);
    const pd = parseProfilingData(user?.youth_profiling_data);
    if (pd) setProfilingForm({ ...pd });
  };

  const profilingData = parseProfilingData(user?.youth_profiling_data);
  const hasProfiling = !!profilingData;

  return (
    <div className={styles.profile}>
      <div className={styles.header}><h1>👤 My Profile</h1></div>

      <div className={styles.profileGrid}>
        {/* === LEFT: Profile Card === */}
        <div className={`glass-card ${styles.profileCard}`}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}
              style={{ backgroundImage: `url(${localPhoto || user?.profile_photo || ''})`, cursor: 'pointer' }}
              onClick={() => fileInputRef.current?.click()}>
              {!(localPhoto || user?.profile_photo) && user?.full_name?.charAt(0)}
              <div className={styles.avatarOverlay}><span>📷 Change</span></div>
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handlePhotoChange} />
            <h2 className={styles.name}>{user?.full_name}</h2>
            <span className={styles.username}>@{user?.username}</span>
            <div className={styles.badges}>
              <span className={`badge ${user?.is_verified ? 'badge-success' : 'badge-warning'}`}>
                {user?.is_verified ? '✓ Verified' : '⏳ Unverified'}
              </span>
              <span className="badge badge-primary">{user?.role}</span>
            </div>
            {user?.katips_id && (
              <div style={{ marginTop: '12px', fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 700 }}>
                ID: {user.katips_id}
              </div>
            )}
            {!user?.is_verified && (
              <button className="btn btn-primary" style={{ marginTop: '16px', width: '100%' }}
                onClick={() => setShowProfilingForm(true)}>
                Get Verified
              </button>
            )}
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}><span className={styles.statNum}>{user?.total_points || 0}</span><span>Points</span></div>
            <div className={styles.stat}><span className={styles.statNum}>{user?.role === 'youth' ? '🌟' : '⚙️'}</span><span>Role</span></div>
          </div>
        </div>

        {/* === RIGHT: Tabbed Info === */}
        <div className={styles.rightColumn}>
          <div className={styles.tabNav}>
            <button className={`${styles.tabBtn} ${activeTab === 'display' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('display')}>🪪 Display Info</button>
            <button className={`${styles.tabBtn} ${activeTab === 'profiling' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('profiling')}>📋 Youth Profiling</button>
            {user?.is_verified && (
              <button className={`${styles.tabBtn} ${activeTab === 'id' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('id')}>🆔 Digital ID</button>
            )}
          </div>

          {/* TAB: Display Information */}
          {activeTab === 'display' && (
            <div className={`glass-card ${styles.infoCard}`}>
              <div className={styles.infoHeader}>
                <div>
                  <h3>🪪 Display Information</h3>
                  <p className={styles.sectionSubtitle}>Visible to other users in the community</p>
                </div>
                {!editingDisplay && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditingDisplay(true)}>✏️ Edit</button>
                )}
              </div>

              {editingDisplay ? (
                <form onSubmit={requestSaveDisplay} className={styles.editForm}>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}><label>Full Name</label>
                      <input className="input-field" value={displayForm.full_name}
                        onChange={e => setDisplayForm(p => ({ ...p, full_name: e.target.value }))} />
                    </div>
                    <div className={styles.field}><label>Barangay</label>
                      <input className="input-field" value={displayForm.barangay}
                        onChange={e => setDisplayForm(p => ({ ...p, barangay: e.target.value }))} />
                    </div>
                  </div>
                  <div className={styles.field}><label>Bio</label>
                    <textarea className="input-field" rows={3} value={displayForm.bio}
                      onChange={e => setDisplayForm(p => ({ ...p, bio: e.target.value }))} />
                  </div>
                  <div className={styles.field}><label>Birthdate</label>
                    <input type="date" className="input-field" value={displayForm.birthdate}
                      onChange={e => setDisplayForm(p => ({ ...p, birthdate: e.target.value }))} />
                  </div>
                  <div className={styles.editActions}>
                    <button type="submit" className="btn btn-primary">💾 Save Changes</button>
                    <button type="button" className="btn btn-secondary" onClick={cancelEditDisplay}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div className={styles.infoGrid}>
                  <div className={styles.infoRow}>
                    <div className={styles.infoItem}><span className={styles.infoLabel}>Katips ID</span>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{user?.katips_id || 'N/A'}</span></div>
                    <div className={styles.infoItem}><span className={styles.infoLabel}>Email</span>
                      <span>{user?.email}</span></div>
                  </div>
                  <div className={styles.infoRow}>
                    <div className={styles.infoItem}><span className={styles.infoLabel}>Full Name</span>
                      <span>{user?.full_name}</span></div>
                    <div className={styles.infoItem}><span className={styles.infoLabel}>Barangay</span>
                      <span>{user?.barangay || 'Not set'}</span></div>
                  </div>
                  <div className={styles.infoRow}>
                    <div className={styles.infoItem}><span className={styles.infoLabel}>Bio</span>
                      <span>{user?.bio || 'No bio yet'}</span></div>
                    <div className={styles.infoItem}><span className={styles.infoLabel}>Birthdate</span>
                      <span>{user?.birthdate || 'Not set'}</span></div>
                  </div>
                  <div className={styles.infoItem}><span className={styles.infoLabel}>Member Since</span>
                    <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }) : 'N/A'}</span></div>
                </div>
              )}
            </div>
          )}

          {/* TAB: Youth Profiling */}
          {activeTab === 'profiling' && (
            <div className={`glass-card ${styles.infoCard}`}>
              <div className={styles.infoHeader}>
                <div>
                  <h3>📋 Youth Profiling Data</h3>
                  <p className={styles.sectionSubtitle}>Information from your verification application</p>
                </div>
                {hasProfiling && !editingProfiling && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditingProfiling(true)}>✏️ Edit</button>
                )}
              </div>

              {!hasProfiling ? (
                <div className={styles.emptyProfiling}>
                  <div className={styles.emptyIcon}>📝</div>
                  <h4>No profiling data yet</h4>
                  <p>Submit your Youth Profiling Form to get verified and have your complete profile displayed here.</p>
                  {!user?.is_verified && (
                    <button className="btn btn-primary" onClick={() => setShowProfilingForm(true)}>Submit Youth Profiling Form</button>
                  )}
                </div>
              ) : editingProfiling && profilingForm ? (
                <ProfilingEditForm form={profilingForm} setForm={setProfilingForm}
                  onSave={requestSaveProfiling} onCancel={cancelEditProfiling} />
              ) : (
                <ProfilingReadView data={profilingData} />
              )}
            </div>
          )}

          {/* TAB: Digital ID */}
          {activeTab === 'id' && user?.is_verified && (
            <div className={`glass-card ${styles.infoCard}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ marginBottom: '20px' }}>Your Katips Digital ID</h3>
              <div style={{
                width: '100%', maxWidth: '400px', background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                borderRadius: '16px', padding: '20px', color: 'white',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Katipunan ng Kabataan</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>Quezon City, Philippines</p>
                  </div>
                  <div style={{ fontSize: '2rem' }}>🇵🇭</div>
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <img src={localPhoto || user?.profile_photo || 'https://via.placeholder.com/100'} alt="Profile"
                    style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)', cursor: 'pointer' }}
                    onClick={() => fileInputRef.current?.click()} title="Click to change photo" />
                  <div>
                    <h2 style={{ margin: '0 0 5px 0', fontSize: '1.4rem' }}>{user?.full_name}</h2>
                    <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', opacity: 0.9 }}>ID: <strong>{user?.katips_id || 'PENDING'}</strong></p>
                    <p style={{ margin: '0 0 2px 0', fontSize: '0.8rem', opacity: 0.8 }}>Brgy. {user?.barangay || 'N/A'}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>DOB: {user?.birthdate || 'N/A'}</p>
                  </div>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.7 }}>This is a valid digital identification.</p>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.9)', borderRadius: '4px', padding: '2px' }}>
                    <div style={{ width: '100%', height: '100%', background: `url('https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${user?.katips_id || 'katips'}') center/cover` }}></div>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '10px' }}>Click your photo on the ID to change it.</p>
            </div>
          )}
        </div>
      </div>

      {/* Youth Profiling Form Modal */}
      {showProfilingForm && (
        <YouthProfilingForm
          initialData={{
            firstName: user?.full_name?.split(' ')[0] || '',
            lastName: user?.full_name?.split(' ').slice(1).join(' ') || '',
            email: user?.email || '',
            barangay: user?.barangay || ''
          }}
          onClose={() => setShowProfilingForm(false)}
          onSubmit={submitProfilingForm}
        />
      )}

      {/* Confirm Modal */}
      {confirmAction && (
        <ConfirmModal title={confirmAction.title} message={confirmAction.message}
          onConfirm={confirmAction.onConfirm} onCancel={() => setConfirmAction(null)} />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

/* === Profiling Read View === */
function ProfilingReadView({ data }) {
  const sections = [
    { title: '👤 Personal & Contact', icon: '👤', fields: [
      ['First Name', data.firstName], ['Middle Name', data.middleName || '—'],
      ['Last Name', data.lastName], ['Suffix', data.suffix || '—'],
      ['Birth Date', [data.birthMonth, data.birthDay, data.birthYear].filter(Boolean).join(' ') || '—'],
      ['Sex', data.sex || '—'], ['Mobile', data.mobile || '—'], ['Email', data.email || '—'],
      ['Region', data.region || '—'], ['Province', data.province || '—'],
      ['City/Municipality', data.city || '—'], ['Barangay', data.barangay || '—'],
      ['Purok/Zone', data.purok || '—'],
    ]},
    { title: '📊 Demographics', icon: '📊', fields: [
      ['Civil Status', data.civilStatus || '—'], ['Youth Age Group', data.youthAgeGroup || '—'],
      ['Youth Classification', data.youthClassification || '—'],
      ['Specific Needs', data.specificNeeds ? Object.entries(data.specificNeeds).filter(([,v]) => v).map(([k]) => k.toUpperCase()).join(', ') || 'None' : 'None'],
    ]},
    { title: '🎓 Education & Employment', icon: '🎓', fields: [
      ['Educational Background', data.educationalBackground || '—'],
      ['Work Status', data.workStatus || '—'],
    ]},
    { title: '🗳️ Civic Participation', icon: '🗳️', fields: [
      ['SK Voter', data.skVoter || '—'], ['Voted in SK Election', data.skElection || '—'],
      ['National Voter', data.nationalVoter || '—'],
      ['KK Assembly', data.kkAssembly || '—'],
      ...(data.kkAssembly === 'Yes' ? [['Times Attended', data.kkTimes || '—']] : []),
      ...(data.kkAssembly === 'No' ? [['Reason', data.kkReason || '—']] : []),
    ]},
  ];

  return (
    <div className={styles.profilingSection}>
      {sections.map((sec, i) => (
        <div key={i} className={styles.profilingSectionGroup}>
          <div className={styles.profilingSectionTitle}>{sec.title}</div>
          <div className={styles.profilingGrid}>
            {sec.fields.map(([label, value], j) => (
              <div key={j} className={styles.profilingItem}>
                <span className={styles.profilingItemLabel}>{label}</span>
                <span className={styles.profilingItemValue}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* === Profiling Edit Form === */
function ProfilingEditForm({ form, setForm, onSave, onCancel }) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, specificNeeds: { ...prev.specificNeeds, [name]: checked } }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const selectField = (label, name, options) => (
    <div className={styles.profilingFieldGroup}>
      <label>{label}</label>
      <select className="input-field" name={name} value={form[name] || ''} onChange={handleChange}>
        <option value="">Select</option>
        {options.map(o => <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
          {typeof o === 'string' ? o : o.label}
        </option>)}
      </select>
    </div>
  );

  const inputField = (label, name, props = {}) => (
    <div className={styles.profilingFieldGroup}>
      <label>{label}</label>
      <input className="input-field" name={name} value={form[name] || ''} onChange={handleChange} {...props} />
    </div>
  );

  return (
    <form onSubmit={onSave}>
      <div className={styles.profilingSectionGroup}>
        <div className={styles.profilingSectionTitle}>👤 Personal & Contact</div>
        <div className={styles.profilingEditGrid}>
          {inputField('First Name', 'firstName')}
          {inputField('Middle Name', 'middleName')}
          {inputField('Last Name', 'lastName')}
          {inputField('Suffix', 'suffix', { placeholder: 'e.g. Jr, Sr' })}
          {selectField('Birth Month', 'birthMonth', ['January','February','March','April','May','June','July','August','September','October','November','December'])}
          {inputField('Birth Day', 'birthDay', { type: 'number', min: 1, max: 31 })}
          {inputField('Birth Year', 'birthYear', { type: 'number', min: 1990, max: 2015 })}
          {selectField('Sex', 'sex', ['Male', 'Female'])}
          {inputField('Mobile', 'mobile', { type: 'tel' })}
          {inputField('Email', 'email', { type: 'email' })}
          {inputField('Region', 'region')}
          {inputField('Province', 'province')}
          {inputField('City/Municipality', 'city')}
          {inputField('Barangay', 'barangay')}
          {inputField('Purok/Zone', 'purok')}
        </div>
      </div>

      <div className={styles.profilingSectionGroup}>
        <div className={styles.profilingSectionTitle}>📊 Demographics</div>
        <div className={styles.profilingEditGrid}>
          {selectField('Civil Status', 'civilStatus', ['Single','Married','Widowed','Divorced/Separated','Annulled','Live-in/Common-law','Unknown'])}
          {selectField('Youth Age Group', 'youthAgeGroup', [
            { value: 'Child Youth', label: 'Child Youth (15–17)' },
            { value: 'Core Youth', label: 'Core Youth (18–24)' },
            { value: 'Young Adult', label: 'Young Adult (25–30)' }
          ])}
          {selectField('Youth Classification', 'youthClassification', [
            { value: 'In-School Youth', label: 'In-School Youth' },
            { value: 'Out-of-School Youth', label: 'Out-of-School Youth (OSY)' },
            { value: 'Working Youth', label: 'Working Youth' }
          ])}
          <div className={styles.profilingFieldGroup}>
            <label>Specific Needs</label>
            <div className={styles.checkboxRow}>
              {[['pwd','PWD'],['cicl','CICL'],['ip','Indigenous People']].map(([key, label]) => (
                <label key={key} className={styles.checkboxLabel}>
                  <input type="checkbox" name={key} checked={form.specificNeeds?.[key] || false} onChange={handleChange} /> {label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.profilingSectionGroup}>
        <div className={styles.profilingSectionTitle}>🎓 Education & Employment</div>
        <div className={styles.profilingEditGrid}>
          {selectField('Educational Background', 'educationalBackground', ['Elementary Level','Elementary Graduate','High School Level','High School Graduate','Vocational','College Level','College Graduate',"Master's Level","Master's Graduate",'Doctorate Level','Doctorate Graduate'])}
          {selectField('Work Status', 'workStatus', [
            { value: 'Employed', label: 'Employed' },
            { value: 'Unemployed', label: 'Unemployed' },
            { value: 'Self-Employed', label: 'Self-Employed' },
            { value: 'Looking', label: 'Currently looking for a job' },
            { value: 'Not Interested', label: 'Not interested in looking for a job' }
          ])}
        </div>
      </div>

      <div className={styles.profilingSectionGroup}>
        <div className={styles.profilingSectionTitle}>🗳️ Civic Participation</div>
        <div className={styles.profilingEditGrid}>
          {selectField('SK Voter', 'skVoter', ['Yes', 'No'])}
          {selectField('Voted in SK Election', 'skElection', ['Yes', 'No'])}
          {selectField('National Voter', 'nationalVoter', ['Yes', 'No'])}
          {selectField('KK Assembly', 'kkAssembly', ['Yes', 'No'])}
          {form.kkAssembly === 'Yes' && selectField('Times Attended', 'kkTimes', ['1-2', '3-4', '5+'])}
          {form.kkAssembly === 'No' && selectField('Reason', 'kkReason', ['Not interested', 'No time', 'No meeting', 'Other'])}
        </div>
      </div>

      <div className={styles.editActions}>
        <button type="submit" className="btn btn-primary">💾 Save Changes</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
