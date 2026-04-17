import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeCheck, Calendar, CheckCircle2, Copy, CreditCard,
  Loader2, Shield, Sparkles, X, Zap
} from 'lucide-react';
import CONFIG from '../config';

const PLAN = {
  name: 'Annual Listing Plan',
  price: 3650,
  period: 'per year',
  postsLimit: 50,
  features: [
    '50 property listings per year',
    'Immediate listing visibility',
    'Update & delete your listings anytime',
    'Priority placement in search results',
    'Verified lister badge on all posts',
    'Dedicated listing dashboard',
  ],
};

const UPI_ID = '9063392872@ybl';
const BANK_DETAILS = 'A/C: 1234567890  •  IFSC: SBIN0001234  •  Real Properties';

const SubscriptionModal = ({ isOpen, onClose, user, onSubscribed }) => {
  const [step, setStep] = useState('plan');    // 'plan' | 'payment' | 'verify' | 'success'
  const [paymentRef, setPaymentRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  if (!isOpen) return null;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleActivate = async () => {
    if (!paymentRef.trim()) {
      setError('Please enter your payment reference / UTR number.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/realproperties/subscription/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          mobile: user.mobile,
          userName: user.name,
          paymentRef: paymentRef.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Activation failed');
      }

      setStep('success');
      setTimeout(() => {
        onSubscribed(data.subscription);
        onClose();
        setStep('plan');
        setPaymentRef('');
      }, 2200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="sidebar-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ zIndex: 3000 }}
        >
          <motion.div
            className="modal-card sub-modal-card"
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="icon-circle-btn"
              style={{ position: 'absolute', top: 14, right: 14 }}
              title="Close"
            >
              <X size={18} />
            </button>

            {/* ── Step: Plan overview ── */}
            {step === 'plan' && (
              <motion.div
                key="plan"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="sub-modal-header">
                  <h2 className="sub-modal-title">Unlock property posting</h2>
                  <p className="sub-modal-copy">
                    A one-time yearly plan gives you everything you need to list and manage properties on Real Properties.
                  </p>
                </div>

                {/* Plan card */}
                <div className="sub-plan-card">
                  <div className="sub-plan-top">
                    <div className="sub-plan-badge">
                      <Shield size={15} /> Most Popular
                    </div>
                    <div className="sub-plan-pricing">
                      <span className="sub-plan-currency">₹</span>
                      <span className="sub-plan-amount">3,650</span>
                      <span className="sub-plan-period">/ year</span>
                    </div>
                    <p className="sub-plan-name">Annual Listing Plan</p>
                    <p className="sub-plan-tagline">
                      That's just ₹10/day for up to {PLAN.postsLimit} listings!
                    </p>
                  </div>

                  <ul className="sub-plan-features">
                    {PLAN.features.map((f) => (
                      <li key={f} className="sub-feature-item">
                        <CheckCircle2 size={16} className="sub-feature-icon" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="sub-plan-validity">
                  <Calendar size={15} />
                  Valid for <strong>12&nbsp;months</strong> from activation date
                </div>

                <button
                  className="btn-primary sub-cta-btn"
                  onClick={() => setStep('payment')}
                >
                  <CreditCard size={16} />
                  Subscribe Now — ₹3,650
                </button>
              </motion.div>
            )}

            {/* ── Step: Payment instructions ── */}
            {step === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="sub-modal-header">
                  <span className="section-eyebrow">
                    <CreditCard size={13} /> Payment
                  </span>
                  <h2 className="sub-modal-title">Complete your payment</h2>
                  <p className="sub-modal-copy">
                    Pay ₹3,650 via UPI or bank transfer, then enter your reference number below to activate instantly.
                  </p>
                </div>

                {/* Amount badge */}
                <div className="sub-amount-badge">
                  <Zap size={18} />
                  <span>Total: <strong>₹3,650</strong></span>
                </div>

                {/* UPI */}
                <div className="sub-payment-block">
                  <p className="sub-payment-label">Pay via UPI</p>
                  <div className="sub-copy-row">
                    <code className="sub-upi-id">{UPI_ID}</code>
                    <button
                      className="icon-circle-btn sub-copy-btn"
                      onClick={() => copyToClipboard(UPI_ID, 'upi')}
                      title="Copy UPI ID"
                    >
                      {copied === 'upi' ? <CheckCircle2 size={15} color="var(--success)" /> : <Copy size={15} />}
                    </button>
                  </div>
                </div>

                {/* Bank */}
                <div className="sub-payment-block">
                  <p className="sub-payment-label">Or Bank Transfer</p>
                  <div className="sub-copy-row">
                    <code className="sub-upi-id" style={{ fontSize: '0.78rem' }}>{BANK_DETAILS}</code>
                    <button
                      className="icon-circle-btn sub-copy-btn"
                      onClick={() => copyToClipboard(BANK_DETAILS, 'bank')}
                      title="Copy bank details"
                    >
                      {copied === 'bank' ? <CheckCircle2 size={15} color="var(--success)" /> : <Copy size={15} />}
                    </button>
                  </div>
                </div>

                {/* Reference input */}
                <div className="input-shell" style={{ marginTop: '1.2rem' }}>
                  <label htmlFor="payment-ref">Payment Reference / UTR Number</label>
                  <div className="input-control">
                    <BadgeCheck size={18} color="var(--accent)" />
                    <input
                      id="payment-ref"
                      type="text"
                      placeholder="Enter UTR / transaction ID after payment"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                    />
                  </div>
                </div>

                {error && <div className="status-banner error" style={{ marginTop: '0.7rem' }}>{error}</div>}

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.2rem' }}>
                  <button
                    className="btn-outline"
                    onClick={() => setStep('plan')}
                    style={{ flex: '0 0 auto', paddingInline: '1.2rem' }}
                  >
                    Back
                  </button>
                  <button
                    className="btn-primary sub-cta-btn"
                    onClick={handleActivate}
                    disabled={loading}
                    style={{ flex: 1 }}
                  >
                    {loading ? <Loader2 className="spinner" size={18} /> : (
                      <><BadgeCheck size={16} /> Activate My Plan</>
                    )}
                  </button>
                </div>

                <p className="sub-fine-print">
                  By activating, you confirm that payment of ₹3,650 has been made. Our team verifies all transactions within 24 hours.
                </p>
              </motion.div>
            )}

            {/* ── Step: Success ── */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="sub-success-screen"
              >
                <motion.div
                  className="sub-success-icon"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                >
                  <CheckCircle2 size={52} color="var(--success)" />
                </motion.div>
                <h2 className="sub-success-title">Subscription Activated!</h2>
                <p className="sub-success-copy">
                  Welcome aboard. You can now post up to <strong>50 properties</strong> for the next 12 months.
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubscriptionModal;
