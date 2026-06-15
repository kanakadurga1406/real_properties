import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Plus, User, Search } from 'lucide-react';
import './NavbarOLX.css'; // We will create this file for the specific styles
import CONFIG from '../config';
import { parseSearchQuery, matchProperty } from '../utils/searchUtils';

const initialNavLinks = [
  { name: 'FLAT (APARTMENT)', id: 'flat' },
  { name: 'HOUSE (INDIVIDUAL)', id: 'house' },
  { name: 'LAND (OPENSITE)', id: 'land' },
  { name: 'COMMERCIAL PROPERTY', id: 'commercial-property' },
  { name: 'COMMERCIAL LAND', id: 'commercial-land' },
  { name: 'AGRICULTURE LAND', id: 'agriculture-land' },
  { name: 'PLOT (LAYOUT)', id: 'plot' },
  { name: 'VILLA', id: 'villa' }
];

const Navbar = ({ onExplore, hidePostBtn = false }) => {
  const [user, setUser] = useState(null);
  const [navLinks, setNavLinks] = useState(initialNavLinks);
  const [activeType, setActiveType] = useState(null);
  const [allProperties, setAllProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);
  const categoryScrollRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearchQuery(q);
    const cat = searchParams.get('category');
    if (cat) setActiveType(cat);
    else setActiveType('All Properties');
  }, [searchParams]);

  // Horizontal scroll for categories using mouse wheel
  useEffect(() => {
    const el = categoryScrollRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        const canScrollLeft = el.scrollLeft > 0;
        const canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 1; // -1 for subpixel rounding
        
        // If we're scrolling down and can scroll right, or scrolling up and can scroll left
        if ((e.deltaY > 0 && canScrollRight) || (e.deltaY < 0 && canScrollLeft)) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
        }
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {

    const storedUser = localStorage.getItem('realprop_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const handleAuthChange = () => {
      const nextUser = localStorage.getItem('realprop_user');
      setUser(nextUser ? JSON.parse(nextUser) : null);
    };

    window.addEventListener('authChange', handleAuthChange);

    // Fetch dynamic property types from backend
    const fetchPropertyTypes = async () => {
      try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/properties/getApproveProperty`);
        if (response.ok) {
          const data = await response.json();
          const properties = Array.isArray(data) ? data : (data.properties || []);
          setAllProperties(properties);
          const uniqueTypes = [...new Set(properties.map(p => p.propertyType).filter(Boolean))];
          
          if (uniqueTypes.length > 0) {
            setNavLinks([
              { name: 'All Properties', id: 'all' },
              ...uniqueTypes.map(type => ({ 
                name: type, 
                id: type.toLowerCase().replace(/[^a-z0-9]/g, '-') 
              }))
            ]);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch property types for navbar', err);
      }
    };
    
    fetchPropertyTypes();

    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const parsedQuery = parseSearchQuery(searchQuery);
    const matches = allProperties.filter((property) => matchProperty(property, parsedQuery));

    // Extract unique labels to avoid huge lists of duplicate names
    const uniqueMatches = [];
    const seen = new Set();
    matches.forEach(p => {
      const dd = p.dynamicData || {};
      const agri = dd.agricultureDetails || {};
      const area = dd.area || dd.totalArea || agri.extent || '';
      
      // Combine key fields to create a unique fingerprint for the suggestion
      const fingerprint = `${p.location || ''}-${p.propertyType || ''}-${area}-${p.price || ''}`;
      
      if (!seen.has(fingerprint)) {
        seen.add(fingerprint);
        uniqueMatches.push({
          ...p,
          sugTitle: p.location || p.district || p.propertyType,
          sugSub: [p.propertyType, area, p.price ? `₹${p.price}` : ''].filter(Boolean).join(' • ')
        });
      }
    });

    return uniqueMatches.slice(0, 5); // Return top 5 suggestions
  }, [searchQuery, allProperties]);

  const executeSearch = (term) => {
    setSearchQuery(term);
    setShowSuggestions(false);
    
    const params = new URLSearchParams(searchParams);
    if (term) params.set('search', term);
    else params.delete('search');
    
    navigate(`/?${params.toString()}`);
    window.dispatchEvent(new CustomEvent('globalSearch', { detail: term }));
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      executeSearch(searchQuery);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('realprop_user');
    setUser(null);
    setMobileMenuOpen(false);
    window.dispatchEvent(new CustomEvent('authChange'));
    window.dispatchEvent(new CustomEvent('switchView', { detail: 'home' }));
  };

  const openPostFlow = () => {
    setMobileMenuOpen(false);
    window.dispatchEvent(new CustomEvent('openPostProperty'));
  };

  return (
    <div className="olx-header-wrapper">
      <div className="olx-header-top">
        <div className="olx-header-top-content">
          <div className="olx-logo" onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setMobileMenuOpen(false);
          }} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              display: 'grid', placeItems: 'center',
              background: 'linear-gradient(135deg, #17332c 0%, #23453c 100%)', color: '#fff'
            }}>
              <Building2 size={20} />
            </div>
            <span style={{color: '#002f34', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.5px'}}>RealProperties</span>
          </div>
          
          <div className="olx-main-search" ref={searchContainerRef} style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder='Search "Properties"' 
              className="olx-main-input"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val.trim() === '') {
                  executeSearch('');
                } else {
                  setShowSuggestions(true);
                }
              }}
              onFocus={() => { if(searchQuery.trim()) setShowSuggestions(true); }}
              onKeyDown={handleSearchSubmit}
            />
            <button className="olx-search-btn" onClick={() => executeSearch(searchQuery)}>
              <Search size={24} color="#ffffff" strokeWidth={2.5} />
            </button>

            {/* Realtime Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="olx-search-suggestions">
                {suggestions.map((prop, idx) => (
                  <div 
                    key={idx} 
                    className="olx-suggestion-item"
                    onClick={() => executeSearch(searchQuery)}
                  >
                    <Search size={16} color="#727e80" />
                    <div className="olx-suggestion-text">
                      <span className="olx-sug-title">{prop.sugTitle}</span>
                      {prop.sugSub && <span className="olx-sug-subtitle">{prop.sugSub}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="olx-actions">
            {user ? (
              <div className="olx-action-btn" onClick={handleLogout} style={{cursor: 'pointer'}}>
                <User size={22} color="#002f34" strokeWidth={2.5} />
                <span>Logout</span>
              </div>
            ) : (
              <button className="olx-action-btn" onClick={() => window.dispatchEvent(new CustomEvent('openAuth'))}>
                <User size={22} color="#002f34" strokeWidth={2.5} />
                <span>Login</span>
              </button>
            )}

            {!hidePostBtn && (
              <button className="olx-sell-btn" onClick={openPostFlow}>
                <div className="olx-sell-btn-inner">
                  <Plus size={18} strokeWidth={3} />
                  <span>SELL</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="olx-header-bottom">
        <div className="olx-header-bottom-content">
          <div className="olx-category-links" ref={categoryScrollRef}>
            {navLinks.map(link => (
              <button 
                key={link.id} 
                onClick={() => {
                  setActiveType(link.name);
                  
                  const params = new URLSearchParams(searchParams);
                  if (link.name !== 'All Properties') params.set('category', link.name);
                  else params.delete('category');
                  
                  navigate(`/?${params.toString()}`);
                  window.dispatchEvent(new CustomEvent('propertyTypeSelected', { detail: link.name }));
                }} 
                className={`olx-category-card ${activeType === link.name ? 'active' : ''}`}
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="olx-date">
            {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ', ' + new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
