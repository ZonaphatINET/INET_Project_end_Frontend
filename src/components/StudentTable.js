import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { Search, Upload, Download, AlertCircle, ChevronLeft, ChevronRight, Trash2, Info, X, ArrowUp, ArrowDown } from 'lucide-react';
import Modal from 'react-modal';
import Navbar from "./Navbar";
import '../styles/StudentTable.css';
import API_URL from '../config';

const StudentTable = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [navigate, setNavigate] = useState();
  const itemsPerPage = 15;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  // Add sorting state
  const [sortConfig, setSortConfig] = useState({
    key: 'student_id',
    direction: 'ascending'
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // ดึงข้อมูลนักศึกษา
      const studentsResponse = await fetch(`${API_URL}/students-Table`);
      if (!studentsResponse.ok) {
        throw new Error('Failed to fetch students');
      }
      const studentsData = await studentsResponse.json();
  
      // ดึงข้อมูลการแมช
      const matchResponse = await fetch(`${API_URL}/all-matches`);
      if (!matchResponse.ok) {
        throw new Error('Failed to fetch matches');
      }
      const matchesData = await matchResponse.json();
  
      // ดึงข้อมูลบริษัท
      const companiesResponse = await fetch(`${API_URL}/companies`);
      if (!companiesResponse.ok) {
        throw new Error('Failed to fetch companies');
      }
      const companiesData = await companiesResponse.json();
  
      // แมปข้อมูลบริษัทให้ง่ายต่อการค้นหา
      const companiesMap = {};
      companiesData.forEach(company => {
        companiesMap[company.company_id] = company.company.company_name;
      });
  
      // รวมข้อมูลนักศึกษากับข้อมูลการแมช
      const combinedData = studentsData.map(student => {
        const match = matchesData.find(m => m.macth.student_id === student.student_id);
        if (match) {
          return {
            ...student,
            status: match.macth.status,
            company: companiesMap[match.macth.company_id] || '-'
          };
        }
        return {
          ...student,
          status: "ไม่มีสถานะ",
          company: "-"
        };
      });
  
      setStudents(combinedData);
    } catch (error) {
      setError("ไม่สามารถโหลดข้อมูลได้");
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add sorting function
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Helper function to get sorted items
  const getSortedItems = (items) => {
    if (!sortConfig.key) return items;
    
    return [...items].sort((a, b) => {
      // Handle undefined or null values
      if (!a[sortConfig.key] && !b[sortConfig.key]) return 0;
      if (!a[sortConfig.key]) return 1;
      if (!b[sortConfig.key]) return -1;
      
      // Case-insensitive string comparison for string values
      const aValue = typeof a[sortConfig.key] === 'string' ? a[sortConfig.key].toLowerCase() : a[sortConfig.key];
      const bValue = typeof b[sortConfig.key] === 'string' ? b[sortConfig.key].toLowerCase() : b[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  // Function to render sorting icon
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? 
      <ArrowUp size={16} className="sort-icon" /> : 
      <ArrowDown size={16} className="sort-icon" />;
  };

  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      student.student_id?.toLowerCase().includes(searchLower) ||
      student.name?.toLowerCase().includes(searchLower) ||
      student.program?.toLowerCase().includes(searchLower) ||
      student.phone?.includes(searchTerm) ||
      student.status?.toLowerCase().includes(searchLower) ||
      student.company?.toLowerCase().includes(searchLower);

    const matchesProgram = programFilter === "all" || student.program === programFilter;
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;

    return matchesSearch && matchesProgram && matchesStatus;
  });

  // Apply sorting to filtered students
  const sortedAndFilteredStudents = getSortedItems(filteredStudents);

  // Pagination logic
  const totalPages = Math.ceil(sortedAndFilteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = sortedAndFilteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const confirmUpload = window.confirm("ยืนยันการอัพโหลดไฟล์ CSV?");
    if (!confirmUpload) {
      event.target.value = null;
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        try {
          const studentsData = result.data.map((row) => ({
            username: row.username,
            password: row.password,
            role: row.role,
            first_login: true,
            profile: {
              email: row.email,
              name: row.name,
              phone: row.phone,
              program: row.program,
              skills: row.skills?.split(",") || [],
              student_id: row.student_id,
            },
          }));

          const response = await fetch(`${API_URL}/upload-students`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(studentsData),
          });

          if (!response.ok) {
            throw new Error("Failed to upload students");
          }

          alert("อัพโหลดข้อมูลสำเร็จ");
          fetchStudents();
        } catch (error) {
          alert("เกิดข้อผิดพลาดในการอัพโหลดข้อมูล");
          console.error("Error uploading students:", error);
        }
        event.target.value = null;
      },
      error: (error) => {
        alert("เกิดข้อผิดพลาดในการอ่านไฟล์ CSV");
        console.error("Error parsing CSV:", error);
        event.target.value = null;
      },
    });
  };

  const handleExportCSV = () => {
    const headers = [
      "student_id",
      "name",
      "program",
      "phone",
      "status",
      "company",
    ];
    
    const csvData = [
      headers.join(","),
      ...sortedAndFilteredStudents.map(student => 
        headers.map(header => `"${student[header] || ""}"`).join(",")
      )
    ].join("\n");
  
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'students.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      const response = await fetch(`${API_URL}/delete-student/${studentId}`, {
        method: 'DELETE'
      });
  
      if (response.ok) {
        alert('ลบข้อมูลนักศึกษาเรียบร้อยแล้ว');
        fetchStudents(); // รีโหลดข้อมูลหลังลบ
        setIsDeleteModalOpen(false);
        setSelectedStudent(null);
      } else {
        const data = await response.json();
        throw new Error(data.message || 'ไม่สามารถลบข้อมูลนักศึกษาได้');
      }
    } catch (error) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    try {
      // ทำการดึงข้อมูลรายละเอียดของนักศึกษา
      const response = await fetch(`${API_URL}/student-details/${studentId}`);
      
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลรายละเอียดนักศึกษาได้');
      }
      
      const data = await response.json();
      setSelectedStudent(data);
      setIsDetailsModalOpen(true);
    } catch (error) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    }
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

  return (
    <div className="table-page">
      <Navbar />
      <div className="table-container">
        <div className="table-header">
          <button 
            onClick={() => navigate('/Staff-dashboard')}
            className="back-button"
          >
          </button>
          <h1 className="table-title">รายชื่อนักศึกษา</h1>
          
          <div className="search-and-filter-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="ค้นหา..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <Search size={25} className="search-icon" />
            </div>

            <div className="filter-container">
              <select
                className="filter-select"
                value={programFilter}
                onChange={(e) => {
                  setProgramFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">สาขาทั้งหมด</option>
                <option value="IT">IT</option>
                <option value="ITI">ITI</option>
                <option value="INE">INE</option>
                <option value="INET">INET</option>
              </select>

              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">สถานะทั้งหมด</option>
                <option value="ไม่มีสถานะ">ไม่มีสถานะ</option>
                <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                <option value="ตอบรับ">ตอบรับ</option>
              </select>
            </div>
          </div>
        </div>

        {error ? (
          <div className="error-container">
            <AlertCircle size={24} />
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="student-table">
              <thead>
  <tr>
    <th 
      onClick={() => requestSort('student_id')} 
      className="sortable-header"
      data-sorted={sortConfig.key === 'student_id' ? 'true' : 'false'}
    >
      รหัสนักศึกษา {renderSortIcon('student_id')}
    </th>
    <th 
      onClick={() => requestSort('name')} 
      className="sortable-header"
      data-sorted={sortConfig.key === 'name' ? 'true' : 'false'}
    >
      ชื่อ-นามสกุล {renderSortIcon('name')}
    </th>
    <th 
      onClick={() => requestSort('program')} 
      className="sortable-header"
      data-sorted={sortConfig.key === 'program' ? 'true' : 'false'}
    >
      สาขาวิชา {renderSortIcon('program')}
    </th>
    <th 
      onClick={() => requestSort('phone')} 
      className="sortable-header"
      data-sorted={sortConfig.key === 'phone' ? 'true' : 'false'}
    >
      เบอร์โทรศัพท์ {renderSortIcon('phone')}
    </th>
    <th 
      onClick={() => requestSort('status')} 
      className="sortable-header"
      data-sorted={sortConfig.key === 'status' ? 'true' : 'false'}
    >
      สถานะ {renderSortIcon('status')}
    </th>
    <th 
      onClick={() => requestSort('company')} 
      className="sortable-header"
      data-sorted={sortConfig.key === 'company' ? 'true' : 'false'}
    >
      สถานประกอบการ {renderSortIcon('company')}
    </th>
    <th>จัดการ</th>
  </tr>
</thead>
                <tbody>
  {isLoading ? (
    <tr className="loading-row">
      <td colSpan="7">กำลังโหลดข้อมูล...</td>
    </tr>
  ) : paginatedStudents.length > 0 ? (
    paginatedStudents.map((student) => (
      <tr key={student.student_id}>
        <td>{student.student_id}</td>
        <td>{student.name}</td>
        <td>{student.program}</td>
        <td>{student.phone || "-"}</td>
        <td>
          <span className={`status-cell ${
            student.status === 'กำลังดำเนินการ' ? 'status-pending' : 
            student.status === 'ตอบรับ' ? 'status-approved' : 
            student.status === 'ไม่ตอบรับ' ? 'status-rejected' : ''
          }`}>
            {student.status || "ไม่มีสถานะ"}
          </span>
        </td>
        <td>{student.company || "-"}</td>
        <td className="action-cell">
          <button 
            className="btn-icon"
            onClick={() => fetchStudentDetails(student.student_id)}
            title="ดูรายละเอียด"
          >
            <Info size={18} />
          </button>
          <button 
            className="btn-icon delete"
            onClick={() => {
              setSelectedStudent(student);
              setIsDeleteModalOpen(true);
            }}
            title="ลบข้อมูลนักศึกษา"
          >
            <Trash2 size={18} />
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr className="empty-row">
      <td colSpan="7">ไม่พบข้อมูลนักศึกษา</td>
    </tr>
  )}
</tbody>
              </table>
            </div>

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
          </>
        )}

        <div className="table-actions">
          <div className="file-input-container">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="file-input"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="btn-upload">
              <Upload size={20} />
              <span>อัพโหลด CSV</span>
            </label>
          </div>
        </div>

        <div className="upload-section">
          <h3 className="upload-title">การอัพโหลดไฟล์ CSV</h3>
          <p className="upload-description">
            ไฟล์ CSV ต้องมีคอลัมน์ดังต่อไปนี้:
          </p>
          <ul className="upload-requirements">
            <li>username - รหัสนักศึกษา</li>
            <li>password - รหัสผ่านเริ่มต้น</li>
            <li>role - บทบาท (student)</li>
            <li>email - อีเมลนักศึกษา</li>
            <li>name - ชื่อ-นามสกุล</li>
            <li>phone - เบอร์โทรศัพท์</li>
            <li>program - สาขาวิชา</li>
            <li>skills - ความสามารถ (คั่นด้วยเครื่องหมาย ,)</li>
            <li>student_id - รหัสนักศึกษา</li>
          </ul>
        </div>
      </div>

      {/* โมดัลยืนยันการลบ */}
<Modal
  isOpen={isDeleteModalOpen}
  onRequestClose={() => {
    setIsDeleteModalOpen(false);
    setSelectedStudent(null);
  }}
  className="confirm-modal"
  overlayClassName="modal-overlay"
>
  <div className="modal-header">
    <h2 className="modal-title">ยืนยันการลบข้อมูลนักศึกษา</h2>
    <button 
      className="modal-close"
      onClick={() => {
        setIsDeleteModalOpen(false);
        setSelectedStudent(null);
      }}
    >
      <X size={20} />
    </button>
  </div>
  
  <div className="modal-content">
    <div className="warning-message">
      <AlertCircle size={48} className="warning-icon" />
      <p>คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนักศึกษานี้? การกระทำนี้ไม่สามารถเรียกคืนได้</p>
    </div>
    
    {selectedStudent && (
      <div className="student-preview">
        <p><strong>รหัสนักศึกษา:</strong> {selectedStudent.student_id}</p>
        <p><strong>ชื่อ-นามสกุล:</strong> {selectedStudent.name}</p>
        <p><strong>สาขาวิชา:</strong> {selectedStudent.program}</p>
      </div>
    )}
  </div>
  
  <div className="modal-footer">
    <button 
      className="btn-secondary"
      onClick={() => {
        setIsDeleteModalOpen(false);
        setSelectedStudent(null);
      }}
    >
      ยกเลิก
    </button>
    <button 
      className="btn-delete"
      onClick={() => handleDeleteStudent(selectedStudent.student_id)}
    >
      ยืนยันการลบ
    </button>
  </div>
</Modal>

{/* โมดัลแสดงรายละเอียด */}
<Modal
  isOpen={isDetailsModalOpen}
  onRequestClose={() => {
    setIsDetailsModalOpen(false);
    setSelectedStudent(null);
  }}
  className="details-modal"
  overlayClassName="modal-overlay"
>
  <div className="modal-header">
    <h2 className="modal-title">ข้อมูลนักศึกษา</h2>
    <button 
      className="modal-close"
      onClick={() => {
        setIsDetailsModalOpen(false);
        setSelectedStudent(null);
      }}
    >
      <X size={20} />
    </button>
  </div>
  
  {selectedStudent && (
    <div className="modal-content">
      <div className="student-details-grid">
        <div className="detail-item">
          <span className="detail-label">รหัสนักศึกษา:</span>
          <span className="detail-value">{selectedStudent.student_id}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">ชื่อ-นามสกุล:</span>
          <span className="detail-value">{selectedStudent.name}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">สาขาวิชา:</span>
          <span className="detail-value">{selectedStudent.program}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">อีเมล:</span>
          <span className="detail-value">{selectedStudent.email || "-"}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">เบอร์โทรศัพท์:</span>
          <span className="detail-value">{selectedStudent.phone || "-"}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">สถานะ:</span>
          <span className={`status-badge ${
            selectedStudent.status === 'กำลังดำเนินการ' ? 'status-pending' : 
            selectedStudent.status === 'ตอบรับ' ? 'status-approved' : 
            selectedStudent.status === 'ไม่ตอบรับ' ? 'status-rejected' : ''
          }`}>
            {selectedStudent.status || "ไม่มีสถานะ"}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">สถานประกอบการ:</span>
          <span className="detail-value">{selectedStudent.company || "-"}</span>
        </div>
        
        {selectedStudent.skills && selectedStudent.skills.length > 0 && (
          <div className="detail-item skills-item">
            <span className="detail-label">ทักษะ:</span>
            <div className="skills-grid">
              {selectedStudent.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )}
  
  <div className="modal-footer">
    <button 
      className="btn-secondary"
      onClick={() => {
        setIsDetailsModalOpen(false);
        setSelectedStudent(null);
      }}
    >
      ปิด
    </button>
  </div>
</Modal>

    </div>
  );
};

export default StudentTable;