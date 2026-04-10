import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const heroImages = [
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
];

const HeroSection = ({ onExplore, onSearch }) => {
  const [searchValue, setSearchValue] = useState("");
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-cycle hero images every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchValue.trim();
    if (term) {
      onSearch(term);   
    } else {
      onExplore();      
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background Image Carousel with absolute positioning */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIdx}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="hero-bg-image"
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundImage: `url(${heroImages[currentImageIdx]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </AnimatePresence>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)' }} />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="hero-content"
        style={{ position: 'relative', zIndex: 10 }}
      >
        <motion.p variants={itemVariants} className="hero-eyebrow" style={{ display: 'inline-block', padding: '0.5rem 1.5rem', background: 'rgba(99, 102, 241, 0.3)', border: '1px solid rgba(99, 102, 241, 0.5)', borderRadius: '100px', color: '#c7d2fe', fontWeight: '600', marginBottom: '2rem', backdropFilter: 'blur(10px)' }}>
          TRUSTED PROPERTY CONSULTANTS
        </motion.p>
        
        <h1 className="hero-title" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', color: '#ffffff' }}>
          {"Find Your Perfect Property, Faster.".split(" ").map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.1, ease: "easeOut" }}
              style={{ color: '#ffffff' }}
            >
              {word}
            </motion.span>
          ))}
        </h1>
        
        <motion.p variants={itemVariants} className="hero-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>
          Discover 100% approved residential & commercial real estate across Andhra Pradesh and Telangana.
        </motion.p>

        <motion.form 
          variants={itemVariants}
          className="zillow-search-container" 
          onSubmit={handleSearch}
        >
          <motion.div 
            animate={{ 
              scale: isFocused ? 1.02 : 1,
              boxShadow: isFocused ? "0 20px 40px rgba(0,0,0,0.3)" : "0 10px 30px rgba(0,0,0,0.25)"
            }}
            className="zillow-search-bar"
          >
            <input 
              type="text" 
              className="zillow-search-input" 
              placeholder="Search by location, city or property type..."
              value={searchValue}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{ color: '#ffffff' }}
            />
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="submit" 
              className="zillow-search-btn" 
              aria-label="Search properties"
            >
              <Search size={22} strokeWidth={2.5} />
            </motion.button>
          </motion.div>
        </motion.form>
        
        {/* Carousel dots */}
        <motion.div variants={itemVariants} className="hero-dots" style={{ display: 'flex', gap: '1rem', marginTop: '3rem' }}>
          {heroImages.map((_, i) => (
            <motion.div
              key={i}
              onClick={() => setCurrentImageIdx(i)}
              animate={{ 
                width: currentImageIdx === i ? 40 : 12,
                backgroundColor: currentImageIdx === i ? 'var(--primary)' : 'rgba(255,255,255,0.3)'
              }}
              style={{ height: '12px', borderRadius: '6px', cursor: 'pointer' }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
