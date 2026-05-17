import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { chatAPI } from '../services/api';
import toast from 'react-hot-toast';

const useChat = () => {
  const { socket, joinRoom, leaveRoom, sendMessage: socketSendMessage } = useSocket();
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const typingTimeoutRef = useRef(null);
  const currentRoomRef = useRef(null);

  // Keep ref in sync
  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  // Fetch rooms
  const fetchRooms = useCallback(async () => {
    try {
      setLoadingRooms(true);
      const { data } = await chatAPI.getRooms();
      setRooms(data);
    } catch (error) {
      toast.error('Failed to load rooms');
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  // Fetch messages for a room
  const fetchMessages = useCallback(async (roomId, page = 1) => {
    try {
      setLoadingMessages(true);
      const { data } = await chatAPI.getMessages(roomId, page);
      if (page === 1) {
        setMessages(data.messages);
      } else {
        setMessages(prev => [...data.messages, ...prev]);
      }
      setHasMoreMessages(data.hasMore);
      setCurrentPage(data.currentPage);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Select a room
  const selectRoom = useCallback(async (room) => {
    // Leave previous room
    if (currentRoomRef.current) {
      leaveRoom(currentRoomRef.current._id);
    }

    setCurrentRoom(room);
    setMessages([]);
    setTypingUsers([]);
    setCurrentPage(1);

    // Join new room
    joinRoom(room._id);

    // Fetch messages
    await fetchMessages(room._id, 1);
  }, [joinRoom, leaveRoom, fetchMessages]);

  // Load more messages
  const loadMore = useCallback(async () => {
    if (!currentRoom || !hasMoreMessages || loadingMessages) return;
    await fetchMessages(currentRoom._id, currentPage + 1);
  }, [currentRoom, hasMoreMessages, loadingMessages, currentPage, fetchMessages]);

  // Send message
  const sendMessage = useCallback((content, messageType = 'text', fileUrl = '', fileName = '') => {
    if (!currentRoom) return;
    socketSendMessage({
      roomId: currentRoom._id,
      content,
      messageType,
      fileUrl,
      fileName,
    });
  }, [currentRoom, socketSendMessage]);

  // Create a room
  const createRoom = useCallback(async (name, description) => {
    try {
      const { data } = await chatAPI.createRoom({ name, description });
      setRooms(prev => [data, ...prev]);
      toast.success(`Room "${name}" created!`);
      return data;
    } catch (error) {
      toast.error('Failed to create room');
      return null;
    }
  }, []);

  // Join a room via API
  const joinRoomAPI = useCallback(async (roomId) => {
    try {
      const { data } = await chatAPI.joinRoom(roomId);
      setRooms(prev => prev.map(r => r._id === roomId ? data : r));
      toast.success(`Joined "${data.name}"`);
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to join room';
      toast.error(msg);
      return null;
    }
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.room === currentRoomRef.current?._id) {
        setMessages(prev => [...prev, message]);
      }
    };

    const handleUserTyping = ({ userId, username, roomId }) => {
      if (roomId === currentRoomRef.current?._id) {
        setTypingUsers(prev => {
          if (prev.find(u => u.userId === userId)) return prev;
          return [...prev, { userId, username }];
        });
      }
    };

    const handleUserStopTyping = ({ userId, roomId }) => {
      if (roomId === currentRoomRef.current?._id) {
        setTypingUsers(prev => prev.filter(u => u.userId !== userId));
      }
    };

    const handleUserJoined = ({ username, roomId }) => {
      if (roomId === currentRoomRef.current?._id) {
        toast(`${username} joined the room`, { icon: '👋' });
      }
    };

    const handleUserLeft = ({ username, roomId }) => {
      if (roomId === currentRoomRef.current?._id) {
        toast(`${username} left the room`, { icon: '👋' });
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);
    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
    };
  }, [socket]);

  // Load rooms on mount
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return {
    rooms,
    currentRoom,
    messages,
    typingUsers,
    loadingRooms,
    loadingMessages,
    hasMoreMessages,
    selectRoom,
    sendMessage,
    createRoom,
    joinRoomAPI,
    loadMore,
    fetchRooms,
  };
};

export default useChat;
