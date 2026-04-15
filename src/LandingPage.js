import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import AppDownloadSection from './components/AppDownloadSection';
import NetworkSection from './components/NetworkSection';
import Footer from './components/Footer';
import PropertiesPage from './PropertiesPage';
import { motion } from 'framer-motion';
import './LandingPage.css';

const LandingPage = () => {
  const [heroSearch, setHeroSearch] = useState('');

  // Dynamic SEO Setup
  useEffect(() => {
    document.title = "Real Properties | 100% Approved Plots, Villas & Flats | Wealth Associates";
    
    // Update Meta Description dynamically
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = "Browse 100% legally approved residential and commercial properties across Andhra Pradesh and Telangana. Find plots, villas, flats & land for sale.";
  }, []);

  const handleSearch = (term) => {
    setHeroSearch(term);
    setTimeout(() => {
      document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleScrollToProperties = () => {
    document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="landing-container"
    >
      <Navbar onExplore={handleScrollToProperties} />
      <div id="home"><HeroSection onExplore={handleScrollToProperties} onSearch={handleSearch} /></div>
      <div id="features"><FeaturesSection /></div>
      <div id="network"><NetworkSection /></div>
      <div id="properties"><PropertiesPage heroSearchTerm={heroSearch} /></div>
      <div id="contact"><AppDownloadSection /><Footer /></div>
    </motion.div>
  );
};

export default LandingPage;
