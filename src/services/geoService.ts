import * as Location from 'expo-location';

export interface NominatimCity {
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
}

export async function searchIndianCities(query: string): Promise<NominatimCity[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const encoded = encodeURIComponent(query.trim());
    const url = `https://photon.komoot.io/api/?q=${encoded}&limit=10&lang=en&bbox=68.1766451354,7.96553477623,97.4025614766,35.4940095078`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.features || data.features.length === 0) return [];
    return data.features.map((feature: any) => {
      const props = feature.properties;
      const name = props.name || props.city || props.town || props.village || props.county || '';
      const parts = [
        props.name,
        props.city || props.town || props.village,
        props.state,
      ].filter(Boolean).filter((v: string, i: number, arr: string[]) => arr.indexOf(v) === i);
      const displayName = parts.join(', ') || props.name || '';
      return {
        name,
        displayName,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
      };
    }).filter((c: NominatimCity) => c.name);
  } catch (error) {
    console.warn('Photon search failed:', error);
    return [];
  }
}