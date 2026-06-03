"use client";

import { useState, useEffect } from "react";
import { X, Plus, MapPin, Loader2 } from "lucide-react";
import { addressAPI } from "@/services/address.api";
import AddressModal from "@/components/Cart/AddressModal";

export default function AddressSelectionModal({ isOpen, onClose, userId, currentAddressId, onSelect }) {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchAddresses();
    }
  }, [isOpen, userId]);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const response = await addressAPI.getUserAddresses(userId);
      if (response.success && response.data) {
        setAddresses(response.data);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (addr) => {
    const addrId = addr._id || addr.id;
    localStorage.setItem("deliveryAddress", JSON.stringify(addr));
    localStorage.setItem("deliveryAddressId", addrId);
    
    // Also trigger the standard authChange if we want other components to re-read
    window.dispatchEvent(new Event("storage"));
    
    onSelect(addr);
    onClose();
  };

  const handleSaveNewAddress = async (addressData) => {
    try {
      const response = await addressAPI.addAddress({
        userId,
        ...addressData
      });

      if (response.success || response.data) {
        const addressId = response.data?._id || response.data?.id || response.addressId;
        const savedAddress = { ...addressData, _id: addressId };
        
        // Auto select the newly added address
        handleSelect(savedAddress);
        toast.success("Address added successfully!");
      } else {
        toast.error("Failed to add address");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return null;
    const parts1 = [];
    if (addr.buildingNumber) parts1.push(addr.buildingNumber);
    if (addr.landmark) parts1.push(addr.landmark);
    if (addr.addressLine1) parts1.push(addr.addressLine1);
    
    const parts2 = [];
    if (addr.city) parts2.push(addr.city);
    if (addr.state) parts2.push(addr.state);
    if (addr.pincode) parts2.push(addr.pincode);
    
    return {
      line1: parts1.length > 0 ? parts1.join(", ") : "Address",
      line2: parts2.length > 0 ? parts2.join(", ") : ""
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col animate-slide-up">
        
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Select Delivery Address</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition" aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : addresses.length > 0 ? (
            <div className="space-y-3">
              {addresses.map((addr) => {
                const addrId = addr._id || addr.id;
                const isSelected = currentAddressId === addrId;
                return (
                  <div
                    key={addrId}
                    onClick={() => handleSelect(addr)}
                    className={`flex gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                      isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className={`mt-0.5 rounded-full border flex items-center justify-center w-5 h-5 shrink-0 ${isSelected ? "border-primary" : "border-muted-foreground"}`}>
                      {isSelected && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                    </div>
                    <div className="text-sm flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-foreground uppercase tracking-wider text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {addr.addressType || "HOME"}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">DEFAULT</span>
                        )}
                      </div>
                      <p className="font-medium text-foreground mt-1.5">{formatAddress(addr)?.line1}</p>
                      <p className="text-muted-foreground mt-0.5">{formatAddress(addr)?.line2}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">No saved addresses</h3>
              <p className="text-sm text-muted-foreground">Add a delivery address to proceed.</p>
            </div>
          )}

          <button
            onClick={() => setIsAddressModalOpen(true)}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 border border-dashed border-primary text-primary hover:bg-primary/5 rounded-xl font-medium transition"
          >
            <Plus className="w-5 h-5" />
            Add New Address
          </button>
        </div>
      </div>

      {/* Make sure inner AddressModal renders above this one */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[60]">
          <AddressModal 
            isOpen={isAddressModalOpen}
            onClose={() => setIsAddressModalOpen(false)}
            onSave={handleSaveNewAddress}
          />
        </div>
      )}
    </div>
  );
}
