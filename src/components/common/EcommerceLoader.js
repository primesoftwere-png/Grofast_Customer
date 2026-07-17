'use client';

import React from 'react';

const ShoppingCartLoader = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen bg-white overflow-hidden">
      {/* 
        Embedded custom CSS keyframes for the specific timing of the animation.
        This handles the cart moving in, stopping, bags dropping, and moving out.
      */}
      <style>{`
        @keyframes cartMove {
          0% { transform: translateX(-150vw); }
          25% { transform: translateX(0); }
          60% { transform: translateX(0); }
          100% { transform: translateX(150vw); }
        }
        @keyframes bagsDrop {
          0%, 25% { opacity: 0; transform: translateY(-40px); }
          35% { opacity: 1; transform: translateY(0); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes linesPulse {
          0%, 20% { opacity: 1; transform: translateX(0); }
          25%, 60% { opacity: 0; transform: translateX(20px); }
          65%, 100% { opacity: 1; transform: translateX(0); }
        }
        .animate-cart {
          animation: cartMove 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-bags {
          animation: bagsDrop 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-lines {
          animation: linesPulse 3s ease-in-out infinite;
        }
      `}</style>

      {/* Main Cart Container */}
      <div className="relative flex items-center animate-cart">
        
        {/* Speed Lines */}
        <div className="absolute -left-16 flex flex-col gap-2 animate-lines z-0">
          <div className="w-10 h-1.5 bg-[#FFC107] rounded-full ml-4" />
          <div className="w-14 h-1.5 bg-[#FFC107] rounded-full" />
          <div className="w-10 h-1.5 bg-[#FFC107] rounded-full ml-2" />
        </div>

        {/* Cart & Bags Wrapper */}
        <div className="relative z-10 w-48 h-48">
          
          {/* Bags Group (Drops in when cart stops) */}
          <div className="absolute bottom-[32%] left-[25%] flex items-end animate-bags z-10">
            {/* Left White Bag */}
            <svg className="absolute -left-2 bottom-0 w-12 h-16 translate-x-2 translate-y-1 rotate-[-10deg]" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 15H35V48H5V15Z" fill="#F3F4F6" stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M12 15C12 5 28 5 28 15" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            
            {/* Right White Bag */}
            <svg className="absolute left-10 bottom-0 w-10 h-14 -translate-y-2 translate-x-2 rotate-[10deg]" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 15H35V48H5V15Z" fill="#F3F4F6" stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M12 15C12 5 28 5 28 15" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            
            {/* Center Yellow Bag */}
            <svg className="absolute left-2 bottom-0 w-14 h-18 z-20" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 15H35V48H5V15Z" fill="#FFC107" stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M12 15C12 5 28 5 28 15" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>

          {/* Cart Structure SVG */}
          <svg className="absolute inset-0 w-full h-full z-30" viewBox="0 0 120 120" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Cart Handle & Frame */}
            <circle cx="22" cy="30" r="2.5" fill="black" />
            <path d="M 22 30 L 35 55 L 38 85 L 85 85" />
            <path d="M 35 55 L 98 55 L 88 85" />
            
            {/* Basket Vertical Lines */}
            <line x1="45" y1="55" x2="48" y2="85" />
            <line x1="55" y1="55" x2="57" y2="85" />
            <line x1="66" y1="55" x2="67" y2="85" />
            <line x1="77" y1="55" x2="77" y2="85" />
            <line x1="88" y1="55" x2="87" y2="85" />
            
            {/* Basket Horizontal Lines */}
            <line x1="36" y1="65" x2="95" y2="65" />
            <line x1="37" y1="75" x2="91" y2="75" />
            
            {/* Left Wheel */}
            <circle cx="50" cy="98" r="7" fill="white" strokeWidth="2"/>
            <path d="M 47 95 L 53 101 M 53 95 L 47 101 M 50 93 L 50 103 M 45 98 L 55 98" stroke="black" strokeWidth="1" />
            
            {/* Right Wheel */}
            <circle cx="78" cy="98" r="7" fill="white" strokeWidth="2"/>
            <path d="M 75 95 L 81 101 M 81 95 L 75 101 M 78 93 L 78 103 M 73 98 L 83 98" stroke="black" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartLoader;