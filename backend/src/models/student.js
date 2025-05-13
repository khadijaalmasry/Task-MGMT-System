const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  universityId: { type: String, required: false }
});

module.exports = mongoose.model('Student', studentSchema);
