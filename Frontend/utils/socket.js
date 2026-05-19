import { io } from 'socket.io-client';

let socket = null;

/**
 * Initialize Socket.IO client connection
 * Handles:
 *  - Automatic reconnection with exponential backoff
 *  - Duplicate event prevention (eventId on client side)
 *  - Health checks via ping
 */
export const initSocket = () => {
  if (socket && socket.connected) {
    console.log('✅ Socket already connected');
    return socket;
  }

  const socketUrl = 'https://syncup-assignment-63jq.onrender.com';

  socket = io(socketUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('🔌 Connected to socket server:', socket.id);
  });

  socket.on('connected', (data) => {
    console.log('📡 Server response:', data);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Disconnected from socket server:', reason);
  });

  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error);
  });

  return socket;
};

/**
 * Get the current socket instance
 */
export const getSocket = () => {
  if (!socket) {
    console.warn('⚠️  Socket not initialized. Call initSocket() first.');
    return null;
  }
  return socket;
};

/**
 * Disconnect the socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 Socket disconnected');
  }
};

/**
 * Emit event with deduplication
 */
export const emitEvent = (eventName, data, eventId) => {
  if (!socket || !socket.connected) {
    console.warn('⚠️  Socket not connected');
    return;
  }
  const uniqueEventId = eventId || `${eventName}_${Date.now()}_${Math.random()}`;
  socket.emit(eventName, { ...data, eventId: uniqueEventId });
};

/**
 * Listen for realtime feed updates
 */
export const onNewFeed = (callback) => {
  if (!socket) {
    console.warn('⚠️  Socket not initialized');
    return;
  }

  socket.on('new_feed', (data) => {
    console.log('📢 New feed received:', data);
    callback(data);
  });
};

/**
 * Listen for feed deletions
 */
export const onDeleteFeed = (callback) => {
  if (!socket) {
    console.warn('⚠️  Socket not initialized');
    return;
  }

  socket.on('delete_feed', (data) => {
    console.log('📢 Feed deleted:', data);
    callback(data);
  });
};

/**
 * Ping server for connection health
 */
export const pingServer = () => {
  if (!socket || !socket.connected) {
    console.warn('⚠️  Socket not connected');
    return Promise.reject('Socket not connected');
  }

  return new Promise((resolve, reject) => {
    socket.emit(
      'ping_server',
      { eventId: `ping_${Date.now()}` },
      (response) => {
        if (response && response.pong) {
          resolve(response);
        } else {
          reject(new Error('Ping failed'));
        }
      }
    );

    // Timeout after 5s
    setTimeout(() => reject(new Error('Ping timeout')), 5000);
  });
};
