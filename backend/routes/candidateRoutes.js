const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Candidate = require('../models/candidate');
const { jwtAuthMiddleware } = require('../jwt');

// Utility function to check admin role
const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    return user?.role === 'admin';
  } catch (err) {
    return false;
  }
};

// Add a new candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: 'User does not have admin role' });

    const { name, party, image, description, age } = req.body;

    const newCandidate = new Candidate({
      name,
      party,
      image,
      description,
      age
    });

    const savedCandidate = await newCandidate.save();
    res.status(201).json(savedCandidate);
  } catch (err) {
    console.error('Error saving candidate:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a candidate
router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: 'User does not have admin role' });

    const updatedCandidate = await Candidate.findByIdAndUpdate(
      req.params.candidateID,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCandidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.status(200).json(updatedCandidate);
  } catch (err) {
    console.error('Error updating candidate:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a candidate
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: 'User does not have admin role' });

    const deleted = await Candidate.findByIdAndDelete(req.params.candidateID);

    if (!deleted) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.status(200).json(deleted);
  } catch (err) {
    console.error('Error deleting candidate:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Vote for a candidate
router.get('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.candidateID);
    const user = await User.findById(req.user.id);

    if (!candidate || !user) {
      return res.status(404).json({ message: 'Candidate or user not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Admin is not allowed to vote' });
    }

    if (user.isVoted) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    candidate.votes.push({ user: user._id });
    candidate.voteCount++;
    await candidate.save();

    user.isVoted = true;
    await user.save();

    res.status(200).json({ message: 'Vote recorded successfully' });
  } catch (err) {
    console.error('Voting error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get vote count for all candidates
router.get('/vote/count', async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ voteCount: -1 });

    const voteRecord = candidates.map(({ party, voteCount }) => ({
      party,
      count: voteCount
    }));

    res.status(200).json(voteRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get list of all candidates with all info
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.status(200).json(candidates);
  } catch (err) {
    console.error('Error fetching candidates:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
