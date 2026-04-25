import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { getApiUrl } from "../utils/api";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [staffData, setStaffData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [showReportUserTable, setShowReportUserTable] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [selectedUserForReport, setSelectedUserForReport] = useState(null);
  const [reportText, setReportText] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    // Check if user is staff
    const isStaff = localStorage.getItem("isStaff");
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    console.log("Staff Check - isStaff:", isStaff, "token:", !!token, "userId:", userId);

    if (!token || isStaff !== "true") {
      // Not a staff member, redirect to login
      navigate("/");
      return;
    }

    // Get staff data from localStorage
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsedData = JSON.parse(userData);
      setStaffData({
        username: parsedData.username,
        role: "Staff Member",
        department: parsedData.department,
        loginTime: new Date().toLocaleString()
      });
    } else {
      setStaffData({
        username: "Staff",
        role: "Staff Member",
        department: "N/A",
        loginTime: new Date().toLocaleString()
      });
    }

    // Fetch staff dashboard data
    fetchStaffDashboard(userId);
  }, [navigate]);

  const fetchStaffDashboard = async (staffId) => {
    try {
      setLoading(true);
      setError("");

      // Fetch dashboard data
      const dashboardResponse = await fetch(`${API_URL}/staff/dashboard/${staffId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!dashboardResponse.ok) {
        throw new Error(`Failed to fetch dashboard data: ${dashboardResponse.status}`);
      }

      const dashboardData = await dashboardResponse.json();
      
      // Fetch pending users count
      const pendingResponse = await fetch(`${API_URL}/staff/pending-users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (pendingResponse.ok) {
        const pendingUsers = await pendingResponse.json();
        dashboardData.usersPendingCount = pendingUsers.length;
      }

      console.log("Dashboard data received:", dashboardData);
      setDashboardData(dashboardData);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("isStaff");
    localStorage.removeItem("userData");
    navigate("/");
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users`);
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Error loading users");
    }
  };

  const handleReportUser = (user) => {
    setSelectedUserForReport(user);
    setReportText("");
  };

  const submitReport = async () => {
    if (!reportText.trim()) {
      setError("Please enter a report message");
      return;
    }

    setSubmittingReport(true);
    try {
      const reportData = {
        reportedUserId: selectedUserForReport._id,
        reportedUsername: selectedUserForReport.username,
        reportedEmail: selectedUserForReport.collegeEmail,
        reportedDepartment: selectedUserForReport.department,
        reportedPhone: selectedUserForReport.phone,
        reportedRollNo: selectedUserForReport.rollNo,
        reportingStaffId: localStorage.getItem("userId"),
        reportingStaffUsername: staffData?.username,
        reportText: reportText,
        reportedAt: new Date().toISOString()
      };

      // Send report to backend
      console.log('Submitting report:', reportData);
      const response = await fetch(`${API_URL}/staff/report-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(reportData)
      });

      const result = await response.json();
      console.log('Report submission response:', result);

      if (response.ok) {
        setReportMessage(`User ${selectedUserForReport.username} has been reported successfully!`);
        setSelectedUserForReport(null);
        setReportText("");
        setTimeout(() => setReportMessage(""), 3000);
      } else {
        console.error('Failed to submit report:', result);
        setError("Failed to submit report: " + (result.message || 'Unknown error'));
      }
    } catch (err) {
      console.error("Error reporting user:", err);
      setError("Error reporting user: " + err.message);
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b18] text-white">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070b18] to-[#0f172a] text-white">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10 p-6 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-[#facc15]">Staff Dashboard</h1>
            <p className="text-white/60 mt-2">Manage and assist with platform operations</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Pending User Request Alert */}
        {dashboardData && dashboardData.usersPendingCount > 0 && (
          <div className="mb-6 p-6 bg-yellow-500/20 border-2 border-yellow-500 rounded-xl backdrop-blur-md animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-500 rounded-full p-3">
                  <Clock className="text-white" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-yellow-400">Pending User Approvals</h3>
                  <p className="text-white/80 mt-1">
                    You have <span className="font-bold text-yellow-300">{dashboardData.usersPendingCount}</span> user{dashboardData.usersPendingCount !== 1 ? 's' : ''} waiting for approval
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/staff-user-approval")}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition transform hover:scale-105"
              >
                Review Now →
              </button>
            </div>
          </div>
        )}

        {/* Staff Info Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8 backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-white/60 text-sm mb-2">Staff Username</p>
              <p className="text-2xl font-bold text-[#facc15]">{staffData?.username}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-2">Role</p>
              <p className="text-2xl font-bold text-green-400">{staffData?.role}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-2">Department</p>
              <p className="text-lg font-semibold text-white/80">{staffData?.department}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-2">Login Time</p>
              <p className="text-lg font-semibold text-white/80">{staffData?.loginTime}</p>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Users Approved */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md hover:border-green-400/50 transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white/60 text-sm font-semibold">Users Approved</h3>
                <CheckCircle className="text-green-400" size={24} />
              </div>
              <p className="text-4xl font-bold text-green-400">{dashboardData.usersApprovedCount}</p>
              <p className="text-white/60 text-sm mt-2">Total approved users</p>
            </div>

            {/* Users Pending */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md hover:border-yellow-400/50 transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white/60 text-sm font-semibold">Users Pending</h3>
                <Clock className="text-yellow-400" size={24} />
              </div>
              <p className="text-4xl font-bold text-yellow-400">{dashboardData.usersPendingCount}</p>
              <p className="text-white/60 text-sm mt-2">Waiting for approval</p>
            </div>

            {/* Total Managed */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md hover:border-blue-400/50 transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white/60 text-sm font-semibold">Total Managed</h3>
                <BarChart3 className="text-blue-400" size={24} />
              </div>
              <p className="text-4xl font-bold text-blue-400">{dashboardData.totalUsersManaged}</p>
              <p className="text-white/60 text-sm mt-2">Total users managed</p>
            </div>
          </div>
        )}

        {/* Additional Stats */}


        {/* Quick Actions */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => navigate("/staff-user-approval")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition relative"
            >
              Approve Users
              {dashboardData && dashboardData.usersPendingCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {dashboardData.usersPendingCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => {
                setShowReportUserTable(!showReportUserTable);
                if (!showReportUserTable) fetchUsers();
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Report User
            </button>
          </div>
        </div>

        {/* Report User Table */}
        {showReportUserTable && (
          <div className="mt-8">
            {reportMessage && (
              <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-200">
                {reportMessage}
              </div>
            )}
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Users - Report</h3>
                <input
                  type="text"
                  placeholder="Search by username, email, or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[#facc15] w-96"
                />
              </div>

              {users.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-white/60">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-white/10 border-b border-white/20">
                        <th className="px-4 py-3 text-left font-semibold text-[#facc15]">Username</th>
                        <th className="px-4 py-3 text-left font-semibold text-[#facc15]">Email</th>
                        <th className="px-4 py-3 text-left font-semibold text-[#facc15]">Department</th>
                        <th className="px-4 py-3 text-left font-semibold text-[#facc15]">Roll Number</th>
                        <th className="px-4 py-3 text-left font-semibold text-[#facc15]">Phone</th>
                        <th className="px-4 py-3 text-left font-semibold text-[#facc15]">Joined Date</th>
                        <th className="px-4 py-3 text-center font-semibold text-[#facc15]">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter(user =>
                          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.collegeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((user) => (
                          <tr key={user._id} className="border-b border-white/10 hover:bg-white/5 transition">
                            <td className="px-4 py-3">
                              <span className="font-semibold">{user.username}</span>
                            </td>
                            <td className="px-4 py-3">{user.collegeEmail}</td>
                            <td className="px-4 py-3">{user.department}</td>
                            <td className="px-4 py-3">{user.rollNo}</td>
                            <td className="px-4 py-3">{user.phone}</td>
                            <td className="px-4 py-3 text-sm text-white/70">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleReportUser(user)}
                                className="px-4 py-1 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold transition text-white text-sm"
                              >
                                Report
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Report Modal */}
        {selectedUserForReport && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 backdrop-blur-md max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-white mb-4">Report User</h2>
              
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
                <p className="text-white/80 mb-2"><span className="font-semibold">Username:</span> {selectedUserForReport.username}</p>
                <p className="text-white/80 mb-2"><span className="font-semibold">Email:</span> {selectedUserForReport.collegeEmail}</p>
                <p className="text-white/80 mb-2"><span className="font-semibold">Department:</span> {selectedUserForReport.department}</p>
                <p className="text-white/80"><span className="font-semibold">Roll Number:</span> {selectedUserForReport.rollNo}</p>
              </div>

              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">Report Details:</label>
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Enter the reason for reporting this user..."
                  className="w-full h-32 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[#facc15] resize-none"
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setSelectedUserForReport(null);
                    setReportText("");
                    setError("");
                  }}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition border border-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReport}
                  disabled={submittingReport}
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-semibold rounded-lg transition"
                >
                  {submittingReport ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
