import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  // Facebook,
  // Twitter,
  // Instagram,
  // Youtube,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-12">
      
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-primary">D</span>
              </div>
              <span className="font-bold text-xl">DirectMart</span>
            </div>

            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Fresh groceries delivered to your doorstep in minutes. Quality guaranteed with the best prices.
            </p>

            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                {/* <Facebook className="w-5 h-5" /> */}
              </a>
              <a href="#" className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                {/* <Twitter className="w-5 h-5" /> */}
              </a>
              <a href="#" className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                {/* <Instagram className="w-5 h-5" /> */}
              </a>
              <a href="#" className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                {/* <Youtube className="w-5 h-5" /> */}
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-primary-foreground/80 hover:text-primary-foreground text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-primary-foreground/80 hover:text-primary-foreground text-sm">
                  All Categories
                </Link>
              </li>
              <li>
                <Link href="/offers" className="text-primary-foreground/80 hover:text-primary-foreground text-sm">
                  Offers & Deals
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-primary-foreground/80 hover:text-primary-foreground text-sm">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-primary-foreground/80 hover:text-primary-foreground text-sm">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Categories</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/category/Fruits" className="text-primary-foreground/80 hover:text-primary-foreground text-sm">
                  🍎 Fruits
                </Link>
              </li>
              <li>
                <Link href="/category/Vegetables" className="text-primary-foreground/80 hover:text-primary-foreground text-sm">
                  🥬 Vegetables
                </Link>
              </li>
              <li>
                <Link href="/category/Dairy" className="text-primary-foreground/80 hover:text-primary-foreground text-sm">
                  🥛 Dairy
                </Link>
              </li>
              <li>
                <Link href="/category/Bakery" className="text-primary-foreground/80 hover:text-primary-foreground text-sm">
                  🍞 Bakery
                </Link>
              </li>
              <li>
                <Link href="/category/Beverages" className="text-primary-foreground/80 hover:text-primary-foreground text-sm">
                  🧃 Beverages
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5" />
                <span className="text-primary-foreground/80 text-sm">
                  123 Market Street, New York, NY 10001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5" />
                <span className="text-primary-foreground/80 text-sm">
                  +1 (555) 123-4567
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5" />
                <span className="text-primary-foreground/80 text-sm">
                  support@directmart.com
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/70">
            <p>© 2024 DirectMart. All rights reserved.</p>

            <div className="flex gap-6">
              <a href="#" className="hover:text-primary-foreground">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary-foreground">
                Terms of Service
              </a>
              <a href="#" className="hover:text-primary-foreground">
                Refund Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}