import { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/shared/DataTable';
import StatusPill from '../components/shared/StatusPill';
import Modal from '../components/shared/Modal';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const EMPTY_VEHICLE = {
    name: '', model: '', type: 'Truck', plate: '', capacity: '', odometer: '', region: 'North', year: new Date().getFullYear(),
};

const VEHICLE_TYPES = ['Truck', 'Van', 'Bike'];
const REGIONS = ['North', 'South', 'East', 'West'];

export default function VehicleRegistry() {
    const { vehicles, dispatch, generateId } = useFleet();
    const { can } = useAuth();
    const [modal, setModal] = useState({ open: false, mode: 'add', vehicle: EMPTY_VEHICLE });
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [errors, setErrors] = useState({});

    const openAdd = () => setModal({ open: true, mode: 'add', vehicle: { ...EMPTY_VEHICLE } });
    const openEdit = (v) => setModal({ open: true, mode: 'edit', vehicle: { ...v } });
    const closeModal = () => { setModal(m => ({ ...m, open: false })); setErrors({}); };

    const validate = (v) => {
        const e = {};
        if (!v.name.trim()) e.name = 'Name required';
        if (!v.plate.trim()) e.plate = 'Plate required';
        if (vehicles.some(x => x.plate === v.plate && x.id !== v.id)) e.plate = 'Plate already exists';
        if (!v.capacity || isNaN(v.capacity) || Number(v.capacity) <= 0) e.capacity = 'Valid capacity required';
        if (!v.odometer || isNaN(v.odometer) || Number(v.odometer) < 0) e.odometer = 'Valid odometer required';
        return e;
    };

    const handleSave = () => {
        const v = modal.vehicle;
        const e = validate(v);
        if (Object.keys(e).length) { setErrors(e); return; }
        if (modal.mode === 'add') {
            dispatch({ type: 'ADD_VEHICLE', payload: { ...v, id: generateId('V'), capacity: Number(v.capacity), odometer: Number(v.odometer), status: 'Available' } });
        } else {
            dispatch({ type: 'UPDATE_VEHICLE', payload: { ...v, capacity: Number(v.capacity), odometer: Number(v.odometer) } });
        }
        closeModal();
    };

    const handleDelete = (id) => {
        dispatch({ type: 'DELETE_VEHICLE', payload: id });
        setDeleteConfirm(null);
    };

    const handleToggleRetired = (id) => dispatch({ type: 'TOGGLE_VEHICLE_RETIRED', payload: id });

    const setField = (key, val) => setModal(m => ({ ...m, vehicle: { ...m.vehicle, [key]: val } }));

    const columns = [
        { key: 'id', header: 'ID', accessor: 'id', render: r => <span className="text-muted font-mono">{r.id}</span> },
        { key: 'name', header: 'Vehicle Name', accessor: 'name', render: r => <div><div className="font-medium">{r.name}</div><div className="text-xs text-muted">{r.model}</div></div> },
        { key: 'plate', header: 'License Plate', accessor: 'plate', render: r => <span className="font-mono plate-tag">{r.plate}</span> },
        { key: 'type', header: 'Type', accessor: 'type' },
        { key: 'region', header: 'Region', accessor: 'region' },
        { key: 'capacity', header: 'Capacity (kg)', accessor: 'capacity', render: r => r.capacity.toLocaleString('en-IN') },
        { key: 'odometer', header: 'Odometer', accessor: 'odometer', render: r => `${r.odometer.toLocaleString('en-IN')} km` },
        { key: 'status', header: 'Status', accessor: 'status', render: r => <StatusPill status={r.status} size="sm" /> },
        {
            key: 'actions', header: 'Actions', sortable: false,
            render: r => (
                <div className="action-btns">
                    {can('update') && (
                        <>
                            <button className="icon-btn icon-btn--blue" title="Edit" onClick={e => { e.stopPropagation(); openEdit(r); }}><Edit2 size={14} /></button>
                            <button
                                className={`icon-btn ${r.status === 'Retired' ? 'icon-btn--emerald' : 'icon-btn--amber'}`}
                                title={r.status === 'Retired' ? 'Re-activate' : 'Set Retired'}
                                onClick={e => { e.stopPropagation(); handleToggleRetired(r.id); }}
                            >
                                {r.status === 'Retired' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                            </button>
                        </>
                    )}
                    {can('delete') && (
                        <button className="icon-btn icon-btn--red" title="Delete" onClick={e => { e.stopPropagation(); setDeleteConfirm(r); }}><Trash2 size={14} /></button>
                    )}
                </div>
            )
        },
    ];

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Vehicle Registry</h2>
                    <p className="page-subtitle">{vehicles.length} total assets registered</p>
                </div>
                {can('create') && (
                    <button className="btn btn--primary" onClick={openAdd}><Plus size={16} /> Add Vehicle</button>
                )}
            </div>

            <div className="card">
                <DataTable columns={columns} data={vehicles} />
            </div>

            {/* Add/Edit Modal */}
            <Modal isOpen={modal.open} onClose={closeModal} title={modal.mode === 'add' ? 'Add New Vehicle' : 'Edit Vehicle'}>
                <div className="form-grid">
                    <div className="form-field">
                        <label className="form-label">Vehicle Name *</label>
                        <input className={`form-input ${errors.name ? 'form-input--error' : ''}`} value={modal.vehicle.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. Volvo FH16" />
                        {errors.name && <span className="form-error">{errors.name}</span>}
                    </div>
                    <div className="form-field">
                        <label className="form-label">Model</label>
                        <input className="form-input" value={modal.vehicle.model} onChange={e => setField('model', e.target.value)} placeholder="e.g. FH16 750" />
                    </div>
                    <div className="form-field">
                        <label className="form-label">Type</label>
                        <select className="form-select" value={modal.vehicle.type} onChange={e => setField('type', e.target.value)}>
                            {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="form-field">
                        <label className="form-label">License Plate *</label>
                        <input className={`form-input ${errors.plate ? 'form-input--error' : ''}`} value={modal.vehicle.plate} onChange={e => setField('plate', e.target.value.toUpperCase())} placeholder="e.g. MH-01-AB-1234" />
                        {errors.plate && <span className="form-error">{errors.plate}</span>}
                    </div>
                    <div className="form-field">
                        <label className="form-label">Max Load Capacity (kg) *</label>
                        <input className={`form-input ${errors.capacity ? 'form-input--error' : ''}`} type="number" value={modal.vehicle.capacity} onChange={e => setField('capacity', e.target.value)} placeholder="e.g. 20000" />
                        {errors.capacity && <span className="form-error">{errors.capacity}</span>}
                    </div>
                    <div className="form-field">
                        <label className="form-label">Odometer (km) *</label>
                        <input className={`form-input ${errors.odometer ? 'form-input--error' : ''}`} type="number" value={modal.vehicle.odometer} onChange={e => setField('odometer', e.target.value)} placeholder="e.g. 50000" />
                        {errors.odometer && <span className="form-error">{errors.odometer}</span>}
                    </div>
                    <div className="form-field">
                        <label className="form-label">Region</label>
                        <select className="form-select" value={modal.vehicle.region} onChange={e => setField('region', e.target.value)}>
                            {REGIONS.map(r => <option key={r}>{r}</option>)}
                        </select>
                    </div>
                    <div className="form-field">
                        <label className="form-label">Year</label>
                        <input className="form-input" type="number" value={modal.vehicle.year} onChange={e => setField('year', e.target.value)} />
                    </div>
                </div>
                <div className="modal__actions">
                    <button className="btn btn--ghost" onClick={closeModal}>Cancel</button>
                    <button className="btn btn--primary" onClick={handleSave}>{modal.mode === 'add' ? 'Add Vehicle' : 'Save Changes'}</button>
                </div>
            </Modal>

            {/* Delete Confirm */}
            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete" width="400px">
                <p className="text-muted">Are you sure you want to delete <strong className="text-white">{deleteConfirm?.name}</strong>? This action cannot be undone.</p>
                <div className="modal__actions">
                    <button className="btn btn--ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                    <button className="btn btn--danger" onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
                </div>
            </Modal>
        </div>
    );
}
