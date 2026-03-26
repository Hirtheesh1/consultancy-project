import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Download, FileText } from 'lucide-react';

const ProfitLossView = () => {
    const [year, setYear] = useState('2025-2026');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [year]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/financial-reports/profit-and-loss?year=${year}`);
            setData(res.data);
        } catch (error) {
            console.error('Error fetching PnL:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (type) => {
        window.open(`http://localhost:5001/api/financial-reports/profit-and-loss?year=${year}&export_type=${type}`);
    };

    if (!data) return <p>Loading...</p>;

    return (
        <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <select className="input" value={year} onChange={e => setYear(e.target.value)}>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                </select>

                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                    <button onClick={() => handleExport('excel')} className="btn" style={{ background: '#10b981', color: 'white' }}>
                        <Download size={16} /> Excel
                    </button>
                    <button onClick={() => handleExport('pdf')} className="btn" style={{ background: '#ef4444', color: 'white' }}>
                        <FileText size={16} /> PDF
                    </button>
                </div>
            </div>

            <div className="card" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Profit & Loss Statement ({year})</h2>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span>Total Sales Revenue:</span>
                    <span style={{ fontWeight: 'bold' }}>₹{data.total_sales.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '2px solid #000' }}>
                    <span>Less: Total Purchases:</span>
                    <span style={{ fontWeight: 'bold', color: '#ef4444' }}>- ₹{data.total_purchases.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 0', background: '#f8fafc' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Gross Profit:</span>
                    <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: data.gross_profit >= 0 ? '#10b981' : '#ef4444' }}>
                        ₹{data.gross_profit.toLocaleString()}
                    </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '2px solid #000' }}>
                    <span>Less: Operating Expenses:</span>
                    <span style={{ fontWeight: 'bold', color: '#ef4444' }}>- ₹{data.expenses.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 0', background: '#e0f2fe' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.8rem', color: '#0369a1' }}>Net Profit:</span>
                    <span style={{ fontWeight: 'bold', fontSize: '1.8rem', color: data.net_profit >= 0 ? '#15803d' : '#b91c1c' }}>
                        ₹{data.net_profit.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
};
export default ProfitLossView;
