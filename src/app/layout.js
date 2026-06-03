import { Poppins } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "GroFast - Customer Panel",
  description: "Order fresh groceries online",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="min-h-full flex flex-col">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "placeholder-client-id"}>
          <CartProvider>
            {children}

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#333',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 4px 16px -4px rgba(0, 0, 0, 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#A6DE8D',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EB3D3D',
                  secondary: '#fff',
                },
              },
            }}
          />
          </CartProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
