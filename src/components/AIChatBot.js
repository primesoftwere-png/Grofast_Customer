"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, User, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { addItem } = useCart();
  const router = useRouter();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-product.svg';
    if (imagePath.startsWith('http')) return imagePath;
    
    let cleanUrl = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    if (!cleanUrl.startsWith('uploads/')) {
      cleanUrl = `uploads/${cleanUrl}`;
    }
    
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiBase.replace('/api', '');
    return `${baseUrl}/${cleanUrl}`;
  };

  const handleAddToCart = (product) => {
    // Format product for cart if needed, context expects product._id or product.id
    const cartProduct = {
      ...product,
      id: product._id || product.id,
    };
    addItem(cartProduct);
    toast.success(`${product.productName || 'Item'} added to cart!`);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { sender: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiBaseUrl}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: text }),
      });

      const data = await response.json();
      
      let aiText = data.message || "I'm sorry, I couldn't process the response.";
      let products = data.data?.products || [];
      let isError = data.success === false;
      let warning = data.warning || null;

      if (typeof data === "string") {
        aiText = data;
      }

      setMessages((prev) => [
        ...prev, 
        { 
          sender: "ai", 
          text: aiText,
          products: products,
          isError: isError,
          warning: warning
        }
      ]);

      // Automatically redirect if exactly one product is found
      if (products.length === 1 && (products[0]._id || products[0].id)) {
        const singleProductId = products[0]._id || products[0].id;
        toast.success(`Redirecting to ${products[0].productName}...`, {
          icon: '🔄'
        });
        
        setTimeout(() => {
          setIsOpen(false); // Close chat box
          router.push(`/product/${singleProductId}`);
        }, 1500);
      }
    } catch (error) {
      console.error("Error communicating with AI:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Sorry, I am having trouble connecting right now." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage(input);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
        {/* Chat Box */}
        {isOpen && (
          <div className="mb-4 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 transform origin-bottom-right" style={{ height: '500px', maxHeight: 'calc(100vh - 6rem)' }}>
            {/* Header */}
            <div className="bg-primary-600 bg-green-500 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot size={24} />
                <h3 className="font-semibold text-lg">GroFast AI</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-green-600 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col gap-1 w-full ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === "user" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}>
                      {msg.sender === "user" ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div 
                      className={`px-4 py-2 rounded-2xl text-sm ${
                        msg.sender === "user" 
                          ? "bg-blue-500 text-white rounded-tr-none" 
                          : msg.isError
                            ? "bg-red-50 border border-red-200 text-red-800 rounded-tl-none shadow-sm"
                            : "bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm"
                      }`}
                    >
                      {msg.text}
                      {msg.warning && (
                        <div className="mt-2 text-xs text-orange-700 bg-orange-100 p-2 rounded-md border border-orange-200">
                          <span className="font-semibold">Note:</span> {msg.warning}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Products List */}
                  {msg.products && msg.products.length > 0 && (
                    <div className={`flex flex-col gap-2 mt-1 w-full max-w-[85%] ${msg.sender === "user" ? "mr-10" : "ml-10"}`}>
                      {msg.products.map(product => (
                        <div key={product._id || product.productName} className="bg-white border border-gray-100 rounded-lg p-2 shadow-sm flex items-center justify-between hover:border-green-300 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                              {product.productImage ? (
                                <img 
                                  src={getImageUrl(product.productImage)} 
                                  alt={product.productName} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/placeholder-product.svg';
                                  }}
                                />
                              ) : (
                                <span className="text-xl">🛍️</span>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800 text-sm line-clamp-1">{product.productName}</h4>
                              <p className="text-green-600 font-bold text-xs">₹{product.productPrice}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleAddToCart(product)}
                            className="bg-green-50 text-green-600 p-1.5 rounded-full hover:bg-green-500 hover:text-white transition-colors flex-shrink-0"
                            title="Add to cart"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 max-w-[85%] self-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200 rounded-tl-none shadow-sm flex items-center">
                    <Loader2 className="animate-spin text-green-500" size={16} />
                    <span className="ml-2 text-xs text-gray-500">AI is typing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
                <button 
                  onClick={() => handleSendMessage("I want some rice or fruits")}
                  className="whitespace-nowrap text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1.5 hover:bg-green-100 transition-colors"
                >
                  I want some rice or fruits
                </button>
                <button 
                  onClick={() => handleSendMessage("Show me today's offers")}
                  className="whitespace-nowrap text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1.5 hover:bg-green-100 transition-colors"
                >
                  Show me today's offers
                </button>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 flex gap-2 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 bg-gray-100 text-base sm:text-sm rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage(input)}
                disabled={!input.trim() || isLoading}
                className={`p-2.5 rounded-full flex-shrink-0 transition-colors ${
                  input.trim() && !isLoading ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-200 text-gray-400"
                }`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Floating Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 ${
            isOpen ? "bg-red-500 rotate-90" : "bg-green-500 animate-bounce"
          } text-white`}
          style={{
            boxShadow: isOpen ? "0 10px 25px -5px rgba(239, 68, 68, 0.4)" : "0 10px 25px -5px rgba(34, 197, 94, 0.4)"
          }}
        >
          {isOpen ? <X size={28} /> : <Bot size={28} />}
        </button>
      </div>
    </>
  );
}
