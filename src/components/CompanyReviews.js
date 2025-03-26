import React, { useState, useEffect } from 'react';
import { Star, StarHalf, X, Edit, Trash, MessageCircle } from 'lucide-react';
import Modal from 'react-modal';
import '../styles/CompanyReviews.css';
import API_URL from '../config'; 

const CompanyReviews = ({ companyId, companyName }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isViewReviewsModalOpen, setIsViewReviewsModalOpen] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [userReview, setUserReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');

  // ดึงข้อมูลรีวิวเมื่อ component โหลด
  useEffect(() => {
    fetchReviews();
    
    // ดึงข้อมูลนักศึกษาจาก localStorage
    const profileStr = localStorage.getItem('profile');
    if (profileStr) {
      const profile = JSON.parse(profileStr);
      setStudentId(profile.student_id);
      setStudentName(profile.name || 'นักศึกษา');
    }
  }, [companyId]);

  // ดึงข้อมูลรีวิวจาก API
  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_URL}/company-reviews/${companyId}`);
      const data = await response.json();
      
      setReviews(data.reviews);
      setAverageRating(data.average_rating);
      setTotalReviews(data.total_reviews);
      
      // ตรวจสอบว่านักศึกษาเคยรีวิวแล้วหรือไม่
      const profileStr = localStorage.getItem('profile');
      if (profileStr) {
        const profile = JSON.parse(profileStr);
        const studentReview = data.reviews.find(
          review => review.review.student_id === profile.student_id
        );
        
        if (studentReview) {
          setUserReview(studentReview);
          setCurrentRating(studentReview.review.rating);
          setReviewComment(studentReview.review.comment || '');
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  // ส่งรีวิวใหม่หรืออัปเดตรีวิวเดิม
  const handleSubmitReview = async () => {
    if (!studentId) {
      alert('กรุณาเข้าสู่ระบบก่อนให้รีวิว');
      return;
    }
    
    if (currentRating === 0) {
      alert('กรุณาให้คะแนนดาว');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/add-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: studentId,
          company_id: companyId,
          rating: currentRating,
          comment: reviewComment,
          reviewer_name: studentName
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(isEditing ? 'อัปเดตรีวิวเรียบร้อยแล้ว' : 'เพิ่มรีวิวเรียบร้อยแล้ว');
        setIsReviewModalOpen(false);
        setIsEditing(false);
        fetchReviews();
      } else {
        alert(`เกิดข้อผิดพลาด: ${data.error || data.message}`);
      }
    } catch (error) {
      alert(`เกิดข้อผิดพลาดในการส่งรีวิว: ${error.message}`);
    }
  };

  // ลบรีวิว
  const handleDeleteReview = async () => {
    if (!userReview) return;
    
    if (!window.confirm('คุณต้องการลบรีวิวนี้ใช่หรือไม่?')) {
        return;
      }

    try {
      const response = await fetch(`${API_URL}/delete-review/${userReview.review_id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('ลบรีวิวเรียบร้อยแล้ว');
        setUserReview(null);
        setCurrentRating(0);
        setReviewComment('');
        fetchReviews();
      } else {
        const data = await response.json();
        alert(`เกิดข้อผิดพลาด: ${data.error || data.message}`);
      }
    } catch (error) {
      alert(`เกิดข้อผิดพลาดในการลบรีวิว: ${error.message}`);
    }
  };

  // เปิดโมดัลแก้ไขรีวิว
  const openEditReviewModal = () => {
    if (userReview) {
      setCurrentRating(userReview.review.rating);
      setReviewComment(userReview.review.comment || '');
      setIsEditing(true);
      setIsReviewModalOpen(true);
    }
  };

  // เปิดโมดัลให้รีวิวใหม่
  const openNewReviewModal = () => {
    setCurrentRating(0);
    setReviewComment('');
    setIsEditing(false);
    setIsReviewModalOpen(true);
  };

  // แสดงดาวตามคะแนน
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="star filled" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="star half-filled" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="star empty" />);
    }

    return stars;
  };

  // แสดงดาวที่สามารถกดได้
  const renderSelectableStars = () => {
    return [1, 2, 3, 4, 5].map(star => (
      <Star
        key={`selectable-${star}`}
        className={`star selectable ${star <= (hoverRating || currentRating) ? 'filled' : 'empty'}`}
        onClick={() => setCurrentRating(star)}
        onMouseEnter={() => setHoverRating(star)}
        onMouseLeave={() => setHoverRating(0)}
      />
    ));
  };

  return (
    <div className="company-reviews">
      <div className="reviews-summary">
        <div className="rating-display">
          <div className="average-rating">
            <span className="rating-number">{averageRating.toFixed(1)}</span>
            <div className="stars-display">
              {renderStars(averageRating)}
            </div>
          </div>
          <div className="total-reviews">
            ({totalReviews} รีวิว)
          </div>
        </div>

        <div className="review-actions">
          {userReview ? (
            <div className="user-review-actions">
              <button className="btn-edit-review" onClick={openEditReviewModal}>
                <Edit size={18} />
                แก้ไขรีวิวของคุณ
              </button>
              <button className="btn-delete-review" onClick={handleDeleteReview}>
                <Trash size={18} />
                ลบรีวิว
              </button>
            </div>
          ) : (
            <button className="btn-add-review" onClick={openNewReviewModal}>
              <Star size={18} />
              ให้คะแนนและรีวิว
            </button>
          )}
          
          {totalReviews > 0 && (
            <button 
              className="btn-view-reviews"
              onClick={() => setIsViewReviewsModalOpen(true)}
            >
              <MessageCircle size={18} />
              ดูรีวิวทั้งหมด
            </button>
          )}
        </div>
      </div>

      {/* โมดัลให้รีวิว */}
      <Modal
        isOpen={isReviewModalOpen}
        onRequestClose={() => setIsReviewModalOpen(false)}
        className="review-modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h2>{isEditing ? 'แก้ไขรีวิว' : 'ให้คะแนนและรีวิว'}</h2>
          <button 
            className="modal-close"
            onClick={() => setIsReviewModalOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          <div className="company-info">
            <h3>{companyName}</h3>
          </div>

          <div className="rating-selection">
            <p>ให้คะแนน:</p>
            <div className="stars-selection">
              {renderSelectableStars()}
            </div>
            <span className="rating-label">
              {currentRating > 0 ? `${currentRating} ดาว` : 'เลือกคะแนน'}
            </span>
          </div>

          <div className="review-comment">
            <label htmlFor="review-comment">ความคิดเห็น (ไม่บังคับ):</label>
            <textarea
              id="review-comment"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="แชร์ประสบการณ์การฝึกงานของคุณ..."
              rows={5}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn-secondary"
            onClick={() => setIsReviewModalOpen(false)}
          >
            ยกเลิก
          </button>
          <button 
            className="btn-primary"
            onClick={handleSubmitReview}
            disabled={currentRating === 0}
          >
            {isEditing ? 'อัปเดตรีวิว' : 'ส่งรีวิว'}
          </button>
        </div>
      </Modal>

      {/* โมดัลแสดงรีวิวทั้งหมด */}
      <Modal
        isOpen={isViewReviewsModalOpen}
        onRequestClose={() => setIsViewReviewsModalOpen(false)}
        className="reviews-list-modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h2>รีวิวทั้งหมด - {companyName}</h2>
          <button 
            className="modal-close"
            onClick={() => setIsViewReviewsModalOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          <div className="reviews-summary-header">
            <div className="rating-summary">
              <span className="big-rating">{averageRating.toFixed(1)}</span>
              <div className="stars-display large">
                {renderStars(averageRating)}
              </div>
              <span className="review-count">จาก {totalReviews} รีวิว</span>
            </div>
          </div>

          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.review_id} className="review-item">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <span className="reviewer-name">
                        {review.review.reviewer_name || 'นักศึกษา'}
                        {review.review.student_id === studentId && ' (คุณ)'}
                      </span>
                      <span className="review-date">
                        {new Date(review.review.created_at).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="review-rating">
                      {renderStars(review.review.rating)}
                      <span className="rating-value">{review.review.rating}</span>
                    </div>
                  </div>
                  
                  {review.review.comment && (
                    <div className="review-comment-text">
                      {review.review.comment}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-reviews">ยังไม่มีรีวิว</div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn-secondary"
            onClick={() => setIsViewReviewsModalOpen(false)}
          >
            ปิด
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CompanyReviews;