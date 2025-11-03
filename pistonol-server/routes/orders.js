const express = require("express");
const router = express.Router();
 
 


const Order = require('../models/orderModel.js');
const Product = require('../models/Product.js');
const User = require('../models/User.js');

const createOrder = async (req, res) => {
  try {
    const { items, paymentMethod,distributorId, distributorNotes } = req.body;
   console.log(req.body)
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
      const distributor = await User.findById(distributorId);
      if (distributor.wallet < totalAmount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient wallet balance'
        });
      }
    }

    // Create order
    const order = new Order({
      distributor: distributorId,
      items: orderItems,
      orderNumber:`ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      totalAmount,
      paymentMethod,
      distributorNotes,
      status: 'pending'
    });

    await order.save();

    // Populate order details for response
    await order.populate('distributor', 'username businessName');
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

// @desc    Get all orders for distributor
// @route   GET /api/orders/distributor
// @access  Private (Distributor)
const getDistributorOrders = async (req, res) => {
  try {
   
    const { page = 1,distributorId, limit = 100, status } = req.query;

    const query = { distributor: distributorId };
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
    console.error('Get distributor orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all orders for admin
// @route   GET /api/orders/admin
// @access  Private (Admin)
const getAdminOrders = async (req, res) => {
  try {
  

    const { page = 1, limit = 10, status, distributor } = req.query;

    const query = {};
    if (status) query.status = status;
    if (distributor) query.distributor = distributor;

    const orders = await Order.find(query)
      .populate('distributor', 'username businessName mobile email')
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

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private (Admin)
const updateOrderStatus = async (req, res) => {
  try {
  

    const { status,orderId, adminNotes } = req.body;
    

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
        await User.findByIdAndUpdate(order.distributor, {
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
    ).populate('distributor', 'username businessName')
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

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('distributor', 'username businessName mobile email address')
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





 router.post('/',   createOrder);
router.get('/distributor',  getDistributorOrders);
router.get('/admin',  getAdminOrders);
router.get('/:id', getOrder);
router.put('/:id/status',  updateOrderStatus);










router.get('/distributor/simple-dashboard',   async (req, res) => {
 



  try {
    const distributorId = req.query.id;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Get current month dates
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    // Get total orders count
    const totalOrders = await Order.countDocuments({ distributor: distributorId });

    // Get current month orders
    const currentMonthOrders = await Order.find({
      distributor: distributorId,
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
    const recentOrders = await Order.find({ distributor: distributorId })
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber totalAmount status paymentMethod createdAt')
      .lean();

    // Get wallet balance
    const distributor = await User.findById(distributorId).select('wallet');

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
          walletBalance: distributor.wallet,
          monthlyOrders: monthlyStats.total,
          monthlyRevenue: monthlyStats.revenue,
          pendingOrders: monthlyStats.pending,
          deliveredOrders: monthlyStats.delivered
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











});







module.exports = router;
