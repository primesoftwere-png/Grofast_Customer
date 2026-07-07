import React from 'react';

const EcommerceLoader = ({
  items = ['🍎', '🥦', '🥕', '🍌', '🍇'],
  message = 'Packing your cart...',
  fullScreen = true,
  overlayColor = 'bg-gray-50/90',
  blur = 'backdrop-blur-sm',
  iconColor = 'text-emerald-600',
  iconBg = 'bg-white',
  iconBorder = 'border-emerald-100',
  textColor = 'text-emerald-700',
}) => {
  const containerClasses = fullScreen
    ? `fixed inset-0 flex items-center justify-center z-[100] ${overlayColor} ${blur}`
    : `flex items-center justify-center w-full h-full p-8 ${overlayColor} rounded-xl`;

  return (
    <div className={containerClasses}>
      {/* Inline styles for the custom dropping animation */}
      <style>{`
        @keyframes drop {
          0% { transform: translateY(-50px) scale(0.5) rotate(-15deg); opacity: 0; }
          20% { transform: translateY(-20px) scale(1.2) rotate(10deg); opacity: 1; }
          70% { transform: translateY(15px) scale(1) rotate(0deg); opacity: 1; }
          100% { transform: translateY(30px) scale(0.5); opacity: 0; }
        }
        .animate-drop {
          animation: drop 2.5s infinite ease-in-out;
        }
      `}</style>
      
      <div className="relative flex flex-col items-center justify-end h-48 w-48">
        
        {/* Dropping Items Container */}
        <div className="absolute top-0 flex justify-center w-full h-full">
          {items.map((item, index) => (
            <span
              key={index}
              className="absolute text-4xl animate-drop"
              style={{
                // Stagger the animation so they drop one after the other
                animationDelay: `${index * 0.5}s`,
              }}
            >
              {item}
            </span>
          ))}
        </div>

        {/* Shopping Cart Icon Container */}
        <div className={`relative z-10 p-5 rounded-full shadow-xl border-2 mb-2 ${iconColor} ${iconBg} ${iconBorder}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
        </div>
        
        {/* Loading Text */}
        {message && (
          <p className={`mt-4 font-semibold tracking-wide animate-pulse text-center ${textColor}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default EcommerceLoader;
