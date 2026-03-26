import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, FileText, Settings as SettingsIcon, BarChart2, PlusSquare, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const { logout } = useAuth();

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <div className="sidebar no-print" style={{
            width: '250px',
            height: '100vh',
            background: '#0f172a',
            color: 'white',
            position: 'fixed',
            left: 0,
            top: 0,
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ padding: '1rem 0', marginBottom: '2rem', borderBottom: '1px solid #1e293b' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#38bdf8' }}>AutoParts Pro</h1>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Management System</p>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/" className={`nav-item ${isActive('/')}`}>
                    <LayoutDashboard size={20} /> Dashboard
                </Link>
                <Link to="/billing" className={`nav-item ${isActive('/billing')}`}>
                    <ShoppingCart size={20} /> Billing
                </Link>
                <Link to="/products" className={`nav-item ${isActive('/products')}`}>
                    <Package size={20} /> Inventory
                </Link>
                <Link to="/sales-history" className={`nav-item ${isActive('/sales-history')}`}>
                    <FileText size={20} /> Sales History
                </Link>
                <Link to="/purchase" className={`nav-item ${isActive('/purchase')}`}>
                    <PlusSquare size={20} /> Purchase Entry
                </Link>
                <Link to="/customers" className={`nav-item ${isActive('/customers')}`}>
                    <Users size={20} /> Customers
                </Link>
                <Link to="/reports" className={`nav-item ${isActive('/reports')}`}>
                    <BarChart2 size={20} /> Reports
                </Link>
                <Link to="/settings" className={`nav-item ${isActive('/settings')}`}>
                    <SettingsIcon size={20} /> Settings
                </Link>
                <button onClick={logout} className="nav-item" style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', marginTop: '1rem', color: '#ef4444' }}>
                    <LogOut size={20} /> Logout
                </button>
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #1e293b', fontSize: '0.8rem', color: '#64748b' }}>
                <p>&copy; 2026 AutoParts Pro</p>
            </div>

            <style>{`
                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    color: #cbd5e1;
                    text-decoration: none;
                    border-radius: 0.5rem;
                    transition: all 0.2s;
                }
                .nav-item:hover {
                    background: #1e293b;
                    color: white;
                }
                .nav-item.active {
                    background: #2563eb;
                    color: white;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
};

export default Sidebar;
