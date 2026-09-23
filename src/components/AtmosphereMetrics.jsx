import React from 'react';
import { 
  Wind, 
  Droplets, 
  Compass, 
  Gauge, 
  Eye, 
  Cloud, 
  Sun, 
  ShieldAlert, 
  Activity 
} from 'lucide-react';

export default function AtmosphereMetrics({ current, unit = 'metric' }) {
  if (!current) return null;
  const isMetric = unit === 'metric';

  // Compute Beaufort wind scale
  const windKph = current.wind_kph || 0;
  let beaufortDesc = 'Calm';
  if (windKph > 1 && windKph <= 5) beaufortDesc = 'Light Air';
  else if (windKph <= 11) beaufortDesc = 'Light Breeze';
  else if (windKph <= 19) beaufortDesc = 'Gentle Breeze';
  else if (windKph <= 28) beaufortDesc = 'Moderate Breeze';
  else if (windKph <= 38) beaufortDesc = 'Fresh Breeze';
  else if (windKph <= 49) beaufortDesc = 'Strong Breeze';
  else if (windKph <= 61) beaufortDesc = 'Near Gale';
  else if (windKph <= 74) beaufortDesc = 'Gale';
  else if (windKph > 74) beaufortDesc = 'Severe Storm';

  // Humidity comfort
  const humidity = current.humidity || 0;
  let humidityComfort = 'Comfortable';
  if (humidity < 30) humidityComfort = 'Dry & Crisp';
  else if (humidity > 70) humidityComfort = 'Humid & Muggy';
  else if (humidity > 85) humidityComfort = 'Saturated / Tropical';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-400" />
            <h2 className="text-base sm:text-lg font-bold font-display tracking-tight text-white">
              Atmospheric & Wind Telemetry
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Sensor sync: {current.last_updated?.split(' ')[1] || 'Live'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Wind & Compass Card */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Wind className="w-4 h-4 text-sky-400" />
                <span>Wind Direction & Speed</span>
              </div>
              <span className="text-[11px] font-mono text-sky-400">{beaufortDesc}</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums">
                  {isMetric ? `${current.wind_kph} km/h` : `${current.wind_mph} mph`}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Gusts to {isMetric ? `${current.gust_kph} km/h` : `${current.gust_mph} mph`}
                </div>
              </div>

              {/* Graphic Compass dial */}
              <div className="relative w-16 h-16 rounded-full border border-slate-700 bg-slate-950 flex items-center justify-center shrink-0">
                <span className="absolute top-1 text-[9px] font-mono text-slate-500">N</span>
                <span className="absolute right-1 text-[9px] font-mono text-slate-500">E</span>
                <span className="absolute bottom-1 text-[9px] font-mono text-slate-500">S</span>
                <span className="absolute left-1 text-[9px] font-mono text-slate-500">W</span>
                {/* Needle */}
                <div
                  className="w-1 h-10 bg-gradient-to-t from-transparent via-sky-400 to-rose-500 rounded-full transition-transform duration-700"
                  style={{ transform: `rotate(${current.wind_degree || 0}deg)` }}
                />
                <div className="absolute w-2 h-2 rounded-full bg-white shadow" />
              </div>
            </div>

            <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-2 flex justify-between">
              <span>Heading: <strong className="text-slate-200">{current.wind_dir}</strong></span>
              <span className="font-mono tabular-nums">{current.wind_degree}°</span>
            </div>
          </div>

          {/* Humidity & Dew Point Card */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span>Moisture & Dew Point</span>
              </div>
              <span className="text-[11px] font-medium text-blue-400">{humidityComfort}</span>
            </div>

            <div className="pt-1">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold font-mono text-white tabular-nums">
                  {current.humidity}%
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Dew Point: {isMetric ? `${current.dewpoint_c}°C` : `${current.dewpoint_f}°F`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all"
                  style={{ width: `${current.humidity}%` }}
                />
              </div>
            </div>

            <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-2 flex justify-between">
              <span>Heat Index: <strong className="text-slate-200 font-mono">{isMetric ? `${current.heatindex_c}°C` : `${current.heatindex_f}°F`}</strong></span>
              <span>Chill: <strong className="text-slate-200 font-mono">{isMetric ? `${current.windchill_c}°C` : `${current.windchill_f}°F`}</strong></span>
            </div>
          </div>

          {/* Barometric Pressure Card */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Gauge className="w-4 h-4 text-teal-400" />
                <span>Barometric Pressure</span>
              </div>
              <span className="text-[11px] font-mono text-teal-400">
                {current.pressure_mb > 1013 ? 'Steady High' : 'Low Depression'}
              </span>
            </div>

            <div className="pt-1">
              <div className="text-3xl font-bold font-mono text-white tabular-nums">
                {isMetric ? `${current.pressure_mb}` : `${current.pressure_in}`}
                <span className="text-sm font-normal text-slate-400 ml-1.5">
                  {isMetric ? 'hPa' : 'inHg'}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Standard baseline: 1013.25 hPa
              </div>
            </div>

            <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-2 flex justify-between">
              <span>Trend: <strong className="text-slate-200">{current.pressure_mb >= 1015 ? 'Rising / Fair' : 'Stable'}</strong></span>
              <span>Altimeter: <strong className="text-slate-200 font-mono">{current.pressure_mb} mb</strong></span>
            </div>
          </div>

          {/* Visibility & Cloud Density Card */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span>Visibility & Horizon</span>
              </div>
              <span className="text-[11px] font-mono text-indigo-400">
                {current.vis_km >= 10 ? 'Optimal' : 'Hazy / Restricted'}
              </span>
            </div>

            <div className="pt-1">
              <div className="text-3xl font-bold font-mono text-white tabular-nums">
                {isMetric ? `${current.vis_km}` : `${current.vis_miles}`}
                <span className="text-sm font-normal text-slate-400 ml-1.5">
                  {isMetric ? 'km' : 'miles'}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Cloud coverage: <strong className="text-slate-200 font-mono">{current.cloud}%</strong>
              </div>
            </div>

            <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-2 flex justify-between">
              <span>Precip volume:</span>
              <span className="font-mono text-slate-200 font-semibold">
                {isMetric ? `${current.precip_mm} mm` : `${current.precip_in} in`}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
