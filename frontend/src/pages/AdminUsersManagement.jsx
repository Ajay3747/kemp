import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { getApiUrl } from "../utils/api";

export default function AdminUsersManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [userType, setUserType] = useState(null); // null = selection view, "users" or "staff"

  useEffect(() => {
    // Check if user is admin
    const isAdmin = localStorage.getItem("isAdmin");
    const token = localStorage.getItem("token");

    if (!token || isAdmin !== "true") {
      navigate("/");
      return;
    }

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("Starting fetch from:", `${API_URL}/admin/users`);
      
      const response = await fetch(`${API_URL}/admin/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include"
      });

      console.log("Response received, status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Data received:", data);
      setUsers(Array.isArray(data) ? data : []);
      
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Error: ${err.message}`);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/user/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.ok) {
        setDeleteMessage("User deleted successfully!");
        setUsers(users.filter(user => user._id !== userId));
        setTimeout(() => setDeleteMessage(""), 3000);
      } else {
        setError("Failed to delete user");
      }
    } catch (err) {
      setError("Error deleting user: " + err.message);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.collegeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.bloodGroup && user.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filter users based on selected type
  const displayUsers = userType === "users" 
    ? filteredUsers.filter(user => !user.role || user.role !== 'staff') 
    : userType === "staff" 
    ? filteredUsers.filter(user => user.role === 'staff') 
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070b18] to-[#0f172a] text-white">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10 p-6 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#facc15]">Users Management</h1>
              <p className="text-white/60 mt-2">Manage all registered users</p>
            </div>
            <button
              onClick={() => navigate("/admin-dashboard")}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition border border-white/20"
            >
              ← Back
            </button>
          </div>

          {/* Search Bar - Only show when a type is selected */}
          {userType && (
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search by username, email, or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[#facc15]"
              />
              <button
                onClick={fetchUsers}
                className="px-6 py-2 bg-[#facc15] text-[#0f172a] rounded-lg font-semibold hover:bg-[#eab308] transition"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}
        {deleteMessage && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-200">
            {deleteMessage}
          </div>
        )}

        {/* Card Selection View */}
        {userType === null ? (
          <div className="flex flex-col items-center justify-center min-h-96">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
              {/* Users Card */}
              <div
                onClick={() => setUserType("users")}
                className="group cursor-pointer p-8 bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 hover:border-[#facc15] rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/20"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">👥</div>
                  <h2 className="text-3xl font-bold text-[#facc15] mb-2">Users</h2>
                  <p className="text-white/60 text-center">Manage all registered students and users</p>
                </div>
              </div>

              {/* Staff Card */}
              <div
                onClick={() => setUserType("staff")}
                className="group cursor-pointer p-8 bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 hover:border-[#facc15] rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/20"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">👨‍💼</div>
                  <h2 className="text-3xl font-bold text-[#facc15] mb-2">Staff</h2>
                  <p className="text-white/60 text-center">Manage all staff members</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Back Button to Selection View */}
            <button
              onClick={() => {
                setUserType(null);
                setSearchTerm("");
              }}
              className="mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition border border-white/20"
            >
              ← Back to Selection
            </button>

            {/* Loading State */}
            {loading ? (
              <div className="text-center text-2xl font-bold">Loading {userType}...</div>
            ) : displayUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-white/60">No {userType} found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-white/10 border-b border-white/20">
                      <th className="px-4 py-3 text-left font-semibold text-[#facc15]">Username</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#facc15]">Profile</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#facc15]">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#facc15]">Department</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#facc15]">Roll Number</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#facc15]">Phone</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#facc15]">Blood Group</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#facc15]">Joined Date</th>
                      <th className="px-4 py-3 text-center font-semibold text-[#facc15]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayUsers.map((user) => (
                      <tr key={user._id} className="border-b border-white/10 hover:bg-white/5 transition">
                        <td className="px-4 py-3">
                          <span className="font-semibold">{user.username}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedUserProfile(user)}
                            className="px-4 py-1 bg-[#facc15] text-[#0f172a] hover:bg-[#eab308] rounded-lg font-semibold transition text-sm"
                          >
                            View ID
                          </button>
                        </td>
                        <td className="px-4 py-3">{user.collegeEmail}</td>
                        <td className="px-4 py-3">{user.department}</td>
                        <td className="px-4 py-3">{user.rollNo}</td>
                        <td className="px-4 py-3">{user.phone}</td>
                        <td className="px-4 py-3">
                          <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg font-semibold text-sm">
                            {user.bloodGroup || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-white/70">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="px-4 py-1 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition text-white text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* User Count */}
            {userType && displayUsers.length > 0 && (
              <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-white/80">
                  Total {userType}: <span className="font-bold text-[#facc15]">{displayUsers.length}</span>
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Profile Modal */}
      {selectedUserProfile && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-xl w-full p-6 relative border border-white/20">
            <button
              onClick={() => setSelectedUserProfile(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={28} />
            </button>

            <h2 className="text-3xl font-bold text-[#facc15] mb-6">User Profile - ID Verification</h2>
            
            <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-white/10">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-400 text-sm font-semibold mb-1">Username</p>
                  <p className="text-white text-lg">{selectedUserProfile.username}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-semibold mb-1">Email</p>
                  <p className="text-white text-lg break-words">{selectedUserProfile.collegeEmail}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-semibold mb-1">Department</p>
                  <p className="text-white text-lg">{selectedUserProfile.department}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-semibold mb-1">Roll Number</p>
                  <p className="text-white text-lg">{selectedUserProfile.rollNo}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-[#facc15] mb-4">ID Card</h3>
              <div className="flex items-center justify-center bg-gray-900 rounded-lg p-4 min-h-80">
                {selectedUserProfile.idCardUrl ? (
                  <img
                    src={selectedUserProfile.idCardUrl}
                    alt={`${selectedUserProfile.username}'s ID Card`}
                    className="max-w-xs max-h-64 rounded-lg border-2 border-[#facc15] object-contain"
                    onError={(e) => {
                      console.error('Image failed to load:', selectedUserProfile.idCardUrl);
                      e.target.src = 'https://via.placeholder.com/400x300?text=ID+Card+Not+Found';
                    }}
                  />
                ) : (
                  <div className="text-center">
                    <p className="text-white/40">No ID Card available</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedUserProfile(null)}
                className="mt-4 w-full px-6 py-2 bg-[#facc15] text-[#0f172a] rounded-lg font-semibold hover:bg-[#eab308] transition"
              >
                ← Back to User Management
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
