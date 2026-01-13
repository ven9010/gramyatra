import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    packageDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },

    // 🚨 FIX: Standardized to 'date' (Removed 'travelDate')
    date: {
      type: Date,
      required: true,
    },

    persons: {
      type: Number,
      default: 1,
    },

    // --- PRICE & CURRENCY ---
    totalPrice: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },

    // --- LIFECYCLE STATUS ---
    status: {
      type: String,
      enum: ["Booked", "Completed", "Cancelled"],
      default: "Booked",
    },

    // --- SWADESHI IMPACT SNAPSHOT ---
    villageImpact: {
      villageName: String,
      localGuide: String,     // Name of the guide
      homestayType: String,   // Type of stay (e.g., "Mud House")
      homestay: Number,       // Income to family
      guide: Number,          // Income to guide
      food: Number,           // Income to organic farmers
      community: Number,      // Income to village fund
      totalVillageIncome: Number
    },

    // --- PAYMENT STATUS ---
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded"],
      default: "Paid",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;