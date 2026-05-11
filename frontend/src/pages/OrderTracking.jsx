import React, { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

export default function OrderTracking() {
    const { user, token } = useContext(StoreContext);
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/user/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setOrders(data))
                .catch(console.error);
        }
    }, [user, navigate]);

    return (
        <div className="container glass">
            <h2>My Orders</h2>
            {orders.length === 0 ? <p>You have no orders yet.</p> : (
                <div style={{overflowX: 'auto'}}>
                    <table>
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Items</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td>{order.trackingNumber || order.id}</td>
                                    <td>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        <span style={{
                                            color: order.status==='DELIVERED' ? 'var(--secondary-color)' : 
                                                   order.status==='SHIPPED' ? 'orange' : 'white',
                                            fontWeight: 'bold'
                                        }}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <ul style={{margin:0, paddingLeft:'20px'}}>
                                            {order.items.map(item => (
                                                <li key={item.id}>{item.bookTitle} (x{item.quantity})</li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td>₹{(order.totalAmount ?? order.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) ?? 0).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
