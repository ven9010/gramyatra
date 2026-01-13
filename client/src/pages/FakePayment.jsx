import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

export default function FakePayment() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();

  const pkg = state?.package;
  const persons = state?.persons || 1;

  const total = pkg?.packageOffer
    ? pkg.packageDiscountPrice * persons
    : pkg.packagePrice * persons;

  const homestay = Math.floor(total * 0.5);
  const guide = Math.floor(total * 0.25);
  const food = Math.floor(total * 0.15);
  const community = total - homestay - guide - food;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(`/booking/${id}?paid=true`);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-green-50 text-center p-6">
      <h1 className="text-3xl font-bold text-green-700">
        Processing Swadeshi Payment 🇮🇳
      </h1>

      <p className="mt-3 text-lg font-semibold">
        Total: ₹{total}
      </p>

      <div className="mt-6 text-left bg-white p-4 rounded shadow-lg w-full max-w-md">
        <p>🏡 Homestay ({pkg?.homestayType}): ₹{homestay}</p>
        <p>🧑‍🌾 Local Guide ({pkg?.localGuideName}): ₹{guide}</p>
        <p>🍲 Farmers & Food: ₹{food}</p>
        <p>🏘 Community Fund: ₹{community}</p>
      </div>

      <p className="mt-4 text-green-700 font-semibold">
        Supporting {pkg?.localPartnerVillage} & rural livelihoods…
      </p>

      <p className="mt-2 animate-pulse">Finalizing booking…</p>
    </div>
  );
}

