import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Save, Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RecentPurchases from '../components/RecentPurchases';

const Purchase = () => {
    const navigate = useNavigate();
    const [supplierName, setSupplierName] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [gstRate, setGstRate] = useState(18);

    const [searchTerm, setSearchTerm] = useState('');
    const [aiSearch, setAiSearch] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Search Products
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length > 1) {
                try {
                    const res = await api.get(`/products?search=${searchTerm}&ai_search=${aiSearch}`);
                    setSearchResults(res.data.products || []);
                } catch (error) {
                    console.error("Search error", error);
                }
            } else {
                setSearchResults([]);
            }
        }, aiSearch ? 800 : 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, aiSearch]);

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.product_id === product.id);
        if (existingItem) {
            alert('Item already in list');
            return;
        }
        setCart([...cart, {
            product_id: product.id,
            part_number: product.part_number,
            description: product.description,
            quantity: 1,
            unit_price: product.purchase_price || 0,
            selling_price: product.selling_price || 0
        }]);
        setSearchTerm('');
        setSearchResults([]);
    };

    const updateCartItem = (index, field, value) => {
        const newCart = [...cart];
        newCart[index][field] = value;
        setCart(newCart);
    };

    const removeCartItem = (index) => {
        setCart(cart.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return cart.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
    };

    const handleSubmit = async () => {
        if (!invoiceNumber || !supplierName || cart.length === 0) {
            alert('Please fill all details and add items.');
            return;
        }

        const finalRate = parseFloat(gstRate) || 0;
        for (const item of cart) {
            const minSellingPrice = item.unit_price + (item.unit_price * (finalRate / 100));
            if (item.selling_price < minSellingPrice) {
                alert(`Selling Price (₹${item.selling_price}) for ${item.part_number} cannot be lower than its Purchase Price incl. ${finalRate}% GST (₹${minSellingPrice.toFixed(2)})`);
                return; // Stop submission
            }
        }

        setLoading(true);
        try {
            await api.post('/purchases', {
                supplier_name: supplierName,
                invoice_number: invoiceNumber,
                purchase_date: purchaseDate,
                gst_rate: gstRate,
                items: cart
            });
            setInvoiceNumber('');
            setSupplierName('');
            setCart([]);
            setRefreshKey(prev => prev + 1); // Trigger RecentPurchases reload
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to save purchase.';
            console.error('Purchase Error:', error);
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h1>Purchase Entry</h1>

            <div className="card" style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                    <label>Supplier Name</label>
                    <input
                        className="input"
                        value={supplierName}
                        onChange={(e) => setSupplierName(e.target.value)}
                        placeholder="Enter Supplier Name"
                    />
                </div>
                <div className="form-group">
                    <label>Invoice Number</label>
                    <input
                        className="input"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        placeholder="Enter Invoice No"
                    />
                </div>
                <div className="form-group">
                    <label>Date</label>
                    <input
                        type="date"
                        className="input"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>GST Rate (%)</label>
                    <select className="input" value={gstRate} onChange={e => setGstRate(Number(e.target.value))}>
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                    </select>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ position: 'relative', flexGrow: 1 }}>
                        <Search style={{ position: 'absolute', top: '10px', left: '10px', color: '#888' }} size={20} />
                        <input
                            type="text"
                            placeholder={aiSearch ? "Ask AI: 'Something to stop the car...'" : "Search Product by Part No or Description..."}
                            className="input"
                            style={{ 
                                paddingLeft: '2.5rem',
                                width: '100%',
                                borderColor: aiSearch ? '#8b5cf6' : '',
                                boxShadow: aiSearch ? '0 0 0 2px rgba(139, 92, 246, 0.2)' : ''
                            }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        className="btn" 
                        onClick={() => setAiSearch(!aiSearch)}
                        title="Toggle AI Semantic Search"
                        style={{ 
                            padding: '0.64rem 1rem', 
                            background: aiSearch ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' : '#e2e8f0',
                            color: aiSearch ? 'white' : '#64748b',
                            border: 'none',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Sparkles size={20} />
                    </button>
                    {searchResults.length > 0 && (
                        <div style={{
                            position: 'absolute', top: '100%', left: 0, right: 0,
                            background: 'white', border: '1px solid #ddd', zIndex: 10,
                            maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            {searchResults.map(product => (
                                <div
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    style={{ padding: '0.75rem', borderBottom: '1px solid #eee', cursor: 'pointer' }}
                                    onMouseOver={(e) => e.target.style.background = '#f9f9f9'}
                                    onMouseOut={(e) => e.target.style.background = 'white'}
                                >
                                    <strong>{product.part_number}</strong> - {product.description}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {cart.length > 0 && (
                <div className="card">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                                <th style={{ padding: '0.75rem' }}>Part No</th>
                                <th style={{ padding: '0.75rem' }}>Description</th>
                                <th style={{ padding: '0.75rem', width: '100px' }}>Qty</th>
                                <th style={{ padding: '0.75rem', width: '150px' }}>Unit Price</th>
                                <th style={{ padding: '0.75rem', width: '150px' }}>Selling Price</th>
                                <th style={{ padding: '0.75rem' }}>Total</th>
                                <th style={{ padding: '0.75rem' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map((item, index) => (
                                <tr key={item.product_id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '0.75rem' }}>{item.part_number}</td>
                                    <td style={{ padding: '0.75rem' }}>{item.description}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <input
                                            type="number"
                                            className="input"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateCartItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                        />
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <input
                                            type="number"
                                            className="input"
                                            min="0"
                                            value={item.unit_price}
                                            onChange={(e) => updateCartItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                        />
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <input
                                            type="number"
                                            className="input"
                                            min="0"
                                            value={item.selling_price}
                                            onChange={(e) => updateCartItem(index, 'selling_price', parseFloat(e.target.value) || 0)}
                                        />
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>₹{(item.quantity * item.unit_price).toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <button
                                            onClick={() => removeCartItem(index)}
                                            style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'right', padding: '1rem', fontWeight: 'bold' }}>Sub Total:</td>
                                <td colSpan="2" style={{ padding: '1rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                    ₹{calculateTotal().toLocaleString()}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'right', padding: '1rem', fontWeight: 'bold' }}>GST ({gstRate}%):</td>
                                <td colSpan="2" style={{ padding: '1rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                    ₹{(calculateTotal() * (gstRate / 100)).toLocaleString()}
                                </td>
                            </tr>
                            <tr style={{ background: '#f8f9fa' }}>
                                <td colSpan="4" style={{ textAlign: 'right', padding: '1rem', fontWeight: 'bold' }}>Grand Total:</td>
                                <td colSpan="2" style={{ padding: '1rem', fontWeight: 'bold', fontSize: '1.2rem', color: '#16a34a' }}>
                                    ₹{(calculateTotal() * (1 + (gstRate / 100))).toLocaleString()}
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Save size={20} />
                            {loading ? 'Saving...' : 'Save Purchase'}
                        </button>
                    </div>
                </div>
            )}

            <RecentPurchases key={refreshKey} />
        </div>
    );
};

export default Purchase;
