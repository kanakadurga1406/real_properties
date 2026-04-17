import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, ChevronRight, Sparkles, X } from 'lucide-react';

/**
 * Floating subscription badge — fixed to bottom-right of the viewport.
 * Hidden when the user already has an active subscription.
 */
const SubscriptionBadge = ({ user, subscription, onSubscribeClick }) => {
  const [expanded, setExpanded] = useState(false);

  // Don't show if already subscribed
  if (subscription) return null;

  return (
    <div className="sub-float-root">
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="sub-float-panel"
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
          >
            {/* Dismiss — collapses back to the pill */}
            <button
              className="sub-float-dismiss"
              onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
              title="Minimize"
            >
              <X size={14} />
            </button>

            <div className="sub-float-panel-header">
              <Sparkles size={16} className="sub-float-spark" />
              <span>Annual Listing Plan</span>
            </div>

            <div className="sub-float-price">
              <span className="sub-float-currency">₹</span>
              <span className="sub-float-amount">3,650</span>
              <span className="sub-float-period">/ year</span>
            </div>

            <ul className="sub-float-perks">
              <li><BadgeCheck size={13} /> Up to 50 listings/year</li>
              <li><BadgeCheck size={13} /> Verified lister badge</li>
              <li><BadgeCheck size={13} /> Manage & edit anytime</li>
            </ul>

            <button
              className="btn-primary sub-float-cta"
              onClick={() => {
                setExpanded(false);
                onSubscribeClick();
              }}
            >
              {user ? 'Get Subscription' : 'Login & Subscribe'}
              <ChevronRight size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating trigger pill */}
      <motion.button
        className="sub-float-pill"
        onClick={() => setExpanded((prev) => !prev)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        animate={expanded ? {} : {
          boxShadow: [
            '0 0 0 0px rgba(191,122,43,0.35)',
            '0 0 0 10px rgba(191,122,43,0)',
          ],
        }}
        transition={expanded ? {} : {
          duration: 1.8,
          repeat: Infinity,
          repeatType: 'loop',
        }}
      >
        <Sparkles size={17} />
        <span className="sub-float-pill-text">List Property</span>
        <span className="sub-float-pill-price">₹3,650/yr</span>
      </motion.button>
    </div>
  );
};

export default SubscriptionBadge;
