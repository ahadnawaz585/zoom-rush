// app/api/countries/route.ts
import { getCountries, getCountryByCode } from '@/services/countryApi';
import { NextResponse } from 'next/server';


export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  try {
    if (code) {
      const country = await getCountryByCode(code);
      if (!country) {
        return NextResponse.json({ error: 'Country not found' }, { status: 404 });
      }
      return NextResponse.json(country);
    } else {
      const countries = await getCountries();
      return NextResponse.json(countries);
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 });
  }
}