import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsersManagement from "./pages/AdminUsersManagement";
import AdminProfile from "./pages/AdminProfile";
import StaffLoginPage from "./pages/StaffLoginPage";
import StaffDashboard from "./pages/StaffDashboard";
import StaffUserApproval from "./pages/StaffUserApproval";
import Home from "./pages/Home";
import Buying from "./pages/Buying";
import Selling from "./pages/Selling";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MapButton from "./components/MapButton";
import CampusMap from "./components/CampusMap";
import ParallaxBackground from "./components/ParallaxBackground";

function AppContent() {
  const [showMap, setShowMap] = useState(false);
  const location = useLocation();

  const toggleMap = () => {
    setShowMap(!showMap);
  };

  return (
    <>
      <ParallaxBackground />
      <div className="relative z-10 bg-slate-950 min-h-screen text-white font-sans">

        {/* 
          👉 Navbar should NOT show on Login Page 
          So we show it ONLY when route is NOT "/"
        */}
        <Routes>
          <Route
            path="/"
            element={<LoginPage />}
          />

          <Route
            path="/admin-login"
            element={<AdminLoginPage />}
          />

          <Route
            path="/admin-dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin-users-management"
            element={<AdminUsersManagement />}
          />

          <Route
            path="/staff-login"
            element={<StaffLoginPage />}
          />

          <Route
            path="/staff-dashboard"
            element={<StaffDashboard />}
          />

          <Route
            path="/staff-user-approval"
            element={<StaffUserApproval />}
          />

          {/* All other pages get Navbar + Components */}
          <Route
            path="/home"
            element={
              <>
                <Navbar />
                <main className="container mx-auto p-4">
                  <Home />
                </main>
                <Footer />
              </>
            }
          />

          <Route
            path="/dealing"
            element={
              <>
                <Navbar />
                <main className="container mx-auto p-4">
                  <Buying />
                </main>
                <Footer />
              </>
            }
          />

          <Route
            path="/selling"
            element={
              <>
                <Navbar />
                <main className="container mx-auto p-4">
                  <Selling />
                </main>
                <Footer />
              </>
            }
          />

          <Route
            path="/community"
            element={
              <>
                <Navbar />
                <main className="container mx-auto p-4">
                  <Community />
                </main>
                <Footer />
              </>
            }
          />

          <Route
            path="/profile"
            element={
              <>
                <Navbar />
                <main className="container mx-auto p-4">
                  {localStorage.getItem("isAdmin") === "true" ? <AdminProfile /> : <Profile />}
                </main>
                <Footer />
              </>
            }
          />

          <Route
            path="/notifications"
            element={
              <>
                <Navbar />
                <main className="container mx-auto p-4">
                  <Notifications />
                </main>
                <Footer />
              </>
            }
          />
        </Routes>

        {/* Campus Map Button only visible after login */}
        {showMap && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-75 flex items-center justify-center p-8">
            <div className="relative w-full h-full max-w-5xl max-h-[80vh]">
              <button
                onClick={toggleMap}
                className="absolute top-4 right-4 z-50 text-white text-2xl font-bold bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                &times;
              </button>
              <CampusMap />
            </div>
          </div>
        )}

        {/* Floating Map button (not visible on login page) */}
        {location.pathname !== "/" && location.pathname !== "/admin-login" && location.pathname !== "/staff-login" && (
          <MapButton onClick={toggleMap} />
        )}
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </Router>
  );
}
