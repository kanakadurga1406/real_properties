import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid,
  Loader2,
  MapPin,
  Phone,
  Search,
  Tag,
  X
} from 'lucide-react';
import PostPropertyModal from './components/PostPropertyModal';
import './App.css';

const fallbackImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80';

const propertyTypeOptions = ['All', 'Villa', 'Apartment', 'Plot', 'Sale', 'Rent'];
const originOptions = ['All', 'Wealth Associate', 'Verified', 'Community'];

const ImageCarousel = ({ images, altText }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = (event) => {
    event.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = (event) => {
    event.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="carousel-shell">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${altText} ${currentIndex + 1}`}
          initial={{ opacity: 0.2, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.2 }}
          transition={{ duration: 0.35 }}
          onError={(event) => {
            event.currentTarget.src = fallbackImage;
          }}
        />
      </AnimatePresence>

      {images.length > 1 && (
        <>
          <button className="carousel-btn left" onClick={prevSlide}>
            <ChevronLeft size={18} />
          </button>
          <button className="carousel-btn right" onClick={nextSlide}>
            <ChevronRight size={18} />
          </button>
          <div className="carousel-dots">
            {images.map((_, index) => (
              <span key={index} className={`carousel-dot ${index === currentIndex ? 'active' : ''}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

function PropertiesPage({ heroSearchTerm = '' }) {
  const [properties, setProperties] = useState([]);
  const [wealthAssociateProperties, setWealthAssociateProperties] = useState([]);
  const [unapprovedProperties, setUnapprovedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [originFilter, setOriginFilter] = useState('All');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const storedUser = localStorage.getItem('realprop_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    const handleOpenPost = () => setIsPostOpen(true);
    const handleAuthUpdate = () => {
      const nextUser = localStorage.getItem('realprop_user');
      setCurrentUser(nextUser ? JSON.parse(nextUser) : null);
    };

    window.addEventListener('openPostProperty', handleOpenPost);
    window.addEventListener('authChange', handleAuthUpdate);

    return () => {
      window.removeEventListener('openPostProperty', handleOpenPost);
      window.removeEventListener('authChange', handleAuthUpdate);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [approvedResponse, wealthAssociateResponse, unapprovedResponse] = await Promise.all([
          fetch('http://localhost:3000/properties/getApproveProperty'),
          fetch('http://localhost:3000/properties/getAdminProperties'),
          fetch('http://localhost:3000/realproperties/property/get')
        ]);

        const approvedData = await approvedResponse.json();
        const wealthAssociateData = await wealthAssociateResponse.json();
        const unapprovedData = await unapprovedResponse.json();

        const approvedProperties = Array.isArray(approvedData) ? approvedData : approvedData.properties || [];
        const wealthProperties = Array.isArray(wealthAssociateData)
          ? wealthAssociateData
          : wealthAssociateData.MyPosts || wealthAssociateData.properties || [];
        const draftProperties = Array.isArray(unapprovedData) ? unapprovedData : [];

        approvedProperties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        wealthProperties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        draftProperties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setProperties(approvedProperties);
        setWealthAssociateProperties(wealthProperties);
        setUnapprovedProperties(draftProperties);
      } catch (err) {
        setError(err.message || 'Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (heroSearchTerm) {
      setSearchTerm(heroSearchTerm);
    }
  }, [heroSearchTerm]);

  const getAllImages = (property) => {
    if (!property) {
      return [fallbackImage];
    }

    const normalized = [];

    const pushValue = (value) => {
      if (!value) {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach(pushValue);
        return;
      }

      if (typeof value === 'string') {
        normalized.push(value);
        return;
      }

      if (typeof value === 'object' && value.uri) {
        normalized.push(value.uri);
      }
    };

    pushValue(property.images);
    pushValue(property.newImageUrls);
    pushValue(property.photo);

    return normalized.length > 0 ? normalized : [fallbackImage];
  };

  const formatPrice = (priceStr) => {
    if (!priceStr) {
      return 'Price on request';
    }

    const num = parseInt(String(priceStr).replace(/,/g, ''), 10);
    if (Number.isNaN(num)) {
      return priceStr;
    }

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const allProperties = useMemo(() => {
    const wealthAssociate = wealthAssociateProperties.map((property) => ({
      ...property,
      sourceType: 'Wealth Associate'
    }));
    const approved = properties.map((property) => ({ ...property, sourceType: 'Verified' }));
    const community = unapprovedProperties.map((property) => ({ ...property, sourceType: 'Community' }));

    return [...wealthAssociate, ...approved, ...community].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [wealthAssociateProperties, properties, unapprovedProperties]);

  const filteredProperties = useMemo(() => {
    return allProperties.filter((property) => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch = !query
        ? true
        : [property.location, property.district, property.propertyType, property.mandal, property.fullName]
            .filter(Boolean)
            .some((field) => String(field).toLowerCase().includes(query));

      const matchesType =
        selectedType === 'All' ? true : String(property.propertyType || '').toLowerCase() === selectedType.toLowerCase();

      const matchesOrigin = originFilter === 'All' ? true : property.sourceType === originFilter;

      return matchesSearch && matchesType && matchesOrigin;
    });
  }, [allProperties, searchTerm, selectedType, originFilter]);

  const visibleProperties = filteredProperties.slice(0, visibleCount);

  const PropertyCard = ({ property }) => {
    const propertyImages = getAllImages(property);
    const specs = [
      property.propertyType || 'Property',
      property.district || 'Location pending',
      property.dynamicData?.sqft ? `${property.dynamicData.sqft} sqft` : null
    ].filter(Boolean);

    return (
      <motion.article layout whileHover={{ y: -4 }} className="zillow-card" onClick={() => setSelectedProperty(property)}>
        <div className="zillow-image-container">
          <ImageCarousel images={propertyImages} altText={property.location || 'Property'} />
          <span className="zillow-badge">
            {property.sourceType === 'Wealth Associate'
              ? 'Wealth Associate'
              : property.sourceType === 'Verified'
              ? 'Verified Listing'
              : 'Community Listing'}
          </span>
          <span className="zillow-image-count">{propertyImages.length} photos</span>
        </div>

        <div className="zillow-info">
          <h3 className="zillow-price">{formatPrice(property.price)}</h3>
          <p className="zillow-address">
            <MapPin size={16} />
            {property.location || 'Location unavailable'}
          </p>

          <div className="zillow-specs">
            {specs.map((spec) => (
              <span key={spec} className="spec-pill">
                {spec}
              </span>
            ))}
          </div>

          <div className="zillow-card-footer">
            <span className="zillow-agent-tag">
              {property.sourceType === 'Wealth Associate'
                ? 'Posted by Wealth Associate'
                : property.sourceType === 'Verified'
                ? 'Professional listing'
                : property.fullName
                ? `Posted by ${property.fullName}`
                : 'Community submitted'}
            </span>
            <ArrowRight size={18} />
          </div>
        </div>
      </motion.article>
    );
  };

  if (loading) {
    return (
      <div className="fullscreen-center">
        <div>
          <Loader2 className="spinner" size={42} />
          <p className="loading-text">Loading the property collection</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fullscreen-center">
        <div>
          <p className="error-text">We couldn&apos;t load the property feed.</p>
          <p className="error-subtext">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog-section">
      <div className="section-container">
        <div className="v2-header-stack">
          <span className="section-eyebrow">
            <Building2 size={14} />
            Live Inventory
          </span>
          <h2 className="v2-title-xl">Browse a cleaner, easier-to-trust property catalog.</h2>
          <p className="v2-p-lg section-subcopy">
            Search across approved listings and submitted properties in one responsive catalog designed to reduce
            clutter and improve discovery.
          </p>
        </div>

        <div className="catalog-toolbar v2-surface-raised">
          <div className="catalog-search">
            <Search size={18} color="var(--accent)" />
            <input
              type="text"
              placeholder="Search locality, district, landmark, or property type"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setVisibleCount(6);
              }}
            />
          </div>

          <div className="catalog-filter">
            <select
              value={selectedType}
              onChange={(event) => {
                setSelectedType(event.target.value);
                setVisibleCount(6);
              }}
            >
              {propertyTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'All' ? 'All property types' : option}
                </option>
              ))}
            </select>
          </div>

          <div className="catalog-filter">
            <select
              value={originFilter}
              onChange={(event) => {
                setOriginFilter(event.target.value);
                setVisibleCount(6);
              }}
            >
              {originOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'All' ? 'All listing sources' : option}
                </option>
              ))}
            </select>
          </div>

          <button className="btn-primary" onClick={() => setVisibleCount(6)}>
            <Filter size={16} />
            Refine
          </button>
        </div>

        <div className="results-bar">
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem' }}>Available properties</h3>
            <p className="results-meta">Responsive card layout with clearer details and stronger click targets.</p>
          </div>
          <div className="results-count">
            <Tag size={14} />
            {filteredProperties.length} results
          </div>
        </div>

        {visibleProperties.length > 0 ? (
          <div className="property-grid">
            <AnimatePresence>
              {visibleProperties.map((property) => (
                <PropertyCard key={`${property.sourceType}-${property._id}`} property={property} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No properties match these filters</h3>
            <p>Try a broader search term or reset the listing source and property type filters.</p>
          </div>
        )}

        {visibleCount < filteredProperties.length && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button className="btn-outline" onClick={() => setVisibleCount((prev) => prev + 6)}>
              Show more properties
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProperty(null)}
          >
            <motion.div
              className="sidebar-container"
              initial={{ opacity: 0, y: 22, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sidebar-hero-wrapper">
                <ImageCarousel images={getAllImages(selectedProperty)} altText={selectedProperty.location || 'Property'} />
              </div>

              <div className="sidebar-content">
                <div className="sidebar-head">
                  <span className="section-eyebrow">
                    <CheckCircle2 size={14} />
                    {selectedProperty.sourceType} Listing
                  </span>
                  <button className="icon-circle-btn" onClick={() => setSelectedProperty(null)}>
                    <X size={18} />
                  </button>
                </div>

                <h2 className="sidebar-price-tag">{formatPrice(selectedProperty.price)}</h2>
                <div className="sidebar-location-row">
                  <MapPin size={18} />
                  <span>{selectedProperty.location || 'Location unavailable'}</span>
                </div>

                <p className="property-story">
                  {selectedProperty.propertyDetails ||
                    'This listing is now presented inside a clearer detail panel so users can focus on the essentials and move toward inquiry faster.'}
                </p>

                <div className="detail-grid">
                  {[
                    { label: 'Property type', value: selectedProperty.propertyType || 'Not specified', icon: <Building2 size={18} color="var(--accent)" /> },
                    { label: 'District', value: selectedProperty.district || 'Not specified', icon: <MapPin size={18} color="var(--accent)" /> },
                    { label: 'Mandal', value: selectedProperty.mandal || 'Not specified', icon: <Grid size={18} color="var(--accent)" /> },
                    {
                      label: 'Listing source',
                      value: selectedProperty.sourceType,
                      icon: <CheckCircle2 size={18} color="var(--accent)" />
                    }
                  ].map((item) => (
                    <div key={item.label} className="detail-item-card">
                      {item.icon}
                      <span className="detail-key">{item.label}</span>
                      <span className="detail-value">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="sidebar-footer">
                  <a href="tel:7796356789" className="contact-btn">
                    <Phone size={18} />
                    Contact about this property
                  </a>
                  <p className="sidebar-note">Call Wealth Associates at +91 77963 56789 for direct assistance.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PostPropertyModal
        isOpen={isPostOpen}
        onClose={() => setIsPostOpen(false)}
        user={currentUser}
        onPropertyAdded={(property) => setUnapprovedProperties((prev) => [property, ...prev])}
      />
    </div>
  );
}

export default PropertiesPage;
