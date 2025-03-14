import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Users, Building, Home, BookCheck, Building2, BookOpen, Notebook} from 'lucide-react';
import '../styles/Navbar.css';
import logoImage from '../img/logo IT Blue-01-1.png';

const Navbar = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <img 
            src={logoImage} 
            alt="Logo" 
            className="navbar-logo"
          />
          <span className="navbar-title">ระบบจัดการข้อมูลสถานประกอบการ</span>
        </div>

        <div className="navbar-menu">
          {role === 'student' && (
            <>
              <button 
                onClick={() => navigate('/student-to-indus')}
                className="navbar-link"
              >
                <Building2 size={20} />
                <span>สถานประกอบการ</span>
              </button>

              <button 
                onClick={() => navigate('/student-profile')}
                className="navbar-link"
              >
                <User size={20} />
                <span>โปรไฟล์</span>
              </button>
              

              {/* <button 
                onClick={() => navigate('/skills-management')}
                className="navbar-link"
              >
                <BookOpen size={20} />
                <span>จัดการความสามารถ</span>
              </button> */}
            </>
          )}

          {role === 'staff' && (
            <>
              <button 
                onClick={() => navigate('/Staff-Dashboard')}
                className="navbar-link"
              >
                <Home size={20} />
                <span>หน้าหลัก</span>
              </button>

              <button 
                onClick={() => navigate('/students-table')}
                className="navbar-link"
              >
                <Users size={20} />
                <span>รายชื่อนักศึกษา</span>
              </button>

              <button 
                onClick={() => navigate('/CompanyList')}
                className="navbar-link"
              >
                <Building size={20} />
                <span>รายชื่อสถานประกอบการ</span>
              </button>

              <button 
                onClick={() => navigate('/Admin-reviews')}
                className="navbar-link"
              >
                <Notebook size={20} />
                <span>ดูรีวิว</span>
              </button>

              {/* <button 
                onClick={() => navigate('/skills-Company-management')}
                className="navbar-link"
              >
                <BookOpen size={20} />
                <span>จัดการคุณสมบัติ</span>
              </button> */}
            </>
          )}

          {role === 'teacher' &&(
            <>
              <button 
                onClick={() => navigate('/Teacher-Dashboard')}
                className="navbar-link"
              >
                <Home size={20} />
                <span>หน้าหลัก</span>
              </button>
              <button 
                onClick={() => navigate('/students-table')}
                className="navbar-link"
              >
                <Users size={20} />
                <span>รายชื่อนักศึกษา</span>
              </button>
              <button 
                onClick={() => navigate('/CompanyList')}
                className="navbar-link"
              >
                <Building size={20} />
                <span>รายชื่อสถานประกอบการ</span>
              </button>

              <button 
                onClick={() => navigate('/Admin-reviews')}
                className="navbar-link"
              >
                <Notebook size={20} />
                <span>ดูรีวิว</span>
              </button>

              {/* <button 
                onClick={() => navigate('/skills-Company-management')}
                className="navbar-link"
              >
                <BookOpen size={20} />
                <span>จัดการคุณสมบัติ</span>
              </button> */}
            </>
          )}

          <button 
            onClick={handleLogout}
            className="navbar-link text-error"
          >
            <LogOut size={20} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;