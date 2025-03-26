import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, User, Briefcase, ArrowLeft, CheckCircle } from 'lucide-react';
import Navbar from './Navbar';
import CompanyReviews from './CompanyReviews';
import '../styles/CompanyDetails.css';
import API_URL from '../config'; 

const CompanyDetails = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMatchExists, setIsMatchExists] = useState(false);
  const [matchInfo, setMatchInfo] = useState(null);
  const [studentId, setStudentId] = useState('');

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        // ดึงข้อมูลบริษัท
        const companyResponse = await fetch(`${API_URL}/companies`);
        const allCompanies = await companyResponse.json();
        
        // หาบริษัทที่ตรงกับ companyId
        const companyData = allCompanies.find(c => c.company_id === companyId);
        
        if (!companyData) {
          throw new Error('ไม่พบข้อมูลบริษัท');
        }
        
        setCompany(companyData);
        
        // ดึงข้อมูลโปรไฟล์นักศึกษาจาก localStorage
        const profileStr = localStorage.getItem('profile');
        if (profileStr) {
          const profile = JSON.parse(profileStr);
          setStudentId(profile.student_id);
          
          // ตรวจสอบสถานะการจับคู่
          if (profile.student_id) {
            const matchResponse = await fetch(`${API_URL}/check-match-status/${profile.student_id}`);
            const matchData = await matchResponse.json();
            
            if (matchData.has_match) {
              setIsMatchExists(true);
              setMatchInfo({
                companyId: matchData.company_id,
                companyName: matchData.company_name,
                status: matchData.status
              });
            }
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching company details:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [companyId]);

  // ฟังก์ชันเลือกบริษัท
  const handleSelectCompany = async () => {
    if (!studentId) {
      alert('กรุณาเข้าสู่ระบบก่อนเลือกสถานประกอบการ');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/match-company`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: studentId,
          company_id: company.company_id
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`เลือกสถานประกอบการ ${company.company.company_name} เรียบร้อยแล้ว`);
        setIsMatchExists(true);
        setMatchInfo({
          companyId: company.company_id,
          companyName: company.company.company_name,
          status: 'กำลังดำเนินการ'
        });
      } else {
        alert(data.message || 'ไม่สามารถเลือกสถานประกอบการได้');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('เกิดข้อผิดพลาดในการเลือกสถานประกอบการ');
    }
  };

  if (loading) {
    return <div className="loading">กำลังโหลดข้อมูล...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="company-details-page">
      <Navbar />
      <div className="container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          กลับไปหน้ารายชื่อสถานประกอบการ
        </button>

        {isMatchExists && matchInfo && (
          <div className="match-info">
            <h3>สถานะการเลือกสถานประกอบการ</h3>
            <p>สถานประกอบการที่เลือก: <strong>{matchInfo.companyName}</strong></p>
            <p>สถานะ: <span className="status-badge">{matchInfo.status}</span></p>
          </div>
        )}

        <div className="company-details-card">
          <h1 className="company-details-title">{company.company.company_name}</h1>
          
          <div className="company-main-details">
            <div className="details-section">
              <h2 className="section-title">ข้อมูลทั่วไป</h2>
              
              <div className="detail-item">
                <MapPin size={18} className="detail-icon" />
                <div>
                  <strong>ที่อยู่:</strong>
                  <p>{company.company.address}</p>
                </div>
              </div>
              
              <div className="detail-item">
                <MapPin size={18} className="detail-icon" />
                <div>
                  <strong>สถานที่ตั้ง:</strong>
                  <p>{company.company.location}</p>
                </div>
              </div>
              
              <div className="detail-item">
                <User size={18} className="detail-icon" />
                <div>
                  <strong>ผู้ติดต่อ:</strong>
                  <p>{company.company.contact_person}</p>
                </div>
              </div>
              
              <div className="detail-item">
                <Phone size={18} className="detail-icon" />
                <div>
                  <strong>เบอร์โทรศัพท์:</strong>
                  <p>{company.company.contact_phone}</p>
                </div>
              </div>
            </div>
            
            <div className="details-section">
              <h2 className="section-title">รายละเอียดการฝึกงาน</h2>
              
              <div className="detail-item">
                <Briefcase size={18} className="detail-icon" />
                <div>
                  <strong>ตำแหน่งงาน:</strong>
                  <p>{company.company.job_position}</p>
                </div>
              </div>
              
              <div className="detail-item">
                <div>
                  <strong>การรับนักศึกษาฝึกงาน:</strong>
                  <p>{company.company.internship_available}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="job-description">
            <h2 className="section-title">รายละเอียดงาน</h2>
            <p>{company.company.job_description}</p>
          </div>
          
          <div className="qualifications">
            <h2 className="section-title">คุณสมบัติที่ต้องการ</h2>
            <p>{company.company.qualifications}</p>
          </div>
          
          {/* ส่วนของรีวิว */}
          <div className="company-reviews-section">
            <h2 className="section-title">รีวิวและความคิดเห็น</h2>
            <CompanyReviews 
              companyId={company.company_id}
              companyName={company.company.company_name}
            />
          </div>

          <div className="action-buttons">
            <button 
              className="select-company-button"
              onClick={handleSelectCompany}
              disabled={isMatchExists}
            >
              <CheckCircle size={20} />
              {isMatchExists 
                ? 'คุณมีสถานประกอบการที่เลือกแล้ว' 
                : 'เลือกสถานประกอบการนี้'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;