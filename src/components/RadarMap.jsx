import React, { useEffect, useRef, useState } from 'react';
import { Compass, Layers, Maximize2, Minimize2, Navigation, RefreshCw } from 'lucide-react';
import L from 'leaflet';

export default function RadarMap({ location, current, unit = 'metric' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const radarLayerRef = useRef(null);

  const [showRadar, setShowRadar] = useState(true);
  const [radarTimestamp, setRadarTimestamp] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoadingRadar, setIsLoadingRadar] = useState(false);

  const lat = location?.lat || 51.5074;
  const lon = location?.lon || -0.1278;
  const isMetric = unit === 'metric';
  const tempStr = current ? `${Math.round(isMetric ? current.temp_c : current.temp_f)}°` : '';

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lon],
        zoom: 9,
        zoomControl: false,
        attributionControl: false,
      });

      // CartoDB Dark Matter tile layer (gorgeous sleek dark theme)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Custom marker icon with current weather temperature & pulsing dot
      const customIcon = L.divIcon({
        className: 'custom-weather-marker',
        html: `
          <div style="transform: translate(-50%, -100%);" class="flex flex-col items-center">
            <div class="px-2.5 py-1 bg-slate-900/90 text-white border border-sky-500/50 rounded-lg shadow-xl text-xs font-mono font-bold flex items-center gap-1.5 whitespace-nowrap">
              <span class="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
              <span>${location?.name || 'Target'}: ${tempStr}</span>
            </div>
            <div class="w-2 h-2 bg-sky-400 rotate-45 -mt-1 shadow"></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
      markerRef.current = marker;
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([lat, lon], 9);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
        const customIcon = L.divIcon({
          className: 'custom-weather-marker',
          html: `
            <div style="transform: translate(-50%, -100%);" class="flex flex-col items-center">
              <div class="px-2.5 py-1 bg-slate-900/90 text-white border border-sky-500/50 rounded-lg shadow-xl text-xs font-mono font-bold flex items-center gap-1.5 whitespace-nowrap">
                <span class="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
                <span>${location?.name || 'Target'}: ${tempStr}</span>
              </div>
              <div class="w-2 h-2 bg-sky-400 rotate-45 -mt-1 shadow"></div>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });
        markerRef.current.setIcon(customIcon);
      }
    }

    return () => {
      // Keep map instance or cleanup if component unmounts
    };
  }, [lat, lon, location?.name, tempStr]);

  // Fetch Radar Tiles from RainViewer
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    async function loadRadarTiles() {
      setIsLoadingRadar(true);
      try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const data = await res.json();
        if (data && data.radar && data.radar.past && data.radar.past.length > 0) {
          const latest = data.radar.past[data.radar.past.length - 1];
          const tilePath = `${data.host}${latest.path}/256/{z}/{x}/{y}/2/1_1.png`;

          if (radarLayerRef.current) {
            mapInstanceRef.current.removeLayer(radarLayerRef.current);
          }

          if (showRadar) {
            const radarLayer = L.tileLayer(tilePath, {
              opacity: 0.65,
              zIndex: 10,
            });
            radarLayer.addTo(mapInstanceRef.current);
            radarLayerRef.current = radarLayer;
            setRadarTimestamp(new Date(latest.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          }
        }
      } catch (err) {
        console.error('Failed to load radar overlay:', err);
      } finally {
        setIsLoadingRadar(false);
      }
    }

    loadRadarTiles();
  }, [showRadar]);

  // Toggle Radar Layer visibility
  const toggleRadarLayer = () => {
    if (!mapInstanceRef.current) return;
    if (showRadar) {
      if (radarLayerRef.current) {
        mapInstanceRef.current.removeLayer(radarLayerRef.current);
      }
      setShowRadar(false);
    } else {
      setShowRadar(true);
    }
  };

  const recenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lon], 9, { animate: true });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className={`bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 bg-slate-950 flex flex-col' : 'p-5 sm:p-6'
      }`}>
        
        {/* Map Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-400" />
            <h2 className="text-base sm:text-lg font-bold font-display tracking-tight text-white">
              Interactive Precipitation Radar & Map
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Radar Layer */}
            <button
              onClick={toggleRadarLayer}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                showRadar
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showRadar ? 'Radar Layer: Active' : 'Radar: Off'}</span>
            </button>

            {/* Recenter */}
            <button
              onClick={recenter}
              title="Center on current location"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Navigation className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Map Canvas */}
        <div className="relative mt-3 flex-1">
          <div
            ref={mapContainerRef}
            className={`w-full rounded-xl overflow-hidden border border-slate-800 ${
              isFullscreen ? 'h-full min-h-[500px]' : 'h-80 sm:h-96'
            }`}
          />

          {/* Radar Legend & Status Overlay */}
          <div className="absolute bottom-3 left-3 z-[1000] bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-300 flex items-center gap-3 shadow-lg pointer-events-auto">
            <div>
              <span className="text-slate-400 block font-mono text-[10px]">RADAR OVERLAY</span>
              <span className="font-semibold text-white">
                {showRadar ? `Precipitation · ${radarTimestamp || 'Live'}` : 'Radar disabled'}
              </span>
            </div>
            {showRadar && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">Light</span>
                <div className="w-16 h-2 rounded bg-gradient-to-r from-cyan-400 via-blue-500 to-rose-500" />
                <span className="text-[10px] text-slate-400">Heavy</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
