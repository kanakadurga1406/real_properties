import React, { useState, useEffect } from 'react';
import { Menu, X, Building2, Home, Star, Map, Phone, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onExplore }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      const sections = ['home', 'features', 'properties', 'contact'];
      for (const section of sections.slice().reverse()) {
         const el = document.getElementById(section);
         if (el && window.scrollY >= (el.offsetTop - 250)) {
            setActiveTab(section);
            break;
         }
      }
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', id: 'home', icon: <Home size={18} /> },
    { name: 'Features', id: 'features', icon: <Star size={18} /> },
    { name: 'Properties', id: 'properties', icon: <Map size={18} /> },
    { name: 'Contact', id: 'contact', icon: <Phone size={18} /> },
  ];

  const handleNavClick = (id) => {
    document.getElementById(id)?.scrollIntoView({behavior: 'smooth'});
    setMobileMenuOpen(false);
  };

  return (
    <>
      <style>{`
        .nav-link.active {
          color: var(--primary) !important;
          font-weight: 700;
        }
        .nav-link-indicator {
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--primary);
          border-radius: 2px;
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.8);
        }
        .navbar-scrolled {
          background: var(--navbar-bg-scrolled) !important;
          backdrop-filter: blur(16px) !important;
          border-bottom: 1px solid var(--border-color) !important;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
        }
        .logo-text {
          background: linear-gradient(135deg, var(--text-main) 0%, var(--primary) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}
      >
        <div className="navbar-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="navbar-logo" 
            onClick={() => handleNavClick('home')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          >
             <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)', padding: '8px', borderRadius: '12px', color: 'white' }}>
               <Building2 size={24} className="logo-icon" />
             </div>
             <span className="logo-text" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Real Properties</span>
          </motion.div>

          {/* Desktop Nav */}
          <div className="navbar-links desktop-only" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
            {navLinks.map((link) => (
              <motion.button 
                key={link.id} 
                whileHover={{ y: -2 }}
                className={`nav-link ${activeTab === link.id ? 'active' : ''}`} 
                onClick={() => handleNavClick(link.id)}
                style={{ 
                  position: 'relative', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  background: 'none', 
                  border: 'none', 
                  color: scrolled ? 'var(--text-main)' : '#ffffff', 
                  fontSize: '1rem', 
                  cursor: 'pointer', 
                  opacity: activeTab === link.id ? 1 : 0.8, 
                  transition: 'all 0.2s' 
                }}
              >
                {link.icon}
                <span>{link.name}</span>
                {activeTab === link.id && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className="nav-link-indicator"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          <div className="navbar-cta desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <motion.button 
               whileHover={{ scale: 1.1, rotate: 15 }}
               whileTap={{ scale: 0.9 }}
               onClick={toggleTheme}
               style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(8px)' }}
               aria-label="Toggle theme"
             >
               {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </motion.button>
             <motion.button 
               whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(99, 102, 241, 0.5)", backgroundColor: 'var(--primary-hover)' }}
               whileTap={{ scale: 0.95 }}
               className="btn-primary" 
               onClick={() => handleNavClick('properties')}
               style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '50px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
             >
               Explore Properties
             </motion.button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="mobile-toggle hide-desktop" style={{ display: 'none' }}>
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mobile-btn" style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
             </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mobile-menu mobile-menu-open"
            style={{ position: 'fixed', top: '70px', left: 0, right: 0, background: 'var(--navbar-bg-scrolled)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-color)', zIndex: 998, display: 'flex', flexDirection: 'column', padding: '2rem', gap: '1.5rem', overflow: 'hidden' }}
          >
             {navLinks.map((link) => (
                <motion.button 
                  key={link.id} 
                  whileTap={{ scale: 0.95 }}
                  className={`mobile-nav-link ${activeTab === link.id ? 'active' : ''}`} 
                  onClick={() => handleNavClick(link.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 500, padding: '0.5rem 0', width: '100%', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}
                >
                  <span style={{ color: activeTab === link.id ? 'var(--primary)' : 'var(--text-muted)' }}>{link.icon}</span>
                  {link.name}
                </motion.button>
             ))}
             <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
               <motion.button 
                 whileTap={{ scale: 0.95 }}
                 onClick={toggleTheme}
                 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', padding: '0.75rem', borderRadius: '50px', cursor: 'pointer', flex: 1, fontSize: '1rem' }}
               >
                 {theme === 'dark' ? <><Sun size={18}/> Light Mode</> : <><Moon size={18}/> Dark Mode</>}
               </motion.button>
             </div>
             <motion.button 
               whileTap={{ scale: 0.95 }}
               className="btn-primary" 
               onClick={() => handleNavClick('properties')}
               style={{ width: '100%', padding: '0.8rem' }}
             >
               View Approved Properties
             </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
