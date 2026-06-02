import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import MyPropertiesPage from './MyPropertiesPage';
import PropertyDetailsPage from './PropertyDetailsPage';
import './App.css'; 

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSwitch = (e) => {
      if (e.detail === 'home') navigate('/');
      if (e.detail === 'my_properties') navigate('/my-properties');
    };
    window.addEventListener('switchView', handleSwitch);
    return () => window.removeEventListener('switchView', handleSwitch);
  }, [navigate]);

  return (
    <div className="app-root">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/my-properties" element={<MyPropertiesPage />} />
        <Route path="/property/:id" element={<PropertyDetailsPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
