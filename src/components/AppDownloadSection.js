import React from 'react';
import { Apple, Play, Smartphone, Sparkles } from 'lucide-react';

const AppDownloadSection = () => {
  return (
    <section className="app-download-section">
      <div className="section-container">
        <div className="app-download-card">
          <div className="app-download-copy">

            <h2 className="v2-title-xl" style={{ marginTop: '1rem' }}>
              Manage your property journey on any device.
            </h2>
            <p className="v2-p-lg" style={{ marginTop: '1rem' }}>
              Download the Real Properties app to receive instant alerts on new listings, track your 
              inquiries, and manage your property portfolio with ease from anywhere in the world.
            </p>

            <div className="app-download-actions">
              <a
                href="https://play.google.com/store/apps/details?id=com.wealthassociates.alpha"
                target="_blank"
                rel="noreferrer"
                className="btn-outline store-button"
              >
                <Play size={22} />
                <span>
                  <small>Android App</small>
                  <strong>Google Play</strong>
                </span>
              </a>

              <a
                href="https://apps.apple.com/us/app/wealth-associate/id6743356719"
                target="_blank"
                rel="noreferrer"
                className="btn-outline store-button"
              >
                <Apple size={22} />
                <span>
                  <small>iOS App</small>
                  <strong>App Store</strong>
                </span>
              </a>
            </div>
          </div>

          <div className="app-download-preview">
            <div className="preview-card">

              <h4 style={{ marginTop: '1rem' }}>Stay connected to the market 24/7</h4>
              <p>
                Receive real-time updates on property price changes, new launches, and exclusive 
                investment opportunities directly on your phone.
              </p>
            </div>

            <div className="preview-stat-grid">
              <div className="preview-card">
                <h4>Real-time Alerts</h4>
                <p>Instant notifications for price drops and verified buyer interests.</p>
              </div>
              <div className="preview-card">
                <h4>Direct Actions</h4>
                <p>Directly call owners or schedule site visits with a single tap.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownloadSection;
