import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import FeedList from '../components/FeedList';
import { useFeedStore } from '../store/useFeedStore';
import { deleteFeed as apiDeleteFeed } from '../utils/api';
import styles from '../styles/Home.module.css';

export default function Home() {
  const { fetchFeeds, deleteFeed, addNotification } = useFeedStore();

  useEffect(() => {
    fetchFeeds();
  }, [fetchFeeds]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this coaching post?')) return;
    try {
      await apiDeleteFeed(id);
      deleteFeed(id);
    } catch (err: any) {
      console.error('Delete post error:', err);
      addNotification('❌ Failed to delete post', 'error');
    }
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>SyncUp | Real-Time Coaching Feed</title>
        <meta
          name="description"
          content="Real-time coaching feed with live updates, state management, debounced search, and scroll performance."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section className={styles.heroSection}>
        <div className={styles.heroBadge}>⚡ Live WebSocket Stream Active</div>
        <h1 className={styles.heroTitle}>Coaching Insights & Real-Time Feed</h1>
        <p className={styles.heroSubtitle}>
          Stay connected with elite motivation, technique breakdowns, and performance tips.
          Updates land in real-time without reloading.
        </p>

        <div className={styles.heroActions}>
          <Link href="/admin" className={styles.primaryBtn}>
            ✍️ Publish Coaching Post
          </Link>
          <a href="#feed-section" className={styles.secondaryBtn}>
            👇 Explore Feeds
          </a>
        </div>
      </section>

      <div id="feed-section" className={styles.container}>
        <FeedList onDeleteFeed={handleDelete} />
      </div>
    </div>
  );
}
