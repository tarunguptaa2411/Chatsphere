import { useState } from 'react';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineHashtag } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import CreateRoomModal from './CreateRoomModal';
import { truncate, timeAgo } from '../../utils/helpers';
import './Sidebar.css';

const RoomList = ({ rooms, currentRoom, onSelectRoom, onCreateRoom, onJoinRoom, loading }) => {
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(search.toLowerCase())
  );

  const isMember = (room) => {
    return room.members?.some(m => 
      (typeof m === 'object' ? m._id : m) === user?._id
    );
  };

  return (
    <div className="room-list" id="room-list">
      <div className="room-list-header">
        <h2 className="room-list-title">Rooms</h2>
        <button 
          className="btn btn-icon btn-ghost room-create-btn"
          onClick={() => setShowCreateModal(true)}
          title="Create Room"
          id="create-room-btn"
        >
          <HiOutlinePlus />
        </button>
      </div>

      <div className="room-search">
        <HiOutlineSearch className="room-search-icon" />
        <input
          type="text"
          placeholder="Search rooms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="room-search-input"
          id="room-search-input"
        />
      </div>

      <div className="room-items">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="room-item-skeleton">
              <div className="skeleton skeleton-avatar" style={{ width: 36, height: 36 }}></div>
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-text" style={{ width: '70%' }}></div>
                <div className="skeleton skeleton-text short" style={{ width: '40%' }}></div>
              </div>
            </div>
          ))
        ) : filteredRooms.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 16px' }}>
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">No rooms found</div>
            <div className="empty-state-text">
              {search ? 'Try a different search' : 'Create a room to get started!'}
            </div>
          </div>
        ) : (
          filteredRooms.map(room => (
            <div
              key={room._id}
              className={`room-item ${currentRoom?._id === room._id ? 'active' : ''}`}
              onClick={() => {
                if (isMember(room)) {
                  onSelectRoom(room);
                } else {
                  onJoinRoom(room._id);
                }
              }}
              id={`room-${room._id}`}
            >
              <div className="room-item-icon">
                <HiOutlineHashtag />
              </div>
              <div className="room-item-info">
                <div className="room-item-name">{room.name}</div>
                <div className="room-item-meta">
                  {room.description ? truncate(room.description, 35) : `${room.members?.length || 0} members`}
                </div>
              </div>
              {!isMember(room) && (
                <span className="room-join-badge">Join</span>
              )}
              {room.updatedAt && isMember(room) && (
                <span className="room-item-time">{timeAgo(room.updatedAt)}</span>
              )}
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onCreate={async (name, desc) => {
            await onCreateRoom(name, desc);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default RoomList;
