import './Chat.css';

const TypingIndicator = ({ users }) => {
  if (!users || users.length === 0) return null;

  const text = users.length === 1
    ? `${users[0].username} is typing`
    : users.length === 2
    ? `${users[0].username} and ${users[1].username} are typing`
    : `${users[0].username} and ${users.length - 1} others are typing`;

  return (
    <div className="typing-indicator animate-fade-in" id="typing-indicator">
      <div className="typing-dots">
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
      </div>
      <span className="typing-text">{text}</span>
    </div>
  );
};

export default TypingIndicator;
