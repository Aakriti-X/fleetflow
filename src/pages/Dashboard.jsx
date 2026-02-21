import { useFleet } from '../context/FleetContext';
import StatusPill from '../components/shared/StatusPill';
import { Truck, Wrench, TrendingUp, Package, AlertCircle } from 'lucide-react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const PRIORITY_ORDER = { Urgent: 0, High: 1, Normal: 2 };

const CHART_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#64748b'];

function KPICard({ icon: Icon, title, value, subtitle, color, trend }) {
    return (
        <div className={`kpi-card kpi-card--${color}`}>
            <div className="kpi-card__icon">
                <Icon size={22} />
            </div>
            <div className="kpi-card__body">
                <div className="kpi-card__value">{value}</div>
                <div className="kpi-card__title">{title}</div>
                {subtitle && <div className="kpi-card__subtitle">{subtitle}</div>}
            </div>
            {trend !== undefined && (
                <div className={`kpi-card__trend ${trend >= 0 ? 'kpi-card__trend--up' : 'kpi-card__trend--down'}`}>
                    {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
                </div>
            )}
        </div>
    );
}

export default function Dashboard() {
    const { vehicles, pendingCargo, trips, getKPIs, getFilteredVehicles } = useFleet();
    const kpis = getKPIs();
    const filtered = getFilteredVehicles();

    // Status distribution for pie chart
    const statusCounts = ['Available', 'On Trip', 'In Shop', 'Retired'].map(s => ({
        name: s,
        value: vehicles.filter(v => v.status === s).length,
    }));

    // Trip status distribution for bar chart
    const tripStatusCounts = ['Draft', 'Dispatched', 'Completed', 'Cancelled'].map(s => ({
        name: s,
        count: trips.filter(t => t.status === s).length,
    }));

    const sortedCargo = [...pendingCargo].sort(
        (a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
    );

    return (
        <div className="page">
            {/* KPI Cards */}
            <div className="kpi-grid">
                <KPICard
                    icon={Truck}
                    title="Active Fleet"
                    value={kpis.active}
                    subtitle="Vehicles on trip"
                    color="blue"
                    trend={12}
                />
                <KPICard
                    icon={Wrench}
                    title="Maintenance Alerts"
                    value={kpis.inShop}
                    subtitle="Vehicles in shop"
                    color="amber"
                    trend={-5}
                />
                <KPICard
                    icon={TrendingUp}
                    title="Utilization Rate"
                    value={`${kpis.utilization}%`}
                    subtitle={`${kpis.total - kpis.available} of ${kpis.total} assigned`}
                    color="emerald"
                    trend={8}
                />
                <KPICard
                    icon={Package}
                    title="Pending Cargo"
                    value={pendingCargo.length}
                    subtitle="Awaiting assignment"
                    color="purple"
                />
            </div>

            <div className="dashboard-grid">
                {/* Fleet Status Chart */}
                <div className="card">
                    <div className="card__header">
                        <h3 className="card__title">Fleet Status Distribution</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                                {statusCounts.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9', borderRadius: '8px' }} />
                            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Trip Overview Chart */}
                <div className="card">
                    <div className="card__header">
                        <h3 className="card__title">Trip Status Overview</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={tripStatusCounts} barSize={28}>
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9', borderRadius: '8px' }} />
                            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pending Cargo */}
                <div className="card card--full">
                    <div className="card__header">
                        <h3 className="card__title">Pending Cargo Assignments</h3>
                        <AlertCircle size={16} className="text-amber" />
                    </div>
                    <div className="cargo-list">
                        {sortedCargo.map(cargo => (
                            <div key={cargo.id} className="cargo-item">
                                <div className="cargo-item__left">
                                    <Package size={16} className="cargo-item__icon" />
                                    <div>
                                        <div className="cargo-item__desc">{cargo.description}</div>
                                        <div className="cargo-item__route">{cargo.origin} → {cargo.destination}</div>
                                    </div>
                                </div>
                                <div className="cargo-item__right">
                                    <span className="cargo-item__weight">{cargo.weight.toLocaleString('en-IN')} kg</span>
                                    <StatusPill status={cargo.priority} size="sm" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Fleet Table (filtered) */}
                <div className="card card--full">
                    <div className="card__header">
                        <h3 className="card__title">Fleet Overview (Filtered)</h3>
                        <span className="card__badge">{filtered.length} vehicles</span>
                    </div>
                    <div className="data-table__scroll">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th className="data-table__th">ID</th>
                                    <th className="data-table__th">Vehicle</th>
                                    <th className="data-table__th">Type</th>
                                    <th className="data-table__th">Plate</th>
                                    <th className="data-table__th">Status</th>
                                    <th className="data-table__th">Region</th>
                                    <th className="data-table__th">Capacity</th>
                                    <th className="data-table__th">Odometer</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(v => (
                                    <tr key={v.id} className="data-table__row">
                                        <td className="data-table__td text-muted">{v.id}</td>
                                        <td className="data-table__td font-medium">{v.name}</td>
                                        <td className="data-table__td">{v.type}</td>
                                        <td className="data-table__td font-mono">{v.plate}</td>
                                        <td className="data-table__td"><StatusPill status={v.status} size="sm" /></td>
                                        <td className="data-table__td">{v.region}</td>
                                        <td className="data-table__td">{v.capacity.toLocaleString('en-IN')} kg</td>
                                        <td className="data-table__td">{v.odometer.toLocaleString('en-IN')} km</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
