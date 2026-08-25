import React, { useState } from 'react';
import { FeedItem } from '../types/feed';
import { useFeedStore } from '../store/useFeedStore';
import styles from '../styles/FeedCard.module.css';

interface FeedCardProps {
  feed: FeedItem;
  onDelete?: (id: string) => void;
}

export const FeedCard: React.FC<FeedCardProps> = ({ feed, onDelete }) => {
  const { likedFeedIds, likeFeedRemote } = useFeedStore();
  const [copied, setCopied] = useState(false);
  const isLiked = !!likedFeedIds[feed._id];

  const formatTimestamp = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const categoryEmojiMap: Record<string, string> = {
    motivation: '🔥',
    technique: '🏋️',
    nutrition: '🥗',
    mindset: '🧠',
    performance: '⚡',
    recovery: '🧊',
  };

  const categoryEmoji = categoryEmojiMap[feed.category] || '💡';

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/#post-${feed._id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article id={`post-${feed._id}`} className={`${styles.card} ${feed.isPinned ? styles.pinnedCard : ''}`}>
      {feed.isPinned && (
        <div className={styles.pinnedBanner}>
          📌 Pinned Coaching Insight
        </div>
      )}

      <div className={styles.cardHeader}>
        <div className={styles.authorGroup}>
          <div className={styles.avatar}>
            {feed.author.charAt(0).toUpperCase()}
          </div>
          <div className={styles.authorInfo}>
            <h3 className={styles.authorName}>{feed.author}</h3>
            <span className={styles.timestamp}>{formatTimestamp(feed.createdAt)}</span>
          </div>
        </div>

        <span className={`${styles.categoryBadge} ${styles[feed.category] || ''}`}>
          {categoryEmoji} {feed.category}
        </span>
      </div>

      <h2 className={styles.title}>{feed.title}</h2>

      <p className={styles.content}>{feed.content}</p>

      {feed.tags && feed.tags.length > 0 && (
        <div className={styles.tagList}>
          {feed.tags.map((tag, idx) => (
            <span key={idx} className={styles.tagPill}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className={styles.cardFooter}>
        <button
          onClick={() => likeFeedRemote(feed._id)}
          className={`${styles.likeBtn} ${isLiked ? styles.liked : ''}`}
          aria-label="Like Post"
        >
          <span className={styles.likeIcon}>{isLiked ? '❤️' : '🤍'}</span>
          <span className={styles.likeCount}>{feed.likes || 0}</span>
        </button>

        <div className={styles.actionGroup}>
          <button onClick={handleShare} className={styles.actionBtn} title="Copy Link">
            {copied ? '✅ Copied' : '🔗 Share'}
          </button>

          {onDelete && (
            <button
              onClick={() => onDelete(feed._id)}
              className={`${styles.actionBtn} ${styles.deleteBtn}`}
              title="Delete Post"
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default FeedCard;
