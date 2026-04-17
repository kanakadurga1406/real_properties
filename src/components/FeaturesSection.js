import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ChevronRight, FileSearch, HardHat, Handshake, MousePointerClick, ShieldCheck, Sparkles, Users, WalletCards } from 'lucide-react';

const coreFeatures = [
  {
    id: 'trust-stack',
    title: 'Investment Security',
    icon: <ShieldCheck size={22} />,
    tag: 'Buyer Confidence',
    desc: 'We prioritize legal transparency and title clarity in every project showcased, ensuring your investment is protected.',
    details: ['Legal Vetting', 'Physical Verification', 'Clear Documentation', 'Title Guarantee']
  },
  {
    id: 'listing-flow',
    title: 'Sellers Platform',
    icon: <WalletCards size={22} />,
    tag: 'Owner Engagement',
    desc: 'List your property with professional presentation and reach a network of high-intent buyers instantly through our verified portal.',
    details: ['Instant Posting', 'Lead Tracking', 'Dashboard Analytics', 'Listing Optimization']
  },
  {
    id: 'market-support',
    title: 'Expert Guidance',
    icon: <HardHat size={22} />,
    tag: 'Extended Services',
    desc: 'Benefit from our decade of experience in the South Indian real estate growth corridors with strategic advice and personalized support.',
    details: ['Strategic Advice', 'Site Visit Support', 'Legal Assistance', 'Market Analysis']
  }
];

const trueBenefits = [
  {
    title: 'Secure Transactions',
    tag: 'Transparent process',
    desc: 'Guide buyers toward inventory with verified pricing and fully vetted legal documentation.',
    icon: <Handshake size={28} />
  },
  {
    title: 'Market Analysis',
    tag: 'Sharper decision support',
    desc: 'Access expert market reasoning and property value insights to ensure a sound investment.',
    icon: <Activity size={28} />
  },
  {
    title: 'Legal Confidence',
    tag: 'Security in every step',
    desc: 'Our legal team frames every transaction with verification support as a core product experience.',
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
            Services Overview
          </span>
          <h2 className="v2-title-xl">
            Comprehensive real estate solutions for buyers and owners.
          </h2>
          <p className="v2-p-lg section-subcopy">
            From discovering your dream plot to managing your property portfolio, our platform provides 
            the tools and insights you need for a secure and transparent transaction.
          </p>
        </div>

        <div className="v2-feature-stack">
          {coreFeatures.map((feature) => (
            <motion.div
              key={feature.id}
              className={`v2-feature-module ${expandedId === feature.id ? 'active' : ''}`}
              onClick={() => setExpandedId(feature.id)}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 340, damping: 24 }}
            >
              <div className="module-header">
                <div className="module-icon">{feature.icon}</div>
                <div className="module-text">
                  <span className="module-tag">{feature.tag}</span>
                  <h3 className="module-title">{feature.title}</h3>
                </div>
                <motion.span
                  animate={{ rotate: expandedId === feature.id ? 90 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <ChevronRight className="module-arrow" size={20} />
                </motion.span>
              </div>

              <AnimatePresence initial={false} mode="wait">
                {expandedId === feature.id ? (
                  <motion.div
                    key="expanded"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="module-expansion"
                  >
                    <p className="module-desc">{feature.desc}</p>
                    <motion.div
                      className="v2-detail-grid"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } }
                      }}
                    >
                      {feature.details.map((detail) => (
                        <motion.div
                          key={detail}
                          className="v2-detail-pill"
                          variants={{
                            hidden: { opacity: 0, scale: 0.85, y: 6 },
                            visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 20 } }
                          }}
                        >
                          <Users size={15} className="pill-icon" />
                          <span className="pill-label">{detail}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="hint"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="module-click-hint"
                  >
                    <span className="hint-icon-wrap">
                      <MousePointerClick size={22} className="hint-icon" />
                    </span>
                    <span className="hint-label">Click to view details</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="v2-guarantee-block">
          <div className="guarantee-header-v2">

            <h3 className="v2-title-md">
              The Real Properties <span className="text-gradient">Advantage</span>.
            </h3>
            <p className="v2-p-lg" style={{ marginTop: '1rem' }}>
              We bring decades of field expertise directly to your screen. Users can immediately 
              understand what makes each property a unique opportunity, not just a set of coordinates.
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
