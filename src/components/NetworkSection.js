import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Star, Briefcase, Users, Loader2, Building2 } from 'lucide-react';
import '../LandingPage.css'; // Leverage existing colors and utility classes

const API_URL = 'https://api.wealthassociate.in';

const NetworkSection = () => {
  const [activeTab, setActiveTab] = useState('coreProjects');
  const [data, setData] = useState({
    coreProjects: [],
    valueProjects: [],
    coreClients: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNetworkData = async () => {
      setLoading(true);
      try {
        const [coreRes, valueRes, clientsRes] = await Promise.all([
          fetch(`${API_URL}/coreproject/getallcoreprojects`),
          fetch(`${API_URL}/coreproject/getallValueprojects`),
          fetch(`${API_URL}/coreclient/getallcoreclients`)
        ]);

        const core = coreRes.ok ? await coreRes.json() : [];
        const val = valueRes.ok ? await valueRes.json() : [];
        const cli = clientsRes.ok ? await clientsRes.json() : [];

        setData({
          coreProjects: Array.isArray(core) ? core : [],
          valueProjects: Array.isArray(val) ? val : [],
          coreClients: Array.isArray(cli) ? cli : []
        });
      } catch (err) {
        console.error('Failed to fetch network data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkData();
  }, []);

  const handleOpenLink = (url) => {
    if (url) {
      // In a real web app we can just open in a new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert("Website link not available");
    }
  };

  const tabs = [
    { id: 'coreProjects', label: 'Core Projects', icon: <Star size={16} />, items: data.coreProjects },
    { id: 'valueProjects', label: 'Value Projects', icon: <Briefcase size={16} />, items: data.valueProjects },
    { id: 'coreClients', label: 'Core Clients', icon: <Users size={16} />, items: data.coreClients },
  ];

  const currentItems = tabs.find(t => t.id === activeTab)?.items || [];

  return (
    <section id="network" className="network-section" style={{ padding: '6rem 0', background: 'var(--surface-strong)' }}>
      <div className="section-container">
        <div className="v2-header-stack" style={{ textAlign: 'center', alignItems: 'center' }}>
          <span className="section-eyebrow">
            <Building2 size={14} />
            Partner Network
          </span>
          <h2 className="v2-title-xl">
            Explore our trusted ecosystem.
          </h2>
          <p className="v2-p-lg section-subcopy" style={{ maxWidth: '800px', margin: '1rem auto' }}>
            Discover our core development projects, high-value investment opportunities, and the prestigious clients we work with.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="network-tabs" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              aria-label={`View ${tab.label}`}
              onClick={() => setActiveTab(tab.id)}
              className={`network-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.8rem 1.4rem', borderRadius: '30px',
                background: activeTab === tab.id ? 'var(--accent)' : 'var(--surface)',
                color: activeTab === tab.id ? '#ffffff' : 'var(--text)',
                border: `1px solid ${activeTab === tab.id ? 'var(--accent)' : 'var(--line)'}`,
                fontWeight: 600, fontSize: '0.95rem',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
            >
              {tab.icon} {tab.label}
              <span style={{ 
                background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'var(--bg-soft)', 
                padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', marginLeft: '4px' 
              }}>
                {tab.items.length}
              </span>
            </button>
          ))}
        </div>

        {/* Content area */}
        <div style={{ minHeight: '300px' }}>
          {loading ? (
            <div className="fullscreen-center" style={{ minHeight: '200px' }}>
              <Loader2 className="spinner" size={32} color="var(--accent)" />
              <p style={{ marginTop: '1rem', color: 'var(--text-soft)' }}>Loading network data...</p>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="empty-state" style={{ margin: '0 auto', maxWidth: '600px' }}>
              <h3>No {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} available</h3>
              <p>Check back later for updates.</p>
            </div>
          ) : (
            <motion.div 
              className="network-grid" 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
                gap: '1.5rem' 
              }}
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <AnimatePresence>
                {currentItems.map(item => (
                  <motion.div
                    key={item._id}
                    layout
                    whileHover={{ y: -6 }}
                    className="zillow-card"
                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}
                    onClick={() => handleOpenLink(item.website || item.trueUrl)}
                  >
                    <div className="zillow-image-container" style={{ aspectRatio: '16/10', padding: '1.2rem', background: '#ffffff', borderBottom: '1px solid var(--line-soft)' }}>
                      <img 
                        src={item.newImageUrl || item.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'} 
                        alt={item.projectName || item.city || 'Partner'} 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                      <div className="zillow-badge" style={{ display: 'flex', alignItems: 'center', gap: '5px', top: '10px', left: '10px', background: 'var(--surface-contrast)', color: '#ffffff', border: 'none', padding: '6px 12px' }}>
                        <ExternalLink size={12} strokeWidth={2.5} /> <span style={{ fontWeight: 'bold' }}>Visit</span>
                      </div>
                    </div>
                    
                    {activeTab !== 'coreClients' && (
                      <div className="zillow-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.4rem' }}>
                        <h3 className="zillow-price" style={{ fontSize: '1.15rem', lineHeight: '1.3', color: 'var(--text)', marginBottom: '0.3rem' }}>{item.city || 'Project Location'}</h3>
                        <p className="zillow-address" style={{ marginTop: '0', color: 'var(--text-soft)', fontSize: '0.9rem', lineHeight: '1.5' }}>{item.projectName || 'Premium Development'}</p>
                        
                        {item.trueUrl && (
                          <div style={{ width: '100%', marginTop: 'auto', paddingTop: '1.2rem' }}>
                            <button 
                              className="btn-primary" 
                              aria-label={`Open True Sale platform for ${item.projectName || item.city}`}
                              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9rem', width: '100%', background: '#4F46E5', color: '#ffffff', border: 'none', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)' }}
                              onClick={(e) => { e.stopPropagation(); handleOpenLink(item.trueUrl); }}
                            >
                              True Sale Platform
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NetworkSection;
