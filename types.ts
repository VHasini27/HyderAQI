
export interface Pollutants {
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
}

export interface LocationData {
  id: string;
  name: string;
  aqi: number;
  pollutants: Pollutants;
  temperature: number;
  humidity: number;
  lastUpdated: string;
}

export type AQICategory = 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';

export interface HistoricalPoint {
  time: string;
  aqi: number;
}
