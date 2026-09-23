// WeatherAPI.com Service layer
const DEFAULT_API_KEY = '6248a32d5d044436a1b122602262309';
const BASE_URL = 'https://api.weatherapi.com/v1';

export function getApiKey() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('weatherapi_key') || DEFAULT_API_KEY;
  }
  return DEFAULT_API_KEY;
}

export function setApiKey(newKey) {
  if (typeof window !== 'undefined') {
    if (!newKey || newKey.trim() === '') {
      localStorage.removeItem('weatherapi_key');
    } else {
      localStorage.setItem('weatherapi_key', newKey.trim());
    }
  }
}

/**
 * Fetch full forecast including current conditions, 3-day forecast, hourly data,
 * air quality, and severe weather alerts.
 */
export async function fetchWeatherForecast(query = 'London', days = 3) {
  const key = getApiKey();
  const trimmed = String(query).trim();
  const url = `${BASE_URL}/forecast.json?key=${key}&q=${encodeURIComponent(trimmed)}&days=${days}&aqi=yes&alerts=yes`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.error) {
      const errorMsg = data?.error?.message || `Failed to fetch weather data (${response.status})`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.error('WeatherAPI fetch error:', err);
    throw err;
  }
}

/**
 * Search locations for autocomplete.
 */
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return [];
  const key = getApiKey();
  const url = `${BASE_URL}/search.json?key=${key}&q=${encodeURIComponent(query.trim())}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Location search error:', err);
    return [];
  }
}

/**
 * Air Quality US-EPA Index classification helper
 */
export function getAqiDescription(epaIndex) {
  switch (epaIndex) {
    case 1:
      return {
        level: 'Good',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10 border-emerald-500/30',
        barColor: 'bg-emerald-400',
        advice: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
      };
    case 2:
      return {
        level: 'Moderate',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10 border-yellow-500/30',
        barColor: 'bg-yellow-400',
        advice: 'Air quality is acceptable; however, unusually sensitive people should consider limiting prolonged outdoor exertion.',
      };
    case 3:
      return {
        level: 'Unhealthy for Sensitive Groups',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10 border-orange-500/30',
        barColor: 'bg-orange-400',
        advice: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
      };
    case 4:
      return {
        level: 'Unhealthy',
        color: 'text-rose-400',
        bgColor: 'bg-rose-500/10 border-rose-500/30',
        barColor: 'bg-rose-400',
        advice: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects.',
      };
    case 5:
      return {
        level: 'Very Unhealthy',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10 border-purple-500/30',
        barColor: 'bg-purple-400',
        advice: 'Health alert: The risk of health effects is increased for everyone.',
      };
    case 6:
      return {
        level: 'Hazardous',
        color: 'text-red-500',
        bgColor: 'bg-red-500/15 border-red-500/40',
        barColor: 'bg-red-500',
        advice: 'Health warning of emergency conditions: The entire population is more likely to be affected.',
      };
    default:
      return {
        level: 'Available Soon',
        color: 'text-slate-400',
        bgColor: 'bg-slate-800/40 border-slate-700/40',
        barColor: 'bg-slate-400',
        advice: 'Air quality indices are updating.',
      };
  }
}

/**
 * UV Index classification helper
 */
export function getUvDescription(uv) {
  const val = Number(uv) || 0;
  if (val <= 2) {
    return {
      level: 'Low',
      color: 'text-emerald-400',
      advice: 'Minimal sun protection required. Safe for normal outdoor activities.',
    };
  }
  if (val <= 5) {
    return {
      level: 'Moderate',
      color: 'text-amber-400',
      advice: 'Wear sunglasses, apply SPF 30+ sunscreen, and seek shade during midday.',
    };
  }
  if (val <= 7) {
    return {
      level: 'High',
      color: 'text-orange-400',
      advice: 'Protection essential: Wear protective clothing, wide-brim hat, and reapply sunscreen.',
    };
  }
  if (val <= 10) {
    return {
      level: 'Very High',
      color: 'text-rose-400',
      advice: 'Extra protection required: Avoid sun exposure between 10 AM and 4 PM.',
    };
  }
  return {
    level: 'Extreme',
    color: 'text-purple-400',
    advice: 'Take all precautions: Unprotected skin and eyes can burn in minutes.',
  };
}

/**
 * Weather condition classification for dynamic atmosphere backgrounds
 */
export function getWeatherAtmosphere(conditionCode, isDay = 1) {
  // Code mapping based on WeatherAPI documentation
  // 1000 = Sunny / Clear
  if (conditionCode === 1000) {
    return isDay
      ? {
          type: 'clear-day',
          gradient: 'from-sky-900/60 via-blue-900/40 to-slate-950',
          accent: 'text-amber-300',
          glow: 'rgba(245, 158, 11, 0.15)',
        }
      : {
          type: 'clear-night',
          gradient: 'from-indigo-950/80 via-slate-900/60 to-slate-950',
          accent: 'text-indigo-300',
          glow: 'rgba(99, 102, 241, 0.15)',
        };
  }

  // 1003 = Partly cloudy
  if (conditionCode === 1003) {
    return isDay
      ? {
          type: 'partly-cloudy-day',
          gradient: 'from-sky-950/70 via-slate-900/50 to-slate-950',
          accent: 'text-sky-300',
          glow: 'rgba(56, 189, 248, 0.12)',
        }
      : {
          type: 'partly-cloudy-night',
          gradient: 'from-slate-900/90 via-slate-950/80 to-slate-950',
          accent: 'text-slate-300',
          glow: 'rgba(148, 163, 184, 0.1)',
        };
  }

  // 1006 = Cloudy, 1009 = Overcast
  if (conditionCode === 1006 || conditionCode === 1009) {
    return {
      type: 'cloudy',
      gradient: 'from-slate-800/60 via-slate-900/50 to-slate-950',
      accent: 'text-slate-300',
      glow: 'rgba(148, 163, 184, 0.12)',
    };
  }

  // 1030 = Mist, 1135 = Fog, 1147 = Freezing fog
  if ([1030, 1135, 1147].includes(conditionCode)) {
    return {
      type: 'fog',
      gradient: 'from-teal-950/50 via-slate-900/60 to-slate-950',
      accent: 'text-teal-300',
      glow: 'rgba(45, 212, 191, 0.12)',
    };
  }

  // Rain: 1063, 1180-1201, 1240-1246
  if (
    conditionCode === 1063 ||
    (conditionCode >= 1180 && conditionCode <= 1201) ||
    (conditionCode >= 1240 && conditionCode <= 1246)
  ) {
    return {
      type: 'rain',
      gradient: 'from-blue-950/80 via-slate-900/70 to-slate-950',
      accent: 'text-cyan-300',
      glow: 'rgba(6, 182, 212, 0.15)',
    };
  }

  // Snow: 1066, 1114, 1117, 1210-1225, 1255-1258
  if (
    conditionCode === 1066 ||
    conditionCode === 1114 ||
    conditionCode === 1117 ||
    (conditionCode >= 1210 && conditionCode <= 1225) ||
    (conditionCode >= 1255 && conditionCode <= 1258)
  ) {
    return {
      type: 'snow',
      gradient: 'from-slate-800/80 via-indigo-950/50 to-slate-950',
      accent: 'text-indigo-200',
      glow: 'rgba(199, 210, 254, 0.15)',
    };
  }

  // Thunder: 1087, 1273-1282
  if (conditionCode === 1087 || (conditionCode >= 1273 && conditionCode <= 1282)) {
    return {
      type: 'thunder',
      gradient: 'from-purple-950/80 via-slate-900/80 to-slate-950',
      accent: 'text-amber-300',
      glow: 'rgba(168, 85, 247, 0.2)',
    };
  }

  return {
    type: 'default',
    gradient: 'from-slate-900/70 via-slate-900/40 to-slate-950',
    accent: 'text-sky-300',
    glow: 'rgba(56, 189, 248, 0.1)',
  };
}

/**
 * Format local time nicely
 */
export function formatLocalTime(localtimeStr) {
  if (!localtimeStr) return '';
  try {
    const parts = localtimeStr.split(' ');
    if (parts.length === 2) {
      const [year, month, day] = parts[0].split('-');
      const [hour, minute] = parts[1].split(':');
      const date = new Date(year, month - 1, day, hour, minute);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    return localtimeStr;
  } catch {
    return localtimeStr;
  }
}
