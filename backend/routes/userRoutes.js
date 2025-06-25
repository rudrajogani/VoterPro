const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { jwtAuthMiddleware, generateToken } = require('../jwt');
const Candidate = require('../models/candidate'); // make sure this is at the top

// @route   POST /api/users/signup
router.post('/signup', async (req, res) => {
  try {
    const { aadharCardNumber, role, ...rest } = req.body;

    // Log incoming data for debugging
    console.log('Signup request:', req.body);

    // Ensure Aadhar is valid
    if (!/^\d{12}$/.test(aadharCardNumber)) {
      return res.status(400).json({ error: 'Aadhar Card Number must be exactly 12 digits' });
    }

    // Prevent multiple admins
    if (role === 'admin' && await User.findOne({ role: 'admin' })) {
      return res.status(400).json({ error: 'Admin user already exists' });
    }

    // Check for duplicate user
    if (await User.findOne({ aadharCardNumber })) {
      return res.status(400).json({ error: 'User with the same Aadhar Card Number already exists' });
    }

    const newUser = new User({ aadharCardNumber, role, ...rest });
    const savedUser = await newUser.save();

    const token = generateToken({ id: savedUser.id });
    console.log('User created successfully:', savedUser._id);

    res.status(201).json({ response: savedUser, token });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// @route   POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    const { aadharCardNumber, password } = req.body;

    if (!aadharCardNumber || !password) {
      return res.status(400).json({ error: 'Aadhar Card Number and password are required' });
    }

    const user = await User.findOne({ aadharCardNumber });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid Aadhar Card Number or Password' });
    }

    const token = generateToken({ id: user.id });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// @route   GET /api/users/me
// GET /api/users/me
router.get('/me', jwtAuthMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      // Determine votedCandidateId
      let votedCandidateId = null;
      if (user.isVoted) {
        const candidate = await Candidate.findOne({ 'votes.user': user._id });
        votedCandidateId = candidate?._id || null;
      }
  
      res.status(200).json({
        ...user.toObject(),
        votedCandidateId
      });
    } catch (err) {
      console.error('Error in /me:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

  // @route   POST /api/users/vote
router.post('/vote', jwtAuthMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const { candidateId } = req.body;
  
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      if (user.role === 'admin') return res.status(403).json({ error: 'Admins cannot vote' });
      if (user.isVoted) return res.status(400).json({ error: 'You have already voted' });
  
      const candidate = await Candidate.findById(candidateId);
      if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
  
      // Record vote
      candidate.votes.push({ user: userId });
      candidate.voteCount++;
      await candidate.save();
  
      user.isVoted = true;
      await user.save();
  
      res.status(200).json({ message: 'Vote recorded successfully' });
    } catch (err) {
      console.error('Vote error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Helper function to get the candidate ID a user voted for
async function getUserVotedCandidateId(userId) {
  const Candidate = require('../models/candidate');
  const candidate = await Candidate.findOne({ 'votes.user': userId });
  return candidate ? candidate._id : null;
}

// @route   GET /api/users/profile
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ user });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// @route   PUT /api/users/profile/password
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    user.password = newPassword;
    await user.save();

    console.log(`Password updated for user ${user._id}`);
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
