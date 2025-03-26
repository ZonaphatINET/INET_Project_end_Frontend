import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { Search, Upload, Download, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

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
      ...filteredStudents.map(student => 
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
                    <th>รหัสนักศึกษา</th>
                    <th>ชื่อ-นามสกุล</th>
                    <th>สาขาวิชา</th>
                    <th>เบอร์โทรศัพท์</th>
                    <th>สถานะ</th>
                    <th>สถานประกอบการ</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr className="loading-row">
                      <td colSpan="6">กำลังโหลดข้อมูล...</td>
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
                      </tr>
                    ))
                  ) : (
                    <tr className="empty-row">
                      <td colSpan="6">ไม่พบข้อมูลนักศึกษา</td>
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
    </div>
  );
};

export default StudentTable;