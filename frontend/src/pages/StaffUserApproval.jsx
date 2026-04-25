import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Download } from "lucide-react";

const API_URL = "http://localhost:5000/api/auth";

export default function StaffUserApproval() {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);

  useEffect(() => {
    // Check if user is staff
    const isStaff = localStorage.getItem("isStaff");
    const token = localStorage.getItem("token");

    if (!token || isStaff !== "true") {
      navigate("/");
      return;
    }

    fetchPendingUsers();
  }, [navigate]);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/staff/pending-users`, {
        method: "GET",
        headers: headers,
        credentials: "include"
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("=== DEBUG: Pending users response ===");
      console.log("Total users:", data.length);
      data.forEach((user, index) => {
        console.log(`User ${index + 1} (${user.username}):`, {
          hasIdCardUrl: !!user.idCardUrl,
          idCardUrlLength: user.idCardUrl ? user.idCardUrl.length : 0,
          idCardUrlPreview: user.idCardUrl ? user.idCardUrl.substring(0, 50) : "none"
        });
      });
      console.log("=== END DEBUG ===\n");

      setPendingUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Error: ${err.message}`);
      setPendingUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/staff/approve/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.ok) {
        setSuccessMessage("User approved successfully!");
        setPendingUsers(pendingUsers.filter(user => user._id !== userId));
        setSelectedUserProfile(null);
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError("Failed to approve user");
      }
    } catch (err) {
      setError("Error approving user: " + err.message);
    }
  };

  const handleDeny = async (userId) => {
    if (!window.confirm("Are you sure you want to deny this user? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/staff/deny/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.ok) {
        setSuccessMessage("User denied successfully!");
        setPendingUsers(pendingUsers.filter(user => user._id !== userId));
        setSelectedUserProfile(null);
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError("Failed to deny user");
      }
    } catch (err) {
      setError("Error denying user: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b18] text-white">
        <div className="text-2xl font-bold">Loading pending users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070b18] to-[#0f172a] text-white">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10 p-6 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-[#facc15]">User Profile Management</h1>
              <p className="text-white/60 mt-2">Approve or deny pending user signups</p>
            </div>
            <button
              onClick={() => navigate("/staff-dashboard")}
              className="px-6 py-2 bg-[#facc15] text-[#0f172a] rounded-lg font-semibold hover:bg-[#eab308] transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-300">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-md">
            <p className="text-white/60 text-sm mb-2">Pending Users</p>
            <p className="text-3xl font-bold text-[#facc15]">{pendingUsers.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-md">
            <p className="text-white/60 text-sm mb-2">Action Required</p>
            <p className="text-3xl font-bold text-orange-400">{pendingUsers.length > 0 ? "Yes" : "None"}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-md">
            <p className="text-white/60 text-sm mb-2">Last Updated</p>
            <p className="text-lg font-semibold text-white/80">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Pending Users List */}
        {pendingUsers.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center backdrop-blur-md">
            <p className="text-2xl font-semibold text-white/60">No pending users</p>
            <p className="text-white/40 mt-2">All users have been approved or denied</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div
                key={user._id}
                className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md hover:bg-white/10 transition"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  {/* User Details */}
                  <div>
                    <h3 className="text-xl font-bold text-[#facc15] mb-4">User Details</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-white/60 text-sm">Username</p>
                        <p className="text-lg font-semibold text-white">{user.username}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">College Email</p>
                        <p className="text-lg font-semibold text-white">{user.collegeEmail}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Department</p>
                        <p className="text-lg font-semibold text-white">{user.department}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Roll Number</p>
                        <p className="text-lg font-semibold text-white">{user.rollNo}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Phone</p>
                        <p className="text-lg font-semibold text-white">{user.phone}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Signup Date</p>
                        <p className="text-lg font-semibold text-white">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ID Card Preview */}
                  <div>
                    <h3 className="text-xl font-bold text-[#facc15] mb-4">ID Card Verification</h3>
                    <div className="bg-black/30 rounded-lg overflow-hidden border border-white/10 h-80 flex items-center justify-center">
                      {user.idCardUrl ? (
                        <img
                          src={user.idCardUrl}
                          alt="ID Card"
                          className="w-full h-full object-cover"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%"
                          }}
                          onError={(e) => {
                            console.error("Image load error. URL exists:", !!user.idCardUrl);
                            e.target.style.display = "none";
                            const parent = e.target.parentElement;
                            parent.innerHTML = `<div class="text-center">
                              <p class="text-white/40 mb-2">ID Card failed to load</p>
                            </div>`;
                          }}
                          onLoad={(e) => {
                            console.log("ID Card loaded successfully");
                          }}
                        />
                      ) : (
                        <div className="text-center">
                          <p className="text-white/40">No ID Card available</p>
                          <p className="text-white/20 text-xs mt-2">User has not uploaded an ID Card</p>
                        </div>
                      )}
                    </div>
                    {user.idCardUrl && (
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = user.idCardUrl;
                          link.download = `${user.username}-id-card.png`;
                          link.click();
                        }}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                      >
                        <Download size={18} />
                        Download ID Card
                      </button>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end pt-6 border-t border-white/10">
                  <button
                    onClick={() => handleDeny(user._id)}
                    className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
                  >
                    <X size={18} />
                    Deny
                  </button>
                  <button
                    onClick={() => handleApprove(user._id)}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
                  >
                    <Check size={18} />
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
