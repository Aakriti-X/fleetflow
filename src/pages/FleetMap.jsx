import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useFleet } from '../context/FleetContext';
import StatusPill from '../components/shared/StatusPill';
import { Navigation, RefreshCw, MapPin, Layers } from 'lucide-react';

// Fix leaflet default icon broken by bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Status → map pin color
const STATUS_COLORS = {
    'Available': '#22c55e',
    'On Trip': '#3b82f6',
    'In Shop': '#f59e0b',
    'Retired': '#64748b',
};

// Simulated geo-coordinates seeded per vehicle (Indian cities)
const VEHICLE_COORDS = {
    V001: { lat: 28.6139, lng: 77.2090, city: 'New Delhi', route: [[28.61, 77.21], [28.70, 77.10], [28.80, 77.05]] },
    V002: { lat: 19.0760, lng: 72.8777, city: 'Mumbai', route: [[19.07, 72.87], [19.20, 72.90], [23.25, 77.41]] },
    V003: { lat: 12.9716, lng: 77.5946, city: 'Bengaluru', route: null },
    V004: { lat: 23.0225, lng: 72.5714, city: 'Ahmedabad', route: [[23.02, 72.57], [22.30, 73.20]] },
    V005: { lat: 18.5204, lng: 73.8567, city: 'Pune', route: [[18.52, 73.85], [19.99, 73.78]] },
    V006: { lat: 13.0827, lng: 80.2707, city: 'Chennai', route: null },
    V007: { lat: 28.7041, lng: 77.1025, city: 'Gurgaon', route: [[28.70, 77.10], [28.45, 77.03]] },
    V008: { lat: 26.8467, lng: 80.9462, city: 'Lucknow', route: [[26.84, 80.94], [26.45, 80.33]] },
};

