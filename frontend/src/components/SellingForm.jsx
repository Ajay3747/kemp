import React, { useState } from 'react';
import { Camera, Image, Tag, DollarSign, Text, FileText, Compass, Send } from 'lucide-react';

const API_URL = "http://localhost:5000/api/products";

const categories = [
  'Books', 'Electronics', 'Dorm Essentials', 'Furniture', 'Apparel', 'Services', 'Other'
];

export default function SellingForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    condition: 'used',
    images: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      setError('User not authenticated. Please log in again.');
      return;
    }

    if (!formData.title || !formData.description || !formData.category) {
      setError('All fields are required');
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('price', formData.price);
      form.append('category', formData.category);
      form.append('condition', formData.condition);
      form.append('sellerId', userId);
      
      if (formData.images.length > 0) {
        form.append('image', formData.images[0]);
      }

      const response = await fetch(`${API_URL}/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: form
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create listing');
      }

      const data = await response.json();
      console.log('Product listed:', data);
      
      setSuccess(true);
      setError("");
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        price: 0,
        category: '',
        condition: 'used',
        images: []
      });

      // Show success message
      alert('Item listed successfully! It will appear in the Dealing page.');
      
      // Clear success after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error creating listing:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full bg-gray-800 text-white rounded-lg p-2.5 sm:p-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 placeholder-gray-500";
  const labelStyle = "block text-white font-semibold text-base sm:text-lg mb-2 flex items-center";
  const iconStyle = "text-yellow-400 mr-2 flex-shrink-0";
  const sectionStyle = "bg-gray-900 rounded-xl p-4 sm:p-6 md:p-8 shadow-2xl mb-6 sm:mb-8";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      
      {error && (
        <div className="p-3 sm:p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm sm:text-base">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 sm:p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-200 text-sm sm:text-base">
          ✓ Item listed successfully! It will appear in the Dealing page.
        </div>
      )}
      
      {/* Basic Information */}
      <div className={sectionStyle}>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-400 mb-4 sm:mb-6">Product Details</h2>
        <div className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="title" className={labelStyle}><Tag size={18} className={iconStyle} />Item Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., 'Thermodynamics Textbook'"
              className={inputStyle}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="description" className={labelStyle}><Text size={18} className={iconStyle} />Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe the item, its condition, and any key features."
              className={inputStyle}
              required
              disabled={loading}
            ></textarea>
          </div>
        </div>
      </div>
      
      {/* Pricing and Category */}
      <div className={sectionStyle}>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-400 mb-4 sm:mb-6">Categorization</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label htmlFor="category" className={labelStyle}><Compass size={18} className={iconStyle} />Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`${inputStyle} appearance-none pr-8`}
              required
              disabled={loading}
            >
              <option value="" disabled>Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div>
            <label htmlFor="condition" className={labelStyle}><FileText size={18} className={iconStyle} />Condition</label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className={`${inputStyle} appearance-none pr-8`}
              disabled={loading}
            >
              <option value="new">New</option>
              <option value="like-new">Like New</option>
              <option value="used">Used</option>
              <option value="fair">Fair</option>
            </select>
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div className={sectionStyle}>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-400 mb-3 sm:mb-6">Item Photos</h2>
        <p className="text-gray-400 mb-4 text-sm sm:text-base">Add high-quality photos to attract buyers.</p>
        <div className={`border-2 border-dashed border-gray-700 rounded-xl p-6 sm:p-8 text-center transition-colors duration-300 hover:border-yellow-400 ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
          <label htmlFor="image-upload" className={loading ? 'cursor-not-allowed' : 'cursor-pointer'}>
            <div className="flex flex-col items-center">
              <Image size={40} className="text-yellow-400 mb-2 sm:mb-3" />
              <span className="text-base sm:text-lg font-bold text-white mb-1">Drag & Drop or Click to Upload</span>
              <span className="text-xs sm:text-sm text-gray-500">Maximum 5 images (First image will be thumbnail)</span>
            </div>
            <input
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              disabled={loading}
            />
          </label>
        </div>
        
        {/* Image Preview */}
        {formData.images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-6">
            {formData.images.map((file, index) => (
              <div key={index} className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded font-bold">Main</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          type="submit"
          disabled={loading}
          className={`font-bold py-3 px-8 sm:py-4 sm:px-12 rounded-full text-base sm:text-lg shadow-lg flex items-center justify-center mx-auto transition-all duration-300 w-full sm:w-auto ${
            loading 
              ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
              : 'bg-yellow-400 text-black hover:scale-105'
          }`}
        >
          <Send size={18} className="mr-2 sm:mr-3" />
          {loading ? 'Listing Item...' : 'List Item Now'}
        </button>
      </div>
    </form>
  );
}