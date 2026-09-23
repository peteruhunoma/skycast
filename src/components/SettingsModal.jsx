import React, { useState } from 'react';
import { Settings, X, Key, Check, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { getApiKey, setApiKey, fetchWeatherForecast } from '../services/weatherService';

export default function SettingsModal({
  isOpen,
  onClose,
  unit,
  setUnit,
  onClearFavorites,
  onReloadWeather
}) {
  const [keyInput, setKeyInput] = useState(getApiKey());
  const [testStatus, setTestStatus] = useState(null); // 'testing' | 'success' | 'error'
  const [testMsg, setTestMsg] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    setApiKey(keyInput);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    onReloadWeather();
  };

  const handleResetDefault = () => {
    const defaultKey = '6248a32d5d044436a1b122602262309';
    setKeyInput(defaultKey);
    setApiKey(defaultKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    onReloadWeather();
  };

  const handleTestKey = async () => {
    setTestStatus('testing');
    setTestMsg('');
    try {
      await fetchWeatherForecast('London', 1);
      setTestStatus('success');
      setTestMsg('API Key validated successfully! WeatherAPI services active.');
    } catch (err) {
      setTestStatus('error');
      setTestMsg(err.message || 'Verification failed. Check API key validity.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden space-y-5 p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold font-display text-white">
              Application & API Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* API Key Configuration */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-sky-400" />
            <span>WeatherAPI.com API Key</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Enter your WeatherAPI key..."
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg text-xs font-mono text-slate-200 outline-none"
            />
            <button
              onClick={handleSaveKey}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors shrink-0"
            >
              {isSaved ? 'Saved!' : 'Save'}
            </button>
          </div>
          
          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              onClick={handleResetDefault}
              className="text-slate-500 hover:text-slate-300 underline"
            >
              Restore default key (6248a32...)
            </button>
            <button
              onClick={handleTestKey}
              disabled={testStatus === 'testing'}
              className="text-sky-400 hover:text-sky-300 font-medium"
            >
              {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>
          </div>

          {/* Test Status feedback */}
          {testStatus && (
            <div
              className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                testStatus === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : testStatus === 'error'
                  ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {testStatus === 'success' ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : testStatus === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <RefreshCw className="w-4 h-4 animate-spin text-sky-400 shrink-0" />
              )}
              <span>{testMsg}</span>
            </div>
          )}
        </div>

        {/* Units System */}
        <div className="space-y-2 border-t border-slate-800 pt-4">
          <label className="text-xs font-semibold text-slate-300 block">
            Units System
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setUnit('metric')}
              className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                unit === 'metric'
                  ? 'bg-sky-500/15 border-sky-500/40 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-white">Metric (°C)</div>
              <div className="text-[11px] text-slate-500 mt-0.5">km/h, mm, hPa, km</div>
            </button>

            <button
              onClick={() => setUnit('imperial')}
              className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                unit === 'imperial'
                  ? 'bg-sky-500/15 border-sky-500/40 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-white">Imperial (°F)</div>
              <div className="text-[11px] text-slate-500 mt-0.5">mph, in, inHg, miles</div>
            </button>
          </div>
        </div>

        {/* Storage Management */}
        <div className="space-y-2 border-t border-slate-800 pt-4">
          <label className="text-xs font-semibold text-slate-300 block">
            Storage & Cache
          </label>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Clear all bookmarked favorites</span>
            <button
              onClick={onClearFavorites}
              className="px-3 py-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors"
            >
              Clear Favorites
            </button>
          </div>
        </div>

        {/* Attribution & Links */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span>Powered by</span>
            <a
              href="https://www.weatherapi.com/"
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:underline flex items-center gap-0.5 font-medium"
            >
              WeatherAPI.com <ExternalLink className="w-3 h-3 inline" />
            </a>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-medium"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
