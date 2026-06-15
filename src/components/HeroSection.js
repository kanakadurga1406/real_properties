import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Building2, IndianRupee, Maximize, Home, ShieldCheck, Users, ChevronRight } from 'lucide-react';
import './HeroSection.css';
import CONFIG from '../config';

// Cityscape at dusk image
const heroImage = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1800&q=80';

const HeroSection = ({ onExplore, onSearch }) => {
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [budget, setBudget] = useState('');
  const [area, setArea] = useState('');

  const [stats, setStats] = useState({
    properties: '10,000+',
    projects: '150+',
    customers: '2,500+'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [propRes, custRes, coreRes, valueRes, wealthRes] = await Promise.all([
          fetch(`${CONFIG.API_BASE_URL}/count/total-approvedproperties`),
          fetch(`${CONFIG.API_BASE_URL}/count/total-customers`),
          fetch(`${CONFIG.API_BASE_URL}/coreproject/getallcoreprojects`),
          fetch(`${CONFIG.API_BASE_URL}/coreproject/getallValueprojects`),
          fetch(`${CONFIG.API_BASE_URL}/coreproject/getallWealthprojects`)
        ]);
        
        const propData = await propRes.json();
        const custData = await custRes.json();
        
        const coreData = coreRes.ok ? await coreRes.json() : [];
        const valueData = valueRes.ok ? await valueRes.json() : [];
        const wealthData = wealthRes.ok ? await wealthRes.json() : [];

        const totalProjects = (Array.isArray(coreData) ? coreData.length : 0) +
                              (Array.isArray(valueData) ? valueData.length : 0) +
                              (Array.isArray(wealthData) ? wealthData.length : 0);
        
        setStats({
          properties: propData.totalAgents ? `${propData.totalAgents}+` : '0',
          projects: totalProjects > 0 ? `${totalProjects}+` : '0', 
          customers: custData.totalAgents ? `${custData.totalAgents}+` : '0'
        });
      } catch (err) {
        console.error('Failed to fetch hero stats:', err);
      }
    };
    fetchStats();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParts = [location, propertyType, budget, area].filter(Boolean);
    const query = queryParts.join(' ');
    if (query) {
      onSearch(query);
    } else {
      onExplore();
    }
  };

  const handlePillClick = (loc) => {
    onSearch(loc);
  };

  return (
    <section id="home" className="hero-section-new">
      <div className="hero-bg-new" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="hero-overlay-new"></div>
      </div>

      <div className="hero-content-new section-container">
        <motion.div
          className="hero-text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="hero-title-new">
            Find Verified Properties<br />
            Across <span className="hero-highlight-new">AP & TS</span>
          </h1>
          <p className="hero-subtitle-new">Buy &bull; Sell &bull; Invest</p>
        </motion.div>

        <motion.div
          className="hero-search-wrapper"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <form className="hero-search-bar" onSubmit={handleSearch}>
            <div className="search-field">
              <div className="field-icon"><MapPin size={20} /></div>
              <div className="field-inputs">
                <label>Location</label>
                <select value={location} onChange={(e) => setLocation(e.target.value)}>
                  <option value="">Select Location</option>
                  <option value="Vijayawada">Vijayawada</option>
                  <option value="Guntur">Guntur</option>
                  <option value="Visakhapatnam">Visakhapatnam</option>
                </select>
              </div>
            </div>
            
            <div className="field-divider"></div>

            <div className="search-field">
              <div className="field-icon"><Building2 size={20} /></div>
              <div className="field-inputs">
                <label>Property Type</label>
                <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                  <option value="">Select Type</option>
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Land">Land</option>
                  <option value="Villa">Villa</option>
                </select>
              </div>
            </div>

            <div className="field-divider"></div>

            <div className="search-field">
              <div className="field-icon"><IndianRupee size={20} /></div>
              <div className="field-inputs">
                <label>Budget</label>
                <select value={budget} onChange={(e) => setBudget(e.target.value)}>
                  <option value="">Select Budget</option>
                  <option value="Under 20 Lakhs">Under 20 Lakhs</option>
                  <option value="20 - 50 Lakhs">20 - 50 Lakhs</option>
                  <option value="50 Lakhs - 1 Crore">50 Lakhs - 1 Crore</option>
                  <option value="Above 1 Crore">Above 1 Crore</option>
                </select>
              </div>
            </div>

            <div className="field-divider"></div>

            <div className="search-field">
              <div className="field-icon"><Maximize size={20} /></div>
              <div className="field-inputs">
                <label>Area</label>
                <select value={area} onChange={(e) => setArea(e.target.value)}>
                  <option value="">Select Area</option>
                  <option value="Under 1000 sqft">Under 1000 sqft</option>
                  <option value="1000 - 2000 sqft">1000 - 2000 sqft</option>
                  <option value="Above 2000 sqft">Above 2000 sqft</option>
                </select>
              </div>
            </div>

            <button type="submit" className="search-submit-btn">
              <Search size={18} />
              Search Properties
            </button>
          </form>

          <div className="popular-searches">
            <span>Popular Searches:</span>
            <div className="search-pills">
              {['Gannavaram', 'Poranki', 'Mangalagiri', 'Benz Circle', 'Tadigadapa', 'Kankipadu', 'Gudivada'].map(loc => (
                <button key={loc} type="button" className="pill-btn" onClick={() => handlePillClick(loc)}>
                  {loc}
                </button>
              ))}
              <button type="button" className="pill-btn icon-only" onClick={onExplore}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="hero-stats-wrapper section-container">
        <motion.div 
          className="hero-stats-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="stat-block">
            <div className="stat-icon-wrap"><Home size={24} /></div>
            <div className="stat-text">
              <h4>{stats.properties}</h4>
              <p>Properties Listed</p>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-block">
            <div className="stat-icon-wrap"><Building2 size={24} /></div>
            <div className="stat-text">
              <h4>{stats.projects}</h4>
              <p>Projects</p>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-block">
            <div className="stat-icon-wrap"><Users size={24} /></div>
            <div className="stat-text">
              <h4>{stats.customers}</h4>
              <p>Happy Customers</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
