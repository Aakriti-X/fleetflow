import { useState } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';

export default function DataTable({ columns, data, onRowClick, searchable = true, emptyMessage = 'No records found' }) {
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState('asc');
    const [search, setSearch] = useState('');

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const filtered = data.filter(row =>
        !search || columns.some(col => {
            const val = col.accessor ? row[col.accessor] : col.render ? '' : '';
            return String(val || '').toLowerCase().includes(search.toLowerCase());
        })
    );

    const sorted = sortKey
        ? [...filtered].sort((a, b) => {
            const aVal = a[sortKey] ?? '';
            const bVal = b[sortKey] ?? '';
            const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
            return sortDir === 'asc' ? cmp : -cmp;
        })
        : filtered;

    return (
        <div className="data-table-wrapper">
            {searchable && (
                <div className="data-table__search">
                    <Search size={14} className="data-table__search-icon" />
                    <input
                        className="data-table__search-input"
                        placeholder="Search..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            )}
            <div className="data-table__scroll">
                <table className="data-table">
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    className={`data-table__th ${col.sortable !== false && col.accessor ? 'data-table__th--sortable' : ''}`}
                                    onClick={() => col.sortable !== false && col.accessor && handleSort(col.accessor)}
                                >
                                    {col.header}
                                    {col.sortable !== false && col.accessor && (
                                        <span className="sort-icons">
                                            <ChevronUp size={10} className={sortKey === col.accessor && sortDir === 'asc' ? 'sort-active' : ''} />
                                            <ChevronDown size={10} className={sortKey === col.accessor && sortDir === 'desc' ? 'sort-active' : ''} />
                                        </span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="data-table__empty">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            sorted.map((row, i) => (
                                <tr
                                    key={row.id || i}
                                    className={`data-table__row ${onRowClick ? 'data-table__row--clickable' : ''}`}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {columns.map(col => (
                                        <td key={col.key} className="data-table__td">
                                            {col.render ? col.render(row) : row[col.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="data-table__footer">
                Showing {sorted.length} of {data.length} records
            </div>
        </div>
    );
}
