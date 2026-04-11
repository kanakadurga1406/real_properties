import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Loader2, MapPin, Plus, Tag } from 'lucide-react';
import Navbar from './components/Navbar';
import './App.css';

const fallbackImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80';

const ImageCarousel = ({ images, altText }) => {
  const imageList = images?.length ? images : [fallbackImage];

  return (
    <div className="carousel-container">
      <img
        src={imageList[0]}
        alt={altText}
        className="carousel-image"
        onError={(event) => {
          event.currentTarget.src = fallbackImage;
        }}
      />
      {imageList.length > 1 && (
        <div className="carousel-indicators">
          {imageList.slice(0, 4).map((_, index) => (
            <span key={index} className={`carousel-dot ${index === 0 ? 'active' : ''}`} />
          ))}
        </div>
      )}
    </div>
  );
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

export default function MyPropertiesPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [myProperties, setMyProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('realprop_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchProps = async () => {
      try {
        const response = await fetch('http://localhost:3000/realproperties/property/get');
        if (!response.ok) {
          throw new Error('Unable to fetch your properties');
        }

        const data = await response.json();
        const filtered = data.filter((property) => {
          return property.mobile === currentUser.mobile || property.PostedBy === currentUser.id;
        });

        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMyProperties(filtered);
      } catch (err) {
        console.error('Failed to fetch my properties', err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchProps();
    }
  }, [currentUser]);

  const metrics = useMemo(() => {
    return [
      { label: 'Total listings', value: myProperties.length },
      {
        label: 'With price',
        value: myProperties.filter((property) => property.price).length
      },
      {
        label: 'Recent uploads',
        value: myProperties.filter((property) => {
          if (!property.createdAt) {
            return false;
          }
          const created = new Date(property.createdAt).getTime();
          const sevenDays = 7 * 24 * 60 * 60 * 1000;
          return Date.now() - created < sevenDays;
        }).length
      }
    ];
  }, [myProperties]);

  const getAllImages = (property) => {
    const photoList = [];

    if (Array.isArray(property.photo)) {
      photoList.push(...property.photo);
    } else if (property.photo) {
      photoList.push(property.photo);
    }

    if (Array.isArray(property.newImageUrls)) {
      photoList.push(...property.newImageUrls);
    }

    return photoList.length ? photoList : [fallbackImage];
  };

  return (
    <div className="landing-container">
      <Navbar />

      <div className="my-properties-page">
        <div className="section-container">
          <div className="my-properties-shell">
            <button
              className="page-back-link"
              onClick={() => window.dispatchEvent(new CustomEvent('switchView', { detail: 'home' }))}
            >
              <ArrowLeft size={18} />
              Back to homepage
            </button>

            <div className="my-properties-header">
              <div>
                <span className="section-eyebrow">
                  <Tag size={14} />
                  Owner Dashboard
                </span>
                <h1 className="my-properties-title">My posted properties</h1>
                <p className="v2-p-lg" style={{ marginTop: '0.85rem' }}>
                  A cleaner management view for the same feature set, giving owners a more professional overview of
                  their submissions.
                </p>
              </div>

              {currentUser && (
                <button className="btn-primary" onClick={() => window.dispatchEvent(new CustomEvent('openPostProperty'))}>
                  <Plus size={16} />
                  Add another property
                </button>
              )}
            </div>

            {currentUser && (
              <div className="metric-grid">
                {metrics.map((metric) => (
                  <div key={metric.label} className="metric-card">
                    <span className="metric-card-label">{metric.label}</span>
                    <span className="metric-card-value">{metric.value}</span>
                  </div>
                ))}
              </div>
            )}

            {loading ? (
              <div className="fullscreen-center">
                <div>
                  <Loader2 className="spinner" size={40} />
                  <p className="loading-text">Loading your property dashboard</p>
                </div>
              </div>
            ) : !currentUser ? (
              <div className="empty-state">
                <h3>Please sign in to view your properties</h3>
                <p>Your personal listing dashboard becomes available after login.</p>
              </div>
            ) : myProperties.length === 0 ? (
              <div className="empty-state">
                <h3>No properties posted yet</h3>
                <p>You haven&apos;t submitted any listings yet. Use the redesigned flow to add your first property.</p>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openPostProperty'))}
                  className="btn-primary"
                  style={{ marginTop: '1rem' }}
                >
                  <Plus size={16} />
                  Post your first property
                </button>
              </div>
            ) : (
              <motion.div layout className="property-grid">
                <AnimatePresence>
                  {myProperties.map((property) => {
                    const specs = [
                      property.propertyType || 'Property',
                      property.dynamicData?.bedrooms ? `${property.dynamicData.bedrooms} beds` : null,
                      property.dynamicData?.bathrooms ? `${property.dynamicData.bathrooms} baths` : null,
                      property.dynamicData?.sqft ? `${property.dynamicData.sqft} sqft` : null
                    ].filter(Boolean);

                    return (
                      <motion.article
                        layout
                        key={property._id}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        className="zillow-card glass-card"
                      >
                        <div className="zillow-image-container">
                          <ImageCarousel images={getAllImages(property)} altText={property.location || 'Property'} />
                          <span className="zillow-badge">My Listing</span>
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
                            <span className="zillow-agent-tag">Visible in your owner dashboard</span>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
