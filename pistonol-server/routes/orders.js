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



router.get('/admin/orders', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      userType,
      paymentMethod,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      userId
    } = req.query;

    const query = {};

    // Status filter
    if (status) query.status = status;

    // User type filter
    if (userType && userType !== 'all') {
      query.userType = userType;
    }

    // Payment method filter
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    // Date range filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      query.totalAmount = {};
      if (minAmount) query.totalAmount.$gte = Number(minAmount);
      if (maxAmount) query.totalAmount.$lte = Number(maxAmount);
    }

    // Search filter (order number, customer name, mobile, etc.)
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'user.username': { $regex: search, $options: 'i' } },
        { 'user.mobile': { $regex: search, $options: 'i' } },
        { 'user.businessName': { $regex: search, $options: 'i' } }
      ];
    }

    // Specific user filter
    if (userId) {
      query.user = userId;
    }

    const skip = (page - 1) * limit;

    // Execute query with population
    const orders = await Order.find(query)
      .populate('user', 'username name businessName mobile email role photo')
      .populate('items.product', 'name category images price description')
      .populate('approvedBy', 'username name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      },
      filters: req.query
    });

  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update order details (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { totalAmount, adminNotes, userNotes, shippingAddress } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only allow editing of pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be edited'
      });
    }

    const updates = {};
    if (totalAmount !== undefined) updates.totalAmount = totalAmount;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;
    if (userNotes !== undefined) updates.userNotes = userNotes;
    if (shippingAddress !== undefined) updates.shippingAddress = shippingAddress;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('user', 'username name businessName mobile')
     .populate('items.product', 'name price');

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});



// routes/orderRoutes.js में सिर्फ status update route

// Update order status - FIXED ROUTE
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params; // ये orderId है
    const { status, adminNotes } = req.body;
console.log(req.body)
    console.log('Updating order status:', { 
      orderId: id, 
      status, 
      adminNotes,
      route: 'PUT /orders/:id/status'
    });

    // Check if order exists
    const order = await Order.findById(id);
    if (!order) {
      console.error('Order not found with ID:', id);
      return res.status(404).json({
        success: false,
        message: `Order not found with ID: ${id}`
      });
    }

    // Prepare update data
    const updateData = { 
      status,
      updatedAt: Date.now()
    };
    
    if (adminNotes) updateData.adminNotes = adminNotes;

    // Handle status-specific updates
    if (status === 'approved') {
      updateData.approvedAt = new Date();
      updateData.approvedBy = req.user?._id;
      
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
      updateData.rejectedBy = req.user?._id;
      
      // If payment was reward-payment, refund wallet
      if (order.paymentMethod === 'reward-payment' && order.status === 'approved') {
        await User.findByIdAndUpdate(order.user, {
          $inc: { wallet: order.totalAmount }
        });
      }
      
      // Restore stock if previously approved
      if (order.status === 'approved') {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity }
          });
        }
      }

    } else if (status === 'shipped') {
      updateData.shippedAt = new Date();
    } else if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    } else if (status === 'cancelled') {
      updateData.cancelledAt = new Date();
      
      // Refund wallet for reward payments
      if (order.paymentMethod === 'reward-payment' && order.status === 'approved') {
        await User.findByIdAndUpdate(order.user, {
          $inc: { wallet: order.totalAmount }
        });
      }
      
      // Restore stock if previously approved
      if (order.status === 'approved') {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity }
          });
        }
      }
    }

    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('user', 'username name businessName mobile email')
    .populate('items.product', 'name category images price')
    .populate('approvedBy', 'username name');

    console.log('Order status updated successfully:', {
      orderId: id,
      oldStatus: order.status,
      newStatus: status,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
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
});




// Routes
router.post('/', createOrder);
router.get('/user', getUserOrders); // Changed from /distributor to /user
router.get('/admin', getAdminOrders);
router.get('/:id', getOrder);
// router.put('/status', updateOrderStatus); // Changed to PUT /status with body
router.delete('/:orderId', deleteOrder);
router.get('/dashboard/user', getUserDashboard); // Changed from /distributor/simple-dashboard

module.exports = router;