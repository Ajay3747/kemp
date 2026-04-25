const mongoose = require('mongoose');

const staffDashboardSchema = new mongoose.Schema({
  staffId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  username: { type: String, required: true },
  department: { type: String, required: true },
  usersApprovedCount: { type: Number, default: 0 },
  usersPendingCount: { type: Number, default: 0 },
  totalUsersManaged: { type: Number, default: 0 },
  itemsModeratedCount: { type: Number, default: 0 },
  flaggedItemsCount: { type: Number, default: 0 },
  reportsCount: { type: Number, default: 0 },
  performanceRating: { type: Number, default: 0 },
  lastActivityTime: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StaffDashboard', staffDashboardSchema);
