import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    newSocket.on('connect', () => {
      console.log('🟢 Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔴 Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      setIsConnected(false);
    });

    newSocket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, token]);

  const joinRoom = useCallback((roomId) => {
    if (socket) socket.emit('join_room', roomId);
  }, [socket]);

  const leaveRoom = useCallback((roomId) => {
    if (socket) socket.emit('leave_room', roomId);
  }, [socket]);

  const sendMessage = useCallback((data) => {
    if (socket) socket.emit('send_message', data);
  }, [socket]);

  const emitTyping = useCallback((roomId) => {
    if (socket) socket.emit('typing', { roomId });
  }, [socket]);

  const emitStopTyping = useCallback((roomId) => {
    if (socket) socket.emit('stop_typing', { roomId });
  }, [socket]);

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      onlineUsers,
      joinRoom,
      leaveRoom,
      sendMessage,
      emitTyping,
      emitStopTyping,
    }}>
      {children}
    </SocketContext.Provider>
  );
};
