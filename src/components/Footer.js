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
              A redesigned real-estate experience focused on clarity, trust, and responsive discovery while preserving
              your existing listing, login, post-property, and direct-contact capabilities.
            </p>

            <div className="footer-socials">
              <a href="https://wealthassociates.com" aria-label="Website">
                <Globe size={18} />
              </a>
              <a href="mailto:wealthassociates.com@gmail.com" aria-label="Email">
                <AtSign size={18} />
              </a>
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
          <span>&copy; {new Date().getFullYear()} RealProperties. Redesigned for stronger user engagement.</span>
          <div className="footer-bottom-links">
            <span>Responsive UX</span>
            <span>Trust-first discovery</span>
            <span>Same core features</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
