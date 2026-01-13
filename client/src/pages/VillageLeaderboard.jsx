import { useEffect, useState } from "react";

export default function VillageLeaderboard() {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/impact/villages")
      .then((res) => res.json())
      .then((data) => {
        setVillages(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-10">Loading villages…</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-6">
        🏆 Village Leaderboard
      </h1>

      {villages.map((v, i) => (
        <div
          key={i}
          className="flex justify-between items-center p-4 mb-3 rounded shadow bg-green-50"
        >
          <div>
            <p className="font-bold text-lg">
              {i + 1}. {v.village}
            </p>
            <p className="text-sm text-gray-600">
              Bookings: {v.bookings}
            </p>
          </div>

          <p className="text-xl font-bold text-green-700">
            ₹{v.totalIncome}
          </p>
        </div>
      ))}
    </div>
  );
}

