import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import '../styles/ChangePassword.css';
import logoImage from '../img/logo IT Blue-01-1.png';

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username;

  // รายการเงื่อนไขรหัสผ่าน
  const passwordRequirements = [
    { label: "อย่างน้อย 8 ตัวอักษร", test: pwd => pwd.length >= 8 },
    { label: "มีตัวอักษรพิมพ์ใหญ่", test: pwd => /[A-Z]/.test(pwd) },
    { label: "มีตัวอักษรพิมพ์เล็ก", test: pwd => /[a-z]/.test(pwd) },
    { label: "มีตัวเลข", test: pwd => /\d/.test(pwd) }
  ];

  const checkPasswordStrength = () => {
    return passwordRequirements.reduce((count, req) => {
      return count + (req.test(newPassword) ? 1 : 0);
    }, 0);
  };

  const getStrengthClass = () => {
    const strength = checkPasswordStrength();
    if (strength <= 1) return "strength-weak";
    if (strength <= 3) return "strength-medium";
    return "strength-strong";
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post("http://localhost:5000/change-password", {
        username,
        new_password: newPassword
      });

      alert("เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบอีกครั้ง");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <div className="navbar-brand">
        <img src={logoImage} alt="Logo" className="logo-top-left" />
      </div>
      <div className="change-password-container">
        <div className="form-header">
          <h1 className="header-title">เปลี่ยนรหัสผ่าน</h1>
          <p className="header-subtitle">กรุณากำหนดรหัสผ่านใหม่</p>
        </div>

        <div className="form-content">
          <form onSubmit={handleChangePassword}>

            <div className="form-group">
            <label htmlFor="newPassword" className="form-label">
              รหัสผ่านใหม่
            </label>
              <div className="password-input-wrapper">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  className="password-input"
                  placeholder="กรุณากรอกรหัสผ่านใหม่"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="strength-indicator">
                <div className={`strength-indicator-bar ${getStrengthClass()}`} />
              </div>
              <div className="password-requirements">
                {passwordRequirements.map((req, index) => (
                  <div 
                    key={index} 
                    className={`requirement-item ${req.test(newPassword) ? 'requirement-met' : ''}`}
                  >
                    {req.test(newPassword) ? 
                      <Check size={16} /> : 
                      <AlertCircle size={16} />
                    }
                    <span>{req.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              ยืนยันรหัสผ่านใหม่
            </label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="password-input"
                  placeholder="ยืนยันรหัสผ่านใหม่"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
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
              className="btn-change-password"
              disabled={isLoading}
            >
              {isLoading ? "กำลังดำเนินการ..." : "เปลี่ยนรหัสผ่าน"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;