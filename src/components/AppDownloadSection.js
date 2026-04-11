import React from 'react';
import { Apple, Play, Smartphone, Sparkles } from 'lucide-react';

const AppDownloadSection = () => {
  return (
    <section className="app-download-section">
      <div className="section-container">
        <div className="app-download-card">
          <div className="app-download-copy">
            <span className="section-eyebrow">
              <Smartphone size={14} />
              Mobile Ready
            </span>
            <h2 className="v2-title-xl" style={{ marginTop: '1rem' }}>
              Continue the same polished experience on the go.
            </h2>
            <p className="v2-p-lg" style={{ marginTop: '1rem' }}>
              The redesign now introduces a more product-led web journey while still connecting users to the existing
              mobile ecosystem for ongoing discovery, inquiries, and property management.
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
              <span className="section-eyebrow">
                <Sparkles size={14} />
                Better Retention
              </span>
              <h4 style={{ marginTop: '1rem' }}>One visual system across web and mobile</h4>
              <p>
                Consistency helps users trust the brand faster, continue their journey on any device, and return with
                less confusion.
              </p>
            </div>

            <div className="preview-stat-grid">
              <div className="preview-card">
                <h4>Responsive</h4>
                <p>Optimized layouts for phones, tablets, laptops, and large screens.</p>
              </div>
              <div className="preview-card">
                <h4>Actionable</h4>
                <p>Built to move users from browsing into inquiry and listing submission.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownloadSection;
