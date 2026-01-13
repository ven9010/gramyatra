import Package from "../models/package.model.js"; 
//import braintree from "braintree"; 
import dotenv from "dotenv"; 
import Booking from "../models/booking.model.js"; 
dotenv.config(); 
 
//payment gateway 
// Braintree disabled for SIH demo 
const gateway = null; 
 
//create package 
export const createPackage = async (req, res) => { 
  try { 
    const { 
      packageName, 
      packageDescription, 
      packageDestination, 
      packageDays, 
      packageNights, 
      packageAccommodation, 
      packageTransportation, 
      packageMeals, 
      packageActivities, 
      packagePrice, 
      packageDiscountPrice, 
      packageOffer, 
      packageImages, 
    } = req.body; 
 
    if ( 
      !packageName || 
      !packageDescription || 
      !packageDestination || 
      !packageAccommodation || 
      !packageTransportation || 
      !packageMeals || 
      !packageActivities || 
      !packageOffer === "" || 
      !packageImages 
    ) { 
      return res.status(200).send({ 
        success: false, 
        message: "All fields are required!", 
      }); 
    } 
    if (packagePrice < packageDiscountPrice) { 
      return res.status(200).send({ 
        success: false, 
        message: "Regular price should be greater than discount price!", 
      }); 
    } 
    if (packagePrice <= 0 || packageDiscountPrice < 0) { 
      return res.status(200).send({ 
        success: false, 
        message: "Price should be greater than 0!", 
      }); 
    } 
    if (packageDays <= 0 && packageNights <= 0) { 
      return res.status(200).send({ 
        success: false, 
        message: "Provide days and nights!", 
      }); 
    } 
 
    const newPackage = await Package.create(req.body); 
    if (newPackage) { 
      return res.status(201).send({ 
        success: true, 
        message: "Package created successfully", 
      }); 
    } else { 
      return res.status(500).send({ 
        success: false, 
        message: "Soemthing went wrong", 
      }); 
    } 
  } catch (error) { 
    console.log(error); 
  } 
}; 
 
//get all packages 
export const getPackages = async (req, res) => { 
  try { 
    const searchTerm = req.query.searchTerm || ""; 
    const limit = parseInt(req.query.limit) || 9; 
    const startIndex = parseInt(req.query.startIndex) || 0; 
 
    // --- NEW FILTERS ADDED HERE --- 
    const village = req.query.village; 
    const govt = req.query.govt; 
    const eco = req.query.eco; 
    const homestay = req.query.homestay; 
 
    const sort = req.query.sort || "createdAt"; 
    const order = req.query.order || "desc"; 
 
    // --- NEW QUERY LOGIC START --- 
    const query = { 
      $or: [ 
        { packageName: { $regex: searchTerm, $options: "i" } }, 
        { packageDestination: { $regex: searchTerm, $options: "i" } }, 
        { localPartnerVillage: { $regex: searchTerm, $options: "i" } }, 
      ], 
    }; 
 
    if (govt === "true") query.isGovernmentListed = true; 
    if (eco === "true") query.ecoRating = { $gte: 4 }; // Eco rating 4 or higher 
    if (homestay === "true") query.homestayType = "Homestay"; 
    if (village) query.localPartnerVillage = village; 
    // --- NEW QUERY LOGIC END --- 
 
    const packages = await Package.find(query) 
      .sort({ [sort]: order }) 
      .limit(limit) 
      .skip(startIndex); 
 
    if (packages) { 
      return res.status(200).send({ 
        success: true, 
        packages, 
      }); 
    } else { 
      return res.status(500).send({ 
        success: false, 
        message: "No Packages yet", 
      }); 
    } 
  } catch (error) { 
    console.log(error); 
  } 
}; 
 
//get package data 
export const getPackageData = async (req, res) => { 
  try { 
    const packageData = await Package.findById(req?.params?.id); 
    if (!packageData) { 
      return res.status(404).send({ 
        success: false, 
        message: "Package not found!", 
      }); 
    } 
    return res.status(200).send({ 
      success: true, 
      packageData, 
    }); 
  } catch (error) { 
    console.log(error); 
  } 
}; 
 
//update package 
export const updatePackage = async (req, res) => { 
  try { 
    const findPackage = await Package.findById(req.params.id); 
    if (!findPackage) 
      return res.status(404).send({ 
        success: false, 
        message: "Package not found!", 
      }); 
 
    const updatedPackage = await Package.findByIdAndUpdate( 
      req.params.id, 
      req.body, 
      { new: true } 
    ); 
    res.status(200).send({ 
      success: true, 
      message: "Package updated successfully!", 
      updatedPackage, 
    }); 
  } catch (error) { 
    console.log(error); 
  } 
}; 
 
//delete package 
export const deletePackage = async (req, res) => { 
  try { 
    const deletePackage = await Package.findByIdAndDelete(req?.params?.id); 
    return res.status(200).send({ 
      success: true, 
      message: "Package Deleted!", 
    }); 
  } catch (error) { 
    console.log(error); 
  } 
}; 
 
//payment gateway api 
//token 
export const braintreeTokenController = async (req, res) => { 
  res.send({ 
    success: true, 
    token: "SIH-DEMO-TOKEN", 
  }); 
}; 
