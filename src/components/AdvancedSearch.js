import React, { useState, useEffect } from 'react';
import { 
  ScanSearch, 
  Filter,
  MapPin,
  Tag,
  X,
  ChevronDown,
  ChevronUp 
} from 'lucide-react';
import '../styles/AdvancedSearch.css';

const AdvancedSearch = ({ onSearch }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    district: '',
    province: '',
    region: '',
    position: '',
    skills: []
  });
  const [selectedSkill, setSelectedSkill] = useState('');
  const [availableSkills, setAvailableSkills] = useState([]);
  const [regions, setRegions] = useState([
    'กรุงเทพและปริมณฑล',
    'ภาคกลาง',
    'ภาคเหนือ',
    'ภาคตะวันออกเฉียงเหนือ',
    'ภาคตะวันออก',
    'ภาคตะวันตก',
    'ภาคใต้'
  ]);

  useEffect(() => {
    // ดึงข้อมูลทักษะที่มีอยู่จาก API
    const fetchSkills = async () => {
      try {
        const response = await fetch('http://localhost:5000/available-skills');
        const data = await response.json();
        if (data.skills) {
          setAvailableSkills(data.skills);
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
        // ถ้าไม่สามารถดึงข้อมูลได้ ใช้ทักษะเริ่มต้น
        setAvailableSkills([
          'JavaScript', 'Python', 'React', 'Node.js', 'Java', 
          'MySQL', 'MongoDB', 'Docker', 'AWS', 'Git',
          'UI/UX', 'Mobile Development', 'Data Analysis'
        ]);
      }
    };

    fetchSkills();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value
    });
  };

  const handleAddSkill = () => {
    if (selectedSkill && !searchParams.skills.includes(selectedSkill)) {
      setSearchParams({
        ...searchParams,
        skills: [...searchParams.skills, selectedSkill]
      });
      setSelectedSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSearchParams({
      ...searchParams,
      skills: searchParams.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSearch = () => {
    onSearch(searchParams);
  };

  const handleClearFilters = () => {
    setSearchParams({
      keyword: '',
      district: '',
      province: '',
      region: '',
      position: '',
      skills: []
    });
    onSearch({ keyword: '' }); // ค้นหาใหม่ด้วยค่าเริ่มต้น
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="advanced-search-container">
      <div className="search-main">
        <div className="search-input-wrapper">
          <ScanSearch size={20} className="search-icon" />
          <input
            type="text"
            placeholder="ค้นหาสถานประกอบการ..."
            className="search-input"
            name="keyword"
            value={searchParams.keyword}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
        </div>
        
        <button className="advanced-toggle-btn" onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}>
          <Filter size={18} />
          <span>ค้นหาขั้นสูง</span>
          {isAdvancedOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

        {isAdvancedOpen && (
            <div className="advanced-search-panel">
                <div className="advanced-search-grid">
                    <div className="search-field">
                        <label>ตำบล/แขวง</label>
                        <div className="field-input-wrapper">
                            <MapPin size={16} className="field-icon" />
                            <input
                            type="text"
                            name="district"
                            placeholder="ตำบล/แขวง"
                            value={searchParams.district}
                            onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="search-field">
                        <label>อำเภอ/เขต</label>
                        <div className="field-input-wrapper">
                            <MapPin size={16} className="field-icon" />
                            <input
                            type="text"
                            name="province"
                            placeholder="อำเภอ/เขต"
                            value={searchParams.province}
                            onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/*<div className="search-field">
                        <label>ภูมิภาค</label>
                        <div className="field-input-wrapper">
                            <MapPin size={16} className="field-icon" />
                            <select
                            name="region"
                            value={searchParams.region}
                            onChange={handleInputChange}
                            >
                            <option value="">เลือกภูมิภาค</option>
                            {regions.map((region, index) => (
                                <option key={index} value={region}>
                                {region}
                                </option>
                            ))}
                            </select>
                        </div>
                    </div>*/}

                    <div className="search-field">
                        <label>จังหวัด</label>
                            <div className="field-input-wrapper">
                                <MapPin size={16} className="field-icon" />
                                <input
                                type="text"
                                name="position"
                                placeholder="จังหวัด"
                                value={searchParams.position}
                                onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>

            {/*<div className="skills-section">
                <label>ทักษะที่ต้องการ</label>
                <div className="skills-selector">
                    <select
                        value={selectedSkill}
                        onChange={(e) => setSelectedSkill(e.target.value)}
                    >
                        <option value="">เลือกทักษะ</option>
                        {availableSkills.map((skill, index) => (
                        <option key={index} value={skill}>
                            {skill}
                        </option>
                        ))}
                    </select>
                    <button 
                        className="add-skill-btn"
                        onClick={handleAddSkill}
                        disabled={!selectedSkill}
                    >
                        เพิ่มทักษะ
                    </button>
            </div>

            <div className="selected-skills">
              {searchParams.skills.map((skill, index) => (
                <div key={index} className="skill-chip">
                  <span>{skill}</span>
                  <button 
                    className="remove-skill-btn"
                    onClick={() => handleRemoveSkill(skill)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div> */}

          <div className="search-actions">
            <button className="clear-btn" onClick={handleClearFilters}>
              ล้างตัวกรอง
            </button>
            <button className="search-btn" onClick={handleSearch}>
              <ScanSearch size={18} />
              ค้นหา
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;