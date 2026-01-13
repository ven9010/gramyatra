import React, { useEffect, useState } from "react";

export default function Impact() {
  const [impact, setImpact] = useState(null);

  useEffect(() => {
    // 1. Hit the specific endpoint
    fetch("http://localhost:8000/api/impact/villages")
      .then((res) => res.json())
      .then((data) => {
        // 2. Transform the backend array into the object structure the UI expects
        // Backend returns: [{ village: "Name", totalIncome: 1000, bookings: 5 }]
        
        const stats = {
          villages: data,
          totalBookings: data.reduce((acc, curr) => acc + curr.bookings, 0),
          totalRevenue: data.reduce((acc, curr) => acc + curr.totalIncome, 0),
          totalVillages: data.length,
          totalGuides: data.length // (Proxy metric: assuming 1 guide team per active village)
        };

        setImpact(stats);
      })
      .catch((err) => console.log(err));
  }, []);

  if (!impact) {
    return <p className="text-center mt-10">Loading impact...</p>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-green-700 mb-6">
        🇮🇳 Swadeshi Impact Dashboard
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total Bookings" value={impact.totalBookings} />
        <Stat label="Total Revenue" value={`₹${impact.totalRevenue}`} />
        <Stat label="Villages Supported" value={impact.totalVillages} />
        <Stat label="Active Guide Teams" value={impact.totalGuides} />
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4">
        Village-wise Impact
      </h2>

      <div className="space-y-3">
        {impact.villages.length > 0 ? (
          impact.villages.map((v, index) => (
            <div
              key={index}
              className="border rounded p-4 flex justify-between bg-green-50"
            >
              <div>
                <p className="font-semibold text-lg">{v.village}</p>
                <p className="text-sm text-gray-600">Bookings: {v.bookings}</p>
              </div>
              <p className="font-bold text-green-700 text-xl">
                ₹{v.totalIncome}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No impact data recorded yet.</p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="p-4 bg-white shadow-lg border-t-4 border-green-600 rounded text-center">
      <p className="text-gray-500 text-sm font-semibold">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}
