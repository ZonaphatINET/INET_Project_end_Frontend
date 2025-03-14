import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import components
import Login from "./components/Login";
import ChangePassword from "./components/ChangePassword";
import StudentProfile from "./components/StudentProfile";
import StaffDashboard from "./components/StaffDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentTable from "./components/StudentTable";
import CompanyList from "./components/CompanyList";
import SkillsManagement from "./components/SkillsManagement";  
import SkillsCompanyManagement from "./components/SkillsCompanyManagement";
import StudentToIndus from "./components/StudentToIndus";
import AdminReviews from "./components/AdminReviews";

// Import global styles
import './styles/theme.css';

const App = () => {
  // Protected Route component
  const ProtectedRoute = ({ children, allowedRoles }) => {
    const role = localStorage.getItem('role');
    const isAuthenticated = !!localStorage.getItem('username');

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
      // Redirect to appropriate dashboard based on role
      if (role === 'student') {
        return <Navigate to="/student-to-indus" replace />;
      } else if (role === 'staff') {
        return <Navigate to="/staff-dashboard" replace />;
      } else if (role === 'teacher') {
        return <Navigate to="/teacher-dashboard" replace />;
      }
    }

    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* Protected routes - Student */}
        <Route 
          path="/student-profile" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/skills-management" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <SkillsManagement />
            </ProtectedRoute>
          } 
        />

        {/* Protected routes - Staff */}
        <Route 
          path="/staff-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <StaffDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/students-table" 
          element={
            <ProtectedRoute allowedRoles={['staff', 'teacher']}>
              <StudentTable />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/CompanyList" 
          element={
            <ProtectedRoute allowedRoles={['staff', 'teacher']}>
              <CompanyList />
            </ProtectedRoute>
          } 
        />

        {/* Protected routes - Teacher */}
        <Route 
          path="/teacher-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/skills-Company-management" 
          element={
            <ProtectedRoute allowedRoles={['staff', 'teacher', 'student']}>
              <SkillsCompanyManagement />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/student-to-indus"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentToIndus />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/Admin-Reviews" 
          element={
            <ProtectedRoute allowedRoles={['staff', 'teacher']}>
              <AdminReviews />
            </ProtectedRoute>
          } 
        />

      </Routes>
    </Router>
  );
};

export default App;