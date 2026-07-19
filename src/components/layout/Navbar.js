"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Search,
  ShoppingCart,
  Menu,
  User,
  Clock,
  LogIn,
  Settings,
  LogOut,
  Package,
} from "lucide-react";
import { authAPI } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { addressAPI } from "@/services/address.api";
import AddressSelectionModal from "@/components/Cart/AddressSelectionModal";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState(null);
  const searchRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("Select Address");
  const [currentAddressId, setCurrentAddressId] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http") || imagePath.startsWith("blob:")) return imagePath;
    const cleanPath = imagePath.replace(/^[/\\]+/, "");
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const baseUrl = apiBase.replace(/\/api\/?$/, "");
    return `${baseUrl}/${cleanPath.startsWith("uploads/") ? cleanPath : `uploads/${cleanPath}`}`;
  };

  const { totalItems } = useCart();

  const router = useRouter();

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setAiSearchResults(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // AI Search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsAiSearching(true);
        try {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
          const chatUrl = `${apiBaseUrl}/ai/search`;
          const res = await fetch(chatUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: searchQuery })
          });
          const data = await res.json();
          if (data.success && data.data && data.data.data) {
             setAiSearchResults(data.data.data);
          } else {
             setAiSearchResults([]);
          }
        } catch (error) {
          console.error("AI Search Error:", error);
          setAiSearchResults([]);
        } finally {
          setIsAiSearching(false);
        }
      } else {
        setAiSearchResults(null);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    const fetchAddress = async (userData) => {
      try {
        if (!userData) return;
        const userId = userData._id || userData.id;
        
        const savedAddressId = localStorage.getItem("deliveryAddressId");
        if (savedAddressId) {
          setCurrentAddressId(savedAddressId);
        }

        // Check localStorage first
        const savedAddress = localStorage.getItem("deliveryAddress");
        if (savedAddress) {
          const parsed = JSON.parse(savedAddress);
          if (parsed.city || parsed.addressLine1) {
            setCurrentAddress(`${parsed.city || ''} ${parsed.pincode || ''}`.trim() || "Delivery Address Set");
            return;
          }
        }

        // Otherwise fetch default from API
        try {
          const defaultRes = await addressAPI.getDefaultAddress(userId);
          if (defaultRes?.data) {
            setCurrentAddressId(defaultRes.data._id || defaultRes.data.id);
            setCurrentAddress(`${defaultRes.data.city || ''} ${defaultRes.data.pincode || ''}`.trim() || "Delivery Address Set");
            return;
          }
        } catch (e) {
          // Ignore, fallback to user addresses
        }

        const addressesRes = await addressAPI.getUserAddresses(userId);
        if (addressesRes?.data && addressesRes.data.length > 0) {
          const addr = addressesRes.data[0];
          setCurrentAddressId(addr._id || addr.id);
          setCurrentAddress(`${addr.city || ''} ${addr.pincode || ''}`.trim() || "Delivery Address Set");
        }
      } catch (error) {
        console.error("Error fetching address for navbar:", error);
      }
    };

    const checkAuth = () => {
      const authenticated = authAPI.isAuthenticated();
      const userData = authAPI.getCurrentUser();
      setIsLoggedIn(authenticated);
      setUser(userData);
      
      if (authenticated && userData) {
        fetchAddress(userData);
      } else {
        setCurrentAddress("Select Address");
      }
    };

    checkAuth();

    // Listen for storage changes (login/logout in other tabs)
    window.addEventListener('storage', checkAuth);
    
    // Custom event for same-tab updates
    window.addEventListener('authChange', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API
      await authAPI.logout();
      
      setIsLoggedIn(false);
      setUser(null);
      setShowUserMenu(false);
      setIsMenuOpen(false);
      
      // Dispatch custom event for auth change
      window.dispatchEvent(new Event('authChange'));
      
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still show success since local storage is cleared
      toast.success('Logged out successfully');
      router.push('/');
    }
  };

  const menuItems = [
    { label: "Home", path: "/", icon: "🏠" },
    { label: "Categories", path: "/categories", icon: "📂" },
    { label: "Nearby Shops", path: "/nearby-shops", icon: "🏪" },
    { label: "Offers", path: "/offers", icon: "🏷️" },
  ];

  const userMenuItems = isLoggedIn ? [
    { label: "Orders", path: "/orders", icon: Package },
    { label: "Profile", path: "/profile", icon: User },
    { label: "Settings", path: "/profile", icon: Settings },
  ] : [];

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-md">
      <div className="container mx-auto">
        
        {/* Top bar */}
        <div className="flex items-center justify-between py-2 px-4 border-b border-primary-foreground/10 gap-2 overflow-hidden w-full min-w-0">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="w-28 h-12 sm:w-44 sm:h-16 relative flex items-center justify-start ml-1 sm:ml-2">
              <img 
                src="/grofast.png" 
                alt="GroFast Logo" 
                className="w-full h-full object-contain object-left scale-[1.2] sm:scale-[1.5] origin-left"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-background rounded-lg hidden items-center justify-center">
                <span className="text-xl sm:text-2xl font-bold text-primary">G</span>
              </div>
            </div>
          </Link>

          {/* Address Button */}
          <button 
            onClick={() => {
              if (isLoggedIn) {
                setIsAddressModalOpen(true);
              } else {
                router.push("/auth");
              }
            }}
            className="flex items-center gap-1.5 sm:gap-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-lg px-2 sm:px-3 py-1.5 transition-colors text-left min-w-0 shrink"
          >
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <div className="text-left min-w-0">
              <p className="text-[10px] sm:text-xs opacity-80 leading-tight">Deliver to</p>
              <p className="text-xs sm:text-sm font-medium truncate max-w-[100px] sm:max-w-[200px]">
                {currentAddress}
              </p>
            </div>
          </button>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="hidden md:flex items-center gap-1 text-primary-foreground text-sm bg-primary-foreground/10 rounded-lg px-3 py-1.5">
              <Clock className="w-4 h-4" />
              <span>15-20 min</span>
            </div>

            {/* Desktop and Mobile Login/User Menu */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => router.push('/profile')}
                  className="flex items-center gap-1.5 sm:gap-2.5 bg-white/10 hover:bg-white/25 text-white px-1.5 sm:px-3 py-1.5 rounded-full transition-all duration-300 border border-white/20 shadow-sm hover:scale-105 active:scale-95 transform"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white text-primary rounded-full flex items-center justify-center font-bold text-xs sm:text-sm overflow-hidden">
                    {(user?.profileImage || user?.avatar) && !imageError ? (
                      <img 
                        src={getImageUrl(user.profileImage || user.avatar)} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  <span className="hidden sm:inline font-semibold text-sm max-w-[100px] truncate">{user?.name?.split(' ')[0] || 'User'}</span>
                </button>
              </div>
            ) : (
              <Link href="/auth">
                <button className="flex items-center gap-1.5 sm:gap-2 font-semibold bg-white text-primary px-3 sm:px-5 py-1.5 sm:py-2 rounded-full hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:scale-105 active:scale-95 active:translate-y-0 transform">
                  <LogIn className="w-4 h-4" /> 
                  <span className="hidden sm:inline">Login</span>
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Main navbar */}
        <div className="flex items-center gap-2 sm:gap-3 py-2 sm:py-3 px-4 min-w-0 w-full">
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden text-primary-foreground hover:bg-primary-foreground/10 p-1 sm:p-2 rounded shrink-0"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Mobile Sidebar */}
          {isMenuOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div className="w-72 max-w-[80vw] bg-white h-full p-4 shadow-lg overflow-y-auto">
                
                {/* User Info */}
                {isLoggedIn && user && (
                  <div className="mb-4 p-4 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                        {(user?.profileImage || user?.avatar) && !imageError ? (
                          <img 
                            src={getImageUrl(user.profileImage || user.avatar)} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <User className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                        <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                <h2 className="text-lg font-semibold mb-4">Menu</h2>

                <nav className="flex flex-col gap-1">
                  {menuItems.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100"
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}

                  {isLoggedIn && (
                    <>
                      <hr className="my-2" />
                      {userMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.path + item.label}
                            href={item.path}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100"
                          >
                            <Icon className="w-5 h-5 text-gray-500" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </>
                  )}

                  <hr className="my-2" />

                  {isLoggedIn ? (
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 w-full text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  ) : (
                    <Link
                      href="/auth"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-white mt-3"
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Login / Sign Up</span>
                    </Link>
                  )}
                </nav>
              </div>

              {/* Overlay */}
              <div
                className="flex-1 bg-black/40"
                onClick={() => setIsMenuOpen(false)}
              />
            </div>
          )}

          {/* Search */}
          <div className="flex-1 min-w-0 relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="w-full min-w-0">
              <div className="relative w-full min-w-0">
                <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search groceries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full min-w-0 bg-background rounded-xl pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-background/50"
                />
                {isAiSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 shrink-0">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </form>
            
            {/* AI Search Results Dropdown */}
            {aiSearchResults !== null && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-96 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-4">
                {aiSearchResults.length > 0 ? (
                  <div className="p-2 flex flex-col gap-1">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                       <span>AI Powered Results</span>
                       <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">AI</span>
                    </div>
                    {aiSearchResults.map((product, index) => (
                      <Link 
                        key={`${product._id || product.id || 'res'}-${index}`} 
                        href={`/product/${product._id || product.id}`}
                        onClick={() => {
                          setAiSearchResults(null);
                          setSearchQuery("");
                        }}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-800 group-hover:text-primary transition-colors line-clamp-1">{product.productName}</span>
                          <span className="text-xs text-gray-500">{product.productCategory?.categoryName || 'Product'} • {product.productUnit}</span>
                        </div>
                        <span className="font-semibold text-sm text-gray-900 whitespace-nowrap ml-2">₹{product.productPrice}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No products found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10 rounded-lg"
              >
                {item.label}
              </Link>
            ))}
            {isLoggedIn && (
              <Link
                href="/orders"
                className="px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10 rounded-lg"
              >
                Orders
              </Link>
            )}
          </nav>

          {/* Cart */}
          <Link href="/cart" className="relative shrink-0">
            <button className="text-primary-foreground hover:bg-primary-foreground/10 p-1 sm:p-2 rounded relative">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />

              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-5 bg-secondary text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center text-secondary-foreground px-1 sm:px-1.5 shadow-md">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </Link>

          {/* Mobile Auth Icon */}
          {isLoggedIn ? (
            <Link href="/profile" className="sm:hidden shrink-0">
              <button className="text-primary-foreground hover:bg-primary-foreground/10 p-1 rounded flex items-center justify-center">
                {(user?.profileImage || user?.avatar) && !imageError ? (
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20">
                    <img 
                      src={getImageUrl(user.profileImage || user.avatar)} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  </div>
                ) : (
                  <User className="w-5 h-5" />
                )}
              </button>
            </Link>
          ) : (
            <Link href="/auth" className="sm:hidden shrink-0">
              <button className="text-primary-foreground hover:bg-primary-foreground/10 p-1 rounded">
                <LogIn className="w-5 h-5" />
              </button>
            </Link>
          )}
        </div>
      </div>



      {/* Global Address Selection Modal */}
      <AddressSelectionModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        userId={user?._id || user?.id}
        currentAddressId={currentAddressId}
        onSelect={(addr) => {
          setCurrentAddress(`${addr.city || ''} ${addr.pincode || ''}`.trim() || "Delivery Address Set");
          setCurrentAddressId(addr._id || addr.id);
        }}
      />
    </header>
  );
}