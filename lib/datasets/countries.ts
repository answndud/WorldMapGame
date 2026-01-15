import countriesData from '@/data/countries.json';

export interface Country {
  iso2: string;
  iso3: string;
  name_en: string;
  name_ko: string;
  capital_name: string;
  capital_lat: number;
  capital_lng: number;
  population: number;
  bbox: [number, number, number, number];
}

export const countries: Country[] = countriesData as Country[];

export function getCountryByIso3(iso3: string): Country | undefined {
  return countries.find(c => c.iso3 === iso3);
}

export function getCountryByCapital(capitalName: string): Country | undefined {
  return countries.find(c => 
    c.capital_name.toLowerCase() === capitalName.toLowerCase()
  );
}

export function getRandomCountries(count: number, exclude: string[] = []): Country[] {
  const available = countries.filter(c => !exclude.includes(c.iso3));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function sortByPopulation(countryCodes: string[]): string[] {
  const countryObjs = countryCodes
    .map(iso3 => getCountryByIso3(iso3))
    .filter((c): c is Country => c !== undefined);
  
  return countryObjs
    .sort((a, b) => b.population - a.population)
    .map(c => c.iso3);
}
