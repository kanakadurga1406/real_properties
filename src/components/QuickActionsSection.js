import React, { useState } from 'react';
import { Plus, Users, PhoneCall } from 'lucide-react';
import CONFIG from '../config';
import RequestExpertModal from './RequestExpertModal';

const QuickActionsSection = () => {
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false);

  const handlePostProperty = () => {
    window.dispatchEvent(new CustomEvent('openPostProperty'));
  };

  const handleExpertPanel = () => {
    const user = localStorage.getItem('realprop_user');
    if (!user) {
      window.dispatchEvent(new CustomEvent('openAuth'));
      return;
    }
    setIsExpertModalOpen(true);
  };

  return (
    <>
      <section className="quick-actions-section" style={{ padding: '2rem 0', background: 'var(--bg-soft)' }}>
        <div className="section-container" style={{ display: 'flex', justifyContent: 'center' }}>
          <div 
            className="quick-actions-bar" 
            style={{ 
              display: 'flex', 
              gap: '1.5rem', 
              justifyContent: 'center', 
              alignItems: 'center', 
              flexWrap: 'wrap',
              padding: '1.5rem 2.5rem',
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: '24px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
              maxWidth: '700px',
              width: '100%'
            }}
          >
            <button 
              onClick={handlePostProperty}
              className="btn-primary quick-action-btn"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                padding: '0.9rem 2rem', 
                fontSize: '1.05rem', 
                fontWeight: '700', 
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                flex: '1 1 240px',
                justifyContent: 'center'
              }}
            >
              <Plus size={20} strokeWidth={2.5} />
              Post Property
            </button>
            
            <button 
              onClick={handleExpertPanel}
              className="quick-action-btn-secondary"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                padding: '0.9rem 2rem', 
                fontSize: '1.05rem', 
                fontWeight: '700', 
                borderRadius: '16px',
                background: 'transparent',
                color: 'var(--text)',
                border: '2px solid var(--line)',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                flex: '1 1 240px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.color = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--line)';
                e.currentTarget.style.color = 'var(--text)';
              }}
            >
              <Users size={20} />
              Request Expert
            </button>
          </div>
        </div>
      </section>
      
      <RequestExpertModal 
        isOpen={isExpertModalOpen} 
        onClose={() => setIsExpertModalOpen(false)} 
      />
    </>
  );
};

export default QuickActionsSection;
