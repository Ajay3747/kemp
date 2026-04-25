const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportingStaffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedUsername: { type: String, required: true },
  reportedEmail: { type: String, default: '' },
  reportedDepartment: { type: String, default: '' },
  reportedPhone: { type: String, default: '' },
  reportedRollNo: { type: String, default: '' },
  reportingStaffUsername: { type: String, default: '' },
  reportText: { type: String, required: true },
  reportedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
