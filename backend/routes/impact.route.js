import express from "express"; 
import mongoose from "mongoose"; 
import Booking from "../models/booking.model.js"; 
 
const router = express.Router(); 
 
// --- 1. GLOBAL VILLAGE IMPACT --- 
router.get("/villages", async (req, res) => { 
  try { 
    const data = await Booking.aggregate([ 
      { 
        // 🚫 Ignore bookings that have no village data 
        $match: { 
          "villageImpact.villageName": { $ne: null } 
        } 
      }, 
      { 
        $group: { 
          _id: "$villageImpact.villageName", 
          totalIncome: { $sum: "$villageImpact.totalVillageIncome" }, 
          bookings: { $sum: 1 } 
        } 
      }, 
      { 
        $project: { 
          village: "$_id", 
          totalIncome: 1, 
          bookings: 1, 
          _id: 0 
        } 
      } 
    ]); 
 
    res.json(data); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
}); 
 
// --- 2. USER SPECIFIC IMPACT --- 
router.get("/user/:userId", async (req, res) => { 
  try { 
    const data = await Booking.aggregate([ 
      { 
        // Filter by the specific user ID 
        $match: { buyer: new mongoose.Types.ObjectId(req.params.userId) } 
      }, 
      { 
        // Sum up their total contribution across all trips 
        $group: { 
          _id: null, 
          totalImpact: { $sum: "$villageImpact.totalVillageIncome" }, 
          trips: { $sum: 1 } 
        } 
      } 
    ]); 
 
    // Return the stats or defaults if no trips found 
    res.json(data[0] || { totalImpact: 0, trips: 0 }); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
}); 
 
export default router; 
