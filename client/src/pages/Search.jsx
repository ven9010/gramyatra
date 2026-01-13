import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PackageCard from "./PackageCard";

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 🔧 FIX 1: Default sort to "createdAt" (matching MongoDB), not "created_at"
  const [sideBarSearchData, setSideBarSearchData] = useState({
    searchTerm: "",
    offer: false,
    sort: "createdAt", 
    order: "desc",
  });
  
  const [filters, setFilters] = useState({
    ecoFriendly: false,
    govtListed: false,
    homestay: false,
  });

  const [loading, setLoading] = useState(false);
  const [allPackages, setAllPackages] = useState([]);
  const [showMoreBtn, setShowMoreBtn] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    const offerFromUrl = urlParams.get("offer");
    const sortFromUrl = urlParams.get("sort");
    const orderFromUrl = urlParams.get("order");

    if (searchTermFromUrl || offerFromUrl || sortFromUrl || orderFromUrl) {
      setSideBarSearchData({
        searchTerm: searchTermFromUrl || "",
        offer: offerFromUrl === "true" ? true : false,
        // 🔧 FIX 1: Ensure fallback uses correct casing
        sort: sortFromUrl || "createdAt",
        order: orderFromUrl || "desc",
      });
    }

    const fetchAllPackages = async () => {
      setLoading(true);
      setShowMoreBtn(false);
      try {
        const searchQuery = urlParams.toString();
        
        // We still send params to backend for optimization, 
        // but frontend will do the hard filtering.
        const res = await fetch(
          `/api/package/get-packages?${searchQuery}&eco=${filters.ecoFriendly}&govt=${filters.govtListed}&homestay=${filters.homestay}`
        );
        
        const data = await res.json();
        setLoading(false);
        setAllPackages(data?.packages);
        if (data?.packages?.length > 8) {
          setShowMoreBtn(true);
        } else {
          setShowMoreBtn(false);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllPackages();
  }, [location.search, filters]); 

  const handleChange = (e) => {
    if (e.target.id === "searchTerm") {
      setSideBarSearchData({
        ...sideBarSearchData,
        searchTerm: e.target.value,
      });
    }
    if (e.target.id === "offer") {
      setSideBarSearchData({
        ...sideBarSearchData,
        [e.target.id]:
          e.target.checked || e.target.checked === "true" ? true : false,
      });
    }
    if (e.target.id === "sort_order") {
      const sort = e.target.value.split("_")[0] || "createdAt";
      const order = e.target.value.split("_")[1] || "desc";
      setSideBarSearchData({ ...sideBarSearchData, sort, order });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    urlParams.set("searchTerm", sideBarSearchData.searchTerm);
    urlParams.set("offer", sideBarSearchData.offer);
    urlParams.set("sort", sideBarSearchData.sort);
    urlParams.set("order", sideBarSearchData.order);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const onShowMoreSClick = async () => {
    const numberOfPackages = allPackages.length;
    const startIndex = numberOfPackages;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("startIndex", startIndex);
    const searchQuery = urlParams.toString();
    
    const res = await fetch(
      `/api/package/get-packages?${searchQuery}&eco=${filters.ecoFriendly}&govt=${filters.govtListed}&homestay=${filters.homestay}`
    );
    const data = await res.json();
    if (data?.packages?.length < 9) {
      setShowMoreBtn(false);
    }
    setAllPackages([...allPackages, ...data?.packages]);
  };

  // --- 🔧 ROBUST CLIENT-SIDE FILTERING ---
  const filteredPackages = allPackages.filter((pkg) => {
    // 1. Offer filter
    if (sideBarSearchData.offer && !pkg.packageOffer) return false;

    // 2. 🔧 FIX 2: Eco Friendly Safety Check (handle undefined)
    if (filters.ecoFriendly && (pkg.ecoRating || 0) < 4) return false;

    // 3. Govt Listed
    if (filters.govtListed && !pkg.isGovernmentListed) return false;

    // 4. 🔧 FIX 3: Homestay Normalization (case-insensitive)
    if (
      filters.homestay &&
      pkg.homestayType?.toLowerCase() !== "homestay"
    )
      return false;

    return true;
  });

  return (
    <div className="flex flex-col md:flex-row">
      <div className="p-7 border-b-2 md:border-r-2 md:min-h-screen">
        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap font-semibold">Search:</label>
            <input
              type="text"
              id="searchTerm"
              placeholder="Search"
              className="border rounded-lg p-3 w-full"
              value={sideBarSearchData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <label className="font-semibold">Type:</label>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="offer"
                className="w-5"
                checked={sideBarSearchData.offer}
                onChange={handleChange}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold">Sort:</label>
            <select
              onChange={handleChange}
              defaultValue={"createdAt_desc"} // Matched to option value
              id="sort_order"
              className="p-3 border rounded-lg"
            >
              <option value="packagePrice_desc">Price high to low</option>
              <option value="packagePrice_asc">Price low to high</option>
              <option value="packageRating_desc">Top Rated</option>
              <option value="packageTotalRatings_desc">Most Rated</option>
              <option value="createdAt_desc">Latest</option>
              <option value="createdAt_asc">Oldest</option>
            </select>
          </div>
          <button className="bg-slate-700 rounded-lg text-white p-3 uppercase hover:opacity-95">
            Search
          </button>
        </form>
      </div>
      {/* ------------------------------------------------------------------------------- */}
      <div className="flex-1">
        
        {/* --- FILTER UI --- */}
        <div className="flex gap-4 p-3 bg-green-50 rounded mb-4 mx-5 mt-5">
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-4 h-4"
              checked={filters.ecoFriendly}
              onChange={(e) => setFilters({ ...filters, ecoFriendly: e.target.checked })} 
            />
            Eco Friendly 🌿
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-4 h-4"
              checked={filters.govtListed}
              onChange={(e) => setFilters({ ...filters, govtListed: e.target.checked })} 
            />
            Govt Listed 🏛️
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-4 h-4"
              checked={filters.homestay}
              onChange={(e) => setFilters({ ...filters, homestay: e.target.checked })} 
            />
            Homestay 🏠
          </label>
        </div>

        <h1 className="text-xl font-semibold border-b p-3 text-slate-700 mt-5">
          Package Results:
        </h1>
        <div className="w-full p-5 grid 2xl:grid-cols-4 xlplus:grid-cols-3 lg:grid-cols-2 gap-2">
          {!loading && filteredPackages.length === 0 && (
            <p className="text-xl text-slate-700">No Packages Found!</p>
          )}
          {loading && (
            <p className="text-xl text-slate-700 text-center w-full">
              Loading...
            </p>
          )}
          {!loading &&
            filteredPackages &&
            filteredPackages.map((packageData, i) => (
              <PackageCard key={i} packageData={packageData} />
            ))}
        </div>
        {showMoreBtn && (
          <button
            onClick={onShowMoreSClick}
            className="text-sm bg-green-700 text-white hover:underline p-2 m-3 rounded text-center w-max"
          >
            Show More
          </button>
        )}
      </div>
    </div>
  );
};

export default Search;