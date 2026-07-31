'use client';

import { useState } from 'react';
import styles from './YouthProfilingForm.module.css';

export default function YouthProfilingForm({ onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    middleName: initialData?.middleName || '',
    lastName: initialData?.lastName || '',
    suffix: initialData?.suffix || '',
    birthMonth: '',
    birthDay: '',
    birthYear: '',
    sex: '',
    region: '',
    province: '',
    city: '',
    barangay: initialData?.barangay || '',
    purok: '',
    mobile: '',
    email: initialData?.email || '',
    civilStatus: '',
    youthAgeGroup: '',
    youthClassification: '',
    specificNeeds: { pwd: false, cicl: false, ip: false },
    educationalBackground: '',
    workStatus: '',
    skVoter: '',
    skElection: '',
    nationalVoter: '',
    kkAssembly: '',
    kkTimes: '',
    kkReason: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name in formData.specificNeeds) {
        setFormData(prev => ({
          ...prev,
          specificNeeds: { ...prev.specificNeeds, [name]: checked }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>📋 Youth Profiling Form</h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formBody}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>I. Personal and Contact Information</h3>
              <div className={styles.grid4}>
                <div className={styles.fieldGroup}>
                  <label>First Name</label>
                  <input required className="input-field" name="firstName" value={formData.firstName} onChange={handleChange} />
                </div>
                <div className={styles.fieldGroup}>
                  <label>Middle Name</label>
                  <input className="input-field" name="middleName" value={formData.middleName} onChange={handleChange} />
                </div>
                <div className={styles.fieldGroup}>
                  <label>Last Name</label>
                  <input required className="input-field" name="lastName" value={formData.lastName} onChange={handleChange} />
                </div>
                <div className={styles.fieldGroup}>
                  <label>Suffix</label>
                  <input className="input-field" name="suffix" placeholder="e.g. Jr, Sr" value={formData.suffix} onChange={handleChange} />
                </div>
              </div>

              <div className={styles.grid3}>
                <div className={styles.fieldGroup}>
                  <label>Birth Month</label>
                  <select required className="input-field" name="birthMonth" value={formData.birthMonth} onChange={handleChange}>
                    <option value="">Select</option>
                    {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.fieldGroup}>
                  <label>Birth Day</label>
                  <input required type="number" min="1" max="31" className="input-field" name="birthDay" value={formData.birthDay} onChange={handleChange} />
                </div>
                <div className={styles.fieldGroup}>
                  <label>Birth Year</label>
                  <input required type="number" min="1990" max="2015" className="input-field" name="birthYear" value={formData.birthYear} onChange={handleChange} />
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.fieldGroup}>
                  <label>Sex Assigned at Birth</label>
                  <select required className="input-field" name="sex" value={formData.sex} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className={styles.fieldGroup}>
                  <label>Mobile Number</label>
                  <input required type="tel" className="input-field" name="mobile" value={formData.mobile} onChange={handleChange} />
                </div>
              </div>

              <div className={styles.grid4}>
                <div className={styles.fieldGroup}>
                  <label>Region</label>
                  <input required className="input-field" name="region" value={formData.region} onChange={handleChange} />
                </div>
                <div className={styles.fieldGroup}>
                  <label>Province</label>
                  <input required className="input-field" name="province" value={formData.province} onChange={handleChange} />
                </div>
                <div className={styles.fieldGroup}>
                  <label>City/Municipality</label>
                  <input required className="input-field" name="city" value={formData.city} onChange={handleChange} />
                </div>
                <div className={styles.fieldGroup}>
                  <label>Barangay</label>
                  <input required className="input-field" name="barangay" value={formData.barangay} onChange={handleChange} />
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.fieldGroup}>
                  <label>Purok/Zone</label>
                  <input required className="input-field" name="purok" value={formData.purok} onChange={handleChange} />
                </div>
                <div className={styles.fieldGroup}>
                  <label>Email Address</label>
                  <input required type="email" className="input-field" name="email" value={formData.email} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>II. Demographic Classification</h3>
              <div className={styles.grid2}>
                <div className={styles.fieldGroup}>
                  <label>Civil Status</label>
                  <select required className="input-field" name="civilStatus" value={formData.civilStatus} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Divorced/Separated">Divorced/Separated</option>
                    <option value="Annulled">Annulled</option>
                    <option value="Live-in/Common-law">Live-in/Common-law</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
                <div className={styles.fieldGroup}>
                  <label>Youth Age Group</label>
                  <select required className="input-field" name="youthAgeGroup" value={formData.youthAgeGroup} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Child Youth">Child Youth (15–17 years old)</option>
                    <option value="Core Youth">Core Youth (18–24 years old)</option>
                    <option value="Young Adult">Young Adult (25–30 years old)</option>
                  </select>
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.fieldGroup}>
                  <label>Youth Classification</label>
                  <select required className="input-field" name="youthClassification" value={formData.youthClassification} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="In-School Youth">In-School Youth</option>
                    <option value="Out-of-School Youth">Out-of-School Youth (OSY)</option>
                    <option value="Working Youth">Working Youth</option>
                  </select>
                </div>
                <div className={styles.fieldGroup}>
                  <label>Youth with Specific Needs</label>
                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxItem}>
                      <input type="checkbox" name="pwd" checked={formData.specificNeeds.pwd} onChange={handleChange} /> PWD
                    </label>
                    <label className={styles.checkboxItem}>
                      <input type="checkbox" name="cicl" checked={formData.specificNeeds.cicl} onChange={handleChange} /> CICL
                    </label>
                    <label className={styles.checkboxItem}>
                      <input type="checkbox" name="ip" checked={formData.specificNeeds.ip} onChange={handleChange} /> Indigenous People
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>III. Education and Employment</h3>
              <div className={styles.grid2}>
                <div className={styles.fieldGroup}>
                  <label>Educational Background</label>
                  <select required className="input-field" name="educationalBackground" value={formData.educationalBackground} onChange={handleChange}>
                    <option value="">Select Highest Attainment</option>
                    <option value="Elementary Level">Elementary Level</option>
                    <option value="Elementary Graduate">Elementary Graduate</option>
                    <option value="High School Level">High School Level</option>
                    <option value="High School Graduate">High School Graduate</option>
                    <option value="Vocational">Vocational</option>
                    <option value="College Level">College Level</option>
                    <option value="College Graduate">College Graduate</option>
                    <option value="Master's Level">Master's Level</option>
                    <option value="Master's Graduate">Master's Graduate</option>
                    <option value="Doctorate Level">Doctorate Level</option>
                    <option value="Doctorate Graduate">Doctorate Graduate</option>
                  </select>
                </div>
                <div className={styles.fieldGroup}>
                  <label>Work Status</label>
                  <select required className="input-field" name="workStatus" value={formData.workStatus} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Employed">Employed</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Looking">Currently looking for a job</option>
                    <option value="Not Interested">Not interested in looking for a job</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>IV. Voting and Civic Participation</h3>
              
              <div className={styles.grid3}>
                <div className={styles.fieldGroup}>
                  <label>Registered SK Voter?</label>
                  <select required className="input-field" name="skVoter" value={formData.skVoter} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className={styles.fieldGroup}>
                  <label>Voted in last SK Election?</label>
                  <select required className="input-field" name="skElection" value={formData.skElection} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className={styles.fieldGroup}>
                  <label>Registered National Voter?</label>
                  <select required className="input-field" name="nationalVoter" value={formData.nationalVoter} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div className={styles.fieldGroup} style={{ marginBottom: '16px' }}>
                <label>Have you attended a Katipunan ng Kabataan Assembly?</label>
                <select required className="input-field" name="kkAssembly" value={formData.kkAssembly} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {formData.kkAssembly === 'Yes' && (
                <div className={styles.fieldGroup}>
                  <label>How many times?</label>
                  <select required className="input-field" name="kkTimes" value={formData.kkTimes} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="1-2">1–2 times</option>
                    <option value="3-4">3–4 times</option>
                    <option value="5+">5 and above</option>
                  </select>
                </div>
              )}

              {formData.kkAssembly === 'No' && (
                <div className={styles.fieldGroup}>
                  <label>Why?</label>
                  <select required className="input-field" name="kkReason" value={formData.kkReason} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Not interested">Not interested</option>
                    <option value="No time">No time</option>
                    <option value="No meeting">There was no meeting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Submit Application</button>
          </div>
        </form>
      </div>
    </div>
  );
}
