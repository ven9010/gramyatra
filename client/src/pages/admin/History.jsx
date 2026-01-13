import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const History = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  const getAllBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/booking/get-allBookings?searchTerm=${search}`
      );
      const data = await res.json();
      if (data?.success) {
        // --- UPDATED LOGIC: Filter specifically for Admin History ---
        // Rule: Show ONLY "Completed" or "Cancelled"
        const adminHistory = data?.bookings?.filter(
          (b) => b.status === "Completed" || b.status === "Cancelled"
        );
        setAllBookings(adminHistory);
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
  }, [search]);

  const handleHistoryDelete = async (id) => {
    if (!window.confirm("Permanently delete this record?")) return;

    try {
      setLoading(true);
      const res = await fetch(
        `/api/booking/delete-booking-history/${id}/${currentUser._id}`,
        {
          method: "DELETE",
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
    <div className="w-full flex justify-center">
      <div className="w-[95%] shadow-xl rounded-lg p-3 flex flex-col gap-2">
        <h1 className="text-center text-2xl">All User History (Admin)</h1>
        {loading && <h1 className="text-center text-2xl">Loading...</h1>}
        {error && <h1 className="text-center text-2xl">{error}</h1>}
        <div className="w-full border-b-4">
          <input
            className="border rounded-lg p-2 mb-2"
            type="text"
            placeholder="Search Username or Email"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
        </div>
        {!loading &&
          allBookings &&
          allBookings.length === 0 && (
            <p className="text-center p-4">No completed or cancelled bookings found.</p>
          )}

        {!loading &&
          allBookings &&
          allBookings.map((booking, i) => {
            return (
              <div
                className="w-full border-y-2 p-3 flex flex-wrap overflow-auto gap-3 items-center justify-between"
                key={i}
              >
                <Link to={`/package/${booking?.packageDetails?._id}`}>
                  <img
                    className="w-12 h-12 rounded"
                    src={booking?.packageDetails?.packageImages[0]}
                    alt="Package Image"
                  />
                </Link>
                <Link to={`/package/${booking?.packageDetails?._id}`}>
                  <p className="hover:underline font-semibold">
                    {booking?.packageDetails?.packageName}
                  </p>
                </Link>
                
                <div className="text-sm">
                  <p className="font-medium">{booking?.buyer?.username}</p>
                  <p className="text-gray-500">{booking?.buyer?.email}</p>
                </div>

                <p>{booking?.date ? booking.date.substring(0, 10) : ""}</p>
                
                {/* Status Badge */}
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    booking.status === "Cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {booking.status}
                </span>

                {/* Delete button is always available because the list is pre-filtered */}
                <button
                  onClick={() => {
                    handleHistoryDelete(booking._id);
                  }}
                  className="p-2 rounded bg-red-600 text-white hover:opacity-95 text-sm"
                >
                  Delete
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default History;