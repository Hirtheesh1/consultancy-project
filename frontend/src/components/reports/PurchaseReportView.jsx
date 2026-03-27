import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Download, FileText } from 'lucide-react';

const PurchaseReportView = () => {
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const fetchData = async () => {
        try {
            const res = await api.get(`/financial-reports/purchase-summary?startDate=${startDate}&endDate=${endDate}`);
            setData(res.data);
        } catch (error) {
            console.error('Error fetching purchase summary:', error);
        }
    };

    const handleExport = (type) => window.open(`https://consultancy-project-v1mx.onrender.com/api/financial-reports/purchase-summary?startDate=${startDate}&endDate=${endDate}&export_type=${type}`);

    if (!data) return <p>Loading...</p>;

    return (
        <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <span>to</span>
                <input type="date" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} />

                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                    <button onClick={() => handleExport('excel')} className="btn" style={{ background: '#10b981', color: 'white' }}><Download size={16} /> Excel</button>
                    <button onClick={() => handleExport('pdf')} className="btn" style={{ background: '#ef4444', color: 'white' }}><FileText size={16} /> PDF</button>
                </div>
            </div>

            <div className="grid-3" style={{ marginBottom: '2rem' }}>
                <div className="card"><div style={{ color: '#64748b' }}>Total Gross Purchases</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{data.total_purchases.toLocaleString()}</div></div>
                <div className="card"><div style={{ color: '#64748b' }}>Total Taxable Value</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{data.total_taxable_value.toLocaleString()}</div></div>
                <div className="card"><div style={{ color: '#64748b' }}>Total GST Paid</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{data.total_gst_paid.toLocaleString()}</div></div>
                <div className="card"><div style={{ color: '#64748b' }}>Total Purchase Invoices</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{data.purchase_count}</div></div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card">
                    <h3>Purchases By Category</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginTop: '1rem' }}>
                        {Object.entries(data.purchases_by_category || {}).map(([cat, val]) => (
                            <li key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span>{cat}</span><strong>₹{val.toLocaleString()}</strong>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="card">
                    <h3>Purchases By Brand</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginTop: '1rem' }}>
                        {Object.entries(data.purchases_by_brand || {}).map(([brand, val]) => (
                            <li key={brand} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span>{brand}</span><strong>₹{val.toLocaleString()}</strong>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="card">
                <h3>Purchases By Supplier</h3>
                <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: '0.5rem' }}>Supplier Name</th>
                            <th style={{ padding: '0.5rem' }}>Total Purchase Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(data.supplier_wise_totals || {}).map(([supp, val]) => (
                            <tr key={supp} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.5rem' }}>{supp}</td>
                                <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>₹{val.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default PurchaseReportView;
