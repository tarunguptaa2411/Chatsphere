import { useState } from 'react';
import { HiOutlineX } from 'react-icons/hi';

const CreateRoomModal = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onCreate(name.trim(), description.trim());
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="create-room-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Room</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} id="close-modal-btn">
            <HiOutlineX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="room-name-input">Room Name</label>
            <input
              id="room-name-input"
              type="text"
              className="input-field"
              placeholder="e.g., General, Gaming, Tech Talk"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={50}
              autoFocus
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="room-desc-input">Description (optional)</label>
            <input
              id="room-desc-input"
              type="text"
              className="input-field"
              placeholder="What's this room about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ flex: 1 }}
              disabled={loading || !name.trim()}
              id="submit-room-btn"
            >
              {loading ? <span className="btn-loader"></span> : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
