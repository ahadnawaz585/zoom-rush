// services/countryApi.ts
import { countries } from '@/lib/botUtils';

export interface Country {
  code: string;
  name: string;
  flag?: string;
  population?: number;
}

// Pre-sorted countries array for faster lookups and rendering
let cachedCountries: Country[] | null = null;

// Implement indexed lookup for faster country retrieval by code
const countryByCodeIndex: Record<string, Country> = {};

// Constant for maximum bot limit
export const MAX_BOT_LIMIT = 200;

export async function fetchCountries(): Promise<Country[]> {
  try {
    // Using the REST Countries API with fields param to reduce payload size
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags,population');
    
    // Check if response is ok before parsing
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Map and sort countries by name for faster UI rendering
    const sortedCountries = data.map((country: any) => ({
      code: country.cca2,
      name: country.name.common,
      flag: country.flags.svg,
      population: country.population
    })).sort((a: Country, b: Country) => a.name.localeCompare(b.name));
    
    // Build index for faster lookups
    sortedCountries.forEach((country: Country) => {
      countryByCodeIndex[country.code] = country;
    });
    
    return sortedCountries;
  } catch (error) {
    console.error('Failed to fetch countries:', error);
    
    // Fallback to our local country data if API fails
    // Sort this data as well for consistency
    const fallbackCountries = Object.entries(countries).map(([code, name]) => ({
      code,
      name: name as string,
    })).sort((a, b) => a.name.localeCompare(b.name));
    
    // Build index for fallback data too
    fallbackCountries.forEach((country) => {
      countryByCodeIndex[country.code] = country;
    });
    
    return fallbackCountries;
  }
}

export async function getCountries(): Promise<Country[]> {
  if (!cachedCountries) {
    cachedCountries = await fetchCountries();
  }
  return cachedCountries;
}

export async function getCountryByCode(code: string): Promise<Country | undefined> {
  // Use indexed lookup instead of find() for O(1) performance
  if (Object.keys(countryByCodeIndex).length === 0) {
    // If index is empty, initialize it first
    await getCountries();
  }
  return countryByCodeIndex[code];
}

// Helper function to enforce bot limits
export function enforceBotLimit(quantity: number): number {
  return Math.min(quantity, MAX_BOT_LIMIT);
}

// Add method to clear cache if needed
export function clearCountryCache(): void {
  cachedCountries = null;
  Object.keys(countryByCodeIndex).forEach(key => delete countryByCodeIndex[key]);
}