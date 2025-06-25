import React from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
import { User, Mail, CreditCard, Shield } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Your account details</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <ProfileRow
            icon={<User className="h-8 w-8 text-blue-600" />}
            label="Full Name"
            value={user?.name}
          />
          <ProfileRow
            icon={<Mail className="h-8 w-8 text-green-600" />}
            label="Email Address"
            value={user?.email}
          />
          <ProfileRow
            icon={<CreditCard className="h-8 w-8 text-purple-600" />}
            label="Aadhaar Number"
            value={user?.aadhaarNumber}
            subtext="This cannot be changed"
          />
          <ProfileRow
            icon={<Shield className="h-8 w-8 text-orange-600" />}
            label="Account Role"
            value={
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user?.role === 'admin'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {user?.role?.toUpperCase()}
              </span>
            }
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {user?.hasVoted ? 'Completed' : 'Pending'}
              </p>
              <p className="text-sm text-gray-600">Voting Status</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">2024</p>
              <p className="text-sm text-gray-600">Election Year</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const ProfileRow = ({ icon, label, value, subtext }) => (
  <div className="flex items-center space-x-4">
    <div className="bg-gray-100 rounded-full p-3">
      {icon}
    </div>
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <p className="text-gray-900">{value}</p>
      {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </div>
  </div>
);

export default Profile;
                                                        