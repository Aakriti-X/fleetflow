import { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/shared/DataTable';
import StatusPill from '../components/shared/StatusPill';
import Modal from '../components/shared/Modal';
import { Plus, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

const TRIP_STATUSES = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];
const STATUS_FLOW = { Draft: ['Dispatched', 'Cancelled'], Dispatched: ['Completed', 'Cancelled'], Completed: [], Cancelled: [] };

function TripLifecycle({ status }) {
    const steps = ['Draft', 'Dispatched', 'Completed'];
    const cancelled = status === 'Cancelled';
    const currentIdx = steps.indexOf(status);
    return (
        <div className="trip-lifecycle">
            {steps.map((step, i) => (
                <div key={step} className="trip-lifecycle__step-wrapper">
                    <div className={`trip-lifecycle__step ${cancelled ? 'trip-lifecycle__step--cancelled' :
                            i < currentIdx ? 'trip-lifecycle__step--done' :
                                i === currentIdx ? 'trip-lifecycle__step--active' :
                                    'trip-lifecycle__step--pending'
                        }`}>
                        <div className="trip-lifecycle__dot">
                            {i < currentIdx && !cancelled ? <CheckCircle size={12} /> : i + 1}
                        </div>
                        <span className="trip-lifecycle__label">{step}</span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={`trip-lifecycle__connector ${i < currentIdx && !cancelled ? 'trip-lifecycle__connector--done' : ''}`} />
                    )}
                </div>
            ))}
            {cancelled && <div className="trip-lifecycle__cancelled-badge"><StatusPill status="Cancelled" size="sm" /></div>}
        </div>
    );
}

const EMPTY_TRIP = { vehicleId: '', driverId: '', origin: '', destination: '', cargoDescription: '', cargoWeight: '', revenue: '', status: 'Draft' };

