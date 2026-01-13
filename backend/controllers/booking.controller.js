import Booking from "../models/booking.model.js";
import Package from "../models/package.model.js";
import { ObjectId } from "mongodb";

// --- CREATE BOOKING WITH SWADESHI IMPACT LOGIC ---
export const bookPackage = async (req, res) => {
  try {
    // 1. Fetch Package (Correct ID from params)
    const pkg = await Package.findById(req.params.packageId);

    // Safety Guard
    if (!pkg) {
      return res.status(404).json({ success: false, message: "Package Not Found!" });
    }

    // 2. Get Total & Calculate Splits (Swadeshi Economics)
    const total = req.body.totalPrice;

    // Impact Split: 50% Homestay | 25% Guide | 15% Food | 10% Community
    const homestay = Math.floor(total * 0.5);
    const guide = Math.floor(total * 0.25);
    const food = Math.floor(total * 0.15);
    const community = total - homestay - guide - food;

    // 3. Create Booking with Impact Snapshot
    const booking = await Booking.create({
      ...req.body,

      // 🔥 CRITICAL UPDATE: Reverted to 'date'
      date: new Date(req.body.date),

      // ✅ Added Currency Explicitly
      currency: "INR",

      // ----------------------------------------------------
      // ✅ UPDATE: Separated Lifecycle Status vs Payment Status
      // ----------------------------------------------------
      status: "Booked",         // Lifecycle: Booked -> Completed -> Cancelled
      paymentStatus: "Paid",    // Payment:   Pending -> Paid -> Refunded
      
      packageDetails: pkg._id,

      // Store the calculated impact data permanently
      villageImpact: {
        villageName: pkg.localPartnerVillage,
        localGuide: pkg.localGuideName,     // Capture guide name
        homestayType: pkg.homestayType,     // Capture stay type
        homestay: homestay,                 // 50%
        guide: guide,                       // 25%
        food: food,                         // 15%
        community: community,               // 10%
        totalVillageIncome: total
      }
    });

    // 4. Update Village Earnings (For Leaderboard)
    // The village earns the TOTAL amount (Homestay + Guide + Food + Community)
    await Package.findByIdAndUpdate(pkg._id, {
      $inc: { totalVillageEarnings: total }
    });

    res.status(201).send({
      success: true,
      message: "Package Booked & Swadeshi Funds Distributed!",
      booking
    });

  } catch (error) {
    console.error("Error in bookPackage:", error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

// --- ADMIN: GET CURRENT (ACTIVE) BOOKINGS ---
export const getCurrentBookings = async (req, res) => {
  try {
    // 🔥 AUTO-COMPLETE OLD TRIPS (Admin View)
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    // ✅ FIXED: Using 'date' instead of 'travelDate'
    await Booking.updateMany(
      { date: { $lt: today }, status: "Booked" },
      { $set: { status: "Completed" } }
    );

    const searchTerm = req?.query?.searchTerm || "";

    // ✅ FIX: Filter by STATUS: "Booked" (Active)
    const bookings = await Booking.find({
      status: "Booked",
    })
      .populate("packageDetails")
      .populate({
        path: "buyer",
        match: {
          $or: [
            { username: { $regex: searchTerm, $options: "i" } },
            { email: { $regex: searchTerm, $options: "i" } },
          ],
        },
      })
      .sort({ createdAt: "asc" });

    // Filter out bookings where 'buyer' didn't match the search criteria
    const filteredBookings = bookings.filter((b) => b.buyer !== null);

    return res.status(200).send({
      success: filteredBookings.length > 0,
      bookings: filteredBookings,
      message: filteredBookings.length > 0 ? "" : "No Bookings Available",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

// --- ADMIN: GET ALL BOOKINGS (Archive) ---
export const getAllBookings = async (req, res) => {
  try {
    // 🔥 AUTO-COMPLETE OLD TRIPS
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    // ✅ FIXED: Using 'date' instead of 'travelDate'
    await Booking.updateMany(
      { date: { $lt: today }, status: "Booked" },
      { $set: { status: "Completed" } }
    );

    const searchTerm = req?.query?.searchTerm || "";
    const bookings = await Booking.find({})
      .populate("packageDetails")
      .populate({
        path: "buyer",
        match: {
          $or: [
            { username: { $regex: searchTerm, $options: "i" } },
            { email: { $regex: searchTerm, $options: "i" } },
          ],
        },
      })
      .sort({ createdAt: "asc" });

    const filteredBookings = bookings.filter((b) => b.buyer !== null);

    return res.status(200).send({
      success: filteredBookings.length > 0,
      bookings: filteredBookings,
      message: filteredBookings.length > 0 ? "" : "No Bookings Available",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

// --- USER: GET THEIR CURRENT (ACTIVE) BOOKINGS ---
export const getUserCurrentBookings = async (req, res) => {
  try {
    if (req?.user?.id !== req?.params?.id) {
      return res.status(401).send({
        success: false,
        message: "You can only get your own bookings!!",
      });
    }

    // 🔥 AUTO-COMPLETE OLD TRIPS
    // Runs every time user checks their active bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    // ✅ FIXED: Using 'date' instead of 'travelDate'
    await Booking.updateMany(
      { date: { $lt: today }, status: "Booked" },
      { $set: { status: "Completed" } }
    );

    const searchTerm = req?.query?.searchTerm || "";

    // ✅ FIX: Filter by STATUS: "Booked"
    const bookings = await Booking.find({
      buyer: new ObjectId(req?.params?.id),
      status: "Booked", 
    })
      .populate({
        path: "packageDetails",
        match: {
          packageName: { $regex: searchTerm, $options: "i" },
        },
      })
      .populate("buyer", "username email")
      .sort({ createdAt: "asc" });

    const filteredBookings = bookings.filter((b) => b.packageDetails !== null);

    return res.status(200).send({
      success: filteredBookings.length > 0,
      bookings: filteredBookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

// --- USER: GET HISTORY (COMPLETED / CANCELLED) ---
export const getAllUserBookings = async (req, res) => {
  try {
    if (req?.user?.id !== req?.params?.id) {
      return res.status(401).send({
        success: false,
        message: "You can only get your own bookings!!",
      });
    }

    // 🔥 AUTO-COMPLETE OLD TRIPS
    // Runs every time user checks their history
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    // ✅ FIXED: Using 'date' instead of 'travelDate'
    await Booking.updateMany(
      { date: { $lt: today }, status: "Booked" },
      { $set: { status: "Completed" } }
    );

    const searchTerm = req?.query?.searchTerm || "";

    // ✅ FIX: Filter OUT "Booked" status (Show Completed/Cancelled)
    const bookings = await Booking.find({
      buyer: new ObjectId(req?.params?.id),
      status: { $ne: "Booked" }, 
    })
      .populate({
        path: "packageDetails",
        match: {
          packageName: { $regex: searchTerm, $options: "i" },
        },
      })
      .populate("buyer", "username email")
      .sort({ createdAt: "asc" });

    const filteredBookings = bookings.filter((b) => b.packageDetails !== null);

    return res.status(200).send({
      success: filteredBookings.length > 0,
      bookings: filteredBookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

// --- DELETE BOOKING HISTORY ---
export const deleteBookingHistory = async (req, res) => {
  try {
    if (req?.user?.id !== req?.params?.userId) {
      return res.status(401).send({
        success: false,
        message: "You can only delete your booking history!",
      });
    }
    const deleteHistory = await Booking.findByIdAndDelete(req?.params?.id);
    if (deleteHistory) {
      return res.status(200).send({
        success: true,
        message: "Booking History Deleted!",
      });
    } else {
      return res.status(404).send({
        success: false,
        message: "Booking not found!",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

// --- CANCEL BOOKING ---
export const cancelBooking = async (req, res) => {
  try {
    if (req.user.id !== req?.params?.userId) {
      return res.status(401).send({
        success: false,
        message: "You can only cancel your bookings!",
      });
    }
    // ✅ FIXED: Using Title Case "Refunded" to match schema Enum
    const cancBooking = await Booking.findByIdAndUpdate(
      req?.params?.id,
      { paymentStatus: "Refunded", status: "Cancelled" },
      { new: true }
    );
    if (cancBooking) {
      return res.status(200).send({
        success: true,
        message: "Booking Cancelled!",
      });
    } else {
      return res.status(404).send({
        success: false,
        message: "Booking not found!",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};