import { create } from 'zustand';
import { FeedState, FeedItem, Category, ConnectionStatus, ToastNotification } from '../types/feed';
import { getFeeds, likeFeed as apiLikeFeed } from '../utils/api';

export const useFeedStore = create<FeedState>((set, get) => ({
  feeds: [],
  loading: false,
  error: null,
  searchQuery: '',
  selectedCategory: 'all',
  connectionStatus: 'connecting',
  likedFeedIds: {},
  theme: 'dark',
  notifications: [],

  setFeeds: (feeds: FeedItem[]) => set({ feeds }),

  addFeed: (newFeed: FeedItem) => {
    const { feeds } = get();
    // Prevent duplicate entries
    if (feeds.some((f) => f._id === newFeed._id)) return;

    set({ feeds: [newFeed, ...feeds] });

    // Trigger toast notification
    get().addNotification(`🔔 New post: "${newFeed.title}" by ${newFeed.author}`, 'info');
  },

  deleteFeed: (feedId: string) => {
    const { feeds } = get();
    const targetFeed = feeds.find((f) => f._id === feedId);

    // If feed was already deleted, ignore duplicate socket/call to avoid double toast
    if (!targetFeed) return;

    set((state) => ({
      feeds: state.feeds.filter((f) => f._id !== feedId),
    }));

    get().addNotification(`🗑️ Post "${targetFeed.title}" was deleted`, 'warning');
  },

  updateFeedLike: (feedId: string, likes: number) => {
    set((state) => ({
      feeds: state.feeds.map((f) =>
        f._id === feedId ? { ...f, likes } : f
      ),
    }));
  },

  setSearchQuery: (searchQuery: string) => set({ searchQuery }),

  setSelectedCategory: (selectedCategory: Category) => set({ selectedCategory }),

  setConnectionStatus: (connectionStatus: ConnectionStatus) => set({ connectionStatus }),

  toggleLikeLocal: (feedId: string) => {
    set((state) => ({
      likedFeedIds: {
        ...state.likedFeedIds,
        [feedId]: !state.likedFeedIds[feedId],
      },
    }));
  },

  toggleTheme: () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
    set({ theme: newTheme });
  },

  addNotification: (message: string, type: ToastNotification['type'] = 'info') => {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastNotification = {
      id,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    set((state) => ({
      notifications: [...state.notifications.slice(-4), newToast], // Keep max 5
    }));

    // Auto-remove after 4 seconds
    setTimeout(() => {
      get().removeNotification(id);
    }, 4000);
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  fetchFeeds: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getFeeds();
      set({ feeds: response.data || [], loading: false });
    } catch (err: any) {
      console.error('Fetch feeds error:', err.message);
      set({
        error: err.message || 'Failed to load feeds from server',
        loading: false,
      });
    }
  },

  likeFeedRemote: async (feedId: string) => {
    const { likedFeedIds, feeds, toggleLikeLocal, updateFeedLike } = get();

    // Optimistic UI update
    const isLiked = likedFeedIds[feedId];
    const targetFeed = feeds.find((f) => f._id === feedId);
    if (!targetFeed) return;

    toggleLikeLocal(feedId);
    const newLikesCount = isLiked ? Math.max(0, targetFeed.likes - 1) : targetFeed.likes + 1;
    updateFeedLike(feedId, newLikesCount);

    try {
      const res = await apiLikeFeed(feedId);
      if (res.data) {
        updateFeedLike(feedId, res.data.likes);
      }
    } catch (err: any) {
      console.error('Like error:', err.message);
      // Revert optimistic update on error
      toggleLikeLocal(feedId);
      updateFeedLike(feedId, targetFeed.likes);
    }
  },
}));
