import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { 
  Plus, 
  Edit, 
  MapPin, 
  Phone, 
  User, 
  Briefcase, 
  X, 
  ScanSearch, 
  Info, 
  CheckCircle, 
  NotebookPen,
  ChevronLeft,
  ChevronRight,
  Star,
  Users
} from 'lucide-react';
import Navbar from './Navbar';
import '../styles/StudentToIndus.css';
import { useNavigate } from 'react-router-dom';
import AdvancedSearch from './AdvancedSearch';
import CompanyReviews from './CompanyReviews';

const StudentToIndus = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({
    company_name: '',
    address: '',
    location: '',
    contact_person: '',
    contact_phone: '',
    job_position: '',
    internship_available: '',
    job_description: '',
    qualifications: '',
  });
  const [editingCompany, setEditingCompany] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMatchExists, setIsMatchExists] = useState(false);// เพิ่ม state สำหรับตรวจสอบการจับคู่
  const [matchInfo, setMatchInfo] = useState(null);
  const [companyRatings, setCompanyRatings] = useState({});
  const [companyStudentCounts, setCompanyStudentCounts] = useState({});

  const fetchCompanyStudentCounts = async () => {
    try {
      const response = await fetch('http://localhost:5000/company-student-counts');
      const data = await response.json();
      
      // แปลงข้อมูลให้เป็นรูปแบบ object เพื่อง่ายต่อการเข้าถึง
      const countsMap = {};
      data.forEach(item => {
        countsMap[item.company_id] = item.student_count;
      });
      
      setCompanyStudentCounts(countsMap);
    } catch (error) {
      console.error('Error fetching company student counts:', error);
    }
  };

  useEffect(() => {
    // เก็บไว้เฉพาะการ setAppElement ถ้าจำเป็น
    Modal.setAppElement('#root');
  }, []);

  const fetchCompanyRatings = async () => {
    try {
      const response = await fetch('http://localhost:5000/all-companies-ratings');
      const data = await response.json();
      
      // แปลงข้อมูลให้เป็นรูปแบบ object เพื่อง่ายต่อการเข้าถึง
      const ratingsMap = {};
      data.forEach(item => {
        ratingsMap[item.company_id] = {
          average: item.average_rating,
          total: item.total_reviews
        };
      });
      
      setCompanyRatings(ratingsMap);
    } catch (error) {
      console.error('Error fetching company ratings:', error);
    }
  };

  // ฟังก์ชันจัดการการค้นหาขั้นสูง
  const handleAdvancedSearch = (searchParams) => {
    // บันทึกคำค้นหาหลักเพื่อให้แสดงในช่องค้นหา
    setSearchTerm(searchParams.keyword);
    
    // กรองบริษัทตามเงื่อนไขที่กำหนด
    const filtered = companies.filter(company => {
      let matchesKeyword = true;
      let matchesDistrict = true;
      let matchesProvince = true;
      let matchesRegion = true;
      let matchesPosition = true;
      let matchesSkills = true;
      
      // กรองตาม keyword (ค้นหาในทุกฟิลด์)
      if (searchParams.keyword) {
        matchesKeyword = Object.values(company).some(value => 
          String(value).toLowerCase().includes(searchParams.keyword.toLowerCase())
        );
      }
      
      // กรองตามตำบล/แขวง
      if (searchParams.district) {
        matchesDistrict = company.address.toLowerCase().includes(searchParams.district.toLowerCase());
      }
      
      // กรองตามอำเภอ/เขต
      if (searchParams.province) {
        matchesProvince = company.address.toLowerCase().includes(searchParams.province.toLowerCase()) || 
                        (company.location && company.location.toLowerCase().includes(searchParams.province.toLowerCase()));
      }
      
      // กรองตามภูมิภาค
      if (searchParams.region) {
        matchesRegion = company.location && company.location.toLowerCase().includes(searchParams.region.toLowerCase());
      }
      
      // กรองตามตำแหน่งงาน
      if (searchParams.position) {
        matchesPosition = company.job_position && company.job_position.toLowerCase().includes(searchParams.position.toLowerCase());
      }
      
      // กรองตามทักษะ
      if (searchParams.skills && searchParams.skills.length > 0) {
        // ถ้ามีคุณสมบัติที่ต้องการ ตรวจสอบว่ามีทักษะที่ตรงกันหรือไม่
        if (company.qualifications) {
          matchesSkills = searchParams.skills.some(skill => 
            company.qualifications.toLowerCase().includes(skill.toLowerCase())
          );
        } else {
          matchesSkills = false; // ถ้าไม่มีข้อมูลคุณสมบัติ ถือว่าไม่ตรงกับทักษะที่ค้นหา
        }
      }
      
      // ต้องผ่านทุกเงื่อนไขจึงจะถือว่าตรงกับการค้นหา
      return matchesKeyword && 
             matchesDistrict && 
             matchesProvince && 
             matchesRegion && 
             matchesPosition && 
             matchesSkills;
    });
    
    // เรียงลำดับผลลัพธ์ตาม skill match และ rating
    const sortedFiltered = [...filtered].sort((a, b) => {
      // เปรียบเทียบ skill_match ก่อน
      if (b.skill_match !== a.skill_match) {
        return b.skill_match - a.skill_match;
      }
      
      // ถ้า skill_match เท่ากัน ให้เรียงตามคะแนนรีวิว
      const aRating = companyRatings[a.company_id]?.average || 0;
      const bRating = companyRatings[b.company_id]?.average || 0;
      
      return bRating - aRating;
    });
    
    setFilteredCompanies(sortedFiltered);
    setCurrentPage(1); // รีเซ็ตกลับไปที่หน้าแรก
  };

  useEffect(() => {
    const checkMatchStatus = async () => {
      try {
        const student_id = localStorage.getItem('student_id');
        if (!student_id) {
          console.error('ไม่พบข้อมูลรหัสนักศึกษา');
          return;
        }
  
        const response = await fetch(`http://localhost:5000/check-match-status/${student_id}`);
        const data = await response.json();
        
        if (data.has_match) {
          setIsMatchExists(true);
          setMatchInfo({
            companyId: data.company_id,
            companyName: data.company_name,
            status: data.status
          });
        }
      } catch (error) {
        console.error('Error checking match status:', error);
      }
    };
  
    checkMatchStatus();
  }, []);

  useEffect(() => {
    Modal.setAppElement('#root');
    
    // ถ้ามีทักษะนักศึกษา ใช้ fetchRankedCompanies แทน
    if (studentSkills && studentSkills.length > 0) {
      fetchCompanyRatings(); // ดึงเฉพาะข้อมูลคะแนนรีวิว
      fetchCompanyStudentCounts(); // ดึงข้อมูลจำนวนนักศึกษา
    } else {
      // ถ้าไม่มีข้อมูลทักษะ ใช้ fetchCompanies ตามปกติ
      fetchCompanies();
      fetchCompanyStudentCounts(); // ดึงข้อมูลจำนวนนักศึกษา
    }
  }, []);

  useEffect(() => {
    // Filter companies based on search term
    const filtered = companies.filter(company => 
      company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.job_position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.contact_phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.internship_available.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.job_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.qualifications.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCompanies(filtered);
  }, [searchTerm, companies]);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('http://localhost:5000/companies');
      const data = await response.json();
      const processedCompanies = data.map(item => ({
        company_id: item.company_id,
        ...item.company
      }));
      setCompanies(processedCompanies);
      setFilteredCompanies(processedCompanies);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleAddCompany = async () => {
    try {
      const response = await fetch('http://localhost:5000/add-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ company: newCompany })
      });
      
      const data = await response.json();
      if (response.ok) {
        alert('เพิ่มสถานประกอบการ สำเร็จ!!!');
        setIsAddModalOpen(false);
        resetForm();
        fetchCompanies();
      } else {
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการเพิ่มสถานประกอบการ');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEditCompany = async () => {
    try {
      const response = await fetch(`http://localhost:5000/edit-company/${editingCompany.company_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ company: editingCompany })
      });
      
      const data = await response.json();
      if (response.ok) {
        alert('แก้ไขข้อมูลสถานประกอบการ สำเร็จ!!!');
        setIsEditModalOpen(false);
        setEditingCompany(null);
        
        // First fetch updated data
        await fetchCompanies();
        
        // Then refresh the page
        window.location.reload();
      } else {
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const resetForm = () => {
    setNewCompany({
      company_name: '',
      address: '',
      location: '',
      contact_person: '',
      contact_phone: '',
      job_position: '',
      internship_available: '',
      job_description: '',
      qualifications: '',
    });
  };

  // เพิ่มฟังก์ชันการเลือกบริษัท
  const handleSelectCompany = async (company) => {
    try {
      // ดึงข้อมูล profile จาก localStorage
      const profileStr = localStorage.getItem('profile');
      if (!profileStr) {
        alert('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
        return;
      }
  
      const profile = JSON.parse(profileStr);
      const student_id = profile.student_id;
  
      if (!student_id) {
        alert('ไม่พบข้อมูลรหัสนักศึกษา กรุณาเข้าสู่ระบบใหม่');
        return;
      }
  
      // เพิ่ม log เพื่อตรวจสอบข้อมูล
      console.log('Profile data:', profile);
      console.log('Student ID:', student_id);
      console.log('Company ID:', company.company_id);
  
      const response = await fetch('http://localhost:5000/match-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: student_id,
          company_id: company.company_id
        })
      });
  
      const data = await response.json();
      
      if (response.ok) {
        alert(`เลือกสถานประกอบการ ${company.company_name} เรียบร้อยแล้ว`);
        setSelectedCompany(company);
        setIsMatchExists(true);
        // อัพเดท matchInfo
        setMatchInfo({
          companyId: company.company_id,
          companyName: company.company_name,
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
  
  // เพิ่มการแสดงข้อมูลการจับคู่ในส่วน JSX
  {isMatchExists && matchInfo && (
    <div className="match-info bg-blue-50 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold">สถานะการเลือกสถานประกอบการ</h3>
      <p>สถานประกอบการที่เลือก: {matchInfo.companyName}</p>
      <p>สถานะ: {matchInfo.status}</p>
    </div>
  )}

  useEffect(() => {
    const checkMatchStatus = async () => {
      try {
        const student_id = localStorage.getItem('student_id');
        
        if (!student_id) {
          console.error('ไม่พบข้อมูลรหัสนักศึกษา');
          return;
        }
  
        const response = await fetch(`http://localhost:5000/check-match-status/${student_id}`);
        const data = await response.json();
        
        if (data.has_match) {
          setIsMatchExists(true);
        }
      } catch (error) {
        console.error('Error checking match status:', error);
      }
    };
  
    checkMatchStatus();
  }, []);

  // เพิ่มฟังก์ชันดูรายละเอียดบริษัท
  const handleViewDetails = (company) => {
    // Detailed logging for debugging
    console.log('Viewing details - Full Company Data:', company);
    console.log('Current Modal State Before Open:', {
      isDetailsModalOpen,
      selectedCompany
    });
  
    try {
      // Validate company data
      if (!company) {
        console.error('ERROR: No company data provided');
        return;
      }
  
      // Set the selected company explicitly
      setSelectedCompany(company);
      
      // Force open the modal with a small delay to ensure state update
      setTimeout(() => {
        setIsDetailsModalOpen(true);
        
        // Additional logging after state update
        console.log('Modal State After Update:', {
          isDetailsModalOpen,
          selectedCompany
        });
      }, 50);
  
    } catch (error) {
      console.error('ERROR in handleViewDetails:', error);
    }
  };

  // เพิ่ม State สำหรับการแบ่งหน้า
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [itemsPerPage] = useState(4);  // เปลี่ยนเป็น 6 แทน 8

  // เพิ่ม State สำหรับทักษะนักศึกษา
  const [studentSkills, setStudentSkills] = useState([]);

  // ดึงข้อมูลโปรไฟล์และทักษะนักศึกษา
  useEffect(() => {
    const fetchStudentProfile = async () => {
      const username = localStorage.getItem('username');
      try {
        const response = await fetch(`http://localhost:5000/student-profile?username=${username}`);
        const data = await response.json();
        const skills = data.profile.skills || [];
        setStudentSkills(skills);
      } catch (error) {
        console.error('Error fetching student skills:', error);
      }
    };

    fetchStudentProfile();
  }, []);

  // ตรวจสอบสถานะการจับคู่
  useEffect(() => {
    const checkMatchStatus = async () => {
      try {
        const student_id = localStorage.getItem('student_id');
        if (!student_id) {
          console.error('ไม่พบข้อมูลรหัสนักศึกษา');
          return;
        }
  
        const response = await fetch(`http://localhost:5000/check-match-status/${student_id}`);
        const data = await response.json();
        
        if (data.has_match) {
          setIsMatchExists(true);
          setMatchInfo({
            companyId: data.company_id,
            companyName: data.company_name,
            status: data.status
          });
        }
      } catch (error) {
        console.error('Error checking match status:', error);
      }
    };
  
    checkMatchStatus();
  }, []);

  // ดึงข้อมูลบริษัทที่จัดอันดับแล้ว
  // 1. แก้ไขฟังก์ชัน fetchRankedCompanies ให้รองรับ pagination อย่างถูกต้อง
const fetchRankedCompanies = async () => {
  try {
    // กำหนดให้รับข้อมูลเฉพาะหน้าปัจจุบันจาก backend
    const response = await fetch('http://localhost:5000/ranked-companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        student_skills: studentSkills,
        page: currentPage,
        per_page: itemsPerPage // ส่งจำนวนรายการต่อหน้าที่ต้องการให้ backend
      })
    });

    const data = await response.json();
    
    // แปลงข้อมูลบริษัท
    const processedCompanies = data.companies.map(company => ({
      company_id: company.company_id,
      ...company.company_info,
      skill_match: company.skill_match
    }));

    // ดึงข้อมูลคะแนนรีวิวเพื่อใช้ในการจัดเรียง
    const ratingsResponse = await fetch('http://localhost:5000/all-companies-ratings');
    const ratingsData = await ratingsResponse.json();
    
    // สร้าง map ของคะแนนรีวิว
    const ratingsMap = {};
    ratingsData.forEach(item => {
      ratingsMap[item.company_id] = {
        average: item.average_rating || 0,
        total: item.total_reviews || 0
      };
    });
    
    // จัดเรียงบริษัทตามความเข้ากันของทักษะ และคะแนนรีวิว
    const sortedCompanies = processedCompanies.sort((a, b) => {
      if (b.skill_match !== a.skill_match) {
        return b.skill_match - a.skill_match;
      }
      
      const aRating = ratingsMap[a.company_id]?.average || 0;
      const bRating = ratingsMap[b.company_id]?.average || 0;
      
      return bRating - aRating;
    });

    // ตรวจสอบว่าจำนวนบริษัทไม่เกิน itemsPerPage
    // ถ้าเกินให้ตัดเอาเฉพาะจำนวนที่ต้องการ
    const limitedCompanies = sortedCompanies.slice(0, itemsPerPage);

    setCompanies(limitedCompanies);
    setFilteredCompanies(limitedCompanies);
    setCompanyRatings(ratingsMap);
    setTotalPages(data.total_pages);
  } catch (error) {
    console.error('Error fetching ranked companies:', error);
  }
};

  // เรียกใช้งานฟังก์ชันดึงบริษัทเมื่อมีการเปลี่ยนแปลงทักษะหรือหน้า
  // 3. ปรับปรุง useEffect สำหรับการเรียกใช้ fetchRankedCompanies
