const Store = require("../models/Store");
const User = require("../models/User");
const express = require("express");

const router = express.Router();

// Get all stores with pagination + search
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } }
        ]
      };
    }

    const stores = await Store.find(query)
      .populate("clustermanager", "firstName lastName email")
      .populate("regionalmanager", "firstName lastName email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Store.countDocuments(query);

    res.json({
      success: true,
      data: stores,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get store by ID
router.get("/:id", async (req, res) => {
  try {
    const store = await Store.findById(req.params.id)
      .populate("clustermanager", "firstName lastName email")
      .populate("regionalmanager", "firstName lastName email");

    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    res.json({ success: true, data: store });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a new store
router.post("/", async (req, res) => {
  try {
    const store = new Store(req.body);
    await store.save();
    await store.populate("clustermanager", "firstName lastName email");
    await store.populate("regionalmanager", "firstName lastName email");

    res.status(201).json({ success: true, data: store });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update a store
router.put("/:id", async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate("clustermanager", "firstName lastName email")
      .populate("regionalmanager", "firstName lastName email");

    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    res.json({ success: true, data: store });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete a store
router.delete("/:id", async (req, res) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);

    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    res.json({ success: true, message: "Store deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get employees (for managers dropdown)
router.get("/user/staff", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      };
    }

    const employees = await User.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ firstName: 1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: employees,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});




const geodesic = require("geographiclib-geodesic");
const geod = geodesic.Geodesic.WGS84;

router.get("/one/needcal/nearest-store", async (req, res) => {
  try {
    const { lat, long } = req.query;
console.log(req.query)
    // Validate input
    const latitude = parseFloat(lat);
    const longitude = parseFloat(long);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: "Provide valid latitude and longitude" });
    }

    // Fetch all stores
    const stores = await Store.find();
    if (!stores || stores.length === 0) {
      return res.status(404).json({ error: "No stores found" });
    }

    // Calculate distance for each store
    const storesWithDistance = stores
      .map((store) => {
        if (!store.latitude || !store.longitude) return null;

        const storeLat = store.latitude
        const storeLon = store.longitude
        if (isNaN(storeLat) || isNaN(storeLon)) return null;

        // Use geographiclib-geodesic
        const result = geod.Inverse(latitude, longitude, storeLat, storeLon);
        const distanceMeters = result.s12; // distance in meters

        return { ...store.toObject(), distanceMeters };
      })
      .filter((s) => s !== null);
 
    if (storesWithDistance.length === 0) {
      return res.status(404).json({ error: "No valid stores with location" });
    }

    // Find nearest store
    const nearestStore = storesWithDistance.sort(
      (a, b) => a.distanceMeters - b.distanceMeters
    )[0];

console.log(nearestStore)
    // Threshold = 50m
    const isWithin50m = nearestStore.distanceMeters <= 50;

    res.json({
      nearestStore,
      distance: `${nearestStore.distanceMeters.toFixed(2)} meters`,
      message: isWithin50m
        ? "you are in store!"
        : "ohh! you are outside the store.",
    });
  } catch (error) {
    console.error("Error finding nearest store:", error);
    res.status(500).json({ error: error.message });
  }
}); 















module.exports = router;
