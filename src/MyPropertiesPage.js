import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, BadgeCheck, Calendar, Loader2, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import Navbar from './components/Navbar';
import PostPropertyModal from './components/PostPropertyModal';
import SubscriptionModal from './components/SubscriptionModal';
import CONFIG from './config';
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
  const [subscription, setSubscription] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  const fetchSubStatus = async (userId) => {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/realproperties/subscription/status/${userId}`);
      const data = await res.json();
      setSubscription(data.hasSubscription ? data.subscription : null);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('realprop_user');
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setCurrentUser(u);
      fetchSubStatus(u.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProps = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/realproperties/property/get`);
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

  useEffect(() => {
    fetchProps();
  }, [currentUser]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property listing? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/realproperties/property/delete/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMyProperties((prev) => prev.filter((p) => p._id !== id));
      } else {
        alert('Failed to delete property. Please try again.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('A network error occurred.');
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    if (!subscription) {
      setIsSubModalOpen(true);
      return;
    }
    setEditingProperty(null);
    setIsModalOpen(true);
  };

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
      <Navbar hidePostBtn={true} />

      <div className="my-properties-page">
        <div className="section-container">
          <div className="my-properties-shell">
            <button
              className="page-back-link"
              onClick={() => window.dispatchEvent(new CustomEvent('switchView', { detail: 'home' }))}
            >
              <ArrowLeft size={18} />
              Return to Catalog
            </button>

            <div className="my-properties-header">
              <div>
                <h1 className="my-properties-title">My posted properties</h1>
                <p className="v2-p-lg" style={{ marginTop: '0.85rem' }}>
                  Manage your listings, update details, or remove properties that are no longer available.
                </p>
              </div>

              {currentUser && (
                <button className="btn-primary" onClick={handleOpenAdd}>
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

            {/* Subscription status chip */}
            {currentUser && (
              <div className="sub-status-bar">
                {subscription ? (
                  <>
                    <span className="sub-status-active">
                      <BadgeCheck size={15} />
                      Active Subscription
                    </span>
                    <span className="sub-status-detail">
                      {subscription.postsUsed} / {subscription.postsLimit} posts used
                    </span>
                    <span className="sub-status-detail">
                      <Calendar size={13} />
                      Expires {new Date(subscription.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="sub-status-none">No active subscription</span>
                    <button
                      className="btn-primary sub-status-upgrade-btn"
                      onClick={() => setIsSubModalOpen(true)}
                    >
                      Subscribe — ₹3,650/yr
                    </button>
                  </>
                )}
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
                  onClick={handleOpenAdd}
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
                        className="my-prop-card"
                      >
                        <div className="my-prop-image-area">
                          <ImageCarousel images={getAllImages(property)} altText={property.location || 'Property'} />
                          <div className="my-prop-status">
                            <span className="status-dot"></span> Active
                          </div>
                          <div className="my-prop-actions-overlay">
                            <button 
                              className="action-btn edit-btn" 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleEdit(property); 
                              }}
                            >
                              <Pencil size={15} />
                              Update
                            </button>
                            <button 
                              className="action-btn delete-btn" 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleDelete(property._id); 
                              }}
                            >
                              <Trash2 size={15} />
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className="my-prop-details">
                          <div className="my-prop-header">
                            <h3 className="my-prop-price">{formatPrice(property.price)}</h3>
                            <span className="my-prop-type-pill">{property.propertyType || 'Property'}</span>
                          </div>
                          
                          <p className="my-prop-address">
                            <MapPin size={15} />
                            {property.location || 'Location unavailable'}
                          </p>

                          <div className="my-prop-metrics">
                            {property.dynamicData?.bedrooms && (
                              <div className="metric-item">
                                <span className="metric-val">{property.dynamicData.bedrooms}</span>
                                <span className="metric-lbl">Beds</span>
                              </div>
                            )}
                            {property.dynamicData?.bathrooms && (
                              <div className="metric-item">
                                <span className="metric-val">{property.dynamicData.bathrooms}</span>
                                <span className="metric-lbl">Baths</span>
                              </div>
                            )}
                            {property.dynamicData?.sqft && (
                              <div className="metric-item">
                                <span className="metric-val">{property.dynamicData.sqft}</span>
                                <span className="metric-lbl">Sqft</span>
                              </div>
                            )}
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

      <PostPropertyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={currentUser}
        editData={editingProperty}
        onPropertyAdded={() => {
          fetchProps();
          fetchSubStatus(currentUser?.id);
          setIsModalOpen(false);
        }}
      />

      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        user={currentUser}
        onSubscribed={(sub) => {
          setSubscription(sub);
          setIsSubModalOpen(false);
          // Auto-open add property after subscribing
          setEditingProperty(null);
          setIsModalOpen(true);
        }}
      />
    </div>
  );
}
