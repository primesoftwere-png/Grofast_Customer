"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from "react-leaflet";
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

const shopIcon = L.icon({
  className: 'custom-leaflet-icon shop-marker',
  iconUrl: '/shop.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});
const customerIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div class="current-location-marker">
           <div class="pulse-ring"></div>
           <div class="core-dot"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Component to dynamically adjust map bounds
function MapUpdater({ liveLocation, shopLocation, customerLocation }) {
  const map = useMap();
  const hasFittedBounds = useRef(false);
  
  useEffect(() => {
    // Only fit bounds on initial load so the map doesn't violently snap every 5 seconds
    if (hasFittedBounds.current) return;

    const points = [];
    
    if (liveLocation?.lat && liveLocation?.lng) {
      points.push([liveLocation.lat, liveLocation.lng]);
    }
    if (shopLocation?.lat && shopLocation?.lng) {
      points.push([shopLocation.lat, shopLocation.lng]);
    }
    if (customerLocation?.lat && customerLocation?.lng) {
      points.push([customerLocation.lat, customerLocation.lng]);
    }

    if (points.length === 0) return;

    if (points.length === 1) {
      // Single point – just centre on it
      map.setView(points[0], 15);
      if (liveLocation?.lat) hasFittedBounds.current = true;
      return;
    }

    // Check if all points are essentially the same location (within ~10m)
    const allSame = points.every(p =>
      Math.abs(p[0] - points[0][0]) < 0.0001 &&
      Math.abs(p[1] - points[0][1]) < 0.0001
    );

    if (allSame) {
      map.setView(points[0], 15);
      if (liveLocation?.lat || points.length >= 2) hasFittedBounds.current = true;
      return;
    }

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    if (liveLocation?.lat || points.length >= 2) {
      hasFittedBounds.current = true;
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

  const deliveryIcon = useMemo(() => L.icon({
    className: 'custom-leaflet-icon delivery-marker',
    iconUrl: '/delivery_boy.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  }), []);

  return (
    <div style={{ height: "100%", width: "100%", zIndex: 0 }}>
      <style>{`
        .delivery-marker {
          transition: transform 1s linear !important;
        }
        .current-location-marker {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
        }
        .core-dot {
          width: 16px;
          height: 16px;
          background-color: #0ea5e9;
          border-radius: 50%;
          border: 2.5px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          z-index: 2;
        }
        .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: rgba(14, 165, 233, 0.4);
          border-radius: 50%;
          z-index: 1;
          animation: pulse-ring 2s infinite ease-out;
        }
        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
      `}</style>
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
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>Shop Location</Tooltip>
            <Popup>Shop Location</Popup>
          </Marker>
        )}
        
        {customerLocation?.lat && customerLocation?.lng && (
          <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerIcon}>
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>Your Location</Tooltip>
            <Popup>Delivery Destination</Popup>
          </Marker>
        )}
        
        {liveLocation?.lat && liveLocation?.lng && (
          <Marker position={[liveLocation.lat, liveLocation.lng]} icon={deliveryIcon}>
            <Tooltip direction="top" offset={[0, -20]} opacity={1}>Delivery Partner</Tooltip>
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
