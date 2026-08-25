import { io, Socket } from 'socket.io-client';
import { FeedItem } from '../types/feed';

let socket: Socket | null = null;

export const getSocketUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://syncup-assignment-63jq.onrender.com';
  return envUrl.replace(/\/$/, '');
};

/**
 * Initialize Socket.IO client connection
 */
export const initSocket = (): Socket => {
  if (socket && socket.connected) {
    return socket;
  }

  const socketUrl = getSocketUrl();

  socket = io(socketUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('🔌 Connected to socket server:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Disconnected from socket server:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error.message);
  });

  return socket;
};

/**
 * Get current socket instance
 */
export const getSocket = (): Socket | null => {
  return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Listen for realtime new feed events
 */
export const onNewFeed = (callback: (data: { eventId: string; feed: FeedItem; timestamp: string }) => void): void => {
  if (!socket) return;
  socket.off('new_feed');
  socket.on('new_feed', callback);
};

/**
 * Listen for feed deletion events
 */
export const onDeleteFeed = (callback: (data: { eventId: string; feedId: string; timestamp: string }) => void): void => {
  if (!socket) return;
  socket.off('delete_feed');
  socket.on('delete_feed', callback);
};

/**
 * Listen for feed like events
 */
export const onFeedLiked = (callback: (data: { eventId: string; feedId: string; likes: number; timestamp: string }) => void): void => {
  if (!socket) return;
  socket.off('feed_liked');
  socket.on('feed_liked', callback);
};

/**
 * Ping server for connection health
 */
export const pingServer = (): Promise<{ pong: boolean; timestamp: string }> => {
  if (!socket || !socket.connected) {
    return Promise.reject('Socket not connected');
  }

  return new Promise((resolve, reject) => {
    socket?.emit(
      'ping_server',
      { eventId: `ping_${Date.now()}` },
      (response: { pong: boolean; timestamp: string }) => {
        if (response && response.pong) {
          resolve(response);
        } else {
          reject(new Error('Ping failed'));
        }
      }
    );

    setTimeout(() => reject(new Error('Ping timeout')), 5000);
  });
};
