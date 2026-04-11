import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import MyPropertiesPage from './MyPropertiesPage';
import './App.css'; 

function App() {
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    const handleSwitch = (e) => setCurrentView(e.detail);
    window.addEventListener('switchView', handleSwitch);
    return () => window.removeEventListener('switchView', handleSwitch);
  }, []);

  return (
    <div className="app-root">
      {currentView === 'home' ? <LandingPage /> : <MyPropertiesPage />}
    </div>
  );
}

export default App;
