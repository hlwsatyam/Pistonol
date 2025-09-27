const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');


 

 // controllers/productController.js
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
    const minStock = parseInt(req.query.minStock) || 0;
    const maxStock = parseInt(req.query.maxStock) || Number.MAX_SAFE_INTEGER;
   
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build filter object
    const filter = {};
    
    // Search filter (name or description)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category) {
      filter.category = category;
    }
    
    // Price range filter
    filter.price = { $gte: minPrice, $lte: maxPrice };
    
    // Stock range filter
    filter.stock = { $gte: minStock, $lte: maxStock };
    
    // Status filter
    

    // Sort configuration
    const sort = {};
    sort[sortBy] = sortOrder;

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v');

    // Get total count for pagination
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Get category counts for filters
    const categoryCounts = await Product.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Get stock statistics - FIXED THE AGGREGATION ERROR
    const stockStats = await Product.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          inStock: { 
            $sum: { 
              $cond: [
                { $gt: ['$stock', 10] }, 
                1, 
                0
              ] 
            } 
          },
          lowStock: { 
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $gt: ['$stock', 0] },
                    { $lte: ['$stock', 10] }
                  ]
                }, 
                1, 
                0
              ] 
            } 
          },
          outOfStock: { 
            $sum: { 
              $cond: [
                { $eq: ['$stock', 0] }, 
                1, 
                0
              ] 
            } 
          },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        current: page,
        pages: totalPages,
        total: total,
        limit: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        categories: categoryCounts,
        priceRange: { min: minPrice, max: maxPrice },
        stockRange: { min: minStock, max: maxStock }
      },
      statistics: stockStats[0] || {
        totalProducts: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching products',
      error: error.message 
    });
  }
};
exports.getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





// नया प्रोडक्ट बनाएं
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
     
    // इमेजेस की जानकारी स्टोर करें
    const images = req.files?.map(file => ({
      path: file.path,
      filename: file.filename
    }));

    const product = new Product({
     ...req.body
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    // अगर एरर आए तो अपलोड की हुई फाइल्स डिलीट करें
    req.files?.forEach(file => {
      fs.unlinkSync(file.path);
    });
    res.status(500).json({ message: error.message });
  }
};

// प्रोडक्ट अपडेट करें
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      // अगर प्रोडक्ट नहीं मिला तो नई फाइल्स डिलीट करें
      req.files?.forEach(file => {
        fs.unlinkSync(file.path);
      });
      return res.status(404).json({ message: 'Product not found' });
    }

    // नई इमेजेस जोड़ें
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        path: file.path,
        filename: file.filename
      }));
      product.images = [...product.images, ...newImages];
    }

    // अन्य फील्ड्स अपडेट करें
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.stock = stock || product.stock;
    product.updatedAt = Date.now();

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    req.files?.forEach(file => {
      fs.unlinkSync(file.path);
    });
    res.status(500).json({ message: error.message });
  }
};

// इमेज डिलीट करें
exports.deleteImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // डिलीट होने वाली इमेज ढूंढें
    const imageToDelete = product.images[req.params.imageIndex];
    if (!imageToDelete) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // फाइल सिस्टम से डिलीट करें
    fs.unlinkSync(imageToDelete.path);

    // इमेज को प्रोडक्ट से हटाएं
    product.images.splice(req.params.imageIndex, 1);
    await product.save();

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// प्रोडक्ट डिलीट करें
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // सभी इमेज फाइल्स डिलीट करें
    product.images.forEach(image => {
      try {
        fs.unlinkSync(image.path);
      } catch (err) {
        console.error('Error deleting image file:', err);
      }
    });

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};