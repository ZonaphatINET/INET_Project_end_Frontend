import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import './Navbar';  // If you need Navbar
import '../styles/Login.css';
import logoImage from '../img/logo IT Blue-01-1.png';
import API_URL from '../config'; 

// Rest of the component remains the same

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset error message

    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password,
      });
  
      // บันทึกข้อมูลทั้ง response.data.profile ลงใน localStorage
      localStorage.setItem("username", username);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("profile", JSON.stringify(response.data.profile));
  
      // ดึง student_id จาก profile และเก็บแยก
      const studentId = response.data.profile?.student_id;
      if (studentId) {
        localStorage.setItem("student_id", studentId);
        console.log('Stored student_id:', studentId);
      } else {
        console.warn('No student_id found in profile');
      }
  
      // เพิ่ม log เพื่อตรวจสอบข้อมูล
      console.log('Full profile data:', response.data.profile);
      
      // Handle login success based on user role
      if (response.data.first_login) {
        navigate("/change-password", { state: { username } });
      } else if (response.data.role === "student") {
        navigate("/student-to-indus");
      } else if (response.data.role === "staff") {
        navigate("/staff-dashboard");
      } else if (response.data.role === "teacher") {
        navigate("/teacher-dashboard");
      }
    } catch (err) {
      // Specific error handling based on response
      if (err.response) {
        if (err.response.status === 401) {
          setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        } else {
          setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        }
      } else {
        setError("เกิดปัญหาการเชื่อมต่อเครือข่าย กรุณาตรวจสอบการเชื่อมต่อ");
      }
    }
  };

  return (
    <div className="login-page">
      <div className="navbar-brand">
        <img src={logoImage} alt="Logo" className="logo-top-left" />
      </div>
      <div className="login-container">
        <div className="login-header">
          {/*<div className="login-logo">
            <Lock size={32} />
          </div>*/}
          <h1 className="login-title">เข้าสู่ระบบ</h1>
          <h4>กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ</h4>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              ชื่อผู้ใช้
            </label>
            <input
              id="username"
              type="text" 
              className="login-input"
              placeholder="กรุณากรอกอีเมล ชื่อผู้ใช้ หรือ รหัสนักศึกษา"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              รหัสผ่าน
            </label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="login-input"
                placeholder="กรุณากรอกรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn-login">
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;