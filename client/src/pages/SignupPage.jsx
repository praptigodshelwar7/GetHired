import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const SignupPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signup(formData.username, formData.email, formData.password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 80px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <motion.div 
        className="glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Join GetHired</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Create your account to start tracking</p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: '#f87171', 
            padding: '0.75rem', 
            borderRadius: '0.5rem', 
            fontSize: '0.8rem', 
            marginBottom: '1.5rem',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                required
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                placeholder="Pick a username"
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 3rem',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                  borderRadius: '0.75rem', color: 'white', outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 3rem',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                  borderRadius: '0.75rem', color: 'white', outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a password"
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 3rem',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                  borderRadius: '0.75rem', color: 'white', outline: 'none'
                }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <>Create Account <ArrowRight size={18} /></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
