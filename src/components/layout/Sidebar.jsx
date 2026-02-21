import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Truck, Route, Wrench, Users, BarChart3,
    Map, ChevronLeft, ChevronRight, Zap, LogOut
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Command Center' },
    { path: '/map', icon: Map, label: 'Fleet Map' },
    { path: '/vehicles', icon: Truck, label: 'Vehicle Registry' },
    { path: '/trips', icon: Route, label: 'Trip Dispatcher' },
    { path: '/maintenance', icon: Wrench, label: 'Maintenance Logs' },
    { path: '/drivers', icon: Users, label: 'Driver Performance' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function Sidebar() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
            <div className="sidebar__brand">
                <div className="sidebar__logo"><Zap size={20} /></div>
                {!collapsed && <span className="sidebar__brand-name">FleetFlow</span>}
            </div>

            <nav className="sidebar__nav">
                {navItems.map(({ path, icon: Icon, label }) => (
                    <NavLink
                        key={path}
                        to={path}
                        end={path === '/'}
                        className={({ isActive }) =>
                            `sidebar__item ${isActive ? 'sidebar__item--active' : ''}`
                        }
                        title={collapsed ? label : ''}
                    >
                        <Icon size={18} className="sidebar__icon" />
                        {!collapsed && <span className="sidebar__label">{label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar__footer">
                {!collapsed && currentUser && (
                    <div className="sidebar__user">
                        <div className="sidebar__avatar">{currentUser.avatar}</div>
                        <div className="sidebar__user-info">
                            <span className="sidebar__user-name">{currentUser.name}</span>
                            <span className={`role-badge role-badge--${currentUser.role.toLowerCase()}`}>
                                {currentUser.role}
                            </span>
                        </div>
                    </div>
                )}
                <div className="sidebar__footer-btns">
                    <button className="sidebar__collapse-btn" title="Logout" onClick={handleLogout}>
                        <LogOut size={15} />
                    </button>
                    <button className="sidebar__collapse-btn" onClick={() => setCollapsed(c => !c)}>
                        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>
            </div>
        </aside>
    );
}
