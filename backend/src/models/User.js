const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  collegeEmail: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  rollNo: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  idCard: { type: String, required: true }, // filename
  idCardData: { 
    type: Buffer, 
    default: null 
  }, // binary image data
  idCardMimeType: { 
    type: String, 
    default: 'image/png' 
  },
  role: { type: String, enum: ['user', 'staff', 'admin'], default: 'user' },
  isAdmin: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false }, // Staff approval for regular users
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);