export type Category = 
  | 'all' 
  | 'motivation' 
  | 'technique' 
  | 'nutrition' 
  | 'mindset' 
  | 'performance' 
  | 'recovery';

export interface FeedItem {
  _id: string;
  title: string;
  content: string;
  author: string;
  category: Category;
  tags: string[];
  likes: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface ToastNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  source?: 'cache' | 'database';
  count?: number;
  data: T;
  error?: string;
  message?: string;
}

export interface FeedState {
  feeds: FeedItem[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: Category;
  connectionStatus: ConnectionStatus;
  likedFeedIds: Record<string, boolean>;
  theme: 'dark' | 'light';
  notifications: ToastNotification[];
  
  // Actions
  setFeeds: (feeds: FeedItem[]) => void;
  addFeed: (feed: FeedItem) => void;
  deleteFeed: (feedId: string) => void;
  updateFeedLike: (feedId: string, likes: number) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: Category) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  toggleLikeLocal: (feedId: string) => void;
  toggleTheme: () => void;
  addNotification: (message: string, type?: ToastNotification['type']) => void;
  removeNotification: (id: string) => void;
  fetchFeeds: () => Promise<void>;
  likeFeedRemote: (feedId: string) => Promise<void>;
}
