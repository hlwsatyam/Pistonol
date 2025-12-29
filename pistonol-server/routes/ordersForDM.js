const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');
const User = require('../models/User');
const Product = require('../models/Product');
const Transaction = require('../models/transaction');








// GET ALL ORDERS WITH PAGINATION AND FILTERS
router.get('/all', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      paymentMethod = '',
      userType = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query object
    const query = {};

    // Search filter - search in order number, usernames, mobiles
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { orderNumber: searchRegex },
        { 'user.username': searchRegex },
        { 'user.name': searchRegex },
        { 'user.mobile': searchRegex },
        { 'reciever.username': searchRegex },
        { 'reciever.name': searchRegex },
        { 'reciever.mobile': searchRegex },
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Payment method filter
    if (paymentMethod && paymentMethod !== 'all') {
      query.paymentMethod = paymentMethod;
    }

    // User type filter
    if (userType && userType !== 'all') {
      query.userType = userType;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Fetch orders with pagination and population
    const orders = await Order.find(query)
      .populate('user', 'username name mobile businessName role')
      .populate('reciever', 'username name mobile businessName role')
      .populate('items.product', 'name price')
      .sort(sortConfig)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Format response
    const response = {
      success: true,
      data: {
        orders,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        },
        filters: {
          search,
          status,
          paymentMethod,
          userType
        }
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// GET ORDER STATISTICS
router.get('/stats', async (req, res) => {
  try {
    const [
      totalOrders,
      pendingCount,
      approvedCount,
      shippedCount,
      deliveredCount,
      rejectedCount,
      totalAmount,
      todayOrders,
      weeklyOrders
    ] = await Promise.all([
      // Total orders
      Order.countDocuments(),
      
      // Status counts
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'approved' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'rejected' }),
      
      // Total amount (only completed orders)
      Order.aggregate([
        { $match: { status: { $in: ['approved', 'shipped', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      
      // Today's orders
      Order.countDocuments({
        createdAt: { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }),
      
      // This week's orders
      Order.countDocuments({
        createdAt: { 
          $gte: new Date(new Date().setDate(new Date().getDate() - 7))
        }
      })
    ]);

    const totalAmountValue = totalAmount.length > 0 ? totalAmount[0].total : 0;

    res.json({
      success: true,
      data: {
        totalOrders,
        statusCounts: {
          pending: pendingCount,
          approved: approvedCount,
          shipped: shippedCount,
          delivered: deliveredCount,
          rejected: rejectedCount
        },
        totalAmount: totalAmountValue,
        todayOrders,
        weeklyOrders
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});





















// Create new order
router.post('/create', async (req, res) => {
  try {
    const { user, userType, reciever, items, totalAmount, paymentMethod, userNotes } = req.body;

    // Validate input
    if (!user || !userType || !reciever || !items || !totalAmount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Check if receiver exists and is valid
    const receiverUser = await User.findById(reciever);
    if (!receiverUser) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Check if user exists
    const senderUser = await User.findById(user);
    if (!senderUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate payment method
    if (!['cash-on-delivery', 'reward-payment'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }

    // Check wallet balance for reward payment
    if (paymentMethod === 'reward-payment' && senderUser.wallet < totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }

    // Validate products and stock
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
          message: `Insufficient stock for product: ${product.name}`
        });
      }
    }
 
    // Create order
    const order = new Order({
      user,
      userType,
      reciever,
      items,
      totalAmount,
        orderNumber: `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
       
      paymentMethod,
      userNotes: userNotes || '',
      status: 'pending'
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating order'
    });
  }
});

// Get orders received by a user
router.get('/received', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const orders = await Order.find({ reciever: userId })
      .populate('user', 'username name businessName mobile')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Get received orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders'
    });
  }
});

// Get orders placed by a user
router.get('/placed', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const orders = await Order.find({ user: userId })
      .populate('reciever', 'username name businessName mobile')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Get placed orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders'
    });
  }
});

// Update order status (for receiver)
router.put('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, adminNotes, userId } = req.body;

    if (!status || !['approved', 'rejected', 'shipped', 'delivered'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }

    const order = await Order.findById(orderId)
      .populate('user', 'username wallet')
      .populate('reciever', 'username wallet');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is the receiver
    if (order.reciever._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // If status is being approved and payment is from wallet, process payment
    if (status === 'approved' && order.paymentMethod === 'reward-payment') {
      // Check sender's wallet balance
      if (order.user.wallet < order.totalAmount) {
        return res.status(400).json({
          success: false,
          message: 'Sender has insufficient wallet balance'
        });
      }

      // Start transaction
      const session = await Order.startSession();
      session.startTransaction();

      try {
        // Deduct from sender's wallet
        await User.findByIdAndUpdate(order.user._id, {
          $inc: { wallet: -order.totalAmount }
        }, { session });

        // Add to receiver's wallet
        await User.findByIdAndUpdate(order.reciever._id, {
          $inc: { wallet: order.totalAmount }
        }, { session });

        // Create transaction record
        const transaction = new Transaction({
          sender: order.user._id,
          receiver: order.reciever._id,
          amount: order.totalAmount,
          type: 'transfer',
          description: `Payment for order ${order.orderNumber}`
        });
        await transaction.save({ session });

        // Update product stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity }
          }, { session });
        }

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    }

    // Update order status
    const updateData = { 
      status,
      updatedAt: new Date()
    };

    // Add admin notes if provided
    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    // Set status timestamps
    switch (status) {
      case 'approved':
        updateData.approvedAt = new Date();
        updateData.approvedBy = userId;
        break;
      case 'rejected':
        updateData.rejectedAt = new Date();
        break;
      case 'shipped':
        updateData.shippedAt = new Date();
        break;
      case 'delivered':
        updateData.deliveredAt = new Date();
        break;
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true })
      .populate('user', 'username name businessName mobile')
      .populate('reciever', 'username name businessName mobile')
      .populate('items.product', 'name price');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating order status'
    });
  }
});

// Get order by ID
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('user', 'username name businessName mobile')
      .populate('reciever', 'username name businessName mobile')
      .populate('items.product', 'name description price stock images');

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
      message: 'Server error fetching order'
    });
  }
});

module.exports = router;