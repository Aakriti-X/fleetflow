const STATUS_CONFIG = {
    // Vehicle statuses
    'Available': { color: 'emerald', label: 'Available' },
    'On Trip': { color: 'blue', label: 'On Trip' },
    'In Shop': { color: 'amber', label: 'In Shop' },
    'Retired': { color: 'slate', label: 'Retired' },
    // Trip statuses
    'Draft': { color: 'slate', label: 'Draft' },
    'Dispatched': { color: 'blue', label: 'Dispatched' },
    'Completed': { color: 'emerald', label: 'Completed' },
    'Cancelled': { color: 'red', label: 'Cancelled' },
    // Driver statuses
    'On Duty': { color: 'emerald', label: 'On Duty' },
    'Off Duty': { color: 'slate', label: 'Off Duty' },
    'Suspended': { color: 'red', label: 'Suspended' },
    // Maintenance statuses
    'In Progress': { color: 'amber', label: 'In Progress' },
    // Priority
    'Urgent': { color: 'red', label: 'Urgent' },
    'High': { color: 'orange', label: 'High' },
    'Normal': { color: 'blue', label: 'Normal' },
};

export default function StatusPill({ status, size = 'md' }) {
    const config = STATUS_CONFIG[status] || { color: 'slate', label: status };
    return (
        <span className={`status-pill status-pill--${config.color} status-pill--${size}`}>
            <span className="status-pill__dot" />
            {config.label}
        </span>
    );
}
