'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import styles from './safespace.module.css';

export default function SafeSpacePage() {
  const [formData, setFormData] = useState({
    type: 'mental_health',
    urgency: 'normal',
    narrative: '',
    contact_preference: 'in_app',
    contact_details: '',
    is_anonymous: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/safespace', formData);
      setSubmitted(true);
    } catch (err) {
      alert(err.message || 'Failed to submit report. Please try again.');
    }
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className={styles.safespace}>
        <div className={styles.card}>
          <div className={styles.successState}>
            <div className={styles.successIcon}>🛡️</div>
            <h2>You are not alone. Your voice is heard.</h2>
            <p>Your confidential report has been securely transmitted directly to our licensed guidance counselors. No other barangay officials have access to this information.</p>
            <p>A counselor will review your submission and reach out via your preferred contact method shortly.</p>
            <Link href="/services" className={styles.homeBtn}>
              Return to Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.safespace}>
      <div className={styles.header}>
        <h1>🛡️ SafeSpace</h1>
        <p className={styles.subtitle}>
          A highly confidential reporting channel for mental health concerns, VAWC (Violence Against Women and Children), bullying, and substance abuse.
        </p>
        <div className={styles.securityBadge}>
          🔒 End-to-End Isolated. Only Guidance Counselors have access.
        </div>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Nature of Concern</label>
            <select className={styles.select} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required>
              <option value="mental_health">Mental Health & Wellness</option>
              <option value="vawc">VAWC (Violence / Abuse)</option>
              <option value="bullying">Bullying / Harassment</option>
              <option value="substance_abuse">Substance Abuse</option>
              <option value="other">Other Sensitive Concern</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Level of Urgency</label>
            <select className={styles.select} value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value})} required>
              <option value="low">Low - I just need someone to talk to eventually</option>
              <option value="normal">Normal - I'd like to schedule a counseling session</option>
              <option value="high">High - I am currently in a difficult situation</option>
              <option value="emergency">Emergency - I need immediate intervention</option>
            </select>
            {formData.urgency === 'emergency' && (
              <span className={styles.desc} style={{ color: '#E11D48', fontWeight: 600, marginTop: '8px' }}>
                ⚠️ If you or someone else is in immediate physical danger, please also contact 911 or your local emergency hotline.
              </span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Please describe what you are going through</label>
            <span className={styles.desc}>Share as much or as little as you feel comfortable with.</span>
            <textarea 
              className={styles.textarea} 
              placeholder="I am reaching out because..."
              value={formData.narrative} 
              onChange={e => setFormData({...formData, narrative: e.target.value})} 
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label>How would you like us to contact you?</label>
            <select className={styles.select} value={formData.contact_preference} onChange={e => setFormData({...formData, contact_preference: e.target.value})} required>
              <option value="in_app">Secure In-App Notification (Safest)</option>
              <option value="phone">Phone Call / Text</option>
              <option value="email">Email</option>
              <option value="face_to_face">Face to Face Meeting Request</option>
            </select>
          </div>

          {['phone', 'email'].includes(formData.contact_preference) && (
            <div className={styles.formGroup}>
              <label>Contact Details (for Phone/Email)</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder={formData.contact_preference === 'phone' ? 'e.g. 0917-XXX-XXXX' : 'e.g. email@example.com'}
                value={formData.contact_details} 
                onChange={e => setFormData({...formData, contact_details: e.target.value})} 
                required 
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={formData.is_anonymous} 
                onChange={e => setFormData({...formData, is_anonymous: e.target.checked})} 
              />
              <div className={styles.checkboxText}>
                <strong>Submit Anonymously</strong>
                <span>The counselor will not see your name or Katips ID, but they can still reply via the secure in-app system.</span>
              </div>
            </label>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? 'Securing & Submitting...' : 'Submit Confidential Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