useEffect(() => {
  if (studentSkills.length > 0) {
    fetchRankedCompanies();
  }
}, [studentSkills, currentPage]); // ดึงข้อมูลใหม่เมื่อทักษะหรือหน้าเปลี่ยน

  // ฟังก์ชันเปลี่ยนหน้า
  // 4. แก้ไขฟังก์ชัน handlePageChange ให้ชัดเจนขึ้น
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // First page button
    if (startPage > 1) {
      buttons.push(
        <button 
          key="first" 
          className="pagination-button"
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="start-ellipsis">...</span>);
      }
    }

    // Page number buttons
    for (let page = startPage; page <= endPage; page++) {
      buttons.push(
        <button 
          key={page} 
          className={`pagination-button ${page === currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </button>
      );
    }

    // Last page button
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="end-ellipsis">...</span>);
      }
      buttons.push(
        <button 
          key="last" 
          className="pagination-button"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  // กรองบริษัทตามคำค้นหา
  useEffect(() => {
    if (companies.length > 0) {
      // กรองตามคำค้นหา
      const filtered = companies.filter(company => 
        Object.values(company).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      
      // คงการเรียงลำดับตาม skill_match และ rating
      const sortedFiltered = [...filtered].sort((a, b) => {
        // เปรียบเทียบ skill_match ก่อน
        if (b.skill_match !== a.skill_match) {
          return b.skill_match - a.skill_match;
        }
        
        // ถ้า skill_match เท่ากัน ให้เรียงตามคะแนนรีวิว
        const aRating = companyRatings[a.company_id]?.average || 0;
        const bRating = companyRatings[b.company_id]?.average || 0;
        
        return bRating - aRating;
      });
      
      // ตรวจสอบว่าจำนวนบริษัทไม่เกิน itemsPerPage
      const limitedResults = sortedFiltered.slice(0, itemsPerPage);
      
      setFilteredCompanies(limitedResults);
    }
  }, [searchTerm, companies, companyRatings]);

  return (
    <div className="company-page">
      <Navbar />
      <div className="company-container">
        <div className="company-header">
          <h1 className="company-title">รายชื่อสถานประกอบการ</h1>
        </div>
        
        {/* ระบบค้นหาขั้นสูง */}
        <AdvancedSearch onSearch={handleAdvancedSearch} />
        
        {/* แสดงข้อมูลการจับคู่ถ้ามี */}
        {isMatchExists && matchInfo && (
          <div className="match-info">
            <h3>สถานะการเลือกสถานประกอบการ</h3>
            <p>สถานประกอบการที่เลือก: <strong>{matchInfo.companyName}</strong></p>
            <p>สถานะ: <span className="status-badge">{matchInfo.status}</span></p>
          </div>
        )}

        <div className="action-buttons">
          <button 
            className="btn-add-company"
            onClick={() => navigate('/skills-Company-management')}
          >
            <NotebookPen size={20} />
            <span>จัดการคุณสมบัติที่สถานประกอบการต้องการ</span>
          </button>

          <button 
            className="btn-add-company"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={20} />
            <span>เพิ่มสถานประกอบการ</span>
          </button>
        </div>

        {/* กริดแสดงบริษัท */}
        <div className="company-grid">
          {filteredCompanies.map(company => (
            <div 
              key={company.company_id} 
              className="company-card"
            >
              {/* แสดงเปอร์เซ็นต์การจับคู่ทักษะ */}
              {company.skill_match !== undefined && (
                <div className="skill-match-badge">
                  {company.skill_match.toFixed(0)}% ตรงกับทักษะ
                </div>
              )}

              <div className="company-card-header">
                <h3 className="company-name">{company.company_name}</h3>
                <div className="company-actions">
                  <button 
                    className="btn-icon"
                    onClick={() => {
                      setEditingCompany(company);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Edit size={18} />
                  </button>
                </div>
              </div>

              {companyRatings[company.company_id] && (
                <div className="company-rating-summary">
                  <div className="stars-display">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star 
                        key={`grid-star-${index}`}
                        className={`star ${
                          index < Math.floor(companyRatings[company.company_id].average) 
                            ? 'filled' 
                            : (index === Math.floor(companyRatings[company.company_id].average) && 
                              companyRatings[company.company_id].average % 1 >= 0.5) 
                              ? 'half-filled' 
                              : 'empty'
                        }`}
                        size={16}
                      />
                    ))}
                  </div>
                  <span className="company-rating-value">
                    {companyRatings[company.company_id].average.toFixed(1)}
                  </span>
                  <span className="company-review-count">
                    ({companyRatings[company.company_id].total} รีวิว)
                  </span>
                </div>
              )}

              {/* แสดงจำนวนนักศึกษาที่ฝึกงาน */}
              <div className="student-count-badge">
                <Users size={16} className="detail-icon" />
                <span>เคยรับนักศึกษา: {companyStudentCounts[company.company_id] || 0} คน</span>
              </div>

              <div className="company-info">
                <div className="company-detail">
                  <MapPin size={16} className="detail-icon" />
                  <span>{company.address}</span>
                </div>
                <div className="company-detail">
                  <Phone size={16} className="detail-icon" />
                  <span>{company.contact_phone}</span>
                </div>
                <div className="company-detail">
                  <User size={16} className="detail-icon" />
                  <span>{company.contact_person}</span>
                </div>
                <div className="company-detail">
                  <Briefcase size={16} className="detail-icon" />
                  <span>{company.job_position}</span>
                </div>
              </div>

              <div className="company-card-footer">
                <button 
                  className="btn-secondary w-full mb-2 flex items-center justify-center gap-2"
                  onClick={() => {
                    // Call handleViewDetails directly with the company
                    handleViewDetails(company)
                  }}
                >
                  <Info size={18} />
                  ดูรายละเอียดเพิ่มเติม
                </button>
                <button 
                  className="btn-primary w-full flex items-center justify-center gap-2"
                  onClick={() => handleSelectCompany(company)}
                  disabled={isMatchExists}
                >
                  <CheckCircle size={18} />
                  {isMatchExists ? 'เลือกสถานประกอบการแล้ว' : 'เลือกสถานประกอบการนี้'}
                </button>
              </div>
            </div>
          ))}
        </div>

         {/* ส่วนการแบ่งหน้า */}
         {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={20} />
                </button>
                
                {renderPaginationButtons()}
                
                <button 
                  className="pagination-button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

        {/* โมดอลต่างๆ ใส่ตามโค้ดเดิม */}
        {/* Modal รายละเอียดบริษัท */}
        <Modal
          isOpen={isDetailsModalOpen}
          onRequestClose={() => setIsDetailsModalOpen(false)}
          className="modal"
          overlayClassName="modal-overlay"
        >
          {/* โค้ดโมดอลรายละเอียดบริษัทเหมือนเดิม */}
          {selectedCompany && (
            <>
              <div className="modal-header">
                <h2 className="modal-title">รายละเอียดสถานประกอบการ</h2>
                <button 
                  className="modal-close"
                  onClick={() => setIsDetailsModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-content">
                <div className="form-group">
                  <label className="form-label">ชื่อสถานประกอบการ</label>
                  <p className="form-text">{selectedCompany.company_name}</p>
                </div>

                <div className="form-group">
                  <label className="form-label">ที่อยู่</label>
                  <p className="form-text">{selectedCompany.address}</p>
                </div>

                <div className="form-group">
                  <label className="form-label">สถานที่ตั้ง</label>
                  <p className="form-text">{selectedCompany.location}</p>
                </div>

                <div className="form-group">
                  <label className="form-label">ชื่อผู้ติดต่อ</label>
                  <p className="form-text">{selectedCompany.contact_person}</p>
                </div>

                <div className="form-group">
                  <label className="form-label">เบอร์โทรศัพท์</label>
                  <p className="form-text">{selectedCompany.contact_phone}</p>
                </div>

                <div className="form-group">
                  <label className="form-label">ตำแหน่งงาน</label>
                  <p className="form-text">{selectedCompany.job_position}</p>
                </div>

                <div className="form-group">
                  <label className="form-label">การรับนักศึกษาฝึกงาน</label>
                  <p className="form-text">{selectedCompany.internship_available}</p>
                </div>

                <div className="form-group">
                  <label className="form-label">รายละเอียดงาน</label>
                  <p className="form-text">{selectedCompany.job_description}</p>
                </div>

                <div className="form-group">
                  <label className="form-label">คุณสมบัติที่ต้องการ</label>
                  <p className="form-text">{selectedCompany.qualifications}</p>
                </div>

                <div className="form-group">
                  <label className="form-label">เคยรับนักศึกษา</label>
                  <p className="form-text">{companyStudentCounts[selectedCompany.company_id] || 0} คน</p>
                </div>

                {selectedCompany && (
                  <div className="company-reviews-section">
                    <h3 className="section-title">รีวิวและความคิดเห็น</h3>
                    <CompanyReviews 
                      companyId={selectedCompany.company_id}
                      companyName={selectedCompany.company_name}
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button 
                  className="btn-secondary"
                  onClick={() => setIsDetailsModalOpen(false)}
                >
                  ปิด
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    handleSelectCompany(selectedCompany);
                    setIsDetailsModalOpen(false);
                  }}
                >
                  เลือกสถานประกอบการ
                </button>
              </div>
            </>
          )}
        </Modal>

        {/* Add Company Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onRequestClose={() => setIsAddModalOpen(false)}
          className="modal"
          overlayClassName="modal-overlay"
        >
          <div className="modal-header">
            <h2 className="modal-title">เพิ่มสถานประกอบการ</h2>
            <button 
              className="modal-close"
              onClick={() => setIsAddModalOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">ชื่อสถานประกอบการ</label>
            <input
              type="text"
              className="form-input"
              value={newCompany.company_name}
              onChange={(e) => setNewCompany({ ...newCompany, company_name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">ที่อยู่</label>
            <textarea
              className="form-textarea"
              value={newCompany.address}
              onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">สถานที่ตั้ง</label>
            <input
              type="text"
              className="form-input"
              value={newCompany.location}
              onChange={(e) => setNewCompany({ ...newCompany, location: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">ชื่อผู้ติดต่อ</label>
            <input
              type="text"
              className="form-input"
              value={newCompany.contact_person}
              onChange={(e) => setNewCompany({ ...newCompany, contact_person: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">เบอร์โทรศัพท์</label>
            <input
              type="text"
              className="form-input"
              value={newCompany.contact_phone}
              onChange={(e) => setNewCompany({ ...newCompany, contact_phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">ตำแหน่งงาน</label>
            <input
              type="text"
              className="form-input"
              value={newCompany.job_position}
              onChange={(e) => setNewCompany({ ...newCompany, job_position: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">การรับนักศึกษาฝึกงาน</label>
            <input
              type="text"
              className="form-input"
              value={newCompany.internship_available}
              onChange={(e) => setNewCompany({ ...newCompany, internship_available: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">รายละเอียดงาน</label>
            <textarea
              className="form-textarea"
              value={newCompany.job_description}
              onChange={(e) => setNewCompany({ ...newCompany, job_description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">คุณสมบัติที่ต้องการ</label>
            <textarea
              disabled
              className="form-textarea"
              value={newCompany.qualifications}
              onChange={(e) => setNewCompany({ ...newCompany, qualifications: e.target.value })}
            />
          </div>

          <div className="modal-footer">
            <button 
              className="btn-secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              ยกเลิก
            </button>
            <button 
              className="btn-primary"
              onClick={handleAddCompany}
            >
              เพิ่มสถานประกอบการ
            </button>
          </div>
        </Modal>

        {/* Edit Company Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onRequestClose={() => setIsEditModalOpen(false)}
          className="modal"
          overlayClassName="modal-overlay"
        >
          {editingCompany && (
            <>
              <div className="modal-header">
                <h2 className="modal-title">แก้ไขข้อมูลสถานประกอบการ</h2>
                <button 
                  className="modal-close"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">ชื่อสถานประกอบการ</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingCompany.company_name}
                  onChange={(e) => setEditingCompany({
                    ...editingCompany,
                    company_name: e.target.value
                  })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">ที่อยู่</label>
                <textarea
                  className="form-textarea"
                  value={editingCompany.address}
                  onChange={(e) => setEditingCompany({
                    ...editingCompany,
                    address: e.target.value
                  })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">สถานที่ตั้ง</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingCompany.location}
                  onChange={(e) => setEditingCompany({
                    ...editingCompany,
                    location: e.target.value
                  })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">ชื่อผู้ติดต่อ</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingCompany.contact_person}
                  onChange={(e) => setEditingCompany({
                    ...editingCompany,
                    contact_person: e.target.value
                  })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingCompany.contact_phone}
                  onChange={(e) => setEditingCompany({
                    ...editingCompany,
                    contact_phone: e.target.value
                  })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">ตำแหน่งงาน</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingCompany.job_position}
                  onChange={(e) => setEditingCompany({
                    ...editingCompany,
                    job_position: e.target.value
                  })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">การรับนักศึกษาฝึกงาน</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingCompany.internship_available}
                  onChange={(e) => setEditingCompany({
                    ...editingCompany,
                    internship_available: e.target.value
                  })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">รายละเอียดงาน</label>
                <textarea
                  className="form-textarea"
                  value={editingCompany.job_description}
                  onChange={(e) => setEditingCompany({
                    ...editingCompany,
                    job_description: e.target.value
                  })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">คุณสมบัติที่ต้องการ</label>
                <textarea
                  disabled
                  className="form-textarea"
                  value={editingCompany.qualifications}
                  onChange={(e) => setEditingCompany({
                    ...editingCompany,
                    qualifications: e.target.value
                  })}
                />
              </div>

              <div className="modal-footer">
                <button 
                  className="btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  ยกเลิก
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleEditCompany}
                >
                  บันทึกการเปลี่ยนแปลง
                </button>
              </div>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default StudentToIndus;