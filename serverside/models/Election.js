const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g. "2025 General Election"
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
});

module.exports = mongoose.model('Election', electionSchema);
