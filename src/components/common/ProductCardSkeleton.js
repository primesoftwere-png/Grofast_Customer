import React from 'react';

const ProductCardSkeleton = () => {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full w-full">
      {/* Product Image (Always perfectly square) */}
      <div className="w-full aspect-square bg-gray-100 rounded-xl animate-pulse mb-4"></div>
      
      {/* Product Title Lines */}
      <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
      <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse mb-4"></div>
      
      {/* Price and Add Button */}
      <div className="mt-auto flex justify-between items-end pt-2">
        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
        {/* Mimics a round "Add to cart" + button */}
        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
