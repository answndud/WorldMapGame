'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { countries } from '@/lib/datasets/countries';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

interface GlobeCanvasProps {
  targetIso3?: string;
  onCountryClick: (iso3: string) => void;
}

export default function GlobeCanvas({ targetIso3, onCountryClick }: GlobeCanvasProps) {
  const globeEl = useRef<any>(null);
  const [mounted, setMounted] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 국가 폴리곤 데이터 생성 (간단한 예시)
  const polygonsData = countries.map(country => ({
    iso3: country.iso3,
    name: country.name_en,
    lat: (country.bbox[1] + country.bbox[3]) / 2,
    lng: (country.bbox[0] + country.bbox[2]) / 2,
    // 실제 구현에서는 GeoJSON을 사용해야 함
  }));

  useEffect(() => {
    if (globeEl.current && globeReady) {
      // 카메라 초기 설정
      globeEl.current.pointOfView({ altitude: 2.5 }, 1000);
    }
  }, [globeReady]);

  if (!mounted) {
    return (
      <div className="w-full h-[600px] bg-black rounded-lg flex items-center justify-center">
        <p className="text-slate-400">3D 지구본을 로딩하는 중...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] bg-black rounded-lg overflow-hidden border-2 border-blue-500">
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundColor="rgba(0,0,0,0)"
        
        // 포인트로 국가 표시 (실제로는 폴리곤 사용)
        pointsData={polygonsData}
        pointLat="lat"
        pointLng="lng"
        pointAltitude={0.01}
        pointRadius={0.5}
        pointColor={() => '#ffffff'}
        pointLabel={(d: any) => `
          <div style="background: rgba(0,0,0,0.8); padding: 8px; border-radius: 4px; color: white;">
            <strong>${d.name}</strong><br/>
            ${d.iso3}
          </div>
        `}
        
        onPointClick={(point: any) => {
          onCountryClick(point.iso3);
        }}
        
        onGlobeReady={() => setGlobeReady(true)}
        
        // 인터랙션 설정
        enablePointerInteraction={true}
      />
    </div>
  );
}
