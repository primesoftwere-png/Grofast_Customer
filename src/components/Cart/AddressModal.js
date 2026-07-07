"use client";

import { useState, useEffect } from "react";
import { X, MapPin, Navigation, Loader2 } from "lucide-react";
import dynamic from 'next/dynamic';
import EcommerceLoader from "@/components/common/EcommerceLoader";

const LocationPicker = dynamic(() => import('./LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[200px] bg-muted rounded-xl flex items-center justify-center border border-border relative overflow-hidden">
      <EcommerceLoader fullScreen={false} message={null} />
    </div>
  )
});

export default function AddressModal({ isOpen, onClose, onSave, currentAddress }) {
  const [formData, setFormData] = useState({
    landmark: "",
    buildingNumber: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
    addressType: "home",
    isDefault: false
  });
  const [mapLocation, setMapLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (currentAddress) {
        // Parse existing address if available
        setFormData({
          landmark: currentAddress.landmark || "",
          buildingNumber: currentAddress.buildingNumber || "",
          addressLine1: currentAddress.addressLine1 || "",
          city: currentAddress.city || "",
          state: currentAddress.state || "",
          pincode: currentAddress.pincode || "",
          addressType: currentAddress.addressType || "home",
          isDefault: currentAddress.isDefault || false
        });
        if (currentAddress.latitude && currentAddress.longitude) {
          setMapLocation({ lat: currentAddress.latitude, lng: currentAddress.longitude });
        } else {
          setMapLocation(null);
          getCurrentLocation();
        }
      } else {
        // Reset form
        setFormData({
          landmark: "",
          buildingNumber: "",
          addressLine1: "",
          city: "",
          state: "",
          pincode: "",
          addressType: "home",
          isDefault: false
        });
        setMapLocation(null);
        getCurrentLocation();
      }
      setError("");
    }
  }, [isOpen, currentAddress]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsLoadingLocation(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMapLocation({ lat: latitude, lng: longitude });
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            const address = data.address;
            
            setFormData(prev => ({
              ...prev,
              addressLine1: data.display_name || "",
            city: address.city || address.town || address.village || address.state_district || address.county || address.suburb || "",
              state: address.state || "",
              pincode: address.postcode || ""
            }));
          } else {
            setError("Failed to fetch address from location");
          }
        } catch (error) {
          console.error("Error fetching address:", error);
          setError("Failed to fetch address. Please enter manually.");
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLoadingLocation(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError("Location permission denied. Please enable location access.");
            break;
          case error.POSITION_UNAVAILABLE:
            setError("Location information unavailable.");
            break;
          case error.TIMEOUT:
            setError("Location request timed out.");
            break;
          default:
            setError("An error occurred while fetching location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Reverse geocode when user clicks on map manually
  useEffect(() => {
    const fetchAddressFromMapClick = async () => {
      if (!mapLocation || isLoadingLocation) return;
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${mapLocation.lat}&lon=${mapLocation.lng}&addressdetails=1`
        );
        
        if (response.ok) {
          const data = await response.json();
          const address = data.address;
          
          setFormData(prev => ({
            ...prev,
            addressLine1: data.display_name || "",
            city: address.city || address.town || address.village || address.state_district || address.county || address.suburb || "",
            state: address.state || "",
            pincode: address.postcode || ""
          }));
        }
      } catch (error) {
        console.error("Error reverse geocoding from map click:", error);
      }
    };
    
    // Only run if not already loading via 'getCurrentLocation' button
    if (!isLoadingLocation) {
      fetchAddressFromMapClick();
    }
  }, [mapLocation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.addressLine1.trim()) {
      setError("Address is required");
      return;
    }
    if (!formData.city.trim()) {
      setError("City is required");
      return;
    }
    if (!formData.state.trim()) {
      setError("State is required");
      return;
    }
    if (!formData.pincode.trim()) {
      setError("Pincode is required");
      return;
    }

    setIsSaving(true);

    try {
      // Construct full address string
      const addressParts = [];
      
      if (formData.buildingNumber.trim()) {
        addressParts.push(formData.buildingNumber.trim());
      }
      if (formData.landmark.trim()) {
        addressParts.push(formData.landmark.trim());
      }
      if (formData.addressLine1.trim()) {
        addressParts.push(formData.addressLine1.trim());
      }
      
      const fullAddress = addressParts.join(", ");

      const addressData = {
        addressLine1: fullAddress,
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        addressType: formData.addressType,
        isDefault: formData.isDefault,
        // Optional Fields specified in API
        addressLine2: "", 
        landmark: formData.landmark.trim(),
        buildingNumber: formData.buildingNumber.trim(),
      };

      if (mapLocation) {
        addressData.latitude = mapLocation.lat;
        addressData.longitude = mapLocation.lng;
        addressData.lan = mapLocation.lat;
        addressData.lng = mapLocation.lng;
      }

      await onSave(addressData);
      onClose();
    } catch (error) {
      console.error("Error saving address:", error);
      setError(error.message || "Failed to save address. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">
              {currentAddress ? "Update Address" : "Add Delivery Address"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Map Picker */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Pin Location on Map
            </label>
            <LocationPicker position={mapLocation} setPosition={setMapLocation} />
            <p className="text-xs text-muted-foreground mt-1">
              Drag or click on the map to automatically fill your address.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Address Type & Default */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="addressType" className="block text-sm font-medium mb-2">
                Address Type
              </label>
              <select
                id="addressType"
                name="addressType"
                value={formData.addressType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex items-center pt-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                />
                <span className="text-sm font-medium">Set as Default Address</span>
              </label>
            </div>
          </div>

          {/* Building Number */}
          <div>
            <label htmlFor="buildingNumber" className="block text-sm font-medium mb-2">
              Building Number / House No.
            </label>
            <input
              type="text"
              id="buildingNumber"
              name="buildingNumber"
              value={formData.buildingNumber}
              onChange={handleChange}
              placeholder="e.g., 123, A-45"
              className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
          </div>

          {/* Landmark */}
          <div>
            <label htmlFor="landmark" className="block text-sm font-medium mb-2">
              Landmark
            </label>
            <input
              type="text"
              id="landmark"
              name="landmark"
              value={formData.landmark}
              onChange={handleChange}
              placeholder="e.g., Near City Mall"
              className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
          </div>

          {/* Address Line 1 */}
          <div>
            <label htmlFor="addressLine1" className="block text-sm font-medium mb-2">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              id="addressLine1"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              placeholder="Street address, area, locality"
              rows={3}
              required
              className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background resize-none"
            />
          </div>

          {/* City and State */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., Mumbai"
                required
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g., Maharashtra"
                required
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />
            </div>
          </div>

          {/* Pincode */}
          <div>
            <label htmlFor="pincode" className="block text-sm font-medium mb-2">
              Pincode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="e.g., 400001"
              required
              maxLength={6}
              pattern="[0-9]{6}"
              className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-border rounded-xl font-medium hover:bg-muted transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Address"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
