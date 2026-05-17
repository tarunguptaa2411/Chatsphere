import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineArrowRight } from 'react-icons/hi';
import './Auth.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(username, email, password);
    setLoading(false);

    if (result.success) {
      navigate('/chat');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-orb auth-bg-orb-1"></div>
        <div className="auth-bg-orb auth-bg-orb-2"></div>
        <div className="auth-bg-orb auth-bg-orb-3"></div>
      </div>

      <div className="auth-container animate-scale-in">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-logo-icon">💬</span>
            <h1>ChatSphere</h1>
          </div>
          <p className="auth-subtitle">Create your account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" id="register-form">
          <div className="input-group">
            <label className="input-label" htmlFor="register-username">Username</label>
            <div className="input-wrapper">
              <HiOutlineUser className="input-icon" />
              <input
                id="register-username"
                type="text"
                className="input-field input-with-icon"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={30}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="register-email">Email</label>
            <div className="input-wrapper">
              <HiOutlineMail className="input-icon" />
              <input
                id="register-email"
                type="email"
                className="input-field input-with-icon"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="register-password">Password</label>
            <div className="input-wrapper">
              <HiOutlineLockClosed className="input-icon" />
              <input
                id="register-password"
                type="password"
                className="input-field input-with-icon"
                placeholder="Create a password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="register-confirm">Confirm Password</label>
            <div className="input-wrapper">
              <HiOutlineLockClosed className="input-icon" />
              <input
                id="register-confirm"
                type="password"
                className="input-field input-with-icon"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary auth-btn"
            disabled={loading || !username || !email || !password || !confirmPassword}
            id="register-submit"
          >
            {loading ? (
              <span className="btn-loader"></span>
            ) : (
              <>
                Create Account
                <HiOutlineArrowRight />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" id="go-to-login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
