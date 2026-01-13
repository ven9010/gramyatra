import React, { useCallback, useEffect, useState } from "react";
import "./styles/Home.css";
import { FaCalendar, FaSearch, FaStar } from "react-icons/fa";
import { FaRankingStar } from "react-icons/fa6";
import { LuBadgePercent } from "react-icons/lu";
import PackageCard from "./PackageCard";
import { useNavigate } from "react-router";

const Home = () => {
  const navigate = useNavigate();
  const [topPackages, setTopPackages] = useState([]);
  const [latestPackages, setLatestPackages] = useState([]);
  const [offerPackages, setOfferPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const getTopPackages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "/api/package/get-packages?sort=packageRating&limit=8"
      );
      const data = await res.json();
      if (data?.success) {
        setTopPackages(data?.packages);
        setLoading(false);
      } else {
        setLoading(false);
        alert(data?.message || "Something went wrong!");
      }
    } catch (error) {
      console.log(error);
    }
  }, [topPackages]);

  const getLatestPackages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "/api/package/get-packages?sort=createdAt&limit=8"
      );
      const data = await res.json();
      if (data?.success) {
        setLatestPackages(data?.packages);
        setLoading(false);
      } else {
        setLoading(false);
        alert(data?.message || "Something went wrong!");
      }
    } catch (error) {
      console.log(error);
    }
  }, [latestPackages]);

  const getOfferPackages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "/api/package/get-packages?sort=createdAt&offer=true&limit=6"
      );
      const data = await res.json();
      if (data?.success) {
        setOfferPackages(data?.packages);
        setLoading(false);
      } else {
        setLoading(false);
        alert(data?.message || "Something went wrong!");
      }
    } catch (error) {
      console.log(error);
    }
  }, [offerPackages]);

  useEffect(() => {
    getTopPackages();
    getLatestPackages();
    getOfferPackages();
  }, []);

  return (
    <div className="main w-full">
      <div className="w-full flex flex-col">
        <div className="backaground_image w-full"></div>
        <div className="top-part w-full gap-2 flex flex-col">
          {/* --- BRANDING UPDATE 1: TITLE --- */}
          <h1 className="text-white text-4xl text-center font-bold underline mb-2">
            Gramyatra
          </h1>
          
          {/* --- BRANDING UPDATE 2: SUBTITLE --- */}
          <h1 className="text-white text-sm text-center xsm:text-lg font-semibold">
            India’s Village-First Travel Network 🇮🇳
          </h1>
          
          {/* --- BRANDING UPDATE 6: MISSION TEXT --- */}
          <p className="text-white text-center text-sm opacity-90 mt-1 font-light">
            Every booking supports Indian villages, homestays & local guides
          </p>

          <div className="w-full flex justify-center items-center gap-2 mt-8">
            {/* --- BRANDING UPDATE 3: PLACEHOLDER --- */}
            <input
              type="text"
              className="rounded-lg outline-none w-[230px] sm:w-2/5 p-2 border border-black bg-opacity-40 bg-white text-white placeholder:text-white font-semibold"
              placeholder="Search villages, homestays or destinations"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
            <button
              onClick={() => {
                navigate(`/search?searchTerm=${search}`);
              }}
              className="bg-white w-10 h-10 flex justify-center items-center text-xl font-semibold rounded-full hover:scale-95"
            >
              Go
            </button>
          </div>
          
          {/* --- BRANDING UPDATE 4: FILTER BUTTONS --- */}
          <div className="w-[90%] max-w-xl flex justify-center mt-10">
            <button
              onClick={() => {
                navigate("/search?offer=true");
              }}
              className="flex items-center justify-around gap-x-1 bg-slate-400 text-white p-2 py-1 text-[8px] xxsm:text-sm sm:text-lg border-e border-white rounded-s-full flex-1 hover:scale-105 transition-all duration-150"
            >
              Local Deals
              <LuBadgePercent className="text-2xl" />
            </button>
            <button
              onClick={() => {
                navigate("/search?sort=packageRating");
              }}
              className="flex items-center justify-around gap-x-1 bg-slate-400 text-white p-2 py-1 text-[8px] xxsm:text-sm sm:text-lg border-x border-white flex-1 hover:scale-105 transition-all duration-150"
            >
              Most Loved
              <FaStar className="text-2xl" />
            </button>
            <button
              onClick={() => {
                navigate("/search?sort=createdAt");
              }}
              className="flex items-center justify-around gap-x-1 bg-slate-400 text-white p-2 py-1 text-[8px] xxsm:text-sm sm:text-lg border-x border-white flex-1 hover:scale-105 transition-all duration-150"
            >
              New Villages
              <FaCalendar className="text-lg" />
            </button>
            <button
              onClick={() => {
                navigate("/search?sort=packageTotalRatings");
              }}
              className="flex items-center justify-around gap-x-1 bg-slate-400 text-white p-2 py-1 text-[8px] xxsm:text-sm sm:text-lg border-s border-white rounded-e-full flex-1 hover:scale-105 transition-all duration-150"
            >
              Trending
              <FaRankingStar className="text-2xl" />
            </button>
          </div>
        </div>

        {/* main page */}
        <div className="main p-6 flex flex-col gap-5">
          {loading && <h1 className="text-center text-2xl">Loading...</h1>}
          {!loading &&
            topPackages.length === 0 &&
            latestPackages.length === 0 &&
            offerPackages.length === 0 && (
              <h1 className="text-center text-2xl">No Packages Yet!</h1>
            )}
            
          {/* --- BRANDING UPDATE 5: SECTION HEADERS --- */}
          
          {/* Top Rated */}
          {!loading && topPackages.length > 0 && (
            <>
              <h1 className="text-2xl font-semibold">Most Loved Stays</h1>
              <div className="grid 2xl:grid-cols-5 xlplus:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-2 my-3">
                {topPackages.map((packageData, i) => {
                  return <PackageCard key={i} packageData={packageData} />;
                })}
              </div>
            </>
          )}

          {/* Latest */}
          {!loading && latestPackages.length > 0 && (
            <>
              <h1 className="text-2xl font-semibold">Newly Onboarded Villages</h1>
              <div className="grid 2xl:grid-cols-5 xlplus:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-2 my-3">
                {latestPackages.map((packageData, i) => {
                  return <PackageCard key={i} packageData={packageData} />;
                })}
              </div>
            </>
          )}

          {/* Offers */}
          {!loading && offerPackages.length > 0 && (
            <>
              <div className="offers_img"></div>
              <h1 className="text-2xl font-semibold">Local Discounts</h1>
              <div className="grid 2xl:grid-cols-5 xlplus:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-2 my-3">
                {offerPackages.map((packageData, i) => {
                  return <PackageCard key={i} packageData={packageData} />;
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
