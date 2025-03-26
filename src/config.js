// src/config.js
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://185.84.161.178'
  : 'http://localhost:5000';

export default API_URL;