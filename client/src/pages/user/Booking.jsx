import React, { useEffect, useState } from "react";
import { FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
// Removed useLocation from imports
import { useNavigate, useParams } from "react-router-dom";

const Booking = () => {
  const { currentUser } = useSelector((state) => state.user);
  const params = useParams();
  const navigate = useNavigate();

  // DELETED: const location = useLocation();
  // DELETED: const isPaid = ...

  const [packageData, setPackageData] = useState({
    packageName: "",
    packageDestination: "",
    packageDays: 1,
    packageNights: 1,
    packagePrice: 0,
    packageDiscountPrice: 0,
    packageOffer: false,
    packageImages: [],
  });

  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [bookingData, setBookingData] = useState({
    persons: 1,
    date: "",
    totalPrice: 0,
    buyer: "",
    packageDetails: "",
  });

  const getPackageData = async () => {
    try {
      const res = await fetch(
        `/api/package/get-package-data/${params?.packageId}`
      );
      const data = await res.json();
      if (data?.success) {
        setPackageData(data.packageData);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleBookPackage = async () => {
    if (
      bookingData.packageDetails === "" ||
      bookingData.buyer === "" ||
      bookingData.totalPrice <= 0 ||
      bookingData.persons <= 0 ||
      bookingData.date === ""
    ) {
      alert("All fields are required!");
      return;
    }

    try {
      setLoading(true);
      // Ensure we hit the correct endpoint with the ID param
      const res = await fetch(
        `/api/booking/book-package/${params.packageId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        }
      );

      const data = await res.json();
      if (data?.success) {
        setLoading(false);
        alert(data?.message);
        // --- UPDATED NAVIGATION ---
        navigate("/profile/user");
      } else {
        setLoading(false);
        alert(data?.message);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  // --- REPLACED: Direct window check for payment ---
  useEffect(() => {
    if (!params.packageId) return;

    // Check query params directly from window object
    const paid = new URLSearchParams(window.location.search).get("paid");

    if (paid !== "true") {
      navigate(`/pay/${params.packageId}`);
      return;
    }

    getPackageData();
    setCurrentDate(new Date().toISOString().substring(0, 10));
  }, [params.packageId]);

  // --- FIX 2: STALE STATE PREVENTION (Unchanged) ---
  useEffect(() => {
    if (packageData && params?.packageId) {
      const price = packageData.packageDiscountPrice
        ? packageData.packageDiscountPrice
        : packageData.packagePrice;

      // Use functional update to guarantee 'prev' state is fresh
      setBookingData((prev) => ({
        ...prev,
        packageDetails: params.packageId,
        buyer: currentUser?._id,
        totalPrice: price * prev.persons,
      }));
    }
  }, [packageData, bookingData.persons]); // 'persons' triggers the recalc

  return (
    <div className="w-full flex justify-center">
      <div className="w-[90%] p-6 shadow-xl rounded">
        <h1 className="text-2xl font-bold mb-4">Book Package</h1>

        <div className="flex gap-4 items-center">
          <img
            src={packageData.packageImages[0]}
            className="w-40 rounded"
            alt="Package"
          />
          <div>
            <h2 className="text-xl font-semibold">{packageData.packageName}</h2>
            <p className="text-green-700 flex items-center gap-2">
              <FaMapMarkerAlt /> {packageData.packageDestination}
            </p>
            <p className="flex gap-2">
              <FaClock />
              {packageData.packageDays} Days - {packageData.packageNights}{" "}
              Nights
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label>Select Date</label>
          <input
            type="date"
            min={currentDate}
            className="border ml-2"
            onChange={(e) =>
              setBookingData({ ...bookingData, date: e.target.value })
            }
          />
        </div>

        <div className="mt-4 flex gap-3 items-center">
          <button
            className="px-2 border bg-gray-200"
            onClick={() =>
              bookingData.persons > 1 &&
              setBookingData((prev) => ({
                ...prev,
                persons: prev.persons - 1,
              }))
            }
          >
            -
          </button>
          <span>{bookingData.persons}</span>
          <button
            className="px-2 border bg-gray-200"
            onClick={() =>
              setBookingData((prev) => ({
                ...prev,
                persons: prev.persons + 1,
              }))
            }
          >
            +
          </button>
        </div>

        <p className="mt-4 text-xl mb-4">Total: ₹{bookingData.totalPrice}</p>

        <button
          onClick={handleBookPackage}
          className="p-3 bg-green-700 text-white rounded w-full"
          disabled={loading}
        >
          {loading ? "Processing..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
};

export default Booking;
