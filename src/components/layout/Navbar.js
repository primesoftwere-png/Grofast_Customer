"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
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

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const totalItems = 2; // Replace with actual cart count

  const router = useRouter();

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authAPI.isAuthenticated();
      const userData = authAPI.getCurrentUser();
      setIsLoggedIn(authenticated);
      setUser(userData);
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
        <div className="flex items-center justify-between py-2 px-1 border-b border-primary-foreground/10">
          
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-background rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-primary">G</span>
            </div>
            <span className="font-bold text-lg text-primary-foreground hidden sm:block">
              GroFast
            </span>
          </Link>

          <button className="flex items-center gap-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-lg px-3 py-1.5 transition-colors">
            <MapPin className="w-4 h-4" />
            <div className="text-left">
              <p className="text-xs opacity-80">Deliver to</p>
              <p className="text-sm font-medium truncate max-w-[150px] sm:max-w-[200px]">
                123 Main Street, NYC
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-primary-foreground text-sm bg-primary-foreground/10 rounded-lg px-3 py-1.5">
              <Clock className="w-4 h-4" />
              <span>15-20 min</span>
            </div>

            {/* Desktop Login/User Menu */}
            {isLoggedIn ? (
              <div className="hidden sm:block relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 font-semibold bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md hover:bg-secondary/90 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="max-w-[100px] truncate">{user?.name || 'User'}</span>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <Link
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700"
                    >
                      <Package className="w-4 h-4" />
                      Orders
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth">
                <button className="hidden sm:flex items-center gap-1 font-semibold bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md hover:bg-secondary/90 transition-colors">
                  <LogIn className="w-4 h-4" /> Login
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Main navbar */}
        <div className="flex items-center gap-3 py-3 px-1">
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden text-primary-foreground hover:bg-primary-foreground/10 p-2 rounded"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Sidebar */}
          {isMenuOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div className="w-72 bg-white h-full p-4 shadow-lg overflow-y-auto">
                
                {/* User Info */}
                {isLoggedIn && user && (
                  <div className="mb-4 p-4 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
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
                            key={item.path}
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
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for groceries, essentials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-background/50"
              />
            </div>
          </form>

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
          <Link href="/cart" className="relative">
            <button className="text-primary-foreground hover:bg-primary-foreground/10 p-2 rounded relative">
              <ShoppingCart className="w-5 h-5" />

              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-xs font-bold rounded-full flex items-center justify-center text-secondary-foreground">
                  {totalItems}
                </span>
              )}
            </button>
          </Link>

          {/* Mobile Auth Icon */}
          {isLoggedIn ? (
            <Link href="/profile" className="sm:hidden">
              <button className="text-primary-foreground hover:bg-primary-foreground/10 p-2 rounded">
                <User className="w-5 h-5" />
              </button>
            </Link>
          ) : (
            <Link href="/auth" className="sm:hidden">
              <button className="text-primary-foreground hover:bg-primary-foreground/10 p-2 rounded">
                <LogIn className="w-5 h-5" />
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}