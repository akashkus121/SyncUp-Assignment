import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import ToastContainer from '../components/ToastContainer';
import { useFeedStore } from '../store/useFeedStore';
import { initSocket, onNewFeed, onDeleteFeed, onFeedLiked, disconnectSocket } from '../utils/socket';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const {
    addFeed,
    deleteFeed,
    updateFeedLike,
    setConnectionStatus,
  } = useFeedStore();

  useEffect(() => {
    // Set initial dark theme attribute
    document.documentElement.setAttribute('data-theme', 'dark');

    // Initialize Socket.IO connection
    const socket = initSocket();

    const handleConnect = () => setConnectionStatus('connected');
    const handleDisconnect = () => setConnectionStatus('disconnected');
    const handleError = () => setConnectionStatus('error');

    if (socket.connected) {
      handleConnect();
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleError);

    // Listen to real-time events and route to Zustand store
    onNewFeed((data) => {
      if (data?.feed) {
        addFeed(data.feed);
      }
    });

    onDeleteFeed((data) => {
      if (data?.feedId) {
        deleteFeed(data.feedId);
      }
    });

    onFeedLiked((data) => {
      if (data?.feedId && typeof data.likes === 'number') {
        updateFeedLike(data.feedId, data.likes);
      }
    });

    return () => {
      disconnectSocket();
    };
  }, [addFeed, deleteFeed, updateFeedLike, setConnectionStatus]);

  return (
    <>
      <Navbar />
      <main className="mainContent">
        <Component {...pageProps} />
      </main>
      <ToastContainer />
    </>
  );
}
