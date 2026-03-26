import { useState, useEffect } from 'react';
import api from '../services/api';
import {
    DollarSign, Package, AlertTriangle, ShoppingBag,
    TrendingUp, ArrowRight, Eye
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import AiInsightsWidget from '../components/AiInsightsWidget';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStockCount: 0,
        salesToday: 0,
        monthlyRevenue: 0,
        monthlyProfit: 0,
        gstPayable: 0,
        inventoryValue: 0
    });
    const [salesTrend, setSalesTrend] = useState([]);
    const [recentSales, setRecentSales] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeFrame, setTimeFrame] = useState('monthly');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, trendRes, recentRes, lowStockRes] = await Promise.all([
                    api.get('/reports/dashboard'),
                    api.get(`/reports/sales-trend?period=${timeFrame}`),
                    api.get('/reports/recent-sales'),
                    api.get('/reports/low-stock')
                ]);

                setStats(statsRes.data);
                setSalesTrend(trendRes.data);
                setRecentSales(recentRes.data);
                setLowStockItems(lowStockRes.data);
            } catch (error) {
                console.error('Error loading dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [timeFrame]);

    if (loading) return <div>Loading Dashboard...</div>;

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Dashboard</h1>

            <AiInsightsWidget />

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <KpiCard
                    title="Sales Today"
                    value={`₹${stats.salesToday.toLocaleString()}`}
                    icon={<DollarSign size={24} color="#10b981" />}
                    color="#d1fae5"
                />
                <KpiCard
                    title="Low Stock Items"
                    value={stats.lowStockCount}
                    icon={<AlertTriangle size={24} color="#ef4444" />}
                    color="#fee2e2"
                />
                <KpiCard
                    title="Total Products"
                    value={stats.totalProducts}
                    icon={<Package size={24} color="#3b82f6" />}
                    color="#dbeafe"
                />
                <KpiCard
                    title="Total Orders"
                    value={salesTrend.reduce((acc, curr) => acc + (curr.count || 0), 0) || '-'}
                    icon={<ShoppingBag size={24} color="#f59e0b" />}
                    color="#fef3c7"
                    subtext="This Month"
                />
                <KpiCard
                    title="Monthly Revenue"
                    value={`₹${(stats.monthlyRevenue || 0).toLocaleString()}`}
                    icon={<TrendingUp size={24} color="#059669" />}
                    color="#d1fae5"
                />
                <KpiCard
                    title="Monthly Profit"
                    value={`₹${(stats.monthlyProfit || 0).toLocaleString()}`}
                    icon={<DollarSign size={24} color="#2563eb" />}
                    color="#dbeafe"
                />
                <KpiCard
                    title="GST Payable"
                    value={`₹${(stats.gstPayable || 0).toLocaleString()}`}
                    icon={<AlertTriangle size={24} color="#d97706" />}
                    color="#fef3c7"
                />
                <KpiCard
                    title="Inventory Value"
                    value={`₹${(stats.inventoryValue || 0).toLocaleString()}`}
                    icon={<Package size={24} color="#7c3aed" />}
                    color="#ede9fe"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>

                {/* Sales Chart */}
                <div className="card" style={{ height: '400px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Sales Trend</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['daily', 'monthly', 'yearly'].map(period => (
                                <button
                                    key={period}
                                    onClick={() => setTimeFrame(period)}
                                    style={{
                                        padding: '0.25rem 0.75rem',
                                        fontSize: '0.8rem',
                                        borderRadius: '0.25rem',
                                        border: '1px solid #e2e8f0',
                                        background: timeFrame === period ? '#3b82f6' : 'white',
                                        color: timeFrame === period ? 'white' : '#64748b',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {period.charAt(0).toUpperCase() + period.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height="90%">
                        <LineChart data={salesTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']} />
                            <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Low Stock Alerts */}
                <div className="card">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Low Stock Alerts</h3>
                    {lowStockItems.length === 0 ? (
                        <p style={{ color: '#64748b' }}>No low stock items.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {lowStockItems.map(item => (
                                <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <div>
                                        <div style={{ fontWeight: '500' }}>{item.part_number}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.description}</div>
                                    </div>
                                    <div style={{ color: '#ef4444', fontWeight: 'bold' }}>
                                        {item.stock_quantity} left
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    <button
                        onClick={() => navigate('/inventory')}
                        style={{ width: '100%', marginTop: '1rem', padding: '0.5rem', background: 'none', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', color: '#3b82f6' }}
                    >
                        View Inventory
                    </button>
                </div>
            </div>

            {/* Recent Sales */}
            <div className="card" style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Recent Sales</h3>
                    <button
                        onClick={() => navigate('/sales')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}
                    >
                        View All <ArrowRight size={16} />
                    </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left', color: '#64748b' }}>
                            <th style={{ padding: '0.75rem' }}>Invoice</th>
                            <th style={{ padding: '0.75rem' }}>Date</th>
                            <th style={{ padding: '0.75rem' }}>Customer</th>
                            <th style={{ padding: '0.75rem' }}>Amount</th>
                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentSales.map(sale => (
                            <tr key={sale.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.75rem', fontWeight: '500' }}>{sale.invoice_number}</td>
                                <td style={{ padding: '0.75rem' }}>{new Date(sale.date).toLocaleDateString()}</td>
                                <td style={{ padding: '0.75rem' }}>{sale.customer_name || 'Walk-in'}</td>
                                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>₹{sale.grand_total.toLocaleString()}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                    <button
                                        onClick={() => navigate(`/invoice/${sale.id}`)}
                                        style={{ padding: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                                        title="View Invoice"
                                    >
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const KpiCard = ({ title, value, icon, color, subtext }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            backgroundColor: color, display: 'flex', alignItems: 'center',
            justifyContent: 'center'
        }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.25rem' }}>{title}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
            {subtext && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{subtext}</div>}
        </div>
    </div>
);

export default Dashboard;
