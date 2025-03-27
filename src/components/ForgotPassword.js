import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import logoImage from '../img/logo IT Blue-01-1.png';
import '../styles/ForgotPassword.css';
import API_URL from '../config';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // ส่งคำขอรีเซ็ตรหัสผ่านไปยัง API
      const response = await axios.post(`${API_URL}/request-password-reset`, {
        email: email
      });

      setSuccess(true);
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      if (err.response) {
        if (err.response.status === 404) {
          setError('ไม่พบอีเมลนี้ในระบบ');
        } else {
          setError('เกิดข้อผิดพลาดในการส่งอีเมลรีเซ็ตรหัสผ่าน โปรดลองอีกครั้งในภายหลัง');
        }
      } else {
        setError('เกิดปัญหาการเชื่อมต่อเครือข่าย กรุณาตรวจสอบการเชื่อมต่อของคุณ');
      }
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="navbar-brand">
        <img src={logoImage} alt="Logo" className="logo-top-left" />
      </div>
      <div className="forgot-password-container">
        <div className="forgot-password-header">
          <Link to="/" className="back-link">
            <ArrowLeft size={20} />
            <span>กลับไปหน้าเข้าสู่ระบบ</span>
          </Link>
          <h1 className="forgot-password-title">ลืมรหัสผ่าน</h1>
          <p className="forgot-password-subtitle">
            กรุณากรอกอีเมลที่ใช้ลงทะเบียน เพื่อรับลิงก์สำหรับเปลี่ยนรหัสผ่านใหม่
          </p>
        </div>

        {success ? (
          <div className="success-message">
            <CheckCircle size={48} />
            <h2>ส่งอีเมลเรียบร้อยแล้ว</h2>
            <p>
              ระบบได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมล {email} แล้ว
              กรุณาตรวจสอบกล่องจดหมายของคุณ
            </p>
            <p className="small-text">
              หากไม่พบอีเมล โปรดตรวจสอบโฟลเดอร์ขยะหรือสแปม
            </p>
            <button
              className="btn-return-login"
              onClick={() => navigate('/')}
            >
              กลับไปหน้าเข้าสู่ระบบ
            </button>
          </div>
        ) : (
          <form className="forgot-password-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                อีเมล
              </label>
              <div className="email-input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  className="forgot-password-input"
                  placeholder="กรุณากรอกอีเมลของคุณ"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="error-message">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-request-reset"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;