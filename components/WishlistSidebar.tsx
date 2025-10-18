"use client";

import React from 'react';
import { useWishlist } from './contexts/WishlistContext';
import { FiX, FiHeart } from 'react-icons/fi';

const WishlistSidebar: React.FC = () => {
  const { state, toggleWishlist, removeFromWishlist, clearWishlist } = useWishlist();

  if (!state.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={toggleWishlist}
      />
      
      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Wishlist ({state.totalItems})
            </h2>
            <button
              onClick={toggleWishlist}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Wishlist Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {state.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <FiHeart size={48} className="mb-4" />
                <p className="text-lg">Your wishlist is empty</p>
                <p className="text-sm">Add some items you love</p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={`${item.id}-${item.selectedColor || 'default'}`} className="flex items-center space-x-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                      {item.selectedColor && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Color: {item.selectedColor}</p>
                      )}
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Rs. {item.price.toLocaleString('en-IN')}</p>
                    </div>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {state.items.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <button
                onClick={clearWishlist}
                className="w-full text-gray-600 dark:text-gray-400 py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Clear Wishlist
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistSidebar;
