import { useFleet } from '../../context/FleetContext';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const VEHICLE_TYPES = ['All', 'Truck', 'Van', 'Bike'];
const REGIONS = ['All', 'North', 'South', 'East', 'West'];

const PAGE_TITLES = {
    '/': 'Command Center',
    '/vehicles': 'Vehicle Registry',
    '/trips': 'Trip Dispatcher',
    '/maintenance': 'Maintenance & Service Logs',
    '/drivers': 'Driver Performance & Safety',
    '/analytics': 'Operational Analytics',
};

export default function TopBar({ pathname }) {
    const { filters, dispatch } = useFleet();
    const { currentUser, users, switchUser } = useAuth();
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const title = PAGE_TITLES[pathname] || 'FleetFlow';

    const handleTypeChange = (e) => dispatch({ type: 'SET_FILTER', payload: { vehicleType: e.target.value } });
    const handleRegionChange = (e) => dispatch({ type: 'SET_FILTER', payload: { region: e.target.value } });

    return (
        <header className="topbar">
            <div className="topbar__left">
                <h1 className="topbar__title">{title}</h1>
            </div>

            <div className="topbar__filters">
                <div className="filter-group">
                    <label className="filter-label">Vehicle Type</label>
                    <select className="filter-select" value={filters.vehicleType} onChange={handleTypeChange}>
                        {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label">Region</label>
                    <select className="filter-select" value={filters.region} onChange={handleRegionChange}>
                        {REGIONS.map(r => <option key={r}>{r}</option>)}
                    </select>
                </div>
            </div>

            <div className="topbar__right">
                <button className="topbar__icon-btn">
                    <Bell size={18} />
                    <span className="topbar__badge">3</span>
                </button>
                <div className="topbar__user" onClick={() => setUserMenuOpen(o => !o)}>
                    <div className="topbar__avatar">{currentUser.avatar}</div>
                    <span className="topbar__username">{currentUser.name}</span>
                    <ChevronDown size={14} />
                    {userMenuOpen && (
                        <div className="user-menu">
                            <div className="user-menu__header">Switch User</div>
                            {users.map(u => (
                                <button
                                    key={u.id}
                                    className={`user-menu__item ${u.id === currentUser.id ? 'active' : ''}`}
                                    onClick={() => { switchUser(u.id); setUserMenuOpen(false); }}
                                >
                                    <span className="user-menu__avatar">{u.avatar}</span>
                                    <div>
                                        <div>{u.name}</div>
                                        <span className={`role-badge role-badge--${u.role.toLowerCase()}`}>{u.role}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
