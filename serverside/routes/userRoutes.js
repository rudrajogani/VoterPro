const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const Vote = require('./../models/Vote');
const Election = require('./../models/Election');
const Candidate = require('./../models/candidate');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

// ---------------- SIGNUP ----------------
router.post('/signup', async (req, res) => {
    try {
        const data = req.body;

        // Only one admin allowed
        const adminUser = await User.findOne({ role: 'admin' });
        if (data.role === 'admin' && adminUser) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }

        // Validate Aadhaar (12 digits)
        if (!/^\d{12}$/.test(data.aadharCardNumber)) {
            return res.status(400).json({ error: 'Aadhar Card Number must be exactly 12 digits' });
        }

        // Unique Aadhaar check
        const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
        if (existingUser) {
            return res.status(400).json({ error: 'User with the same Aadhar Card Number already exists' });
        }

        const newUser = new User(data);
        const response = await newUser.save();

        const payload = { id: response.id };
        const token = generateToken(payload);

        res.status(200).json({ response, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ---------------- LOGIN ----------------
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

        const payload = { id: user.id };
        const token = generateToken(payload);

        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ---------------- PROFILE ----------------
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ---------------- CHANGE PASSWORD ----------------
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
        }

        const user = await User.findById(userId);
        if (!user || !(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid current password' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ---------------- USER'S VOTES ----------------
router.get('/my-votes', jwtAuthMiddleware, async (req, res) => {
    try {
        const votes = await Vote.find({ user: req.user.id })
            .populate('candidate', 'name party')
            .populate('election', 'name startDate endDate');

        res.json({ votes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ---------------- AVAILABLE ELECTIONS ----------------
router.get('/available-elections', jwtAuthMiddleware, async (req, res) => {
    try {
        const now = new Date();
        const elections = await Election.find({
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).select('name startDate endDate');

        res.json({ elections });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
