
import { LocationData, HistoricalPoint } from '../types';

export const HYDERABAD_LOCATIONS: LocationData[] = [
  {
    id: 'gachibowli',
    name: 'Gachibowli (IT Hub)',
    aqi: 142,
    pollutants: { pm25: 52, pm10: 98, no2: 24, so2: 8, co: 1.2, o3: 45 },
    temperature: 32,
    humidity: 45,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'banjara-hills',
    name: 'Banjara Hills',
    aqi: 85,
    pollutants: { pm25: 28, pm10: 65, no2: 18, so2: 5, co: 0.8, o3: 38 },
    temperature: 31,
    humidity: 48,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'charminar',
    name: 'Charminar (Old City)',
    aqi: 188,
    pollutants: { pm25: 78, pm10: 145, no2: 42, so2: 15, co: 2.4, o3: 52 },
    temperature: 34,
    humidity: 42,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'secunderabad',
    name: 'Secunderabad Junction',
    aqi: 165,
    pollutants: { pm25: 65, pm10: 120, no2: 35, so2: 12, co: 1.9, o3: 48 },
    temperature: 33,
    humidity: 44,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'kukatpally',
    name: 'Kukatpally Housing Board',
    aqi: 156,
    pollutants: { pm25: 58, pm10: 110, no2: 30, so2: 10, co: 1.5, o3: 42 },
    temperature: 32,
    humidity: 46,
    lastUpdated: new Date().toISOString()
  }
];

export const getHistoricalData = (locationId: string): HistoricalPoint[] => {
  const points: HistoricalPoint[] = [];
  const baseAqi = HYDERABAD_LOCATIONS.find(l => l.id === locationId)?.aqi || 100;
  
  for (let i = 24; i >= 0; i--) {
    const time = new Date();
    time.setHours(time.getHours() - i);
    points.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      aqi: Math.floor(baseAqi + (Math.random() * 40 - 20))
    });
  }
  return points;
};
