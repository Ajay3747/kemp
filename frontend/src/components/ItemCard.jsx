import React from 'react';
import { ShoppingBag, Star, Mail } from 'lucide-react';

export default function ItemCard({ name, price, description, imageUrl, sellerEmail, hidePrice }) {
  return (
    <div className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer h-full flex flex-col">
      <div className="relative w-full pt-[100%] overflow-hidden bg-gray-800">
        <img
          src={imageUrl}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover transform hover:scale-110 transition-transform duration-500 ease-in-out"
        />
        {!hidePrice && price && price !== '₹0' && price !== '₹undefined' && price !== '₹null' && (
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black/50 backdrop-blur-sm text-yellow-400 py-1 px-2 sm:px-3 rounded-full font-bold text-xs sm:text-sm">
            {price}
          </div>
        )}
      </div>
      <div className="p-3 sm:p-6 flex flex-col flex-grow">
        <h3 className="text-base sm:text-xl font-bold text-white mb-2 line-clamp-2">{name}</h3>
        <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 flex-grow">{description}</p>
        
        {/* Seller Contact Info */}
        <div className="flex items-center text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm">
          <Mail size={14} className="mr-2 flex-shrink-0" />
          <a 
            href={`mailto:${sellerEmail}`} 
            className="text-yellow-400 hover:underline transition-colors duration-300 truncate"
          >
            {sellerEmail}
          </a>
        </div>
        
        {/* Rating and Action */}
        <div className="flex justify-between items-center mt-auto pt-3 sm:pt-4 border-t border-gray-700">
          <div className="flex items-center text-yellow-400">
            <Star size={12} fill="currentColor" className="mr-0.5 sm:mr-1" />
            <Star size={12} fill="currentColor" className="mr-0.5 sm:mr-1" />
            <Star size={12} fill="currentColor" className="mr-0.5 sm:mr-1" />
            <Star size={12} fill="currentColor" className="mr-0.5 sm:mr-1" />
            <Star size={12} className="text-gray-600" />
          </div>
          <button className="flex items-center text-black bg-yellow-400 py-1.5 px-2 sm:py-2 sm:px-4 rounded-full font-bold text-xs sm:text-sm hover:bg-yellow-500 transition-colors duration-300 flex-shrink-0">
            <ShoppingBag size={14} className="mr-1 sm:mr-2" /> Buy
          </button>
        </div>
      </div>
    </div>
  );
}