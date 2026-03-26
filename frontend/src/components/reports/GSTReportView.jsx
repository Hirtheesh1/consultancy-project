import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Download, FileText } from 'lucide-react';

const GSTReportView = () => {
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/financial-reports/gst-summary?startDate=${startDate}&endDate=${endDate}`);
            setData(res.data);
        } catch (error) {
            console.error('Error fetching GST report:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (type) => {
        window.open(`http://localhost:5001/api/financial-reports/gst-summary?startDate=${startDate}&endDate=${endDate}&export_type=${type}`);
    };

    if (!data) return <p>Loading...</p>;

    return (
        <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <span>to</span>
                <input type="date" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} />

                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                    <button onClick={() => handleExport('excel')} className="btn" style={{ background: '#10b981', color: 'white' }}>
                        <Download size={16} /> Excel
                    </button>
                    <button onClick={() => handleExport('pdf')} className="btn" style={{ background: '#ef4444', color: 'white' }}>
                        <FileText size={16} /> PDF
                    </button>
                </div>
            </div>

            <div className="grid-3" style={{ marginBottom: '2rem' }}>
                <div className="card">
                    <div style={{ color: '#64748b' }}>Total Taxable Sales</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{data.total_taxable_sales.toLocaleString()}</div>
                </div>
                <div className="card">
                    <div style={{ color: '#64748b' }}>Total GST Collected</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{data.total_gst_collected.toLocaleString()}</div>
                </div>
                <div className="card">
                    <div style={{ color: '#64748b' }}>Total GST Paid (Purchases)</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{data.total_gst_paid.toLocaleString()}</div>
                </div>
                <div className="card" style={{ background: '#fef3c7' }}>
                    <div style={{ color: '#b45309' }}>Net GST Payable</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{data.net_gst_payable.toLocaleString()}</div>
                </div>
                {data.input_tax_credit > 0 && (
                    <div className="card" style={{ background: '#d1fae5' }}>
                        <div style={{ color: '#047857' }}>Input Tax Credit (ITC)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{data.input_tax_credit.toLocaleString()}</div>
                    </div>
                )}
            </div>
            
            <div className="card">
                <h3>Monthly Breakdown</h3>
                <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: '0.5rem' }}>Month</th>
                            <th style={{ padding: '0.5rem' }}>Taxable Sales</th>
                            <th style={{ padding: '0.5rem' }}>GST Collected</th>
                            <th style={{ padding: '0.5rem' }}>GST Paid</th>
                            <th style={{ padding: '0.5rem' }}>Net GST</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(data.monthly_data || {}).map(month => (
                            <tr key={month} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.5rem' }}>{month}</td>
                                <td style={{ padding: '0.5rem' }}>₹{data.monthly_data[month].taxable_sales.toFixed(2)}</td>
                                <td style={{ padding: '0.5rem' }}>₹{data.monthly_data[month].gst_collected.toFixed(2)}</td>
                                <td style={{ padding: '0.5rem' }}>₹{data.monthly_data[month].gst_paid.toFixed(2)}</td>
                                <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>₹{data.monthly_data[month].net_gst.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default GSTReportView;
