"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2 } from "lucide-react";
import L from 'leaflet';
import EcommerceLoader from "@/components/common/EcommerceLoader";

// Fix leaflet default icons for Next.js
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

const LocationMarker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  useEffect(() => {
    if (position) {
      // Zoom in to level 15 if currently zoomed out
      const zoomLevel = map.getZoom() > 15 ? map.getZoom() : 15;
      map.flyTo(position, zoomLevel, { animate: true, duration: 1 });
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

export default function LocationPicker({ position, setPosition }) {
  const [mounted, setMounted] = useState(false);
  const defaultPosition = { lat: 18.9220, lng: 72.8347 }; // Mumbai default

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[200px] bg-muted rounded-xl flex items-center justify-center border border-border relative overflow-hidden">
        <EcommerceLoader fullScreen={false} message={null} />
      </div>
    );
  }

  const mapCenter = position || defaultPosition;

  return (
    <div className="w-full h-[200px] rounded-xl overflow-hidden border border-border relative z-0">
      <MapContainer
        center={mapCenter}
        zoom={position ? 15 : 10}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
    </div>
  );
}
