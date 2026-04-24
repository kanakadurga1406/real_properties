import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, LogOut, Menu, Moon, Plus, Sun, User, X } from 'lucide-react';

const navLinks = [
  { name: 'Home', id: 'home' },
  { name: 'Listings', id: 'properties' },
  { name: 'Projects', id: 'network' },
  { name: 'Why Us', id: 'features' },
  { name: 'Contact', id: 'contact' }
];

const Navbar = ({ onExplore, hidePostBtn = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const storedUser = localStorage.getItem('realprop_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const handleAuthChange = () => {
      const nextUser = localStorage.getItem('realprop_user');
      setUser(nextUser ? JSON.parse(nextUser) : null);
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 18);
      const sections = ['contact', 'properties', 'network', 'features', 'home'];
      const current = sections.find((id) => {
        const element = document.getElementById(id);
        return element && window.scrollY >= element.offsetTop - 180;
      });
      if (current) {
        setActiveTab(current);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('app-theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleNavClick = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
    if (id === 'properties' && onExplore) {
      onExplore();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('realprop_user');
    setUser(null);
    setMobileMenuOpen(false);
    window.dispatchEvent(new CustomEvent('authChange'));
    window.dispatchEvent(new CustomEvent('switchView', { detail: 'home' }));
  };

  // Fires openPostProperty event — LandingPage handles the auth + subscription check
  const openPostFlow = () => {
    setMobileMenuOpen(false);
    window.dispatchEvent(new CustomEvent('openPostProperty'));
  };

  return (
    <>
      <motion.nav
        initial={{ y: -24, x: '-50%', opacity: 0 }}
        animate={{ y: 0, x: '-50%', opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className={`navbar ${scrolled ? 'scrolled' : ''}`}
      >
        <div className="navbar-container">
          <div className="navbar-logo" onClick={() => handleNavClick('home')}>
            <div className="logo-icon-wrap">
              <Building2 size={22} />
            </div>
            <span className="logo-text">RealProperties</span>
          </div>

          <div className="navbar-links desktop-only">
            {navLinks.map((link) => (
              <motion.button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`nav-link ${activeTab === link.id ? 'active' : ''}`}
              >
                {activeTab === link.id && <motion.div layoutId="nav-indicator" className="nav-link-indicator" />}
                <span style={{ position: 'relative', zIndex: 1 }}>{link.name}</span>
              </motion.button>
            ))}
          </div>

          <div className="navbar-cta">
            <button className="theme-toggle desktop-only" onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <>
                {!hidePostBtn && (
                  <button onClick={openPostFlow} className="btn-primary desktop-only" style={{ paddingInline: '1.1rem' }}>
                    <Plus size={16} />
                    Post Property
                  </button>
                )}
                <div
                  className="account-chip desktop-only"
                  onClick={() => window.dispatchEvent(new CustomEvent('switchView', { detail: 'my_properties' }))}
                >
                  <div className="account-chip-avatar">
                    <User size={17} />
                  </div>
                  <span className="account-chip-name">{user.name?.split(' ')[0] || 'Account'}</span>
                </div>
                <button className="theme-toggle desktop-only" onClick={handleLogout} title="Logout">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openAuth'))}
                className="btn-primary desktop-only"
              >
                Sign In
              </button>
            )}

            <button className="mobile-toggle hide-desktop" onClick={() => setMobileMenuOpen((prev) => !prev)}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mobile-menu-panel v2-surface-raised"
          >
            <div className="mobile-menu-links">
              {navLinks.map((link) => (
                <button key={link.id} className="nav-link" onClick={() => handleNavClick(link.id)}>
                  {link.name}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gap: '0.7rem', marginTop: '1rem' }}>
              {user ? (
                <>
                  {!hidePostBtn && (
                    <button className="btn-primary" onClick={openPostFlow}>
                      <Plus size={16} />
                      Post Property
                    </button>
                  )}
                  <button
                    className="btn-outline"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.dispatchEvent(new CustomEvent('switchView', { detail: 'my_properties' }));
                    }}
                  >
                    <User size={16} />
                    My Properties
                  </button>
                  <button className="btn-outline" onClick={handleLogout}>
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  className="btn-primary"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('openAuth'));
                  }}
                >
                  Sign In
                </button>
              )}

              <button className="btn-outline" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
