import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, UserPlus, Users, ChevronRight, Trash } from 'lucide-react';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', vehicle_number: '', address: '' });

    useEffect(() => {
        fetchCustomers();
    }, [query]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/customers?search=${query}`);
            setCustomers(res.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newCustomer.name || !newCustomer.phone) return alert('Name and Phone are required');

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(newCustomer.phone)) {
            return alert('Please enter a valid 10-digit phone number');
        }

        try {
            await api.post('/customers', newCustomer);
            setShowModal(false);
            setNewCustomer({ name: '', phone: '', vehicle_number: '', address: '' });
            fetchCustomers();
            alert('Customer Created Successfully!');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to create customer');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
            try {
                await api.delete(`/customers/${id}`);
                fetchCustomers();
                alert('Customer Deleted Successfully');
            } catch (error) {
                console.error('Error deleting customer:', error);
                alert('Failed to delete customer');
            }
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Customer Management</h1>
                <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserPlus size={20} /> Add Customer
                </button>
            </div>

            {/* Search Bar */}
            <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Search size={20} color="#64748b" />
                <input
                    className="input"
                    placeholder="Search by Name, Phone, or Vehicle Number..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                />
            </div>

            {/* Customer List */}
            {loading ? <p>Loading customers...</p> : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Customer</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Contact</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Vehicle</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Udhaari / Credit</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                                        No customers found. Add one to get started!
                                    </td>
                                </tr>
                            ) : customers.map(customer => (
                                <tr key={customer.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: '600' }}>{customer.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>ID: #{customer.id}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div>{customer.phone}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{customer.address || '-'}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{customer.vehicle_number || '-'}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <span style={{
                                            fontWeight: 'bold',
                                            color: customer.total_credit > 0 ? '#ef4444' : '#10b981',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            background: customer.total_credit > 0 ? '#fee2e2' : '#dcfce7'
                                        }}>
                                            ₹{parseFloat(customer.total_credit).toLocaleString()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <Link to={`/customers/${customer.id}`} className="btn" style={{ padding: '0.5rem', background: '#f1f5f9', color: '#0f172a' }}>
                                                <ChevronRight size={16} />
                                            </Link>
                                            <button
                                                className="btn"
                                                style={{ padding: '0.5rem', background: '#fee2e2', color: '#ef4444' }}
                                                onClick={() => handleDelete(customer.id)}
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Customer Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '400px', maxWidth: '90%' }}>
                        <h2>Add New Customer</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                            <input className="input" placeholder="Name *" value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} />
                            <input className="input" placeholder="Phone *" value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} />
                            <input className="input" placeholder="Vehicle Number" value={newCustomer.vehicle_number} onChange={e => setNewCustomer({ ...newCustomer, vehicle_number: e.target.value })} />
                            <textarea className="input" placeholder="Address" value={newCustomer.address} onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })} />

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCreate}>Save Customer</button>
                                <button className="btn" style={{ flex: 1, background: '#f1f5f9' }} onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
