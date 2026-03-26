import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Invoice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sale, setSale] = useState(null);
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [saleRes, shopRes] = await Promise.all([
                    api.get(`/sales/${id}`),
                    api.get('/settings')
                ]);
                setSale(saleRes.data);
                setShop(shopRes.data);
            } catch (error) {
                console.error('Invoice Fetch Error:', error);
                alert(`Error fetching invoice: ${error.response?.status} ${error.response?.statusText}`);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    if (loading) return <div>Loading Invoice...</div>;
    if (!sale) return <div>Invoice not found</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', background: 'white', padding: '2rem', border: '1px solid #ccc' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0, textTransform: 'uppercase' }}>{shop?.shop_name || 'HEAVY VEHICLE SPARES SHOP'}</h1>
                <p style={{ margin: '0.5rem 0' }}>{shop?.address || '123, Auto Market, Transport Nagar, City'}</p>
                <p>Ph: {shop?.phone || '9876543210'} {shop?.gstin ? `| GSTIN: ${shop.gstin}` : ''}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <h4>Invoice To:</h4>
                    <p><strong>{sale.customer_name || 'Cash Sale'}</strong></p>
                    <p>{sale.customer_phone && `Ph: ${sale.customer_phone}`}</p>
                    {sale.vehicle_model && <p><strong>Vehicle Model:</strong> {sale.vehicle_model}</p>}
                    {sale.vehicle_number && <p><strong>Vehicle Number:</strong> {sale.vehicle_number}</p>}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h4>Invoice Details:</h4>
                    <p>No: <strong>{sale.invoice_number}</strong></p>
                    <p>Date: {new Date(sale.date).toLocaleString()}</p>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #000' }}>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>#</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>Description</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Qty</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Unit Price</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {sale.SaleItems?.map((item, index) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '0.5rem' }}>{index + 1}</td>
                            <td style={{ padding: '0.5rem' }}>
                                {item.Product?.part_number} <br />
                                <small>{item.Product?.description}</small>
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>{item.quantity}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>{item.unit_price}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>{item.total_price}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <div style={{ minWidth: '200px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Sub Total:</span>
                        <span>₹{sale.sub_total}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Tax:</span>
                        <span>₹{sale.tax_amount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', borderTop: '2px solid #000', paddingTop: '0.5rem' }}>
                        <span>Grand Total:</span>
                        <span>₹{sale.grand_total}</span>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.8rem' }}>
                <p>Thank you for your business!</p>
                <button className="no-print btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => window.print()}>Print / Download PDF</button>
                <button className="no-print btn" style={{ marginTop: '1rem', marginLeft: '1rem' }} onClick={() => navigate('/billing')}>New Sale</button>
            </div>

            <style>{`
        @media print {
          .no-print { display: none; }
          body { background: white; }
          .container { margin: 0; padding: 0; }
        }
      `}</style>
        </div>
    );
};

export default Invoice;
