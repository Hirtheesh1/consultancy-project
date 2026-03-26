import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { Search, ShoppingCart, Trash2, Printer, Sparkles } from 'lucide-react';

const Billing = () => {
    const navigate = useNavigate();
    const { cart, customer, setCustomer, addToCart, updateQuantity, removeFromCart, clearCart, totalAmount } = useCart();

    // State
    const [query, setQuery] = useState('');
    const [aiSearch, setAiSearch] = useState(false);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [taxRate, setTaxRate] = useState(18); // Default GST 18%
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    // Customer Search State
    const [customerQuery, setCustomerQuery] = useState('');
    const [customerResults, setCustomerResults] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Cash');

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/products/categories');
                setCategories(res.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Search Products
    useEffect(() => {
        if (query.length < 2 && !selectedCategory) {
            setResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await api.get(`/products?search=${query}&categoryId=${selectedCategory}&limit=5&ai_search=${aiSearch}`);
                setResults(res.data.products);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }, aiSearch ? 800 : 300); // Give AI a slightly longer debounce
        return () => clearTimeout(timer);
    }, [query, selectedCategory, aiSearch]);

    // Search Customers
    useEffect(() => {
        if (customerQuery.length < 2) {
            setCustomerResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                const res = await api.get(`/customers?search=${customerQuery}`);
                setCustomerResults(res.data);
            } catch (error) {
                console.error(error);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [customerQuery]);

    const selectCustomer = (cust) => {
        setSelectedCustomer(cust);
        setCustomer({
            name: cust.name,
            phone: cust.phone,
            vehicle_model: cust.vehicle_model || '',
            vehicle_number: cust.vehicle_number || ''
        });
        setCustomerQuery('');
        setCustomerResults([]);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return alert('Cart is empty');

        if (!customer.name || !customer.name.trim()) {
            return alert('Customer Name is required');
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!customer.phone || !customer.phone.trim()) {
            return alert('Customer Phone is required');
        }
        if (!phoneRegex.test(customer.phone)) {
            return alert('Please enter a valid 10-digit phone number');
        }

        if (paymentMethod === 'Credit' && !selectedCustomer) {
            return alert('Please select a registered customer for Credit sales');
        }

        if (!confirm('Confirm Checkout?')) return;

        try {
            const payload = {
                items: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
                customer_name: customer.name,
                customer_phone: customer.phone,
                vehicle_model: customer.vehicle_model,
                vehicle_number: customer.vehicle_number,
                tax_amount: (totalAmount * (taxRate / 100)).toFixed(2),
                gst_rate: taxRate,
                payment_method: paymentMethod,
                customerId: selectedCustomer ? selectedCustomer.id : null
            };

            const res = await api.post('/sales', payload);
            alert(`Sale Successful! Invoice: ${res.data.invoice_number}`);
            clearCart();
            setCustomer({ name: '', phone: '', vehicle_model: '', vehicle_number: '' });
            setSelectedCustomer(null);
            navigate(`/invoice/${res.data.id}`);
        } catch (error) {
            console.error('Checkout Error:', error);
            alert(error.response?.data?.error || error.message || 'Checkout Failed');
        }
    };

    return (
        <div className="grid-2">
            {/* Left: Product Search */}
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Start Billing</h1>

                <div className="card" style={{ marginBottom: '1rem', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <select
                            className="input"
                            style={{ width: '150px' }}
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <Search size={20} />
                        <input
                            className="input"
                            placeholder={aiSearch ? "Ask AI: 'Something to stop the car...'" : "Scan Part Number or Search..."}
                            autoFocus
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            style={{ 
                                borderColor: aiSearch ? '#8b5cf6' : '',
                                boxShadow: aiSearch ? '0 0 0 2px rgba(139, 92, 246, 0.2)' : ''
                            }}
                        />
                        <button 
                            className="btn" 
                            onClick={() => setAiSearch(!aiSearch)}
                            title="Toggle AI Semantic Search"
                            style={{ 
                                padding: '0.5rem', 
                                background: aiSearch ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' : '#e2e8f0',
                                color: aiSearch ? 'white' : '#64748b',
                                border: 'none',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <Sparkles size={20} />
                        </button>
                    </div>
                    {/* Search Results Dropdown */}
                    {results.length > 0 && (
                        <div style={{
                            position: 'absolute', top: '100%', left: 0, right: 0,
                            background: 'white', border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-lg)', zIndex: 10,
                            maxHeight: '300px', overflowY: 'auto'
                        }}>
                            {results.map(product => (
                                <div key={product.id}
                                    onClick={() => { addToCart(product); setQuery(''); setResults([]); }}
                                    style={{ padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                >
                                    <div style={{ fontWeight: 'bold' }}>{product.part_number}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{product.description}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                        <span>Stock: <b style={{ color: product.stock_quantity > 0 ? 'green' : 'red' }}>{product.stock_quantity}</b></span>
                                        <span>₹{product.selling_price}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="card">
                    <h3>Customer Details</h3>

                    {/* Customer Search */}
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Search Registered Customer</label>
                        <input
                            className="input"
                            placeholder="Type Name or Phone..."
                            value={customerQuery}
                            onChange={e => setCustomerQuery(e.target.value)}
                        />
                        {customerResults.length > 0 && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, right: 0,
                                background: 'white', border: '1px solid var(--border)',
                                boxShadow: 'var(--shadow-lg)', zIndex: 10,
                                maxHeight: '200px', overflowY: 'auto'
                            }}>
                                {customerResults.map(cust => (
                                    <div key={cust.id}
                                        onClick={() => selectCustomer(cust)}
                                        style={{ padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                    >
                                        <div style={{ fontWeight: 'bold' }}>{cust.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{cust.phone} | Due: ₹{cust.total_credit}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid-2">
                        <div>
                            <label>Name</label>
                            <input className="input" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} />
                        </div>
                        <div>
                            <label>Phone</label>
                            <input className="input" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} />
                        </div>
                        <div>
                            <label>Vehicle Model</label>
                            <input className="input" placeholder="e.g. Tata Ace" value={customer.vehicle_model || ''} onChange={e => setCustomer({ ...customer, vehicle_model: e.target.value })} />
                        </div>
                        <div>
                            <label>Vehicle Number</label>
                            <input className="input" placeholder="e.g. TN 01 AB 1234" value={customer.vehicle_number || ''} onChange={e => setCustomer({ ...customer, vehicle_number: e.target.value })} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Cart & Total */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShoppingCart /> Current Cart ({cart.length})
                </h2>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Total</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div>{item.part_number}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#666' }}>{item.description}</div>
                                    </td>
                                    <td>
                                        <input
                                            type="number" min="1"
                                            style={{ width: '50px' }}
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value), item.stock_quantity)}
                                        />
                                    </td>
                                    <td>₹{item.selling_price}</td>
                                    <td>₹{(item.selling_price * item.quantity).toFixed(2)}</td>
                                    <td>
                                        <button onClick={() => removeFromCart(item.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ borderTop: '2px dashed var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Payment Method:</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {['Cash', 'Online', 'Credit'].map(method => (
                                <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={method}
                                        checked={paymentMethod === method}
                                        onChange={e => setPaymentMethod(e.target.value)}
                                    />
                                    <span style={{
                                        fontWeight: method === 'Credit' ? 'bold' : 'normal',
                                        color: method === 'Credit' ? '#ef4444' : 'inherit'
                                    }}>
                                        {method}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Subtotal:</span>
                        <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>Tax:</span>
                            <select className="input" style={{ padding: '0.2rem', margin: 0 }} value={taxRate} onChange={e => setTaxRate(Number(e.target.value))}>
                                <option value={0}>0%</option>
                                <option value={5}>5%</option>
                                <option value={12}>12%</option>
                                <option value={18}>18%</option>
                                <option value={28}>28%</option>
                            </select>
                        </div>
                        <span>₹{(totalAmount * (taxRate / 100)).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold' }}>
                        <span>Grand Total:</span>
                        <span>₹{(totalAmount * (1 + taxRate / 100)).toFixed(2)}</span>
                    </div>

                    <button onClick={handleCheckout} className="btn" style={{ width: '100%', marginTop: '1rem', background: 'var(--success)', color: 'white', padding: '1rem', fontSize: '1.1rem' }}>
                        <Printer size={20} /> Complete Sale & Print
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Billing;
