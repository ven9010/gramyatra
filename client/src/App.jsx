import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import FakePayment from "./pages/FakePayment";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Header from "./pages/components/Header";
import Profile from "./pages/Profile";
import About from "./pages/About";
import PrivateRoute from "./pages/Routes/PrivateRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRoute from "./pages/Routes/AdminRoute";
import UpdatePackage from "./pages/admin/UpdatePackage";
import Package from "./pages/Package";
import RatingsPage from "./pages/RatingsPage";
import Booking from "./pages/user/Booking";
import Search from "./pages/Search";
import Impact from "./pages/Impact";
import VillageLeaderboard from "./pages/VillageLeaderboard"; // --- NEW IMPORT ---

const App = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/search" element={<Search />} />

        {/* user */}
        <Route path="/profile" element={<PrivateRoute />}>
          <Route path="user" element={<Profile />} />
        </Route>

        {/* admin */}
        <Route path="/profile" element={<AdminRoute />}>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/update-package/:id" element={<UpdatePackage />} />
        </Route>

        <Route path="/about" element={<About />} />
        <Route path="/impact" element={<Impact />} />
        
        {/* --- NEW LEADERBOARD ROUTE --- */}
        <Route path="/leaderboard" element={<VillageLeaderboard />} />

        <Route path="/package/:id" element={<Package />} />
        <Route path="/package/ratings/:id" element={<RatingsPage />} />

        {/* --- CLEANER PROTECTED ROUTES WRAPPER --- */}
        <Route element={<PrivateRoute />}>
          <Route path="/booking/:packageId" element={<Booking />} />
          <Route path="/pay/:id" element={<FakePayment />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;
