import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/auth";
const NOTIFICATION_API_URL = "http://localhost:5000/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStaffSignupModal, setShowStaffSignupModal] = useState(false);
  const [staffReports, setStaffReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [productRecords, setProductRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [showProductRecordsModal, setShowProductRecordsModal] = useState(false);

  // Staff signup form state
  const [staffUsername, setStaffUsername] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffConfirmPassword, setStaffConfirmPassword] = useState("");
  const [staffDepartment, setStaffDepartment] = useState("");
  const [staffRollNo, setStaffRollNo] = useState("");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffCollegeEmail, setStaffCollegeEmail] = useState("");
  const [staffBloodGroup, setStaffBloodGroup] = useState("");
  const [staffIdCard, setStaffIdCard] = useState(null);
  const [signupMessage, setSignupMessage] = useState("");
  const [signupMessageType, setSignupMessageType] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  const fetchStaffReportNotifications = async (adminId, token) => {
    try {
      if (!adminId || !token) {
        console.log('Missing adminId or token:', { adminId, token: !!token });
        return;
      }
      setReportsLoading(true);

      console.log('Fetching notifications for admin:', adminId);
      const response = await fetch(`${NOTIFICATION_API_URL}/notifications/user/${adminId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch notifications:', response.status, errorText);
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      console.log('All notifications received:', data.length);
      console.log('Notification types:', data.map(n => n.type));
      const staffOnly = Array.isArray(data) ? data.filter((n) => n.type === "staff_report") : [];
      console.log('Staff report notifications found:', staffOnly.length);
      console.log('Staff reports:', staffOnly);
      setStaffReports(staffOnly);
    } catch (error) {
      console.error("Error fetching staff report notifications:", error);
    } finally {
      setReportsLoading(false);
    }
  };

  const fetchProductRecords = async (token) => {
    try {
      setRecordsLoading(true);
      const response = await fetch(`${NOTIFICATION_API_URL}/sales/sales-records`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Sale records fetched:', data);
        setProductRecords(data);
      } else {
        console.error('Failed to fetch sale records:', response.status);
        setProductRecords([]);
      }
    } catch (error) {
      console.error("Error fetching product records:", error);
      setProductRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is admin
    const isAdmin = localStorage.getItem("isAdmin");
    const token = localStorage.getItem("token");
    const adminId = localStorage.getItem("userId");

    console.log("Admin Check - isAdmin:", isAdmin, "token:", !!token);

    if (!token || isAdmin !== "true" || !adminId) {
      // Not an admin, redirect to login
      navigate("/");
      return;
    }

    // Set admin data
    setAdminData({
      username: "admin@kongu",
      role: "Administrator",
      loginTime: new Date().toLocaleString()
    });
    fetchStaffReportNotifications(adminId, token);
    fetchProductRecords(token);
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userData");
    navigate("/");
  };

  const handleStaffSignup = async () => {
    if (
      staffUsername === "" ||
      staffPassword === "" ||
      staffConfirmPassword === "" ||
      staffDepartment === "" ||
      staffRollNo === "" ||
      staffPhone === "" ||
      staffCollegeEmail === "" ||
      staffBloodGroup === "" ||
      !staffIdCard
    ) {
      setSignupMessageType("error");
      setSignupMessage("All fields are required!");
      return;
    }

    if (staffPassword !== staffConfirmPassword) {
      setSignupMessageType("error");
      setSignupMessage("Passwords do not match!");
      return;
    }

    if (!staffCollegeEmail.endsWith("@kongu.edu")) {
      setSignupMessageType("error");
      setSignupMessage("Enter valid college email (must end with @kongu.edu)!");
      return;
    }

    setSignupLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", staffUsername);
      formData.append("password", staffPassword);
      formData.append("confirmPassword", staffConfirmPassword);
      formData.append("department", staffDepartment);
      formData.append("rollNo", staffRollNo);
      formData.append("phone", staffPhone);
      formData.append("collegeEmail", staffCollegeEmail);
      formData.append("bloodGroup", staffBloodGroup);
      formData.append("idCard", staffIdCard);
      formData.append("role", "staff");

      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setSignupMessageType("success");
        setSignupMessage("Staff member registered successfully!");
        // Reset form
        setStaffUsername("");
        setStaffPassword("");
        setStaffConfirmPassword("");
        setStaffDepartment("");
        setStaffRollNo("");
        setStaffPhone("");
        setStaffCollegeEmail("");
        setStaffBloodGroup("");
        setStaffIdCard(null);
        setTimeout(() => {
          setShowStaffSignupModal(false);
          setSignupMessage("");
          setSignupMessageType("");
        }, 2000);
      } else {
        setSignupMessageType("error");
        setSignupMessage(data.message || "Signup failed");
      }
    } catch (error) {
      setSignupMessageType("error");
      setSignupMessage("Server Error: " + error.message);
    } finally {
      setSignupLoading(false);
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
    <div className="relative min-h-screen overflow-hidden bg-[#050814] text-white">
      <div className="absolute inset-0 opacity-60 blur-3xl pointer-events-none">
        <div className="w-[28rem] h-[28rem] bg-[#4f46e5] rounded-full absolute -top-20 -left-10 mix-blend-screen" />
        <div className="w-[22rem] h-[22rem] bg-[#facc15] rounded-full absolute 10 top-10 right-[-6rem] mix-blend-screen" />
        <div className="w-[30rem] h-[30rem] bg-[#0ea5e9] rounded-full absolute bottom-[-12rem] left-1/3 mix-blend-screen" />
      </div>

      {/* Header */}
      <div className="relative bg-white/5 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-white/60">Control Center</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-sm">Admin Dashboard</h1>
            <p className="text-white/70 text-sm sm:text-base">Guide the platform, onboard staff, and keep users moving smoothly.</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => navigate("/admin-users-management")}
              className="px-3 sm:px-5 py-2 sm:py-3 rounded-xl bg-[#facc15] text-[#0f172a] font-semibold shadow-lg shadow-[#facc15]/30 hover:translate-y-[-1px] transition text-sm sm:text-base"
            >
              Open Users
            </button>
            <button
              onClick={() => setShowStaffSignupModal(true)}
              className="px-3 sm:px-5 py-2 sm:py-3 rounded-xl bg-white/10 border border-white/20 font-semibold hover:bg-white/15 transition text-sm sm:text-base"
            >
              Add Staff
            </button>
            <button
              onClick={handleLogout}
              className="px-3 sm:px-5 py-2 sm:py-3 rounded-xl bg-red-500/80 hover:bg-red-500 text-white font-semibold transition text-sm sm:text-base"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Admin Info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-xl shadow-xl shadow-black/20">
          <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs sm:text-sm text-white/60 mb-1">Signed in as</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#facc15]">{adminData?.username}</p>
              <p className="text-white/70 text-sm">{adminData?.role}</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-white/70">
              <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/50 text-xs">Role</p>
                <p className="text-sm sm:text-lg font-semibold text-green-300">{adminData?.role}</p>
              </div>
              <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/50 text-xs">Login time</p>
                <p className="text-xs sm:text-sm font-semibold text-white/80 truncate">{adminData?.loginTime}</p>
              </div>
              <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/50 text-xs">Status</p>
                <p className="text-sm sm:text-lg font-semibold text-emerald-300">Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <button
            onClick={() => navigate("/admin-users-management")}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#facc15]/80 via-[#facc15]/60 to-[#f59e0b]/70 p-4 sm:p-6 text-left shadow-xl shadow-[#facc15]/30 transition hover:-translate-y-1"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white" />
            <div className="text-2xl sm:text-4xl mb-3 sm:mb-4 drop-shadow">👥</div>
            <h3 className="text-lg sm:text-2xl font-bold text-[#0f172a] drop-shadow">Users Management</h3>
            <p className="text-[#0f172a]/80 mt-1 sm:mt-2 text-xs sm:text-base">Audit, verify, and prune accounts quickly.</p>
            <div className="mt-3 sm:mt-6 inline-flex items-center gap-2 text-[#0f172a] font-semibold text-sm">
              Open panel <span className="text-lg">→</span>
            </div>
          </button>

          <button
            onClick={() => setShowStaffSignupModal(true)}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/0 p-4 sm:p-6 text-left shadow-xl shadow-black/30 transition hover:-translate-y-1"
          >
            <div className="absolute right-[-3rem] top-[-3rem] h-20 sm:h-28 w-20 sm:w-28 rounded-full bg-[#facc15]/40 blur-2xl" />
            <div className="text-2xl sm:text-4xl mb-3 sm:mb-4">👨‍💼</div>
            <h3 className="text-lg sm:text-2xl font-bold">Staff Signup</h3>
            <p className="text-white/70 mt-1 sm:mt-2 text-xs sm:text-base">Onboard trusted staff with ID verification.</p>
            <div className="mt-3 sm:mt-6 inline-flex items-center gap-2 text-[#facc15] font-semibold text-sm">
              Add staff <span className="text-lg">→</span>
            </div>
          </button>

          <button
            onClick={() => navigate("/notifications")}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0ea5e9]/20 via-[#0ea5e9]/10 to-[#111827] p-4 sm:p-6 text-left shadow-xl shadow-black/25 transition hover:-translate-y-1"
          >
            <div className="text-2xl sm:text-4xl mb-3 sm:mb-4">⚠️</div>
            <h3 className="text-lg sm:text-2xl font-bold">Staff Reports</h3>
            <p className="text-white/70 mt-1 sm:mt-2 text-xs sm:text-base">
              {reportsLoading
                ? "Checking for new reports..."
                : staffReports.length === 0
                  ? "No new reports from staff right now."
                  : `${staffReports.length} report${staffReports.length === 1 ? "" : "s"} waiting for review.`}
            </p>
            {!reportsLoading && staffReports.length > 0 && (
              <div className="mt-2 sm:mt-4 space-y-1 sm:space-y-2">
                {staffReports.slice(0, 2).map((report) => (
                  <div key={report._id} className="bg-white/5 rounded-lg p-2 sm:p-3 border border-white/10">
                    <div className="text-xs sm:text-sm font-semibold text-yellow-300 truncate">{report.title}</div>
                    <div className="text-xs text-white/70 overflow-hidden text-ellipsis whitespace-nowrap">{report.message}</div>
                    <div className="text-[10px] sm:text-[11px] text-white/50 mt-1">{new Date(report.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 sm:mt-6 inline-flex items-center gap-2 text-white font-semibold text-sm">
              Review reports <span className="text-lg">→</span>
            </div>
          </button>

          <button
            onClick={() => setShowProductRecordsModal(true)}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-[#111827] p-4 sm:p-6 text-left shadow-xl shadow-emerald-500/20 transition hover:-translate-y-1"
          >
            <div className="absolute right-[-2rem] top-[-2rem] h-20 sm:h-24 w-20 sm:w-24 rounded-full bg-emerald-400/30 blur-2xl" />
            <div className="text-2xl sm:text-4xl mb-3 sm:mb-4">📦</div>
            <h3 className="text-lg sm:text-2xl font-bold">Product Sales Records</h3>
            <p className="text-white/70 mt-1 sm:mt-2 text-xs sm:text-base">
              {recordsLoading
                ? "Loading sales records..."
                : productRecords.length === 0
                  ? "No sales recorded yet."
                  : `${productRecords.length} product${productRecords.length === 1 ? "" : "s"} sold recently.`}
            </p>
            {!recordsLoading && productRecords.length > 0 && (
              <div className="mt-2 sm:mt-4 space-y-1 sm:space-y-2">
                {productRecords.slice(0, 2).map((record) => (
                  <div key={record._id} className="bg-white/5 rounded-lg p-2 sm:p-3 border border-white/10">
                    <div className="text-xs sm:text-sm font-semibold text-emerald-300 truncate">{record.productName}</div>
                    <div className="flex justify-between items-center text-xs mt-1">
                      <span className="text-white/70 truncate">{record.buyerName} → ₹{record.salePrice}</span>
                      <span className="text-white/50">{new Date(record.saleDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 sm:mt-6 inline-flex items-center gap-2 text-emerald-300 font-semibold text-sm">
              View all records <span className="text-lg">→</span>
            </div>
          </button>
        </div>
      </div>

      {/* Staff Signup Modal */}
      {showStaffSignupModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-4 sm:p-6 relative border border-white/20 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowStaffSignupModal(false);
                setSignupMessage("");
                setSignupMessageType("");
              }}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-400 hover:text-white transition-colors text-xl"
            >
              ✕
            </button>

            <h2 className="text-xl sm:text-2xl font-bold text-[#facc15] mb-4 sm:mb-6">Register New Staff Member</h2>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  value={staffUsername}
                  onChange={(e) => setStaffUsername(e.target.value)}
                  className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-[#facc15]"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-[#facc15]"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={staffConfirmPassword}
                  onChange={(e) => setStaffConfirmPassword(e.target.value)}
                  className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-[#facc15]"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Department"
                  value={staffDepartment}
                  onChange={(e) => setStaffDepartment(e.target.value)}
                  className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-[#facc15]"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Roll Number"
                  value={staffRollNo}
                  onChange={(e) => setStaffRollNo(e.target.value)}
                  className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-[#facc15]"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-[#facc15]"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="College Email"
                  value={staffCollegeEmail}
                  onChange={(e) => setStaffCollegeEmail(e.target.value)}
                  className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-[#facc15]"
                />
              </div>
              <div>
                <select
                  value={staffBloodGroup}
                  onChange={(e) => setStaffBloodGroup(e.target.value)}
                  className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg bg-gray-800 border border-white/10 text-white focus:outline-none focus:border-[#facc15] appearance-none cursor-pointer"
                >
                  <option value="" className="bg-gray-800 text-white">Select Blood Group</option>
                  <option value="A+" className="bg-gray-800 text-white">A+</option>
                  <option value="A-" className="bg-gray-800 text-white">A-</option>
                  <option value="B+" className="bg-gray-800 text-white">B+</option>
                  <option value="B-" className="bg-gray-800 text-white">B-</option>
                  <option value="AB+" className="bg-gray-800 text-white">AB+</option>
                  <option value="AB-" className="bg-gray-800 text-white">AB-</option>
                  <option value="O+" className="bg-gray-800 text-white">O+</option>
                  <option value="O-" className="bg-gray-800 text-white">O-</option>
                </select>
              </div>
              <div>
                <label className="text-white/70 block mb-2 text-sm">Upload ID Card</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setStaffIdCard(e.target.files[0])}
                  className="w-full text-white text-sm"
                />
              </div>
            </div>

            <button
              onClick={handleStaffSignup}
              disabled={signupLoading}
              className="w-full mt-4 sm:mt-6 p-2 sm:p-3 text-base sm:text-lg font-bold bg-[#facc15] text-[#0f172a] rounded-lg hover:bg-[#eab308] transition disabled:opacity-50"
            >
              {signupLoading ? "Registering..." : "Register Staff Member"}
            </button>

            {signupMessage && (
              <p className={`text-center mt-3 sm:mt-4 font-medium text-sm ${signupMessageType === "success" ? "text-green-400" : "text-red-400"}`}>
                {signupMessage}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Product Records Modal */}
      {showProductRecordsModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#0a0e1f] to-[#070b18] rounded-2xl shadow-2xl max-w-6xl w-full p-6 relative border border-emerald-500/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                  Product Sales Records
                </h2>
                <p className="text-white/60 mt-2">Complete history of all product transactions</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const token = localStorage.getItem('token');
                    fetchProductRecords(token);
                  }}
                  className="p-3 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl transition-colors group"
                  title="Refresh records"
                >
                  <span className="text-emerald-400 text-xl group-hover:rotate-180 inline-block transition-transform">↻</span>
                </button>
                <button
                  onClick={() => setShowProductRecordsModal(false)}
                  className="p-3 bg-gray-500/20 hover:bg-gray-500/30 rounded-xl transition-colors group"
                >
                  <span className="text-gray-400 text-xl group-hover:rotate-90 inline-block transition-transform">✕</span>
                </button>
              </div>
            </div>

            {recordsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                <p className="text-white/60">Loading records...</p>
              </div>
            ) : productRecords.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-white/60 text-lg">No sales records found</p>
                <p className="text-white/40 text-sm mt-2">Sales will appear here once products are sold</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/5 border border-emerald-500/30 rounded-xl p-4">
                    <p className="text-white/60 text-sm mb-1">Total Sales</p>
                    <p className="text-3xl font-bold text-emerald-400">{productRecords.length}</p>
                  </div>
                  <div className="bg-white/5 border border-green-500/30 rounded-xl p-4">
                    <p className="text-white/60 text-sm mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-400">
                      ₹{productRecords.reduce((sum, record) => sum + record.salePrice, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white/5 border border-yellow-500/30 rounded-xl p-4">
                    <p className="text-white/60 text-sm mb-1">Average Sale</p>
                    <p className="text-3xl font-bold text-yellow-400">
                      ₹{Math.round(productRecords.reduce((sum, record) => sum + record.salePrice, 0) / productRecords.length).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Records Table */}
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-emerald-500/10 border-b border-white/10">
                          <th className="text-left p-4 text-emerald-400 font-bold">Product</th>
                          <th className="text-left p-4 text-emerald-400 font-bold">Buyer</th>
                          <th className="text-left p-4 text-emerald-400 font-bold">Seller</th>
                          <th className="text-left p-4 text-emerald-400 font-bold">Price</th>
                          <th className="text-left p-4 text-emerald-400 font-bold">Payment</th>
                          <th className="text-left p-4 text-emerald-400 font-bold">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productRecords.map((record, index) => (
                          <tr 
                            key={record._id} 
                            className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                              index % 2 === 0 ? 'bg-white/0' : 'bg-white/2'
                            }`}
                          >
                            <td className="p-4">
                              <div className="font-semibold text-white">{record.productName}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-white/80">{record.buyerName}</div>
                              <div className="text-xs text-white/50">{record.buyerRollNumber}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-white/80">{record.sellerName}</div>
                              <div className="text-xs text-white/50">{record.sellerRollNumber}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-green-400">₹{record.salePrice.toLocaleString()}</div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                record.paymentMethod.toLowerCase() === 'upi' ? 'bg-blue-500/20 text-blue-400' :
                                record.paymentMethod.toLowerCase() === 'cash' ? 'bg-green-500/20 text-green-400' :
                                record.paymentMethod.toLowerCase() === 'bank_transfer' ? 'bg-purple-500/20 text-purple-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {record.paymentMethod.toUpperCase().replace('_', ' ')}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="text-white/70 text-sm">
                                {new Date(record.saleDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="text-xs text-white/40">
                                {new Date(record.saleDate).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
