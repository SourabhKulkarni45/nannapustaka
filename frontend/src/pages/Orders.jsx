import React, { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

export default function Orders() {
    const { user, token } = useContext(StoreContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/user/${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                // Sort orders by date (newest first)
                const sorted = Array.isArray(data) ? data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)) : [];
                setOrders(sorted);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [user, token, navigate]);

    if (loading) return <div className="container glass"><h2>Loading your orders...</h2></div>;

    return (
        <div className="container glass" style={{ maxWidth: '900px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ margin: 0 }}>My Orders</h2>
                <button className="secondary" onClick={() => navigate('/')}>Continue Shopping</button>
            </div>

            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-color)', borderRadius: '15px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📦</div>
                    <h3>No orders yet</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Looks like you haven't placed any orders yet. Start exploring our library!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {orders.map(order => (
                        <div key={order.id} className="order-card" style={{
                            background: '#fff',
                            borderRadius: '15px',
                            padding: '25px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                            border: '1px solid var(--border-color)',
                            transition: 'transform 0.3s ease'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '15px' }}>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tracking Number</div>
                                    <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>#{order.trackingNumber}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Status</div>
                                    <div style={{ 
                                        fontWeight: 'bold', 
                                        color: order.status === 'DELIVERED' ? 'var(--secondary-color)' : order.status === 'SHIPPED' ? '#f59e0b' : 'var(--primary-color)'
                                    }}>
                                        {order.status}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {order.items && order.items.map((item, idx) => (
                                    <div key={idx} className="order-item-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                            <div style={{ background: 'var(--bg-color)', padding: '5px 10px', borderRadius: '8px', fontWeight: 'bold' }}>x{item.quantity}</div>
                                            <div style={{ fontWeight: '500' }}>{item.bookTitle}</div>
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)' }}>₹{(item.price * item.quantity).toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="order-footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed var(--border-color)' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    Ordered on: {new Date(order.orderDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                                    Total: ₹{order.totalAmount.toFixed(2)}
                                </div>
                            </div>
                            
                            {order.paymentMode && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '10px' }}>
                                    Paid via: {order.paymentMode} {order.transactionId ? `(ID: ${order.transactionId})` : ''}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
