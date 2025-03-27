import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import logoImage from '../img/logo IT Blue-01-1.png';
import '../styles/ResetPassword.css';
import API_URL from '../config';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [validating, setValidating] = useState(true);
  
  const { token } = useParams();
  const navigate = useNavigate();

  // ตรวจสอบความถูกต้องของโทเค็น
  useEffect(() => {
    const validateToken = async () => {
      try {
        await axios.get(`${API_URL}/validate-reset-token/${token}`);
        setTokenValid(true);
        setValidating(false);
      } catch (err) {
        setTokenValid(false);
        setValidating(false);
      }
    };
    
    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // ตรวจสอบรหัสผ่านตรงกัน
    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }
    
    // ตรวจสอบความเข้มแข็งของรหัสผ่าน
    if (password.length < 8) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }
    
    setIsSubmitting(true);

    try {
      // ส่งคำขอเปลี่ยนรหัสผ่านไปยัง API
      await axios.post(`${API_URL}/reset-password`, {
        token,
        new_password: password
      });

      setSuccess(true);
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      if (err.response) {
        if (err.response.status === 400) {
          setError('โทเค็นไม่ถูกต้องหรือหมดอายุ');
        } else {
          setError('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน โปรดลองอีกครั้ง');
        }
      } else {
        setError('เกิดปัญหาการเชื่อมต่อเครือข่าย กรุณาตรวจสอบการเชื่อมต่อของคุณ');
      }
    }
  };

  // แสดงหน้า loading
  if (validating) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="validating-token">
            <div className="loading-spinner"></div>
            <p>กำลังตรวจสอบข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  // แสดงหน้าโทเค็นไม่ถูกต้อง
  if (!tokenValid) {
    return (
      <div className="reset-password-page">
        <div className="navbar-brand">
          <img src={logoImage} alt="Logo" className="logo-top-left" />
        </div>
        <div className="reset-password-container">
          <div className="invalid-token">
            <AlertCircle size={48} className="error-icon" />
            <h2>ลิงก์ไม่ถูกต้องหรือหมดอายุ</h2>
            <p>ลิงก์สำหรับรีเซ็ตรหัสผ่านนี้ไม่ถูกต้องหรือหมดอายุแล้ว</p>
            <p>กรุณาขอลิงก์ใหม่จากหน้าลืมรหัสผ่าน</p>
            <Link to="/forgot-password" className="btn-request-new-link">
              ขอลิงก์รีเซ็ตรหัสผ่านใหม่
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="navbar-brand">
        <img src={logoImage} alt="Logo" className="logo-top-left" />
      </div>
      <div className="reset-password-container">
        <div className="reset-password-header">
          <Link to="/" className="back-link">
            <ArrowLeft size={20} />
            <span>กลับไปหน้าเข้าสู่ระบบ</span>
          </Link>
          <h1 className="reset-password-title">ตั้งรหัสผ่านใหม่</h1>
          <p className="reset-password-subtitle">
            กรุณากำหนดรหัสผ่านใหม่ของคุณ
          </p>
        </div>

        {success ? (
          <div className="success-message">
            <CheckCircle size={48} />
            <h2>เปลี่ยนรหัสผ่านเรียบร้อยแล้ว</h2>
            <p>รหัสผ่านของคุณได้รับการเปลี่ยนเรียบร้อยแล้ว</p>
            <p>คุณสามารถใช้รหัสผ่านใหม่เพื่อเข้าสู่ระบบได้ทันที</p>
            <button
              className="btn-return-login"
              onClick={() => navigate('/')}
            >
              ไปยังหน้าเข้าสู่ระบบ
            </button>
          </div>
        ) : (
          <form className="reset-password-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="new-password" className="form-label">
                รหัสผ่านใหม่
              </label>
              <div className="password-input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  className="reset-password-input"
                  placeholder="กรอกรหัสผ่านใหม่"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="password-hint">รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร</p>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password" className="form-label">
                ยืนยันรหัสผ่านใหม่
              </label>
              <div className="password-input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  className="reset-password-input"
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
              className="btn-reset-password"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'กำลังดำเนินการ...' : 'เปลี่ยนรหัสผ่าน'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;