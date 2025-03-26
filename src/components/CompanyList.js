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
  ChevronRight  
} from 'lucide-react';
import Navbar from './Navbar';
import '../styles/StudentToIndus.css';
import { useNavigate } from 'react-router-dom';
import AdvancedSearch from './AdvancedSearch';
import API_URL from '../config'; 

const CompanyList = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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
    
    setFilteredCompanies(filtered);
    setCurrentPage(1); // รีเซ็ตกลับไปที่หน้าแรก
  };

  // เพิ่ม State สำหรับการแบ่งหน้า
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);  // แสดง 6 กริดต่อหน้า

  useEffect(() => {
    Modal.setAppElement('#root');
    fetchCompanies();
  }, []);

  useEffect(() => {
    // กรองบริษัทตามคำค้นหา
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
      const response = await fetch(`${API_URL}/companies`);
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

  // คำนวณบริษัทที่จะแสดงในหน้าปัจจุบัน
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCompanies = filteredCompanies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);

  const handleAddCompany = async () => {
    try {
      const response = await fetch(`${API_URL}/add-company`, {
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
      const response = await fetch(`${API_URL}/edit-company/${editingCompany.company_id}`, {
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
        fetchCompanies();
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

  return (
    <div className="company-page">
      <Navbar />
      <div className="company-container">
        <div className="company-header">
          <h1 className="company-title">รายชื่อสถานประกอบการ</h1>
        </div>
        
        {/* ระบบค้นหาขั้นสูง */}
        <AdvancedSearch onSearch={handleAdvancedSearch} />

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

        <div className="company-grid">
          {currentCompanies.map(company => (
            <div key={company.company_id} className="company-card">
              {/* โค้ดกริดบริษัทเหมือนเดิม */}
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

export default CompanyList;