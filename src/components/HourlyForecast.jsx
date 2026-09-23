import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Droplets, Wind, Info, X } from 'lucide-react';

export default function HourlyForecast({ forecastDays, unit = 'metric', currentTimeEpoch }) {
  const scrollRef = useRef(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const isMetric = unit === 'metric';

  if (!forecastDays || forecastDays.length === 0) return null;

  // Flatten next 24-36 hours starting from current hour
  const nowEpoch = currentTimeEpoch || Math.floor(Date.now() / 1000);
  const allHours = [];

  forecastDays.forEach((dayObj) => {
    if (dayObj && dayObj.hour) {
      dayObj.hour.forEach((h) => {
        allHours.push(h);
      });
    }
  });

  // Filter hours from current hour onwards (or at least the first 24 hours)
  const currentHourStart = nowEpoch - 3600; // include current ongoing hour
  const upcomingHours = allHours
    .filter((h) => h.time_epoch >= currentHourStart)
    .slice(0, 24);

  // If filtered is empty (e.g. edge case in timezone), fallback to today's 24 hours
  const hoursToDisplay = upcomingHours.length >= 6 ? upcomingHours : forecastDays[0].hour;

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const formatHourTime = (timeStr, index) => {
    if (index === 0) return 'Now';
    try {
      const timePart = timeStr.split(' ')[1];
      const [h] = timePart.split(':');
      const hourNum = parseInt(h, 10);
      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      const formatted = hourNum % 12 === 0 ? 12 : hourNum % 12;
      return `${formatted} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold font-display tracking-tight text-white">
              Hourly Timeline
            </h2>
            <span className="text-xs text-slate-500">Next 24 Hours</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll Track */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth"
        >
          {hoursToDisplay.map((hour, idx) => {
            const temp = Math.round(isMetric ? hour.temp_c : hour.temp_f);
            const rainChance = hour.chance_of_rain || 0;
            const wind = isMetric ? `${Math.round(hour.wind_kph)}` : `${Math.round(hour.wind_mph)}`;
            const isNow = idx === 0;

            return (
              <button
                key={hour.time_epoch}
                onClick={() => setSelectedHour(hour)}
                type="button"
                className={`flex flex-col items-center justify-between p-3.5 rounded-xl min-w-[104px] transition-all text-center group cursor-pointer ${
                  isNow
                    ? 'bg-sky-500/15 border border-sky-500/40 shadow-sm'
                    : 'bg-slate-900/70 border border-slate-800/60 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                {/* Time */}
                <span className={`text-xs font-medium ${isNow ? 'text-sky-300 font-semibold' : 'text-slate-400'}`}>
                  {formatHourTime(hour.time, idx)}
                </span>

                {/* Weather Icon */}
                <div className="my-2 relative">
                  <img
                    src={`https:${hour.condition.icon}`}
                    alt={hour.condition.text}
                    className="w-10 h-10 object-contain mx-auto group-hover:scale-110 transition-transform"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>

                {/* Temperature */}
                <div className="text-base font-bold font-mono text-white tabular-nums">
                  {temp}°
                </div>

                {/* Rain Probability Indicator */}
                <div className="mt-2.5 w-full">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-cyan-400 font-medium">
                    <Droplets className="w-3 h-3 shrink-0" />
                    <span className="font-mono tabular-nums">{rainChance}%</span>
                  </div>
                  {/* Subtle precipitation bar */}
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, rainChance)}%` }}
                    />
                  </div>
                </div>

                {/* Wind metric */}
                <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-slate-500 font-mono">
                  <Wind className="w-2.5 h-2.5" />
                  <span>{wind} {isMetric ? 'km/h' : 'mph'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hourly Detail Popover / Modal */}
      {selectedHour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-semibold text-white">
                  Hourly Conditions · {selectedHour.time.split(' ')[1]}
                </h3>
              </div>
              <button
                onClick={() => setSelectedHour(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={`https:${selectedHour.condition.icon}`}
                alt={selectedHour.condition.text}
                className="w-14 h-14"
              />
              <div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums">
                  {Math.round(isMetric ? selectedHour.temp_c : selectedHour.temp_f)}
                  {isMetric ? '°C' : '°F'}
                </div>
                <div className="text-sm text-slate-300 font-medium">
                  {selectedHour.condition.text}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block mb-0.5">Feels Like</span>
                <span className="text-sm font-semibold font-mono text-white tabular-nums">
                  {Math.round(isMetric ? selectedHour.feelslike_c : selectedHour.feelslike_f)}°
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block mb-0.5">Chance of Rain</span>
                <span className="text-sm font-semibold font-mono text-cyan-300 tabular-nums">
                  {selectedHour.chance_of_rain}%
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block mb-0.5">Wind & Gusts</span>
                <span className="text-sm font-semibold font-mono text-white tabular-nums">
                  {isMetric ? `${selectedHour.wind_kph} km/h` : `${selectedHour.wind_mph} mph`}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Direction: {selectedHour.wind_dir} ({selectedHour.wind_degree}°)
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block mb-0.5">Humidity & Dew Point</span>
                <span className="text-sm font-semibold font-mono text-white tabular-nums">
                  {selectedHour.humidity}%
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Dew point: {isMetric ? `${selectedHour.dewpoint_c}°C` : `${selectedHour.dewpoint_f}°F`}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block mb-0.5">UV Index</span>
                <span className="text-sm font-semibold font-mono text-white tabular-nums">
                  {selectedHour.uv}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block mb-0.5">Cloud Cover</span>
                <span className="text-sm font-semibold font-mono text-white tabular-nums">
                  {selectedHour.cloud}%
                </span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedHour(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
