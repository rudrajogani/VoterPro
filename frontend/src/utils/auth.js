

// Mock users data
const mockUsers = [
  {
    id: '1',
    aadharCardNumber: '123456789012',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    hasVoted: true,
    votedFor: '1'
  },
  {
    id: '2',
    aadharCardNumber: '987654321098',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    hasVoted: false
  }
];

export const authenticateUser = async (aadharCardNumber, password ) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock authentication logic
  const user = mockUsers.find(u => u.aadharCardNumber === aadharCardNumber);
  
  // For demo purposes, accept any password
  if (user) {
    return user;
  }
  
  return null;
};

export const registerUser = async (userData) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if user already exists
  const existingUser = mockUsers.find(u => u.aadharCardNumber === userData.aadharCardNumber);
  if (existingUser) {
    throw new Error('User with this Aadhaar number already exists');
  }
  
  // Create new user
  const newUser = {
    id: (mockUsers.length + 1).toString(),
    aadharCardNumber: userData.aadharCardNumber,
    name: userData.name,
    email: userData.email,
    role: 'user',
    hasVoted: false
  };
  
  mockUsers.push(newUser);
  return newUser;
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
};

export const isValidAadhaar = (aadhaar)=> {
  return /^\d{12}$/.test(aadhaar);
};


export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');
