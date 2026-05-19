import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import FeedForm from '../components/FeedForm';
import { createFeed } from '../utils/api';
import { initSocket, disconnectSocket } from '../utils/socket';
import styles from '../styles/Admin.module.css';

export default function Admin() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    // Initialize Socket.IO
    const socket = initSocket();

    const handleConnect = () => {
      console.log('✅ Socket connected on admin page');
      setConnectionStatus('connected');
    };

    const handleDisconnect = () => {
      console.log('❌ Socket disconnected on admin page');
      setConnectionStatus('disconnected');
    };

    const handleError = (error) => {
      console.error('❌ Socket error on admin page:', error);
      setConnectionStatus('error');
    };

    if (socket && socket.connected) {
      handleConnect();
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleError);
    socket.on('error', handleError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleError);
      socket.off('error', handleError);
    };
  }, []);

  const handleCreateFeed = async (feedData) => {
    try {
      setLoading(true);
      setMessage(null);

      const response = await createFeed(feedData);

      setMessage({
        type: 'success',
        text: '✅ Feed published successfully! It will appear on the home page in real-time.',
      });

      console.log('✅ Feed created:', response.data);

      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('❌ Error creating feed:', error);
      setMessage({
        type: 'error',
        text: `❌ Failed to create feed: ${error.response?.data?.error || error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>Admin - Add Feed | SyncUp</title>
        <meta name="description" content="Admin panel for adding coaching feeds" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>⚙️ Admin Panel</h1>
            <p className={styles.subtitle}>Publish new coaching feeds</p>
          </div>
          <nav className={styles.nav}>
            <Link href="/" className={styles.navLink}>
              📰 Home
            </Link>
            <Link href="/admin" className={`${styles.navLink} ${styles.active}`}>
              ➕ Add Feed
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.statusBar}>
            <span className={`${styles.status} ${styles[connectionStatus]}`}>
              {connectionStatus === 'connected' && '🟢 Connected to server'}
              {connectionStatus === 'connecting' && '🟡 Connecting...'}
              {connectionStatus === 'disconnected' && '🔴 Disconnected'}
            </span>
          </div>

          {message && (
            <div className={`${styles.alert} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}

          <div className={styles.formWrapper}>
            <FeedForm onSubmit={handleCreateFeed} loading={loading} />

            <div className={styles.infoPanel}>
              <h3>💡 Feed Guidelines</h3>
              <ul>
                <li>✅ Keep content inspiring and relevant to coaching</li>
                <li>✅ Use appropriate categories for better discoverability</li>
                <li>✅ Add tags to help users find related content</li>
                <li>✅ Pin important feeds to keep them at the top</li>
                <li>✅ Content appears instantly on the home page</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>🔐 Admin access | All changes broadcast in real-time | Made with ❤️</p>
      </footer>
    </div>
  );
}
