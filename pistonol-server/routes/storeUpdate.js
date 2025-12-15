const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Store = require('../models/Store');

// Route 1: सभी company employees और उनके stores देखने के लिए
router.get('/company-employees', async (req, res) => {
  try {
    // सिर्फ company-employee role वाले users fetch करें
    const companyEmployees = await User.find({
      role: 'company-employee'
    }).select('name username email role storeId mobile createdAt')
      .sort({ createdAt: -1 });

    // प्रत्येक employee के stores की details fetch करें
    const employeesWithStores = await Promise.all(
      companyEmployees.map(async (employee) => {
        const stores = await Store.find({
          _id: { $in: employee.storeId }
        }).select('name location isActive');
        
        return {
          _id: employee._id,
          name: employee.name,
          username: employee.username,
          email: employee.email,
          mobile: employee.mobile,
          role: employee.role,
          storeIds: employee.storeId, // Array of store IDs as strings
          stores: stores, // Store details
          totalStores: stores.length,
          createdAt: employee.createdAt
        };
      })
    );

    res.json({
      success: true,
      totalEmployees: employeesWithStores.length,
      employees: employeesWithStores
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route 2: Employee के storeId में store add/remove करने के लिए
router.put('/employee/:employeeId/stores', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { storeIds, action } = req.body; // action: 'add' या 'remove'
    
    if (!storeIds || !Array.isArray(storeIds)) {
      return res.status(400).json({ message: 'storeIds array is required' });
    }

    if (!['add', 'remove'].includes(action)) {
      return res.status(400).json({ message: 'Action must be "add" or "remove"' });
    }

    // Employee को find करें
    const employee = await User.findById(employeeId);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // यह check करें कि यह company-employee है
    if (employee.role !== 'company-employee') {
      return res.status(400).json({ message: 'Only company employees can have stores' });
    }

    let updatedStoreIds = [...employee.storeId];

    if (action === 'add') {
      // नए storeIds add करें (string format में)
      storeIds.forEach(storeId => {
        const storeIdStr = storeId.toString();
        if (!updatedStoreIds.includes(storeIdStr)) {
          updatedStoreIds.push(storeIdStr);
        }
      });
    } else if (action === 'remove') {
      // StoreIds remove करें
      updatedStoreIds = updatedStoreIds.filter(
        existingStoreId => !storeIds.includes(existingStoreId)
      );
    }

    // Employee को update करें
    employee.storeId = updatedStoreIds;
    await employee.save();

    // Update किए गए stores की details fetch करें
    const updatedStores = await Store.find({
      _id: { $in: updatedStoreIds }
    }).select('name location latitude longitude isActive');

    res.json({
      success: true,
      message: `Stores ${action}ed successfully for employee ${employee.name}`,
      employee: {
        _id: employee._id,
        name: employee.name,
        storeIds: employee.storeId // Array of strings (_id values)
      },
      stores: updatedStores,
      totalStores: updatedStores.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route 3: सभी available stores की list के लिए
router.get('/available-stores', async (req, res) => {
  try {
    const stores = await Store.find({ isActive: true })
      .select('_id name location latitude longitude')
      .sort({ name: 1 });

    res.json({
      success: true,
      totalStores: stores.length,
      stores: stores
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route 4: Specific employee के stores देखने के लिए
router.get('/employee/:employeeId/stores', async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await User.findById(employeeId)
      .select('name username role storeId');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Employee के stores की details fetch करें
    const stores = await Store.find({
      _id: { $in: employee.storeId }
    }).select('name location latitude longitude isActive');

    res.json({
      success: true,
      employee: {
        _id: employee._id,
        name: employee.name,
        username: employee.username,
        role: employee.role,
        storeIds: employee.storeId
      },
      stores: stores,
      totalStores: stores.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;