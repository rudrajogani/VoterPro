import React, { useState } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const { currentPassword, newPassword, confirmPassword } = formData;

    if (!currentPassword) {
      return setMessage({ type: 'error', text: 'Current password is required' });
    }

    if (newPassword.length < 6) {
      return setMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
    }

    if (newPassword !== confirmPassword) {
      return setMessage({ type: 'error', text: 'Passwords do not match' });
    }

    if (currentPassword === newPassword) {
      return setMessage({ type: 'error', text: 'New password must be different from current password' });
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');

      const response = await axios.put(
        `http://localhost:5000/api/users/profile/password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: 'success', text: response.data.message || 'Password changed successfully!' });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const errMsg =
        error.response?.data?.message || 'Failed to change password. Please try again.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
        <p className="text-gray-600">Update your account password</p>

        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Password Settings</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {message && (
              <div className={`flex items-center space-x-2 p-3 rounded-md ${
                message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            {/* Current Password */}
            <PasswordInput
              id="currentPassword"
              label="Current Password"
              value={formData.currentPassword}
              onChange={handleChange}
              show={showPasswords.current}
              toggle={() => togglePasswordVisibility('current')}
              name="currentPassword"
            />

            {/* New Password */}
            <PasswordInput
              id="newPassword"
              label="New Password"
              value={formData.newPassword}
              onChange={handleChange}
              show={showPasswords.new}
              toggle={() => togglePasswordVisibility('new')}
              name="newPassword"
            />
            <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>

            {/* Confirm Password */}
            <PasswordInput
              id="confirmPassword"
              label="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              show={showPasswords.confirm}
              toggle={() => togglePasswordVisibility('confirm')}
              name="confirmPassword"
            />

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

const PasswordInput = ({ id, label, value, onChange, show, toggle, name }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
      <button type="button" onClick={toggle} className="absolute inset-y-0 right-0 pr-3 flex items-center">
        {show ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
      </button>
    </div>
  </div>
);

export default ChangePassword;
