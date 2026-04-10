import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Phone, Home, Loader2, AlertCircle, Search, Filter, ChevronRight, ChevronLeft, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// Reusable Image Carousel Component
const ImageCarousel = ({ images, altText, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState({});

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };
  
  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className={`carousel-wrapper ${className || ''}`}>
      <motion.div 
        className="carousel-track" 
        animate={{ x: `-${currentIndex * 100}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {images.map((img, idx) => (
          <div key={idx} className={`carousel-slide ${!loaded[idx] ? 'shimmer-loading' : ''}`}>
            <img 
              src={img} 
              alt={`${altText} ${idx + 1}`} 
              onLoad={() => setLoaded(prev => ({...prev, [idx]: true}))}
              onError={(e) => { 
                e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Image+Unavailable'; 
                setLoaded(prev => ({...prev, [idx]: true})); 
              }}
            />
          </div>
        ))}
      </motion.div>
      
      {images.length > 1 && (
        <>
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: "white" }}
            whileTap={{ scale: 0.9 }}
            className="carousel-btn left" 
            onClick={prevSlide} 
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: "white" }}
            whileTap={{ scale: 0.9 }}
            className="carousel-btn right" 
            onClick={nextSlide} 
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </motion.button>
          <div className="carousel-dots" onClick={(e) => e.stopPropagation()}>
            {images.map((_, idx) => (
              <motion.span 
                key={idx} 
                className={`dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                animate={{ scale: idx === currentIndex ? 1.2 : 1 }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

function PropertiesPage({ heroSearchTerm = '' }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  // Init filters from URL so Google can index filtered pages
  const urlParams = new URLSearchParams(window.location.search);

  const [searchTerm, setSearchTerm] = useState(urlParams.get('search') || '');
  const [selectedType, setSelectedType] = useState(urlParams.get('type') || 'All');
  const [priceRange, setPriceRange] = useState(urlParams.get('budget') || 'All');
  
  // Pagination State
  const [visibleCount, setVisibleCount] = useState(6);

  // Sync filter changes to URL (for SEO + shareability)
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedType !== 'All') params.set('type', selectedType);
    if (priceRange !== 'All') params.set('budget', priceRange);
    const newUrl = params.toString() ? `${window.location.pathname}?${params}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [searchTerm, selectedType, priceRange]);

  // Selected Property for Sidebar Drawer
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (selectedProperty) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedProperty]);

  // Sync search term when user types in the hero banner search bar
  useEffect(() => {
    if (heroSearchTerm) {
      setSearchTerm(heroSearchTerm);
      setVisibleCount(6); // reset pagination
    }
  }, [heroSearchTerm]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('https://api.wealthassociate.in/properties/getApproveProperty');
        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }
        const data = await response.json();
        const propertiesData = Array.isArray(data) ? data : (data.properties || []);
        
        // Sort properties to show the newest/latest ones first
        propertiesData.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        
        setProperties(propertiesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Compute unique dropdown options
  const propertyTypes = useMemo(() => {
    const types = new Set(properties.map(p => p.propertyType).filter(Boolean));
    return ['All', ...Array.from(types)];
  }, [properties]);

  // Derived filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      let searchMatch = true;
      if (searchTerm) {
        const q = searchTerm.toLowerCase().trim();

        // All the fields we want to search across
        const searchableFields = [
          prop.location,
          prop.district,
          prop.constituency,
          prop.mandal,
          prop.village,
          prop.propertyType,
          prop.PostedUserType,
          // Also search inside dynamicData values (e.g. "Near Main Road")
          ...(prop.dynamicData ? Object.values(prop.dynamicData) : [])
        ];

        // Match if ANY field contains the query (case-insensitive, partial)
        searchMatch = searchableFields.some(field =>
          field && String(field).toLowerCase().includes(q)
        );
      }
        
      const typeMatch = selectedType === 'All' || prop.propertyType === selectedType;
      
      let priceMatch = true;
      if (priceRange !== 'All') {
        const priceNum = parseInt(prop.price, 10);
        if (!isNaN(priceNum)) {
          if (priceRange === 'under50l') priceMatch = priceNum < 5000000;
          else if (priceRange === '50l_to_1cr') priceMatch = priceNum >= 5000000 && priceNum <= 10000000;
          else if (priceRange === '1cr_to_5cr') priceMatch = priceNum > 10000000 && priceNum <= 50000000;
          else if (priceRange === 'above5cr') priceMatch = priceNum > 50000000;
        }
      }

      return searchMatch && typeMatch && priceMatch;
    });
  }, [properties, searchTerm, selectedType, priceRange]);

  const formatPrice = (priceStr) => {
    const num = parseInt(priceStr, 10);
    if (isNaN(num)) return priceStr;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const formatKey = (key) => key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).trim();
  const formatValue = (val) => {
    if (val === null || val === undefined) return "N/A";
    if (typeof val === "boolean") return val ? "Yes" : "No";
    if (Array.isArray(val)) return val.join(", ");
    if (typeof val === "object") return JSON.stringify(val);
    return val.toString();
  };

  const getAllImages = (property) => {
    if (!property) return ['https://via.placeholder.com/600x400?text=No+Image'];
    let validImages = [];
    
    if (property.images && Array.isArray(property.images)) {
      property.images.forEach(img => {
        if (typeof img === 'string') validImages.push(img);
        else if (img && img.uri) validImages.push(img.uri);
      });
    }
    if (property.newImageUrls) {
      if (Array.isArray(property.newImageUrls)) {
        property.newImageUrls.forEach(url => {
          if (typeof url === 'string' && url.trim() !== '') validImages.push(url);
        });
      } else if (typeof property.newImageUrls === 'string' && property.newImageUrls.trim() !== '') {
        validImages.push(property.newImageUrls);
      }
    }
    if (property.photo) {
      if (Array.isArray(property.photo)) {
        property.photo.forEach(p => {
          if (typeof p === 'string' && p.trim() !== '') validImages.push(p);
        })
      } else if (typeof property.photo === 'string' && property.photo.trim() !== '') {
        validImages.push(property.photo);
      }
    }
    
    validImages = [...new Set(validImages)];
    return validImages.length > 0 ? validImages : ['https://via.placeholder.com/600x400?text=No+Image'];
  };

  if (loading) {
    return (
      <div className="fullscreen-center bg-dots" style={{ background: 'var(--bg-color)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="spinner" size={48} />
        </motion.div>
        <h2 className="loading-text" style={{ color: 'var(--text-main)' }}>Finding premium properties...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fullscreen-center" style={{ background: 'var(--bg-color)' }}>
        <AlertCircle color="#ef4444" size={48} />
        <h2 className="error-text" style={{ color: 'var(--text-main)' }}>Oops! Something went wrong</h2>
        <p className="error-subtext">{error}</p>
      </div>
    );
  }

  const selectedDynamicData = selectedProperty && selectedProperty.dynamicData 
    ? Object.entries(selectedProperty.dynamicData).filter(([_, v]) => v !== null && v !== undefined && v !== "") 
    : [];




  return (
    <div className="app-container" style={{ background: 'var(--bg-color)' }}>
      <style>{`
        .carousel-track { display: flex; height: 100%; transition: none; }
        .carousel-wrapper:hover .carousel-btn { opacity: 1; }
        .carousel-btn { opacity: 0; transition: opacity 0.3s; }
        .zillow-card { background: var(--surface-color); border: 1px solid var(--border-color); color: var(--text-main); }
        .zillow-price { color: var(--text-main); }
        .zillow-specs { color: var(--text-main); }
        .spec-label, .zillow-address, .results-count { color: var(--text-muted); }
        .filter-input, .filter-select { background: var(--input-bg); color: var(--text-main); border-color: var(--border-color); }
        .filter-select option { background: var(--dropdown-bg); color: var(--text-main); }
        .filters-section { background: var(--surface-color); border-color: var(--border-color); }
        .sidebar-container { background: var(--bg-color); color: var(--text-main); }
        .sidebar-header { background: var(--surface-raised); border-bottom: 1px solid var(--border-color); }
        .detail-item-card { background: var(--surface-color); border-color: var(--border-color); }
        .detail-key { color: var(--text-muted); }
        .detail-value { color: var(--text-main); }
        .sidebar-footer { background: var(--surface-raised); border-top: 1px solid var(--border-color); }
        .hero-header { background: linear-gradient(to bottom, var(--surface-color), var(--bg-color)); border-bottom: 1px solid var(--border-color); }
        .hero-title { color: var(--text-main); }
        .hero-subtitle { color: var(--text-muted); }
        .results-info h2 { color: var(--text-main); }
        .filter-header h2 { color: var(--text-main); }
        .empty-state { background: var(--surface-color); border-color: var(--border-color); color: var(--text-muted); }
        .zillow-agent-tag { color: var(--text-subtle); font-size: 0.75rem; text-transform: uppercase; }
        .contact-btn { background: var(--primary); color: white; border-radius: 8px; }
      `}</style>

      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-header glassmorphism"
      >
        <div className="hero-content">
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hero-badge"
          >
            Exclusive Listings
          </motion.span>
          <h1 className="hero-title">Discover Your Perfect Space</h1>
          <p className="hero-subtitle">Explore verified properties tailored for your lifestyle and investments.</p>
        </div>
      </motion.header>

      <main className="main-content">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="filters-section glassmorphism"
        >
          <div className="filter-header">
            <Filter size={20} />
            <h2 style={{ color: 'var(--text-main)' }}>Find exactly what you want</h2>
          </div>
          
          <div className="filters-grid">
            <div className="filter-group relative">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search by location..." 
                className="filter-input search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <select 
                className="filter-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {propertyTypes.map(type => (
                  <option key={type} value={type}>{type === 'All' ? 'All Property Types' : type}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select 
                className="filter-select"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
              >
                <option value="All">Any Price</option>
                <option value="under50l">Under ₹50 Lacs</option>
                <option value="50l_to_1cr">₹50 Lacs - ₹1 Cr</option>
                <option value="1cr_to_5cr">₹1 Cr - ₹5 Cr</option>
                <option value="above5cr">Above ₹5 Cr</option>
              </select>
            </div>
          </div>
        </motion.section>

        <div className="results-info">
          <h2 style={{ color: 'var(--text-main)' }}>Latest Properties</h2>
          <motion.span 
            key={filteredProperties.length}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="results-count"
          >
            {filteredProperties.length} results found
          </motion.span>
        </div>

        {filteredProperties.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="empty-state glass-card"
          >
            <Home size={64} color="var(--text-muted)" />
            <h3>No properties found</h3>
            <p>Try adjusting your search criteria.</p>
            <button className="clear-filters-btn" onClick={() => {
              setSearchTerm('');
              setSelectedType('All');
              setPriceRange('All');
            }}>
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div layout className="property-grid">
              <AnimatePresence>
                {filteredProperties.slice(0, visibleCount).map((property, idx) => {
                  const bds = property.dynamicData && (property.dynamicData.bedrooms || property.dynamicData.Rooms) ? (property.dynamicData.bedrooms || property.dynamicData.Rooms) : null;
                  const ba = property.dynamicData && (property.dynamicData.bathrooms || property.dynamicData.Baths) ? (property.dynamicData.bathrooms || property.dynamicData.Baths) : null;
                  const sqft = property.dynamicData && (property.dynamicData['Total Area'] || property.dynamicData.sqft || property.dynamicData.Dimensions) ? (property.dynamicData['Total Area'] || property.dynamicData.sqft || property.dynamicData.Dimensions) : null;

                  return (
                    <motion.article 
                      layout
                      key={property._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, delay: (idx % 6) * 0.05 }}
                      whileHover={{ y: -8, transition: { duration: 0.2 } }}
                      className="zillow-card glass-card"
                    >
                      <div className="zillow-image-container">
                        <ImageCarousel 
                          images={getAllImages(property)} 
                          altText={property.location || 'Property'} 
                          className="zillow-slider" 
                         />
                        <div className="zillow-badge" style={{ background: 'var(--primary)', color: 'white' }}>NEW</div>
                      </div>

                      <div className="zillow-info">
                        <h3 className="zillow-price">{formatPrice(property.price)}</h3>
                        <div className="zillow-specs">
                          {bds && <><strong>{bds}</strong> <span className="spec-label">bds</span></>}
                          {bds && ba && <span className="spec-divider">|</span>}
                          {ba && <><strong>{ba}</strong> <span className="spec-label">ba</span></>}
                          {(bds || ba) && sqft && <span className="spec-divider">|</span>}
                          {sqft && <><strong>{sqft}</strong> <span className="spec-label">sqft</span></>}
                          
                          {(!bds && !ba && !sqft && property.propertyType) && (
                            <span className="spec-label" style={{textTransform:'uppercase', fontWeight: 700}}>{property.propertyType}</span>
                          )}
                        </div>
                        <p className="zillow-address" title={property.location}>
                          {property.location}
                        </p>
                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                          <p className="zillow-agent-tag" style={{ margin: 0 }}>LISTING BY WEALTH ASSOCIATES</p>
                          <motion.button 
                            whileHover={{ scale: 1.05, backgroundColor: 'var(--primary-light)' }} 
                            whileTap={{ scale: 0.95 }}
                            style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProperty(property);
                            }}
                          >
                            View Details <ChevronRight size={14} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </motion.div>
            
            {visibleCount < filteredProperties.length && (
              <div style={{ textAlign: 'center', marginTop: '3rem', marginBottom: '1rem' }}>
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary" 
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  style={{ padding: '1rem 3rem', borderRadius: '50px', fontSize: '1.1rem' }}
                >
                  View More Properties ({filteredProperties.length - visibleCount} left)
                </motion.button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Right Sidebar Drawer for Property Details */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sidebar-overlay" 
            onClick={() => setSelectedProperty(null)}
          >
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="sidebar-container" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sidebar-header">
                <h2>{selectedProperty.propertyType || 'Property Details'}</h2>
                <motion.button 
                  whileHover={{ rotate: 90, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  className="close-btn" 
                  onClick={() => setSelectedProperty(null)}
                  style={{ background: 'transparent', color: 'var(--text-main)' }}
                >
                  <X size={24} />
                </motion.button>
              </div>
              
              <div className="sidebar-content">
                <div className="sidebar-hero-wrapper">
                  <ImageCarousel 
                    images={getAllImages(selectedProperty)} 
                    altText="Full View" 
                  />
                </div>

                <motion.h3 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="sidebar-price-tag"
                  style={{ color: 'var(--primary)' }}
                >
                  {formatPrice(selectedProperty.price)}
                </motion.h3>
                <div style={{ color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>
                   ID: {(selectedProperty.propertyId || selectedProperty._id)?.toString().slice(-4).toUpperCase()}
                </div>
                <div className="property-location" style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                  <MapPin className="icon" size={20} color="var(--primary)" />
                  <span className="location-text">{selectedProperty.location}</span>
                </div>

                {selectedDynamicData.length > 0 && (
                  <>
                    <h4 className="sidebar-section-title">
                      <CheckCircle2 size={24} style={{color:'var(--primary)'}}/> 
                      Facts and features
                    </h4>
                    <div className="detail-grid">
                      {selectedDynamicData.map(([key, value], dIdx) => {
                        if (typeof value === 'object' && value !== null) {
                           return Object.entries(value).map(([nestedKey, nestedValue], nIdx) => (
                             <motion.div 
                               initial={{ opacity: 0, scale: 0.9 }}
                               animate={{ opacity: 1, scale: 1 }}
                               transition={{ delay: 0.1 + (nIdx * 0.05) }}
                               key={nestedKey} 
                               className="detail-item-card"
                             >
                                <span className="detail-key">{formatKey(nestedKey)}</span>
                                <span className="detail-value">{formatValue(nestedValue)}</span>
                             </motion.div>
                           ))
                        }
                        return (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + (dIdx * 0.05) }}
                            key={key} 
                            className="detail-item-card"
                          >
                             <span className="detail-key">{formatKey(key)}</span>
                             <span className="detail-value">{formatValue(value)}</span>
                          </motion.div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>

              <div className="sidebar-footer">
                <motion.a 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="tel:7796356789" 
                  className="contact-btn" 
                  style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', textDecoration: 'none', display: 'flex', justifyContent: 'center', background: 'var(--primary)' }}
                >
                  <Phone size={20} />
                  <span>Call 7796356789</span>
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Floating Global Contact Button */}
      <motion.a 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1, translateY: -5 }}
        whileTap={{ scale: 0.9 }}
        href="tel:7796356789" 
        className="floating-contact-btn"
        style={{ background: 'var(--primary)' }}
      >
        <Phone size={24} />
        Call 7796356789
      </motion.a>
    </div>
  );
}

export default PropertiesPage;
