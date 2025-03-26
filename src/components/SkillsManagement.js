import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, X, ArrowLeft } from 'lucide-react';
import Navbar from './Navbar';
import '../styles/SkillsManagement.css';
import API_URL from '../config'; 

const SkillsManagement = () => {
  const [availableSkills, setAvailableSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  useEffect(() => {
    // โหลดข้อมูลทักษะที่มีทั้งหมด
    const fetchSkills = async () => {
      try {
        const response = await fetch(`${API_URL}/skills`);
        const data = await response.json();
        setAvailableSkills(data);
      } catch (error) {
        console.error('Error fetching skills:', error);
      }
    };

    // โหลดข้อมูลทักษะของผู้ใช้
    const fetchUserSkills = async () => {
      try {
        const response = await fetch(`${API_URL}/student-profile?username=${username}`);
        const data = await response.json();
        setUserSkills(data.profile.skills || []);
      } catch (error) {
        console.error('Error fetching user skills:', error);
      }
    };

    fetchSkills();
    fetchUserSkills();
  }, [username]);

  // กรองทักษะตามคำค้นหา
  const filteredSkills = availableSkills.filter(skill => 
    skill.skill.skill_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // เพิ่มทักษะใหม่
  const handleAddNewSkill = async () => {
    if (!newSkill.trim()) return;
    
    try {
      const response = await fetch(`${API_URL}/add-skill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skill_name: newSkill.trim()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableSkills([...availableSkills, data]);
        setNewSkill('');
      }
    } catch (error) {
      console.error('Error adding new skill:', error);
    }
  };

  // เลือกทักษะ
  const handleSelectSkill = async (skillName) => {
    if (userSkills.includes(skillName)) return;

    try {
      const response = await fetch(`${API_URL}/update-user-skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          skills: [...userSkills, skillName]
        }),
      });

      if (response.ok) {
        setUserSkills([...userSkills, skillName]);
      }
    } catch (error) {
      console.error('Error updating user skills:', error);
    }
  };

  // ลบทักษะ
  const handleRemoveSkill = async (skillToRemove) => {
    try {
      const response = await fetch(`${API_URL}/update-user-skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          skills: userSkills.filter(skill => skill !== skillToRemove)
        }),
      });

      if (response.ok) {
        setUserSkills(userSkills.filter(skill => skill !== skillToRemove));
      }
    } catch (error) {
      console.error('Error removing skill:', error);
    }
  };

  return (
    <div className="skills-management-page">
        <Navbar />
        <div className="skills-management-container">
            {/* Header */}
            <div className="skills-header">
            <button 
                onClick={() => navigate('/student-profile')}
                className="back-button"
                >
                <ArrowLeft />
            </button>
            <h1 className="page-title">จัดการความสามารถ</h1>
            </div>

            {/* ทักษะของผู้ใช้ */}
            <div className="user-skills-section">
            <h2 className="section-title">ความสามารถของคุณ</h2>
            <div className="user-skills-grid">
                {userSkills.map((skill, index) => (
                <div 
                    key={index}
                    className="skill-tag"
                >
                    <span>{skill}</span>
                    <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="skill-remove-btn"
                    >
                    <X />
                    </button>
                </div>
                ))}
            </div>
            </div>

            {/* ค้นหาและเพิ่มทักษะ */}
            <div className="add-skill-form">
            <h2 className="section-title">เพิ่มความสามารถ</h2>
            <div className="add-skill-section">
                <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="เพิ่มความสามารถใหม่..."
                className="add-skill-input"
                />
                <button
                onClick={handleAddNewSkill}
                className="btn-add-skill"
                >
                <PlusCircle />
                เพิ่ม
                </button>
            </div>
            </div>

            {/* รายการทักษะที่มี */}
            <div>
            <h2 className="section-title">ความสามารถที่มีในระบบ</h2>
            
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ค้นหาความสามารถ..."
                    className="search-input"
                />
            
                <div className="available-skills-grid">
                    {filteredSkills.map((skill) => (
                    <button
                        key={skill.skill_id}
                        onClick={() => handleSelectSkill(skill.skill.skill_name)}
                        disabled={userSkills.includes(skill.skill.skill_name)}
                        className={`skill-button ${
                        userSkills.includes(skill.skill.skill_name) ? 'disabled' : ''
                        }`}
                    >
                        {skill.skill.skill_name}
                    </button>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default SkillsManagement;