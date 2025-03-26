// src/config.js
const API_URL = process.env.NODE_ENV === 'production' 
              ? process.env.REACT_APP_API_URL || 'http://naphat_backend.com'
              : 'http://localhost:5000';

export default API_URL;