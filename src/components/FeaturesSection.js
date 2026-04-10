import React from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  HardHat, 
  Building, 
  CheckCircle,
  Scale,
  Coins,
  Brush,
  HardHat as HardHatIcon, // Renamed to avoid conflict
  Map,
  Sparkles,
  ShieldCheck,
  Banknote,
  Sprout,
  FileText,
  FileCheck,
  Handshake,
  Zap,
  Box,
  Hammer,
  Palette,
  Flame,
  Wind,
  Home,
  LayoutGrid,
  Maximize,
  Sun,
  Umbrella,
  Castle,
  Building2,
  Globe,
  Briefcase,
  Activity,
  FileSearch,
  CheckCircle2
} from 'lucide-react';

const DropletsIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>
);

const coreFeatures = [
  {
    id: 'expert-panel',
    title: 'Expert Panel',
    icon: <Award size={30} />,
    desc: 'Connect with a full spectrum of industry specialists to ensure 100% security for your investments.',
    gradient: ['#6366f1', '#818cf8'],
    details: [
      { label: 'Legal', icon: <Scale size={14} /> },
      { label: 'Revenue', icon: <Coins size={14} /> },
      { label: 'Engineers', icon: <HardHat size={14} /> },
      { label: 'Architects', icon: <Brush size={14} /> },
      { label: 'Surveying', icon: <Map size={14} /> },
      { label: 'Vaastu', icon: <Sparkles size={14} /> },
      { label: 'Valuers', icon: <ShieldCheck size={14} /> },
      { label: 'Banking', icon: <Banknote size={14} /> },
      { label: 'Agriculture', icon: <Sprout size={14} /> },
      { label: 'Registration', icon: <FileText size={14} /> },
      { label: 'Auditing', icon: <FileCheck size={14} /> },
      { label: 'Liaisoning', icon: <Handshake size={14} /> }
    ]
  },
  {
    id: 'skilled-resources',
    title: 'Skilled Resources',
    icon: <HardHat size={30} />,
    desc: 'Access a top-tier directory of vetted professionals for every stage of your development.',
    gradient: ['#ec4899', '#f472b6'],
    details: [
      { label: 'Electricians', icon: <Zap size={14} /> },
      { label: 'Plumbers', icon: <DropletsIcon size={14} /> },
      { label: 'Masons', icon: <Box size={14} /> },
      { label: 'Carpenters', icon: <Hammer size={14} /> },
      { label: 'Painters', icon: <Palette size={14} /> },
      { label: 'Welders', icon: <Flame size={14} /> },
      { label: 'HVAC Techs', icon: <Wind size={14} /> },
      { label: 'Roofers', icon: <Home size={14} /> },
      { label: 'Tilers', icon: <LayoutGrid size={14} /> },
      { label: 'Surveyors', icon: <Maximize size={14} /> },
      { label: 'Solar Techs', icon: <Sun size={14} /> },
      { label: 'Waterproofing', icon: <Umbrella size={14} /> }
    ]
  },
  {
    id: 'core-projects',
    title: 'Core Projects',
    icon: <Building size={30} />,
    desc: 'Gain access to premium, ongoing developments and a high-net-worth network.',
    gradient: ['#10b981', '#34d399'],
    details: [
      { label: 'Luxury Villas', icon: <Castle size={14} /> },
      { label: 'Gated Comms', icon: <Building2 size={14} /> },
      { label: 'IT Hubs', icon: <Building size={14} /> },
      { label: 'Townships', icon: <Home size={14} /> },
      { label: 'NRI Partners', icon: <Globe size={14} /> },
      { label: 'PE Firms', icon: <Briefcase size={14} /> },
      { label: 'Corporate Devs', icon: <Building size={14} /> },
      { label: 'HNI Investors', icon: <Award size={14} /> }
    ]
  },
  {
    id: 'approved-properties',
    title: '100% Approved',
    icon: <CheckCircle size={30} />,
    desc: 'Our catalog features only rigorously vetted, legally cleared, and premium real estate.',
    gradient: ['#f59e0b', '#fbbf24'],
    details: [
      { label: 'Residential Plots', icon: <CheckCircle2 size={14} /> },
      { label: 'Commercial Land', icon: <CheckCircle2 size={14} /> },
      { label: 'Villa Plots', icon: <CheckCircle2 size={14} /> },
      { label: 'Farm Lands', icon: <CheckCircle2 size={14} /> }
    ]
  }
];

const trueBenefits = [
  {
    title: 'True Sale',
    desc: 'Ideal for layouts visible on maps, agents can securely sell plots through our True Sale application. All bookings, agreements, and registrations are handled centrally.',
    icon: <ShieldCheck size={28} />
  },
  {
    title: 'True Analysis',
    desc: 'AI-based market data visualization. Enter your budget and goal—our system analyzes the market and pinpoint exactly where you should invest for maximum returns.',
    icon: <Activity size={28} />
  },
  {
    title: 'True Property',
    desc: 'Leverage our complete Expert Panel to make critical decisions for your plots with total confidence—including verified legal opinions and revenue mapping.',
    icon: <FileSearch size={28} />
  }
];

const FeaturesSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section id="features" className="features-section">
      <div className="features-header">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="features-title"
        >
          The Standard of <span className="text-gradient">Excellence</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="features-subtitle" 
          style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 4rem' }}
        >
          Everything you need to successfully navigate, invest, and build in the modern real estate market.
        </motion.p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="core-features-grid"
      >
        {coreFeatures.map((feature) => (
          <motion.div 
            key={feature.id} 
            variants={cardVariants}
            className="feature-card glass-panel"
            whileHover={{ scale: 1.02, rotateY: 5, rotateX: 5, zIndex: 10, transition: { duration: 0.2 } }}
            style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
          >
            <div className="feature-card-main">
              <motion.div 
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="feature-icon" 
              >
                {feature.icon}
              </motion.div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </div>
            
            <div className="feature-details-container" style={{ background: 'var(--glass)', padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <div className="feature-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {feature.details.map((detail, idx) => (
                  <motion.div 
                    key={idx} 
                    whileHover={{ x: 5, color: 'var(--primary)', scale: 1.05 }}
                    className="detail-item"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <span className="detail-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', background: 'var(--glass)', borderRadius: '6px', marginRight: '8px', color: feature.gradient[0] }}>
                      {detail.icon}
                    </span>
                    <span className="detail-label" style={{ fontSize: '0.85rem', fontWeight: 500 }}>{detail.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="true-guarantee-section">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="true-guarantee-header"
        >
           <ShieldCheck size={56} className="shield-icon" style={{ color: 'var(--primary)', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.5))' }} />
           <h2 className="guarantee-title">The "True" Guarantee</h2>
           <p className="guarantee-subtitle">Built on trust, powered by radical transparency.</p>
        </motion.div>
        
        <div className="true-benefits-grid">
           {trueBenefits.map((benefit, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, type: 'spring', stiffness: 100 }}
                whileHover={{ x: -10, scale: 1.02, borderColor: 'var(--primary)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                className="true-card glass-panel"
              >
                 <div className="true-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', minWidth: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {benefit.icon}
                 </div>
                 <div className="true-content">
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{benefit.title}</h4>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{benefit.desc}</p>
                 </div>
              </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
