"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon path issues in Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

// Custom Icons for different actors
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const shopIcon = createCustomIcon("#22c55e"); // Green (primary)
const customerIcon = createCustomIcon("#000000"); // Black

// Component to dynamically adjust map bounds
function MapUpdater({ liveLocation, shopLocation, customerLocation }) {
  const map = useMap();
  
  useEffect(() => {
    const points = [];
    
    console.log('\n🗺️  MAP BOUNDS UPDATE:');
    
    if (liveLocation?.lat && liveLocation?.lng) {
      points.push([liveLocation.lat, liveLocation.lng]);
      console.log('├─ 🚴 Delivery Boy: [', liveLocation.lat, ',', liveLocation.lng, ']');
    } else {
      console.log('├─ 🚴 Delivery Boy: Not available');
    }
    
    if (shopLocation?.lat && shopLocation?.lng) {
      points.push([shopLocation.lat, shopLocation.lng]);
      console.log('├─ 🏪 Shop:        [', shopLocation.lat, ',', shopLocation.lng, ']');
    } else {
      console.log('├─ 🏪 Shop:        Not available');
    }
    
    if (customerLocation?.lat && customerLocation?.lng) {
      points.push([customerLocation.lat, customerLocation.lng]);
      console.log('├─ 🏠 Customer:     [', customerLocation.lat, ',', customerLocation.lng, ']');
    } else {
      console.log('├─ 🏠 Customer:     Not available');
    }

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      console.log('└─ ✅ Map bounds updated with', points.length, 'markers');
    } else {
      console.log('└─ ⚠️  No valid coordinates to update map bounds');
    }
  }, [map, liveLocation, shopLocation, customerLocation]);

  return null;
}

export default function LiveTrackingMap({ liveLocation, shopLocation, customerLocation, deliveryBoyImage }) {
  // Track previous location to detect changes
  const prevLocationRef = useRef(null);
  
  // Log when props change
  useEffect(() => {
    const hasLocationChanged = 
      liveLocation && 
      (!prevLocationRef.current || 
       prevLocationRef.current.lat !== liveLocation.lat || 
       prevLocationRef.current.lng !== liveLocation.lng);

    if (hasLocationChanged) {
      console.log('\n🗺️  ================================');
      console.log('🗺️   DELIVERY BOY MARKER MOVING');
      console.log('🗺️  ================================');
      if (prevLocationRef.current) {
        console.log('📍 Previous Position:', prevLocationRef.current);
      } else {
        console.log('📍 Previous Position: None (First update)');
      }
      console.log('📍 New Position:', liveLocation);
      console.log('✨ Marker animating to new position...');
      console.log('🗺️  ================================\n');
      
      prevLocationRef.current = liveLocation ? { ...liveLocation } : null;
    }

    console.log('📊 Map Component State:');
    console.log('├─ Live Location:', liveLocation ? `[${liveLocation.lat}, ${liveLocation.lng}]` : 'None');
    console.log('├─ Shop Location:', shopLocation ? `[${shopLocation.lat}, ${shopLocation.lng}]` : 'None');
    console.log('├─ Customer Location:', customerLocation ? `[${customerLocation.lat}, ${customerLocation.lng}]` : 'None');
    console.log('└─ Delivery Boy Image:', deliveryBoyImage || 'Default');
  }, [liveLocation, shopLocation, customerLocation, deliveryBoyImage]);

  // Default to a central location if nothing is available
  const defaultCenter = [20.5937, 78.9629]; // India center
  
  // Try to find an initial center
  const initialCenter = (liveLocation?.lat && liveLocation?.lng) 
    ? [liveLocation.lat, liveLocation.lng]
    : (shopLocation?.lat && shopLocation?.lng)
      ? [shopLocation.lat, shopLocation.lng]
      : (customerLocation?.lat && customerLocation?.lng)
        ? [customerLocation.lat, customerLocation.lng]
        : defaultCenter;

  console.log('🎯 Map Center:', initialCenter);

  const deliveryIcon = useMemo(() => L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="position: relative; display: flex; flex-direction: column; align-items: center;">
      <div style="width: 46px; height: 46px; border-radius: 50%; border: 3px solid #f97316; box-shadow: 0 4px 10px rgba(0,0,0,0.3); overflow: hidden; display: flex; align-items: center; justify-content: center; background-color: white; position: relative; z-index: 2;">
        <img src="${deliveryBoyImage || '/delivery_boy.jpg'}" style="width: 100%; height: 100%; object-fit: contain; padding: 4px;" alt="Delivery Partner" />
      </div>
      <div style="width: 14px; height: 14px; background-color: #f97316; position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%) rotate(45deg); z-index: 1;"></div>
    </div>`,
    iconSize: [46, 52],
    iconAnchor: [23, 52],
    popupAnchor: [0, -52]
  }), [deliveryBoyImage]);

  return (
    <div style={{ height: "100%", width: "100%", zIndex: 0 }}>
      <MapContainer 
        center={initialCenter} 
        zoom={13} 
        style={{ height: "100%", width: "100%", zIndex: 1 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {shopLocation?.lat && shopLocation?.lng && (
          <Marker position={[shopLocation.lat, shopLocation.lng]} icon={shopIcon}>
            <Popup>Shop Location</Popup>
          </Marker>
        )}
        
        {customerLocation?.lat && customerLocation?.lng && (
          <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerIcon}>
            <Popup>Delivery Destination</Popup>
          </Marker>
        )}
        
        {liveLocation?.lat && liveLocation?.lng && (
          <Marker position={[liveLocation.lat, liveLocation.lng]} icon={deliveryIcon}>
            <Popup>Delivery Partner (Live)</Popup>
          </Marker>
        )}

        <MapUpdater 
          liveLocation={liveLocation}
          shopLocation={shopLocation}
          customerLocation={customerLocation}
        />
      </MapContainer>
    </div>
  );
}
