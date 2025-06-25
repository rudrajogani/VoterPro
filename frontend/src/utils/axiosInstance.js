// src/utils/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api', // Update if your backend is on a different port/path
  withCredentials: true,
});

export default axiosInstance;
