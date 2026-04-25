const User = require('../models/User');
const StaffDashboard = require('../models/StaffDashboard');
const Report = require('../models/Report');
const UserProfile = require('../models/UserProfile');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');

// Hardcoded admin credentials
const ADMIN_USERNAME = 'test';
const ADMIN_PASSWORD = 'test';

exports.login = async (req, res) => {
  try {
    const { username, password, userType } = req.body;
    
    console.log('=== LOGIN REQUEST ===');
    console.log('Body received:', req.body);
    console.log('Username:', username);
    console.log('UserType:', userType);
    console.log('Password provided:', !!password);
    console.log('Password:', password);
    
    if (!username || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ message: 'Username and password required' });
    }

    // Check for admin login with hardcoded credentials
    if (userType === 'admin') {
      console.log('Admin login attempt');
      console.log('Expected username:', ADMIN_USERNAME, 'Got:', username);
      console.log('Expected password:', ADMIN_PASSWORD, 'Got:', password);
      console.log('Match:', username === ADMIN_USERNAME && password === ADMIN_PASSWORD);
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        let adminUser = await User.findOne({ username: ADMIN_USERNAME });

        // Ensure the admin document exists so notifications can be tied to this account
        if (!adminUser) {
          adminUser = new User({
            username: ADMIN_USERNAME,
            password: ADMIN_PASSWORD,
            collegeEmail: 'admin@kongu.edu',
            department: 'Administration',
            rollNo: 'ADMIN001',
            phone: '9999999999',
            idCard: 'admin-id-card',
            role: 'admin',
            isAdmin: true,
            isApproved: true
          });
          await adminUser.save();
        } else {
          const needsUpdate = adminUser.role !== 'admin' || !adminUser.isAdmin || !adminUser.isApproved;
          if (needsUpdate) {
            adminUser.role = 'admin';
            adminUser.isAdmin = true;
            adminUser.isApproved = true;
            await adminUser.save();
          }
        }

        const token = jwt.sign({ userId: adminUser._id, isAdmin: true }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
        console.log('Admin login successful, returning token');
        return res.json({ message: 'Admin Login Successful', token, userId: adminUser._id, isAdmin: true });
      } else {
        console.log('Admin credentials do not match');
        return res.status(400).json({ message: 'Invalid Username or Password' });
      }
    }

    // Regular user login
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Username or Password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid Username or Password' });
    }

    // Check user type and role
    if (userType === 'staff') {
      console.log('Staff login attempt');
      console.log('User role:', user.role);
      if (user.role !== 'staff') {
        console.log('User role is not staff, rejecting');
        return res.status(400).json({ message: 'Invalid Username or Password' });
      }
      console.log('Staff login successful');
      const token = jwt.sign({ userId: user._id, isStaff: true }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
      return res.json({ 
        message: 'Staff Login Successful', 
        token, 
        userId: user._id, 
        isStaff: true,
        userData: {
          username: user.username,
          department: user.department,
          collegeEmail: user.collegeEmail
        }
      });
    }

    // Regular user login (role: 'user')
    if (user.role !== 'user') {
      return res.status(400).json({ message: 'Invalid Username or Password' });
    }

    // Check if user is approved by staff
    if (!user.isApproved) {
      return res.status(401).json({ message: 'Your account is pending staff approval. Please wait for approval before logging in.' });
    }

    const token = jwt.sign({ userId: user._id, isAdmin: false }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    res.json({ message: 'Login Successful', token, userId: user._id, isAdmin: false });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.signup = async (req, res) => {
  try {
    const { username, password, confirmPassword, department, rollNo, phone, collegeEmail, bloodGroup, role } = req.body;

    console.log('Signup attempt:', { username, department, rollNo, phone, collegeEmail, bloodGroup, role, fileExists: !!req.file });

    if (!username || !password || !confirmPassword || !department || !rollNo || !phone || !collegeEmail || !bloodGroup) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (!collegeEmail.endsWith('@kongu.edu')) {
      return res.status(400).json({ message: 'Invalid college email - must end with @kongu.edu' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'ID Card upload required' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { collegeEmail }, { rollNo }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      username,
      password,
      collegeEmail,
      department,
      rollNo,
      phone,
      bloodGroup,
      idCard: req.file.originalname,
      idCardData: req.file.buffer,
      idCardMimeType: req.file.mimetype,
      role: role || 'user',
      isApproved: role === 'staff' ? true : false  // Staff are auto-approved by admin
    });

    await user.save();
    console.log('User created:', user._id, 'with role:', user.role);

    // If the user is staff, create a separate dashboard for them
    if (role === 'staff') {
      console.log('Creating staff dashboard for:', user.username);
      const staffDashboard = new StaffDashboard({
        staffId: user._id,
        username: user.username,
        department: user.department,
        usersApprovedCount: 0,
        usersPendingCount: 0,
        totalUsersManaged: 0,
        itemsModeratedCount: 0,
        flaggedItemsCount: 0,
        reportsCount: 0,
        performanceRating: 0
      });
      await staffDashboard.save();
      console.log('Staff Dashboard created:', staffDashboard._id);
      return res.status(201).json({ 
        message: 'Staff Signup Successful', 
        userId: user._id,
        dashboardId: staffDashboard._id 
      });
    }

    // Create user profile for regular users
    const userProfile = new UserProfile({
      userId: user._id,
      username: user.username,
      collegeEmail: user.collegeEmail,
      department: user.department,
      phone: user.phone,
      verificationStatus: 'pending'
    });
    await userProfile.save();
    console.log('User Profile created:', userProfile._id);

    res.status(201).json({ 
      message: 'Signup Successful! Your account is pending staff approval. You will be able to login once approved.', 
      userId: user._id, 
      profileId: userProfile._id,
      requiresApproval: true
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let idCardUrl = null;
    
    // If the user has idCardData, convert to base64 data URL
    if (user.idCardData && user.idCardData.length > 0) {
      const base64 = user.idCardData.toString('base64');
      const mimeType = user.idCardMimeType || 'image/png';
      idCardUrl = `data:${mimeType};base64,${base64}`;
    }

    res.json({
      _id: user._id,
      username: user.username,
      collegeEmail: user.collegeEmail,
      department: user.department,
      rollNo: user.rollNo,
      phone: user.phone,
      bloodGroup: user.bloodGroup,
      idCard: user.idCard,
      idCardUrl: idCardUrl,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getIdCard = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Getting ID card for user:', id);
    
    const user = await User.findById(id);
    if (!user) {
      console.log('User not found:', id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.idCardData) {
      console.log('ID Card data not found for user:', id);
      return res.status(404).json({ message: 'ID Card not found' });
    }

    console.log('Sending ID card, size:', user.idCardData.length, 'mime:', user.idCardMimeType);
    
    res.set('Content-Type', user.idCardMimeType || 'image/png');
    res.set('Content-Disposition', 'inline');
    res.set('Cache-Control', 'public, max-age=3600');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Send buffer directly as binary data
    res.send(user.idCardData);
  } catch (error) {
    console.error('Get ID card error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    console.log('getAllUsers called');
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    console.log('Total users found:', users.length);
    console.log('User roles:', users.map(u => ({ username: u.username, role: u.role })));
    
    const usersWithIdCardUrl = users.map(user => {
      if (user.isAdmin) return null;
      
      let idCardUrl = null;
      
      // If the user has idCardData, convert to base64 data URL
      if (user.idCardData && user.idCardData.length > 0) {
        const base64 = user.idCardData.toString('base64');
        const mimeType = user.idCardMimeType || 'image/png';
        idCardUrl = `data:${mimeType};base64,${base64}`;
      }
      
      return {
        _id: user._id,
        username: user.username,
        collegeEmail: user.collegeEmail,
        department: user.department,
        rollNo: user.rollNo,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        idCard: user.idCard,
        idCardUrl: idCardUrl,
        role: user.role,
        createdAt: user.createdAt
      };
    }).filter(u => u !== null);

    console.log('Returning users:', usersWithIdCardUrl.length);
    res.json(usersWithIdCardUrl);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'User ID required' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully', deletedUserId: user._id });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get pending users for staff approval
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user', isApproved: false })
      .select('-password')
      .sort({ createdAt: -1 });

    console.log(`\n=== DEBUG: Getting pending users ===`);
    console.log(`Total pending users found: ${users.length}`);

    const baseUrl = process.env.API_URL || 'http://localhost:5000';

    const usersWithIdCardUrl = users.map((user, index) => {
      let idCardUrl = null;
      let debugInfo = {
        username: user.username,
        hasIdCardData: !!user.idCardData,
        idCardDataLength: user.idCardData ? user.idCardData.length : 0,
        idCardMimeType: user.idCardMimeType,
        idCardDataType: user.idCardData ? typeof user.idCardData : 'none',
        isBuffer: user.idCardData ? Buffer.isBuffer(user.idCardData) : false
      };
      
      console.log(`User ${index + 1} (${user.username}):`, debugInfo);
      
      // If the user has idCardData, convert to base64 data URL
      if (user.idCardData && user.idCardData.length > 0) {
        try {
          const base64 = user.idCardData.toString('base64');
          const mimeType = user.idCardMimeType || 'image/png';
          idCardUrl = `data:${mimeType};base64,${base64}`;
          console.log(`✓ Successfully converted to base64 for ${user.username}, URL length: ${idCardUrl.length}`);
        } catch (convertError) {
          console.error(`✗ Failed to convert to base64 for ${user.username}:`, convertError.message);
        }
      } else {
        console.log(`✗ No idCardData for ${user.username}`);
      }
      
      return {
        _id: user._id,
        username: user.username,
        collegeEmail: user.collegeEmail,
        department: user.department,
        rollNo: user.rollNo,
        phone: user.phone,
        idCard: user.idCard,
        idCardUrl: idCardUrl,
        isApproved: user.isApproved,
        createdAt: user.createdAt
      };
    });

    console.log(`=== Returning ${usersWithIdCardUrl.length} users with images ===\n`);
    res.json(usersWithIdCardUrl);
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Approve user (Staff only)
exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'User ID required' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    ).select('-password -idCardData');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update all staff dashboards with new counts
    const pendingUsersCount = await User.countDocuments({ role: 'user', isApproved: false });
    const approvedUsersCount = await User.countDocuments({ role: 'user', isApproved: true });
    
    await StaffDashboard.updateMany(
      {},
      {
        usersPendingCount: pendingUsersCount,
        usersApprovedCount: approvedUsersCount,
        totalUsersManaged: approvedUsersCount + pendingUsersCount,
        lastActivityTime: new Date()
      }
    );

    res.json({ message: 'User approved successfully', user });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Deny/Delete user (Staff only)
exports.denyUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'User ID required' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update all staff dashboards with new counts
    const pendingUsersCount = await User.countDocuments({ role: 'user', isApproved: false });
    const approvedUsersCount = await User.countDocuments({ role: 'user', isApproved: true });
    
    await StaffDashboard.updateMany(
      {},
      {
        usersPendingCount: pendingUsersCount,
        usersApprovedCount: approvedUsersCount,
        totalUsersManaged: approvedUsersCount + pendingUsersCount,
        lastActivityTime: new Date()
      }
    );

    res.json({ message: 'User denied and deleted successfully', deletedUserId: user._id });
  } catch (error) {
    console.error('Deny user error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Debug endpoint to check specific user data
exports.checkUserData = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('username idCard idCardData idCardMimeType');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      username: user.username,
      idCard: user.idCard,
      idCardMimeType: user.idCardMimeType,
      idCardDataExists: !!user.idCardData,
      idCardDataSize: user.idCardData ? user.idCardData.length : 0,
      idCardDataType: user.idCardData ? typeof user.idCardData : 'none'
    });
  } catch (error) {
    console.error('Check user data error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get staff dashboard data (Staff only)
exports.getStaffDashboard = async (req, res) => {
  try {
    const staffId = req.params.staffId || req.body.staffId;

    if (!staffId) {
      return res.status(400).json({ message: 'Staff ID required' });
    }

    let staffDashboard = await StaffDashboard.findOne({ staffId }).populate('staffId', 'username department collegeEmail phone');
    
    // If dashboard doesn't exist, create one
    if (!staffDashboard) {
      const staffUser = await User.findById(staffId);
      if (!staffUser) {
        return res.status(404).json({ message: 'Staff user not found' });
      }
      
      // Get real-time counts
      const pendingUsersCount = await User.countDocuments({ role: 'user', isApproved: false });
      const approvedUsersCount = await User.countDocuments({ role: 'user', isApproved: true });
      
      staffDashboard = new StaffDashboard({
        staffId: staffUser._id,
        username: staffUser.username,
        department: staffUser.department || 'N/A',
        usersApprovedCount: approvedUsersCount,
        usersPendingCount: pendingUsersCount,
        totalUsersManaged: approvedUsersCount + pendingUsersCount,
        itemsModeratedCount: 0,
        flaggedItemsCount: 0,
        reportsCount: 0,
        performanceRating: 0
      });
      
      await staffDashboard.save();
      staffDashboard = await StaffDashboard.findOne({ staffId }).populate('staffId', 'username department collegeEmail phone');
    } else {
      // Update with real-time counts
      const pendingUsersCount = await User.countDocuments({ role: 'user', isApproved: false });
      const approvedUsersCount = await User.countDocuments({ role: 'user', isApproved: true });
      
      staffDashboard.usersPendingCount = pendingUsersCount;
      staffDashboard.usersApprovedCount = approvedUsersCount;
      staffDashboard.totalUsersManaged = approvedUsersCount + pendingUsersCount;
      await staffDashboard.save();
    }

    res.json(staffDashboard);
  } catch (error) {
    console.error('Get staff dashboard error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update staff dashboard stats
exports.updateStaffDashboardStats = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { usersApprovedCount, usersPendingCount, totalUsersManaged, itemsModeratedCount, flaggedItemsCount, reportsCount, performanceRating } = req.body;

    if (!staffId) {
      return res.status(400).json({ message: 'Staff ID required' });
    }

    const staffDashboard = await StaffDashboard.findOneAndUpdate(
      { staffId },
      {
        usersApprovedCount: usersApprovedCount ?? undefined,
        usersPendingCount: usersPendingCount ?? undefined,
        totalUsersManaged: totalUsersManaged ?? undefined,
        itemsModeratedCount: itemsModeratedCount ?? undefined,
        flaggedItemsCount: flaggedItemsCount ?? undefined,
        reportsCount: reportsCount ?? undefined,
        performanceRating: performanceRating ?? undefined,
        updatedAt: new Date(),
        lastActivityTime: new Date()
      },
      { new: true }
    );

    if (!staffDashboard) {
      return res.status(404).json({ message: 'Staff dashboard not found' });
    }

    res.json({ message: 'Staff dashboard updated successfully', staffDashboard });
  } catch (error) {
    console.error('Update staff dashboard error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Staff submits a report about a user
exports.reportUser = async (req, res) => {
  try {
    const {
      reportedUserId,
      reportedUsername,
      reportedEmail,
      reportedDepartment,
      reportedPhone,
      reportedRollNo,
      reportingStaffId,
      reportingStaffUsername,
      reportText,
      reportedAt
    } = req.body;

    if (!reportedUserId || !reportingStaffId || !reportText) {
      return res.status(400).json({ message: 'reportedUserId, reportingStaffId, and reportText are required' });
    }

    const reportedUser = await User.findById(reportedUserId);
    if (!reportedUser) {
      return res.status(404).json({ message: 'Reported user not found' });
    }

    const staffUser = await User.findById(reportingStaffId);
    if (!staffUser || staffUser.role !== 'staff') {
      return res.status(404).json({ message: 'Reporting staff not found or not a staff member' });
    }

    const report = new Report({
      reportedUserId,
      reportingStaffId,
      reportedUsername: reportedUsername || reportedUser.username,
      reportedEmail: reportedEmail || reportedUser.collegeEmail,
      reportedDepartment: reportedDepartment || reportedUser.department,
      reportedPhone: reportedPhone || reportedUser.phone,
      reportedRollNo: reportedRollNo || reportedUser.rollNo,
      reportingStaffUsername: reportingStaffUsername || staffUser.username,
      reportText,
      reportedAt: reportedAt || new Date()
    });

    await report.save();

    // Increment staff dashboard report count
    await StaffDashboard.findOneAndUpdate(
      { staffId: reportingStaffId },
      {
        $inc: { reportsCount: 1 },
        $set: { updatedAt: new Date(), lastActivityTime: new Date() },
        $setOnInsert: {
          username: staffUser.username,
          department: staffUser.department || 'N/A',
          usersApprovedCount: 0,
          usersPendingCount: 0,
          totalUsersManaged: 0,
          itemsModeratedCount: 0,
          flaggedItemsCount: 0,
          performanceRating: 0,
          createdAt: new Date()
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Notify all admins about the reported user
    const admins = await User.find({ $or: [{ role: 'admin' }, { isAdmin: true }] }).select('_id username');
    console.log('Found admins for notification:', admins.length, admins.map(a => ({ id: a._id, username: a.username })));
    
    if (admins.length > 0) {
      const notifications = admins.map(admin => ({
        recipientId: admin._id,
        senderId: reportingStaffId,
        type: 'staff_report',
        title: `User reported: ${reportedUsername || reportedUser.username}`,
        message: `${reportingStaffUsername || staffUser.username} reported ${reportedUsername || reportedUser.username}. Reason: ${reportText}`,
        metadata: {
          reportId: report._id,
          reportedUserId,
          reportedUsername: reportedUsername || reportedUser.username,
          reportedRollNo: reportedRollNo || reportedUser.rollNo,
          reportingStaffId,
          reportingStaffUsername: reportingStaffUsername || staffUser.username
        }
      }));

      const insertedNotifications = await Notification.insertMany(notifications);
      console.log('Created notifications:', insertedNotifications.length);
    } else {
      console.log('No admins found to notify!');
    }

    res.status(201).json({ message: 'Report submitted successfully', reportId: report._id });
  } catch (error) {
    console.error('Report user error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Debug endpoint to check all users
exports.debugAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('username role isApproved idCard idCardData idCardMimeType');
    
    const userStats = users.map(user => ({
      username: user.username,
      role: user.role,
      isApproved: user.isApproved,
      idCard: user.idCard,
      hasIdCardData: !!user.idCardData,
      idCardDataSize: user.idCardData ? user.idCardData.length : 0,
      idCardMimeType: user.idCardMimeType
    }));

    res.json({
      totalUsers: users.length,
      users: userStats
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Public stats endpoint for real-time dashboard data
exports.getPublicStats = async (req, res) => {
  try {
    const Product = require('../models/Product');
    const SaleRecord = require('../models/SaleRecord');
    
    // Get total active users (approved students + staff)
    const totalUsers = await User.countDocuments({ 
      isApproved: true,
      role: { $in: ['user', 'staff'] }
    });
    
    // Get total products listed
    const totalProducts = await Product.countDocuments({ isActive: true });
    
    // Get total completed sales
    const totalSales = await SaleRecord.countDocuments();
    
    // Calculate satisfaction rate based on product reviews
    const productsWithReviews = await Product.find({ totalReviews: { $gt: 0 } });
    let satisfactionRate = 98; // Default value
    if (productsWithReviews.length > 0) {
      const totalRatingSum = productsWithReviews.reduce((sum, p) => sum + (p.averageRating || 0), 0);
      const avgRating = totalRatingSum / productsWithReviews.length;
      satisfactionRate = Math.round((avgRating / 5) * 100);
    }
    
    res.json({
      activeStudents: totalUsers,
      itemsListed: totalProducts,
      satisfactionRate: satisfactionRate,
      totalSales: totalSales
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};