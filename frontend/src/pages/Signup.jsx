import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Vote, AlertCircle } from 'lucide-react';
import { isValidAadhaar, setCurrentUser } from '../utils/auth';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axiosInstance';

const Signup = () => {
  const [formData, setFormData] = useState({
    aadharCardNumber: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    age: '',
    role: 'voter'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'aadharCardNumber' 
        ? value.replace(/\D/g, '').slice(0, 12) 
        : name === 'age' 
        ? value.replace(/\D/g, '') // Only allow numbers for age
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isLoading || submitAttempted) {
      return;
    }
    
    setError('');
    setSubmitAttempted(true);

    // Validation
    if (!isValidAadhaar(formData.aadharCardNumber)) {
      setSubmitAttempted(false);
      return setError('Please enter a valid 12-digit Aadhar number');
    }
    if (!formData.name.trim()) {
      setSubmitAttempted(false);
      return setError('Name is required');
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setSubmitAttempted(false);
      return setError('Enter a valid email');
    }
    if (!formData.address.trim()) {
      setSubmitAttempted(false);
      return setError('Address is required');
    }
    if (!formData.age || parseInt(formData.age) < 18 || parseInt(formData.age) > 120) {
      setSubmitAttempted(false);
      return setError('Please enter a valid age (18-120)');
    }
    if (formData.password.length < 6) {
      setSubmitAttempted(false);
      return setError('Password must be at least 6 characters');
    }
    if (formData.password !== formData.confirmPassword) {
      setSubmitAttempted(false);
      return setError('Passwords do not match');
    }

    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/users/signup', {
        aadharCardNumber: formData.aadharCardNumber,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        address: formData.address,
        age: parseInt(formData.age),
        role: formData.role
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Backend response:', res.data); // Debug log

      // Handle different possible response structures
      const user = res.data.response || res.data.user || res.data;
      const token = res.data.token;

      if (!token) {
        throw new Error('No token received from server');
      }

      localStorage.setItem('token', token);
      setCurrentUser(user);
      setUser(user);
      navigate('/dashboard');
    } catch (err) {
      console.error("Frontend error:", err.response?.data);
      console.error("Full error:", err); // Additional debug info
      
      // Check if it's a duplicate Aadhar error
      if (err.response?.data?.error?.includes('already exists') || 
          err.response?.data?.message?.includes('already exists')) {
        setError('An account with this Aadhar number already exists. Please use a different Aadhar number or try logging in.');
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || 'Signup failed. Please try again.');
      }

      setSubmitAttempted(false); // Reset on error so user can retry
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-blue-600 rounded-full p-3">
              <Vote className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white py-8 px-6 shadow-md rounded-lg space-y-6">
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="aadharCardNumber" className="block text-sm font-medium text-gray-700">
                Aadhar Number
              </label>
              <input
                id="aadharCardNumber"
                name="aadharCardNumber"
                type="text"
                required
                value={formData.aadharCardNumber}
                onChange={handleChange}
                placeholder="Enter 12-digit Aadhar number"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your complete address"
                rows="3"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                id="age"
                name="age"
                type="text"
                required
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter your age"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
    Role
  </label>
  <select
    id="role"
    name="role"
    required
    value={formData.role}
    onChange={handleChange}
    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
  >
    <option value="voter">voter</option>
    <option value="admin">admin</option>
  </select>
</div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || submitAttempted}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;