import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import api from '../services/api';
import { Eye, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

const Sales = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 20;
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        fetchSales();
    }, [page]);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/sales?page=${page}&limit=${limit}`);
            setSales(res.data.sales);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Error fetching sales:', error);
            alert('Failed to load sales history');
        } finally {
            setLoading(false);
        }
    };

    const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'monthly' | 'yearly'
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [expandedMonth, setExpandedMonth] = useState(null);

    // Helper to render table
    const renderTable = (items) => (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', background: '#fff' }}>
                    <th style={{ padding: '1rem' }}>Invoice No</th>
                    <th style={{ padding: '1rem' }}>Date</th>
                    <th style={{ padding: '1rem' }}>Customer</th>
                    <th style={{ padding: '1rem' }}>Amount</th>
                    <th style={{ padding: '1rem' }}>Vehicle</th>
                    <th style={{ padding: '1rem' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {items.map(sale => (
                    <tr key={sale.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem' }}>{sale.invoice_number}</td>
                        <td style={{ padding: '1rem' }}>{new Date(sale.date).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 'bold' }}>{sale.customer_name || 'Walk-in'}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{sale.customer_phone}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>₹{sale.grand_total}</td>
                        <td style={{ padding: '1rem' }}>
                            {sale.vehicle_model ? `${sale.vehicle_model} (${sale.vehicle_number || ''})` : '-'}
                        </td>
                        <td style={{ padding: '1rem' }}>
                            <button
                                className="btn"
                                onClick={() => navigate(`/invoice/${sale.id}`)}
                                style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Eye size={16} /> View
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>Sales History</h1>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {/* Segmented Control */}
                    <div style={{ display: 'flex', background: '#e2e8f0', padding: '0.25rem', borderRadius: '8px' }}>
                        {['Daily', 'Monthly', 'Yearly'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode.toLowerCase())}
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
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
            ) : sales.length === 0 ? (
                <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>No sales found</div>
            ) : (
                // Filtered List View
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        {(() => {
                            const filteredSales = sales.filter(s => {
                                const sDate = new Date(s.date);
                                const fDate = new Date(selectedDate);

                                if (viewMode === 'daily') {
                                    return sDate.toISOString().split('T')[0] === selectedDate;
                                } else if (viewMode === 'monthly') {
                                    return sDate.getMonth() === fDate.getMonth() && sDate.getFullYear() === fDate.getFullYear();
                                } else if (viewMode === 'yearly') {
                                    return sDate.getFullYear() === fDate.getFullYear();
                                }
                                return true;
                            });

                            if (filteredSales.length === 0) {
                                return (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                                        No sales found for the selected period.
                                    </div>
                                );
                            }

                            return renderTable(filteredSales);
                        })()}
                    </div>
                </div>
            )}
            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                <button
                    className="btn"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    <ChevronLeft size={20} /> Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                    className="btn"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                >
                    Next <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default Sales;