export default function TripDispatcher() {
    const { trips, vehicles, drivers, dispatch, generateId, isLicenseExpired, getAvailableVehicles, getAvailableDrivers } = useFleet();
    const { can } = useAuth();
    const [modal, setModal] = useState({ open: false });
    const [form, setForm] = useState({ ...EMPTY_TRIP });
    const [errors, setErrors] = useState({});
    const [statusModal, setStatusModal] = useState(null);

    const availableVehicles = getAvailableVehicles();
    const availableDrivers = getAvailableDrivers();

    const getVehicle = (id) => vehicles.find(v => v.id === id);
    const getDriver = (id) => drivers.find(d => d.id === id);

    const openAdd = () => { setForm({ ...EMPTY_TRIP }); setErrors({}); setModal({ open: true }); };
    const closeModal = () => { setModal({ open: false }); setErrors({}); };

    const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const validate = () => {
        const e = {};
        if (!form.vehicleId) e.vehicleId = 'Select a vehicle';
        if (!form.driverId) e.driverId = 'Select a driver';
        if (!form.origin.trim()) e.origin = 'Origin required';
        if (!form.destination.trim()) e.destination = 'Destination required';
        if (!form.cargoDescription.trim()) e.cargoDescription = 'Cargo description required';
        if (!form.cargoWeight || isNaN(form.cargoWeight) || Number(form.cargoWeight) <= 0) e.cargoWeight = 'Valid cargo weight required';

        // Hard block: cargo > vehicle capacity
        if (form.vehicleId && form.cargoWeight) {
            const vehicle = getVehicle(form.vehicleId);
            if (vehicle && Number(form.cargoWeight) > vehicle.capacity) {
                e.cargoWeight = `⛔ BLOCKED: Cargo (${Number(form.cargoWeight).toLocaleString('en-IN')} kg) exceeds vehicle capacity (${vehicle.capacity.toLocaleString('en-IN')} kg)`;
            }
        }

        // Block: expired license
        if (form.driverId && isLicenseExpired(form.driverId)) {
            e.driverId = `⛔ BLOCKED: Driver license is expired. Cannot assign trip.`;
        }

        return e;
    };

    const handleSave = () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        dispatch({
            type: 'ADD_TRIP',
            payload: {
                ...form,
                id: generateId('T'),
                cargoWeight: Number(form.cargoWeight),
                revenue: Number(form.revenue) || 0,
                startDate: form.status === 'Dispatched' ? new Date().toISOString().split('T')[0] : null,
                endDate: null,
            }
        });
        closeModal();
    };

    const handleStatusChange = (tripId, newStatus) => {
        dispatch({ type: 'UPDATE_TRIP_STATUS', payload: { tripId, status: newStatus } });
        setStatusModal(null);
    };

    const selectedVehicle = form.vehicleId ? getVehicle(form.vehicleId) : null;
    const selectedDriver = form.driverId ? getDriver(form.driverId) : null;
    const licenseExpiredWarning = form.driverId && isLicenseExpired(form.driverId);
    const overweightWarning = selectedVehicle && form.cargoWeight && Number(form.cargoWeight) > selectedVehicle.capacity;

    const columns = [
        { key: 'id', header: 'Trip ID', accessor: 'id', render: r => <span className="font-mono text-muted">{r.id}</span> },
        {
            key: 'vehicle', header: 'Vehicle', accessor: 'vehicleId',
            render: r => { const v = getVehicle(r.vehicleId); return v ? <div><div className="font-medium">{v.name}</div><div className="text-xs text-muted">{v.plate}</div></div> : '—'; }
        },
        {
            key: 'driver', header: 'Driver', accessor: 'driverId',
            render: r => { const d = getDriver(r.driverId); return d ? <div><div className="font-medium">{d.name}</div><div className="text-xs text-muted">{d.license}</div></div> : '—'; }
        },
        { key: 'route', header: 'Route', sortable: false, render: r => <div className="route-cell"><span>{r.origin}</span><ArrowRight size={12} /><span>{r.destination}</span></div> },
        { key: 'cargo', header: 'Cargo', accessor: 'cargoDescription', render: r => <div><div>{r.cargoDescription}</div><div className="text-xs text-muted">{r.cargoWeight?.toLocaleString('en-IN')} kg</div></div> },
        { key: 'status', header: 'Status', accessor: 'status', render: r => <StatusPill status={r.status} size="sm" /> },
        { key: 'lifecycle', header: 'Lifecycle', sortable: false, render: r => <TripLifecycle status={r.status} /> },
        {
            key: 'actions', header: 'Actions', sortable: false,
            render: r => {
                const next = STATUS_FLOW[r.status] || [];
                return (
                    <div className="action-btns">
                        {can('update') && next.map(ns => (
                            <button key={ns} className={`btn btn--xs ${ns === 'Cancelled' ? 'btn--danger' : 'btn--primary'}`} onClick={() => setStatusModal({ trip: r, newStatus: ns })}>
                                → {ns}
                            </button>
                        ))}
                    </div>
                );
            }
        },
    ];

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Trip Dispatcher</h2>
                    <p className="page-subtitle">{trips.length} total trips tracked</p>
                </div>
                {can('create') && (
                    <button className="btn btn--primary" onClick={openAdd}><Plus size={16} /> New Trip</button>
                )}
            </div>

            <div className="card">
                <DataTable columns={columns} data={trips} />
            </div>

            {/* Create Trip Modal */}
            <Modal isOpen={modal.open} onClose={closeModal} title="Create New Trip" width="700px">
                {(overweightWarning || licenseExpiredWarning) && (
                    <div className="alert alert--error">
                        <AlertTriangle size={16} />
                        <div>
                            {overweightWarning && <div>⛔ Cargo weight ({Number(form.cargoWeight).toLocaleString('en-IN')} kg) exceeds vehicle capacity ({selectedVehicle?.capacity.toLocaleString('en-IN')} kg)</div>}
                            {licenseExpiredWarning && <div>⛔ Driver's license expired on {selectedDriver?.licenseExpiry}. Trip cannot be assigned.</div>}
                        </div>
                    </div>
                )}
                <div className="form-grid">
                    <div className="form-field">
                        <label className="form-label">Vehicle *</label>
                        <select className={`form-select ${errors.vehicleId ? 'form-input--error' : ''}`} value={form.vehicleId} onChange={e => setField('vehicleId', e.target.value)}>
                            <option value="">Select available vehicle</option>
                            {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate}) — {v.capacity.toLocaleString('en-IN')} kg</option>)}
                        </select>
                        {errors.vehicleId && <span className="form-error">{errors.vehicleId}</span>}
                        {selectedVehicle && <div className="form-hint">Max capacity: <strong>{selectedVehicle.capacity.toLocaleString('en-IN')} kg</strong></div>}
                    </div>

                    <div className="form-field">
                        <label className="form-label">Driver *</label>
                        <select className={`form-select ${errors.driverId ? 'form-input--error' : ''}`} value={form.driverId} onChange={e => setField('driverId', e.target.value)}>
                            <option value="">Select available driver</option>
                            {availableDrivers.map(d => {
                                const expired = isLicenseExpired(d.id);
                                return <option key={d.id} value={d.id}>{d.name} — {d.status} {expired ? '⚠️ LICENSE EXPIRED' : ''}</option>;
                            })}
                        </select>
                        {errors.driverId && <span className="form-error">{errors.driverId}</span>}
                    </div>

                    <div className="form-field">
                        <label className="form-label">Origin *</label>
                        <input className={`form-input ${errors.origin ? 'form-input--error' : ''}`} value={form.origin} onChange={e => setField('origin', e.target.value)} placeholder="Departure city" />
                        {errors.origin && <span className="form-error">{errors.origin}</span>}
                    </div>
                    <div className="form-field">
                        <label className="form-label">Destination *</label>
                        <input className={`form-input ${errors.destination ? 'form-input--error' : ''}`} value={form.destination} onChange={e => setField('destination', e.target.value)} placeholder="Arrival city" />
                        {errors.destination && <span className="form-error">{errors.destination}</span>}
                    </div>
                    <div className="form-field form-field--full">
                        <label className="form-label">Cargo Description *</label>
                        <input className={`form-input ${errors.cargoDescription ? 'form-input--error' : ''}`} value={form.cargoDescription} onChange={e => setField('cargoDescription', e.target.value)} placeholder="e.g. Electronics, Auto Parts" />
                        {errors.cargoDescription && <span className="form-error">{errors.cargoDescription}</span>}
                    </div>
                    <div className="form-field">
                        <label className="form-label">Cargo Weight (kg) *</label>
                        <input
                            className={`form-input ${errors.cargoWeight || overweightWarning ? 'form-input--error' : ''}`}
                            type="number" value={form.cargoWeight} onChange={e => setField('cargoWeight', e.target.value)} placeholder="Weight in kg"
                        />
                        {errors.cargoWeight && <span className="form-error">{errors.cargoWeight}</span>}
                    </div>
                    <div className="form-field">
                        <label className="form-label">Expected Revenue (₹)</label>
                        <input className="form-input" type="number" value={form.revenue} onChange={e => setField('revenue', e.target.value)} placeholder="Optional" />
                    </div>
                    <div className="form-field">
                        <label className="form-label">Initial Status</label>
                        <select className="form-select" value={form.status} onChange={e => setField('status', e.target.value)}>
                            <option value="Draft">Draft</option>
                            <option value="Dispatched">Dispatched</option>
                        </select>
                    </div>
                </div>
                <div className="modal__actions">
                    <button className="btn btn--ghost" onClick={closeModal}>Cancel</button>
                    <button className={`btn ${overweightWarning || licenseExpiredWarning ? 'btn--disabled' : 'btn--primary'}`} onClick={handleSave} disabled={overweightWarning || licenseExpiredWarning}>
                        Create Trip
                    </button>
                </div>
            </Modal>

            {/* Status change confirm */}
            <Modal isOpen={!!statusModal} onClose={() => setStatusModal(null)} title="Update Trip Status" width="400px">
                {statusModal && (
                    <>
                        <p className="text-muted">Change trip <strong className="text-white">{statusModal.trip.id}</strong> to <StatusPill status={statusModal.newStatus} size="sm" />?</p>
                        <div className="modal__actions">
                            <button className="btn btn--ghost" onClick={() => setStatusModal(null)}>Cancel</button>
                            <button className={`btn ${statusModal.newStatus === 'Cancelled' ? 'btn--danger' : 'btn--primary'}`} onClick={() => handleStatusChange(statusModal.trip.id, statusModal.newStatus)}>
                                Confirm
                            </button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
}
