import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/Layout/Navbar';
import RoomList from '../components/Sidebar/RoomList';
import OnlineUsers from '../components/Sidebar/OnlineUsers';
import ChatWindow from '../components/Chat/ChatWindow';
import MessageInput from '../components/Chat/MessageInput';
import useChat from '../hooks/useChat';
import { HiOutlineMenuAlt2 } from 'react-icons/hi';
import '../components/Layout/Layout.css';

const ChatPage = () => {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const {
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
  } = useChat();

  const handleSelectRoom = (room) => {
    selectRoom(room);
    setSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      <Navbar />

      <div className="app-main">
        {/* Sidebar overlay for mobile */}
        <div 
          className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <div className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <RoomList
            rooms={rooms}
            currentRoom={currentRoom}
            onSelectRoom={handleSelectRoom}
            onCreateRoom={createRoom}
            onJoinRoom={joinRoomAPI}
            loading={loadingRooms}
          />
        </div>

        {/* Chat area */}
        <div className="app-chat">
          <ChatWindow
            messages={messages}
            currentRoom={currentRoom}
            typingUsers={typingUsers}
            user={user}
            loadingMessages={loadingMessages}
            hasMore={hasMoreMessages}
            onLoadMore={loadMore}
          />
          <MessageInput
            currentRoom={currentRoom}
            onSendMessage={sendMessage}
          />
        </div>

        {/* Online users panel */}
        <div className="app-users">
          <OnlineUsers onlineUsers={onlineUsers} />
        </div>
      </div>

      {/* Mobile sidebar toggle */}
      <button
        className="mobile-sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        id="mobile-menu-btn"
      >
        <HiOutlineMenuAlt2 />
      </button>
    </div>
  );
};

export default ChatPage;
