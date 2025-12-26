
import React from 'react';
import { HYDERABAD_LOCATIONS } from '../data/mockData';
import { LocationData } from '../types';

interface Props {
  selectedId: string;
  onSelect: (data: LocationData) => void;
}

const getAqiColor = (aqi: number) => {
  if (aqi <= 50) return '#22c55e';
  if (aqi <= 100) return '#eab308';
  if (aqi <= 150) return '#f97316';
  if (aqi <= 200) return '#ef4444';
  if (aqi <= 300) return '#a855f7';
  return '#7f1d1d';
};

export const AQIMap: React.FC<Props> = ({ selectedId, onSelect }) => {
  return (
    <div className="relative w-full h-80 bg-slate-900 rounded-2xl overflow-hidden p-8 border border-slate-700">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M10,10 L90,10 L90,90 L10,90 Z" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2,2"/>
          <path d="M50,0 L50,100 M0,50 L100,50" stroke="white" strokeWidth="0.2"/>
        </svg>
      </div>
      
      <div className="relative h-full flex items-center justify-center">
        {/* Simple Abstract Map Plotting */}
        <div className="w-full h-full relative">
           {/* Gachibowli - West */}
           <MapMarker 
            data={HYDERABAD_LOCATIONS[0]} 
            x="20%" y="40%" 
            isSelected={selectedId === 'gachibowli'}
            onClick={() => onSelect(HYDERABAD_LOCATIONS[0])}
           />
           {/* Banjara Hills - Central West */}
           <MapMarker 
            data={HYDERABAD_LOCATIONS[1]} 
            x="45%" y="45%" 
            isSelected={selectedId === 'banjara-hills'}
            onClick={() => onSelect(HYDERABAD_LOCATIONS[1])}
           />
           {/* Charminar - South */}
           <MapMarker 
            data={HYDERABAD_LOCATIONS[2]} 
            x="50%" y="75%" 
            isSelected={selectedId === 'charminar'}
            onClick={() => onSelect(HYDERABAD_LOCATIONS[2])}
           />
           {/* Secunderabad - North East */}
           <MapMarker 
            data={HYDERABAD_LOCATIONS[3]} 
            x="70%" y="30%" 
            isSelected={selectedId === 'secunderabad'}
            onClick={() => onSelect(HYDERABAD_LOCATIONS[3])}
           />
           {/* Kukatpally - North West */}
           <MapMarker 
            data={HYDERABAD_LOCATIONS[4]} 
            x="30%" y="25%" 
            isSelected={selectedId === 'kukatpally'}
            onClick={() => onSelect(HYDERABAD_LOCATIONS[4])}
           />
        </div>
      </div>
      <div className="absolute bottom-4 left-4 text-xs text-slate-400">
        * Abstract Area Representation
      </div>
    </div>
  );
};

const MapMarker = ({ data, x, y, isSelected, onClick }: { data: LocationData, x: string, y: string, isSelected: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group`}
    style={{ left: x, top: y }}
  >
    <div className={`relative flex flex-col items-center`}>
      <div 
        className={`w-6 h-6 rounded-full border-2 border-white shadow-lg transition-all ${isSelected ? 'scale-150 ring-4 ring-blue-500/50' : 'hover:scale-125'}`}
        style={{ backgroundColor: getAqiColor(data.aqi) }}
      />
      <span className={`mt-2 text-[10px] font-medium whitespace-nowrap px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        {data.name}
      </span>
    </div>
  </button>
);
