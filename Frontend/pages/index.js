import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import FeedList from '../components/FeedList';
import { getFeeds } from '../utils/api';
import { initSocket, onNewFeed, onDeleteFeed, disconnectSocket } from '../utils/socket';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    // Initialize Socket.IO
    const socket = initSocket();

    const handleConnect = () => {
      console.log('✅ Socket connected');
      setConnectionStatus('connected');
    };

    const handleDisconnect = () => {
      console.log('❌ Socket disconnected');
      setConnectionStatus('disconnected');
    };

    const handleError = (error) => {
      console.error('❌ Socket error:', error);
      setConnectionStatus('error');
    };

    if (socket && socket.connected) {
      handleConnect();
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('error', handleError);
    socket.on('connect_error', handleError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('error', handleError);
      socket.off('connect_error', handleError);
    };
  }, []);

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getFeeds();
        setFeeds(response.data || []);
        console.log('✅ Feeds loaded:', response.data?.length);
      } catch (err) {
        console.error('❌ Error fetching feeds:', err.message);
        setError(err.message || 'Failed to load feeds');
      } finally {
        setLoading(false);
      }
    };

    fetchFeeds();
  }, []);

  // Set up real-time listeners for WebSocket events
  useEffect(() => {
    onNewFeed((data) => {
      console.log('📢 New feed arrived via WebSocket:', data);
      setFeeds((prev) => {
        // Check for duplicates
        const feedExists = prev.some((f) => f._id === data.feed._id);
        if (feedExists) {
          console.warn('⚠️  Feed already exists, skipping duplicate');
          return prev;
        }
        return [data.feed, ...prev];
      });
    });

    onDeleteFeed((data) => {
      console.log('📢 Feed deleted via WebSocket:', data);
      setFeeds((prev) => prev.filter((f) => f._id !== data.feedId));
    });
  }, []);

  return (
    <div className={styles.page}>
      <Head>
        <title>SyncUp - Coaching Feed</title>
        <meta name="description" content="Real-time coaching feed application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>🎯 SyncUp Coaching Feed</h1>
            <p className={styles.subtitle}>Real-time coaching wisdom and updates</p>
          </div>
          <nav className={styles.nav}>
            <Link href="/" className={`${styles.navLink} ${styles.active}`}>
              📰 Home
            </Link>
            <Link href="/admin" className={styles.navLink}>
              ➕ Add Feed
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.statusBar}>
            <span className={`${styles.status} ${styles[connectionStatus]}`}>
              {connectionStatus === 'connected' && '🟢 Live Connection'}
              {connectionStatus === 'connecting' && '🟡 Connecting...'}
              {connectionStatus === 'disconnected' && '🔴 Disconnected'}
              {connectionStatus === 'error' && '❌ Connection Error'}
            </span>
            {feeds.length > 0 && (
              <span className={styles.feedCount}>
                {feeds.length} feed{feeds.length !== 1 ? 's' : ''} available
              </span>
            )}
          </div>

          <FeedList
            feeds={feeds}
            loading={loading}
            error={error}
          />
        </div>
      </main>

      <footer className={styles.footer}>
        <p>💡 Real-time updates powered by WebSockets | Made with ❤️ for coaches</p>
      </footer>
    </div>
  );
}
