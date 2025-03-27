import React, { useState, useEffect } from 'react';
import { Star, Filter, ChevronDown, ChevronUp, Trash, X, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from 'react-modal';
import Navbar from './Navbar';
import '../styles/AdminReviews.css';
import API_URL from '../config';

const AdminReviews = () => {
  const [companies, setCompanies] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [minRating, setMinRating] = useState(0);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  
  // เพิ่มตัวแปรสำหรับระบบแบ่งหน้า
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(9);

  useEffect(() => {
    Modal.setAppElement('#root');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // ดึงข้อมูลบริษัททั้งหมด
      const companiesResponse = await fetch(`${API_URL}/companies`);
      const companiesData = await companiesResponse.json();
      setCompanies(companiesData);
      
      // ดึงรีวิวของแต่ละบริษัท
      const allReviews = [];
      for (const company of companiesData) {
        const reviewsResponse = await fetch(`${API_URL}/company-reviews/${company.company_id}`);
        const reviewsData = await reviewsResponse.json();
        
        if (reviewsData.reviews && reviewsData.reviews.length > 0) {
          const formattedReviews = reviewsData.reviews.map(review => ({
            ...review,
            company_name: company.company.company_name,
            company_id: company.company_id
          }));
          allReviews.push(...formattedReviews);
        }
      }
      
      setReviews(allReviews);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      setLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;
    
    try {
      const response = await fetch(`${API_URL}/delete-review/${reviewToDelete.review_id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // อัปเดตรายการรีวิวหลังจากลบ
        setReviews(reviews.filter(review => review.review_id !== reviewToDelete.review_id));
        setIsDeleteModalOpen(false);
        setReviewToDelete(null);
        alert('ลบรีวิวเรียบร้อยแล้ว');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'ไม่สามารถลบรีวิวได้');
      }
    } catch (error) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  // กรองรีวิวตามเงื่อนไข
  const filteredReviews = reviews.filter(review => {
    // กรองตามบริษัท
    if (selectedCompany !== 'all' && review.company_id !== selectedCompany) {
      return false;
    }
    
    // กรองตามคะแนนต่ำสุด
    if (review.review.rating < minRating) {
      return false;
    }
    
    return true;
  });

  // เรียงลำดับรีวิว
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortField) {
      case 'rating':
        return sortDirection === 'asc' 
          ? a.review.rating - b.review.rating
          : b.review.rating - a.review.rating;
        
      case 'date':
        return sortDirection === 'asc'
          ? new Date(a.review.created_at) - new Date(b.review.created_at)
          : new Date(b.review.created_at) - new Date(a.review.created_at);
          
      case 'company':
        return sortDirection === 'asc'
          ? a.company_name.localeCompare(b.company_name)
          : b.company_name.localeCompare(a.company_name);
          
      default:
        return 0;
    }
  });

  // คำนวณรีวิวที่จะแสดงในหน้าปัจจุบัน
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = sortedReviews.slice(indexOfFirstReview, indexOfLastReview);
  
  // คำนวณจำนวนหน้าทั้งหมด
  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);
  
  // ฟังก์ชันเปลี่ยนหน้า
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // เลื่อนขึ้นไปด้านบนของรายการรีวิว
    window.scrollTo({
      top: document.querySelector('.reviews-list').offsetTop - 100,
      behavior: 'smooth'
    });
  };

  // ฟังก์ชันเปลี่ยนฟิลด์การเรียงลำดับ
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    // รีเซ็ตหน้าปัจจุบันเมื่อมีการเรียงลำดับใหม่
    setCurrentPage(1);
  };

  // สร้างแถบดาวตามคะแนน
  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`star ${index < rating ? 'filled' : 'empty'}`}
        size={18}
      />
    ));
  };

  // ฟอร์แมตวันที่
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('th-TH', options);
  };

  return (
    <div className="admin-reviews-page">
      <Navbar />
      <div className="admin-container">
        <div className="admin-header">
          <h1 className="admin-title">จัดการรีวิวสถานประกอบการ</h1>
          <button 
            className="filter-button"
            onClick={() => setIsFilterModalOpen(true)}
          >
            <Filter size={20} />
            ตัวกรอง
          </button>
        </div>

        {loading ? (
          <div className="loading-state">กำลังโหลดข้อมูล...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <>
            <div className="reviews-stats">
              <div className="stat-item">
                <span className="stat-value">{reviews.length}</span>
                <span className="stat-label">รีวิวทั้งหมด</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {reviews.length > 0
                    ? (reviews.reduce((sum, review) => sum + review.review.rating, 0) / reviews.length).toFixed(1)
                    : '0.0'}
                </span>
                <span className="stat-label">คะแนนเฉลี่ย</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {companies.filter(company => 
                    reviews.some(review => review.company_id === company.company_id)
                  ).length}
                </span>
                <span className="stat-label">บริษัทที่ถูกรีวิว</span>
              </div>
            </div>

            <div className="sort-controls">
              <div className="sort-by">
                <span>เรียงตาม:</span>
                <button 
                  className={`sort-button ${sortField === 'date' ? 'active' : ''}`}
                  onClick={() => handleSort('date')}
                >
                  วันที่
                  {sortField === 'date' && (
                    sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </button>
                <button 
                  className={`sort-button ${sortField === 'rating' ? 'active' : ''}`}
                  onClick={() => handleSort('rating')}
                >
                  คะแนน
                  {sortField === 'rating' && (
                    sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </button>
                <button 
                  className={`sort-button ${sortField === 'company' ? 'active' : ''}`}
                  onClick={() => handleSort('company')}
                >
                  บริษัท
                  {sortField === 'company' && (
                    sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </button>
              </div>
              
              <div className="filter-summary">
                {selectedCompany !== 'all' && (
                  <div className="filter-tag">
                    บริษัท: {companies.find(c => c.company_id === selectedCompany)?.company.company_name}
                  </div>
                )}
                {minRating > 0 && (
                  <div className="filter-tag">
                    คะแนน: ≥ {minRating} ดาว
                  </div>
                )}
              </div>
            </div>

            {sortedReviews.length === 0 ? (
              <div className="no-reviews">
                <AlertTriangle size={48} />
                <p>ไม่พบรีวิวที่ตรงตามเงื่อนไขที่กำหนด</p>
              </div>
            ) : (
              <>
                <div className="reviews-list">
                  {currentReviews.map((review) => (
                    <div key={review.review_id} className="review-card">
                      <div className="review-card-header">
                        <div className="review-company">
                          <h3>{review.company_name}</h3>
                        </div>
                        <div className="review-rating">
                          {renderStars(review.review.rating)}
                          <span className="rating-number">{review.review.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <div className="review-meta">
                        <span className="reviewer-name">
                          โดย: {review.review.reviewer_name || 'นักศึกษา'}
                        </span>
                        <span className="review-date">
                          {formatDate(review.review.created_at)}
                        </span>
                      </div>
                      
                      {review.review.comment && (
                        <div className="review-content">
                          {review.review.comment}
                        </div>
                      )}
                      
                      <div className="review-actions">
                        <button 
                          className="delete-review-btn" 
                          onClick={() => {
                            setReviewToDelete(review);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash size={16} />
                          ลบรีวิว
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {sortedReviews.length > reviewsPerPage && (
                  <div className="pagination-controls">
                    <button 
                      className="pagination-button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    {currentPage > 1 && (
                      <button 
                        className="pagination-button"
                        onClick={() => handlePageChange(1)}
                      >
                        1
                      </button>
                    )}
                    
                    {currentPage > 3 && <span className="pagination-ellipsis">...</span>}
                    
                    {currentPage > 2 && (
                      <button 
                        className="pagination-button"
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        {currentPage - 1}
                      </button>
                    )}
                    
                    <button className="pagination-button active">
                      {currentPage}
                    </button>
                    
                    {currentPage < totalPages - 1 && (
                      <button 
                        className="pagination-button"
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        {currentPage + 1}
                      </button>
                    )}
                    
                    {currentPage < totalPages - 2 && <span className="pagination-ellipsis">...</span>}
                    
                    {currentPage < totalPages && (
                      <button 
                        className="pagination-button"
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </button>
                    )}
                    
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
          </>
        )}
      </div>

      {/* โมดัลตัวกรอง */}
      <Modal
        isOpen={isFilterModalOpen}
        onRequestClose={() => setIsFilterModalOpen(false)}
        className="filter-modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h2>ตัวกรองรีวิว</h2>
          <button 
            className="modal-close"
            onClick={() => setIsFilterModalOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-content">
          <div className="filter-section">
            <label className="filter-label">บริษัท</label>
            <select 
              className="filter-select"
              value={selectedCompany}
              onChange={(e) => {
                setSelectedCompany(e.target.value);
                setCurrentPage(1);  // รีเซ็ตหน้าเมื่อมีการเปลี่ยนตัวกรอง
              }}
            >
              <option value="all">ทุกบริษัท</option>
              {companies.map(company => (
                <option key={company.company_id} value={company.company_id}>
                  {company.company.company_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-section">
            <label className="filter-label">คะแนนต่ำสุด</label>
            <div className="rating-filter">
              {[0, 1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  className={`rating-button ${minRating === rating ? 'active' : ''}`}
                  onClick={() => {
                    setMinRating(rating);
                    setCurrentPage(1);  // รีเซ็ตหน้าเมื่อมีการเปลี่ยนตัวกรอง
                  }}
                >
                  {rating === 0 ? 'ทั้งหมด' : `${rating}+`}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className="reset-filter-btn"
            onClick={() => {
              setSelectedCompany('all');
              setMinRating(0);
              setCurrentPage(1);  // รีเซ็ตหน้าเมื่อมีการรีเซ็ตตัวกรอง
            }}
          >
            รีเซ็ตตัวกรอง
          </button>
          <button 
            className="apply-filter-btn"
            onClick={() => setIsFilterModalOpen(false)}
          >
            ใช้ตัวกรอง
          </button>
        </div>
      </Modal>

      {/* โมดัลยืนยันการลบ */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => {
          setIsDeleteModalOpen(false);
          setReviewToDelete(null);
        }}
        className="confirm-modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h2>ยืนยันการลบรีวิว</h2>
          <button 
            className="modal-close"
            onClick={() => {
              setIsDeleteModalOpen(false);
              setReviewToDelete(null);
            }}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-content">
          <div className="warning-message">
            <AlertTriangle size={48} className="warning-icon" />
            <p>คุณแน่ใจหรือไม่ว่าต้องการลบรีวิวนี้? การกระทำนี้ไม่สามารถเรียกคืนได้</p>
          </div>
          
          {reviewToDelete && (
            <div className="review-preview">
              <div className="preview-company">
                <strong>บริษัท:</strong> {reviewToDelete.company_name}
              </div>
              <div className="preview-rating">
                <strong>คะแนน:</strong> {reviewToDelete.review.rating} ดาว
              </div>
              <div className="preview-reviewer">
                <strong>ผู้รีวิว:</strong> {reviewToDelete.review.reviewer_name || 'นักศึกษา'}
              </div>
              {reviewToDelete.review.comment && (
                <div className="preview-comment">
                  <strong>ความคิดเห็น:</strong> {reviewToDelete.review.comment}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button 
            className="cancel-btn"
            onClick={() => {
              setIsDeleteModalOpen(false);
              setReviewToDelete(null);
            }}
          >
            ยกเลิก
          </button>
          <button 
            className="delete-btn"
            onClick={handleDeleteReview}
          >
            ยืนยันการลบ
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminReviews;