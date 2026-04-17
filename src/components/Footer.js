import React from 'react';
import { AtSign, Building2, Globe, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="landing-footer">
      <div className="section-container">
        <div className="footer-shell">
          <div>
            <div className="navbar-logo">
              <div className="logo-icon-wrap">
                <Building2 size={22} />
              </div>
              <span className="logo-text">RealProperties</span>
            </div>

            <p className="footer-brand-copy">
              Direct access to premium plots, residential homes, and commercial opportunities across South India. 
              We bridge the gap between owners and buyers with trust and transparency.
            </p>

            <div className="footer-socials" style={{ display: 'none' }}>
              {/* Social icons removed per user request */}
            </div>
          </div>

          <div>
            <div className="footer-column-title">Coverage</div>
            <ul className="footer-list">
              <li>Andhra Pradesh</li>
              <li>Telangana</li>
              <li>Bengaluru region</li>
              <li>Growth corridors</li>
            </ul>
          </div>

          <div>
            <div className="footer-column-title">Platform</div>
            <ul className="footer-list">
              <li>Search listings</li>
              <li>Post a property</li>
              <li>View my properties</li>
              <li>Mobile apps</li>
            </ul>
          </div>

          <div>
            <div className="footer-column-title">Contact</div>
            <ul className="footer-list">
              <li>
                <a href="tel:7796356789">
                  <Phone size={15} style={{ marginRight: '0.45rem', verticalAlign: 'text-bottom' }} />
                  +91 77963 56789
                </a>
              </li>
              <li>
                <a href="mailto:wealthassociates.com@gmail.com">
                  <Mail size={15} style={{ marginRight: '0.45rem', verticalAlign: 'text-bottom' }} />
                  wealthassociates.com@gmail.com
                </a>
              </li>
              <li>
                <span>
                  <MapPin size={15} style={{ marginRight: '0.45rem', verticalAlign: 'text-bottom' }} />
                  South India focus
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center', textAlign: 'center' }}>
            <span>&copy; {new Date().getFullYear()} Real Properties. Powered by <a href="https://www.wealthassociate.in/" target="_blank" rel="noreferrer" style={{ color: 'inherit', fontWeight: 'bold', textDecoration: 'none' }}>Wealth Associates</a>.</span>
            <span style={{ color: 'var(--text-muted)' }}>Developed by <a href="https://kriyaitsolutions.com/" target="_blank" rel="noreferrer" style={{ color: 'inherit', fontWeight: '800', textDecoration: 'none' }}>Kriya IT Solutions</a></span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
