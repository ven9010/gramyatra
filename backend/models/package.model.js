import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    packageName: {
      type: String,
      required: true,
    },
    packageDescription: {
      type: String,
      required: true,
    },
    packageDestination: {
      type: String,
      required: true,
    },
    packageDays: {
      type: Number,
      required: true,
    },
    packageNights: {
      type: Number,
      required: true,
    },
    packageAccommodation: {
      type: String,
      required: true,
    },
    packageTransportation: {
      type: String,
      required: true,
    },
    packageMeals: {
      type: String,
      required: true,
    },
    packageActivities: {
      type: String,
      required: true,
    },
    
    // --- PRICE & CURRENCY ---
    packagePrice: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },

    localGuideName: {
      type: String,
      default: "",
    },

    localPartnerVillage: {
      type: String,
      default: "",
    },

    // --- NEW FIELD: VILLAGE IMPACT TRACKER ---
    totalVillageEarnings: {
      type: Number,
      default: 0,
    },

    homestayType: {
      type: String,
      enum: ["Homestay", "Farmstay", "Mud House", "Eco Lodge", "Standard Hotel"],
      default: "Homestay",
    },

    isGovernmentListed: {
      type: Boolean,
      default: false,
    },

    supportsLocalEconomy: {
      type: Boolean,
      default: true,
    },

    ecoRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },

    culturalTags: {
      type: [String], // ["Pottery", "Folk Dance", "Organic Farming"]
      default: [],
    },

    packageDiscountPrice: {
      type: Number,
      required: true,
    },
    packageOffer: {
      type: Boolean,
      required: true,
    },
    packageRating: {
      type: Number,
      default: 0,
    },
    packageTotalRatings: {
      type: Number,
      default: 0,
    },
    packageImages: {
      type: Array,
      required: true,
    },
  },
  { timestamps: true }
);

const Package = mongoose.model("Package", packageSchema);

export default Package;