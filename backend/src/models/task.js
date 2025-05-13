const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  name: String,
  description: String,
  assignedStudent: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed','On Hold', 'Cancelled'], default: 'Not Started' },
  dueDate: Date
});

module.exports = mongoose.model('Task', taskSchema);
