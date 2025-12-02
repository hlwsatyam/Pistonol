const express = require("express");
const router = express.Router();
const Order = require('../models/orderModel.js');
const Product = require('../models/Product.js');
const User = require('../models/User.js');

// Create order for any user type
const createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, userId, userType = 'distributor', userNotes } = req.body;
   
    console.log(req.body);
    
    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Calculate total and validate products
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Check wallet balance if payment method is reward-payment
    if (paymentMethod === 'reward-payment') {
      const user = await User.findById(userId);
      if (user.wallet < totalAmount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient wallet balance'
        });
      }
    }

    // Create order
    const order = new Order({
      user: userId,
      userType: userType,
      items: orderItems,
      orderNumber: `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      totalAmount,
      paymentMethod,
      userNotes,
      status: 'pending'
    });

    await order.save();

    // Populate order details for response
    await order.populate('user', 'username name businessName');
    await order.populate('items.product', 'name category images');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get orders for any user type
const getUserOrders = async (req, res) => {
  try {
    const { page = 1, userId, userType, limit = 100, status } = req.query;

    const query = { user: userId };
    
    // Add userType filter if provided
    if (userType) {
      query.userType = userType;
    }
    
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('items.product', 'name category images price')
      .populate('approvedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all orders for admin (with user type filtering)
const getAdminOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userType, userId } = req.query;

    const query = {};
    
    // Filter by status
    if (status) query.status = status;
    
    // Filter by user type
    if (userType) query.userType = userType;
    
    // Filter by specific user
    if (userId) query.user = userId;

    const orders = await Order.find(query)
      .populate('user', 'username name businessName mobile email role')
      .populate('items.product', 'name category images price')
      .populate('approvedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update order status (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, orderId, adminNotes } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const updateData = { status };
    if (adminNotes) updateData.adminNotes = adminNotes;

    // Handle status-specific updates
    if (status === 'approved') {
      updateData.approvedAt = new Date();
      
      // If payment is reward-payment, deduct from wallet
      if (order.paymentMethod === 'reward-payment') {
        await User.findByIdAndUpdate(order.user, {
          $inc: { wallet: -order.totalAmount }
        });
      }

      // Reserve stock by reducing available quantity
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }

    } else if (status === 'rejected') {
      updateData.rejectedAt = new Date();
    } else if (status === 'shipped') {
      updateData.shippedAt = new Date();
    } else if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'username name businessName')
     .populate('items.product', 'name category images price')
     .populate('approvedBy', 'username');

    res.json({
      success: true,
      message: `Order ${status} successfully`,
      data: updatedOrder
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single order
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'username name businessName mobile email address role')
      .populate('items.product', 'name description category images price')
      .populate('approvedBy', 'username');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete order (Only for pending orders)
const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only allow deletion of pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be deleted'
      });
    }

    await Order.findByIdAndDelete(orderId);

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user dashboard data
const getUserDashboard = async (req, res) => {
  try {
    const { userId, userType } = req.query;
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Get current month dates
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    // Get total orders count
    const totalOrders = await Order.countDocuments({ user: userId });

    // Get current month orders
    const currentMonthOrders = await Order.find({
      user: userId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Calculate basic stats
    const monthlyStats = {
      total: currentMonthOrders.length,
      pending: currentMonthOrders.filter(order => order.status === 'pending').length,
      approved: currentMonthOrders.filter(order => order.status === 'approved').length,
      delivered: currentMonthOrders.filter(order => order.status === 'delivered').length,
      revenue: currentMonthOrders
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + order.totalAmount, 0)
    };

    // Get recent orders (last 5)
    const recentOrders = await Order.find({ user: userId })
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber totalAmount status paymentMethod createdAt')
      .lean();

    // Get wallet balance
    const user = await User.findById(userId).select('wallet');

    // Simple status distribution for chart
    const statusDistribution = [
      { name: 'pending', value: monthlyStats.pending },
      { name: 'approved', value: monthlyStats.approved },
      { name: 'delivered', value: monthlyStats.delivered }
    ];

    res.json({
      success: true,
      data: {
        overview: {
          totalOrders,
          walletBalance: user.wallet,
          monthlyOrders: monthlyStats.total,
          monthlyRevenue: monthlyStats.revenue,
          pendingOrders: monthlyStats.pending,
          deliveredOrders: monthlyStats.delivered,
          userType: userType
        },
        recentOrders,
        statusDistribution
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Routes
router.post('/', createOrder);
router.get('/user', getUserOrders); // Changed from /distributor to /user
router.get('/admin', getAdminOrders);
router.get('/:id', getOrder);
router.put('/status', updateOrderStatus); // Changed to PUT /status with body
router.delete('/:orderId', deleteOrder);
router.get('/dashboard/user', getUserDashboard); // Changed from /distributor/simple-dashboard

module.exports = router;