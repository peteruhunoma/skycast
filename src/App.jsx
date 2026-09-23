import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import CurrentWeatherHero from './components/CurrentWeatherHero';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import AtmosphereMetrics from './components/AtmosphereMetrics';
import AirQualityCard from './components/AirQualityCard';
import AstronomyCard from './components/AstronomyCard';
import RadarMap from './components/RadarMap';
import FavoritesDrawer from './components/FavoritesDrawer';
import WeatherAlertsModal from './components/WeatherAlertsModal';
import SettingsModal from './components/SettingsModal';
import { fetchWeatherForecast } from './services/weatherService';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';

const DEFAULT_CITY = 'London';

export default function App() {
  // Navigation & Modals
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // User Preferences
  const [unit, setUnit] = useState(() => {
    return localStorage.getItem('skycast_unit') || 'metric';
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('skycast_favorites');
      return saved ? JSON.parse(saved) : ['London', 'Tokyo', 'New York', 'Paris'];
    } catch {
      return ['London', 'Tokyo', 'New York', 'Paris'];
    }
  });

  // Weather Query State
  const [currentQuery, setCurrentQuery] = useState(() => {
    return localStorage.getItem('skycast_last_city') || DEFAULT_CITY;
  });

  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Sync unit to localStorage
  useEffect(() => {
    localStorage.setItem('skycast_unit', unit);
  }, [unit]);

  // Sync favorites to localStorage
  useEffect(() => {
    localStorage.setItem('skycast_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Fetch Weather Data
  const loadWeather = useCallback(async (query, showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await fetchWeatherForecast(query, 3);
      setWeatherData(data);
      setCurrentQuery(query);
      localStorage.setItem('skycast_last_city', query);
    } catch (err) {
      console.error('Error loading weather:', err);
      setErrorMessage(err.message || 'Unable to fetch weather data for the specified location.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadWeather(currentQuery);
  }, [loadWeather]);

  // Geolocation handler
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude.toFixed(4)},${position.coords.longitude.toFixed(4)}`;
        loadWeather(coords);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err);
        setIsLocating(false);
        // Fallback gracefully without breaking
        setErrorMessage('Location permission was denied. You can search for your city directly.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Toggle favorite for current city
  const isCurrentFavorite = weatherData?.location?.name
    ? favorites.some((c) => c.toLowerCase() === weatherData.location.name.toLowerCase())
    : false;

  const toggleFavorite = () => {
    if (!weatherData?.location?.name) return;
    const name = weatherData.location.name;
    if (isCurrentFavorite) {
      setFavorites(favorites.filter((c) => c.toLowerCase() !== name.toLowerCase()));
    } else {
      setFavorites([...favorites, name]);
    }
  };

  const handleSelectLocation = (loc) => {
    loadWeather(loc);
  };

  const handleRemoveFavorite = (city) => {
    setFavorites(favorites.filter((c) => c.toLowerCase() !== city.toLowerCase()));
  };

  const handleClearFavorites = () => {
    setFavorites([]);
  };

  const toggleUnit = () => {
    setUnit((prev) => (prev === 'metric' ? 'imperial' : 'metric'));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-sky-200">
      {/* 3-Zone Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unit={unit}
        toggleUnit={toggleUnit}
        onRefresh={() => loadWeather(currentQuery, true)}
        isRefreshing={isRefreshing}
        onLocateMe={handleLocateMe}
        isLocating={isLocating}
        favoritesCount={favorites.length}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 pb-16">
        {/* Search Bar with Autocomplete & Trending Chips */}
        <SearchBar
          currentLocationName={weatherData?.location?.name}
          onSelectLocation={handleSelectLocation}
          isFavorite={isCurrentFavorite}
          onToggleFavorite={toggleFavorite}
          onLocateMe={handleLocateMe}
          isLocating={isLocating}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4 text-center">
            <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
            <p className="text-sm font-medium text-slate-300">Retrieving atmospheric observations...</p>
            <p className="text-xs text-slate-500 font-mono">Querying WeatherAPI sensor network</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && errorMessage && (
          <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Weather Data Unavailable</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              {errorMessage}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => loadWeather(DEFAULT_CITY)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors"
              >
                Load London (Default)
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Check API Key
              </button>
            </div>
          </div>
        )}

        {/* Populated Views */}
        {!isLoading && !errorMessage && weatherData && (
          <div>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <CurrentWeatherHero
                  weatherData={weatherData}
                  unit={unit}
                  onOpenAlerts={() => setIsAlertsOpen(true)}
                />
                <HourlyForecast
                  forecastDays={weatherData.forecast?.forecastday}
                  unit={unit}
                  currentTimeEpoch={weatherData.location?.localtime_epoch}
                />
                <DailyForecast
                  forecastDays={weatherData.forecast?.forecastday}
                  unit={unit}
                />
                <AtmosphereMetrics
                  current={weatherData.current}
                  unit={unit}
                />
                <AirQualityCard
                  airQuality={weatherData.current?.air_quality}
                />
                <AstronomyCard
                  astro={weatherData.forecast?.forecastday?.[0]?.astro}
                  localtime={weatherData.location?.localtime}
                  isDay={weatherData.current?.is_day}
                />
                <RadarMap
                  location={weatherData.location}
                  current={weatherData.current}
                  unit={unit}
                />
              </div>
            )}

            {/* FORECAST TAB */}
            {activeTab === 'forecast' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <CurrentWeatherHero
                  weatherData={weatherData}
                  unit={unit}
                  onOpenAlerts={() => setIsAlertsOpen(true)}
                />
                <HourlyForecast
                  forecastDays={weatherData.forecast?.forecastday}
                  unit={unit}
                  currentTimeEpoch={weatherData.location?.localtime_epoch}
                />
                <DailyForecast
                  forecastDays={weatherData.forecast?.forecastday}
                  unit={unit}
                />
              </div>
            )}

            {/* AIR QUALITY TAB */}
            {activeTab === 'air-quality' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <AirQualityCard
                  airQuality={weatherData.current?.air_quality}
                />
                <AtmosphereMetrics
                  current={weatherData.current}
                  unit={unit}
                />
              </div>
            )}

            {/* ASTRONOMY TAB */}
            {activeTab === 'astronomy' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <AstronomyCard
                  astro={weatherData.forecast?.forecastday?.[0]?.astro}
                  localtime={weatherData.location?.localtime}
                  isDay={weatherData.current?.is_day}
                />
              </div>
            )}

            {/* RADAR MAP TAB */}
            {activeTab === 'radar' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <RadarMap
                  location={weatherData.location}
                  current={weatherData.current}
                  unit={unit}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer (Anti-Slop: clean copyright and attribution) */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">SkyCast</span>
            <span>·</span>
            <span>Global Meteorological Station</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Data provided by WeatherAPI.com</span>
            <span>·</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              API Key Config
            </button>
          </div>
        </div>
      </footer>

      {/* Saved Locations & Comparison Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onSelectCity={handleSelectLocation}
        onRemoveFavorite={handleRemoveFavorite}
        onAddCurrentCity={toggleFavorite}
        currentLocationName={weatherData?.location?.name}
        unit={unit}
      />

      {/* Severe Weather Warnings Modal */}
      <WeatherAlertsModal
        alerts={weatherData?.alerts?.alert || []}
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
      />

      {/* Settings & API Key Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        unit={unit}
        setUnit={setUnit}
        onClearFavorites={handleClearFavorites}
        onReloadWeather={() => loadWeather(currentQuery, true)}
      />
    </div>
  );
}
