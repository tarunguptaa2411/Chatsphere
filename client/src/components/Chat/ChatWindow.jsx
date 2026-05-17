import { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { isSameDay, formatDate } from '../../utils/helpers';
import { HiOutlineChatAlt2 } from 'react-icons/hi';
import './Chat.css';

const ChatWindow = ({ messages, currentRoom, typingUsers, user, loadingMessages, hasMore, onLoadMore }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const prevMessagesLenRef = useRef(0);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > prevMessagesLenRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLenRef.current = messages.length;
  }, [messages]);

  // Handle scroll to load more
  const handleScroll = () => {
    if (!containerRef.current || !hasMore || loadingMessages) return;
    if (containerRef.current.scrollTop < 60) {
      onLoadMore();
    }
  };

  if (!currentRoom) {
    return (
      <div className="chat-window-empty">
        <div className="chat-empty-content animate-fade-in-up">
          <div className="chat-empty-icon-wrapper">
            <HiOutlineChatAlt2 className="chat-empty-icon" />
          </div>
          <h2>Welcome to ChatSphere</h2>
          <p>Select a room from the sidebar to start chatting, or create a new one!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window" id="chat-window">
      {/* Room header */}
      <div className="chat-window-header">
        <div className="chat-room-info">
          <h2 className="chat-room-name"># {currentRoom.name}</h2>
          {currentRoom.description && (
            <p className="chat-room-desc">{currentRoom.description}</p>
          )}
        </div>
        <div className="chat-room-members">
          <span className="chat-member-count">
            {currentRoom.members?.length || 0} members
          </span>
        </div>
      </div>

      {/* Messages area */}
      <div 
        className="chat-messages" 
        ref={containerRef}
        onScroll={handleScroll}
        id="chat-messages"
      >
        {loadingMessages && (
          <div className="chat-loading">
            <span className="btn-loader"></span>
            <span>Loading messages...</span>
          </div>
        )}

        {hasMore && !loadingMessages && (
          <button className="load-more-btn" onClick={onLoadMore}>
            Load older messages
          </button>
        )}

        {!loadingMessages && messages.length === 0 && (
          <div className="empty-state" style={{ paddingTop: '80px' }}>
            <div className="empty-state-icon">🎉</div>
            <div className="empty-state-title">No messages yet</div>
            <div className="empty-state-text">Be the first to say something!</div>
          </div>
        )}

        {messages.map((msg, index) => {
          const prevMsg = messages[index - 1];
          const showDateSep = !prevMsg || !isSameDay(prevMsg.createdAt, msg.createdAt);
          const isOwn = msg.sender?._id === user?._id;

          return (
            <div key={msg._id}>
              {showDateSep && (
                <div className="date-separator">
                  <span>{formatDate(msg.createdAt)}</span>
                </div>
              )}
              <MessageBubble message={msg} isOwn={isOwn} />
            </div>
          );
        })}

        {typingUsers.length > 0 && (
          <TypingIndicator users={typingUsers} />
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;
