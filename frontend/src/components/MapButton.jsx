import React from 'react';

const MapButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8 z-50 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3 text-black text-xs sm:text-sm md:text-base font-bold bg-yellow-400 rounded-full shadow-lg hover:bg-yellow-300 hover:scale-105 transition-all duration-300"
    >
      Map
    </button>
  );
};

export default MapButton;