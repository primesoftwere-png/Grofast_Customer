"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Send,
  Image,
  Phone,
  MoreVertical,
  Store,
  Bike,
} from "lucide-react";
import { shops } from "@/data/shops";

export default function Chat() {
  const params = useParams();
  const type = params.type;
  const id = params.id;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      senderType: "shopkeeper",
      message: "Hello! Welcome to our shop. How can I help you today?",
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: "2",
      senderType: "user",
      message: "Hi! I wanted to ask about the organic apples availability.",
      timestamp: new Date(Date.now() - 240000),
    },
    {
      id: "3",
      senderType: "shopkeeper",
      message:
        "Yes, we have fresh organic apples in stock! They arrived just this morning.",
      timestamp: new Date(Date.now() - 180000),
    },
  ]);

  const messagesEndRef = useRef(null);

  const isShopChat = type === "shop";
  const shop = isShopChat ? shops.find((s) => s.id === id) : null;

  const chatPartner = isShopChat
    ? {
        name: shop?.name || "Shop",
        avatar: shop?.image,
        type: "shopkeeper",
      }
    : {
        name: "Delivery Partner",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        type: "delivery",
      };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    const newMessage = {
      id: Date.now().toString(),
      senderType: "user",
      message: message.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");

    // Simulated reply
    setTimeout(() => {
      const reply = {
        id: (Date.now() + 1).toString(),
        senderType: chatPartner.type,
        message: isShopChat
          ? "Thanks! Let me check and update you shortly."
          : "I'm on the way 🚀",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, reply]);
    }, 2000);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 py-3">
            
            <Link href={isShopChat ? `/shop/${id}` : "/tracking"}>
              <button className="p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-md">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>

            <div className="flex items-center gap-3 flex-1">
              
              <div className="relative">
                {chatPartner.avatar ? (
                  <img
                    src={chatPartner.avatar}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                    {isShopChat ? (
                      <Store className="text-white" />
                    ) : (
                      <Bike className="text-white" />
                    )}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-light rounded-full border-2 border-primary" />
              </div>

              <div className="text-primary-foreground">
                <p className="font-semibold text-sm">
                  {chatPartner.name}
                </p>
                <p className="text-xs opacity-80">Online</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-md">
                <Phone />
              </button>
              <button className="p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-md">
                <MoreVertical />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.senderType === "user";
          const showAvatar =
            index === 0 ||
            messages[index - 1].senderType !== msg.senderType;

          return (
            <div
              key={msg.id}
              className={`flex ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-end gap-2 max-w-[80%] ${
                  isUser ? "flex-row-reverse" : ""
                }`}
              >
                {showAvatar && !isUser && (
                  <img
                    src={chatPartner.avatar}
                    className="w-8 h-8 rounded-full"
                  />
                )}

                <div
                  className={`rounded-2xl px-4 py-2 ${
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background border-t border-border p-4">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          
          <button className="p-2 hover:bg-muted rounded-md">
            <Image className="w-5 h-5" />
          </button>

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-border rounded-md"
          />

          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="bg-primary text-primary-foreground p-2 rounded-full"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}