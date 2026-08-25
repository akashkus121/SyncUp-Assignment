import React from 'react';
import FeedCard from './FeedCard';
import { useFeedStore } from '../store/useFeedStore';
import { useDebounce } from '../utils/useDebounce';
import { useThrottledScroll } from '../utils/useThrottle';
import { Category } from '../types/feed';
import styles from '../styles/FeedList.module.css';

interface FeedListProps {
  onDeleteFeed?: (id: string) => void;
}

const CATEGORIES: { key: Category; label: string; icon: string }[] = [
  { key: 'all', label: 'All Posts', icon: '🌟' },
  { key: 'motivation', label: 'Motivation', icon: '🔥' },
  { key: 'technique', label: 'Technique', icon: '🏋️' },
  { key: 'nutrition', label: 'Nutrition', icon: '🥗' },
  { key: 'mindset', label: 'Mindset', icon: '🧠' },
  { key: 'performance', label: 'Performance', icon: '⚡' },
  { key: 'recovery', label: 'Recovery', icon: '🧊' },
];

export const FeedList: React.FC<FeedListProps> = ({ onDeleteFeed }) => {
  const {
    feeds,
    loading,
    error,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    fetchFeeds,
  } = useFeedStore();

  // Debounce search query to prevent lag on rapid typing
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Throttled scroll listener for scroll-to-top button
  const { showScrollTop } = useThrottledScroll(200);

  // Filter feeds based on category & debounced search term
  const filteredFeeds = feeds.filter((feed) => {
    const matchesCategory =
      selectedCategory === 'all' || feed.category === selectedCategory;

    const query = debouncedSearch.toLowerCase().trim();
    if (!query) return matchesCategory;

    const matchesTitle = feed.title?.toLowerCase().includes(query);
    const matchesContent = feed.content?.toLowerCase().includes(query);
    const matchesAuthor = feed.author?.toLowerCase().includes(query);
    const matchesTags = feed.tags?.some((t) => t.toLowerCase().includes(query));

    return matchesCategory && (matchesTitle || matchesContent || matchesAuthor || matchesTags);
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className={styles.wrapper}>
      {/* Search & Category Filter Toolbar */}
      <div className={styles.filterToolbar}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search by title, author, keyword, or #tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={styles.clearSearch}
              aria-label="Clear Search"
            >
              ✕
            </button>
          )}
        </div>

        <div className={styles.categoryPills}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`${styles.categoryPill} ${
                selectedCategory === cat.key ? styles.activePill : ''
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className={styles.resultsHeader}>
        <span className={styles.resultsCount}>
          Showing {filteredFeeds.length} {filteredFeeds.length === 1 ? 'post' : 'posts'}
          {debouncedSearch && ` for "${debouncedSearch}"`}
          {selectedCategory !== 'all' && ` in ${selectedCategory}`}
        </span>
        {debouncedSearch && (
          <span className={styles.debounceTag}>⚡ Debounced Filter Active</span>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className={styles.errorCard}>
          <p>⚠️ {error}</p>
          <button onClick={() => fetchFeeds()} className={styles.retryBtn}>
            🔄 Retry Loading
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && feeds.length === 0 && (
        <div className={styles.grid}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={styles.skeletonCard}>
              <div className={styles.skeletonHeader} />
              <div className={styles.skeletonTitle} />
              <div className={styles.skeletonText} />
              <div className={styles.skeletonTextShort} />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredFeeds.length === 0 && (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🔍</span>
          <h3>No coaching feeds found</h3>
          <p>
            {debouncedSearch
              ? `No posts matched "${debouncedSearch}". Try a different keyword.`
              : 'No posts in this category yet.'}
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className={styles.resetFilterBtn}
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Feed Cards Grid */}
      <div className={styles.grid}>
        {filteredFeeds.map((feed) => (
          <FeedCard key={feed._id} feed={feed} onDelete={onDeleteFeed} />
        ))}
      </div>

      {/* Throttled Scroll To Top Floating Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className={styles.scrollTopBtn}
          title="Scroll to Top"
          aria-label="Scroll to Top"
        >
          ⬆️
        </button>
      )}
    </section>
  );
};

export default FeedList;
