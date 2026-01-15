'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCountryByIso3 } from '@/lib/datasets/countries';

// Leaflet 기본 아이콘 수정 (Next.js에서 필요)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CountryMap2DProps {
  iso3: string;
  onMapClick: (lat: number, lng: number) => void;
  markerPosition?: [number, number];
}

function MapEventHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapBoundsUpdater({ bbox }: { bbox: [number, number, number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    const [west, south, east, north] = bbox;
    map.fitBounds([
      [south, west],
      [north, east]
    ], {
      padding: [50, 50]
    });
  }, [bbox, map]);

  return null;
}

export default function CountryMap2D({ iso3, onMapClick, markerPosition }: CountryMap2DProps) {
  const [mounted, setMounted] = useState(false);
  
  // 클라이언트 사이드에서만 렌더링
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[500px] bg-slate-800 rounded-lg flex items-center justify-center">
        <p className="text-slate-400">지도를 로딩하는 중...</p>
      </div>
    );
  }

  const country = getCountryByIso3(iso3);
  
  if (!country) {
    return (
      <div className="w-full h-[500px] bg-slate-800 rounded-lg flex items-center justify-center">
        <p className="text-red-400">국가 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const [west, south, east, north] = country.bbox;
  const center: [number, number] = [(south + north) / 2, (west + east) / 2];

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border-2 border-blue-500">
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventHandler onMapClick={onMapClick} />
        <MapBoundsUpdater bbox={country.bbox} />
        {markerPosition && <Marker position={markerPosition} />}
      </MapContainer>
    </div>
  );
}
