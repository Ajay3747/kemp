const Product = require('../models/Product');
const UserProfile = require('../models/UserProfile');
const User = require('../models/User');

// Create a new product listing
exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, category, condition, sellerId } = req.body;

    if (!title || !description || !price || !category || !sellerId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Get seller information
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Create product
    const product = new Product({
      title,
      description,
      price: parseFloat(price),
      category,
      condition: condition || 'used',
      sellerId,
      sellerName: seller.username,
      sellerEmail: seller.collegeEmail,
      sellerPhone: seller.phone,
      imageUrl: req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : null,
      imageData: req.file ? req.file.buffer : null,
      imageMimeType: req.file ? req.file.mimetype : null
    });

    await product.save();

    // Update user profile - increment products listed
    await UserProfile.findOneAndUpdate(
      { userId: sellerId },
      { $inc: { productsListed: 1 }, updatedAt: new Date() },
      { new: true }
    );

    res.status(201).json({ 
      message: 'Product created successfully', 
      productId: product._id,
      product 
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all products (public - visible to everyone)
exports.getAllProducts = async (req, res) => {
  try {
    const { category, searchTerm, minPrice, maxPrice, condition } = req.query;

    // Build filter
    let filter = { isActive: true };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (searchTerm) {
      filter.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (condition && condition !== 'All') {
      filter.condition = condition;
    }

    const products = await Product.find(filter)
      .populate('sellerId', 'username collegeEmail phone')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get products by seller
exports.getProductsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const products = await Product.find({ sellerId, isActive: true })
      .populate('sellerId', 'username collegeEmail phone')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Get products by seller error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId)
      .populate('sellerId', 'username collegeEmail phone department');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { title, description, price, category, condition, stockAvailable } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = parseFloat(price);
    if (category) product.category = category;
    if (condition) product.condition = condition;
    if (stockAvailable !== undefined) product.stockAvailable = stockAvailable;

    product.updatedAt = new Date();
    await product.save();

    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user ? req.user._id : req.headers['userid']; // Support middleware or header

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Only allow seller to delete their own product
    if (userId && product.sellerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized: Only the seller can delete this product.' });
    }

    // Soft delete: set isActive to false
    product.isActive = false;
    product.updatedAt = new Date();
    await product.save();

    // Update user profile - decrement products listed
    await UserProfile.findOneAndUpdate(
      { userId: product.sellerId },
      { $inc: { productsListed: -1 }, updatedAt: new Date() }
    );

    res.json({ message: 'Product deleted successfully (soft delete)', productId });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Add review to product
exports.addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { buyerId, buyerName, rating, comment } = req.body;

    if (!buyerId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Invalid review data' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Add review
    product.reviews.push({
      buyerId,
      buyerName,
      rating,
      comment: comment || ''
    });

    // Calculate average rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.averageRating = parseFloat((totalRating / product.reviews.length).toFixed(2));
    product.totalReviews = product.reviews.length;

    await product.save();

    res.json({ message: 'Review added successfully', product });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get user's profile and stats
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const userProfile = await UserProfile.findOne({ userId })
      .populate('userId', 'username collegeEmail department phone');

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Get user's active products
    const products = await Product.find({ sellerId: userId, isActive: true });

    res.json({
      ...userProfile.toObject(),
      activeProducts: products.length
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { bio, verificationStatus } = req.body;

    const userProfile = await UserProfile.findOneAndUpdate(
      { userId },
      {
        bio: bio || undefined,
        verificationStatus: verificationStatus || undefined,
        updatedAt: new Date(),
        lastActive: new Date()
      },
      { new: true }
    );

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    res.json({ message: 'Profile updated successfully', userProfile });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
