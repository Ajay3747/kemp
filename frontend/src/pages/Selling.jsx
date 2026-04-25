import React from 'react';
import SellingForm from '../components/SellingForm';

export default function Selling() {
  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto py-6 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-wide leading-tight mb-3 sm:mb-4">
            List Your Item
          </h1>
          <p className="text-base sm:text-lg text-gray-400 font-light max-w-2xl mx-auto px-2">
            Ready to sell? Fill out the details below to list your item for thousands of students to see.
          </p>
        </div>
        <SellingForm />
      </div>
    </div>
  );
}