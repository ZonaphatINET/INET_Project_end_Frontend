import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, X, Search, ArrowLeft, Trash2 } from 'lucide-react';
import Navbar from './Navbar';
import '../styles/SkillsCompanyManagement.css';
import API_URL from '../config'; 

const SkillsCompanyManagement = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [skills, setSkills] = useState([]);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [skillSearchTerm, setSkillSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchCompanies();
    fetchSkills();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_URL}/companies`);
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await fetch(`${API_URL}/skills`);
      const data = await response.json();
      setSkills(data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleAddNewSkill = async () => {
    if (!newSkill.trim()) return;

    try {
      const response = await fetch(`${API_URL}/add-skill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skill_name: newSkill.trim() }),
      });

      if (response.ok) {
        const addedSkill = await response.json();
        setSkills([...skills, addedSkill]);
        setSelectedSkills([...selectedSkills, addedSkill]);
        setNewSkill('');
      }
    } catch (error) {
      console.error('Error adding new skill:', error);
    }
  };

  const handleRemoveSkillFromCompany = async (skillName) => {
    if (!selectedCompany) return;

    try {
      const response = await fetch(`${API_URL}/remove-skill-from-company/${selectedCompany.company_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skill_name: skillName }),
      });

      if (response.ok) {
        // อัพเดทข้อมูลสถานประกอบการหลังลบคุณสมบัติ
        const updatedCompanies = companies.map(company => {
          if (company.company_id === selectedCompany.company_id) {
            const updatedQualifications = company.company.qualifications
              .split(', ')
              .filter(skill => skill !== skillName)
              .join(', ');

            return {
              ...company,
              company: {
                ...company.company,
                qualifications: updatedQualifications
              }
            };
          }
          return company;
        });

        setCompanies(updatedCompanies);
        setSelectedCompany(updatedCompanies.find(c => c.company_id === selectedCompany.company_id));
        alert('ลบคุณสมบัติออกจากสถานประกอบการสำเร็จ');
      }
    } catch (error) {
      console.error('Error removing skill from company:', error);
      alert('เกิดข้อผิดพลาดในการลบคุณสมบัติ');
    }
  };

  const handleAddSkillsToCompany = async () => {
    if (!selectedCompany || selectedSkills.length === 0) {
      alert('กรุณาเลือกสถานประกอบการและคุณสมบัติ');
      return;
    }

    const existingSkills = selectedCompany.company.qualifications 
      ? selectedCompany.company.qualifications.split(', ')
      : [];

    const newSkills = selectedSkills.filter(skill => 
      !existingSkills.includes(skill.skill.skill_name)
    );

    const duplicateSkills = selectedSkills.filter(skill => 
      existingSkills.includes(skill.skill.skill_name)
    );

    if (duplicateSkills.length > 0) {
      const duplicateSkillNames = duplicateSkills.map(skill => skill.skill.skill_name).join(', ');
      alert(`ความสามารถต่อไปนี้มีอยู่แล้ว: ${duplicateSkillNames}`);
      
      if (newSkills.length === 0) {
        return;
      }
    }

    try {
      const response = await fetch(`${API_URL}/add-skills-to-company/${selectedCompany.company_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skills: newSkills }),
      });

      if (response.ok) {
        alert('เพิ่มคุณสมบัติให้สถานประกอบการสำเร็จ');
        
        const updatedCompanies = companies.map(company => 
          company.company_id === selectedCompany.company_id 
            ? {
                ...company,
                company: {
                  ...company.company,
                  qualifications: company.company.qualifications 
                    ? `${company.company.qualifications}, ${newSkills.map(s => s.skill.skill_name).join(', ')}`
                    : newSkills.map(s => s.skill.skill_name).join(', ')
                }
              }
            : company
        );

        setCompanies(updatedCompanies);
        setSelectedCompany(updatedCompanies.find(c => c.company_id === selectedCompany.company_id));
        setSelectedSkills([]);
        setCompanySearchTerm('');
        setSkillSearchTerm('');
      }
    } catch (error) {
      console.error('Error adding skills to company:', error);
      alert('เกิดข้อผิดพลาดในการคุณสมบัติ');
    }
  };

  const filteredCompanies = companies.filter(company => 
    company.company.company_name.toLowerCase().includes(companySearchTerm.toLowerCase())
  );

  const filteredSkills = skills.filter(skill => 
    skill.skill.skill_name.toLowerCase().includes(skillSearchTerm.toLowerCase()) &&
    !selectedSkills.some(selectedSkill => selectedSkill.skill_id === skill.skill_id)
  );

  return (
    <div className="skills-company-page">
      <Navbar />
      <div className="skills-company-container">
        <div className="page-header">
          <button 
            onClick={() => navigate('/CompanyList')}
            className="back-button"
          >
            <ArrowLeft />
          </button>
          <h1 className="page-title">จัดการคุณสมบัติ</h1>
        </div>

        <div className="search-section">
          <h2 className="section-title">เลือกสถานประกอบการ</h2>
          <div className="search-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="ค้นหาสถานประกอบการ..."
              className="search-input"
              value={companySearchTerm}
              onChange={(e) => setCompanySearchTerm(e.target.value)}
            />
          </div>

          <div className="company-grid">
            {filteredCompanies.map(company => (
              <div 
                key={company.company_id} 
                className={`company-card ${selectedCompany?.company_id === company.company_id ? 'selected' : ''}`}
                onClick={() => setSelectedCompany(company)}
              >
                <h3>{company.company.company_name}</h3>
                <p>{company.company.address}</p>
              </div>
            ))}
          </div>
        </div>

        {selectedCompany && (
          <div className="skills-section">
            <h2 className="section-title">เพิ่มคุณสมบัตืที่ต้องการให้สถานประกอบการ {selectedCompany.company.company_name}</h2>
            
            <div className="existing-skills-section">
              <h3>ความสามารถที่มีอยู่แล้ว:</h3>
              <div className="existing-skills-grid">
                {selectedCompany.company.qualifications ? 
                  selectedCompany.company.qualifications.split(', ').map((skill, index) => (
                    <div key={index} className="existing-skill-tag">
                      {skill}
                      <button 
                        className="remove-skill-btn"
                        onClick={() => handleRemoveSkillFromCompany(skill)}
                        title="ลบความสามารถ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )) : 
                  <p>ยังไม่มีความสามารถ</p>
                }
              </div>
            </div>
            
            <div className="search-wrapper">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="ค้นหาคุณสมบัติ..."
                className="search-input"
                value={skillSearchTerm}
                onChange={(e) => setSkillSearchTerm(e.target.value)}
              />
            </div>

            <div className="skills-grid">
              {filteredSkills.map(skill => (
                <button
                  key={skill.skill_id}
                  onClick={() => {
                    setSelectedSkills([...selectedSkills, skill]);
                    setSkillSearchTerm('');
                  }}
                  className="skill-button"
                >
                  {skill.skill.skill_name}
                </button>
              ))}
            </div>

            <div className="new-skill-section">
              <input
                type="text"
                placeholder="เพิ่มคุณสมบัติใหม่..."
                className="new-skill-input"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
              />
              <button 
                className="btn-add-skill"
                onClick={handleAddNewSkill}
              >
                <PlusCircle size={16} />
                เพิ่มคุณสมบัติ
              </button>
            </div>

            <div className="selected-skills-section">
              <h3>ความสามารถที่เลือก:</h3>
              <div className="selected-skills-grid">
                {selectedSkills.map(skill => (
                  <div key={skill.skill_id} className="selected-skill-tag">
                    {skill.skill.skill_name}
                    <button 
                      className="remove-skill-btn"
                      onClick={() => setSelectedSkills(
                        selectedSkills.filter(s => s.skill_id !== skill.skill_id)
                      )}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button 
              className="btn-save-skills"
              onClick={handleAddSkillsToCompany}
            >
              บันทึก
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsCompanyManagement;