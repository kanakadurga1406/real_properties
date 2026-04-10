import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import AppDownloadSection from './components/AppDownloadSection';
import Footer from './components/Footer';
import PropertiesPage from './PropertiesPage';
import { motion } from 'framer-motion';
import './LandingPage.css';

const LandingPage = () => {
  const [heroSearch, setHeroSearch] = useState('');

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
      <div id="properties"><PropertiesPage heroSearchTerm={heroSearch} /></div>
      <div id="contact"><AppDownloadSection /><Footer /></div>
    </motion.div>
  );
};

export default LandingPage;
