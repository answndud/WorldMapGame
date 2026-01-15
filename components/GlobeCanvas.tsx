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

  // 국가 폴리곤 데이터 생성
  const polygonsData = countries.map(country => ({
    iso3: country.iso3,
    name: country.name_en,
    nameKo: country.name_ko,
    lat: (country.bbox[1] + country.bbox[3]) / 2,
    lng: (country.bbox[0] + country.bbox[2]) / 2,
  }));

  useEffect(() => {
    if (globeEl.current && globeReady) {
      // 카메라 초기 설정 - 지구본 전체가 보이도록 거리 조정
      globeEl.current.pointOfView({ 
        lat: 20, 
        lng: 0, 
        altitude: 2.0 
      }, 1000);
      
      // 자동 회전 비활성화 (드래그로만 회전)
      globeEl.current.controls().autoRotate = false;
      globeEl.current.controls().enableZoom = true;
    }
  }, [globeReady]);

  if (!mounted) {
    return (
      <div className="w-full h-[800px] bg-black rounded-lg flex items-center justify-center">
        <p className="text-slate-400">3D 지구본을 로딩하는 중...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[800px] bg-black rounded-lg overflow-hidden border-2 border-blue-500 relative flex items-center justify-center">
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Globe
          ref={globeEl}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          backgroundColor="rgba(0,0,0,1)"
          width={800}
          height={800}
          
          // 포인트로 국가 표시
          pointsData={polygonsData}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={0.01}
          pointRadius={0.6}
          pointColor={() => 'rgba(255, 255, 255, 0.8)'}
          pointLabel={() => ''}  // 호버 시 라벨 제거
          
          onPointClick={(point: any) => {
            onCountryClick(point.iso3);
          }}
          
          onGlobeReady={() => setGlobeReady(true)}
          
          // 인터랙션 설정
          enablePointerInteraction={true}
        />
      </div>
    </div>
  );
}
