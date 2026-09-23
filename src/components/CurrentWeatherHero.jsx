import React from 'react';
import { 
  Wind, 
  Droplets, 
  Sun, 
  Eye, 
  Gauge, 
  CloudRain, 
  AlertTriangle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { getWeatherAtmosphere, getUvDescription } from '../services/weatherService';

export default function CurrentWeatherHero({ 
  weatherData, 
  unit = 'metric',
  onOpenAlerts 
}) {
  if (!weatherData || !weatherData.current) return null;

  const { location, current, forecast, alerts } = weatherData;
  const isMetric = unit === 'metric';
  const todayForecast = forecast?.forecastday?.[0]?.day;

  // Temperature values
  const currentTemp = isMetric ? Math.round(current.temp_c) : Math.round(current.temp_f);
  const feelsLike = isMetric ? Math.round(current.feelslike_c) : Math.round(current.feelslike_f);
  const maxTemp = todayForecast 
    ? Math.round(isMetric ? todayForecast.maxtemp_c : todayForecast.maxtemp_f)
    : null;
  const minTemp = todayForecast 
    ? Math.round(isMetric ? todayForecast.mintemp_c : todayForecast.mintemp_f)
    : null;

  const windSpeed = isMetric ? `${current.wind_kph} km/h` : `${current.wind_mph} mph`;
  const gustSpeed = isMetric ? `${current.gust_kph} km/h` : `${current.gust_mph} mph`;
  const visibility = isMetric ? `${current.vis_km} km` : `${current.vis_miles} mi`;
  const pressure = isMetric ? `${current.pressure_mb} hPa` : `${current.pressure_in} inHg`;
  const precipitation = isMetric ? `${current.precip_mm} mm` : `${current.precip_in} in`;

  const atmosphere = getWeatherAtmosphere(current.condition.code, current.is_day);
  const uvInfo = getUvDescription(current.uv);
  const activeAlerts = alerts?.alert || [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Severe Weather Warning Banner */}
      {activeAlerts.length > 0 && (
        <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs sm:text-sm">
              <span className="font-semibold text-amber-300">Weather Alert: </span>
              <span>{activeAlerts[0].headline || activeAlerts[0].event}</span>
            </div>
          </div>
          <button
            onClick={onOpenAlerts}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors whitespace-nowrap"
          >
            View Details ({activeAlerts.length})
          </button>
        </div>
      )}

      {/* Main Atmospheric Hero Container */}
      <div 
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${atmosphere.gradient} border border-slate-800/80 p-6 sm:p-8 lg:p-10 shadow-2xl transition-all duration-700`}
      >
        {/* Subtle Ambient Glow */}
        <div 
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-40 animate-atmosphere"
          style={{ background: atmosphere.glow }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Location & Main Temp */}
          <div className="lg:col-span-7 space-y-4">
            {/* Clean Location & Timestamp metadata (Zero-Pill) */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                <span>{location.region ? `${location.region}, ` : ''}{location.country}</span>
                <span aria-hidden="true">·</span>
                <span>{location.tz_id}</span>
                <span aria-hidden="true">·</span>
                <span>Local: {location.localtime.split(' ')[1]}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight text-white">
                {location.name}
              </h1>
            </div>

            {/* Giant Temperature & Icon Lockup */}
            <div className="flex items-center gap-6 sm:gap-8 pt-2">
              <div className="flex items-baseline">
                <span className="text-6xl sm:text-7xl lg:text-8xl font-bold font-mono tracking-tighter text-white tabular-nums">
                  {currentTemp}
                </span>
                <span className="text-2xl sm:text-3xl lg:text-4xl font-light text-slate-400 ml-1">
                  {isMetric ? '°C' : '°F'}
                </span>
              </div>

              {/* Weather Icon & Condition */}
              <div className="flex flex-col items-start gap-1">
                <img
                  src={current.condition.icon ? `https:${current.condition.icon.replace('64x64', '128x128')}` : ''}
                  alt={current.condition.text}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="text-base sm:text-lg font-medium text-slate-200">
                  {current.condition.text}
                </div>
              </div>
            </div>

            {/* Temp Details (Feels like, High/Low) */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-300 pt-1">
              <span>
                Feels like <strong className="font-semibold text-white font-mono tabular-nums">{feelsLike}°</strong>
              </span>
              {maxTemp !== null && minTemp !== null && (
                <>
                  <span className="text-slate-600" aria-hidden="true">·</span>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span className="font-mono tabular-nums">{maxTemp}°</span>
                  </div>
                  <div className="flex items-center gap-1 text-sky-400">
                    <ArrowDown className="w-3.5 h-3.5" />
                    <span className="font-mono tabular-nums">{minTemp}°</span>
                  </div>
                </>
              )}
              {todayForecast?.daily_chance_of_rain > 0 && (
                <>
                  <span className="text-slate-600" aria-hidden="true">·</span>
                  <div className="flex items-center gap-1 text-cyan-300">
                    <CloudRain className="w-3.5 h-3.5" />
                    <span>{todayForecast.daily_chance_of_rain}% chance of rain</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Key Vital Weather Metrics Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Wind */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 hover:border-slate-700/80 transition-colors">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Wind className="w-3.5 h-3.5 text-sky-400" />
                <span>Wind</span>
              </div>
              <div className="text-base font-semibold font-mono text-white tabular-nums">
                {windSpeed}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {current.wind_dir} ({current.wind_degree}°) · Gusts {gustSpeed}
              </div>
            </div>

            {/* Humidity */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 hover:border-slate-700/80 transition-colors">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                <span>Humidity</span>
              </div>
              <div className="text-base font-semibold font-mono text-white tabular-nums">
                {current.humidity}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Dew point {isMetric ? `${current.dewpoint_c}°C` : `${current.dewpoint_f}°F`}
              </div>
            </div>

            {/* UV Index */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 hover:border-slate-700/80 transition-colors">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>UV Index</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-semibold font-mono text-white tabular-nums">
                  {current.uv}
                </span>
                <span className={`text-xs font-medium ${uvInfo.color}`}>
                  {uvInfo.level}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                {current.uv > 5 ? 'Sun protection advised' : 'Safe exposure level'}
              </div>
            </div>

            {/* Pressure */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 hover:border-slate-700/80 transition-colors">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Gauge className="w-3.5 h-3.5 text-teal-400" />
                <span>Pressure</span>
              </div>
              <div className="text-base font-semibold font-mono text-white tabular-nums">
                {pressure}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {current.pressure_mb > 1013 ? 'High pressure' : 'Low pressure'}
              </div>
            </div>

            {/* Visibility */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 hover:border-slate-700/80 transition-colors">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>Visibility</span>
              </div>
              <div className="text-base font-semibold font-mono text-white tabular-nums">
                {visibility}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {current.vis_km >= 10 ? 'Clear horizon' : 'Reduced visibility'}
              </div>
            </div>

            {/* Precipitation */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 hover:border-slate-700/80 transition-colors">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                <span>Precipitation</span>
              </div>
              <div className="text-base font-semibold font-mono text-white tabular-nums">
                {precipitation}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Cloud cover {current.cloud}%
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
