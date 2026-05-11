import React, { useContext, useState } from 'react';
import { StoreContext } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
    const { cart, user, clearCart, showPopup, token } = useContext(StoreContext);
    const [address, setAddress] = useState({
        houseNumber: '', houseName: '', landmark: '', city: '', state: '', pinCode: ''
    });
    const [paymentMode, setPaymentMode] = useState('COD');
    const [upiId, setUpiId] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const navigate = useNavigate();

    const handleAddressChange = (e) => {
        setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const deliveryCharge = paymentMode === 'COD' ? 49 : 0;
        const totalAmount = subtotal + deliveryCharge;

        let transactionId = null;

        if (paymentMode === 'UPI') {
            setIsProcessing(true);
            try {
                const paymentRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/upi/process`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ upiId, amount: totalAmount })
                });
                
                if (!paymentRes.ok) {
                    showPopup('Payment failed ❌');
                    setIsProcessing(false);
                    return;
                }
                
                const paymentData = await paymentRes.json();
                transactionId = paymentData.transactionId;
                
                // Show centered success modal
                setShowSuccessModal(true);
                await new Promise(resolve => setTimeout(resolve, 2000));
                setShowSuccessModal(false);
                
            } catch (err) {
                console.error(err);
                showPopup('Payment Server Error ⚠️');
                setIsProcessing(false);
                return;
            }
            setIsProcessing(false);
        } else if (paymentMode === 'Razorpay') {
            setIsProcessing(true);
            try {
                // 1. Create Order on Backend
                const orderRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/create-order`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ amount: totalAmount })
                });

                if (!orderRes.ok) {
                    showPopup('Failed to initialize Razorpay ❌');
                    setIsProcessing(false);
                    return;
                }

                const razorpayOrder = await orderRes.json();

                // 2. Open Razorpay Modal
                const options = {
                    key: razorpayOrder.keyId,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    name: "NannaPustaka",
                    description: "Book Purchase",
                    order_id: razorpayOrder.orderId,
                    handler: async function (response) {
                        // Payment Successful Callback
                        transactionId = response.razorpay_payment_id;
                        await finalizeOrder(transactionId);
                    },
                    prefill: {
                        name: `${user.firstName} ${user.lastName}`,
                        email: user.email,
                        contact: user.contactNumber
                    },
                    theme: {
                        color: "#6366f1"
                    },
                    modal: {
                        ondismiss: function() {
                            setIsProcessing(false);
                        }
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
                return; // Wait for handler to finalize

            } catch (err) {
                console.error(err);
                showPopup('Razorpay initialization error ⚠️');
                setIsProcessing(false);
                return;
            }
        }

        await finalizeOrder(transactionId);
    };

    const finalizeOrder = async (transactionId) => {
        const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const deliveryCharge = paymentMode === 'COD' ? 49 : 0;
        const totalAmount = subtotal + deliveryCharge;

        const orderData = {
            userId: user.id,
            status: 'ORDER CONFIRMED',
            address: address,
            paymentMode: paymentMode,
            upiId: paymentMode === 'UPI' ? upiId : null,
            transactionId: transactionId,
            subtotal: subtotal,
            deliveryCharge: deliveryCharge,
            totalAmount: totalAmount,
            items: cart.map(c => ({
                bookId: c.bookId,
                bookTitle: c.bookTitle,
                price: c.price,
                quantity: c.quantity
            }))
        };
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });
            if (res.ok) {
                showPopup('Order placed successfully! 🎉');
                clearCart();
                navigate('/orders');
            } else {
                showPopup('Checkout failed ❌');
            }
        } catch (e) {
            console.error(e);
            showPopup('Server Error ⚠️');
        } finally {
            setIsProcessing(false);
        }
    };

    if (cart.length === 0) return <div className="container glass"><h2>Cart is empty</h2></div>;

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryCharge = paymentMode === 'COD' ? 49 : 0;
    const totalAmount = subtotal + deliveryCharge;

    return (
        <>
        {showSuccessModal && (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                animation: 'fadeIn 0.3s'
            }}>
                <div style={{
                    background: '#fff', padding: '40px 60px', borderRadius: '15px',
                    textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    animation: 'popupEntrance 0.4s ease'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '10px' }}>✅</div>
                    <h2 style={{ margin: '0 0 10px 0', color: 'var(--primary-color)' }}>Payment Successful!</h2>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Processing your order...</p>
                </div>
            </div>
        )}
        <div className="container glass auth-form" style={{maxWidth: '600px'}}>
            <h2>Checkout</h2>
            <div style={{ background: 'var(--bg-color)', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                    <span style={{ fontWeight: '500' }}>₹{subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Delivery Charge:</span>
                    <span style={{ fontWeight: '500', color: deliveryCharge === 0 ? 'var(--secondary-color)' : 'inherit' }}>
                        {deliveryCharge > 0 ? `₹${deliveryCharge.toFixed(2)}` : 'FREE'}
                    </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    <span>Total to Pay:</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                </div>
            </div>
            <form onSubmit={handleCheckout} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                <div className="checkout-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <input type="text" name="houseNumber" placeholder="House Number" value={address.houseNumber} onChange={handleAddressChange} required />
                    <input type="text" name="houseName" placeholder="House/Building Name" value={address.houseName} onChange={handleAddressChange} required />
                </div>
                <input type="text" name="landmark" placeholder="Landmark" value={address.landmark} onChange={handleAddressChange} required />
                <div className="checkout-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                    <input type="text" name="city" placeholder="City" value={address.city} onChange={handleAddressChange} required />
                    <input type="text" name="state" placeholder="State" value={address.state} onChange={handleAddressChange} required />
                    <input type="text" name="pinCode" placeholder="Pin Code" value={address.pinCode} onChange={handleAddressChange} required />
                </div>
                
                <div style={{ marginTop: '5px', paddingTop: '10px' }}>
                    <h4 style={{ marginBottom: '10px' }}>Payment Mode</h4>
                    <div className="payment-options" style={{ display: 'flex', gap: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input 
                                type="radio" 
                                name="paymentMode" 
                                value="COD" 
                                checked={paymentMode === 'COD'} 
                                onChange={(e) => setPaymentMode(e.target.value)} 
                            /> Cash on Delivery
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input 
                                type="radio" 
                                name="paymentMode" 
                                value="UPI" 
                                checked={paymentMode === 'UPI'} 
                                onChange={(e) => setPaymentMode(e.target.value)} 
                            /> UPI
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input 
                                type="radio" 
                                name="paymentMode" 
                                value="Razorpay" 
                                checked={paymentMode === 'Razorpay'} 
                                onChange={(e) => setPaymentMode(e.target.value)} 
                            /> Razorpay
                        </label>
                    </div>
                    {paymentMode === 'UPI' && (
                        <input 
                            type="text" 
                            placeholder="Enter UPI ID (e.g., yourname@upi)" 
                            value={upiId} 
                            onChange={(e) => setUpiId(e.target.value)} 
                            required 
                            style={{ marginTop: '15px' }} 
                        />
                    )}
                </div>

                <button type="submit" disabled={isProcessing} style={{ marginTop: '10px', opacity: isProcessing ? 0.7 : 1 }}>
                    {isProcessing ? 'Processing Payment...' : `Confirm Order (${paymentMode})`}
                </button>
            </form>
        </div>
        </>
    );
}
