import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, Building, FileSpreadsheet, Briefcase, BookOpen } from 'lucide-react';
import Navbar from "./Navbar";
import '../styles/TeacherDashboard.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();

  {/* const stats = [
    { 
      icon: <Users size={24} />,
      value: "150",
      label: "นักศึกษาทั้งหมด"
    },
    {
      icon: <Building size={24} />,
      value: "45",
      label: "บริษัทที่รับนักศึกษา"
    },
    {
      icon: <Briefcase size={24} />,
      value: "120",
      label: "นักศึกษาที่ได้ฝึกงาน"
    },
    {
      icon: <FileSpreadsheet size={24} />,
      value: "30",
      label: "นักศึกษารอการอนุมัติ"
    }
  ]; */}

  const actions = [
    {
      icon: <Users size={32} />,
      title: "จัดการนักศึกษา",
      description: "ดูและจัดการข้อมูลนักศึกษาทั้งหมด",
      path: "/students-table"
    },
    {
      icon: <Building size={32} />,
      title: "จัดการสถานประกอบการ",
      description: "จัดการข้อมูลสถานประกอบการที่รับนักศึกษาฝึกงาน",
      path: "/CompanyList"
    },
    {
      icon: <BookOpen size={32} />,
      title: "จัดการคุณสมบัติ",
      description: "จัดการข้อมูลคุณสมบัติที่สถานประกอบการต้องการ",
      path: "/skills-Company-management"
    }
  ];

  return (
    <div className="Teacher-dashboard">
      <Navbar />
      <div className="dashboard-welcome">
        <h1 className="welcome-title">ยินดีต้อนรับ, อาจารย์</h1>
        <p className="welcome-subtitle">ระบบจัดการข้อมูลสถานประกอบการ</p>
      </div>

      {/*<div className="dashboard-stats">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">
              {stat.icon}
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>*/}

      <div className="dashboard-actions">
        {actions.map((action, index) => (
          <div 
            key={index} 
            className="action-card"
            onClick={() => navigate(action.path)}
          >
            <div className="action-icon">
              {action.icon}
            </div>
            <h3 className="action-title">{action.title}</h3>
            <p className="action-description">{action.description}</p>
            <button className="btn-action">
              เข้าสู่หน้าจัดการ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherDashboard;