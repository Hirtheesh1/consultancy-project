import React, { useState, useEffect } from 'react';
import { Download, Printer, ChevronDown, ChevronUp, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import api from '../services/api';

const RecentPurchases = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedMonth, setExpandedMonth] = useState(null);
    const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'monthly' | 'yearly'
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            const res = await api.get('/purchases');
            setPurchases(res.data);
        } catch (error) {
            console.error("Failed to fetch purchases", error);
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = (purchase) => {
        try {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(18);
            doc.text('Purchase Invoice', 14, 22);

            doc.setFontSize(11);
            doc.text(`Invoice No: ${purchase.invoice_number || '-'}`, 14, 32);
            doc.text(`Supplier: ${purchase.supplier_name || 'N/A'}`, 14, 38);
            doc.text(`Date: ${new Date(purchase.purchase_date).toLocaleDateString()}`, 14, 44);

            // Items Table
            const items = purchase.PurchaseItems || [];
            const tableBody = items.map(item => [
                item.Product?.part_number || 'N/A',
                item.Product?.description || 'N/A',
                item.quantity || 0,
                `Rs. ${(item.unit_price || 0).toLocaleString()}`,
                `Rs. ${(item.total_price || 0).toLocaleString()}`
            ]);

            autoTable(doc, {
                startY: 50,
                head: [['Part No', 'Description', 'Qty', 'Unit Price', 'Total']],
                body: tableBody,
                foot: [['', '', '', 'Grand Total:', `Rs. ${(parseFloat(purchase.total_amount) || 0).toLocaleString()}`]],
            });

            doc.save(`Invoice_${purchase.invoice_number || 'unknown'}.pdf`);
        } catch (error) {
            console.error("PDF generation failed:", error);
            alert(`Failed to generate PDF: ${error.message}`);
        }
    };

    const printInvoice = (purchase) => {
        try {
            const doc = new jsPDF();

            doc.setFontSize(18);
            doc.text('Purchase Invoice', 14, 22);

            doc.setFontSize(11);
            doc.text(`Invoice No: ${purchase.invoice_number || '-'}`, 14, 32);
            doc.text(`Supplier: ${purchase.supplier_name || 'N/A'}`, 14, 38);
            doc.text(`Date: ${new Date(purchase.purchase_date).toLocaleDateString()}`, 14, 44);

            const items = purchase.PurchaseItems || [];
            const tableBody = items.map(item => [
                item.Product?.part_number || 'N/A',
                item.Product?.description || 'N/A',
                item.quantity || 0,
                `Rs. ${(item.unit_price || 0).toLocaleString()}`,
                `Rs. ${(item.total_price || 0).toLocaleString()}`
            ]);

            autoTable(doc, {
                startY: 50,
                head: [['Part No', 'Description', 'Qty', 'Unit Price', 'Total']],
                body: tableBody,
                foot: [['', '', '', 'Grand Total:', `Rs. ${(parseFloat(purchase.total_amount) || 0).toLocaleString()}`]],
            });

            doc.autoPrint();
            window.open(doc.output('bloburl'), '_blank');
        } catch (error) {
            console.error("Print generation failed:", error);
            alert(`Failed to prepare print document: ${error.message}`);
        }
    };

    const downloadExcel = () => {
        let filteredData = [];
        const sDate = new Date(selectedDate);

        if (viewMode === 'daily') {
            filteredData = purchases.filter(p => new Date(p.purchase_date).toISOString().split('T')[0] === selectedDate);
        } else if (viewMode === 'monthly') {
            filteredData = purchases.filter(p => {
                const pDate = new Date(p.purchase_date);
                return pDate.getMonth() === sDate.getMonth() && pDate.getFullYear() === sDate.getFullYear();
            });
        } else if (viewMode === 'yearly') {
            filteredData = purchases.filter(p => new Date(p.purchase_date).getFullYear() === sDate.getFullYear());
        }

        const flatData = [];
        filteredData.forEach(p => {
            if (p.PurchaseItems && p.PurchaseItems.length > 0) {
                p.PurchaseItems.forEach(item => {
                    flatData.push({
                        Date: new Date(p.purchase_date).toLocaleDateString(),
                        Invoice: p.invoice_number,
                        Supplier: p.supplier_name,
                        'Part No': item.Product?.part_number || 'N/A',
                        Description: item.Product?.description || 'N/A',
                        qty: item.quantity,
                        'Unit Price': item.unit_price,
                        'Total Price': item.total_price,
                        'Invoice Total': p.total_amount
                    });
                });
            } else {
                flatData.push({
                    Date: new Date(p.purchase_date).toLocaleDateString(),
                    Invoice: p.invoice_number,
                    Supplier: p.supplier_name,
                    'Part No': '-',
                    Description: '-',
                    qty: 0,
                    'Unit Price': 0,
                    'Total Price': 0,
                    'Invoice Total': p.total_amount
                });
            }
        });

        const worksheet = XLSX.utils.json_to_sheet(flatData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Purchases");
        XLSX.writeFile(workbook, `Purchases_${viewMode}_${selectedDate}.xlsx`);
    };

    if (loading) return <div>Loading recent purchases...</div>;

    // Helper to render table
    const renderTable = (items) => (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ background: '#fff', borderBottom: '2px solid #eee', color: '#666', fontSize: '0.9rem' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Invoice</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Supplier</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Items</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Total</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {items.map(purchase => (
                    <tr key={purchase.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '0.75rem' }}>{new Date(purchase.purchase_date).toLocaleDateString()}</td>
                        <td style={{ padding: '0.75rem' }}>{purchase.invoice_number}</td>
                        <td style={{ padding: '0.75rem' }}>{purchase.supplier_name || '-'}</td>
                        <td style={{ padding: '0.75rem' }}>
                            {purchase.PurchaseItems?.reduce((acc, item) => acc + item.quantity, 0) || 0} units
                            <div style={{ fontSize: '0.8rem', color: '#888', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {purchase.PurchaseItems?.map(i => i.Product?.part_number).join(', ')}
                            </div>
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>₹{parseFloat(purchase.total_amount).toLocaleString()}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={(e) => { e.stopPropagation(); downloadPDF(purchase); }}
                                style={{ border: '1px solid #ddd', background: 'white', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}
                                title="Download PDF"
                            >
                                <Download size={16} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); printInvoice(purchase); }}
                                style={{ border: '1px solid #ddd', background: 'white', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}
                                title="Print"
                            >
                                <Printer size={16} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div className="card" style={{ marginTop: '2rem' }}>
            {/* Filter Toggle & Attributes */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Recent Purchases</h2>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {/* Segmented Control */}
                    <div style={{ display: 'flex', background: '#e2e8f0', padding: '0.25rem', borderRadius: '8px' }}>
                        {['Daily', 'Monthly', 'Yearly'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => {
                                    setViewMode(mode.toLowerCase());
                                    // Reset date to today/current month/year when switching if needed, 
                                    // or just let the input type switch handle the format
                                }}
                                style={{
                                    padding: '0.4rem 1.2rem',
                                    borderRadius: '6px',
                                    border: viewMode === mode.toLowerCase() ? '1px solid #000' : 'none',
                                    background: viewMode === mode.toLowerCase() ? 'white' : 'transparent',
                                    boxShadow: viewMode === mode.toLowerCase() ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                    cursor: 'pointer',
                                    fontWeight: viewMode === mode.toLowerCase() ? '700' : '500',
                                    fontSize: '0.9rem',
                                    color: viewMode === mode.toLowerCase() ? '#0f172a' : '#64748b',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    {/* Date Picker */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #e2e8f0', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
                        {viewMode === 'daily' && (
                            <input
                                type="date"
                                value={selectedDate} // format: YYYY-MM-DD
                                onChange={(e) => setSelectedDate(e.target.value)}
                                style={{ border: 'none', outline: 'none', color: '#334155', fontWeight: '500', fontSize: '0.9rem' }}
                            />
                        )}
                        {viewMode === 'monthly' && (
                            <input
                                type="month"
                                value={selectedDate.substring(0, 7)} // format: YYYY-MM
                                onChange={(e) => setSelectedDate(e.target.value + '-01')}
                                style={{ border: 'none', outline: 'none', color: '#334155', fontWeight: '500', fontSize: '0.9rem' }}
                            />
                        )}
                        {viewMode === 'yearly' && (
                            <input
                                type="number"
                                min="2000"
                                max="2099"
                                value={selectedDate.substring(0, 4)} // format: YYYY
                                onChange={(e) => setSelectedDate(`${e.target.value}-01-01`)}
                                style={{ border: 'none', outline: 'none', color: '#334155', fontWeight: '500', fontSize: '0.9rem', width: '80px' }}
                            />
                        )}
                        <button
                            onClick={downloadExcel}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.4rem 0.8rem', borderRadius: '6px',
                                border: '1px solid #107c41', background: 'white',
                                color: '#107c41', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem'
                            }}
                        >
                            <FileSpreadsheet size={18} /> Export
                        </button>
                    </div>
                </div>
            </div>

            {purchases.length === 0 ? (
                <p style={{ color: '#666', padding: '1rem' }}>No recent purchases found.</p>
            ) : (
                // Filtered List View
                <div style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        {(() => {
                            const filteredPurchases = purchases.filter(p => {
                                const pDate = new Date(p.purchase_date);
                                const sDate = new Date(selectedDate);

                                if (viewMode === 'daily') {
                                    return pDate.toISOString().split('T')[0] === selectedDate;
                                } else if (viewMode === 'monthly') {
                                    return pDate.getMonth() === sDate.getMonth() && pDate.getFullYear() === sDate.getFullYear();
                                } else if (viewMode === 'yearly') {
                                    return pDate.getFullYear() === sDate.getFullYear();
                                }
                                return true;
                            });

                            if (filteredPurchases.length === 0) {
                                return (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                                        No purchases found for the selected period.
                                    </div>
                                );
                            }

                            return renderTable(filteredPurchases);
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecentPurchases;
