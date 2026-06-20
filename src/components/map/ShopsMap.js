"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, MapPin, Navigation } from "lucide-react";
import L from 'leaflet';
import Link from "next/link";

// Fix leaflet default icons for Next.js
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Custom icon for user location
const userIcon = typeof window !== 'undefined' ? new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
}) : null;

// Custom icon for shops
const shopIcon = typeof window !== 'undefined' ? new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
}) : null;

const MapBounds = ({ shops, userLocation }) => {
  const map = useMap();
  
  useEffect(() => {
    if (shops.length > 0 || userLocation) {
      const bounds = [];
      
      if (userLocation) {
        bounds.push([userLocation.lat, userLocation.lng]);
      }
      
      shops.forEach(shop => {
        if (shop.latitude && shop.longitude) {
          bounds.push([shop.latitude, shop.longitude]);
        }
      });
      
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [shops, userLocation, map]);
  
  return null;
};

export default function ShopsMap({ shops, userLocation }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-muted rounded-2xl flex flex-col items-center justify-center border border-border">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Loading Map...</p>
      </div>
    );
  }

  // Default to a central location if no user location is provided
  const center = userLocation ? [userLocation.lat, userLocation.lng] : (shops.length > 0 && shops[0].latitude ? [shops[0].latitude, shops[0].longitude] : [18.9220, 72.8347]);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-border relative z-0">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <MapBounds shops={shops} userLocation={userLocation} />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-sm">Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {shops.map((shop) => {
          if (!shop.latitude || !shop.longitude) return null;
          
          return (
            <Marker 
              key={shop._id} 
              position={[shop.latitude, shop.longitude]}
              icon={shopIcon}
            >
              <Popup>
                <div className="p-1 min-w-[150px]">
                  <div className="flex items-center gap-2 mb-2">
                    {shop.shopImage && (
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-muted">
                        <img src={shop.shopImage} alt={shop.shopName} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm leading-tight">{shop.shopName}</h4>
                      {shop.distance && <p className="text-xs text-muted-foreground">{shop.distance} km away</p>}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{shop.shopAddress}</p>
                  <Link 
                    href={`/shop/${shop._id}`}
                    className="block w-full py-1.5 text-center bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition-colors"
                  >
                    View Shop
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
