const express = require('express');
const authController = require('../controllers/authController');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/login', authController.login);
router.post('/signup', upload.single('idCard'), authController.signup);
router.get('/user/:id', authController.getUser);
router.get('/idcard/:id', authController.getIdCard);
router.get('/check-user/:id', authController.checkUserData);
router.get('/admin/users', authController.getAllUsers);
router.get('/debug/users', authController.debugAllUsers);
router.delete('/admin/user/:id', authController.deleteUser);

// Staff approval routes
router.get('/staff/pending-users', authController.getPendingUsers);
router.post('/staff/approve/:id', authController.approveUser);
router.post('/staff/deny/:id', authController.denyUser);

// Staff dashboard routes
router.get('/staff/dashboard/:staffId', authController.getStaffDashboard);
router.put('/staff/dashboard/:staffId/update', authController.updateStaffDashboardStats);
router.post('/staff/report-user', authController.reportUser);

// Public stats endpoint
router.get('/stats', authController.getPublicStats);

module.exports = router;