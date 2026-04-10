import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="landing-footer" style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '5rem 1rem 2rem' }}>
      <div className="footer-content" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4rem' }}>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="footer-brand"
        >
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--primary)' }}>Wealth Associates</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '1.05rem' }}>
            Your Trusted Property Consultant creating a legacy of prosperity 
            across the finest locations in India. We aim to build trust through 
            transparency and excellence.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="footer-section"
        >
          <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-main)' }}>Regions Served</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <MapPin size={18} color="var(--primary)" /> <span>Andhra Pradesh</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <MapPin size={18} color="var(--primary)" /> <span>Telangana</span>
            </li>
          </ul>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="footer-section"
        >
          <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-main)' }}>Contact Us</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <li>
              <motion.a 
                whileHover={{ x: 5, color: "var(--primary)" }}
                href="tel:7796356789" 
                style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'color 0.2s' }}
              >
                <Phone size={18} /> <span>7796356789</span>
              </motion.a>
            </li>
            <li>
              <motion.a 
                whileHover={{ x: 5, color: "var(--primary)" }}
                href="mailto:wealthassociates.com@gmail.com" 
                style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'color 0.2s' }}
              >
                <Mail size={18} /> <span style={{ wordBreak: 'break-all' }}>wealthassociates.com@gmail.com</span>
              </motion.a>
            </li>
          </ul>
        </motion.div>

      </div>
      <div className="footer-bottom" style={{ maxWidth: '1200px', margin: '4rem auto 0', padding: '2rem 0', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>&copy; {new Date().getFullYear()} Wealth Associates. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
