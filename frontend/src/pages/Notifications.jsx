import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Mail, Phone, User, Package, Calendar, Check, Trash2, ShoppingBag, X } from 'lucide-react';
import { getApiUrl } from '../utils/api';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      if (!userId || !token) {
        navigate('/');
        return;
      }

      const response = await fetch(getApiUrl(`/notifications/user/${userId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Notifications fetched:', data);
        setNotifications(data);
      } else {
        throw new Error('Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(getApiUrl(`/notifications/read/${notificationId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(notifications.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        ));
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(getApiUrl(`/notifications/${notificationId}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(notifications.filter(notif => notif._id !== notificationId));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b18] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-lg">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b18] text-white">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10 p-6 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Bell className="text-yellow-400" size={32} />
              <div>
                <h1 className="text-4xl font-bold text-[#facc15]">Notifications</h1>
                <p className="text-white/60 mt-1">Purchase requests from buyers</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="px-6 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-500 transition"
            >
              Back to Profile
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'all'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'unread'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'read'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
            Error: {error}
          </div>
        )}

        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="mx-auto mb-4 text-white/40" size={64} />
            <h2 className="text-2xl font-bold text-white/60 mb-2">No notifications</h2>
            <p className="text-white/40">
              {filter === 'unread' 
                ? 'You have no unread notifications' 
                : filter === 'read'
                ? 'You have no read notifications'
                : 'You have no notifications yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white/5 border rounded-xl p-6 backdrop-blur-md transition hover:bg-white/10 ${
                  notification.isRead ? 'border-white/10' : 'border-yellow-400/50 bg-yellow-400/5'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Product Image */}
                    {notification.productDetails?.imageUrl && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={notification.productDetails.imageUrl}
                          alt={notification.productDetails.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/96x96?text=No+Image';
                          }}
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      {/* Title and Badge */}
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-yellow-400">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="px-2 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full">
                            NEW
                          </span>
                        )}
                      </div>

                      <p className="text-white/80 mb-3">{notification.message}</p>

                      {/* Date */}
                      <div className="flex items-center text-white/50 text-sm mb-4">
                        <Calendar size={14} className="mr-2" />
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>

                      {/* Product Details */}
                      {notification.productDetails && (
                        <div className="bg-white/5 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Package size={16} className="text-yellow-400" />
                            <span className="text-white font-semibold">Product Details</span>
                          </div>
                          <p className="text-white/80 mb-1">
                            <strong>Product:</strong> {notification.productDetails.title}
                          </p>
                        </div>
                      )}

                      {/* Buyer Details */}
                      {notification.buyerDetails && (
                        <div className="bg-white/5 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <ShoppingBag size={16} className="text-yellow-400" />
                            <span className="text-white font-semibold">Buyer Contact Information</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center text-white/80">
                              <User size={16} className="mr-2 text-yellow-400" />
                              <div>
                                <span className="text-white/60 text-xs">Name</span>
                                <p className="text-white font-semibold">{notification.buyerDetails.name}</p>
                              </div>
                            </div>
                            <div className="flex items-center text-white/80">
                              <Mail size={16} className="mr-2 text-yellow-400" />
                              <div>
                                <span className="text-white/60 text-xs">Email</span>
                                <a
                                  href={`mailto:${notification.buyerDetails.email}`}
                                  className="text-yellow-400 hover:underline font-semibold block"
                                >
                                  {notification.buyerDetails.email}
                                </a>
                              </div>
                            </div>
                            {notification.buyerDetails.phone && (
                              <div className="flex items-center text-white/80">
                                <Phone size={16} className="mr-2 text-yellow-400" />
                                <div>
                                  <span className="text-white/60 text-xs">Phone</span>
                                  <a
                                    href={`tel:${notification.buyerDetails.phone}`}
                                    className="text-yellow-400 hover:underline font-semibold block"
                                  >
                                    {notification.buyerDetails.phone}
                                  </a>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center text-white/80">
                              <span className="text-white/60 text-xs mr-2">Roll No:</span>
                              <p className="text-white font-semibold">{notification.buyerDetails.rollNo}</p>
                            </div>
                            {notification.buyerDetails.department && (
                              <div className="flex items-center text-white/80">
                                <span className="text-white/60 text-xs mr-2">Department:</span>
                                <p className="text-white font-semibold">{notification.buyerDetails.department}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition"
                        title="Mark as read"
                      >
                        <Check size={20} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
