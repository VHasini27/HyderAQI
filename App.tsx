
import React, { useState, useEffect, useRef } from 'react';
import { HYDERABAD_LOCATIONS, getHistoricalData } from './data/mockData';
import { LocationData, AQICategory } from './types';
import { getHealthInsights, chatWithAQI, fetchAreaAqiViaSearch } from './services/geminiService';
import { AQIMap } from './components/AQIMap';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Wind, Thermometer, Droplets, MapPin, 
  AlertCircle, Activity, Info, MessageSquare, 
  X, Send, BrainCircuit, RefreshCw, Search, Loader2, ExternalLink
} from 'lucide-react';

const getAQICategory = (aqi: number): { label: AQICategory; colorClass: string; textColor: string } => {
  if (aqi <= 50) return { label: 'Good', colorClass: 'aqi-gradient-good', textColor: 'text-green-400' };
  if (aqi <= 100) return { label: 'Moderate', colorClass: 'aqi-gradient-moderate', textColor: 'text-yellow-400' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', colorClass: 'aqi-gradient-unhealthy-sens', textColor: 'text-orange-400' };
  if (aqi <= 200) return { label: 'Unhealthy', colorClass: 'aqi-gradient-unhealthy', textColor: 'text-red-400' };
  if (aqi <= 300) return { label: 'Very Unhealthy', colorClass: 'aqi-gradient-very-unhealthy', textColor: 'text-purple-400' };
  return { label: 'Hazardous', colorClass: 'aqi-gradient-hazardous', textColor: 'text-red-700' };
};

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState<LocationData>(HYDERABAD_LOCATIONS[0]);
  const [historicalData, setHistoricalData] = useState(getHistoricalData(HYDERABAD_LOCATIONS[0].id));
  const [healthInsights, setHealthInsights] = useState<string>('Loading AI insights...');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchSources, setSearchSources] = useState<any[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistoricalData(getHistoricalData(selectedLocation.id));
    fetchInsights(selectedLocation);
  }, [selectedLocation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const fetchInsights = async (location: LocationData) => {
    setHealthInsights('AI is analyzing real-time patterns...');
    const result = await getHealthInsights(location);
    setHealthInsights(result || 'Unable to generate insights.');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // Check if it's one of our mock locations first
    const localMatch = HYDERABAD_LOCATIONS.find(l => 
      l.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (localMatch) {
      setSelectedLocation(localMatch);
      setSearchTerm('');
      setSearchSources([]);
      return;
    }

    // Otherwise, perform AI Grounded Search
    setIsSearching(true);
    const result = await fetchAreaAqiViaSearch(searchTerm);
    setIsSearching(false);

    if (result) {
      setSelectedLocation(result.data);
      setSearchSources(result.sources);
      setSearchTerm('');
    } else {
      alert("Could not find air quality data for that area. Please try a different neighborhood in Hyderabad.");
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsThinking(true);

    const response = await chatWithAQI(userMsg, []);
    setChatMessages(prev => [...prev, { role: 'assistant', text: response }]);
    setIsThinking(false);
  };

  const category = getAQICategory(selectedLocation.aqi);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 glass p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
            <Wind className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">HyderAQI</h1>
            <p className="text-slate-400 text-sm flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Hyderabad City Air Monitoring
            </p>
          </div>
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl relative group">
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Monitor any area (e.g. Uppal, Jubilee Hills, Mehdipatnam)..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-500 group-hover:border-slate-500"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
          <button 
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchInsights(selectedLocation)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <div className="hidden lg:block h-8 w-px bg-slate-700" />
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Global Status</p>
            <p className="text-orange-400 font-semibold">Poor Air Quality Today</p>
          </div>
        </div>
      </header>

      {/* Search Overlay/Loading */}
      {isSearching && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-32 h-32 border-4 border-blue-500/20 rounded-full animate-ping absolute inset-0" />
            <div className="w-32 h-32 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin relative z-10" />
            <Search className="absolute inset-0 m-auto w-10 h-10 text-blue-500 animate-pulse" />
          </div>
          <h2 className="mt-8 text-2xl font-bold">Scanning {searchTerm}...</h2>
          <p className="text-slate-400 mt-2">Gemini AI is fetching live ground data from Google Search</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Stats Column */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-8 rounded-[2rem] shadow-2xl relative overflow-hidden transition-all duration-500 ${category.colorClass}`}>
               <div className="absolute top-0 right-0 p-8 opacity-20">
                 <Wind size={120} />
               </div>
               <div className="relative z-10 space-y-4">
                 <h2 className="text-white/80 font-medium">Current AQI in {selectedLocation.name}</h2>
                 <div className="flex items-baseline gap-2">
                   <span className="text-8xl font-black text-white">{selectedLocation.aqi}</span>
                   <span className="text-xl font-bold text-white/80">AQI</span>
                 </div>
                 <div className="flex flex-wrap gap-2">
                   <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full inline-block border border-white/30">
                     <p className="text-white font-bold">{category.label}</p>
                   </div>
                   {searchSources.length > 0 && (
                     <div className="bg-green-500/20 backdrop-blur-md px-4 py-2 rounded-full inline-flex items-center gap-2 border border-green-400/30 text-white text-xs font-bold">
                       <Activity className="w-3 h-3" /> Grounded Result
                     </div>
                   )}
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard icon={<Thermometer className="text-orange-400"/>} label="Temperature" value={`${selectedLocation.temperature}°C`} />
              <StatCard icon={<Droplets className="text-blue-400"/>} label="Humidity" value={`${selectedLocation.humidity}%`} />
              <StatCard icon={<Activity className="text-purple-400"/>} label="Visibility" value="2.4 km" />
              <StatCard icon={<AlertCircle className="text-red-400"/>} label="UV Index" value="High" />
            </div>
          </div>

          {/* Grounding Sources (if available) */}
          {searchSources.length > 0 && (
            <div className="glass p-4 rounded-2xl border-l-4 border-l-green-500 animate-in fade-in slide-in-from-top-4">
              <p className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                <ExternalLink className="w-3 h-3" /> Data Sources for this area:
              </p>
              <div className="flex flex-wrap gap-2">
                {searchSources.map((chunk, idx) => (
                  <a 
                    key={idx} 
                    href={chunk.web?.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 text-blue-400 transition-colors flex items-center gap-1.5"
                  >
                    {chunk.web?.title || 'Source'} <ExternalLink className="w-2 h-2" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Map View */}
          <div className="glass p-6 rounded-3xl shadow-lg">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-bold flex items-center gap-2">
                 <MapPin className="text-blue-500" /> Area Monitoring Map
               </h3>
               <div className="flex flex-wrap gap-2 text-xs">
                 {HYDERABAD_LOCATIONS.map(loc => (
                   <button 
                    key={loc.id} 
                    onClick={() => { setSelectedLocation(loc); setSearchSources([]); }}
                    className={`px-3 py-1.5 rounded-full transition-all border ${selectedLocation.id === loc.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                   >
                     {loc.name.split(' ')[0]}
                   </button>
                 ))}
               </div>
             </div>
             <AQIMap selectedId={selectedLocation.id} onSelect={(loc) => { setSelectedLocation(loc); setSearchSources([]); }} />
          </div>

          {/* Historical Trends */}
          <div className="glass p-6 rounded-3xl shadow-lg h-[400px]">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Activity className="text-green-500" /> 24-Hour AQI Trend
            </h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#60a5fa' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="aqi" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 8, stroke: 'white', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI & Pollutants Column */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI Insights Card */}
          <div className="glass p-6 rounded-3xl shadow-lg border-l-4 border-l-blue-500 flex flex-col h-fit">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-bold flex items-center gap-2">
                <BrainCircuit className="text-blue-500" /> AI Health Coach
              </h3>
              <div className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] rounded uppercase tracking-tighter font-bold">Powered by Gemini</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-2xl text-sm leading-relaxed text-slate-300 min-h-[150px] whitespace-pre-wrap">
              {healthInsights}
            </div>
          </div>

          {/* Pollutant Breakdown */}
          <div className="glass p-6 rounded-3xl shadow-lg">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Info className="text-orange-500" /> Pollutant Breakdown
            </h3>
            <div className="space-y-4">
              <PollutantRow label="PM 2.5" value={selectedLocation.pollutants.pm25} unit="μg/m³" max={100} color="bg-red-500" />
              <PollutantRow label="PM 10" value={selectedLocation.pollutants.pm10} unit="μg/m³" max={200} color="bg-orange-500" />
              <PollutantRow label="NO2" value={selectedLocation.pollutants.no2} unit="ppb" max={50} color="bg-yellow-500" />
              <PollutantRow label="SO2" value={selectedLocation.pollutants.so2} unit="ppb" max={50} color="bg-blue-500" />
              <PollutantRow label="CO" value={selectedLocation.pollutants.co} unit="ppm" max={5} color="bg-green-500" />
              <PollutantRow label="O3" value={selectedLocation.pollutants.o3} unit="ppb" max={100} color="bg-purple-500" />
            </div>
          </div>

          {/* Local Weather Status Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-3xl border border-indigo-500/30">
             <div className="flex justify-between items-start mb-4">
                <div>
                   <h4 className="font-bold text-white">Weather Context</h4>
                   <p className="text-xs text-indigo-300">Affects dispersion</p>
                </div>
                <div className="bg-indigo-500/20 p-2 rounded-xl">
                   <Thermometer className="text-indigo-400 w-5 h-5" />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-2xl">
                   <p className="text-[10px] text-indigo-300 uppercase">Wind Speed</p>
                   <p className="text-xl font-bold">12 km/h</p>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl">
                   <p className="text-[10px] text-indigo-300 uppercase">Direction</p>
                   <p className="text-xl font-bold">NW</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95 group z-40"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700">
          Ask HyderAQI AI Assistant
        </span>
      </button>

      {/* Chat Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-[2rem] shadow-2xl flex flex-col h-[600px] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <BrainCircuit className="text-white w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">HyderAQI Assistant</h3>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Online
                  </p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                  <BrainCircuit className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">Hello! Ask me anything about air quality in Hyderabad.</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <button onClick={() => setChatInput("Why is AQI high in Charminar?")} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-full text-xs border border-slate-700">Why is AQI high in Charminar?</button>
                    <button onClick={() => setChatInput("Health tips for Gachibowli?")} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-full text-xs border border-slate-700">Health tips for Gachibowli?</button>
                  </div>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700 animate-pulse flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Input */}
            <div className="p-6 bg-slate-800/50 border-t border-slate-800">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your question..." 
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isThinking || !chatInput.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm">
        <p>&copy; 2024 HyderAQI - Real-time Hyderabad Air Monitoring Network</p>
        <div className="flex justify-center gap-6 mt-4">
           <a href="#" className="hover:text-blue-400 transition-colors">Data Standards</a>
           <a href="#" className="hover:text-blue-400 transition-colors">Health Guidelines</a>
           <a href="#" className="hover:text-blue-400 transition-colors">Contact TSPCB</a>
        </div>
      </footer>
    </div>
  );
}

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="glass p-4 rounded-2xl flex flex-col items-center justify-center text-center group hover:border-slate-500 transition-all">
    <div className="mb-2 p-2 bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">{label}</p>
    <p className="text-xl font-bold">{value}</p>
  </div>
);

const PollutantRow = ({ label, value, unit, max, color }: { label: string, value: number, unit: string, max: number, color: string }) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">{value} {unit}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
