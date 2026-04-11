import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ChevronRight, FileSearch, HardHat, Handshake, ShieldCheck, Sparkles, Users, WalletCards } from 'lucide-react';

const coreFeatures = [
  {
    id: 'trust-stack',
    title: 'Trust Stack',
    icon: <ShieldCheck size={22} />,
    tag: 'Buyer Confidence',
    desc: 'Every important journey now feels guided: clear value proposition, direct search, visible proof points, and faster inquiry paths.',
    details: ['Verified inventory framing', 'Safer contact actions', 'Cleaner readability', 'Less visual clutter']
  },
  {
    id: 'listing-flow',
    title: 'Listing Flow',
    icon: <WalletCards size={22} />,
    tag: 'Owner Engagement',
    desc: 'Property owners can still log in, post listings, and manage their submissions, but with a more premium, confidence-building experience.',
    details: ['Simplified post modal', 'Responsive listing cards', 'My properties dashboard', 'Persistent account actions']
  },
  {
    id: 'market-support',
    title: 'Market Support',
    icon: <HardHat size={22} />,
    tag: 'Extended Services',
    desc: 'The redesigned storytelling helps users understand the broader value: expert support, legal clarity, and data-backed investment decisions.',
    details: ['Expert panel narrative', 'True property benefits', 'Service ecosystem', 'Mobile app discovery']
  }
];

const trueBenefits = [
  {
    title: 'True Sale',
    tag: 'Transparent transactions',
    desc: 'Guide buyers toward inventory with clearer pricing visibility and stronger contact intent.',
    icon: <Handshake size={28} />
  },
  {
    title: 'True Analysis',
    tag: 'Sharper decision support',
    desc: 'Highlight market reasoning and opportunity value instead of relying only on raw listing data.',
    icon: <Activity size={28} />
  },
  {
    title: 'True Property',
    tag: 'Confidence in every step',
    desc: 'Frame legal and verification support as part of the product experience, not an afterthought.',
    icon: <FileSearch size={28} />
  }
];

const FeaturesSection = () => {
  const [expandedId, setExpandedId] = useState(coreFeatures[0].id);

  return (
    <section id="features" className="features-section">
      <div className="section-container">
        <div className="v2-header-stack">
          <span className="section-eyebrow">
            <Sparkles size={14} />
            Experience Upgrade
          </span>
          <h2 className="v2-title-xl">
            Professional UI/UX built for trust, clarity, and higher engagement.
          </h2>
          <p className="v2-p-lg section-subcopy">
            The new interface keeps the same core capabilities while improving visual polish, onboarding clarity,
            content hierarchy, and responsive behavior on every screen size.
          </p>
        </div>

        <div className="v2-feature-stack">
          {coreFeatures.map((feature) => (
            <motion.div
              key={feature.id}
              layout
              className={`v2-feature-module ${expandedId === feature.id ? 'active' : ''}`}
              onClick={() => setExpandedId(feature.id)}
            >
              <div className="module-header">
                <div className="module-icon">{feature.icon}</div>
                <div className="module-text">
                  <span className="module-tag">{feature.tag}</span>
                  <h3 className="module-title">{feature.title}</h3>
                </div>
                <ChevronRight className="module-arrow" size={20} />
              </div>

              <AnimatePresence>
                {expandedId === feature.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="module-expansion"
                  >
                    <p className="module-desc">{feature.desc}</p>
                    <div className="v2-detail-grid">
                      {feature.details.map((detail) => (
                        <div key={detail} className="v2-detail-pill">
                          <Users size={15} className="pill-icon" />
                          <span className="pill-label">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="v2-guarantee-block">
          <div className="guarantee-header-v2">
            <span className="section-eyebrow">
              <ShieldCheck size={14} />
              Value Narrative
            </span>
            <h3 className="v2-title-md">
              The <span className="text-gradient">True</span> advantage is now easier to understand.
            </h3>
            <p className="v2-p-lg" style={{ marginTop: '1rem' }}>
              Better storytelling increases confidence. Users can immediately understand what makes the platform useful,
              not just what it contains.
            </p>
          </div>

          <div className="v2-benefits-row">
            {trueBenefits.map((benefit) => (
              <motion.div key={benefit.title} whileHover={{ y: -4 }} className="v2-benefit-module v2-glass">
                <div className="benefit-icon-v2">{benefit.icon}</div>
                <span className="benefit-tag-v2">{benefit.tag}</span>
                <h4 className="benefit-title-v2">{benefit.title}</h4>
                <p className="benefit-desc-v2">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
