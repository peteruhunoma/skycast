import React from 'react';
import { AlertTriangle, X, ShieldAlert, Clock, MapPin, Info } from 'lucide-react';

export default function WeatherAlertsModal({ alerts = [], isOpen, onClose }) {
  if (!isOpen || alerts.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-amber-500/10 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-amber-300">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold font-display text-white">
              Official Weather Warnings ({alerts.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {alerts.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                <span className="text-sm sm:text-base font-bold text-amber-300">
                  {item.event || item.headline}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {item.severity || 'Advisory'}
                </span>
              </div>

              {item.headline && (
                <p className="text-xs sm:text-sm font-medium text-slate-200">
                  {item.headline}
                </p>
              )}

              {/* Time and Area metadata */}
              <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                {item.effective && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>From: {item.effective}</span>
                  </div>
                )}
                {item.expires && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-rose-400" />
                    <span>Until: {item.expires}</span>
                  </div>
                )}
                {item.areas && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="line-clamp-1">Areas: {item.areas}</span>
                  </div>
                )}
              </div>

              {/* Advisory Description */}
              {item.desc && (
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-xs text-slate-300 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                  {item.desc}
                </div>
              )}

              {/* Instruction if present */}
              {item.instruction && (
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200 space-y-1">
                  <span className="font-semibold block">Safety Recommendations:</span>
                  <p>{item.instruction}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
}
