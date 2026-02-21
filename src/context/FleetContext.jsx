import { createContext, useContext, useReducer } from 'react';
import {
    initialVehicles,
    initialDrivers,
    initialTrips,
    initialMaintenanceLogs,
    initialFuelLogs,
    pendingCargo,
} from '../data/seedData';

const FleetContext = createContext(null);

const initialState = {
    vehicles: initialVehicles,
    drivers: initialDrivers,
    trips: initialTrips,
    maintenanceLogs: initialMaintenanceLogs,
    fuelLogs: initialFuelLogs,
    pendingCargo: pendingCargo,
    filters: { vehicleType: 'All', region: 'All' },
};

function fleetReducer(state, action) {
    switch (action.type) {
        // ─── VEHICLE ACTIONS ─────────────────────────────────────────────
        case 'ADD_VEHICLE':
            return { ...state, vehicles: [...state.vehicles, action.payload] };
        case 'UPDATE_VEHICLE':
            return {
                ...state,
                vehicles: state.vehicles.map(v =>
                    v.id === action.payload.id ? { ...v, ...action.payload } : v
                ),
            };
        case 'DELETE_VEHICLE':
            return { ...state, vehicles: state.vehicles.filter(v => v.id !== action.payload) };
        case 'TOGGLE_VEHICLE_RETIRED':
            return {
                ...state,
                vehicles: state.vehicles.map(v =>
                    v.id === action.payload
                        ? { ...v, status: v.status === 'Retired' ? 'Available' : 'Retired' }
                        : v
                ),
            };
        case 'SET_VEHICLE_STATUS':
            return {
                ...state,
                vehicles: state.vehicles.map(v =>
                    v.id === action.payload.id ? { ...v, status: action.payload.status } : v
                ),
            };

        // ─── DRIVER ACTIONS ──────────────────────────────────────────────
        case 'ADD_DRIVER':
            return { ...state, drivers: [...state.drivers, action.payload] };
        case 'UPDATE_DRIVER':
            return {
                ...state,
                drivers: state.drivers.map(d =>
                    d.id === action.payload.id ? { ...d, ...action.payload } : d
                ),
            };
        case 'DELETE_DRIVER':
            return { ...state, drivers: state.drivers.filter(d => d.id !== action.payload) };
        case 'SET_DRIVER_STATUS':
            return {
                ...state,
                drivers: state.drivers.map(d =>
                    d.id === action.payload.id ? { ...d, status: action.payload.status } : d
                ),
            };

        // ─── TRIP ACTIONS ────────────────────────────────────────────────
        case 'ADD_TRIP': {
            const trip = action.payload;
            return {
                ...state,
                trips: [...state.trips, trip],
                // Mark vehicle and driver as busy if dispatched
                vehicles: state.vehicles.map(v =>
                    v.id === trip.vehicleId && trip.status === 'Dispatched'
                        ? { ...v, status: 'On Trip' }
                        : v
                ),
                drivers: state.drivers.map(d =>
                    d.id === trip.driverId && trip.status === 'Dispatched'
                        ? { ...d, status: 'On Duty' }
                        : d
                ),
            };
        }
        case 'UPDATE_TRIP_STATUS': {
            const { tripId, status } = action.payload;
            const trip = state.trips.find(t => t.id === tripId);
            if (!trip) return state;

            let vehicleUpdate = {};
            let driverUpdate = {};

            if (status === 'Dispatched') {
                vehicleUpdate = { status: 'On Trip' };
                driverUpdate = { status: 'On Duty' };
            } else if (status === 'Completed' || status === 'Cancelled') {
                vehicleUpdate = { status: 'Available' };
                driverUpdate = { status: 'Off Duty' };
            }

            return {
                ...state,
                trips: state.trips.map(t =>
                    t.id === tripId
                        ? { ...t, status, endDate: (status === 'Completed' || status === 'Cancelled') ? new Date().toISOString().split('T')[0] : t.endDate }
                        : t
                ),
                vehicles: state.vehicles.map(v =>
                    v.id === trip.vehicleId && Object.keys(vehicleUpdate).length
                        ? { ...v, ...vehicleUpdate }
                        : v
                ),
                drivers: state.drivers.map(d =>
                    d.id === trip.driverId && Object.keys(driverUpdate).length
                        ? { ...d, ...driverUpdate }
                        : d
                ),
            };
        }

        // ─── MAINTENANCE ACTIONS ─────────────────────────────────────────
        case 'ADD_MAINTENANCE_LOG': {
            const log = action.payload;
            return {
                ...state,
                maintenanceLogs: [...state.maintenanceLogs, log],
                // Auto-switch vehicle to In Shop
                vehicles: state.vehicles.map(v =>
                    v.id === log.vehicleId ? { ...v, status: 'In Shop' } : v
                ),
            };
        }
        case 'UPDATE_MAINTENANCE_LOG': {
            const updated = action.payload;
            const newLogs = state.maintenanceLogs.map(m =>
                m.id === updated.id ? { ...m, ...updated } : m
            );
            // If resolved, check if vehicle still has open logs
            let vehicles = state.vehicles;
            if (updated.status === 'Completed') {
                const stillInShop = newLogs.some(
                    m => m.vehicleId === updated.vehicleId && m.status === 'In Progress'
                );
                if (!stillInShop) {
                    vehicles = state.vehicles.map(v =>
                        v.id === updated.vehicleId ? { ...v, status: 'Available' } : v
                    );
                }
            }
            return { ...state, maintenanceLogs: newLogs, vehicles };
        }
        case 'DELETE_MAINTENANCE_LOG':
            return {
                ...state,
                maintenanceLogs: state.maintenanceLogs.filter(m => m.id !== action.payload),
            };

        // ─── FUEL ACTIONS ────────────────────────────────────────────────
        case 'ADD_FUEL_LOG':
            return { ...state, fuelLogs: [...state.fuelLogs, action.payload] };
        case 'DELETE_FUEL_LOG':
            return { ...state, fuelLogs: state.fuelLogs.filter(f => f.id !== action.payload) };

        // ─── FILTERS ─────────────────────────────────────────────────────
        case 'SET_FILTER':
            return { ...state, filters: { ...state.filters, ...action.payload } };

        default:
            return state;
    }
}

