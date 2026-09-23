import React, { useState, useEffect } from 'react';
import { Star, X, Trash2, ExternalLink, Plus, RefreshCw, BarChart2 } from 'lucide-react';
import { fetchWeatherForecast } from '../services/weatherService';

export default function FavoritesDrawer({
  isOpen,
  onClose,
  favorites = [],
  onSelectCity,
  onRemoveFavorite,
  onAddCurrentCity,
  currentLocationName,
  unit = 'metric',
}) {
  const [favoritesData, setFavoritesData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const isMetric = unit === 'metric';

  // Load preview data for all favorite cities
  useEffect(() => {
    if (!isOpen || favorites.length === 0) return;

    let isCancelled = false;
    async function loadPreviews() {
      setIsLoading(true);
      const results = {};
      for (const city of favorites) {
        try {
          const data = await fetchWeatherForecast(city, 1);
          results[city] = data;
        } catch (e) {
          console.error(`Failed preview for ${city}:`, e);
        }
      }
      if (!isCancelled) {
        setFavoritesData(results);
        setIsLoading(false);
      }
    }

    loadPreviews();
    return () => {
      isCancelled = true;
    };
  }, [isOpen, favorites]);

  if (!isOpen) return null;

  const isCurrentSaved = favorites.some(
    (c) => c.toLowerCase() === (currentLocationName || '').toLowerCase()
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h2 className="text-base font-bold font-display text-white">
              Saved Locations ({favorites.length})
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            {favorites.length >= 2 && (
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1 ${
                  compareMode
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
                title="Compare favorite cities"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>{compareMode ? 'List' : 'Compare'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add Current Location bar */}
        {!isCurrentSaved && currentLocationName && (
          <div className="p-3 bg-sky-950/30 border-b border-slate-800 flex items-center justify-between gap-2">
            <span className="text-xs text-slate-300 truncate">
              Pin <strong>{currentLocationName}</strong> to favorites?
            </span>
            <button
              onClick={onAddCurrentCity}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 transition-colors flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {favorites.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <Star className="w-10 h-10 mx-auto text-slate-600 stroke-1" />
              <p className="text-sm font-medium text-slate-300">No saved locations yet</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Click the star icon in the search bar to bookmark your favorite cities for instant access.
              </p>
            </div>
          ) : compareMode ? (
            /* Comparison Table View */
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Direct Metric Comparison
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-2.5 font-medium">City</th>
                      <th className="p-2.5 font-medium">Temp</th>
                      <th className="p-2.5 font-medium">Condition</th>
                      <th className="p-2.5 font-medium">Humidity</th>
                      <th className="p-2.5 font-medium">Wind</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {favorites.map((city) => {
                      const data = favoritesData[city];
                      if (!data || !data.current) return null;
                      const temp = Math.round(isMetric ? data.current.temp_c : data.current.temp_f);
                      const wind = isMetric ? `${data.current.wind_kph}kph` : `${data.current.wind_mph}mph`;

                      return (
                        <tr
                          key={city}
                          onClick={() => {
                            onSelectCity(city);
                            onClose();
                          }}
                          className="hover:bg-slate-800/40 cursor-pointer"
                        >
                          <td className="p-2.5 font-semibold text-white truncate max-w-[100px]">{city}</td>
                          <td className="p-2.5 font-mono text-white tabular-nums">{temp}°</td>
                          <td className="p-2.5 text-slate-300 truncate max-w-[90px]">{data.current.condition.text}</td>
                          <td className="p-2.5 font-mono text-blue-400 tabular-nums">{data.current.humidity}%</td>
                          <td className="p-2.5 font-mono text-sky-400 tabular-nums">{wind}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Standard Card List View */
            favorites.map((city) => {
              const data = favoritesData[city];
              const current = data?.current;
              const temp = current ? Math.round(isMetric ? current.temp_c : current.temp_f) : null;

              return (
                <div
                  key={city}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3 group"
                >
                  <button
                    onClick={() => {
                      onSelectCity(city);
                      onClose();
                    }}
                    className="flex-1 text-left flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                        {data?.location?.name || city}
                      </div>
                      <div className="text-xs text-slate-400">
                        {data?.location?.country || ''}
                      </div>
                      {current && (
                        <div className="text-xs text-slate-400 mt-1">
                          {current.condition.text} · Humidity {current.humidity}%
                        </div>
                      )}
                    </div>

                    {current && (
                      <div className="flex items-center gap-2 text-right">
                        <img
                          src={`https:${current.condition.icon}`}
                          alt={current.condition.text}
                          className="w-9 h-9 object-contain"
                        />
                        <div className="text-2xl font-bold font-mono text-white tabular-nums">
                          {temp}°
                        </div>
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => onRemoveFavorite(city)}
                    title="Remove from favorites"
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
