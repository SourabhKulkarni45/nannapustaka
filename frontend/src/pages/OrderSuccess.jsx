import React from 'react';
import { useNavigate } from 'react-router-dom';

const Confetti = () => {
    const emojis = ['📚', '✨', '🎉', '📖', '❤️', '🔖'];
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
            {[...Array(25)].map((_, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    top: '-50px',
                    left: `${Math.random() * 100}%`,
                    fontSize: `${Math.random() * 20 + 20}px`,
                    animation: `fall ${Math.random() * 3 + 4}s linear infinite`,
                    animationDelay: `${Math.random() * 2}s`,
                    opacity: 0.7
                }}>
                    {emojis[Math.floor(Math.random() * emojis.length)]}
                </div>
            ))}
        </div>
    );
};

export default function OrderSuccess() {
    const navigate = useNavigate();

    return (
        <div style={{ position: 'relative', overflow: 'hidden', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
            <Confetti />
            <div className="container glass" style={{ maxWidth: '600px', textAlign: 'center', padding: '60px 40px', position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '5rem', marginBottom: '20px', animation: 'popupEntrance 0.5s ease' }}>🎉</div>
                <h1 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>Order Placed!</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '30px' }}>
                    Thank you for shopping with NannaPustaka. Your order has been confirmed and an invoice has been sent to your email.
                </p>
                
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button onClick={() => navigate('/orders')}>View My Orders</button>
                    <button className="secondary" onClick={() => navigate('/')}>Back to Shop</button>
                </div>
            </div>
        </div>
    );
}
