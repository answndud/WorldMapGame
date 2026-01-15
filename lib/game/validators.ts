import haversine from 'haversine-distance';
import { getCountryByIso3 } from '@/lib/datasets/countries';

export interface ClickValidationResult {
  correct: boolean;
  distance?: number;
  threshold: number;
}

/**
 * Haversine 거리 기반 수도 클릭 검증
 * @param clickLat 클릭한 위도
 * @param clickLng 클릭한 경도
 * @param capitalLat 실제 수도 위도
 * @param capitalLng 실제 수도 경도
 * @param thresholdKm 허용 거리 (km, 기본 50km)
 */
export function validateCapitalClick(
  clickLat: number,
  clickLng: number,
  capitalLat: number,
  capitalLng: number,
  thresholdKm: number = 50
): ClickValidationResult {
  const point1 = { latitude: clickLat, longitude: clickLng };
  const point2 = { latitude: capitalLat, longitude: capitalLng };
  
  const distanceMeters = haversine(point1, point2);
  const distanceKm = distanceMeters / 1000;
  
  return {
    correct: distanceKm <= thresholdKm,
    distance: distanceKm,
    threshold: thresholdKm
  };
}

/**
 * 국가 클릭 검증 (Mode A1)
 */
export function validateCountryClick(
  targetIso3: string,
  clickedIso3: string
): boolean {
  return targetIso3 === clickedIso3;
}

/**
 * 인구수 정렬 검증 (Mode B)
 */
export function validatePopulationOrder(
  orderedIso3: string[]
): boolean {
  const populations = orderedIso3
    .map(iso3 => getCountryByIso3(iso3)?.population)
    .filter((p): p is number => p !== undefined);
  
  // 인구가 많은 순서대로 정렬되어 있는지 확인
  for (let i = 0; i < populations.length - 1; i++) {
    if (populations[i] < populations[i + 1]) {
      return false;
    }
  }
  
  return true;
}
