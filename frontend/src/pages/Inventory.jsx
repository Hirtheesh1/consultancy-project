import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        part_number: '',
        description: '',
        categoryId: 1, // Default to first logic or fetch cats
        brandId: 1,
        purchase_price: '',
        selling_price: '',
        stock_quantity: '',
        model_application: '',
        position: '',
        specification: ''
    });

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        fetchProducts();
    }, [page, search, selectedCategory]); // Debounce search in real app

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/products/categories');
            setCategories(res.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/products?page=${page}&limit=50&search=${search}&categoryId=${selectedCategory}`);
            setProducts(res.data.products);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, formData);
            } else {
                await api.post('/products', formData);
            }
            setIsModalOpen(false);
            setEditingProduct(null);
            fetchProducts();
            resetForm();
        } catch (error) {
            alert(error.response?.data?.error || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts(); // Refresh list
            } catch (error) {
                console.error("Delete failed", error);
                alert(error.response?.data?.error || 'Failed to delete product. It might be linked to existing records.');
            }
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            part_number: product.part_number,
            description: product.description,
            categoryId: product.categoryId,
            brandId: product.brandId,
            purchase_price: product.purchase_price,
            selling_price: product.selling_price,
            stock_quantity: product.stock_quantity,
            model_application: product.model_application || '',
            position: product.position || '',
            specification: product.specification || ''
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            part_number: '', description: '',
            categoryId: categories.length > 0 ? categories[0].id : 1,
            brandId: 1,
            purchase_price: '', selling_price: '', stock_quantity: '',
            model_application: '', position: '', specification: ''
        });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Inventory Management</h1>
                <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
                    <Plus size={18} /> Add Product
                </button>
            </div>

            <div className="card" style={{ marginBottom: '1rem', padding: '1rem', display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                    <Search size={20} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search by Part Number, Description..."
                        className="input"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ border: 'none', fontSize: '1rem', width: '100%' }}
                    />
                </div>
                <div style={{ minWidth: '200px' }}>
                    <select
                        className="input"
                        value={selectedCategory}
                        onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                        style={{ width: '100%' }}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="card table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Part Number</th>
                            <th>Description</th>
                            <th>Model</th>
                            <th>Stock</th>
                            <th>Price (Buy)</th>
                            <th>Price (Sell)</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading...</td></tr>
                        ) : products.map((product) => (
                            <tr key={product.id}>
                                <td style={{ fontWeight: '500' }}>{product.part_number}</td>
                                <td>
                                    <div>{product.description}</div>
                                    <small style={{ color: '#64748b' }}>{product.position} {product.specification}</small>
                                </td>
                                <td>{product.model_application || '-'}</td>
                                <td>
                                    <span className={`badge ${product.stock_quantity <= product.reorder_level ? 'badge-slow' : 'badge-fast'}`}>
                                        {product.stock_quantity}
                                    </span>
                                </td>
                                <td>₹{product.purchase_price}</td>
                                <td>₹{product.selling_price}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn" style={{ padding: '0.25rem', color: 'var(--accent)' }} onClick={() => handleEdit(product)}>
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            className="btn"
                                            style={{ padding: '0.25rem', color: '#ef4444' }}
                                            onClick={() => handleDelete(product.id)}
                                            title="Delete Product"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                <button className="btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <ArrowLeft size={16} /> Prev
                </button>
                <span>Page {page} of {totalPages}</span>
                <button className="btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                    Next <ArrowRight size={16} />
                </button>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProduct ? "Edit Product" : "Add New Product"}
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label>Part Number</label>
                        <input required className="input" value={formData.part_number} onChange={e => setFormData({ ...formData, part_number: e.target.value })} />
                    </div>
                    <div>
                        <label>Category</label>
                        <select
                            className="input"
                            style={{ width: '100%' }}
                            value={formData.categoryId}
                            onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Description</label>
                        <input required className="input" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div>
                        <label>Model Application</label>
                        <input className="input" placeholder="e.g. JCB 3DX, Tata 1613" value={formData.model_application} onChange={e => setFormData({ ...formData, model_application: e.target.value })} />
                    </div>
                    <div className="grid-2">
                        <div>
                            <label>Position</label>
                            <input className="input" placeholder="e.g. Front, Rear" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} />
                        </div>
                        <div>
                            <label>Specification/Dimensions</label>
                            <input className="input" placeholder="e.g. 60x6 mm" value={formData.specification} onChange={e => setFormData({ ...formData, specification: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid-2">
                        <div>
                            <label>Purchase Price</label>
                            <input type="number" required className="input" value={formData.purchase_price} onChange={e => setFormData({ ...formData, purchase_price: e.target.value })} />
                        </div>
                        <div>
                            <label>Selling Price</label>
                            <input type="number" required className="input" value={formData.selling_price} onChange={e => setFormData({ ...formData, selling_price: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label>Initial Stock</label>
                        <input type="number" required className="input" value={formData.stock_quantity} onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })} />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        {editingProduct ? 'Update Product' : 'Create Product'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Inventory;
