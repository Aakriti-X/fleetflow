import { useFleet } from '../context/FleetContext';
import DataTable from '../components/shared/DataTable';
import StatusPill from '../components/shared/StatusPill';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
    LineChart, Line, CartesianGrid
} from 'recharts';
import { Download, FileText, TrendingUp, TrendingDown } from 'lucide-react';

const TOOLTIP_STYLE = { background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9', borderRadius: '8px' };

export default function Analytics() {
    const { vehicles, trips, getVehicleCosts, getVehicleRevenue, getVehicleROI, fuelLogs, maintenanceLogs } = useFleet();

    // Build per-vehicle analytics
    const vehicleData = vehicles
        .filter(v => v.status !== 'Retired')
        .map(v => {
            const { fuel, maintenance, total } = getVehicleCosts(v.id);
            const revenue = getVehicleRevenue(v.id);
            const roi = getVehicleROI(v.id);
            const tripsCompleted = trips.filter(t => t.vehicleId === v.id && t.status === 'Completed').length;
            return { ...v, fuelCost: fuel, maintenanceCost: maintenance, totalCost: total, revenue, roi, tripsCompleted };
        });

    // Summary metrics
    const totalRevenue = vehicleData.reduce((s, v) => s + v.revenue, 0);
    const totalCost = vehicleData.reduce((s, v) => s + v.totalCost, 0);
    const totalFuel = vehicleData.reduce((s, v) => s + v.fuelCost, 0);
    const totalMaintenance = vehicleData.reduce((s, v) => s + v.maintenanceCost, 0);
    const overallROI = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost * 100) : 0;

    // Chart data
    const costChartData = vehicleData.map(v => ({
        name: v.name.split(' ').slice(0, 2).join(' '),
        Fuel: Math.round(v.fuelCost),
        Maintenance: Math.round(v.maintenanceCost),
    }));

    const roiChartData = vehicleData.map(v => ({
        name: v.name.split(' ').slice(0, 2).join(' '),
        ROI: parseFloat(v.roi.toFixed(1)),
    }));

    // Export handlers
    const handleExportCSV = () => {
        exportToCSV('fleetflow_analytics',
            ['Vehicle ID', 'Name', 'Type', 'Region', 'Trips', 'Revenue (₹)', 'Fuel Cost (₹)', 'Maintenance Cost (₹)', 'Total Cost (₹)', 'ROI (%)'],
            vehicleData.map(v => [v.id, v.name, v.type, v.region, v.tripsCompleted, v.revenue, Math.round(v.fuelCost), Math.round(v.maintenanceCost), Math.round(v.totalCost), v.roi.toFixed(1)])
        );
    };

    const handleExportPDF = () => {
        exportToPDF('fleetflow_analytics', 'Operational Analytics Report',
            ['Vehicle ID', 'Name', 'Type', 'Trips', 'Revenue (₹)', 'Total Cost (₹)', 'ROI (%)'],
            vehicleData.map(v => [v.id, v.name, v.type, v.tripsCompleted, `₹${v.revenue.toLocaleString('en-IN')}`, `₹${Math.round(v.totalCost).toLocaleString('en-IN')}`, `${v.roi.toFixed(1)}%`])
        );
    };

    const columns = [
        { key: 'id', header: 'Vehicle ID', accessor: 'id', render: r => <span className="font-mono text-muted">{r.id}</span> },
        {
            key: 'vehicle', header: 'Vehicle', accessor: 'name',
            render: r => <div><div className="font-medium">{r.name}</div><div className="text-xs text-muted">{r.plate}</div></div>
        },
        { key: 'type', header: 'Type', accessor: 'type' },
        { key: 'status', header: 'Status', accessor: 'status', render: r => <StatusPill status={r.status} size="sm" /> },
        { key: 'trips', header: 'Trips', accessor: 'tripsCompleted' },
        { key: 'revenue', header: 'Revenue (₹)', accessor: 'revenue', render: r => <span className="font-medium text-emerald">₹{r.revenue.toLocaleString('en-IN')}</span> },
        { key: 'fuel', header: 'Fuel Cost (₹)', accessor: 'fuelCost', render: r => `₹${Math.round(r.fuelCost).toLocaleString('en-IN')}` },
        { key: 'maintenance', header: 'Maint. Cost (₹)', accessor: 'maintenanceCost', render: r => `₹${Math.round(r.maintenanceCost).toLocaleString('en-IN')}` },
        { key: 'total', header: 'Total Cost (₹)', accessor: 'totalCost', render: r => <span className="font-medium text-red">₹{Math.round(r.totalCost).toLocaleString('en-IN')}</span> },
        {
            key: 'roi', header: 'ROI %', accessor: 'roi',
            render: r => (
                <span className={`roi-value ${r.roi >= 0 ? 'roi-value--positive' : 'roi-value--negative'}`}>
                    {r.roi >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {r.roi.toFixed(1)}%
                </span>
            )
        },
    ];

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Operational Analytics</h2>
                    <p className="page-subtitle">Cost analysis, ROI, and performance insights</p>
                </div>
                <div className="action-btns">
                    <button className="btn btn--ghost" onClick={handleExportCSV}><Download size={15} /> Export CSV</button>
                    <button className="btn btn--ghost" onClick={handleExportPDF}><FileText size={15} /> Export PDF</button>
                </div>
            </div>

            {/* Summary KPIs */}
            <div className="analytics-kpis">
                <div className="analytics-kpi">
                    <div className="analytics-kpi__label">Total Revenue</div>
                    <div className="analytics-kpi__value text-emerald">₹{totalRevenue.toLocaleString('en-IN')}</div>
                </div>
                <div className="analytics-kpi">
                    <div className="analytics-kpi__label">Total Fuel Cost</div>
                    <div className="analytics-kpi__value">₹{Math.round(totalFuel).toLocaleString('en-IN')}</div>
                </div>
                <div className="analytics-kpi">
                    <div className="analytics-kpi__label">Total Maintenance</div>
                    <div className="analytics-kpi__value">₹{Math.round(totalMaintenance).toLocaleString('en-IN')}</div>
                </div>
                <div className="analytics-kpi">
                    <div className="analytics-kpi__label">Total Operational Cost</div>
                    <div className="analytics-kpi__value text-red">₹{Math.round(totalCost).toLocaleString('en-IN')}</div>
                </div>
                <div className="analytics-kpi analytics-kpi--highlight">
                    <div className="analytics-kpi__label">Overall Fleet ROI</div>
                    <div className={`analytics-kpi__value ${overallROI >= 0 ? 'text-emerald' : 'text-red'}`}>
                        {overallROI.toFixed(1)}%
                    </div>
                    <div className="analytics-kpi__formula">= (Revenue − Cost) / Cost × 100</div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                <div className="card">
                    <div className="card__header">
                        <h3 className="card__title">Operational Cost by Vehicle (₹)</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={costChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
                            <Bar dataKey="Fuel" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Maintenance" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <div className="card__header">
                        <h3 className="card__title">Vehicle ROI (%)</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={roiChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => `${v}%`} />
                            <Bar
                                dataKey="ROI"
                                radius={[4, 4, 0, 0]}
                                fill="#22c55e"
                                label={{ position: 'top', fill: '#94a3b8', fontSize: 10, formatter: v => `${v}%` }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="card">
                <div className="card__header">
                    <h3 className="card__title">Per-Vehicle Cost & ROI Breakdown</h3>
                    <div className="action-btns">
                        <button className="btn btn--xs btn--ghost" onClick={handleExportCSV}><Download size={12} /> CSV</button>
                        <button className="btn btn--xs btn--ghost" onClick={handleExportPDF}><FileText size={12} /> PDF</button>
                    </div>
                </div>
                <DataTable columns={columns} data={vehicleData} searchable={false} />
            </div>
        </div>
    );
}