// Custom SVG icon factory
function makeVehicleIcon(color, type, isSelected) {
    const size = isSelected ? 38 : 30;
    const emoji = type === 'Truck' ? '🚛' : type === 'Van' ? '🚐' : '🏍️';
    const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="${color}" opacity="0.2" />
      <circle cx="20" cy="20" r="13" fill="${color}" opacity="${isSelected ? 1 : 0.85}" />
      ${isSelected ? `<circle cx="20" cy="20" r="18" fill="none" stroke="${color}" stroke-width="2.5" opacity="0.6" />` : ''}
      <text x="20" y="25" font-size="13" text-anchor="middle">${emoji}</text>
    </svg>`;
    return L.divIcon({
        html: svg,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -(size / 2 + 4)],
    });
}

// Pulsing dot for "On Trip" vehicles
function PulsingDot({ position, color }) {
    return (
        <CircleMarker
            center={position}
            radius={10}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.25, weight: 1.5 }}
        />
    );
}

function FlyToVehicle({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords) map.flyTo([coords.lat, coords.lng], 11, { duration: 1.2 });
    }, [coords, map]);
    return null;
}

const TILE_LAYERS = {
    dark: { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', label: 'Dark' },
    satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', label: 'Satellite' },
    streets: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', label: 'Streets' },
};

export default function FleetMap() {
    const { vehicles, trips, drivers } = useFleet();
    const [selected, setSelected] = useState(null);
    const [tileKey, setTileKey] = useState('dark');
    const [refreshKey, setRefreshKey] = useState(0);
    const [showRoutes, setShowRoutes] = useState(true);

    const vehiclesWithCoords = vehicles.map(v => ({
        ...v,
        geo: VEHICLE_COORDS[v.id] || { lat: 20.5937, lng: 78.9629, city: 'India' },
    }));

    const activeDriver = (vehicleId) => {
        const trip = trips.find(t => t.vehicleId === vehicleId && (t.status === 'On Trip' || t.status === 'Dispatched'));
        if (!trip) return null;
        return drivers.find(d => d.id === trip.driverId);
    };

    const statusCounts = ['Available', 'On Trip', 'In Shop', 'Retired'].map(s => ({
        label: s,
        count: vehicles.filter(v => v.status === s).length,
        color: STATUS_COLORS[s],
    }));

    const selectedVehicle = selected ? vehiclesWithCoords.find(v => v.id === selected) : null;

    return (
        <div className="page">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h2 className="page-title">Live Fleet Map</h2>
                    <p className="page-subtitle">Real-time vehicle positions across India</p>
                </div>
                <div className="action-btns">
                    {/* Tile switcher */}
                    {Object.entries(TILE_LAYERS).map(([key, { label }]) => (
                        <button
                            key={key}
                            className={`btn btn--xs ${tileKey === key ? 'btn--primary' : 'btn--ghost'}`}
                            onClick={() => setTileKey(key)}
                        >
                            <Layers size={11} /> {label}
                        </button>
                    ))}
                    <button className="btn btn--ghost btn--xs" onClick={() => setRefreshKey(k => k + 1)}>
                        <RefreshCw size={12} /> Refresh
                    </button>
                </div>
            </div>

            {/* Status legend row */}
            <div className="map-legend">
                {statusCounts.map(s => (
                    <div key={s.label} className="map-legend__item">
                        <span className="map-legend__dot" style={{ background: s.color }} />
                        <span className="map-legend__label">{s.label}</span>
                        <span className="map-legend__count" style={{ color: s.color }}>{s.count}</span>
                    </div>
                ))}
                <button
                    className={`btn btn--xs ${showRoutes ? 'btn--primary' : 'btn--ghost'} map-legend__route-toggle`}
                    onClick={() => setShowRoutes(v => !v)}
                >
                    <Navigation size={11} /> {showRoutes ? 'Hide' : 'Show'} Routes
                </button>
            </div>

            <div className="map-layout">
                {/* Sidebar vehicle list */}
                <div className="map-vehicle-list">
                    <div className="map-vehicle-list__header">
                        <MapPin size={13} />
                        <span>Fleet ({vehicles.length})</span>
                    </div>
                    {vehiclesWithCoords.map(v => (
                        <button
                            key={v.id}
                            className={`map-vehicle-item ${selected === v.id ? 'map-vehicle-item--active' : ''}`}
                            onClick={() => setSelected(v.id === selected ? null : v.id)}
                        >
                            <div className="map-vehicle-item__dot" style={{ background: STATUS_COLORS[v.status] }} />
                            <div className="map-vehicle-item__info">
                                <div className="map-vehicle-item__name">{v.name}</div>
                                <div className="map-vehicle-item__loc">{v.geo.city} · {v.type}</div>
                            </div>
                            <StatusPill status={v.status} size="sm" />
                        </button>
                    ))}
                </div>

                {/* Map */}
                <div className="map-container">
                    <MapContainer
                        key={refreshKey}
                        center={[20.5937, 78.9629]}
                        zoom={5}
                        style={{ width: '100%', height: '100%' }}
                        zoomControl={true}
                    >
                        <TileLayer
                            key={tileKey}
                            url={TILE_LAYERS[tileKey].url}
                            attribution='&copy; <a href="https://carto.com">CARTO</a>'
                        />

                        {selectedVehicle && (
                            <FlyToVehicle coords={selectedVehicle.geo} />
                        )}

                        {vehiclesWithCoords.map(v => {
                            const color = STATUS_COLORS[v.status] || '#94a3b8';
                            const pos = [v.geo.lat, v.geo.lng];
                            const icon = makeVehicleIcon(color, v.type, selected === v.id);
                            const driver = activeDriver(v.id);

                            return (
                                <div key={v.id}>
                                    {/* Pulsing ring for On Trip */}
                                    {v.status === 'On Trip' && (
                                        <PulsingDot position={pos} color={color} />
                                    )}

                                    {/* Route line */}
                                    {showRoutes && v.geo.route && (
                                        <Polyline
                                            positions={v.geo.route}
                                            pathOptions={{ color, weight: 2, opacity: 0.5, dashArray: '6 4' }}
                                        />
                                    )}

                                    <Marker
                                        position={pos}
                                        icon={icon}
                                        eventHandlers={{ click: () => setSelected(v.id === selected ? null : v.id) }}
                                    >
                                        <Popup className="map-popup">
                                            <div className="map-popup__content">
                                                <div className="map-popup__header">
                                                    <strong>{v.name}</strong>
                                                    <StatusPill status={v.status} size="sm" />
                                                </div>
                                                <div className="map-popup__rows">
                                                    <div className="map-popup__row"><span>Plate</span><strong>{v.plate}</strong></div>
                                                    <div className="map-popup__row"><span>Type</span><strong>{v.type}</strong></div>
                                                    <div className="map-popup__row"><span>Location</span><strong>{v.geo.city}</strong></div>
                                                    <div className="map-popup__row"><span>Capacity</span><strong>{v.capacity.toLocaleString('en-IN')} kg</strong></div>
                                                    <div className="map-popup__row"><span>Odometer</span><strong>{v.odometer.toLocaleString('en-IN')} km</strong></div>
                                                    {driver && (
                                                        <div className="map-popup__row"><span>Driver</span><strong>{driver.name}</strong></div>
                                                    )}
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                </div>
                            );
                        })}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}