export function FleetProvider({ children }) {
    const [state, dispatch] = useReducer(fleetReducer, initialState);

    // ─── Computed Selectors ───────────────────────────────────────────
    const getFilteredVehicles = () => {
        const { vehicleType, region } = state.filters;
        return state.vehicles.filter(v => {
            const typeMatch = vehicleType === 'All' || v.type === vehicleType;
            const regionMatch = region === 'All' || v.region === region;
            return typeMatch && regionMatch;
        });
    };

    const getAvailableVehicles = () =>
        state.vehicles.filter(v => v.status === 'Available');

    const getAvailableDrivers = () =>
        state.drivers.filter(d => d.status === 'On Duty' || d.status === 'Off Duty');

    const getVehicleCosts = (vehicleId) => {
        const fuel = state.fuelLogs
            .filter(f => f.vehicleId === vehicleId)
            .reduce((sum, f) => sum + f.totalCost, 0);
        const maintenance = state.maintenanceLogs
            .filter(m => m.vehicleId === vehicleId)
            .reduce((sum, m) => sum + m.cost, 0);
        return { fuel, maintenance, total: fuel + maintenance };
    };

    const getVehicleRevenue = (vehicleId) =>
        state.trips
            .filter(t => t.vehicleId === vehicleId && t.status === 'Completed')
            .reduce((sum, t) => sum + (t.revenue || 0), 0);

    const getVehicleROI = (vehicleId) => {
        const revenue = getVehicleRevenue(vehicleId);
        const { total: cost } = getVehicleCosts(vehicleId);
        if (cost === 0) return 0;
        return ((revenue - cost) / cost) * 100;
    };

    const isLicenseExpired = (driverId) => {
        const driver = state.drivers.find(d => d.id === driverId);
        if (!driver) return false;
        return new Date(driver.licenseExpiry) < new Date();
    };

    const getKPIs = () => {
        const active = state.vehicles.filter(v => v.status === 'On Trip').length;
        const inShop = state.vehicles.filter(v => v.status === 'In Shop').length;
        const total = state.vehicles.filter(v => v.status !== 'Retired').length;
        const available = state.vehicles.filter(v => v.status === 'Available').length;
        const utilization = total > 0 ? Math.round(((total - available) / total) * 100) : 0;
        return { active, inShop, utilization, total, available };
    };

    const generateId = (prefix) => {
        const max = Math.max(
            0,
            ...{
                'V': state.vehicles,
                'D': state.drivers,
                'T': state.trips,
                'M': state.maintenanceLogs,
                'F': state.fuelLogs,
            }[prefix]?.map(item => parseInt(item.id.slice(1))) || [0]
        );
        return `${prefix}${String(max + 1).padStart(3, '0')}`;
    };

    return (
        <FleetContext.Provider
            value={{
                ...state,
                dispatch,
                getFilteredVehicles,
                getAvailableVehicles,
                getAvailableDrivers,
                getVehicleCosts,
                getVehicleRevenue,
                getVehicleROI,
                isLicenseExpired,
                getKPIs,
                generateId,
            }}
        >
            {children}
        </FleetContext.Provider>
    );
}

export function useFleet() {
    return useContext(FleetContext);
}
