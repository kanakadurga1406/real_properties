import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import CONFIG from './config';
import './SlideshowPage.css';

const fallbackImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1920&q=80';

const SlideshowPage = () => {
  const [allFetchedProperties, setAllFetchedProperties] = useState([]);
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedConstituency = searchParams.get('constituency') || 'All';

  const properties = useMemo(() => {
    if (!selectedConstituency || selectedConstituency === 'All') return allFetchedProperties;
    
    const target = selectedConstituency.toLowerCase();
    
    return allFetchedProperties.filter(p => {
      // Handle corrupted data like "[object Object]" by stringifying safely
      const c1 = typeof p.Constituency === 'string' ? p.Constituency.toLowerCase() : '';
      const c2 = p.dynamicData?.Constituency && typeof p.dynamicData.Constituency === 'string' 
        ? p.dynamicData.Constituency.toLowerCase() 
        : '';
        
      if (c1 === target || c2 === target) return true;
      
      // Fallback to searching inside location or district since some properties have missing constituency fields
      const loc = p.location ? String(p.location).toLowerCase() : '';
      const dist = p.district ? String(p.district).toLowerCase() : '';
      
      if (loc.includes(target) || dist.includes(target)) return true;
      
      return false;
    });
  }, [allFetchedProperties, selectedConstituency]);

  const getAllImagesList = (property) => {
    if (!property) return [fallbackImage];
    const normalized = [];
    const pushValue = (value) => {
      if (!value) return;
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

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        let approved = [];
        try {
          const res = await fetch(`${CONFIG.API_BASE_URL}/properties/getApproveProperty`);
          if (res.ok) {
            const data = await res.json();
            approved = Array.isArray(data) ? data : data.properties || [];
            approved = approved.map(p => ({ ...p, isApproved: true }));
          }
        } catch (err) {
          console.warn('Approved fetch error:', err);
        }

        let community = [];
        try {
          const res = await fetch(`${CONFIG.API_BASE_URL}/realproperties/property/get`);
          if (res.ok) {
            const data = await res.json();
            community = Array.isArray(data) ? data : [];
            community = community.map(p => ({ ...p, isApproved: false }));
          }
        } catch (err) {
          console.warn('Community fetch error:', err);
        }

        const allProps = [...approved, ...community].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAllFetchedProperties(allProps);
      } catch (err) {
        setError('Failed to load properties for slideshow.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    if (properties.length === 0) return;

    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevImageIndex) => {
        const currentProperty = properties[currentPropertyIndex];
        const images = getAllImagesList(currentProperty);
        
        if (prevImageIndex < images.length - 1) {
          return prevImageIndex + 1;
        } else {
          setCurrentPropertyIndex((prevPropIndex) => (prevPropIndex + 1) % properties.length);
          return 0;
        }
      });
    }, 4000); // 4 seconds per image

    return () => clearInterval(intervalId);
  }, [properties, currentPropertyIndex]);

  const formatPrice = (priceStr) => {
    if (!priceStr) return 'Price on request';
    const num = parseInt(String(priceStr).replace(/,/g, ''), 10);
    if (Number.isNaN(num)) return priceStr;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} Lakhs`;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };

  if (loading) {
    return (
      <div className="slideshow-loading">
        <div className="loader-spinner"></div>
        <p>Loading presentation...</p>
      </div>
    );
  }

  if (error || properties.length === 0) {
    return (
      <div className="slideshow-page">
        <div className="slideshow-error">
          <p>{error || 'No properties available for slideshow.'}</p>
        </div>
      </div>
    );
  }

  const currentProperty = properties[currentPropertyIndex];
  const images = getAllImagesList(currentProperty);
  const imageUrl = images[currentImageIndex] || fallbackImage;

  let title = currentProperty.propertyDetails || currentProperty.location || '';
  if (title.trim().toLowerCase() === 'no details' || !title) {
    title = currentProperty.location || currentProperty.district || '';
  }

  const dd = currentProperty.dynamicData || {};
  const bhk = dd.bhk ? `${dd.bhk} BHK` : '';
  const area = dd.area || (dd.agricultureDetails?.extent) || (dd.plotLocation ? dd.area : '');
  const subtitle = [bhk, currentProperty.propertyType, area].filter(Boolean).join(' • ');

  return (
    <div className="slideshow-page">
      <div className="slideshow-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={`prop-${currentPropertyIndex}`}
            className="slideshow-slide"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <AnimatePresence>
              <motion.div 
                key={`img-${currentImageIndex}`}
                className="slideshow-bg"
                style={{ backgroundImage: `url(${imageUrl})` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              />
            </AnimatePresence>
            <div className="slideshow-overlay"></div>
            
            <div className="slideshow-content">
              <div className="slideshow-badges">
                {currentProperty.isApproved ? (
                  <motion.div 
                    className="slideshow-badge badge-approved"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <CheckCircle2 size={18} strokeWidth={2.5} />
                    Verified Approved
                  </motion.div>
                ) : (
                  <motion.div 
                    className="slideshow-badge badge-unverified"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <AlertCircle size={18} strokeWidth={2.5} />
                    Community Listing
                  </motion.div>
                )}
              </div>

              <motion.h1 
                className="slideshow-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {title}
              </motion.h1>

              <motion.div 
                className="slideshow-price"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {formatPrice(currentProperty.price)}
              </motion.div>

              <motion.div 
                className="slideshow-meta"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <span className="meta-item"><Building2 size={24} /> {subtitle}</span>
                <span className="meta-item"><MapPin size={24} /> {currentProperty.location || currentProperty.district || 'Location'}</span>
              </motion.div>
            </div>
            
            <div className="slideshow-progress">
               <motion.div 
                  className="progress-bar-fill"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: images.length * 4, ease: "linear" }}
                  key={`progress-${currentPropertyIndex}`}
               />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SlideshowPage;
