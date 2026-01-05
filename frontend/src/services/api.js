import axios from 'axios';

// ประกาศ Base URL ของ Backend
const API = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

// ✅ ส่วนสำคัญ: ทุกครั้งที่ยิง API ให้แอบใส่ Token ไปด้วย
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // ไปหยิบ Token ในเครื่อง
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // แนบไปในซองจดหมาย
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;