import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2, Star } from 'lucide-react';
import { searchLocations } from '../services/weatherService';

const POPULAR_CITIES = [
  'London',
  'New York',
  'Tokyo',
  'Paris',
  'Dubai',
  'Sydney',
  'Singapore'
];

export default function SearchBar({
  currentLocationName,
  onSelectLocation,
  isFavorite,
  onToggleFavorite,
  onLocateMe,
  isLocating
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchLocations(query);
        setSuggestions(results);
        setIsOpen(true);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    const locName = `${item.name}, ${item.country}`;
    onSelectLocation(locName);
    setQuery('');
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSelectLocation(query.trim());
      setQuery('');
      setIsOpen(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-6 pb-2" ref={dropdownRef}>
      <div className="relative">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
            ) : (
              <Search className="w-4 h-4 text-slate-400" />
            )}
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setIsOpen(true);
            }}
            placeholder="Search city, region, or coordinates (e.g. Tokyo, Paris, 40.71,-74.00)..."
            className="w-full pl-10 pr-24 py-3 bg-slate-900/90 hover:bg-slate-900 focus:bg-slate-900 text-slate-100 placeholder-slate-500 rounded-xl border border-slate-800 focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 text-sm outline-none transition-all shadow-inner"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-md transition-colors"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onToggleFavorite}
              title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              className={`p-1.5 rounded-lg transition-colors ${
                isFavorite
                  ? 'text-amber-400 hover:text-amber-300 bg-amber-500/10'
                  : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
        </form>

        {/* Autocomplete Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
            {suggestions.map((item) => (
              <button
                key={item.id || `${item.lat}-${item.lon}`}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-slate-800/70 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="text-sm font-medium text-slate-200 group-hover:text-white">
                    {item.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {item.region ? `${item.region}, ` : ''}{item.country}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                  {item.lat.toFixed(2)}°, {item.lon.toFixed(2)}°
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Popular Fast-Select Chips */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto py-1 no-scrollbar text-xs">
        <span className="text-slate-500 text-[11px] shrink-0 font-medium">Trending:</span>
        {POPULAR_CITIES.map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => onSelectLocation(city)}
            className="px-2.5 py-1 rounded-md bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white text-xs transition-colors shrink-0"
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  );
}
