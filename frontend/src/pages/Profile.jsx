import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserProfile from '../components/UserProfile';
import ItemCard from '../components/ItemCard';
import SaleRecordModal from '../components/SaleRecordModal';
import { ShoppingBag, Star, LayoutDashboard, LogOut, Edit2, TrendingUp, Bell, User, Mail, Phone, Calendar, Hash, Building2, Award } from 'lucide-react';

const API_URL = "http://localhost:5000/api";

export default function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [userPurchases, setUserPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [idCardUrl, setIdCardUrl] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // CHECK AUTHENTICATION FIRST
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const storedUserData = localStorage.getItem('userData');
        
        console.log('Auth check - Token:', !!token, 'UserId:', !!userId, 'UserData:', !!storedUserData);
        
        // If no token or userId, user is not logged in - redirect to login
        if (!token || !userId || !storedUserData) {
          console.warn('No authentication found. Redirecting to login.');
          setLoading(false);
          setTimeout(() => navigate('/'), 500);
          return;
        }

        setIsAuthenticated(true);

        const isAdmin = localStorage.getItem('isAdmin');

        // Prevent admin from accessing user profile
        if (isAdmin === 'true') {
          console.warn('Admin cannot access user profile');
          setLoading(false);
          setTimeout(() => navigate('/admin-dashboard'), 500);
          return;
        }

        // Get stored data
        try {
          const parsedData = JSON.parse(storedUserData);
          console.log('Parsed user data:', parsedData);
          setUserData(parsedData);
        } catch (parseError) {
          console.error('Error parsing stored data:', parseError);
          setError('Failed to parse user data');
          setLoading(false);
          return;
        }

        // Fetch complete user data including ID card
        try {
          const userResponse = await fetch(`${API_URL}/auth/user/${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (userResponse.ok) {
            const fullUserData = await userResponse.json();
            console.log('Full user data fetched:', fullUserData);
            setUserData(fullUserData);
            if (fullUserData.idCardUrl) {
              setIdCardUrl(fullUserData.idCardUrl);
            }
          } else {
            console.warn('Failed to fetch full user data:', userResponse.status);
          }
        } catch (userErr) {
          console.error('Error fetching full user data:', userErr);
        }

        // Fetch user profile from backend
        try {
          const profileResponse = await fetch(`${API_URL}/products/profile/${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (profileResponse.ok) {
            const profile = await profileResponse.json();
            console.log('User profile fetched:', profile);
            setProfileData(profile);
          } else {
            console.warn('Failed to fetch profile:', profileResponse.status);
          }
        } catch (profileErr) {
          console.error('Error fetching profile:', profileErr);
        }

        // Fetch user's listings
        // Fetch user's listings
        try {
          const listingsResponse = await fetch(`${API_URL}/products/seller/${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          if (listingsResponse.ok) {
            const listings = await listingsResponse.json();
            setUserListings(Array.isArray(listings) ? listings : []);
        // End listings fetch
          }
        } catch (listingsErr) {
          console.error('Error fetching listings:', listingsErr);
        }

        // Fetch unread notifications count
        try {
          const notifResponse = await fetch(`${API_URL}/notifications/unread/${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (notifResponse.ok) {
            const data = await notifResponse.json();
            console.log('Unread notifications:', data.count);
            setUnreadNotifications(data.count);
          }
        } catch (notifErr) {
          console.error('Error fetching notifications:', notifErr);
        }

        setLoading(false);

      } catch (err) {
        console.error('Error in fetchUserData:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');
    navigate('/');
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsSaleModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsSaleModalOpen(false);
    setSelectedProduct(null);
  };

  // Delete product from user listings
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to delete a product.');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete product');
      }
      setUserListings((prev) => prev.filter((p) => p._id !== productId));
      alert('Product deleted successfully!');
    } catch (err) {
      alert('Failed to delete product: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b18] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b18] text-white">
        <div className="text-center">
          <p className="text-lg mb-4">You must be logged in to view your profile.</p>
          <p className="text-gray-400 mb-6">Redirecting to login page...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#070b18] text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 bg-red-500/20 border border-red-500 rounded-lg text-red-200 mb-6">
            Error: {error}
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-500 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#070b18] text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-200 mb-6">
            User data not available.
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-500 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070b18] via-[#0a0e1f] to-[#070b18] text-white">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-yellow-500/10 via-yellow-400/10 to-amber-500/10 border-b border-white/10 p-4 sm:p-6 backdrop-blur-xl sticky top-0 z-10 shadow-lg shadow-yellow-500/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">My Profile</h1>
            <p className="text-white/60 mt-1 sm:mt-2 font-medium text-sm sm:text-base">Manage your listings and account settings</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/notifications')}
              className="relative flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-black rounded-xl font-semibold hover:shadow-lg hover:shadow-yellow-400/30 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base flex-shrink-0"
            >
              <Bell size={18} />
              <span className="hidden sm:inline">Notifications</span>
              {unreadNotifications > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg shadow-red-500/50">
                  {unreadNotifications}
                </span>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-red-500 to-red-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base flex-shrink-0"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        {/* User Info Card with Profile Avatar */}
        <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20 rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-yellow-500/5 hover:border-yellow-400/30 transition-all duration-500">
          {/* Profile Header Section */}
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="relative group">
                <div className="w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 p-1 shadow-lg shadow-yellow-400/30">
                  <div className="w-full h-full rounded-full bg-[#070b18] flex items-center justify-center text-3xl sm:text-5xl font-bold text-yellow-400">
                    {userData?.username?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 sm:w-8 h-6 sm:h-8 rounded-full border-4 border-[#070b18] flex items-center justify-center">
                  <div className="w-2 sm:w-3 h-2 sm:h-3 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 text-center lg:text-left">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{userData?.username}</h2>
                <p className="text-yellow-400 font-semibold mt-1 text-sm">Campus Member</p>
              </div>
            </div>

            {/* User Details Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
              <div className="flex items-start gap-2 sm:gap-3 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10 hover:border-yellow-400/30 transition-all duration-300 hover:bg-white/10">
                <div className="bg-blue-500/20 p-2 rounded-lg flex-shrink-0">
                  <Mail className="text-blue-400" size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-white/50 text-xs font-semibold mb-1">Email Address</p>
                  <p className="text-white font-medium break-all text-sm">{userData?.collegeEmail}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10 hover:border-yellow-400/30 transition-all duration-300 hover:bg-white/10">
                <div className="bg-purple-500/20 p-2 rounded-lg flex-shrink-0">
                  <Building2 className="text-purple-400" size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-white/50 text-xs font-semibold mb-1">Department</p>
                  <p className="text-white font-medium text-sm">{userData?.department}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10 hover:border-yellow-400/30 transition-all duration-300 hover:bg-white/10">
                <div className="bg-green-500/20 p-2 rounded-lg flex-shrink-0">
                  <Hash className="text-green-400" size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-white/50 text-xs font-semibold mb-1">Roll Number</p>
                  <p className="text-white font-medium text-sm">{userData?.rollNo || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10 hover:border-yellow-400/30 transition-all duration-300 hover:bg-white/10">
                <div className="bg-pink-500/20 p-2 rounded-lg flex-shrink-0">
                  <Phone className="text-pink-400" size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-white/50 text-xs font-semibold mb-1">Phone Number</p>
                  <p className="text-white font-medium text-sm">{userData?.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10 hover:border-yellow-400/30 transition-all duration-300 hover:bg-white/10 sm:col-span-2">
                <div className="bg-amber-500/20 p-2 rounded-lg flex-shrink-0">
                  <Calendar className="text-amber-400" size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-white/50 text-xs font-semibold mb-1">Member Since</p>
                  <p className="text-white font-medium text-sm">{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* ID Card Section */}
            <div className="w-full lg:w-72">
              <p className="text-white/60 text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2">
                <Award size={16} className="text-yellow-400 flex-shrink-0" />
                ID Card Verification
              </p>
              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-2 sm:p-3 overflow-hidden shadow-lg hover:shadow-yellow-400/10 transition-all duration-300">
                {idCardUrl ? (
                  <img
                    src={idCardUrl}
                    alt="ID Card"
                    className="w-full h-auto rounded-lg object-contain max-h-48 sm:max-h-64 hover:scale-105 transition-transform duration-300"
                    onLoad={(e) => {
                      console.log('ID card image loaded successfully');
                    }}
                    onError={(e) => {
                      console.error('ID card image failed to load');
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x200?text=ID+Card+Not+Available';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 sm:h-48 text-white/40">
                    <Award size={32} className="mb-2" />
                    <p className="text-xs sm:text-sm">ID Card Not Available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* My Listings */}
        <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20 rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-purple-500/5 hover:border-purple-400/30 transition-all duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">My Listings</h2>
              <p className="text-white/50 text-xs sm:text-sm mt-1">Products you're currently listing</p>
            </div>
            {userListings.length > 0 && (
              <button
                onClick={() => navigate('/selling')}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-black rounded-xl font-semibold hover:shadow-lg hover:shadow-yellow-400/30 transition-all duration-300 transform hover:scale-105 text-sm w-full sm:w-auto justify-center"
              >
                <ShoppingBag size={18} />
                Add New
              </button>
            )}
          </div>
          
          {userListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {userListings.map((product) => (
                <div 
                  key={product._id} 
                  className="transform transition-all duration-300 hover:scale-105 cursor-pointer group"
                >
                  <div onClick={() => handleProductClick(product)}>
                    <ItemCard 
                      name={product.title}
                      price={`₹${product.price}`}
                      description={product.description}
                      imageUrl={product.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'}
                      sellerEmail={product.sellerEmail}
                    />
                  </div>
                  <button
                    className="mt-2 w-full py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all duration-300 text-sm"
                    onClick={() => handleDeleteProduct(product._id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <div className="bg-gradient-to-br from-yellow-400/20 to-amber-500/20 w-20 sm:w-24 h-20 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border-4 border-yellow-400/30">
                <ShoppingBag className="text-yellow-400" size={32} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">No listings yet</h3>
              <p className="text-white/60 mb-6 sm:mb-8 max-w-md mx-auto text-sm">Start your listing journey by listing your first product on CampusKART!</p>
              <button
                onClick={() => navigate('/selling')}
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-black rounded-xl font-bold hover:shadow-lg hover:shadow-yellow-400/30 transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2 text-sm sm:text-base"
              >
                <ShoppingBag size={18} />
                Start Listing
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sale Record Modal */}
      <SaleRecordModal 
        isOpen={isSaleModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
        sellerData={userData}
      />
    </div>
  );
}