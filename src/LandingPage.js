import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import AppDownloadSection from './components/AppDownloadSection';
import NetworkSection from './components/NetworkSection';
import Footer from './components/Footer';
import PropertiesPage from './PropertiesPage';
import SubscriptionBadge from './components/SubscriptionBadge';
import SubscriptionModal from './components/SubscriptionModal';
import PostPropertyModal from './components/PostPropertyModal';
import AuthModal from './components/AuthModal';
import { motion } from 'framer-motion';
import CONFIG from './config';
import './LandingPage.css';

const LandingPage = () => {
  const [heroSearch, setHeroSearch] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [subscription, setSubscription] = useState(null);

  // Modal states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSubOpen, setIsSubOpen] = useState(false);
  const [isPostOpen, setIsPostOpen] = useState(false);

  // Pending action after auth
  const [pendingAction, setPendingAction] = useState(null); // 'post' | 'subscribe'

  // Dynamic SEO Setup
  useEffect(() => {
    document.title = "Real Properties | 100% Approved Plots, Villas & Flats | Real Properties";
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = "Browse 100% legally approved residential and commercial properties across Andhra Pradesh and Telangana. Find plots, villas, flats & land for sale.";
  }, []);

  // Load user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('realprop_user');
    if (stored) {
      const u = JSON.parse(stored);
      setCurrentUser(u);
      fetchSubStatus(u.id);
    }

    const handleAuthChange = () => {
      const next = localStorage.getItem('realprop_user');
      if (next) {
        const u = JSON.parse(next);
        setCurrentUser(u);
        fetchSubStatus(u.id);
      } else {
        setCurrentUser(null);
        setSubscription(null);
      }
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const fetchSubStatus = async (userId) => {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/realproperties/subscription/status/${userId}`);
      const data = await res.json();
      setSubscription(data.hasSubscription ? data.subscription : null);
    } catch {
      // silently ignore
    }
  };

  // Listen for generic auth opening (no pending action)
  useEffect(() => {
    const handleOpenAuth = () => {
      setPendingAction(null);
      setIsAuthOpen(true);
    };
    window.addEventListener('openAuth', handleOpenAuth);
    return () => window.removeEventListener('openAuth', handleOpenAuth);
  }, []);

  // Listen for "openPostProperty" events from Navbar button
  useEffect(() => {
    const handleOpenPost = () => {
      if (!currentUser) {
        setPendingAction('post');
        setIsAuthOpen(true);
        return;
      }
      if (!subscription) {
        setIsSubOpen(true);
        return;
      }
      setIsPostOpen(true);
    };

    window.addEventListener('openPostProperty', handleOpenPost);
    return () => window.removeEventListener('openPostProperty', handleOpenPost);
  }, [currentUser, subscription]);

  // After login, continue with the pending action
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('realprop_user', JSON.stringify(userData));
    window.dispatchEvent(new CustomEvent('authChange'));
    setIsAuthOpen(false);

    fetchSubStatus(userData.id).then(() => {
      // Use a small delay to let state settle
      setTimeout(() => {
        if (pendingAction === 'post') {
          // Re-read subscription after fetch
          fetch(`${CONFIG.API_BASE_URL}/realproperties/subscription/status/${userData.id}`)
            .then((r) => r.json())
            .then((d) => {
              if (d.hasSubscription) {
                setSubscription(d.subscription);
                setIsPostOpen(true);
              } else {
                setSubscription(null);
                setIsSubOpen(true);
              }
            });
        } else if (pendingAction === 'subscribe') {
          setIsSubOpen(true);
        }
        setPendingAction(null);
      }, 300);
    });
  };

  // Floating badge click — auth → sub → post
  const handleSubscribeClick = () => {
    if (!currentUser) {
      setPendingAction('subscribe');
      setIsAuthOpen(true);
      return;
    }
    setIsSubOpen(true);
  };

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

      {/* Floating subscription badge — hidden when already subscribed */}
      <SubscriptionBadge
        user={currentUser}
        subscription={subscription}
        onSubscribeClick={handleSubscribeClick}
      />

      {/* Auth modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => { setIsAuthOpen(false); setPendingAction(null); }}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Subscription modal */}
      <SubscriptionModal
        isOpen={isSubOpen}
        onClose={() => setIsSubOpen(false)}
        user={currentUser}
        onSubscribed={(sub) => {
          setSubscription(sub);
          setIsSubOpen(false);
          // After subscribing, open post modal if that was the intent
          if (pendingAction === 'post') {
            setPendingAction(null);
            setIsPostOpen(true);
          }
        }}
      />

      {/* Post property modal */}
      <PostPropertyModal
        isOpen={isPostOpen}
        onClose={() => setIsPostOpen(false)}
        user={currentUser}
        editData={null}
        onPropertyAdded={() => {
          setIsPostOpen(false);
          // Refresh sub status to update postsUsed
          if (currentUser) fetchSubStatus(currentUser.id);
        }}
      />
    </motion.div>
  );
};

export default LandingPage;
