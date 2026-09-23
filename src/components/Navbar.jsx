import React from 'react';
import { 
  CloudSun, 
  MapPin, 
  RotateCw, 
  Settings, 
  Star, 
  Thermometer,
  Layers,
  Compass,
  SunMedium
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  unit,
  toggleUnit,
  onRefresh,
  isRefreshing,
  onLocateMe,
  isLocating,
  favoritesCount,
  onOpenFavorites,
  onOpenSettings
}) {
  const navTabs = [
    { id: 'overview', label: 'Overview', icon: CloudSun },
    { id: 'forecast', label: 'Forecast', icon: Thermometer },
    { id: 'air-quality', label: 'Air Quality', icon: Layers },
    { id: 'astronomy', label: 'Sun & Moon', icon: SunMedium },
    { id: 'radar', label: 'Radar Map', icon: Compass },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single element Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <CloudSun className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-white group-hover:text-sky-300 transition-colors">
              SkyCast
            </span>
          </button>
        </div>

        {/* Zone 2: Clean 4-6 text navigation links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Unit Toggle Button */}
          <button
            onClick={toggleUnit}
            title={`Switch to ${unit === 'metric' ? 'Fahrenheit (°F)' : 'Celsius (°C)'}`}
            className="px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-1 shadow-sm"
          >
            <span className={unit === 'metric' ? 'text-sky-400' : 'text-slate-500'}>°C</span>
            <span className="text-slate-600">/</span>
            <span className={unit === 'imperial' ? 'text-sky-400' : 'text-slate-500'}>°F</span>
          </button>

          {/* Locate Me Button */}
          <button
            onClick={onLocateMe}
            disabled={isLocating}
            title="Use current GPS location"
            className="p-2 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all disabled:opacity-50"
            aria-label="Use current location"
          >
            <MapPin className={`w-4 h-4 ${isLocating ? 'animate-bounce text-sky-400' : ''}`} />
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh weather data"
            className="p-2 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all disabled:opacity-50"
            aria-label="Refresh data"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          {/* Favorites Drawer Toggle */}
          <button
            onClick={onOpenFavorites}
            title="Saved Locations"
            className="relative p-2 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            aria-label="Open saved locations"
          >
            <Star className="w-4 h-4 text-amber-400" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Settings Modal Toggle */}
          <button
            onClick={onOpenSettings}
            title="API & Settings"
            className="p-2 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
            aria-label="Open settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/60 bg-slate-950/95 px-2 py-1.5 overflow-x-auto">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap ${
                isActive ? 'text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
