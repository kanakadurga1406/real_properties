import React from 'react';
import { Play, Apple } from 'lucide-react';
import { motion } from 'framer-motion';

const AppDownloadSection = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="app-download-section" style={{ background: 'var(--bg-color)', padding: '5rem 1rem' }}>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="download-content glass-panel" 
        style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem', textAlign: 'center' }}
      >
        <motion.h2 variants={itemVariants} className="download-title" style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
          Experience Wealth Associates <span style={{ color: 'var(--primary)' }}>on the Go</span>
        </motion.h2>
        <motion.p variants={itemVariants} className="download-subtitle" style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '700px', margin: '0 auto 3rem' }}>
          Get seamless, real-time access to our exclusive real estate portfolio and expert panel directly from your mobile device. Stay ahead in the market with instant notifications.
        </motion.p>
        <motion.div variants={itemVariants} className="download-buttons" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.a 
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(99, 102, 241, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            href="https://play.google.com/store/apps/details?id=com.wealthassociates.alpha" 
            target="_blank" 
            rel="noreferrer" 
            className="store-btn google-play"
            style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-color)', padding: '0.8rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'var(--text-main)' }}
          >
            <Play size={28} />
            <div className="store-text" style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '0.7rem', display: 'block', opacity: 0.7, fontWeight: '500' }}>GET IT ON</span>
              <strong style={{ fontSize: '1.2rem', fontWeight: '700' }}>Google Play</strong>
            </div>
          </motion.a>
          <motion.a 
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(255, 255, 255, 0.2)" }}
            whileTap={{ scale: 0.95 }}
            href="https://apps.apple.com/us/app/wealth-associate/id6743356719" 
            target="_blank" 
            rel="noreferrer" 
            className="store-btn app-store"
            style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-color)', padding: '0.8rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'var(--text-main)' }}
          >
            <Apple size={32} />
            <div className="store-text" style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '0.7rem', display: 'block', opacity: 0.7, fontWeight: '500' }}>Download on the</span>
              <strong style={{ fontSize: '1.2rem', fontWeight: '700' }}>App Store</strong>
            </div>
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default AppDownloadSection;
