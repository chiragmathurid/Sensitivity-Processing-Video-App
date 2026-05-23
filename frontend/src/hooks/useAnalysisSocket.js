import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Singleton socket — one connection for the whole app lifetime
let socket = null;

const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000', {
      reconnection: true,   // auto-reconnect if connection drops
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

// Call this once when the user logs in — joins their private room
export const joinUserRoom = (userId) => {
  getSocket().emit('join:room', userId);
};

// Hook used by any component that wants to listen for progress
export const useAnalysisSocket = (onProgress) => {
  const callbackRef = useRef(onProgress);
  callbackRef.current = onProgress; // keep ref fresh without re-subscribing

  useEffect(() => {
    const s = getSocket();

    const handler = (data) => callbackRef.current(data);
    s.on('analysis:progress', handler);

    return () => s.off('analysis:progress', handler);
  }, []); // empty deps — subscribe once, never resubscribe
};

export default getSocket;