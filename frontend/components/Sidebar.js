'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import styles from './Sidebar.module.css';

const userNavItems = [
  { href: '/dashboard', icon: '🏠', label: 'Home' },
  { href: '/forum', icon: '💬', label: 'Community Forum' },
  { href: '/news', icon: '📰', label: 'News & Events' },
  { href: '/services', icon: '🛠️', label: 'Services' },
  { href: '/skillup', icon: '🚀', label: 'SKill Up' },
  { href: '/transparency', icon: '📋', label: 'Transparency' },
  { href: '/profile', icon: '👤', label: 'Profile' },
];

const adminNavItems = [
  { href: '/admin', icon: '📊', label: 'Dashboard' },
  { href: '/admin/users', icon: '👥', label: 'Users' },
  { href: '/admin/forum', icon: '💬', label: 'Forum Review' },
  { href: '/admin/news', icon: '📰', label: 'News & Events' },
  { href: '/admin/services', icon: '🛠️', label: 'Services' },
  { href: '/admin/skillup', icon: '🚀', label: 'SKill Up' },
  { href: '/admin/rewards', icon: '🎁', label: 'Rewards' },
  { href: '/admin/transparency', icon: '📋', label: 'Transparency' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';
  const isAdminSection = pathname?.startsWith('/admin');
  const navItems = isAdminSection ? adminNavItems : userNavItems;

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>K</div>
        {!collapsed && (
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>Katips</span>
            <span className={styles.logoSub}>Central Hub</span>
          </div>
        )}
        <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/admin' && pathname?.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
              {isActive && <div className={styles.activeIndicator} />}
            </Link>
          );
        })}
      </nav>

      {/* Switch Portal */}
      {isAdmin && (
        <div className={styles.switchPortal}>
          <Link href={isAdminSection ? '/dashboard' : '/admin'} className={`${styles.switchBtn}`}>
            <span>{isAdminSection ? '👤' : '⚙️'}</span>
            {!collapsed && <span>{isAdminSection ? 'User Portal' : 'Admin Panel'}</span>}
          </Link>
        </div>
      )}

      {/* User Card */}
      <div className={styles.userCard}>
        <div className={styles.userAvatar}>
          {user?.full_name?.charAt(0) || 'U'}
        </div>
        {!collapsed && (
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.full_name || 'User'}</span>
            <span className={styles.userRole}>{user?.role || 'youth'}</span>
          </div>
        )}
        <button className={styles.logoutBtn} onClick={logout} title="Logout">
          🚪
        </button>
      </div>
    </aside>
  );
}
