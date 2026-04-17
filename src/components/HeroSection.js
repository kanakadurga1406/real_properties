import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, MapPin, Search, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

const heroImages = [
  'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1800&q=80'
];

const highlights = [
  {
    icon: <ShieldCheck size={16} />,
    title: 'Legal Clearance',
    copy: 'Every official project undergoes thorough legal vetting for peace of mind.'
  },
  {
    icon: <TrendingUp size={16} />,
    title: 'High ROI Potential',
    copy: 'Strategic locations in growth corridors ensure maximum appreciation for your investment.'
  },
  {
    icon: <BadgeCheck size={16} />,
    title: 'Verified Owners',
    copy: 'Direct interaction with authentic owners and developers reduces middleman friction.'
  }
];

const HeroSection = ({ onExplore, onSearch }) => {
  const [searchValue, setSearchValue] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % heroImages.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = searchValue.trim();
    if (trimmed) {
      onSearch(trimmed);
      return;
    }
    onExplore();
  };

  return (
    <section id="home" className="hero-section">
      <div className="section-container">
        <div className="hero-shell">
          <div className="hero-visual-layer">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIdx}
                className="hero-bg-frame"
                style={{ backgroundImage: `url(${heroImages[currentIdx]})` }}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
              />
            </AnimatePresence>
            <div className="hero-overlay-depth" />
          </div>

          <div className="hero-content">
            <motion.div
              className="hero-copy-panel"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
            >


              <h1 className="hero-title">
                Connecting you to verified property opportunities across Telugu States.
              </h1>

              <p className="hero-subtitle">
                Browse premium plots, villas, and apartments with full legal clearance and transparent pricing. 
                Post your own listings and reach thousands of verified buyers through our trusted platform.
              </p>

              <form className={`hero-command-center ${isFocused ? 'focused' : ''}`} onSubmit={handleSubmit}>
                <div className="command-icon">
                  <MapPin size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search by locality, district, landmark, or property type"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
                <button type="submit" className="btn-primary command-btn">
                  <Search size={16} />
                  Search Now
                </button>
              </form>

              <div className="hero-cta-row">
                <button type="button" className="btn-outline" onClick={onExplore}>
                  Explore Listings
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="hero-spatial-stats">
                {[
                  { value: '500+', label: 'Verified Listings' },
                  { value: '10k+', label: 'Registered Buyers' },
                  { value: '24/7', label: 'Support Available' }
                ].map((item) => (
                  <div key={item.label} className="spatial-stat-item">
                    <span className="stat-val">{item.value}</span>
                    <span className="stat-label">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.aside
              className="hero-side-panel"
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12, ease: 'easeOut' }}
            >
              <h3 className="hero-side-headline">The Real Properties Advantage</h3>
              <p className="hero-side-copy">
                We simplify the real estate journey by providing cleared titles, market insights, and direct connections 
                between owners and serious buyers across key growth corridors.
              </p>

              <div className="hero-highlights">
                {highlights.map((item) => (
                  <div key={item.title} className="hero-highlight">
                    <div className="hero-highlight-bullet">{item.icon}</div>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.copy}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hero-trust-strip">
                {[
                  ['Inventory', 'Plots, villas, apartments'],
                  ['Locations', 'Andhra, Telangana, Bengaluru'],
                  ['Trust', 'Legal clearance guaranteed'],
                  ['Support', 'Direct inquiry ready']
                ].map(([label, value]) => (
                  <div key={label} className="trust-chip">
                    <span className="trust-chip-label">{label}</span>
                    <span className="trust-chip-value">{value}</span>
                  </div>
                ))}
              </div>
            </motion.aside>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
