import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineArrowRight } from 'react-icons/hi';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    const result = await login(email, password);
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
          <p className="auth-subtitle">Welcome back! Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" id="login-form">
          <div className="input-group">
            <label className="input-label" htmlFor="login-email">Email</label>
            <div className="input-wrapper">
              <HiOutlineMail className="input-icon" />
              <input
                id="login-email"
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
            <label className="input-label" htmlFor="login-password">Password</label>
            <div className="input-wrapper">
              <HiOutlineLockClosed className="input-icon" />
              <input
                id="login-password"
                type="password"
                className="input-field input-with-icon"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary auth-btn"
            disabled={loading || !email || !password}
            id="login-submit"
          >
            {loading ? (
              <span className="btn-loader"></span>
            ) : (
              <>
                Sign In
                <HiOutlineArrowRight />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register" id="go-to-register">Create one</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
