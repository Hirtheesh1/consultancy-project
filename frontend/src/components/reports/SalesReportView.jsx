import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Download, FileText } from 'lucide-react';

const SalesReportView = () => {
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const fetchData = async () => {
        try {
            const res = await api.get(`/financial-reports/sales-summary?startDate=${startDate}&endDate=${endDate}`);
            setData(res.data);
        } catch (error) {
            console.error('Error fetching sales summary:', error);
        }
    };

    const handleExport = (type) => window.open(`http://localhost:5001/api/financial-reports/sales-summary?startDate=${startDate}&endDate=${endDate}&export_type=${type}`);

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
                <div className="card"><div style={{ color: '#64748b' }}>Total Gross Sales</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{data.total_sales.toLocaleString()}</div></div>
                <div className="card"><div style={{ color: '#64748b' }}>Total Taxable Value</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{data.total_taxable_value.toLocaleString()}</div></div>
                <div className="card"><div style={{ color: '#64748b' }}>Total GST Collected</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{data.total_gst_collected.toLocaleString()}</div></div>
                <div className="card"><div style={{ color: '#64748b' }}>Total Invoices</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{data.total_invoices}</div></div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="card">
                    <h3>Sales By Category</h3>
                    <ul>
                        {Object.entries(data.sales_by_category || {}).map(([cat, val]) => (
                            <li key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span>{cat}</span><strong>₹{val.toLocaleString()}</strong>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="card">
                    <h3>Sales By Brand</h3>
                    <ul>
                        {Object.entries(data.sales_by_brand || {}).map(([brand, val]) => (
                            <li key={brand} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span>{brand}</span><strong>₹{val.toLocaleString()}</strong>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
export default SalesReportView;
