const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  category: String,
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed','On Hold', 'Cancelled'], default: 'Pending' },
  progress: { type: Number, default: 0 }
});

module.exports = mongoose.model('Project', projectSchema);
