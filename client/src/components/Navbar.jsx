import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Search, Map, BarChart3, UserCircle, Menu, X, Zap, LogOut } from 'lucide-react';
import { useUser } from '../context/UserContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/analysis', label: 'Gap Analysis', icon: Search },
  { path: '/dsa', label: 'DSA Tracker', icon: BarChart3 },
  { path: '/roadmap', label: 'Roadmap', icon: Map },
  { path: '/profile', label: 'Profile', icon: UserCircle },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { logout, user } = useUser();

  return (
    <>
      <nav className="navbar">
        <NavLink to="/" className="navbar-brand">
          <Zap size={22} className="navbar-brand-icon" />
          <span className="gradient-text navbar-brand-text">GetHired</span>
        </NavLink>

        {/* Desktop Nav */}
        <div className="navbar-links">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
          <button 
            onClick={logout}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              background: 'rgba(239, 68, 68, 0.1)', border: 'none',
              color: '#f87171', padding: '0.5rem 1rem', borderRadius: '0.5rem',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', marginLeft: '1rem'
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="navbar-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="navbar-mobile-drawer"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `navbar-mobile-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
            <button 
              onClick={() => { logout(); setMobileOpen(false); }}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.75rem', 
                width: '100%', background: 'rgba(239, 68, 68, 0.1)', border: 'none',
                color: '#f87171', padding: '1rem', borderRadius: '0.75rem',
                cursor: 'pointer', fontSize: '1rem', fontWeight: '600', marginTop: '1rem'
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
