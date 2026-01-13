import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const MyBookings = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [currentBookings, setCurrentBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const getAllBookings = async () => {
    setCurrentBookings([]);
    try {
      setLoading(true);
      const res = await fetch(
        `/api/booking/get-UserCurrentBookings/${currentUser?._id}?searchTerm=${searchTerm}`
      );
      const data = await res.json();
      if (data?.success) {
        // --- UPDATED FILTER: Ensure strictly active bookings are shown ---
        const activeBookings = data?.bookings?.filter(
          (booking) =>
            booking.status === "Booked" || booking.status === "Active"
        );
        setCurrentBookings(activeBookings);
        setLoading(false);
        setError(false);
      } else {
        setLoading(false);
        setError(data?.message);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllBookings();
  }, [searchTerm]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      setLoading(true);
      const res = await fetch(
        `/api/booking/cancel-booking/${id}/${currentUser._id}`,
        {
          method: "POST",
        }
      );
      const data = await res.json();
      if (data?.success) {
        setLoading(false);
        alert(data?.message);
        // Refresh list to remove the cancelled item
        getAllBookings();
      } else {
        setLoading(false);
        alert(data?.message);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-[95%] shadow-xl rounded-lg p-3 flex flex-col gap-2">
        {loading && <h1 className="text-center text-2xl">Loading...</h1>}
        {error && <h1 className="text-center text-2xl">{error}</h1>}
        <div className="w-full border-b-4">
          <input
            className="border rounded-lg p-2 mb-2"
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
          />
        </div>
        {!loading &&
          currentBookings &&
          currentBookings.length === 0 && (
            <p className="text-center p-4">No active bookings found.</p>
          )}

        {!loading &&
          currentBookings &&
          currentBookings.map((booking, i) => {
            return (
              <div
                className="w-full border-y-2 p-4 flex flex-col gap-2 bg-white rounded-lg shadow mb-4"
                key={i}
              >
                <div className="flex items-center gap-3">
                  <Link to={`/package/${booking?.packageDetails?._id}`}>
                    <img
                      className="w-16 h-16 rounded"
                      src={booking?.packageDetails?.packageImages[0]}
                      alt="Package"
                    />
                  </Link>
                  <div>
                    <Link to={`/package/${booking?.packageDetails?._id}`}>
                      <p className="font-bold text-lg hover:underline">
                        {booking?.packageDetails?.packageName}
                      </p>
                    </Link>
                    <p className="text-sm text-gray-600">
                      {booking?.date ? booking.date.substring(0, 10) : ""}
                    </p>
                    {/* Optional: Show Status Badge */}
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {booking.status}
                    </span>
                  </div>
                </div>

                {/* --- SWADESHI IMPACT CARD --- */}
                {booking.villageImpact && (
                  <div className="w-full bg-green-50 border border-green-600 rounded p-3 text-sm mt-2">
                    <p className="font-bold text-green-700">
                      🇮🇳 Swadeshi Impact — {booking.villageImpact.villageName}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <p>🏡 Homestay</p>
                      <p>₹{booking.villageImpact.homestay}</p>

                      <p>🧑‍🌾 Local Guide</p>
                      <p>₹{booking.villageImpact.guide}</p>

                      <p>🍲 Farmers & Food</p>
                      <p>₹{booking.villageImpact.food}</p>

                      <p>🏘 Community Fund</p>
                      <p>₹{booking.villageImpact.community}</p>
                    </div>

                    <p className="mt-2 font-semibold text-green-800 border-t border-green-200 pt-1">
                      Total sent to village: ₹
                      {booking.villageImpact.totalVillageIncome}
                    </p>
                  </div>
                )}

                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => handleCancel(booking._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:opacity-90"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default MyBookings;