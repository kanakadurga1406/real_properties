import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  ArrowUpDown,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Droplets,
  FileCheck2,
  Filter,
  Grid,
  Home,
  Layers,
  Lock,
  Loader2,
  MapPin,
  Phone,
  PhoneCall,
  Ruler,
  Search,
  Sparkles,
  Tag,
  Trees,
  User,
  X
} from 'lucide-react';
import CONFIG from './config';
import PostPropertyModal from './components/PostPropertyModal';
import './App.css';

const fallbackImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80';

const propertyTypeOptions = [
  'All',
  'FLAT(APARTMENT)',
  'HOUSE(INDIVIDUAL)',
  'LAND(OPENSITE)',
  'COMMERCIAL PROPERTY',
  'COMMERCIAL LAND',
  'AGRICULTURE LAND',
  'PLOT(LAYOUT)',
  'VILLA',
];

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
  const [approvedProperties, setApprovedProperties] = useState([]);
  const [communityProperties, setCommunityProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [activeCategory, setActiveCategory] = useState('approved');

  const fetchSubStatus = async (userId) => {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/realproperties/subscription/status/${userId}`);
      const data = await res.json();
      setSubscription(data.hasSubscription ? data.subscription : null);
    } catch { /* ignore */ }
  };

  // Lock body scroll and update dynamic SEO when property detail panel is open
  useEffect(() => {
    let schemaScript = document.getElementById('dynamic-seo-schema');
    
    // Helper to safely update or append meta tags
    const updateMetaTag = (property, name, content) => {
      let tag = document.querySelector(`meta[property="${property}"], meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        if (property) tag.setAttribute('property', property);
        if (name) tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    if (selectedProperty) {
      document.body.classList.add('modal-open');

      // 1. Core SEO Details
      const location = selectedProperty.location || selectedProperty.city || 'Andhra Pradesh & Telangana';
      const type = selectedProperty.propertyType || 'Real Estate';
      const priceText = selectedProperty.price ? `₹${Number(selectedProperty.price).toLocaleString('en-IN')}` : 'Contact for Price';
      const title = `${type} in ${location} - ${priceText} | Real Properties`;
      const desc = `Check out this verified ${type.toLowerCase()} located in ${location}. Priced at ${priceText}. View details, layout, and contact Real Properties to secure this listing.`;
      const imageUrl = selectedProperty.photo || selectedProperty.newImageUrls || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=630&fit=crop';
      const propertyUrl = window.location.href;

      document.title = title;
      updateMetaTag(null, 'description', desc);

      // 2. OpenGraph & Twitter Social Search Cards
      updateMetaTag('og:title', null, title);
      updateMetaTag('og:description', null, desc);
      updateMetaTag('og:image', null, imageUrl);
      updateMetaTag('og:url', null, propertyUrl);
      updateMetaTag(null, 'twitter:setImage', imageUrl);
      updateMetaTag(null, 'twitter:title', title);
      updateMetaTag(null, 'twitter:description', desc);

      // 3. Dynamic Structured Data (Schema JSON-LD) for Google "Rich Results"
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.type = 'application/ld+json';
        schemaScript.id = 'dynamic-seo-schema';
        document.head.appendChild(schemaScript);
      }
      
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": `${type} in ${location}`,
        "image": imageUrl,
        "description": desc,
        "offers": {
          "@type": "Offer",
          "url": propertyUrl,
          "priceCurrency": "INR",
          "price": selectedProperty.price ? selectedProperty.price.toString() : "0",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "RealEstateAgent",
            "name": "Real Properties"
          }
        }
      };
      schemaScript.text = JSON.stringify(structuredData);

    } else {
      document.body.classList.remove('modal-open');
      
      // Reset Default SEO
      const defTitle = "Real Properties | 100% Approved Plots, Villas & Flats | Real Properties";
      const defDesc = "Browse 100% legally approved residential and commercial properties across Andhra Pradesh and Telangana. Find plots, villas, flats & land for sale.";
      const defImg = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=630&fit=crop";
      
      document.title = defTitle;
      updateMetaTag(null, 'description', defDesc);
      updateMetaTag('og:title', null, defTitle);
      updateMetaTag('og:description', null, defDesc);
      updateMetaTag('og:image', null, defImg);
      updateMetaTag('og:url', null, window.location.href.split('#')[0]); // Base URL
      
      // Remove specific property schema when closed so Google doesn't misindex the homepage
      if (schemaScript) {
        schemaScript.remove();
      }
    }
    return () => document.body.classList.remove('modal-open');
  }, [selectedProperty]);

  useEffect(() => {
    const stored = localStorage.getItem('realprop_user');
    if (stored) {
      const u = JSON.parse(stored);
      setCurrentUser(u);
      fetchSubStatus(u.id);
    }

    const handleAuthUpdate = () => {
      const nextUser = localStorage.getItem('realprop_user');
      if (nextUser) {
        const u = JSON.parse(nextUser);
        setCurrentUser(u);
        fetchSubStatus(u.id);
      } else {
        setCurrentUser(null);
        setSubscription(null);
      }
    };
    const handleSubChange = () => {
      const u = localStorage.getItem('realprop_user');
      if (u) fetchSubStatus(JSON.parse(u).id);
    };

    window.addEventListener('authChange', handleAuthUpdate);
    window.addEventListener('subscriptionChange', handleSubChange);

    return () => {
      window.removeEventListener('authChange', handleAuthUpdate);
      window.removeEventListener('subscriptionChange', handleSubChange);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ------ 1. Approved / Real Properties properties ------
        let approved = [];
        try {
          const approvedResponse = await fetch(
            `${CONFIG.API_BASE_URL}/properties/getApproveProperty`
          );
          if (approvedResponse.ok) {
            const approvedData = await approvedResponse.json();
            approved = Array.isArray(approvedData)
              ? approvedData
              : approvedData.properties || [];
            approved = approved.map(p => ({ ...p, isApproved: true }));
            approved.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          } else {
            console.warn('Approved properties endpoint error:', approvedResponse.status);
          }
        } catch (err) {
          console.warn('Failed to fetch approved properties:', err.message);
        }

        // ------ 2. Community / real_properties website submissions ------
        let community = [];
        try {
          const communityResponse = await fetch(
            `${CONFIG.API_BASE_URL}/realproperties/property/get`
          );
          if (communityResponse.ok) {
            const communityData = await communityResponse.json();
            community = Array.isArray(communityData) ? communityData : [];
            community = community.map(p => ({ ...p, isApproved: false }));
            community.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          } else {
            console.warn('Community properties endpoint error:', communityResponse.status);
          }
        } catch (err) {
          console.warn('Failed to fetch community properties:', err.message);
        }

        setApprovedProperties(approved);
        setCommunityProperties(community);

        if (approved.length === 0 && community.length === 0) {
          setError('No properties found. Please try again later.');
        }
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
    // Merge: approved (from Real Properties backend) + community (from real_properties website)
    return [
      ...approvedProperties,
      ...communityProperties
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [approvedProperties, communityProperties]);

  const filteredProperties = useMemo(() => {
    return allProperties.filter((property) => {
      // Category filter
      const matchesCategory = activeCategory === 'approved' ? property.isApproved : !property.isApproved;

      const query = searchTerm.trim().toLowerCase();
      const matchesSearch = !query
        ? true
        : [property.location, property.district, property.propertyType, property.mandal, property.fullName]
            .filter(Boolean)
            .some((field) => String(field).toLowerCase().includes(query));

      const matchesType =
        selectedType === 'All' ? true : String(property.propertyType || '').toLowerCase() === selectedType.toLowerCase();

      return matchesCategory && matchesSearch && matchesType;
    });
  }, [allProperties, searchTerm, selectedType, activeCategory]);

  const visibleProperties = filteredProperties.slice(0, visibleCount);

  const PropertyCard = ({ property }) => {
    const propertyImages = getAllImages(property);
    const dd = property.dynamicData || {};
    const bhk = dd.bhk || '';
    const area = dd.area || (dd.agricultureDetails?.extent) || (dd.plotLocation ? dd.area : '');
    const specs = [
      property.propertyType || 'Property',
      property.Constituency || property.district || '',
    ].filter(Boolean);

    return (
      <motion.article layout whileHover={{ y: -4 }} className="zillow-card" onClick={() => setSelectedProperty(property)}>
        <div className="zillow-image-container">
          <ImageCarousel images={propertyImages} altText={property.location || 'Property'} />
          <div className="zillow-badge" style={{ 
            background: property.isApproved ? 'var(--primary)' : '#eab308', 
            color: '#ffffff',
            border: 'none', top: '10px', left: '10px'
          }}>
            {property.isApproved ? 'Approved' : 'unverified'}
          </div>
          <span className="zillow-image-count">{propertyImages.length} photo{propertyImages.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="zillow-info">
          <h3 className="zillow-price">{formatPrice(property.price)}</h3>
          <p className="zillow-address">
            <MapPin size={14} />
            {property.location || 'Location unavailable'}
          </p>

          {/* BHK + Area quick row */}
          {(bhk || area) && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '0.3rem 0' }}>
              {bhk && <span className="spec-pill" style={{ background: 'var(--accent)', color: '#fff' }}>{bhk}</span>}
              {area && <span className="spec-pill">{area}</span>}
            </div>
          )}

          <div className="zillow-specs">
            {specs.map((spec) => (
              <span key={spec} className="spec-pill">{spec}</span>
            ))}
          </div>

          {property.propertyDetails && property.propertyDetails !== 'no details' && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem', lineHeight: 1.4 }}>
              {property.propertyDetails.length > 80 ? property.propertyDetails.slice(0, 80) + '…' : property.propertyDetails}
            </p>
          )}

          <div className="zillow-card-footer">
            <span className="zillow-agent-tag">
              {property.fullName ? `Posted by ${property.fullName}` : 'Real Properties'}
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

          <button className="btn-primary" onClick={() => setVisibleCount(6)}>
            <Filter size={16} />
            Refine
          </button>
        </div>

        <div className="results-bar">
          <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.8rem' }}>
              <button 
                onClick={() => { setActiveCategory('approved'); setVisibleCount(6); }}
                style={{
                  padding: '8px 16px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer',
                  border: activeCategory === 'approved' ? 'none' : '1px solid var(--line)',
                  background: activeCategory === 'approved' ? 'var(--primary)' : 'transparent',
                  color: activeCategory === 'approved' ? 'white' : 'var(--text-soft)'
                }}
              >
                Verified Properties
              </button>
              <button 
                onClick={() => { setActiveCategory('community'); setVisibleCount(6); }}
                style={{
                  padding: '8px 16px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer',
                  border: activeCategory === 'community' ? 'none' : '1px solid var(--line)',
                  background: activeCategory === 'community' ? '#eab308' : 'transparent',
                  color: activeCategory === 'community' ? '#1f2937' : 'var(--text-soft)'
                }}
              >
                Unverified Properties
              </button>
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem' }}>
              {activeCategory === 'approved' ? 'Verified Official Inventory' : 'Community Postings'}
            </h3>
            <p className="results-meta">
              {activeCategory === 'approved' ? 'These properties have been legally vetted and approved by Real Properties.' : 'These properties were submitted by users and agents and are pending official verification.'}
            </p>
          </div>
          <div className="results-count" style={{ alignSelf: 'flex-end' }}>
            <Tag size={14} />
            {filteredProperties.length} results
          </div>
        </div>

        {visibleProperties.length > 0 ? (
          <div className="property-grid">
            <AnimatePresence>
              {visibleProperties.map((property) => (
                <PropertyCard key={property._id} property={property} />
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
        {selectedProperty && (() => {
          const sp = selectedProperty;
          const dd = sp.dynamicData || {};
          const agri = dd.agricultureDetails || null;
          const isAgri = !!agri;
          const isPlot = !!dd.plotLocation || !!dd.ventureName;
          const fac = dd.facilities || {};

          const coreDetails = [
            sp.propertyType && { label: 'Property Type', value: sp.propertyType, icon: <Building2 size={16} color="var(--accent)" /> },
            sp.location && { label: 'Location', value: sp.location, icon: <MapPin size={16} color="var(--accent)" /> },
            sp.Constituency && !sp.Constituency.includes('[object') && { label: 'Constituency', value: sp.Constituency, icon: <Grid size={16} color="var(--accent)" /> },
            dd.FlatLocation && { label: 'Exact Location', value: dd.FlatLocation, icon: <MapPin size={16} color="var(--accent)" /> },
            sp.fullName && { label: 'Posted By', value: sp.fullName, icon: <User size={16} color="var(--accent)" /> },
            sp.PostedUserType && { label: 'Posted As', value: sp.PostedUserType, icon: <Tag size={16} color="var(--accent)" /> },
            sp.createdAt && { label: 'Listed On', value: new Date(sp.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), icon: <CheckCircle2 size={16} color="var(--accent)" /> },
          ].filter(Boolean);

          const houseDetails = !isAgri && !isPlot ? [
            dd.bhk && { label: 'BHK / Config', value: dd.bhk },
            dd.area && { label: 'Area', value: dd.area },
            dd.carpetArea && { label: 'Carpet Area', value: dd.carpetArea },
            dd.totalArea && { label: 'Total Area', value: dd.totalArea },
            dd.floors && { label: 'Floors', value: dd.floors },
            dd.portions && { label: 'Portions', value: dd.portions },
            dd.furnishing && { label: 'Furnishing', value: dd.furnishing },
            dd.projectStatus && { label: 'Project Status', value: dd.projectStatus },
            dd.direction && { label: 'Facing', value: dd.direction },
            dd.carParking && { label: 'Car Parking', value: dd.carParking },
            dd.BankLoanFacility && { label: 'Bank Loan', value: dd.BankLoanFacility },
          ].filter(Boolean) : [];

          const agriDetails = isAgri ? [
            agri.extent && { label: 'Extent', value: agri.extent },
            agri.surveyNumber && { label: 'Survey Number', value: agri.surveyNumber },
            agri.exactLocation && { label: 'Exact Location', value: agri.exactLocation },
            agri.passBook && { label: 'Pass Book', value: agri.passBook },
            agri.oneB && { label: '1-B', value: agri.oneB },
            agri.rrsr && { label: 'RRSR', value: agri.rrsr },
            agri.fmb && { label: 'FMB', value: agri.fmb },
            agri.boundaries && { label: 'Boundaries', value: typeof agri.boundaries === 'object' ? Object.entries(agri.boundaries).map(([k,v]) => `${k}: ${v}`).join(' | ') : agri.boundaries },
          ].filter(Boolean) : [];

          const plotDetails = isPlot ? [
            dd.ventureName && { label: 'Venture Name', value: dd.ventureName },
            dd.plotLocation && { label: 'Plot Location', value: dd.plotLocation },
            dd.plotNumber && { label: 'Plot Number', value: dd.plotNumber },
            dd.area && { label: 'Area', value: dd.area },
            dd.plotLength && { label: 'Length', value: dd.plotLength },
            dd.plotBreadth && { label: 'Breadth', value: dd.plotBreadth },
            dd.direction && { label: 'Facing', value: dd.direction },
            dd.approvalStatus && { label: 'Approval', value: dd.approvalStatus },
            dd.lpNumber && { label: 'LP Number', value: dd.lpNumber },
            dd.bankLoanFacility && { label: 'Bank Loan', value: dd.bankLoanFacility },
          ].filter(Boolean) : [];

          const amenities = isPlot ? [
            { key: 'kidsPlayArea', label: 'Kids Play Area' },
            { key: 'waterTap', label: 'Water Tap' },
            { key: 'undergroundDrainage', label: 'UG Drainage' },
            { key: 'security', label: 'Security' },
            { key: 'compoundWall', label: 'Compound Wall' },
            { key: 'undergroundElectricity', label: 'UG Electricity' },
            { key: 'readyToConstruction', label: 'Ready to Build' },
            { key: 'clubHouse', label: 'Club House' },
            { key: 'swimmingPool', label: 'Swimming Pool' },
            { key: 'gymArea', label: 'Gym' },
            { key: 'yogaArea', label: 'Yoga Area' },
          ].filter(a => dd[a.key] === 'Yes' || dd[a.key] === true) : [
            fac.water && { key: 'water', label: 'Water', icon: <Droplets size={13} /> },
            fac.vastu && { key: 'vastu', label: 'Vastu', icon: <Compass size={13} /> },
            fac.documents && { key: 'documents', label: 'Documents', icon: <FileCheck2 size={13} /> },
            fac.lift && { key: 'lift', label: 'Lift', icon: <ArrowUpDown size={13} /> },
          ].filter(Boolean);

          return (
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
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sidebar-hero-wrapper">
                  <ImageCarousel images={getAllImages(sp)} altText={sp.location || 'Property'} />
                </div>

                <div className="sidebar-content">
                  {/* Header */}
                  <div className="sidebar-head">
                    <span className="section-eyebrow" style={{ color: sp.isApproved ? 'var(--primary)' : '#eab308', background: sp.isApproved ? 'transparent' : 'rgba(234, 179, 8, 0.1)' }}>
                      {sp.isApproved ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />} 
                      {sp.isApproved ? 'Verified Approved Property' : 'unverified Property'}
                    </span>
                    <button className="icon-circle-btn" onClick={() => setSelectedProperty(null)}><X size={18} /></button>
                  </div>

                  {/* Price + Location */}
                  <h2 className="sidebar-price-tag">{formatPrice(sp.price)}</h2>
                  <div className="sidebar-location-row"><MapPin size={18} /><span>{sp.location || 'Location unavailable'}</span></div>

                  {/* Description */}
                  {sp.propertyDetails && sp.propertyDetails !== 'no details' && (
                    <p className="property-story">{sp.propertyDetails}</p>
                  )}

                  {/* Core Details Grid */}
                  <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Basic Information</h4>
                  <div className="detail-grid">
                    {coreDetails.map((item) => (
                      <div key={item.label} className="detail-item-card">
                        {item.icon}
                        <span className="detail-key">{item.label}</span>
                        <span className="detail-value">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* House / Flat Details */}
                  {houseDetails.length > 0 && (
                    <>
                      <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                        <Home size={14} style={{ marginRight: 4 }} /> Property Specifications
                      </h4>
                      <div className="detail-grid">
                        {houseDetails.map((item) => (
                          <div key={item.label} className="detail-item-card">
                            <Ruler size={16} color="var(--accent)" />
                            <span className="detail-key">{item.label}</span>
                            <span className="detail-value">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Agriculture Land Details */}
                  {agriDetails.length > 0 && (
                    <>
                      <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                        <Trees size={14} style={{ marginRight: 4 }} /> Land Details
                      </h4>
                      <div className="detail-grid">
                        {agriDetails.map((item) => (
                          <div key={item.label} className="detail-item-card">
                            <Layers size={16} color="var(--accent)" />
                            <span className="detail-key">{item.label}</span>
                            <span className="detail-value">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Plot Layout Details */}
                  {plotDetails.length > 0 && (
                    <>
                      <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                        <Grid size={14} style={{ marginRight: 4 }} /> Plot Details
                      </h4>
                      <div className="detail-grid">
                        {plotDetails.map((item) => (
                          <div key={item.label} className="detail-item-card">
                            <Ruler size={16} color="var(--accent)" />
                            <span className="detail-key">{item.label}</span>
                            <span className="detail-value">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Amenities / Facilities */}
                  {amenities.length > 0 && (
                    <>
                      <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Amenities & Facilities</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                        {amenities.map((a) => (
                          <span key={a.key || a.label} style={{ background: '#e8f5e9', color: '#2e7d32', borderRadius: '20px', padding: '4px 12px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {a.icon ? a.icon : <Check size={13} />} {a.label}
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Contact Footer — gated behind subscription */}
                  <div className="sidebar-footer">
                    {subscription ? (
                      // ✅ Subscribed: show full call button
                      <>
                        <a href="tel:7796356789" className="contact-btn">
                          <Phone size={18} />
                          Call Real Properties
                        </a>
                        <p className="sidebar-note" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <PhoneCall size={13} /> +91 77963 56789 &nbsp;|&nbsp; Property ID: {sp._id?.slice(-4).toUpperCase() || 'N/A'}
                        </p>
                      </>
                    ) : (
                      // 🔒 Not subscribed: subscription gate
                      <div className="prop-gate">
                        <div className="prop-gate-lock">
                          <Lock size={22} />
                        </div>
                        <div className="prop-gate-text">
                          <strong>Premium Members Only</strong>
                          <span>Subscribe to view contact details &amp; call the seller directly.</span>
                        </div>
                        <button
                          className="btn-primary prop-gate-btn"
                          onClick={() => {
                            setSelectedProperty(null);
                            window.dispatchEvent(new CustomEvent('openSubscription'));
                          }}
                        >
                          <Sparkles size={15} />
                          Subscribe — ₹3,650/yr
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <PostPropertyModal
        isOpen={isPostOpen}
        onClose={() => setIsPostOpen(false)}
        user={currentUser}
        onPropertyAdded={(property) => setCommunityProperties((prev) => [property, ...prev])}
      />
    </div>
  );
}

export default PropertiesPage;
