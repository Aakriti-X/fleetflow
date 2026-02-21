import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportToCSV(filename, headers, rows) {
    const csvHeaders = headers.join(',');
    const csvRows = rows.map(row =>
        row.map(cell => {
            const str = String(cell ?? '').replace(/"/g, '""');
            return /[,"\n]/.test(str) ? `"${str}"` : str;
        }).join(',')
    );
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function exportToPDF(filename, title, headers, rows) {
    const doc = new jsPDF({ orientation: 'landscape' });

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, doc.internal.pageSize.width, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text('FleetFlow', 14, 13);
    doc.setFontSize(10);
    doc.text(title, doc.internal.pageSize.width / 2, 13, { align: 'center' });
    doc.setFontSize(8);
    doc.text(new Date().toLocaleString(), doc.internal.pageSize.width - 14, 13, { align: 'right' });

    autoTable(doc, {
        startY: 24,
        head: [headers],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [241, 245, 249] },
        styles: { fontSize: 9, cellPadding: 3 },
    });

    doc.save(`${filename}.pdf`);
}

export function formatCurrency(value) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

export function formatNumber(value, decimals = 0) {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: decimals }).format(value);
}
