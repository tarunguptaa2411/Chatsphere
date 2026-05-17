import { formatTime, isImage } from '../../utils/helpers';
import './Chat.css';

const MessageBubble = ({ message, isOwn }) => {
  const { sender, content, messageType, fileUrl, fileName, createdAt } = message;

  return (
    <div className={`message-bubble ${isOwn ? 'own' : 'other'} animate-fade-in`}>
      {!isOwn && (
        <img
          src={sender?.avatar}
          alt={sender?.username}
          className="avatar avatar-sm message-avatar"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(sender?.username || '?')}&background=7c3aed&color=fff&size=32`;
          }}
        />
      )}
      <div className={`message-content ${isOwn ? 'own' : 'other'}`}>
        {!isOwn && (
          <span className="message-sender">{sender?.username}</span>
        )}

        {/* Text message */}
        {messageType === 'text' && content && (
          <p className="message-text">{content}</p>
        )}

        {/* Image message */}
        {messageType === 'image' && fileUrl && (
          <div className="message-image-wrapper">
            {content && <p className="message-text">{content}</p>}
            <img
              src={fileUrl}
              alt="Shared image"
              className="message-image"
              loading="lazy"
              onClick={() => window.open(fileUrl, '_blank')}
            />
          </div>
        )}

        {/* File message */}
        {messageType === 'file' && fileUrl && (
          <div className="message-file">
            {content && <p className="message-text">{content}</p>}
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="message-file-link">
              <span className="message-file-icon">📎</span>
              <span className="message-file-name">{fileName || 'Download File'}</span>
            </a>
          </div>
        )}

        <span className="message-time">{formatTime(createdAt)}</span>
      </div>
    </div>
  );
};

export default MessageBubble;
