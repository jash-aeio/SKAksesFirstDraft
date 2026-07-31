'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/lib/auth';
import styles from '../login/login.module.css';

function RegisterForm() {
  const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '', barangay: 'Katipunan', birthdate: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.bgOrbs}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
      </div>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <Link href="/" className={styles.logoLink}>
            <div className={styles.logoMark}>K</div>
          </Link>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join the Katipunan Central Hub</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Full Name</label>
            <input type="text" className="input-field" name="full_name" value={form.full_name} onChange={handleChange} placeholder="Juan Dela Cruz" required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Username</label>
            <input type="text" className="input-field" name="username" value={form.username} onChange={handleChange} placeholder="Choose a username" required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input type="email" className="input-field" name="email" value={form.email} onChange={handleChange} placeholder="you@email.com" required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input type="password" className="input-field" name="password" value={form.password} onChange={handleChange} placeholder="Create a password" required minLength={6} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Barangay</label>
            <input type="text" className="input-field" name="barangay" value={form.barangay} onChange={handleChange} placeholder="Your barangay" />
          </div>
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className={styles.switchText} style={{ marginTop: '20px' }}>
          Already have an account? <Link href="/login" className={styles.switchLink}>Log In</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <AuthProvider>
      <RegisterForm />
    </AuthProvider>
  );
}
