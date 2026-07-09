import React from 'react';

const EcommerceLoader = ({
  items = [], // Kept for backward compatibility
  message = 'Processing...',
  fullScreen = true,
  overlayColor = 'bg-white/90 dark:bg-gray-900/90',
  blur = 'backdrop-blur-md',
}) => {
  const containerClasses = fullScreen
    ? `fixed top-0 left-0 w-screen h-screen flex flex-col items-center justify-center z-[99999] ${overlayColor} ${blur} overflow-hidden`
    : `flex flex-col items-center justify-center w-full h-full min-h-[250px] p-8 ${overlayColor} rounded-2xl`;

  return (
    <div className={containerClasses}>
      <style>{`
        @keyframes floating {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes itemDrop {
          0% { transform: translateY(-40px) scale(0); opacity: 0; }
          20% { transform: translateY(-20px) scale(1.2); opacity: 1; }
          80% { transform: translateY(10px) scale(1); opacity: 1; }
          100% { transform: translateY(20px) scale(0.5); opacity: 0; }
        }
        @keyframes pulse-shadow {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(0.7); opacity: 0.1; }
        }
        .animate-floating {
          animation: floating 2s ease-in-out infinite;
        }
        .shadow-pulse {
          animation: pulse-shadow 2s ease-in-out infinite;
        }
        .drop-1 { animation: itemDrop 1.8s ease-in-out infinite; animation-delay: 0s; }
        .drop-2 { animation: itemDrop 1.8s ease-in-out infinite; animation-delay: 0.6s; }
        .drop-3 { animation: itemDrop 1.8s ease-in-out infinite; animation-delay: 1.2s; }
      `}</style>
      
      <div className="relative flex flex-col items-center justify-center">
        
        {/* Animated Objects */}
        <div className="relative w-32 h-32 flex items-center justify-center animate-floating z-10">
          
          {/* Dropping Items */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex justify-center w-full h-full z-0">
            <div className="absolute top-0 w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg drop-1 rotate-12 shadow-md"></div>
            <div className="absolute top-0 w-5 h-5 bg-gradient-to-br from-orange-400 to-red-500 rounded-full drop-2 -rotate-12 shadow-md ml-8"></div>
            <div className="absolute top-0 w-7 h-7 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-md drop-3 rotate-45 shadow-md -ml-8"></div>
          </div>

          {/* Shopping Bag SVG */}
          <div className="relative mt-10 text-emerald-500 dark:text-emerald-400 z-10 drop-shadow-xl bg-white dark:bg-gray-800 rounded-b-xl">
            <svg 
              width="72" 
              height="72" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" fill="currentColor" fillOpacity="0.1" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
        </div>

        {/* Shadow */}
        <div className="w-20 h-2.5 bg-emerald-900/30 dark:bg-black/50 rounded-[100%] shadow-pulse mt-6 blur-[2px]"></div>

        {/* Text */}
        {message && (
          <div className="mt-8 flex flex-col items-center">
            <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-emerald-600 dark:text-emerald-400">
              {message}
            </h3>
            <div className="flex gap-1.5 mt-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EcommerceLoader;
