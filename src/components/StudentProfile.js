import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, BookOpen, Edit, Save, X, Building2, CheckCircle, RefreshCw, Key } from 'lucide-react';
import Navbar from './Navbar';
import '../styles/StudentProfile.css';
import API_URL from '../config'; 

const StudentProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [error, setError] = useState(null);
  const [matchedCompany, setMatchedCompany] = useState(null);

  const username = localStorage.getItem('username');
  const student_id = localStorage.getItem('student_id');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch student profile
        const profileResponse = await fetch(`${API_URL}/student-profile?username=${username}`);
        if (!profileResponse.ok) {
          throw new Error(`Error fetching profile: ${profileResponse.status}`);
        }
        const profileData = await profileResponse.json();
        setProfile(profileData.profile);
        setEditedProfile(profileData.profile);

        // Fetch matched company
        const matchResponse = await fetch(`${API_URL}/check-match-status/${student_id}`);
        const matchData = await matchResponse.json();
        
        if (matchData.has_match) {
          // Fetch full company details
          const companyResponse = await fetch(`${API_URL}/companies`);
          const companiesData = await companyResponse.json();
          
          const company = companiesData.find(
            item => item.company_id === matchData.company_id
          );

          if (company) {
            setMatchedCompany({
              ...company.company,
              company_id: matchData.company_id,
              status: matchData.status
            });
          }
        }
      } catch (error) {
        setError(`Error fetching data: ${error.message}`);
        console.error(error);
      }
    };

    fetchProfile();
  }, [username, student_id]);

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`${API_URL}/update-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: username,
          profile: editedProfile
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error saving profile: ${errorData.message || response.status}`);
      }

      // Update profile on UI
      setProfile({
        ...editedProfile,
        student_id: profile.student_id
      });
      setEditMode(false);
    } catch (error) {
      setError(`Error saving profile: ${error.message}`);
      console.error(error);
    }
  };

  const handleConfirmCompany = async () => {
    try {
      // Here you would typically call an API to update the match status
      // For this example, I'll simulate the update
      const response = await fetch(`${API_URL}/update-match-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: student_id,
          company_id: matchedCompany.company_id,
          status: 'ตอบรับ'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update match status');
      }

      // Update local state
      setMatchedCompany(prev => ({
        ...prev,
        status: 'ตอบรับ'
      }));

      alert('ยืนยันสถานประกอบการสำเร็จ');
    } catch (error) {
      console.error('Error confirming company:', error);
      alert('เกิดข้อผิดพลาดในการยืนยันสถานประกอบการ');
    }
  };

  const handleChangeCompany = async () => {
    try {
      // Call API to remove the existing match
      const response = await fetch(`${API_URL}/remove-match/${student_id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove match');
      }

      // Clear local state and redirect to company selection
      setMatchedCompany(null);
      navigate('/student-to-indus');
    } catch (error) {
      console.error('Error changing company:', error);
      alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานประกอบการ');
    }
  };

  // ฟังก์ชันเปลี่ยนรหัสผ่าน
  const handleChangePassword = () => {
    navigate('/change-password', { state: { username } });
  };

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="profile-page">
      <Navbar />
      {profile ? (
        <div className="profile-container">
          {/* Existing profile header and content */}
          <div className="profile-header">
            <h1 className="profile-name">{profile.name}</h1>
            <p className="profile-id">{profile.student_id}</p>
          </div>

          <div className="profile-content">
            {/* Existing profile fields */}
            <div className="info-group">
              <div className="info-label">
                <User size={16} />
                <span>ชื่อ-นามสกุล</span>
              </div>
              <div className={`info-value ${editMode ? 'editing' : ''}`}>
                {editMode ? (
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                ) : profile.name}
              </div>
            </div>

            <div className="info-group">
              <div className="info-label">
                <Mail size={16} />
                <span>อีเมล</span>
              </div>
              <div className={`info-value ${editMode ? 'editing' : ''}`}>
                {editMode ? (
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                ) : profile.email}
              </div>
            </div>

            <div className="info-group">
              <div className="info-label">
                <Phone size={16} />
                <span>เบอร์โทรศัพท์</span>
              </div>
              <div className={`info-value ${editMode ? 'editing' : ''}`}>
                {editMode ? (
                  <input
                    type="text"
                    value={editedProfile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                ) : profile.phone}
              </div>
            </div>

            <div className="info-group">
              <div className="info-label">
                <BookOpen size={16} />
                <span>สาขาวิชา</span>
              </div>
              <div className={`info-value ${editMode ? 'editing' : ''}`}>
                {editMode ? (
                  <input
                    type="text"
                    value={editedProfile.program}
                    onChange={(e) => handleInputChange('program', e.target.value)}
                  />
                ) : profile.program}
              </div>
            </div>

            {/* Skills Section */}
            <div className="skills-section">
              <div className="skills-title">
                <span>ความสามารถ</span>
                <button 
                  className="btn-skill-manage"
                  onClick={() => navigate('/skills-management')}
                >
                  จัดการความสามารถ
                </button>
              </div>
              <div className="skills-grid">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill, index) => (
                    <div key={index} className="skill-tag">{skill}</div>
                  ))
                ) : (
                  <div className="skill-tag">ยังไม่มีความสามารถ</div>
                )}
              </div>
            </div>

            {/* Company Matching Section */}
            <div className="company-matching-section">
              <div className="info-group">
                <div className="info-label">
                  <Building2 size={16} />
                  <span>สถานประกอบการที่เลือก</span>
                </div>
                {matchedCompany ? (
                  <div className="matched-company-details">
                    <div className="company-info-card">
                      <h3>{matchedCompany.company_name}</h3>
                      <p><strong>ที่อยู่:</strong> {matchedCompany.address}</p>
                      <p><strong>ติดต่อ:</strong> {matchedCompany.contact_person}</p>
                      <p><strong>เบอร์โทร:</strong> {matchedCompany.contact_phone}</p>
                      <p><strong>สถานะ:</strong> {matchedCompany.status}</p>
                    </div>
                    
                    {matchedCompany.status === 'กำลังดำเนินการ' && (
                      <div className="company-match-actions">
                        <button 
                          className="btn-primary"
                          onClick={handleConfirmCompany}
                        >
                          <CheckCircle size={20} />
                          <span>ยืนยันสถานประกอบการตอบรับแล้ว</span>
                        </button>
                        <button 
                          className="btn-secondary"
                          onClick={handleChangeCompany}
                        >
                          <RefreshCw size={20} />
                          <span>เปลี่ยนสถานประกอบการ</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-company-match">
                    <p>คุณยังไม่ได้เลือกสถานประกอบการ</p>
                    <button 
                      className="btn-primary"
                      onClick={() => navigate('/student-to-indus')}
                    >
                      เลือกสถานประกอบการ
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Actions */}
            <div className="profile-actions">
              {editMode ? (
                <>
                  <button className="btn-edit btn-save" onClick={handleSaveChanges}>
                    <Save size={20} />
                    <span>บันทึก</span>
                  </button>
                  <button className="btn-edit btn-cancel" onClick={() => setEditMode(false)}>
                    <X size={20} />
                    <span>ยกเลิก</span>
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-edit" onClick={() => setEditMode(true)}>
                    <Edit size={20} />
                    <span>แก้ไขข้อมูล</span>
                  </button>
                  <button className="btn-change-password" onClick={handleChangePassword}>
                    <Key size={20} />
                    <span>เปลี่ยนรหัสผ่าน</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="loading">กำลังโหลดข้อมูล...</div>
      )}
    </div>
  );
};

export default StudentProfile;