import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Lock, Phone, ShieldCheck, User, X } from 'lucide-react';
import CONFIG from '../config';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', mobile: '', password: '' });

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // Route to server for Auth
    const url = isLogin 
      ? `${CONFIG.API_BASE_URL}/realproperties/login` 
      : `${CONFIG.API_BASE_URL}/realproperties/signup`;
    const payload = isLogin
      ? { mobile: formData.mobile, password: formData.password }
      : formData;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      localStorage.setItem('realprop_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="sidebar-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-card"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="icon-circle-btn"
              style={{ position: 'absolute', top: '14px', right: '14px' }}
              title="Close"
            >
              <X size={18} />
            </button>

            <div className="modal-header">
              <span className="section-eyebrow">
                <ShieldCheck size={14} />
                Secure Access
              </span>
              <h2 className="modal-title">{isLogin ? 'Welcome back' : 'Create your account'}</h2>
              <p className="modal-copy">
                {isLogin
                  ? 'Sign in to post a property or manage the listings you already submitted.'
                  : 'Join the platform to submit your property and track it from one place.'}
              </p>
            </div>

            {error && <div className="status-banner error">{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.9rem', marginTop: '1rem' }}>
              {!isLogin && (
                <div className="input-shell">
                  <label htmlFor="auth-name">Full name</label>
                  <div className="input-control">
                    <User size={18} color="var(--accent)" />
                    <input
                      id="auth-name"
                      name="name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="input-shell">
                <label htmlFor="auth-mobile">Mobile number</label>
                <div className="input-control">
                  <Phone size={18} color="var(--accent)" />
                  <input
                    id="auth-mobile"
                    name="mobile"
                    type="text"
                    placeholder="Enter your mobile number"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-shell">
                <label htmlFor="auth-password">Password</label>
                <div className="input-control">
                  <Lock size={18} color="var(--accent)" />
                  <input
                    id="auth-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="icon-text-btn"
                    style={{ padding: '0 4px', color: 'var(--text-soft)', cursor: 'pointer', background: 'none', border: 'none' }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button disabled={loading} type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.4rem' }}>
                {loading ? <Loader2 className="spinner" size={18} /> : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', color: 'var(--text-soft)', textAlign: 'center', fontSize: '0.92rem' }}>
              {isLogin ? 'New here?' : 'Already have an account?'}{' '}
              <button
                type="button"
                className="text-link-btn"
                onClick={() => {
                  setIsLogin((prev) => !prev);
                  setError(null);
                  setFormData({ name: '', mobile: '', password: '' });
                }}
              >
                {isLogin ? 'Create one' : 'Sign in'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
