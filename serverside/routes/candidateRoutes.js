const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { jwtAuthMiddleware } = require('../jwt');
const Candidate = require('../models/candidate');

// helper: check if user is admin
const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    if (user && user.role === 'admin') return true;
    return false;
  } catch (err) {
    return false;
  }
};

// ✅ Add candidate (Admin only)
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: 'User does not have admin role' });
    }

    const data = req.body;
    const newCandidate = new Candidate(data);
    const response = await newCandidate.save();

    console.log('Candidate saved');
    res.status(200).json({ response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ✅ Update candidate (Admin only)
router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: 'User does not have admin role' });
    }

    const candidateID = req.params.candidateID;
    const updatedCandidateData = req.body;

    const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
      new: true,
      runValidators: true,
    });

    if (!response) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    console.log('Candidate updated');
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ✅ Delete candidate (Admin only)
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: 'User does not have admin role' });
    }

    const candidateID = req.params.candidateID;
    const response = await Candidate.findByIdAndDelete(candidateID);

    if (!response) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    console.log('Candidate deleted');
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ✅ Voting route
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
  const candidateID = req.params.candidateID;
  const userId = req.user.id;

  try {
    const candidate = await Candidate.findById(candidateID).populate('election');
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Admins cannot vote' });

    const electionId = candidate.election._id.toString();

    // check if user already voted in this election
    if (user.votedElections.includes(electionId)) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }

    // record vote
    candidate.votes.push({ user: userId });
    candidate.voteCount += 1;
    await candidate.save();

    // mark user as voted in this election
    user.votedElections.push(electionId);
    await user.save();

    return res.status(200).json({ message: 'Vote recorded successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ✅ Get vote count for a specific election
router.get('/vote/count/:electionID', async (req, res) => {
  try {
    const electionID = req.params.electionID;

    const candidates = await Candidate.find({ election: electionID }).sort({ voteCount: -1 });

    const voteRecord = candidates.map(data => ({
      name: data.name,
      party: data.party,
      count: data.voteCount,
    }));

    return res.status(200).json(voteRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ✅ Get list of candidates (only name + party)
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find({}, 'name party -_id');
    res.status(200).json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
