import { useState } from 'react';
import SalesReportView from '../components/reports/SalesReportView';
import PurchaseReportView from '../components/reports/PurchaseReportView';
import GSTReportView from '../components/reports/GSTReportView';
import ProfitLossView from '../components/reports/ProfitLossView';
import InventoryValuationView from '../components/reports/InventoryValuationView';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('sales');

    const tabs = [
        { id: 'sales', label: 'Sales Summary' },
        { id: 'purchase', label: 'Purchase Summary' },
        { id: 'gst', label: 'GST Summary' },
        { id: 'pnl', label: 'Profit & Loss' },
        { id: 'inventory', label: 'Inventory Valuation' }
    ];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Financial Reports</h1>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem', overflowX: 'auto' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '1rem 1.5rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                            color: activeTab === tab.id ? '#3b82f6' : '#64748b',
                            fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'sales' && <SalesReportView />}
                {activeTab === 'purchase' && <PurchaseReportView />}
                {activeTab === 'gst' && <GSTReportView />}
                {activeTab === 'pnl' && <ProfitLossView />}
                {activeTab === 'inventory' && <InventoryValuationView />}
            </div>
        </div>
    );
};

export default Reports;
