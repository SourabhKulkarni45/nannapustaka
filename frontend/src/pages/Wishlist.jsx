import React, { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

export default function Wishlist() {
    const { wishlist, toggleWishlist, user, addToCart, showPopup } = useContext(StoreContext);
    const [wishlistBooks, setWishlistBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (wishlist.length > 0) {
            fetch(`${import.meta.env.VITE_API_BASE_URL}/api/books`)
                .then(res => res.json())
                .then(data => {
                    const filtered = data.filter(book => wishlist.includes(book.id));
                    setWishlistBooks(filtered);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        } else {
            setWishlistBooks([]);
            setLoading(false);
        }
    }, [wishlist]);

    const handleAddToCart = (book) => {
        addToCart(book);
        showPopup(`${book.title} added to cart! 🛒`);
    };

    if (!user) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                <h2 style={{ color: 'var(--text-primary)' }}>Please login to see your wishlist! 🔐</h2>
                <button onClick={() => navigate('/login')} style={{ marginTop: '20px', padding: '12px 30px' }}>Go to Login</button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
                <h1 style={{ margin: 0, fontSize: '2.5rem', background: 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    My Wishlist
                </h1>
                <span style={{ fontSize: '2rem' }}>❤️</span>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <div className="loader"></div>
                    <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Loading your favorites...</p>
                </div>
            ) : wishlistBooks.length === 0 ? (
                <div className="glass" style={{ textAlign: 'center', padding: '80px 40px', borderRadius: '30px', border: '1px dashed var(--border-color)' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '20px' }}>📚</div>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>Your wishlist is empty</h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '30px' }}>Start adding books you love to your personal collection!</p>
                    <button onClick={() => navigate('/')} style={{ padding: '12px 40px', fontSize: '1.1rem', borderRadius: '30px' }}>
                        Browse Masterpieces
                    </button>
                </div>
            ) : (
                <div className="book-grid">
                    {wishlistBooks.map(book => (
                        <div key={book.id} className="glass book-card" style={{ animation: 'popupEntrance 0.5s ease backwards' }}>
                            <div style={{ position: 'relative' }}>
                                <img 
                                    src={book.imageUrl || 'https://placehold.co/200x300?text=No+Cover'} 
                                    alt={book.title} 
                                    onClick={() => navigate(`/book/${book.id}`)} 
                                    style={{ cursor: 'pointer' }} 
                                    onError={(e) => { e.target.src = 'https://placehold.co/200x300?text=No+Cover' }}
                                />
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleWishlist(book.id); }}
                                    style={{
                                        position: 'absolute', top: '10px', right: '10px',
                                        background: 'rgba(255, 255, 255, 0.9)', border: 'none',
                                        borderRadius: '50%', width: '40px', height: '40px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', fontSize: '1.3rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                        transition: 'transform 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                    title="Remove from Wishlist"
                                >
                                    ❤️
                                </button>
                            </div>
                            <h3 onClick={() => navigate(`/book/${book.id}`)} style={{ cursor: 'pointer', marginTop: '15px' }}>{book.title}</h3>
                            <p className="author">by {book.author}</p>
                            <p className="price" style={{ fontSize: '1.4rem', margin: '10px 0' }}>₹{book.price?.toFixed(2)}</p>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
                                <button style={{ flex: 1, padding: '10px' }} onClick={() => handleAddToCart(book)}>
                                    🛒 Add to Cart
                                </button>
                                <button className="secondary" style={{ padding: '10px 20px' }} onClick={() => navigate(`/book/${book.id}`)}>
                                    View
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
