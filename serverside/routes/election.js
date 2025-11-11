const express = require("express");
const router = express.Router();
const Election = require("../models/Election");

// @route   POST /api/elections
// @desc    Create a new election
router.post("/", async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const election = new Election({
      name,
      startDate,
      endDate,
    });

    await election.save();
    res.status(201).json(election);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// @route   GET /api/elections
// @desc    Get all elections
router.get("/", async (req, res) => {
  try {
    const elections = await Election.find();
    res.json(elections);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// @route   GET /api/elections/:id
// @desc    Get a single election by ID
router.get("/:id", async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ error: "Election not found" });
    }
    res.json(election);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
