import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Download, FileText } from 'lucide-react';

const InventoryValuationView = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/financial-reports/inventory-valuation`);
            setData(res.data);
        } catch (error) {
            console.error('Error fetching Inventory Valuation:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (type) => {
        window.open(`http://localhost:5001/api/financial-reports/inventory-valuation?export_type=${type}`);
    };

    if (!data) return <p>Loading...</p>;

    return (
        <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h2>Current Inventory Valuation</h2>
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                    <button onClick={() => handleExport('excel')} className="btn" style={{ background: '#10b981', color: 'white' }}>
                        <Download size={16} /> Excel
                    </button>
                    <button onClick={() => handleExport('pdf')} className="btn" style={{ background: '#ef4444', color: 'white' }}>
                        <FileText size={16} /> PDF
                    </button>
                </div>
            </div>

            <div className="card" style={{ background: '#f8fafc', marginBottom: '2rem', textAlign: 'center' }}>
                <div style={{ color: '#64748b', fontSize: '1.2rem' }}>Total Stock Value (at Purchase Price)</div>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#0f172a' }}>
                    ₹{data.total_stock_value.toLocaleString()}
                </div>
            </div>

            <div className="card">
                <h3>Valuation by Category</h3>
                <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: '0.5rem' }}>Category</th>
                            <th style={{ padding: '0.5rem' }}>Total Quantity</th>
                            <th style={{ padding: '0.5rem' }}>Total Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(data.valuation_by_category || {}).map(([cat, info]) => (
                            <tr key={cat} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.5rem' }}>{cat}</td>
                                <td style={{ padding: '0.5rem' }}>{info.quantity}</td>
                                <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>₹{info.value.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default InventoryValuationView;
