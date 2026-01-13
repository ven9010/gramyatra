import Booking from "../models/booking.model.js"; 
 
export const getImpactStats = async (req, res) => { 
  try { 
    const bookings = await Booking.find({ paymentStatus: "PAID" }); 
 
    let totalBookings = bookings.length; 
    let totalMoneyMoved = 0; 
    let homestayIncome = 0; 
    let guideIncome = 0; 
    let farmerIncome = 0; 
    let communityFunds = 0; 
 
    const villages = new Set(); 
 
    bookings.forEach((b) => { 
      totalMoneyMoved += b.totalAmount; 
 
      homestayIncome += b.fundBreakdown?.homestay || 0; 
      guideIncome += b.fundBreakdown?.localGuide || 0; 
      farmerIncome += b.fundBreakdown?.foodSuppliers || 0; 
      communityFunds += b.fundBreakdown?.communityFund || 0; 
 
      if (b.villageImpact?.villageName) { 
        villages.add(b.villageImpact.villageName); 
      } 
    }); 
 
    res.json({ 
      success: true, 
      totalBookings, 
      totalMoneyMoved, 
      villagesSupported: villages.size, 
      homestayIncome, 
      guideIncome, 
      farmerIncome, 
      communityFunds, 
    }); 
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ success: false, message: "Impact calculation failed" }); 
  } 
}; 

