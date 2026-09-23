import React from 'react';
import { Sun, Moon, Sunrise, Sunset, Clock, Sparkles } from 'lucide-react';

export default function AstronomyCard({ astro, localtime, isDay = 1 }) {
  if (!astro) return null;

  // Calculate day length and sun position
  // E.g. astro.sunrise = "06:48 AM", astro.sunset = "06:57 PM"
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    try {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return 0;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    } catch {
      return 0;
    }
  };

  const sunriseMinutes = parseTimeToMinutes(astro.sunrise);
  const sunsetMinutes = parseTimeToMinutes(astro.sunset);
  const totalDaylightMinutes = Math.max(0, sunsetMinutes - sunriseMinutes);
  const daylightHours = Math.floor(totalDaylightMinutes / 60);
  const daylightRemMinutes = totalDaylightMinutes % 60;

  // Local current time minutes
  let currentMinutes = 12 * 60; // fallback noon
  if (localtime) {
    try {
      const timePart = localtime.split(' ')[1];
      const [h, m] = timePart.split(':');
      currentMinutes = parseInt(h, 10) * 60 + parseInt(m, 10);
    } catch {}
  }

  // Sun path progress (0 to 1 across the daylight arc)
  let sunProgress = 0;
  if (currentMinutes < sunriseMinutes) {
    sunProgress = 0;
  } else if (currentMinutes > sunsetMinutes) {
    sunProgress = 1;
  } else if (totalDaylightMinutes > 0) {
    sunProgress = (currentMinutes - sunriseMinutes) / totalDaylightMinutes;
  }

  // Calculate coordinates on SVG semicircle
  // Arc path: M 30 130 A 110 110 0 0 1 250 130
  // Center is (140, 130), Radius is 110
  // Angle runs from PI (sunrise) to 0 (sunset)
  const angle = Math.PI - sunProgress * Math.PI;
  const sunX = 140 - 110 * Math.cos(sunProgress * Math.PI);
  const sunY = 130 - 110 * Math.sin(sunProgress * Math.PI);

  const illumination = Number(astro.moon_illumination) || 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold font-display tracking-tight text-white">
              Solar & Lunar Ephemeris
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Daylight: <strong className="text-slate-200 font-mono">{daylightHours}h {daylightRemMinutes}m</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* Sun & Daylight Arc Card */}
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Sun Trajectory
              </span>
              <span className="text-xs text-amber-400 font-medium">
                {isDay ? 'Daytime in Progress' : 'Nighttime / Below Horizon'}
              </span>
            </div>

            {/* Visual Sun Arc SVG */}
            <div className="py-4 flex justify-center">
              <div className="relative w-full max-w-[280px]">
                <svg viewBox="0 0 280 150" className="w-full h-auto overflow-visible">
                  {/* Horizon line */}
                  <line x1="15" y1="130" x2="265" y2="130" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
                  
                  {/* Trajectory Guide Arc */}
                  <path
                    d="M 30 130 A 110 110 0 0 1 250 130"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  {/* Lit Active Daylight Progress Arc */}
                  {sunProgress > 0 && (
                    <path
                      d={`M 30 130 A 110 110 0 0 1 ${sunX} ${sunY}`}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Sun Orb Indicator */}
                  {isDay && (
                    <g transform={`translate(${sunX}, ${sunY})`}>
                      <circle r="10" fill="#f59e0b" className="animate-pulse" opacity="0.4" />
                      <circle r="6" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" />
                    </g>
                  )}
                </svg>
              </div>
            </div>

            {/* Sunrise and Sunset times */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Sunrise className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Sunrise</span>
                  <span className="text-sm font-bold font-mono text-white tabular-nums">
                    {astro.sunrise}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                  <Sunset className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Sunset</span>
                  <span className="text-sm font-bold font-mono text-white tabular-nums">
                    {astro.sunset}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Moon Phase & Lunar Telemetry Card */}
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Lunar Phase & Illumination
              </span>
              <span className="text-xs text-indigo-300 font-medium">
                {astro.moon_phase}
              </span>
            </div>

            {/* Moon visual representation */}
            <div className="py-4 flex items-center justify-center gap-6">
              <div className="relative w-24 h-24 rounded-full bg-slate-950 border border-slate-700 shadow-2xl flex items-center justify-center overflow-hidden">
                {/* Simulated illuminated slice */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-indigo-100 opacity-90 transition-all rounded-full"
                  style={{
                    clipPath: `inset(0 ${100 - illumination}% 0 0)`,
                  }}
                />
                <Moon className="w-12 h-12 text-slate-400/30 relative z-10" />
              </div>

              <div>
                <div className="text-3xl font-bold font-mono text-white tabular-nums">
                  {illumination}%
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Illuminated Disk
                </div>
                <div className="text-xs text-slate-300 font-medium mt-2">
                  Phase: {astro.moon_phase}
                </div>
              </div>
            </div>

            {/* Moonrise and Moonset times */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Moonrise</span>
                  <span className="text-sm font-bold font-mono text-white tabular-nums">
                    {astro.moonrise || '—'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Moonset</span>
                  <span className="text-sm font-bold font-mono text-white tabular-nums">
                    {astro.moonset || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
