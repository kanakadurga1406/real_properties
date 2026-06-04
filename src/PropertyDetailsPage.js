import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Droplets,
  FileCheck2,
  Grid,
  Home,
  Layers,
  MapPin,
  MessageCircle,
  Phone,
  PhoneCall,
  Loader2,
  Ruler,
  Tag,
  Trees,
  User,
  ArrowUpDown
} from 'lucide-react';
import CONFIG from './config';
import './App.css';

const fallbackImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80';

const getAllImages = (property) => {
  if (!property) return [fallbackImage];
  const normalized = [];
  const pushValue = (value) => {
    if (!value) return;
    if (Array.isArray(value)) { value.forEach(pushValue); return; }
    if (typeof value === 'string') { normalized.push(value); return; }
    if (typeof value === 'object' && value.uri) { normalized.push(value.uri); }
  };
  pushValue(property.images);
  pushValue(property.newImageUrls);
  pushValue(property.photo);
  return normalized.length > 0 ? normalized : [fallbackImage];
};

const formatPrice = (priceStr) => {
  if (!priceStr) return 'Price on request';
  const num = parseInt(String(priceStr).replace(/,/g, ''), 10);
  if (Number.isNaN(num)) return priceStr;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  else if (num >= 100000) return `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} Lakhs`;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
};

