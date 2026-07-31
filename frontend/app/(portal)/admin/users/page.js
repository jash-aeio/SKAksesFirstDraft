'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import styles from '../admin.module.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => { loadUsers(); }, [search]);

  async function loadUsers() {
    try {
      const data = await api.get(`/users?search=${search}&limit=50`);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) { console.error(err); }
  }

  async function verifyUser(id) {
    try { await api.put(`/users/${id}/verify`); loadUsers(); } catch (err) { alert(err.message); }
  }

  async function deleteUser(id) {
    if (!confirm('Are you sure?')) return;
    try { await api.delete(`/users/${id}`); loadUsers(); } catch (err) { alert(err.message); }
  }

  return (
    <div className={styles.admin}>
      <div className={styles.header}>
        <h1>👥 User Management</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Review, verify, and manage youth profiles ({total} total)</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input className="input-field" placeholder="🔍 Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '400px' }} />
      </div>

      {/* Analytics Section */}
      {(() => {
        let ageGroups = {}, gender = {}, workStatus = {};
        users.forEach(u => {
          if (u.youth_profiling_data) {
            try {
              const data = typeof u.youth_profiling_data === 'string' ? JSON.parse(u.youth_profiling_data) : u.youth_profiling_data;
              if (data?.youthAgeGroup) ageGroups[data.youthAgeGroup] = (ageGroups[data.youthAgeGroup] || 0) + 1;
              if (data?.sex) gender[data.sex] = (gender[data.sex] || 0) + 1;
              if (data?.workStatus) workStatus[data.workStatus] = (workStatus[data.workStatus] || 0) + 1;
            } catch (e) {}
          }
        });
        const ageData = Object.keys(ageGroups).map(k => ({ name: k, value: ageGroups[k] }));
        const genderData = Object.keys(gender).map(k => ({ name: k, value: gender[k] }));
        const workData = Object.keys(workStatus).map(k => ({ name: k, value: workStatus[k] }));
        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a288ff'];

        return users.length > 0 && (ageData.length > 0 || genderData.length > 0) ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <h3 style={{ marginBottom: '15px', fontSize: '1rem' }}>Youth Age Groups</h3>
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ageData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {ageData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="glass-card" style={{ padding: '20px' }}>
              <h3 style={{ marginBottom: '15px', fontSize: '1rem' }}>Gender Distribution</h3>
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={genderData} outerRadius={80} dataKey="value">
                      {genderData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <h3 style={{ marginBottom: '15px', fontSize: '1rem' }}>Work Status</h3>
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-glass)', borderRadius: '8px' }} />
                    <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : null;
      })()}

      <div className="glass-card" style={{ padding: '4px', borderRadius: 'var(--radius-lg)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>User</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Katips ID</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Email</th>
              <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Role</th>
              <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Points</th>
              <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.15s' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: `hsl(${(u.id * 47) % 360}, 60%, 65%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                      {u.full_name?.charAt(0)}
                    </div>
                    <div><div style={{ fontWeight: 600 }}>{u.full_name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{u.username}</div></div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>{u.katips_id || 'N/A'}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}><span className={`badge ${u.role === 'admin' ? 'badge-error' : u.role === 'moderator' ? 'badge-warning' : 'badge-primary'}`}>{u.role}</span></td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}><span className={`badge ${u.is_verified ? 'badge-success' : 'badge-warning'}`}>{u.is_verified ? 'Verified' : 'Pending'}</span></td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--primary)' }}>{u.total_points}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => setSelectedUser(u)}>Review</button>
                    {u.role === 'youth' && <button className="btn btn-sm btn-ghost" onClick={() => deleteUser(u.id)} style={{ color: 'var(--error)' }}>Delete</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px', backdropFilter: 'blur(5px)' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '650px', maxHeight: '85vh', overflowY: 'auto', padding: '30px', background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-light)', paddingBottom: '15px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <img src={selectedUser.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.full_name)}&background=random`} alt="Profile" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{selectedUser.full_name}</h2>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>@{selectedUser.username} • {selectedUser.email}</p>
                  {selectedUser.katips_id && <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: 'var(--primary)' }}>ID: {selectedUser.katips_id}</p>}
                </div>
              </div>
              <span className={`badge ${selectedUser.is_verified ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '1rem', padding: '6px 12px' }}>
                {selectedUser.is_verified ? '✓ Verified' : '⏳ Pending'}
              </span>
            </div>

            {selectedUser.youth_profiling_data ? (
              <div style={{ marginTop: '10px' }}>
                <h3 style={{ marginBottom: '15px', color: 'var(--primary)', borderBottom: '2px solid var(--primary)', display: 'inline-block', paddingBottom: '5px' }}>📋 Comprehensive Youth Profiling</h3>
                {(() => {
                  try {
                    const data = typeof selectedUser.youth_profiling_data === 'string' ? JSON.parse(selectedUser.youth_profiling_data) : selectedUser.youth_profiling_data;
                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '0.95rem' }}>
                        <div className="glass-card" style={{ padding: '15px' }}><div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Age Group</div><div style={{ fontWeight: 600 }}>{data?.youthAgeGroup || 'N/A'}</div></div>
                        <div className="glass-card" style={{ padding: '15px' }}><div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Sex</div><div style={{ fontWeight: 600 }}>{data?.sex || 'N/A'}</div></div>
                        <div className="glass-card" style={{ padding: '15px' }}><div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Civil Status</div><div style={{ fontWeight: 600 }}>{data?.civilStatus || 'N/A'}</div></div>
                        <div className="glass-card" style={{ padding: '15px' }}><div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Work Status</div><div style={{ fontWeight: 600 }}>{data?.workStatus || 'N/A'}</div></div>
                        <div className="glass-card" style={{ padding: '15px' }}><div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Educational Attainment</div><div style={{ fontWeight: 600 }}>{data?.educationalBackground || 'N/A'}</div></div>
                        <div className="glass-card" style={{ padding: '15px' }}><div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>SK Voter</div><div style={{ fontWeight: 600 }}>{data?.skVoter || 'N/A'}</div></div>
                        <div className="glass-card" style={{ padding: '15px' }}><div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Address</div><div style={{ fontWeight: 600 }}>Brgy. {data?.barangay || 'N/A'}, {data?.city || 'N/A'}</div></div>
                        <div className="glass-card" style={{ padding: '15px' }}><div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Contact</div><div style={{ fontWeight: 600 }}>{data?.mobile || 'N/A'}</div></div>
                      </div>
                    );
                  } catch(e) { return <div className="glass-card" style={{ padding: '20px', color: 'var(--error)' }}>Error parsing profiling data.</div> }
                })()}
              </div>
            ) : (
              <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <i>No comprehensive youth profiling data submitted yet.</i>
              </div>
            )}

            <div style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>Cancel</button>
              {!selectedUser.is_verified && (
                <button className="btn btn-primary" onClick={() => { verifyUser(selectedUser.id); setSelectedUser(null); }}>✅ Verify Youth Profile</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
