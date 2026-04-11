import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DollarSign, Home, Image as ImageIcon, Loader2, MapPin, Ruler, Text, X } from 'lucide-react';

const PostPropertyModal = ({ isOpen, onClose, user, onPropertyAdded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    propertyType: 'Sale',
    location: '',
    price: '',
    photo: null,
    propertyDetails: '',
    bedrooms: '',
    bathrooms: '',
    sqft: ''
  });

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (name === 'photo') {
      setFormData((prev) => ({ ...prev, photo: files?.[0] || null }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      setError('You need to sign in before posting a property.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = new FormData();
    payload.append('propertyType', formData.propertyType);
    payload.append('location', formData.location);
    if (formData.price) payload.append('price', formData.price);
    if (formData.propertyDetails) payload.append('propertyDetails', formData.propertyDetails);
    payload.append('PostedBy', user.id || 'realproperties_user');
    payload.append('fullName', user.name);
    payload.append('mobile', user.mobile);
    payload.append('PostedUserType', 'User');
    payload.append(
      'dynamicData',
      JSON.stringify({
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        sqft: formData.sqft
      })
    );

    if (formData.photo) {
      payload.append('photo', formData.photo);
    }

    try {
      const response = await fetch('http://localhost:3000/realproperties/property/add', {
        method: 'POST',
        body: payload
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to post property');
      }

      onPropertyAdded(data.property);
      onClose();
      setFormData({
        propertyType: 'Sale',
        location: '',
        price: '',
        photo: null,
        propertyDetails: '',
        bedrooms: '',
        bathrooms: '',
        sqft: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="sidebar-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-card"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
            style={{ width: 'min(760px, 100%)' }}
          >
            <button
              onClick={onClose}
              className="icon-circle-btn"
              style={{ position: 'absolute', top: '14px', right: '14px' }}
              title="Close"
            >
              <X size={18} />
            </button>

            <div className="modal-header">
              <span className="section-eyebrow">
                <Home size={14} />
                Property Submission
              </span>
              <h2 className="modal-title">Post a property</h2>
              <p className="modal-copy">
                Keep the same feature, but make the workflow feel cleaner and more trustworthy for owners submitting new
                inventory.
              </p>
            </div>

            {error && <div className="status-banner error">{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.9rem', marginTop: '1rem' }}>
              <div className="form-grid-2">
                <div className="input-shell">
                  <label htmlFor="property-type">Property type</label>
                  <div className="input-control">
                    <Home size={18} color="var(--accent)" />
                    <select id="property-type" name="propertyType" value={formData.propertyType} onChange={handleChange}>
                      <option value="Sale">For Sale</option>
                      <option value="Rent">For Rent</option>
                    </select>
                  </div>
                </div>

                <div className="input-shell">
                  <label htmlFor="property-price">Price</label>
                  <div className="input-control">
                    <DollarSign size={18} color="var(--accent)" />
                    <input
                      id="property-price"
                      type="number"
                      name="price"
                      placeholder="e.g. 5000000"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="input-shell">
                <label htmlFor="property-location">Location</label>
                <div className="input-control">
                  <MapPin size={18} color="var(--accent)" />
                  <input
                    id="property-location"
                    type="text"
                    name="location"
                    placeholder="Area, city, landmark, or full address"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="input-shell">
                  <label htmlFor="property-bedrooms">Bedrooms</label>
                  <div className="input-control">
                    <Ruler size={18} color="var(--accent)" />
                    <input
                      id="property-bedrooms"
                      type="number"
                      name="bedrooms"
                      placeholder="Beds"
                      value={formData.bedrooms}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="input-shell">
                  <label htmlFor="property-bathrooms">Bathrooms</label>
                  <div className="input-control">
                    <Ruler size={18} color="var(--accent)" />
                    <input
                      id="property-bathrooms"
                      type="number"
                      name="bathrooms"
                      placeholder="Baths"
                      value={formData.bathrooms}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="input-shell">
                  <label htmlFor="property-sqft">Area (sqft)</label>
                  <div className="input-control">
                    <Ruler size={18} color="var(--accent)" />
                    <input
                      id="property-sqft"
                      type="number"
                      name="sqft"
                      placeholder="Area"
                      value={formData.sqft}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="input-shell">
                <label htmlFor="property-image">Property image</label>
                <div className="input-control">
                  <ImageIcon size={18} color="var(--accent)" />
                  <input id="property-image" type="file" name="photo" accept="image/*" onChange={handleChange} />
                </div>
              </div>

              <div className="input-shell">
                <label htmlFor="property-description">Description</label>
                <div className="input-control">
                  <Text size={18} color="var(--accent)" />
                  <textarea
                    id="property-description"
                    name="propertyDetails"
                    placeholder="Tell buyers what makes this property stand out."
                    value={formData.propertyDetails}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
                {loading ? <Loader2 className="spinner" size={18} /> : 'Submit Property'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PostPropertyModal;
