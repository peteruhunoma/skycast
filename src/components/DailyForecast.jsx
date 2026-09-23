import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Droplets, Wind, Sun, ArrowUp, ArrowDown } from 'lucide-react';

export default function DailyForecast({ forecastDays, unit = 'metric' }) {
  const [expandedDay, setExpandedDay] = useState(null);
  const isMetric = unit === 'metric';

  if (!forecastDays || forecastDays.length === 0) return null;

  // Calculate global min and max over all forecast days for calibrated temperature bars
  let globalMin = Infinity;
  let globalMax = -Infinity;

  forecastDays.forEach((dayObj) => {
    const min = isMetric ? dayObj.day.mintemp_c : dayObj.day.mintemp_f;
    const max = isMetric ? dayObj.day.maxtemp_c : dayObj.day.maxtemp_f;
    if (min < globalMin) globalMin = min;
    if (max > globalMax) globalMax = max;
  });

  const tempSpan = Math.max(1, globalMax - globalMin);

  const formatDayName = (dateStr, index) => {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    try {
      const parts = dateStr.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString([], { weekday: 'long' });
    } catch {
      return dateStr;
    }
  };

  const formatDateSub = (dateStr) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-sky-400" />
          <h2 className="text-base sm:text-lg font-bold font-display tracking-tight text-white">
            3-Day Outlook
          </h2>
        </div>

        <div className="space-y-3">
          {forecastDays.map((dayObj, index) => {
            const dayData = dayObj.day;
            const minTemp = Math.round(isMetric ? dayData.mintemp_c : dayData.mintemp_f);
            const maxTemp = Math.round(isMetric ? dayData.maxtemp_c : dayData.maxtemp_f);
            const rainChance = dayData.daily_chance_of_rain || 0;
            const isExpanded = expandedDay === index;

            // Bar math
            const leftPct = Math.max(0, ((minTemp - globalMin) / tempSpan) * 100);
            const rightPct = Math.min(100, ((maxTemp - globalMin) / tempSpan) * 100);
            const barWidth = Math.max(8, rightPct - leftPct);

            return (
              <div
                key={dayObj.date}
                className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden transition-all"
              >
                {/* Main Row */}
                <div
                  onClick={() => setExpandedDay(isExpanded ? null : index)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  {/* Day & Date */}
                  <div className="w-36 shrink-0">
                    <div className="text-sm font-semibold text-white">
                      {formatDayName(dayObj.date, index)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatDateSub(dayObj.date)}
                    </div>
                  </div>

                  {/* Condition & Icon */}
                  <div className="flex items-center gap-3 w-48 shrink-0">
                    <img
                      src={`https:${dayData.condition.icon}`}
                      alt={dayData.condition.text}
                      className="w-10 h-10 object-contain shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="text-xs sm:text-sm text-slate-300 font-medium line-clamp-1">
                      {dayData.condition.text}
                    </div>
                  </div>

                  {/* Rain chance */}
                  <div className="flex items-center gap-1.5 text-xs text-cyan-400 w-28 shrink-0 font-medium">
                    <Droplets className="w-3.5 h-3.5" />
                    <span className="font-mono tabular-nums">{rainChance}% rain</span>
                  </div>

                  {/* Temperature Range Bar */}
                  <div className="flex-1 flex items-center gap-3 min-w-[180px]">
                    <span className="text-xs font-mono text-sky-400 w-8 text-right tabular-nums">
                      {minTemp}°
                    </span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full relative overflow-hidden">
                      <div
                        className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-400"
                        style={{
                          left: `${leftPct}%`,
                          width: `${barWidth}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono text-rose-400 w-8 tabular-nums font-semibold">
                      {maxTemp}°
                    </span>
                  </div>

                  {/* Expand Toggle */}
                  <div className="hidden sm:block text-slate-500 hover:text-slate-300">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 bg-slate-950/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                        <Wind className="w-3.5 h-3.5 text-sky-400" />
                        <span>Max Wind</span>
                      </div>
                      <div className="text-sm font-semibold font-mono text-white tabular-nums">
                        {isMetric ? `${dayData.maxwind_kph} km/h` : `${dayData.maxwind_mph} mph`}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                        <Droplets className="w-3.5 h-3.5 text-blue-400" />
                        <span>Precipitation</span>
                      </div>
                      <div className="text-sm font-semibold font-mono text-white tabular-nums">
                        {isMetric ? `${dayData.totalprecip_mm} mm` : `${dayData.totalprecip_in} in`}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                        <span>Max UV</span>
                      </div>
                      <div className="text-sm font-semibold font-mono text-white tabular-nums">
                        {dayData.uv}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                        <span>Avg Humidity</span>
                      </div>
                      <div className="text-sm font-semibold font-mono text-white tabular-nums">
                        {dayData.avghumidity}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
