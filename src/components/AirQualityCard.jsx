import React from 'react';
import { Layers, ShieldCheck, AlertCircle, HeartPulse, Activity } from 'lucide-react';
import { getAqiDescription } from '../services/weatherService';

export default function AirQualityCard({ airQuality }) {
  if (!airQuality) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 text-center text-slate-400">
          Air Quality metrics currently unavailable for this station.
        </div>
      </div>
    );
  }

  const epaIndex = airQuality['us-epa-index'] || 1;
  const defraIndex = airQuality['gb-defra-index'] || 1;
  const aqiInfo = getAqiDescription(epaIndex);

  // Pollutant standards for visual benchmark bars
  const pollutants = [
    {
      name: 'PM2.5',
      fullName: 'Fine Particles (≤2.5 µm)',
      value: airQuality.pm2_5 ? Number(airQuality.pm2_5).toFixed(1) : '—',
      unit: 'µg/m³',
      maxSafe: 25,
      actual: airQuality.pm2_5 || 0,
      description: 'Fine inhalable combustion particles',
    },
    {
      name: 'PM10',
      fullName: 'Coarse Particles (≤10 µm)',
      value: airQuality.pm10 ? Number(airQuality.pm10).toFixed(1) : '—',
      unit: 'µg/m³',
      maxSafe: 50,
      actual: airQuality.pm10 || 0,
      description: 'Dust, pollen, and mold spores',
    },
    {
      name: 'O₃',
      fullName: 'Ground-level Ozone',
      value: airQuality.o3 ? Number(airQuality.o3).toFixed(1) : '—',
      unit: 'µg/m³',
      maxSafe: 100,
      actual: airQuality.o3 || 0,
      description: 'Formed by sunlight interacting with pollutants',
    },
    {
      name: 'NO₂',
      fullName: 'Nitrogen Dioxide',
      value: airQuality.no2 ? Number(airQuality.no2).toFixed(1) : '—',
      unit: 'µg/m³',
      maxSafe: 40,
      actual: airQuality.no2 || 0,
      description: 'Emissions from motor vehicles and fuel',
    },
    {
      name: 'SO₂',
      fullName: 'Sulfur Dioxide',
      value: airQuality.so2 ? Number(airQuality.so2).toFixed(1) : '—',
      unit: 'µg/m³',
      maxSafe: 20,
      actual: airQuality.so2 || 0,
      description: 'Industrial emissions and fossil fuel combustion',
    },
    {
      name: 'CO',
      fullName: 'Carbon Monoxide',
      value: airQuality.co ? Number(airQuality.co).toFixed(1) : '—',
      unit: 'µg/m³',
      maxSafe: 1000,
      actual: airQuality.co || 0,
      description: 'Colorless, odorless gas from vehicle exhausts',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <h2 className="text-base sm:text-lg font-bold font-display tracking-tight text-white">
              Air Quality & Environmental Index
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span>UK DEFRA: <strong className="text-slate-200">{defraIndex}/10</strong></span>
            <span aria-hidden="true">·</span>
            <span>EPA Level: <strong className="text-slate-200">{epaIndex}/6</strong></span>
          </div>
        </div>

        {/* Big Status Banner */}
        <div className={`p-4 sm:p-5 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${aqiInfo.bgColor}`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HeartPulse className={`w-5 h-5 ${aqiInfo.color}`} />
              <span className={`text-lg sm:text-xl font-bold font-display ${aqiInfo.color}`}>
                EPA Index {epaIndex}: {aqiInfo.level}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {aqiInfo.advice}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-800">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Air Rating</span>
              <span className={`text-base font-bold font-mono ${aqiInfo.color}`}>
                {aqiInfo.level.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* 6 Pollutants High-Density Grid */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Primary Pollutants Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pollutants.map((item) => {
              const ratio = Math.min(1.5, item.actual / item.maxSafe);
              const barPercent = Math.min(100, Math.round((ratio / 1.5) * 100));

              let statusColor = 'bg-emerald-400';
              let textColor = 'text-emerald-400';
              if (item.actual > item.maxSafe * 1.5) {
                statusColor = 'bg-rose-400';
                textColor = 'text-rose-400';
              } else if (item.actual > item.maxSafe) {
                statusColor = 'bg-amber-400';
                textColor = 'text-amber-400';
              }

              return (
                <div
                  key={item.name}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold font-mono text-white">{item.name}</span>
                      <span className="text-[11px] text-slate-400 block">{item.fullName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold font-mono text-white tabular-nums">
                        {item.value}
                      </span>
                      <span className="text-[10px] text-slate-500 ml-1">{item.unit}</span>
                    </div>
                  </div>

                  {/* Relative Level Progress Bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${statusColor}`}
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>Safe ceiling: {item.maxSafe} {item.unit}</span>
                    <span className={`font-mono font-medium ${textColor}`}>
                      {item.actual <= item.maxSafe ? 'Within Limits' : 'Elevated'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Health Recommendations Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="font-semibold text-slate-200 block">Outdoor Exercise</span>
            <p className="text-slate-400 leading-normal">
              {epaIndex <= 2 
                ? 'Ideal conditions for jogging, cycling, and vigorous outdoor activities.'
                : 'Consider shifting high-intensity cardio indoors or during early morning.'}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="font-semibold text-slate-200 block">Indoor Ventilation</span>
            <p className="text-slate-400 leading-normal">
              {epaIndex <= 2 
                ? 'Open windows freely to circulate fresh outdoor air throughout living spaces.'
                : 'Keep windows closed; use air purifiers with HEPA filtration if available.'}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="font-semibold text-slate-200 block">Sensitive Demographics</span>
            <p className="text-slate-400 leading-normal">
              {epaIndex <= 2 
                ? 'No adverse risks noted for asthma sufferers, seniors, or small children.'
                : 'Individuals with respiratory conditions should keep rescue inhalers on hand.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
