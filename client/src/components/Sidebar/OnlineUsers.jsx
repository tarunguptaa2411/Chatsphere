import { useSocket } from '../../context/SocketContext';
import './Sidebar.css';

const OnlineUsers = ({ onlineUsers }) => {
  return (
    <div className="online-users" id="online-users-panel">
      <div className="online-users-header">
        <h3>Online</h3>
        <span className="online-count">{onlineUsers.length}</span>
      </div>

      <div className="online-users-list">
        {onlineUsers.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 12px' }}>
            <div className="empty-state-icon" style={{ fontSize: '2rem' }}>👻</div>
            <div className="empty-state-text">No one else is online</div>
          </div>
        ) : (
          onlineUsers.map((user) => (
            <div key={user.userId} className="online-user-item animate-fade-in">
              <div className="avatar-status online">
                <img 
                  src={user.avatar} 
                  alt={user.username}
                  className="avatar avatar-sm"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=7c3aed&color=fff&size=32`;
                  }}
                />
              </div>
              <span className="online-user-name">{user.username}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OnlineUsers;
