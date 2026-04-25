const Notification = require('../models/Notification');
const User = require('../models/User');
const Product = require('../models/Product');

// Create a new notification (when buyer clicks Deal Now)
exports.createPurchaseNotification = async (req, res) => {
  try {
    const { productId, buyerId } = req.body;

    console.log('Creating purchase notification:', { productId, buyerId });

    // Get buyer details
    const buyer = await User.findById(buyerId).select('-password');
    if (!buyer) {
      return res.status(404).json({ message: 'Buyer not found' });
    }

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get seller details
    const seller = await User.findById(product.sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Create notification
    const notification = new Notification({
      recipientId: product.sellerId,
      senderId: buyerId,
      productId: productId,
      type: 'purchase_request',
      title: `Purchase Request for ${product.title}`,
      message: `${buyer.username} is interested in dealing for your product "${product.title}"`,
      buyerDetails: {
        name: buyer.username,
        email: buyer.collegeEmail,
        phone: buyer.phone,
        rollNo: buyer.rollNo,
        department: buyer.department
      },
      productDetails: {
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl
      }
    });

    await notification.save();

    console.log('Notification created successfully:', notification._id);

    res.status(201).json({ 
      message: 'Notification sent to seller successfully', 
      notification 
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all notifications for a user (seller)
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({ recipientId: userId })
      .populate('senderId', 'username collegeEmail')
      .populate('productId', 'title price imageUrl')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const count = await Notification.countDocuments({ 
      recipientId: userId, 
      isRead: false 
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
