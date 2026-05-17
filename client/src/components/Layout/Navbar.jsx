import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { HiOutlineLogout, HiOutlineStatusOnline } from 'react-icons/hi';
import './Layout.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();

  return (
    <nav className="navbar" id="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">💬</span>
        <h1 className="navbar-title">ChatSphere</h1>
      </div>

      <div className="navbar-right">
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <HiOutlineStatusOnline />
          <span>{isConnected ? 'Connected' : 'Reconnecting...'}</span>
        </div>

        <div className="navbar-user">
          <img
            src={user?.avatar}
            alt={user?.username}
            className="avatar avatar-sm"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || '?')}&background=7c3aed&color=fff&size=32`;
            }}
          />
          <span className="navbar-username">{user?.username}</span>
        </div>

        <button 
          className="btn btn-ghost navbar-logout" 
          onClick={logout}
          title="Logout"
          id="logout-btn"
        >
          <HiOutlineLogout />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
