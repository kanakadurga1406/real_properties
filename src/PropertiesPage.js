import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  ArrowUpDown,
  BadgeCheck,
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
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  PhoneCall,
  Ruler,
  Sparkles,
  Tag,
  Trees,
  User,
  X
} from 'lucide-react';
import CONFIG from './config';
import PostPropertyModal from './components/PostPropertyModal';
import { parseSearchQuery, matchProperty } from './utils/searchUtils';
import './components/OLXCards.css';
import './App.css';

const fallbackImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80';

// propertyTypeOptions will be derived dynamically

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
  const navigate = useNavigate();
  const [approvedProperties, setApprovedProperties] = useState([]);
  const [communityProperties, setCommunityProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('category') || 'All');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [contactPhone, setContactPhone] = useState(CONFIG.SUPPORT_PHONE);
  const [isFetchingPhone, setIsFetchingPhone] = useState(false);
  const [leadData, setLeadData] = useState(null);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', mobile: '', location: '' });
  const [loggedProperties, setLoggedProperties] = useState(new Set());
  const [hasRequested, setHasRequested] = useState(false);

  // Load user and lead data from localStorage
  useEffect(() => {
    const storedLead = localStorage.getItem('realprop_lead');
    if (storedLead) {
      setLeadData(JSON.parse(storedLead));
    }
  }, []);

  // Sync HeroSection search term to PropertiesPage search term
  useEffect(() => {
    if (heroSearchTerm) {
      setSearchTerm(heroSearchTerm);
    }
  }, [heroSearchTerm]);

  // Reset request state when switching properties
  useEffect(() => {
    setHasRequested(false);
  }, [selectedProperty]);

  const logLeadManual = async (propertyId, data) => {
    const pid = propertyId.slice(-4).toUpperCase();
    if (loggedProperties.has(pid)) return;

    try {
      await fetch(`${CONFIG.API_BASE_URL}/realproperties/lead/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, propertyId: pid }),
      });
      setLoggedProperties(prev => new Set(prev).add(pid));
      console.log(`[LEAD] Explicit request logged for PID: ${pid}`);
    } catch (err) {
      console.warn('Manual lead log failed:', err);
    }
  };

  const handleRequestClick = () => {
    if (leadData && selectedProperty) {
      logLeadManual(selectedProperty._id, leadData);
    }
    setHasRequested(true);
  };

  const handleLeadSubmit = async (e, propertyId) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.mobile || !leadForm.location) {
      alert('Please fill all fields');
      return;
    }

    setIsSubmittingLead(true);
    const pid = propertyId.slice(-4).toUpperCase();
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/realproperties/lead/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...leadForm, propertyId: pid }),
      });

      if (response.ok) {
        const savedData = { ...leadForm };
        localStorage.setItem('realprop_lead', JSON.stringify(savedData));
        setLeadData(savedData);
        setLoggedProperties(prev => new Set(prev).add(pid));
        setHasRequested(true);
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to save details');
      }
    } catch (err) {
      console.error('Lead submission error:', err);
      alert('Network error. Please try again.');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const fetchSubStatus = async (userId) => {
    try {
      await fetch(`${CONFIG.API_BASE_URL}/realproperties/subscription/status/${userId}`);
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
      const priceText = formatPrice(selectedProperty.price);
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
        "sku": selectedProperty._id || "RP-PROP",
        "brand": {
          "@type": "Brand",
          "name": "Real Properties"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "15"
        },
        "review": {
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5"
          },
          "author": {
            "@type": "Person",
            "name": "Verified Buyer"
          }
        },
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
          },
          "hasMerchantReturnPolicy": {
            "@type": "MerchantReturnPolicy",
            "applicableCountry": "IN",
            "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
          },
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingRate": {
              "@type": "MonetaryAmount",
              "value": "0",
              "currency": "INR"
            },
            "shippingDestination": {
              "@type": "DefinedRegion",
              "addressCountry": "IN"
            },
            "deliveryTime": {
              "@type": "ShippingDeliveryTime",
              "handlingTime": {
                "@type": "QuantitativeValue",
                "minValue": 0,
                "maxValue": 1,
                "unitCode": "d"
              },
              "transitTime": {
                "@type": "QuantitativeValue",
                "minValue": 0,
                "maxValue": 1,
                "unitCode": "d"
              }
            }
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

  // Logic to determine contact phone number: Direct property poster
  useEffect(() => {
    const updateContactInfo = async () => {
      if (!selectedProperty) {
        setContactPhone(CONFIG.SUPPORT_PHONE);
        return;
      }

      setIsFetchingPhone(true);
      try {
        const posterMobile = selectedProperty.mobile || selectedProperty.PostedBy;
        if (posterMobile) {
          setContactPhone(String(posterMobile).replace(/\s/g, ''));
        } else {
          setContactPhone(CONFIG.SUPPORT_PHONE.replace(/\s/g, ''));
        }
      } catch (err) {
        console.warn('Error setting contact info:', err);
        setContactPhone(CONFIG.SUPPORT_PHONE.replace(/\s/g, ''));
      } finally {
        setIsFetchingPhone(false);
      }
    };

    updateContactInfo();
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
      }
    };
    const handleSubChange = () => {
      const u = localStorage.getItem('realprop_user');
      if (u) fetchSubStatus(JSON.parse(u).id);
    };

    window.addEventListener('authChange', handleAuthUpdate);
    window.addEventListener('subscriptionChange', handleSubChange);

    const handlePropertyTypeSelected = (e) => {
      setSelectedType(e.detail === 'All Properties' ? 'All' : e.detail);
      const propsSection = document.getElementById('properties');
      if (propsSection) {
        propsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    const handleGlobalSearch = (e) => {
      setSearchTerm(e.detail);
      const propsSection = document.getElementById('properties');
      if (propsSection) {
        propsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    window.addEventListener('propertyTypeSelected', handlePropertyTypeSelected);
    window.addEventListener('globalSearch', handleGlobalSearch);

    return () => {
      window.removeEventListener('authChange', handleAuthUpdate);
      window.removeEventListener('subscriptionChange', handleSubChange);
      window.removeEventListener('propertyTypeSelected', handlePropertyTypeSelected);
      window.removeEventListener('globalSearch', handleGlobalSearch);
    };
  }, []);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) setSearchTerm(q);
    
    const cat = searchParams.get('category');
    if (cat !== null) setSelectedType(cat);
    else setSelectedType('All');
  }, [searchParams]);

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

    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    } else if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} Lakhs`;
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
    const parsedQuery = parseSearchQuery(searchTerm);
    return allProperties.filter((property) => {
      const matchesSearch = matchProperty(property, parsedQuery);

      const matchesType =
        selectedType === 'All' ? true : String(property.propertyType || '').toLowerCase() === selectedType.toLowerCase();

      return matchesType && matchesSearch;
    });
  }, [allProperties, selectedType, searchTerm]);

  const visibleProperties = filteredProperties.slice(0, visibleCount);

  const PropertyCard = ({ property }) => {
    const propertyImages = getAllImages(property);
    const dd = property.dynamicData || {};
    const bhk = dd.bhk || '';
    const area = dd.area || (dd.agricultureDetails?.extent) || (dd.plotLocation ? dd.area : '');
    
    // For subtitle (bhk, area, etc)
    const subtitleParts = [bhk && `${bhk} BHK`, dd.floors ? `${dd.floors} Floors` : '', area].filter(Boolean);
    const subtitle = subtitleParts.length > 0 ? subtitleParts.join(' - ') : (property.propertyType || 'Property');
    
    // For OLX style Date
    const dateObj = new Date(property.createdAt || Date.now());
    const now = new Date();
    const diffDays = Math.floor((now - dateObj) / (1000 * 60 * 60 * 24));
    let dateStr = '';
    if (diffDays === 0) dateStr = 'TODAY';
    else if (diffDays === 1) dateStr = 'YESTERDAY';
    else if (diffDays < 7) dateStr = `${diffDays} DAYS AGO`;
    else dateStr = dateObj.toLocaleDateString('en-IN', { month: 'short', day: '2-digit' }).toUpperCase();

    // Limit title
    let title = property.propertyDetails || property.location || '';
    if (title.length > 50) title = title.slice(0, 50) + '...';

    // Create SEO-friendly slug
    const typeStr = (property.propertyType || 'property').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
    const locStr = (property.location || property.district || 'location').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
    const seoSlug = `${typeStr}-in-${locStr}-${property._id}`;

    return (
      <article className="olx-card" onClick={() => navigate(`/property/${seoSlug}`)}>
        <div className="olx-card-image">
          <ImageCarousel images={propertyImages} altText={property.location || 'Property'} />
        </div>

        <div className="olx-card-body">
          <h3 className="olx-card-price">{formatPrice(property.price)}</h3>
          <p className="olx-card-title">{subtitle}</p>
          <p className="olx-card-desc">{title}</p>
          
          <div className="olx-card-footer">
            <span className="olx-card-location">{property.location || property.district || 'Location'}</span>
            <span className="olx-card-date">{dateStr}</span>
          </div>
        </div>
      </article>
    );
  };

  const PropertySkeleton = () => (
    <div className="v3-skeleton-card">
      <div className="v3-skeleton-image skeleton-box" />
      <div className="v3-skeleton-body">
        <div className="v3-skeleton-badge skeleton-box" />
        <div className="v3-skeleton-price skeleton-box" />
        <div className="v3-skeleton-line long skeleton-box" />
        <div className="v3-skeleton-line mid skeleton-box" />
        <div className="v3-skeleton-footer">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="v3-skeleton-avatar skeleton-box" />
            <div className="v3-skeleton-line short skeleton-box" style={{ width: '60px', marginBottom: 0 }} />
          </div>
          <div className="v3-skeleton-line short skeleton-box" style={{ width: '80px', marginBottom: 0 }} />
        </div>
      </div>
    </div>
  );


  if (loading) {
    return (
      <div className="catalog-section">
        <div className="section-container">
          <div className="v2-header-stack" style={{ opacity: 0.5 }}>
            <span className="section-eyebrow"><Building2 size={14} /> Live Inventory</span>
            <h2 className="v2-title-xl">Finding the best properties for you...</h2>
          </div>
          <div className="property-grid" style={{ marginTop: '2rem' }}>
            {[1, 2, 3, 4, 5, 6].map(i => <PropertySkeleton key={i} />)}
          </div>
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
    <div style={{ paddingTop: '1.5rem', paddingBottom: '2.5rem', overflowX: 'hidden', maxWidth: '100%' }}>
      <div className="section-container">
        <h2 style={{ marginTop: '20px', marginBottom: '20px', fontSize: '24px', fontWeight: 'bold', color: '#002f34' }}>
          {selectedType === 'All' ? 'All Properties' : selectedType}
        </h2>

        {visibleProperties.length > 0 ? (
          <div className="property-grid olx-properties-grid">
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
                    {!hasRequested ? (
                      // 🚀 Step 1: Initial Request Button
                      <button className="btn-primary" style={{ width: '100%', padding: '1.2rem' }} onClick={handleRequestClick}>
                        <MessageCircle size={20} />
                        Request Contact Details
                      </button>
                    ) : !leadData ? (
                      // 📝 Step 2: Lead Collection Form (if guest unknown)
                      <div className="lead-form-container" style={{ marginTop: 0 }}>
                        <div className="lead-form-title">
                          <BadgeCheck size={18} color="var(--primary)" />
                          <span>Unlock Contact Details</span>
                        </div>
                        <p className="lead-form-subtitle">Enter your details to call or WhatsApp the owner directly.</p>
                        <form onSubmit={(e) => handleLeadSubmit(e, sp._id)} className="lead-submission-form">
                          <input
                            type="text"
                            placeholder="Your Name"
                            value={leadForm.name}
                            onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                            required
                          />
                          <input
                            type="tel"
                            placeholder="Mobile Number"
                            value={leadForm.mobile}
                            onChange={(e) => setLeadForm({ ...leadForm, mobile: e.target.value })}
                            required
                          />
                          <input
                            type="text"
                            placeholder="Your Location"
                            value={leadForm.location}
                            onChange={(e) => setLeadForm({ ...leadForm, location: e.target.value })}
                            required
                          />
                          <button type="submit" className="btn-primary lead-submit-btn" disabled={isSubmittingLead}>
                            {isSubmittingLead ? <Loader2 className="spinner" size={18} /> : 'View Contact Details'}
                          </button>
                        </form>
                      </div>
                    ) : (
                      // 📞 Step 3: Contact Actions (Lead Captured & Requested)
                      <div className="contact-actions">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', width: '100%' }}>
                          <a href={`tel:${contactPhone}`} className="contact-btn call-btn">
                            {isFetchingPhone ? <Loader2 className="spinner" size={18} /> : (
                              <>
                                <Phone size={18} />
                                Call Now
                              </>
                            )}
                          </a>
                          <a 
                            href={`https://wa.me/${contactPhone.replace(/\+/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in the property (ID: ${sp._id?.slice(-4).toUpperCase()}) at ${sp.location}. Please share more details.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-btn whatsapp-btn"
                            style={{ background: '#25D366', color: '#fff', border: 'none' }}
                          >
                            <MessageCircle size={18} />
                            WhatsApp
                          </a>
                        </div>
                        <p className="sidebar-note" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '0.8rem' }}>
                          <PhoneCall size={13} /> {contactPhone.length > 10 ? contactPhone : `+91 ${contactPhone}`} &nbsp;|&nbsp; Property ID: {sp._id?.slice(-4).toUpperCase() || 'N/A'}
                        </p>
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
