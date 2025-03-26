// src/config.js
const API_URL = process.env.NODE_ENV === 'production' 
              ? process.env.REACT_APP_API_URL || 'https://185.84.161.66:5000'
              : 'http://localhost:5000';

export default API_URL; 