import { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/shared/DataTable';
import StatusPill from '../components/shared/StatusPill';
import Modal from '../components/shared/Modal';
import { Plus, AlertTriangle, Edit2, Trash2, Shield } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const STATUS_OPTIONS = ['On Duty', 'Off Duty', 'Suspended'];
const REGIONS = ['North', 'South', 'East', 'West'];

const EMPTY_DRIVER = { name: '', license: '', licenseExpiry: '', phone: '', region: 'North', status: 'Off Duty', safetyScore: 80, tripsCompleted: 0, totalTrips: 0 };

function SafetyScoreBar({ score }) {
    const color = score >= 85 ? '#22c55e' : score >= 70 ? '#f59e0b' : '#ef4444';
    return (
        <div className="safety-bar">
            <div className="safety-bar__track">
                <div className="safety-bar__fill" style={{ width: `${score}%`, background: color }} />
            </div>
            <span className="safety-bar__value" style={{ color }}>{score}</span>
        </div>
    );
}

function LicenseStatus({ expiry }) {
    const days = differenceInDays(new Date(expiry), new Date());
    if (days < 0) return <span className="license-expired">⛔ Expired {Math.abs(days)}d ago</span>;
    if (days <= 30) return <span className="license-warning">⚠️ Expires in {days}d</span>;
    return <span className="license-ok">✓ Valid until {expiry}</span>;
}

export default function DriverManagement() {
    const { drivers, trips, dispatch, generateId } = useFleet();
    const { can } = useAuth();
    const [modal, setModal] = useState({ open: false, mode: 'add', driver: { ...EMPTY_DRIVER } });
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [errors, setErrors] = useState({});

    const openAdd = () => setModal({ open: true, mode: 'add', driver: { ...EMPTY_DRIVER } });
    const openEdit = (d) => setModal({ open: true, mode: 'edit', driver: { ...d } });
    const closeModal = () => { setModal(m => ({ ...m, open: false })); setErrors({}); };
    const setField = (key, val) => setModal(m => ({ ...m, driver: { ...m.driver, [key]: val } }));

    const getCompletionRate = (d) => d.totalTrips > 0 ? ((d.tripsCompleted / d.totalTrips) * 100).toFixed(1) : '0.0';

    const validate = (d) => {
        const e = {};
        if (!d.name.trim()) e.name = 'Name required';
        if (!d.license.trim()) e.license = 'License number required';
        if (!d.licenseExpiry) e.licenseExpiry = 'License expiry required';
        if (!d.phone.trim()) e.phone = 'Phone required';
        return e;
    };

    const handleSave = () => {
        const d = modal.driver;
        const e = validate(d);
        if (Object.keys(e).length) { setErrors(e); return; }
        if (modal.mode === 'add') {
            dispatch({ type: 'ADD_DRIVER', payload: { ...d, id: generateId('D'), safetyScore: Number(d.safetyScore) } });
        } else {
            dispatch({ type: 'UPDATE_DRIVER', payload: { ...d, safetyScore: Number(d.safetyScore) } });
        }
        closeModal();
    };

    const handleStatusChange = (id, status) => dispatch({ type: 'SET_DRIVER_STATUS', payload: { id, status } });
    const handleDelete = (id) => { dispatch({ type: 'DELETE_DRIVER', payload: id }); setDeleteConfirm(null); };

    const driverTrips = (driverId) => trips.filter(t => t.driverId === driverId).length;

    const columns = [
        { key: 'id', header: 'ID', accessor: 'id', render: r => <span className="font-mono text-muted">{r.id}</span> },
        {
            key: 'name', header: 'Driver', accessor: 'name',
            render: r => (
                <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted">{r.phone}</div>
                </div>
            )
        },
        { key: 'license', header: 'License No.', accessor: 'license', render: r => <span className="font-mono plate-tag">{r.license}</span> },
        {
            key: 'licenseExpiry', header: 'License Status', accessor: 'licenseExpiry',
            render: r => <LicenseStatus expiry={r.licenseExpiry} />
        },
        { key: 'status', header: 'Status', accessor: 'status', render: r => <StatusPill status={r.status} size="sm" /> },
        { key: 'region', header: 'Region', accessor: 'region' },
        {
            key: 'safetyScore', header: 'Safety Score', accessor: 'safetyScore',
            render: r => <SafetyScoreBar score={r.safetyScore} />
        },
        {
            key: 'completion', header: 'Completion Rate', accessor: 'tripsCompleted',
            render: r => (
                <div>
                    <span className="font-medium">{getCompletionRate(r)}%</span>
                    <span className="text-xs text-muted"> ({r.tripsCompleted}/{r.totalTrips})</span>
                </div>
            )
        },
        { key: 'activeTrips', header: 'Total Trips', sortable: false, render: r => driverTrips(r.id) },
        {
            key: 'actions', header: 'Actions', sortable: false,
            render: r => (
                <div className="action-btns">
                    {can('update') && (
                        <>
                            <button className="icon-btn icon-btn--blue" title="Edit" onClick={e => { e.stopPropagation(); openEdit(r); }}><Edit2 size={14} /></button>
                            <select
                                className="status-select"
                                value={r.status}
                                onChange={e => handleStatusChange(r.id, e.target.value)}
                                onClick={e => e.stopPropagation()}
                            >
                                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </>
                    )}
                    {can('delete') && (
                        <button className="icon-btn icon-btn--red" title="Delete" onClick={e => { e.stopPropagation(); setDeleteConfirm(r); }}><Trash2 size={14} /></button>
                    )}
                </div>
            )
        },
    ];

    const expiredCount = drivers.filter(d => new Date(d.licenseExpiry) < new Date()).length;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Driver Performance & Safety</h2>
                    <p className="page-subtitle">{drivers.length} drivers · {expiredCount > 0 && <span className="text-red">{expiredCount} expired license{expiredCount > 1 ? 's' : ''}</span>}</p>
                </div>
                {can('create') && (
                    <button className="btn btn--primary" onClick={openAdd}><Plus size={16} /> Add Driver</button>
                )}
            </div>

            {expiredCount > 0 && (
                <div className="alert alert--error" style={{ marginBottom: '1rem' }}>
                    <AlertTriangle size={16} />
                    <strong>{expiredCount} driver(s) have expired licenses and cannot be assigned trips.</strong>
                </div>
            )}

            {/* Stats Row */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-card__value">{drivers.filter(d => d.status === 'On Duty').length}</div>
                    <div className="stat-card__label">On Duty</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__value">{drivers.filter(d => d.status === 'Off Duty').length}</div>
                    <div className="stat-card__label">Off Duty</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__value stat-card__value--red">{drivers.filter(d => d.status === 'Suspended').length}</div>
                    <div className="stat-card__label">Suspended</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__value">{Math.round(drivers.reduce((s, d) => s + d.safetyScore, 0) / drivers.length)}</div>
                    <div className="stat-card__label">Avg Safety Score</div>
                </div>
            </div>

            <div className="card">
                <DataTable columns={columns} data={drivers} />
            </div>

            {/* Add/Edit Modal */}
            <Modal isOpen={modal.open} onClose={closeModal} title={modal.mode === 'add' ? 'Add New Driver' : 'Edit Driver'}>
                <div className="form-grid">
                    <div className="form-field">
                        <label className="form-label">Full Name *</label>
                        <input className={`form-input ${errors.name ? 'form-input--error' : ''}`} value={modal.driver.name} onChange={e => setField('name', e.target.value)} placeholder="Driver's full name" />
                        {errors.name && <span className="form-error">{errors.name}</span>}
                    </div>
                    <div className="form-field">
                        <label className="form-label">Phone *</label>
                        <input className={`form-input ${errors.phone ? 'form-input--error' : ''}`} value={modal.driver.phone} onChange={e => setField('phone', e.target.value)} placeholder="+91-XXXXXXXXXX" />
                        {errors.phone && <span className="form-error">{errors.phone}</span>}
                    </div>
                    <div className="form-field">
                        <label className="form-label">License No. *</label>
                        <input className={`form-input ${errors.license ? 'form-input--error' : ''}`} value={modal.driver.license} onChange={e => setField('license', e.target.value.toUpperCase())} placeholder="e.g. MH-012345" />
                        {errors.license && <span className="form-error">{errors.license}</span>}
                    </div>
                    <div className="form-field">
                        <label className="form-label">License Expiry Date *</label>
                        <input className={`form-input ${errors.licenseExpiry ? 'form-input--error' : ''}`} type="date" value={modal.driver.licenseExpiry} onChange={e => setField('licenseExpiry', e.target.value)} />
                        {errors.licenseExpiry && <span className="form-error">{errors.licenseExpiry}</span>}
                    </div>
                    <div className="form-field">
                        <label className="form-label">Region</label>
                        <select className="form-select" value={modal.driver.region} onChange={e => setField('region', e.target.value)}>
                            {REGIONS.map(r => <option key={r}>{r}</option>)}
                        </select>
                    </div>
                    <div className="form-field">
                        <label className="form-label">Status</label>
                        <select className="form-select" value={modal.driver.status} onChange={e => setField('status', e.target.value)}>
                            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="form-field">
                        <label className="form-label">Safety Score (0-100)</label>
                        <input className="form-input" type="number" min="0" max="100" value={modal.driver.safetyScore} onChange={e => setField('safetyScore', e.target.value)} />
                    </div>
                    <div className="form-field">
                        <label className="form-label">Trips Completed</label>
                        <input className="form-input" type="number" min="0" value={modal.driver.tripsCompleted} onChange={e => setField('tripsCompleted', Number(e.target.value))} />
                    </div>
                    <div className="form-field">
                        <label className="form-label">Total Trips Assigned</label>
                        <input className="form-input" type="number" min="0" value={modal.driver.totalTrips} onChange={e => setField('totalTrips', Number(e.target.value))} />
                    </div>
                </div>
                <div className="modal__actions">
                    <button className="btn btn--ghost" onClick={closeModal}>Cancel</button>
                    <button className="btn btn--primary" onClick={handleSave}>{modal.mode === 'add' ? 'Add Driver' : 'Save Changes'}</button>
                </div>
            </Modal>

            {/* Delete Confirm */}
            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Driver" width="400px">
                <p className="text-muted">Delete driver <strong className="text-white">{deleteConfirm?.name}</strong>?</p>
                <div className="modal__actions">
                    <button className="btn btn--ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                    <button className="btn btn--danger" onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
                </div>
            </Modal>
        </div>
    );
}
