import React, { useState } from 'react';
import { X, ShoppingBag, Star, Mail, User, Package, Send, Phone } from 'lucide-react';

export default function ProductDetailModal({ product, onClose }) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const newReview = {
      rating: 5,
      comment: reviewText,
      name: userData.username || 'Anonymous',
      date: new Date().toLocaleDateString()
    };
  };
    

  const handleBuyNow = async () => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userId = localStorage.getItem('userId');
    
    if (!userData.username || !userId) {
      alert('Please login first to make a purchase');
      return;
    }

    // Check if user is trying to buy their own product
    if (product.sellerId === userId) {
      alert('You cannot buy your own product!');
      return;
    }

    try {
      // Send notification to seller
      const notificationResponse = await fetch('http://localhost:5000/api/notifications/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId: product._id,
          buyerId: userId
        })
      });

      if (!notificationResponse.ok) {
        throw new Error('Failed to send notification to seller');
      }

      const purchase = {
        id: Date.now(),
        name: product.title || product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        buyerName: userData.username,
        buyerEmail: userData.collegeEmail,
        buyerRollNo: userData.rollNo,
        sellerName: product.sellerName,
        sellerEmail: product.sellerEmail,
        purchaseDate: new Date().toISOString()
      };

      // Get existing purchases
      const existingPurchases = JSON.parse(localStorage.getItem('purchases') || '[]');
      
      // Add new purchase
      existingPurchases.push(purchase);
      
      // Save to localStorage
      localStorage.setItem('purchases', JSON.stringify(existingPurchases));
      
      alert(`Purchase request sent successfully!\n\nThe seller (${product.sellerName}) has been notified with your contact details:\n- Name: ${userData.username}\n- Email: ${userData.collegeEmail}\n- Phone: ${userData.phone}\n- Roll No: ${userData.rollNo}\n\nThey will contact you soon!`);
      onClose();
    } catch (error) {
      console.error('Error processing purchase:', error);
      alert('Failed to process purchase request. Please try again.');
    }
  };

  const longDescription = product.longDescription || product.description;

  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-70 flex justify-center items-center p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-2xl shadow-xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex justify-end p-4">
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={28} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto scrollbar-custom p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="relative rounded-xl overflow-hidden shadow-lg h-96">
              <img
                src={product.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'}
                alt={product.title || product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                }}
              />
            </div>

            <div className="flex flex-col">
              <h1 className="text-4xl font-bold text-yellow-400 mb-4">{product.title || product.name}</h1>
              
              <div className="bg-gray-800 rounded-xl p-4 mb-6">
                <p className="text-gray-300 leading-relaxed mb-4">
                  {showFullDescription ? longDescription : product.description}
                  {longDescription.length > product.description.length && (
                    <span
                      onClick={toggleDescription}
                      className="text-yellow-400 cursor-pointer ml-2 hover:underline"
                    >
                      {showFullDescription ? 'Show less' : 'Show more'}
                    </span>
                  )}
                </p>
                <div className="flex items-center text-gray-400 mb-2">
                  <Package size={18} className="mr-2" />
                  <span>
                    Stock: <span className="text-white font-semibold">{product.stockAvailable || 'Not Specified'}</span>
                  </span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Seller Info</h2>
              <div className="bg-gray-800 rounded-xl p-4 mb-6">
                <div className="flex items-center text-gray-300 mb-3">
                  <User size={18} className="mr-2 text-yellow-400" />
                  <span className="font-semibold text-white">{product.sellerName}</span>
                </div>
                <div className="flex items-center text-gray-300 mb-3">
                  <Mail size={18} className="mr-2 text-yellow-400" />
                  <a href={`mailto:${product.sellerEmail}`} className="text-sm text-yellow-400 hover:underline transition-colors duration-300">
                    {product.sellerEmail}
                  </a>
                </div>
                {product.sellerPhone && (
                  <div className="flex items-center text-gray-300 mb-3">
                    <Phone size={18} className="mr-2 text-yellow-400" />
                    <a href={`tel:${product.sellerPhone}`} className="text-sm text-yellow-400 hover:underline transition-colors duration-300">
                      {product.sellerPhone}
                    </a>
                  </div>
                )}
              </div>

              {/* Reviews section fully removed as per request */}

              <button 
                onClick={handleBuyNow}
                className="bg-yellow-400 text-black font-bold py-4 px-10 rounded-full text-lg shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center"
              >
                <ShoppingBag size={24} className="mr-3" /> Deal Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}