import { useState, useRef, useCallback } from 'react';
import { HiOutlinePaperAirplane, HiOutlinePhotograph, HiOutlinePaperClip } from 'react-icons/hi';
import { useSocket } from '../../context/SocketContext';
import { uploadAPI } from '../../services/api';
import { isImage } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './Chat.css';

const MessageInput = ({ currentRoom, onSendMessage }) => {
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { emitTyping, emitStopTyping } = useSocket();

  const handleTyping = useCallback(() => {
    if (!currentRoom) return;
    emitTyping(currentRoom._id);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(currentRoom._id);
    }, 2000);
  }, [currentRoom, emitTyping, emitStopTyping]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !currentRoom) return;

    onSendMessage(trimmed, 'text');
    setText('');

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      emitStopTyping(currentRoom._id);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await uploadAPI.uploadFile(formData);
      const msgType = isImage(data.url) ? 'image' : 'file';

      onSendMessage(text.trim() || '', msgType, data.url, file.name);
      setText('');
      toast.success('File uploaded!');
    } catch (error) {
      toast.error('Upload failed. Check your Cloudinary config.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!currentRoom) return null;

  return (
    <div className="message-input-container" id="message-input-container">
      <div className="message-input-wrapper">
        <button
          className="btn btn-ghost message-attach-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Attach file"
          id="attach-file-btn"
        >
          {uploading ? (
            <span className="btn-loader" style={{ width: 18, height: 18 }}></span>
          ) : (
            <HiOutlinePhotograph />
          )}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          accept="image/*,.pdf,.doc,.docx,.txt"
          id="file-input"
        />

        <textarea
          className="message-input"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          rows={1}
          id="message-text-input"
        />

        <button
          className="btn btn-primary message-send-btn"
          onClick={handleSend}
          disabled={!text.trim() || uploading}
          id="send-message-btn"
        >
          <HiOutlinePaperAirplane style={{ transform: 'rotate(90deg)' }} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
