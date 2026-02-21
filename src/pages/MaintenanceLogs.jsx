import { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/shared/DataTable';
import StatusPill from '../components/shared/StatusPill';
import Modal from '../components/shared/Modal';
import { Plus, Wrench, CheckCircle, Trash2 } from 'lucide-react';

const SERVICE_TYPES = ['Oil Change', 'Brake Service', 'Tyre Replacement', 'Engine Overhaul', 'AC Service', 'Body Repair', 'Electrical', 'Scheduled Service', 'Other'];

const EMPTY_LOG = { vehicleId: '', date: new Date().toISOString().split('T')[0], serviceType: 'Oil Change', description: '', cost: '', technician: '', status: 'In Progress' };

export default function MaintenanceLogs() {
    const { maintenanceLogs, vehicles, dispatch, generateId } = useFleet();
    const { can } = useAuth();
    const [modal, setModal] = useState({ open: false });
    const [form, setForm] = useState({ ...EMPTY_LOG });
    const [errors, setErrors] = useState({});
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const getVehicle = (id) => vehicles.find(v => v.id === id);
    const openAdd = () => { setForm({ ...EMPTY_LOG }); setErrors({}); setModal({ open: true }); };
    const closeModal = () => { setModal({ open: false }); setErrors({}); };
    const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const validate = () => {
        const e = {};
        if (!form.vehicleId) e.vehicleId = 'Select a vehicle';
        if (!form.date) e.date = 'Date required';
        if (!form.description.trim()) e.description = 'Description required';
        if (!form.cost || isNaN(form.cost) || Number(form.cost) < 0) e.cost = 'Valid cost required';
        return e;
    };

    const handleSave = () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        dispatch({
            type: 'ADD_MAINTENANCE_LOG',
            payload: { ...form, id: generateId('M'), cost: Number(form.cost) }
        });
        closeModal();
    };

    const handleResolve = (log) => {
        dispatch({ type: 'UPDATE_MAINTENANCE_LOG', payload: { ...log, status: 'Completed' } });
    };

    const handleDelete = (id) => {
        dispatch({ type: 'DELETE_MAINTENANCE_LOG', payload: id });
        setDeleteConfirm(null);
    };

    const columns = [
        { key: 'id', header: 'Log ID', accessor: 'id', render: r => <span className="font-mono text-muted">{r.id}</span> },
        {
            key: 'vehicle', header: 'Vehicle', accessor: 'vehicleId',
            render: r => {
                const v = getVehicle(r.vehicleId);
                return v ? <div><div className="font-medium">{v.name}</div><div className="text-xs text-muted">{v.plate}</div></div> : '—';
            }
        },
        { key: 'date', header: 'Date', accessor: 'date' },
        { key: 'serviceType', header: 'Service Type', accessor: 'serviceType', render: r => <span className="service-tag"><Wrench size={12} /> {r.serviceType}</span> },
        { key: 'description', header: 'Description', accessor: 'description' },
        { key: 'technician', header: 'Technician', accessor: 'technician', render: r => r.technician || '—' },
        { key: 'cost', header: 'Cost (₹)', accessor: 'cost', render: r => <span className="font-medium">₹{r.cost.toLocaleString('en-IN')}</span> },
        { key: 'status', header: 'Status', accessor: 'status', render: r => <StatusPill status={r.status} size="sm" /> },
        {
            key: 'actions', header: 'Actions', sortable: false,
            render: r => (
                <div className="action-btns">
                    {can('update') && r.status === 'In Progress' && (
                        <button className="icon-btn icon-btn--emerald" title="Mark Resolved" onClick={() => handleResolve(r)}>
                            <CheckCircle size={14} />
                        </button>
                    )}
                    {can('delete') && (
                        <button className="icon-btn icon-btn--red" title="Delete" onClick={() => setDeleteConfirm(r)}>
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            )
        },
    ];

    const inProgress = maintenanceLogs.filter(m => m.status === 'In Progress').length;
    const totalCost = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Maintenance & Service Logs</h2>
                    <p className="page-subtitle">{inProgress} active services · ₹{totalCost.toLocaleString('en-IN')} total maintenance costs</p>
                </div>
                {can('create') && (
                    <button className="btn btn--primary" onClick={openAdd}><Plus size={16} /> Log Service</button>
                )}
            </div>

            <div className="alert alert--info" style={{ marginBottom: '1rem' }}>
                <Wrench size={14} />
                <span>Adding a service log automatically sets the vehicle's status to <strong>In Shop</strong> and removes it from the trip dispatcher pool. Resolve the log to restore availability.</span>
            </div>

            <div className="card">
                <DataTable columns={columns} data={maintenanceLogs} />
            </div>

            {/* Add Modal */}
            <Modal isOpen={modal.open} onClose={closeModal} title="Add Service Log">
                <div className="form-grid">
                    <div className="form-field">
                        <label className="form-label">Vehicle *</label>
                        <select className={`form-select ${errors.vehicleId ? 'form-input--error' : ''}`} value={form.vehicleId} onChange={e => setField('vehicleId', e.target.value)}>
                            <option value="">Select vehicle</option>
                            {vehicles.filter(v => v.status !== 'Retired').map(v => (
                                <option key={v.id} value={v.id}>{v.name} ({v.plate}) — Current: {v.status}</option>
                            ))}
                        </select>
                        {errors.vehicleId && <span className="form-error">{errors.vehicleId}</span>}
                        {form.vehicleId && getVehicle(form.vehicleId)?.status !== 'In Shop' && (
                            <div className="form-hint warning">⚠️ Saving will change vehicle status to <strong>In Shop</strong></div>
                        )}
                    </div>
                    <div className="form-field">
                        <label className="form-label">Date *</label>
                        <input className={`form-input ${errors.date ? 'form-input--error' : ''}`} type="date" value={form.date} onChange={e => setField('date', e.target.value)} />
                        {errors.date && <span className="form-error">{errors.date}</span>}
                    </div>
                    <div className="form-field">
                        <label className="form-label">Service Type</label>
                        <select className="form-select" value={form.serviceType} onChange={e => setField('serviceType', e.target.value)}>
                            {SERVICE_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="form-field">
                        <label className="form-label">Technician / Workshop</label>
                        <input className="form-input" value={form.technician} onChange={e => setField('technician', e.target.value)} placeholder="e.g. Ram Motors" />
                    </div>
                    <div className="form-field form-field--full">
                        <label className="form-label">Description *</label>
                        <textarea className={`form-input form-textarea ${errors.description ? 'form-input--error' : ''}`} value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Describe the service performed..." rows={3} />
                        {errors.description && <span className="form-error">{errors.description}</span>}
                    </div>
                    <div className="form-field">
                        <label className="form-label">Cost (₹) *</label>
                        <input className={`form-input ${errors.cost ? 'form-input--error' : ''}`} type="number" value={form.cost} onChange={e => setField('cost', e.target.value)} placeholder="0" />
                        {errors.cost && <span className="form-error">{errors.cost}</span>}
                    </div>
                    <div className="form-field">
                        <label className="form-label">Status</label>
                        <select className="form-select" value={form.status} onChange={e => setField('status', e.target.value)}>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>
                <div className="modal__actions">
                    <button className="btn btn--ghost" onClick={closeModal}>Cancel</button>
                    <button className="btn btn--primary" onClick={handleSave}>Add Service Log</button>
                </div>
            </Modal>

            {/* Delete Confirm */}
            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Log" width="400px">
                <p className="text-muted">Delete service log <strong className="text-white">{deleteConfirm?.id}</strong>?</p>
                <div className="modal__actions">
                    <button className="btn btn--ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                    <button className="btn btn--danger" onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
                </div>
            </Modal>
        </div>
    );
}
