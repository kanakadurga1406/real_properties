import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import CONFIG from '../config';

const RequestExpertModal = ({ isOpen, onClose }) => {
  const [experts, setExperts] = useState([]);
  const [expertTypes, setExpertTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [formData, setFormData] = useState({
    Name: '',
    MobileNumber: '',
    ExpertName: '',
    ExpertNo: '',
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedType(''); // Reset the dropdown
      
      fetch(`${CONFIG.API_BASE_URL}/expert/getallexpert`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setExperts(data.data);
            const types = [...new Set(data.data.map(exp => exp.expertType))].filter(Boolean);
            setExpertTypes(types);
          }
        })
        .catch(err => console.error("Failed to fetch experts:", err));
        
      const userStr = localStorage.getItem('realprop_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setFormData(prev => ({
            ...prev,
            Name: user.name || '',
            MobileNumber: user.mobile || ''
          }));
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
        }
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedType) {
      setFilteredExperts(experts.filter(exp => exp.expertType === selectedType));
    } else {
      setFilteredExperts([]);
    }
    setFormData(prev => ({ ...prev, ExpertName: '', ExpertNo: '' }));
  }, [selectedType, experts]);

  const handleExpertSelection = (expertId) => {
    const expert = experts.find(e => e._id === expertId);
    if (expert) {
      setFormData(prev => ({
        ...prev,
        ExpertName: expert.name,
        ExpertNo: expert.mobile,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Name || !formData.MobileNumber || !selectedType) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      ...formData,
      ExpertName: formData.ExpertName || 'Any',
      ExpertNo: formData.ExpertNo || 'N/A',
      ExpertType: selectedType,
      RequestedBy: "Website User"
    };

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/requestexpert/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (response.ok) {
        alert("Expert request submitted successfully!");
        onClose();
        setFormData({ Name: '', MobileNumber: '', ExpertName: '', ExpertNo: '' });
        setSelectedType('');
      } else {
        alert(result.message || "Failed to submit request.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while submitting.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div className="modal-content" style={{
        background: 'var(--surface)', padding: '2rem', borderRadius: '16px',
        width: '90%', maxWidth: '500px', position: 'relative',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)'
        }}>
          <X size={24} />
        </button>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text)', fontSize: '1.5rem', fontWeight: 600 }}>Request an Expert</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Your Name</label>
            <input 
              type="text" 
              value={formData.Name}
              onChange={e => setFormData({...formData, Name: e.target.value})}
              required
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg-soft)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Your Mobile Number</label>
            <input 
              type="tel" 
              value={formData.MobileNumber}
              onChange={e => setFormData({...formData, MobileNumber: e.target.value})}
              required
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg-soft)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Expert Type</label>
            <select 
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              required
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg-soft)', color: 'var(--text)' }}
            >
              <option value="">Select an expert type</option>
              {expertTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <button type="submit" style={{
            marginTop: '1rem', padding: '1rem', borderRadius: '8px', 
            fontWeight: 'bold', cursor: 'pointer', border: 'none', background: 'var(--accent)', color: 'white',
            fontSize: '1rem'
          }}>
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestExpertModal;
