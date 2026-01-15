import { getRandomCountries, countries } from '@/lib/datasets/countries';

export type GameMode = 'A1' | 'A2' | 'B1' | 'B2' | 'C';

export interface QuestionA1 {
  type: 'A1';
  targetIso3: string;
  targetName: string;
  targetNameKo: string;
}

export interface QuestionA2 {
  type: 'A2';
  iso3: string;
  capitalName: string;
  capitalLat: number;
  capitalLng: number;
  step: 'pickCountry' | 'clickCapital';
}

export interface QuestionB {
  type: 'B';
  mode: 'B1' | 'B2';
  items: Array<{
    iso3: string;
    name: string;
    nameKo: string;
  }>;
}

export type Question = QuestionA1 | QuestionA2 | QuestionB;

/**
 * Mode A1 질문 생성: 국가 이름 표시, 지구본에서 클릭
 */
export function generateQuestionA1(usedIso3: string[] = []): QuestionA1 {
  const [country] = getRandomCountries(1, usedIso3);
  
  return {
    type: 'A1',
    targetIso3: country.iso3,
    targetName: country.name_en,
    targetNameKo: country.name_ko
  };
}

/**
 * Mode A2 질문 생성: 수도 이름 표시, 국가 선택 후 2D 지도에서 클릭
 */
export function generateQuestionA2(usedIso3: string[] = []): QuestionA2 {
  const [country] = getRandomCountries(1, usedIso3);
  
  return {
    type: 'A2',
    iso3: country.iso3,
    capitalName: country.capital_name,
    capitalLat: country.capital_lat,
    capitalLng: country.capital_lng,
    step: 'pickCountry'
  };
}

/**
 * Mode B 질문 생성: 국가 N개를 인구수 많은 순서대로 정렬
 */
export function generateQuestionB(mode: 'B1' | 'B2', usedIso3: string[] = []): QuestionB {
  const count = mode === 'B1' ? 3 : 5;
  const selectedCountries = getRandomCountries(count, usedIso3);
  
  return {
    type: 'B',
    mode,
    items: selectedCountries.map(c => ({
      iso3: c.iso3,
      name: c.name_en,
      nameKo: c.name_ko
    }))
  };
}

/**
 * 모드에 따라 적절한 질문 생성
 */
export function generateQuestion(mode: GameMode, usedIso3: string[] = []): Question {
  switch (mode) {
    case 'A1':
      return generateQuestionA1(usedIso3);
    case 'A2':
      return generateQuestionA2(usedIso3);
    case 'B1':
      return generateQuestionB('B1', usedIso3);
    case 'B2':
      return generateQuestionB('B2', usedIso3);
    default:
      throw new Error(`Unknown mode: ${mode}`);
  }
}
