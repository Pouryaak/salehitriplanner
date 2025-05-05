
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Place } from '@/types/trip';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Create custom numbered marker icons
const createNumberedIcon = (number: number) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="marker-pin bg-travel-primary text-white font-bold rounded-full flex items-center justify-center" style="width: 30px; height: 30px;">${number}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

interface LocationWithCoords {
  id: string;
  name: string;
  order: number;
  lat: number;
  lng: number;
}

interface DayMapProps {
  places: LocationWithCoords[];
}

// Component to fit bounds of the map to markers
const FitBoundsToMarkers = ({ places }: { places: LocationWithCoords[] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (places.length === 0) return;

    // Create bounds from place coordinates
    const bounds = L.latLngBounds(places.map(place => [place.lat, place.lng]));
    
    // Fit the map to these bounds with some padding
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [places, map]);
  
  return null;
};

const DayMap: React.FC<DayMapProps> = ({ places }) => {
  if (places.length === 0) {
    return (
      <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No places with coordinates to display</p>
      </div>
    );
  }

  // Find the center point for the initial map view
  const centerLat = places.reduce((sum, place) => sum + place.lat, 0) / places.length;
  const centerLng = places.reduce((sum, place) => sum + place.lng, 0) / places.length;

  return (
    <div className="h-64 rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {places.map((place, index) => (
          <Marker 
            key={place.id} 
            position={[place.lat, place.lng]}
            icon={createNumberedIcon(index + 1)}
          >
            <Popup>{place.name}</Popup>
          </Marker>
        ))}
        
        <FitBoundsToMarkers places={places} />
      </MapContainer>
    </div>
  );
};

export default DayMap;