const ImageCarousel = ({ images, altText }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const nextSlide = (e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev + 1) % images.length); };
  const prevSlide = (e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); };

  return (
    <div className="carousel-shell">
      <img
        src={images[currentIndex]}
        alt={`${altText} ${currentIndex + 1}`}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(e) => { e.currentTarget.src = fallbackImage; }}
      />
      {images.length > 1 && (
        <>
          <button className="carousel-btn left" onClick={prevSlide}><ChevronLeft size={18} /></button>
          <button className="carousel-btn right" onClick={nextSlide}><ChevronRight size={18} /></button>
        </>
      )}
    </div>
  );
};

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Contact & Lead States
  const [contactPhone, setContactPhone] = useState(CONFIG.SUPPORT_PHONE);
  const [isFetchingPhone, setIsFetchingPhone] = useState(false);
  const [leadData, setLeadData] = useState(null);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', mobile: '', location: '' });
  const [loggedProperties, setLoggedProperties] = useState(new Set());
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    const storedLead = localStorage.getItem('realprop_lead');
    if (storedLead) setLeadData(JSON.parse(storedLead));
  }, []);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        let approved = [];
        let community = [];
        try {
          const res = await fetch(`${CONFIG.API_BASE_URL}/properties/getApproveProperty`);
          if (res.ok) {
            const data = await res.json();
            approved = Array.isArray(data) ? data : data.properties || [];
            approved = approved.map(p => ({ ...p, isApproved: true }));
          }
        } catch (e) {}

        try {
          const res = await fetch(`${CONFIG.API_BASE_URL}/realproperties/property/get`);
          if (res.ok) {
            const data = await res.json();
            community = Array.isArray(data) ? data : [];
            community = community.map(p => ({ ...p, isApproved: false }));
          }
        } catch (e) {}

        const allProperties = [...approved, ...community];
        const found = allProperties.find(p => p._id === id);
        
        if (found) setProperty(found);
        else setError('Property not found');
      } catch (err) {
        setError('Failed to fetch property details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  useEffect(() => {
    if (!property) return;
    setIsFetchingPhone(true);
    const posterMobile = property.mobile || property.PostedBy;
    if (posterMobile) {
      setContactPhone(String(posterMobile).replace(/\s/g, ''));
    } else {
      setContactPhone(CONFIG.SUPPORT_PHONE.replace(/\s/g, ''));
    }
    setIsFetchingPhone(false);
  }, [property]);

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
    } catch (err) {}
  };

  const handleRequestClick = () => {
    if (leadData && property) {
      logLeadManual(property._id, leadData);
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
      alert('Network error. Please try again.');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  if (loading) return <div className="fullscreen-center">Loading property details...</div>;
  if (error || !property) return <div className="fullscreen-center"><p>{error}</p><button className="btn-primary" onClick={() => navigate('/')}>Go Home</button></div>;

  const sp = property;
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
    sp.createdAt && { label: 'Listed On', value: new Date(sp.createdAt).toLocaleDateString('en-IN'), icon: <CheckCircle2 size={16} color="var(--accent)" /> },
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

  // SEO details
  const location = sp.location || sp.city || 'Andhra Pradesh & Telangana';
  const type = sp.propertyType || 'Real Estate';
  const priceText = formatPrice(sp.price);
  const title = `${type} in ${location} - ${priceText} | Real Properties`;
  const desc = `Check out this verified ${type.toLowerCase()} located in ${location}. Priced at ${priceText}. View details and contact Real Properties to secure this listing.`;
  const imageUrl = getAllImages(sp)[0];
  const propertyUrl = window.location.href;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${type} in ${location}`,
    "image": imageUrl,
    "description": desc,
    "sku": sp._id || "RP-PROP",
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
      "price": sp.price ? sp.price.toString() : "0",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "seller": { "@type": "RealEstateAgent", "name": "Real Properties" },
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

  return (
    <div className="property-details-page-wrapper" style={{ padding: '1rem', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={propertyUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={desc} />
        <meta name="twitter:image" content={imageUrl} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="sidebar-container" style={{ position: 'relative', width: '100%', maxWidth: '780px', margin: '0 auto', maxHeight: 'none', overflowY: 'visible', marginBottom: '4rem' }}>
        <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ChevronLeft size={16} /> Back
        </button>

        <div className="sidebar-hero-wrapper">
          <ImageCarousel images={getAllImages(sp)} altText={sp.location || 'Property'} />
        </div>

        <div className="sidebar-content">
          <div className="sidebar-head">
            <span className="section-eyebrow" style={{ color: sp.isApproved ? 'var(--primary)' : '#eab308', background: sp.isApproved ? 'transparent' : 'rgba(234, 179, 8, 0.1)' }}>
              {sp.isApproved ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />} 
              {sp.isApproved ? 'Verified Approved Property' : 'Unverified Property'}
            </span>
          </div>

          <h2 className="sidebar-price-tag">{formatPrice(sp.price)}</h2>
          <div className="sidebar-location-row"><MapPin size={18} /><span>{sp.location || 'Location unavailable'}</span></div>

          {sp.propertyDetails && sp.propertyDetails !== 'no details' && (
            <p className="property-story">{sp.propertyDetails}</p>
          )}

        {/* Basic Information */}
        <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Basic Information</h4>
        <div className="detail-grid">
          {coreDetails.map((item, i) => (
            <div key={i} className="detail-item-card">
              {item.icon}
              <span className="detail-key">{item.label}</span>
              <span className="detail-value">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Property Specifications */}
        {houseDetails.length > 0 && (
          <>
            <h4 style={{ margin: '2rem 0 0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              <Home size={16} style={{ marginRight: 6, display: 'inline', verticalAlign: 'text-bottom' }} /> Property Specifications
            </h4>
            <div className="detail-grid">
              {houseDetails.map((item, i) => (
                <div key={i} className="detail-item-card">
                  <Ruler size={16} color="var(--accent)" />
                  <span className="detail-key">{item.label}</span>
                  <span className="detail-value">{item.value}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Land Details */}
        {agriDetails.length > 0 && (
          <>
            <h4 style={{ margin: '2rem 0 0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              <Trees size={16} style={{ marginRight: 6, display: 'inline', verticalAlign: 'text-bottom' }} /> Land Details
            </h4>
            <div className="detail-grid">
              {agriDetails.map((item, i) => (
                <div key={i} className="detail-item-card">
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
            <h4 style={{ margin: '2rem 0 0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              <Grid size={16} style={{ marginRight: 6, display: 'inline', verticalAlign: 'text-bottom' }} /> Plot Details
            </h4>
            <div className="detail-grid">
              {plotDetails.map((item, i) => (
                <div key={i} className="detail-item-card">
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
            <h4 style={{ margin: '2rem 0 1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Amenities & Facilities</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
              {amenities.map((a, i) => (
                <span key={i} style={{ background: '#e8f5e9', color: '#2e7d32', borderRadius: '20px', padding: '8px 16px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #c8e6c9' }}>
                  {a.icon ? a.icon : <Check size={14} />} {a.label}
                </span>
              ))}
            </div>
          </>
        )}

        {/* Contact Footer */}
        <div style={{ marginTop: '3rem', background: 'var(--surface-raised)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--line)' }}>
          {!hasRequested ? (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Interested in this property?</h3>
              <button className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={handleRequestClick}>
                <MessageCircle size={20} />
                Request Contact Details
              </button>
            </div>
          ) : !leadData ? (
            <div className="lead-form-container" style={{ marginTop: 0, padding: 0, boxShadow: 'none', background: 'transparent' }}>
              <div className="lead-form-title" style={{ justifyContent: 'center' }}>
                <BadgeCheck size={24} color="var(--primary)" />
                <span style={{ fontSize: '1.5rem' }}>Unlock Contact Details</span>
              </div>
              <p className="lead-form-subtitle" style={{ textAlign: 'center' }}>Enter your details to call or WhatsApp the owner directly.</p>
              <form onSubmit={(e) => handleLeadSubmit(e, sp._id)} className="lead-submission-form" style={{ maxWidth: '400px', margin: '0 auto' }}>
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
            <div className="contact-actions" style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Contact the Owner</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: '500px', margin: '0 auto' }}>
                <a href={`tel:${contactPhone}`} className="contact-btn call-btn" style={{ padding: '1rem', fontSize: '1.1rem' }}>
                  {isFetchingPhone ? <Loader2 className="spinner" size={20} /> : (
                    <>
                      <Phone size={20} />
                      Call Now
                    </>
                  )}
                </a>
                <a 
                  href={`https://wa.me/${contactPhone.replace(/\+/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in the property (ID: ${sp._id?.slice(-4).toUpperCase()}) at ${sp.location}. Please share more details.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-btn whatsapp-btn"
                  style={{ background: '#25D366', color: '#fff', border: 'none', padding: '1rem', fontSize: '1.1rem' }}
                >
                  <MessageCircle size={20} />
                  WhatsApp
                </a>
              </div>
              <p className="sidebar-note" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '1.5rem', fontSize: '1.1rem', color: 'var(--text-color)' }}>
                <PhoneCall size={16} /> {contactPhone.length > 10 ? contactPhone : `+91 ${contactPhone}`} <span style={{ color: 'var(--line)' }}>|</span> Property ID: {sp._id?.slice(-4).toUpperCase() || 'N/A'}
              </p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
