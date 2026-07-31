'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/lib/auth';
import styles from './login.module.css';

function LoginForm() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: doLogin } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await doLogin(login, password);
      if (user.role === 'admin' || user.role === 'moderator') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
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
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Log in to your Katips account</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Username or Email</label>
            <input type="text" className="input-field" value={login} onChange={e => setLogin(e.target.value)} placeholder="Enter username or email" required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
          </div>
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className={styles.divider}><span>or</span></div>

        <div className={styles.demoAccounts}>
          <p className={styles.demoLabel}>Demo Accounts:</p>
          <div className={styles.demoGrid}>
            <button className={styles.demoBtn} onClick={() => { setLogin('admin'); setPassword('admin123'); }}>
              <span>⚙️</span> Admin
            </button>
            <button className={styles.demoBtn} onClick={() => { setLogin('juan_dc'); setPassword('youth123'); }}>
              <span>👤</span> Youth
            </button>
          </div>
        </div>

        <p className={styles.switchText}>
          Don&apos;t have an account? <Link href="/register" className={styles.switchLink}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
