import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Chart from "../components/Chart";

const AllBookings = () => {
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
        `/api/booking/get-currentBookings?searchTerm=${searchTerm}`
      );
      const data = await res.json();
      if (data?.success) {
        setCurrentBookings(data?.bookings);
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
    <div className="w-full flex justify-center py-5">
      <div className="w-[95%] lg:w-[80%] shadow-xl rounded-lg p-5 flex flex-col gap-4 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800">
          Booking Control Room
        </h2>

        {loading && (
          <h1 className="text-center text-xl animate-pulse">Loading...</h1>
        )}
        {error && <h1 className="text-center text-red-600 text-xl">{error}</h1>}

        <div className="w-full border-b-2 pb-5 flex flex-col gap-4">
          <input
            className="border border-gray-300 rounded-lg p-3 max-w-md focus:outline-green-500"
            type="text"
            placeholder="Search Username or Email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {currentBookings.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="font-semibold mb-2 text-gray-700">
                Booking Analytics
              </p>
              <Chart data={currentBookings} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {!loading &&
            currentBookings &&
            currentBookings.map((booking, i) => (
              <div
                className="w-full border-y-2 p-3 flex flex-wrap gap-4 justify-between items-center bg-green-50 rounded"
                key={i}
              >
                <div className="flex items-center gap-3">
                  <img
                    className="w-12 h-12 rounded"
                    src={booking?.packageDetails?.packageImages[0]}
                    alt=""
                  />
                  <div>
                    <p className="font-semibold">
                      {booking?.packageDetails?.packageName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {booking?.buyer?.username} — {booking?.buyer?.email}
                    </p>
                  </div>
                </div>

                <div className="text-sm">
                  <p>
                    <b>Village:</b>{" "}
                    {booking?.packageDetails?.localPartnerVillage}
                  </p>
                  <p>
                    <b>Guide:</b> {booking?.packageDetails?.localGuideName}
                  </p>
                  <p>
                    <b>Stay:</b> {booking?.packageDetails?.homestayType}
                  </p>
                </div>

                <div className="text-sm">
                  <p>
                    <b>Eco Rating:</b> {booking?.packageDetails?.ecoRating} 🌿
                  </p>
                  <p>
                    <b>Govt Listed:</b>{" "}
                    {booking?.packageDetails?.isGovernmentListed ? "Yes" : "No"}
                  </p>
                  <p>
                    <b>Local Economy:</b>{" "}
                    {booking?.packageDetails?.supportsLocalEconomy
                      ? "Yes"
                      : "No"}
                  </p>
                </div>

                {/* --- PRICE & IMPACT BREAKDOWN (FIXED) --- */}
                <div className="flex flex-col">
                  <div className="font-semibold text-green-700 text-lg">
                    ₹{booking?.totalPrice}
                  </div>
                  <div className="text-xs text-green-700 mt-1">
                    <p>🏡 Homestay: ₹{booking?.villageImpact?.homestay}</p>
                    <p>🧑‍🌾 Guide: ₹{booking?.villageImpact?.guide}</p>
                    <p>🍲 Food: ₹{booking?.villageImpact?.food}</p>
                    <p>🏘 Community: ₹{booking?.villageImpact?.community}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleCancel(booking._id)}
                  className="p-2 rounded bg-red-600 text-white hover:opacity-95"
                >
                  Cancel
                </button>
              </div>
            ))}
        </div>

        {!loading && currentBookings.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            No active bookings found.
          </p>
        )}
      </div>
    </div>
  );
};

export default AllBookings;