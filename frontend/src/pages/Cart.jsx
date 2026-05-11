import React, { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
    const { cart, removeFromCart } = useContext(StoreContext);
    const navigate = useNavigate();

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <div className="container glass">
            <h2>Your Shopping Cart</h2>
            {cart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <>
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Book Title</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map(item => (
                                <tr key={item.bookId}>
                                    <td>{item.bookTitle}</td>
                                    <td>₹{item.price.toFixed(2)}</td>
                                    <td>{item.quantity}</td>
                                    <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                                    <td><button className="secondary" onClick={() => removeFromCart(item.bookId)}>Remove</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <h3>Total Amount: ₹{total.toFixed(2)}</h3>
                    <button onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
                </div>
                </>
            )}
        </div>
    );
}
