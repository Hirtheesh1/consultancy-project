import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Phone, MapPin, Truck, ArrowLeft, DollarSign, Download, History, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

const CustomerDetails = () => {
    const { id } = useParams();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [page, setPage] = useState(1);
    const [downloading, setDownloading] = useState(false);
    const [viewHistory, setViewHistory] = useState(false); // Toggle between Open and History

    useEffect(() => {
        fetchCustomer();
    }, [id, page, viewHistory]);

    const fetchCustomer = async () => {
        setLoading(true);
        try {
            const status = viewHistory ? 'CLOSED' : 'OPEN';
            const res = await api.get(`/customers/${id}?page=${page}&limit=10&status=${status}`);
            setCustomer(res.data);
        } catch (error) {
            console.error('Error fetching customer:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) return alert('Invalid Amount');
        try {
            await api.post(`/customers/${id}/payment`, { amount: paymentAmount, payment_method: 'Cash' });
            alert('Payment Recorded Successfully!');
            setPaymentAmount('');
            setShowPaymentModal(false);
            fetchCustomer(); // Refresh to see payment and potential closure
        } catch (error) {
            alert(error.response?.data?.error || 'Payment Failed');
        }
    };

    const handleDownload = async () => {
        setDownloading(true);
        try {
            // Download everything or just what's visible? Usually User wants full statement.
            // Let's download ALL (Open + Closed) for statement
            const res = await api.get(`/customers/${id}?limit=1000&status=ALL`);
            const fullData = res.data;

            if (!fullData.Sales || fullData.Sales.length === 0) {
                return alert('No transactions to download');
            }

            const worksheetData = fullData.Sales.map(sale => ({
                Date: new Date(sale.date).toLocaleDateString(),
                Invoice: sale.invoice_number,
                Type: sale.type, // SALE or PAYMENT
                'Vehicle Model': sale.vehicle_model || '-',
                'Vehicle Number': sale.vehicle_number || '-',
                Amount: sale.type === 'PAYMENT' ? -parseFloat(sale.grand_total) : parseFloat(sale.grand_total),
                Status: sale.status
            }));

            const ws = XLSX.utils.json_to_sheet(worksheetData);

            XLSX.utils.sheet_add_aoa(ws, [
                [],
                ['Current Total Due:', fullData.total_credit],
                ['Total Lifetime Spend:', fullData.total_spend]
            ], { origin: -1 });

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Statement");

            XLSX.writeFile(wb, `${fullData.name}_Statement.xlsx`);

        } catch (error) {
            console.error('Download Error:', error);
            alert('Failed to download report');
        } finally {
            setDownloading(false);
        }
    };

    if (loading && !customer) return <div>Loading...</div>; // Only showing loading on initial load or if customer is null
    if (!customer && !loading) return <div>Customer not found</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <Link to="/customers" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#64748b', textDecoration: 'none' }}>
                <ArrowLeft size={20} /> Back to Customers
            </Link>

            <div className="grid-2" style={{ alignItems: 'start' }}>
                {/* Profile Card */}
                <div className="card">
                    <h1 style={{ marginTop: 0 }}>{customer?.name}</h1>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#475569', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Phone size={18} /> {customer?.phone}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={18} /> {customer?.address || 'No Address'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Truck size={18} /> {customer?.vehicle_number || 'No Vehicle'}
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', padding: '1rem', background: customer?.total_credit > 0 ? '#fee2e2' : '#f0fdf4', borderRadius: '0.5rem', border: customer?.total_credit > 0 ? '1px solid #fca5a5' : '1px solid #86efac' }}>
                        <div style={{ fontSize: '0.9rem', color: customer?.total_credit > 0 ? '#991b1b' : '#166534', marginBottom: '0.25rem' }}>Current Udhaari (Due)</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: customer?.total_credit > 0 ? '#7f1d1d' : '#14532d' }}>
                            ₹{parseFloat(customer?.total_credit || 0).toLocaleString()}
                        </div>
                        {customer?.total_credit > 0 && (
                            <button
                                onClick={() => setShowPaymentModal(true)}
                                className="btn"
                                style={{ width: '100%', marginTop: '1rem', background: '#10b981', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                <DollarSign size={18} /> Receive Payment
                            </button>
                        )}
                    </div>
                </div>

                {/* Transaction History */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>{viewHistory ? 'Past Reports (Closed)' : 'Current Report (Open)'}</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => { setViewHistory(!viewHistory); setPage(1); }}
                                className="btn"
                                style={{ fontSize: '0.8rem', padding: '0.5rem', background: viewHistory ? '#e2e8f0' : '#f1f5f9', color: viewHistory ? '#1e293b' : '#64748b' }}
                            >
                                {viewHistory ? <FileText size={16} /> : <History size={16} />}
                                {viewHistory ? ' View Current' : ' View History'}
                            </button>
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="btn"
                                style={{ fontSize: '0.8rem', padding: '0.5rem', background: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Download size={16} />
                            </button>
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        {customer?.Sales && customer.Sales.length > 0 ? (
                            <table style={{ width: '100%' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                                        <th style={{ padding: '0.5rem' }}>Date</th>
                                        <th style={{ padding: '0.5rem' }}>Details</th>
                                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customer.Sales.map(sale => (
                                        <tr key={sale.id} style={{ borderBottom: '1px solid #f9f9f9', backgroundColor: sale.type === 'PAYMENT' ? '#f0fdf4' : 'transparent' }}>
                                            <td style={{ padding: '0.5rem' }}>{new Date(sale.date).toLocaleDateString()}</td>
                                            <td style={{ padding: '0.5rem' }}>
                                                {sale.type === 'PAYMENT' ? (
                                                    <span style={{ fontWeight: 'bold', color: '#166534' }}>PAYMENT RECEIVED</span>
                                                ) : (
                                                    <Link to={`/invoice/${sale.id}`} style={{ color: '#2563eb' }}>{sale.invoice_number}</Link>
                                                )}
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                    {sale.type === 'SALE' ? (
                                                        <span className={`badge ${sale.payment_method === 'Credit' ? 'badge-slow' : 'badge-fast'}`} style={{ fontSize: '0.7rem', padding: '0.1rem 0.3rem' }}>
                                                            {sale.payment_method}
                                                        </span>
                                                    ) : sale.payment_method}
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold', color: sale.type === 'PAYMENT' ? '#166534' : 'inherit' }}>
                                                {sale.type === 'PAYMENT' ? '-' : ''}₹{parseFloat(sale.grand_total).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
                                {viewHistory ? 'No past reports found.' : 'No open transactions. Account is clear.'}
                            </p>
                        )}

                        {/* Pagination Controls */}
                        {customer?.totalSales > 10 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                <button
                                    className="btn"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    style={{ background: page === 1 ? '#f1f5f9' : 'white', border: '1px solid #e2e8f0' }}
                                >
                                    Prev
                                </button>
                                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                    Page {page} of {customer.totalPages}
                                </span>
                                <button
                                    className="btn"
                                    disabled={page === customer.totalPages}
                                    onClick={() => setPage(p => Math.min(customer.totalPages, p + 1))}
                                    style={{ background: page === customer.totalPages ? '#f1f5f9' : 'white', border: '1px solid #e2e8f0' }}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '350px' }}>
                        <h2>Receive Payment</h2>
                        <p style={{ marginBottom: '1rem', color: '#64748b' }}>Enter amount received from {customer?.name}</p>
                        <input
                            className="input"
                            type="number"
                            placeholder="Amount ₹"
                            value={paymentAmount}
                            onChange={e => setPaymentAmount(e.target.value)}
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handlePayment}>Confirm</button>
                            <button className="btn" style={{ flex: 1, background: '#f1f5f9' }} onClick={() => setShowPaymentModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDetails;
