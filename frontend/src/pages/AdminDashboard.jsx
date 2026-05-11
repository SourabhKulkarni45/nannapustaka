import React, { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
    const { user, token } = useContext(StoreContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [books, setBooks] = useState([]);
    const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'stock', or 'analytics'
    const [newBook, setNewBook] = useState({ title: '', author: '', category: 'Fiction', price: '', description: '', imageUrl: '', stock: 10, edition: '', publishedYear: '' });

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/');
        } else {
            fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setOrders(data))
                .catch(console.error);
            
            fetch(`${import.meta.env.VITE_API_BASE_URL}/api/books`)
                .then(res => res.json())
                .then(data => setBooks(data))
                .catch(console.error);
        }
    }, [user, navigate]);

    const handleAddBook = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/books`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newBook)
            });
            if (res.ok) {
                alert('Book added successfully');
                const addedBook = await res.json();
                setBooks([...books, addedBook]);
                setNewBook({ title: '', author: '', category: 'Fiction', price: '', description: '', imageUrl: '', stock: 10, edition: '', publishedYear: '' });
            }
        } catch (e) {
            alert('Error adding book');
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'text/plain',
                    'Authorization': `Bearer ${token}`
                },
                body: status
            });
            if (res.ok) {
                setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleUpdateStock = async (book, newStockVal) => {
        const stockInt = parseInt(newStockVal);
        if (isNaN(stockInt) || stockInt < 0) return;
        
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/books/${book.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({...book, stock: stockInt})
            });
            if (res.ok) {
                setBooks(books.map(b => b.id === book.id ? {...b, stock: stockInt} : b));
                alert('Stock updated!');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const tabStyle = (tabName) => ({
        padding: '12px 24px',
        cursor: 'pointer',
        fontWeight: '600',
        color: activeTab === tabName ? 'var(--primary-color)' : 'var(--text-secondary)',
        borderBottom: activeTab === tabName ? '3px solid var(--primary-color)' : '3px solid transparent',
        transition: 'all 0.3s ease',
        fontSize: '1.1rem'
    });

    const processAnalytics = () => {
        const monthlyMap = {};
        let totalRevenue = 0;
        let totalBooksSold = 0;
        const categoryMap = {};

        orders.forEach(order => {
            const date = order.orderDate ? new Date(order.orderDate) : new Date();
            const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            
            const amount = order.totalAmount ?? order.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) ?? 0;
            totalRevenue += amount;

            if (!monthlyMap[monthYear]) {
                monthlyMap[monthYear] = { name: monthYear, revenue: 0, units: 0 };
            }
            monthlyMap[monthYear].revenue += amount;

            if (order.items) {
                order.items.forEach(item => {
                    totalBooksSold += item.quantity;
                    const book = books.find(b => b.id === item.bookId);
                    const category = book?.category || 'General';
                    categoryMap[category] = (categoryMap[category] || 0) + item.quantity;
                    monthlyMap[monthYear].units += item.quantity;
                });
            }
        });

        const monthlyData = Object.values(monthlyMap).sort((a, b) => new Date(a.name) - new Date(b.name));
        const avgMonthlySales = monthlyData.length > 0 ? totalRevenue / monthlyData.length : 0;
        const categoryData = Object.keys(categoryMap).map(key => ({ name: key, value: categoryMap[key] }));

        return { monthlyData, categoryData, avgMonthlySales, totalRevenue, totalBooksSold };
    };

    const analytics = processAnalytics();
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    return (
        <div className="container glass" style={{maxWidth:'1100px', padding: '0'}}>
            <div style={{ padding: '30px 40px 10px' }}>
                <h2 style={{ margin: 0, border: 'none' }}>Admin Dashboard</h2>
                <p style={{ color: 'var(--text-secondary)', margin: '5px 0 20px' }}>Manage your bookstore operations</p>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', padding: '0 40px', gap: '30px' }}>
                <div style={tabStyle('orders')} onClick={() => setActiveTab('orders')}>📦 Order Requests</div>
                <div style={tabStyle('stock')} onClick={() => setActiveTab('stock')}>📚 Stock Management</div>
                <div style={tabStyle('analytics')} onClick={() => setActiveTab('analytics')}>📈 Analytics</div>
            </div>

            <div style={{ padding: '40px' }}>
                {activeTab === 'orders' && (
                    <div style={{ animation: 'popupEntrance 0.4s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h3 style={{ margin: 0 }}>Recent Orders</h3>
                            <span style={{ background: 'var(--bg-color)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '600' }}>
                                Total: {orders.length}
                            </span>
                        </div>
                        
                        {orders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-color)', borderRadius: '15px' }}>
                                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>No orders placed yet.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Date</th>
                                            <th>User ID</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order.id}>
                                                <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>#{order.trackingNumber || order.id}</code></td>
                                                <td>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}</td>
                                                <td>{order.userId}</td>
                                                <td>₹{(order.totalAmount ?? order.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) ?? 0).toFixed(2)}</td>
                                                <td>
                                                    <span style={{ 
                                                        color: order.status === 'DELIVERED' ? 'var(--secondary-color)' : order.status === 'SHIPPED' ? '#f59e0b' : 'var(--primary-color)',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {order.status === 'DELIVERED' ? (
                                                        <span style={{ color: 'var(--secondary-color)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            ✅ Delivered
                                                        </span>
                                                    ) : (
                                                        <select 
                                                            value={order.status} 
                                                            onChange={e => updateOrderStatus(order.id, e.target.value)} 
                                                            style={{padding:'8px', borderRadius:'8px', border: '1px solid var(--border-color)', outline: 'none', cursor: 'pointer'}}
                                                        >
                                                            <option value="PENDING">PENDING</option>
                                                            <option value="SHIPPED">SHIPPED</option>
                                                            <option value="DELIVERED">DELIVERED</option>
                                                        </select>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'stock' && (
                    <div style={{ animation: 'popupEntrance 0.4s ease' }}>
                        <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px', alignItems: 'start' }}>
                            {/* Inventory List */}
                            <div>
                                <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Current Inventory</h3>
                                {books.length === 0 ? <p>No books available.</p> : (
                                    <div className="table-responsive">
                                        <table>
                                            <thead>
                                                <tr><th>Title</th><th>Category</th><th>Stock</th><th>Action</th></tr>
                                            </thead>
                                            <tbody>
                                                {books.map(book => (
                                                    <tr key={book.id}>
                                                        <td><strong>{book.title}</strong></td>
                                                        <td><span style={{ fontSize: '0.85em', background: '#e2e8f0', padding: '3px 8px', borderRadius: '12px' }}>{book.category || 'General'}</span></td>
                                                        <td>
                                                            <span style={{ color: book.stock < 5 ? 'var(--error-color)' : 'inherit', fontWeight: 'bold' }}>
                                                                {book.stock || 0}
                                                            </span>
                                                        </td>
                                                        <td style={{display: 'flex', gap: '8px'}}>
                                                            <input 
                                                                type="number" 
                                                                defaultValue={book.stock || 0} 
                                                                id={`stock-${book.id}`} 
                                                                style={{width: '65px', padding: '6px'}}
                                                            />
                                                            <button 
                                                                className="secondary" 
                                                                onClick={() => handleUpdateStock(book, document.getElementById(`stock-${book.id}`).value)} 
                                                                style={{padding: '6px 12px', fontSize: '0.8rem'}}
                                                            >
                                                                Update
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Add New Book Form */}
                            <div className="admin-form-container" style={{ background: 'var(--bg-color)', padding: '25px', borderRadius: '15px' }}>
                                <h3 style={{ marginTop: 0 }}>Add New Book</h3>
                                <form onSubmit={handleAddBook} style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                                    <input placeholder="Title" value={newBook.title} onChange={e=>setNewBook({...newBook, title: e.target.value})} required/>
                                    <input placeholder="Author" value={newBook.author} onChange={e=>setNewBook({...newBook, author: e.target.value})} required/>
                                    <select value={newBook.category} onChange={e=>setNewBook({...newBook, category: e.target.value})} style={{padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', background: '#fff'}}>
                                        <option value="Fiction">Fiction</option>
                                        <option value="Science">Science</option>
                                        <option value="Technology">Technology</option>
                                        <option value="Business">Business</option>
                                        <option value="History">History</option>
                                        <option value="General">General</option>
                                    </select>
                                    <input placeholder="Price (₹)" type="number" step="0.01" value={newBook.price} onChange={e=>setNewBook({...newBook, price: e.target.value})} required/>
                                    <input placeholder="Stock Quantity" type="number" value={newBook.stock} onChange={e=>setNewBook({...newBook, stock: parseInt(e.target.value)})} required/>
                                    <textarea placeholder="Description" value={newBook.description} onChange={e=>setNewBook({...newBook, description: e.target.value})} required style={{ height: '80px' }}/>
                                    <input placeholder="Image URL" value={newBook.imageUrl} onChange={e=>setNewBook({...newBook, imageUrl: e.target.value})} required/>
                                    <button type="submit" style={{ marginTop: '5px' }}>✨ Add to Library</button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div style={{ animation: 'popupEntrance 0.4s ease' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                            <div style={{ background: 'var(--bg-color)', padding: '20px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ margin: '0 0 10px', color: 'var(--text-secondary)' }}>Total Revenue</h3>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>₹{analytics.totalRevenue.toFixed(2)}</div>
                            </div>
                            <div style={{ background: 'var(--bg-color)', padding: '20px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ margin: '0 0 10px', color: 'var(--text-secondary)' }}>Avg Monthly Sales</h3>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00C49F' }}>₹{analytics.avgMonthlySales.toFixed(2)}</div>
                            </div>
                            <div style={{ background: 'var(--bg-color)', padding: '20px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ margin: '0 0 10px', color: 'var(--text-secondary)' }}>Total Books Sold</h3>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FFBB28' }}>{analytics.totalBooksSold}</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                            <div style={{ background: 'var(--bg-color)', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ marginTop: 0, marginBottom: '20px', textAlign: 'center' }}>Monthly Revenue (Histogram)</h3>
                                <div style={{ height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics.monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
                                            <Legend />
                                            <Bar dataKey="revenue" name="Revenue (₹)" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div style={{ background: 'var(--bg-color)', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ marginTop: 0, marginBottom: '20px', textAlign: 'center' }}>Sales by Category (Pie Chart)</h3>
                                <div style={{ height: '300px' }}>
                                    {analytics.categoryData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={analytics.categoryData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                                    {analytics.categoryData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No category data available yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
