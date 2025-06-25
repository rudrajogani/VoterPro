import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  CheckCircle, 
  User, 
  Lock, 
  Settings, 
  BarChart3,
  Vote
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  const userNavItems = [
    { to: '/dashboard', icon: Users, label: 'View Candidates' },
    { to: '/vote-status', icon: CheckCircle, label: 'My Vote Status' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/change-password', icon: Lock, label: 'Change Password' }
  ];

  const adminNavItems = [
    { to: '/admin', icon: BarChart3, label: 'Dashboard' },
    { to: '/admin/candidates', icon: Users, label: 'Manage Candidates' },
    { to: '/admin/votes', icon: Vote, label: 'Vote Results' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' }
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : userNavItems;

  return (
    <aside className="bg-white border-r border-gray-200 w-64 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-blue-600 rounded-lg p-2">
            <Vote className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">VoteSystem</span>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;