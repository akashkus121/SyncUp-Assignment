import React, { useState, useEffect } from 'react';
import styles from '../styles/FeedList.module.css';

const FeedList = ({ feeds, onNewFeed, onDeleteFeed, loading, error }) => {
  const [displayFeeds, setDisplayFeeds] = useState(feeds);
  const [likeAnimation, setLikeAnimation] = useState({});

  useEffect(() => {
    setDisplayFeeds(feeds);
  }, [feeds]);

  useEffect(() => {
    if (onNewFeed) {
      onNewFeed((data) => {
        const newFeed = data.feed;
        setDisplayFeeds((prev) => [newFeed, ...prev]);
        // Toast-like notification
        showNotification(`✨ New feed from ${newFeed.author}!`);
      });
    }
  }, []);

  const showNotification = (message) => {
    // Simple notification - in production, use a toast library
    console.log('🔔 Notification:', message);
  };

  const handleLike = (feedId) => {
    setLikeAnimation({ ...likeAnimation, [feedId]: true });
    setTimeout(() => {
      setLikeAnimation({ ...likeAnimation, [feedId]: false });
    }, 600);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading feeds...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>❌ Error loading feeds: {error}</p>
          <p className={styles.errorHint}>Make sure the backend is running</p>
        </div>
      </div>
    );
  }

  if (!displayFeeds || displayFeeds.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>📭 No feeds yet. Create one to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.feedList}>
        {displayFeeds.map((feed) => (
          <div
            key={feed._id}
            className={`${styles.feedCard} ${feed.isPinned ? styles.pinned : ''}`}
          >
            {feed.isPinned && <div className={styles.pinnedBadge}>📌 PINNED</div>}

            <div className={styles.feedHeader}>
              <div className={styles.feedMeta}>
                <h3 className={styles.feedTitle}>{feed.title}</h3>
                <p className={styles.feedAuthor}>by {feed.author}</p>
              </div>
              <span className={styles.category}>{feed.category}</span>
            </div>

            <p className={styles.feedContent}>{feed.content}</p>

            {feed.tags && feed.tags.length > 0 && (
              <div className={styles.tags}>
                {feed.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className={styles.feedFooter}>
              <button
                className={`${styles.likeBtn} ${
                  likeAnimation[feed._id] ? styles.animated : ''
                }`}
                onClick={() => handleLike(feed._id)}
                title="Like this feed"
              >
                👍 {feed.likes || 0}
              </button>

              <span className={styles.timestamp}>
                {new Date(feed.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedList;
