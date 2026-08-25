import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useFeedStore } from '../store/useFeedStore';
import styles from '../styles/Navbar.module.css';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { connectionStatus, theme, toggleTheme, feeds } = useFeedStore();

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <span className={`${styles.badge} ${styles.badgeConnected}`}>🟢 Live Connected</span>;
      case 'connecting':
        return <span className={`${styles.badge} ${styles.badgeConnecting}`}>🟡 Reconnecting...</span>;
      case 'disconnected':
        return <span className={`${styles.badge} ${styles.badgeDisconnected}`}>🔴 Offline</span>;
      default:
        return <span className={`${styles.badge} ${styles.badgeError}`}>⚠️ Connection Alert</span>;
    }
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.brandGroup}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>⚡</span>
            <span className={styles.logoText}>Sync<span className={styles.logoAccent}>Up</span></span>
          </Link>
          <span className={styles.tagline}>Real-Time Coaching Feed</span>
        </div>

        <div className={styles.rightGroup}>
          <div className={styles.statusWrapper}>
            {getStatusBadge()}
            <span className={styles.feedCountBadge}>{feeds.length} Posts</span>
          </div>

          <nav className={styles.navLinks}>
            <Link
              href="/"
              className={`${styles.navItem} ${router.pathname === '/' ? styles.activeNav : ''}`}
            >
              🏠 Home
            </Link>
            <Link
              href="/admin"
              className={`${styles.navItem} ${router.pathname === '/admin' ? styles.activeNav : ''}`}
            >
              ✍️ Publish Post
            </Link>
          </nav>

          <button
            onClick={toggleTheme}
            className={styles.themeToggle}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
