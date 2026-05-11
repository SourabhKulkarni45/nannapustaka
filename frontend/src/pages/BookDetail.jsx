import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';

function StarRating({ rating, onRate, interactive = false }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div style={{ display: 'flex', gap: '2px', cursor: interactive ? 'pointer' : 'default' }}>
            {[1, 2, 3, 4, 5].map(star => (
                <span
                    key={star}
                    onClick={() => interactive && onRate(star)}
                    onMouseEnter={() => interactive && setHovered(star)}
                    onMouseLeave={() => interactive && setHovered(0)}
                    style={{
                        fontSize: interactive ? '2rem' : '1.2rem',
                        color: star <= (hovered || rating) ? '#ffc107' : '#d1d5db',
                        transition: 'color 0.15s, transform 0.15s',
                        transform: interactive && star <= hovered ? 'scale(1.2)' : 'scale(1)',
                    }}
                >
                    ★
                </span>
            ))}
        </div>
    );
}

export default function BookDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, user, showPopup, wishlist, toggleWishlist, token } = useContext(StoreContext);

    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [hasPurchased, setHasPurchased] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/books/${id}`)
            .then(res => res.json())
            .then(data => { setBook(data); setLoading(false); })
            .catch(() => setLoading(false));

        fetchReviews();
    }, [id]);

    useEffect(() => {
        if (user && id && token) {
            fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/user/${user.id}/purchased/${parseInt(id)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setHasPurchased(!!data))
                .catch(() => setHasPurchased(false));
        }
    }, [user, id, token]);

    const fetchReviews = () => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews/book/${id}`)
            .then(res => res.json())
            .then(data => setReviews(data))
            .catch(() => {});
    };

    const handleSubmitReview = async () => {
        if (!user) { navigate('/login'); return; }
        if (newRating === 0) { showPopup('Please select a star rating ⭐'); return; }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ bookId: parseInt(id), username: user.username, rating: newRating, comment: newComment })
            });
            if (res.ok) {
                showPopup('Review submitted successfully! ✅');
                fetchReviews();
                setShowReviewForm(false);
                setNewRating(0);
                setNewComment('');
            } else {
                const err = await res.text();
                showPopup(err || 'Could not submit review ❌');
            }
        } catch {
            showPopup('Server error ⚠️');
        }
    };

    const handleAddToCart = () => {
        if (!user) { navigate('/login'); return; }
        addToCart(book);
        showPopup(`${book.title} added to cart! 🛒`);
    };

    const handleBuyNow = () => {
        if (!user) { navigate('/login'); return; }
        addToCart(book);
        navigate('/checkout');
    };

    const alreadyReviewed = reviews.some(r => r.username === user?.username);
    const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

    if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}><h2>Loading...</h2></div>;
    if (!book) return <div style={{ textAlign: 'center', padding: '60px' }}><h2>Book not found</h2><button onClick={() => navigate('/')}>Go Back</button></div>;

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '30px 20px' }}>
            {/* Back Button */}
            <button
                onClick={() => navigate('/')}
                style={{
                    background: 'transparent', border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)', padding: '8px 20px', borderRadius: '20px',
                    fontSize: '0.9rem', marginBottom: '20px'
                }}
            >
                ← Back to Books
            </button>

            {/* Main Content */}
            <div className="glass book-detail-main" style={{ display: 'flex', gap: '40px', padding: '40px', flexWrap: 'wrap' }}>
                {/* Book Image */}
                <div className="book-detail-image" style={{ flex: '0 0 320px' }}>
                    <img
                        src={book.imageUrl || 'https://placehold.co/320x450?text=No+Cover'}
                        alt={book.title}
                        onError={(e) => { e.target.src = 'https://placehold.co/320x450?text=No+Cover'; }}
                        style={{
                            width: '100%', height: '450px', objectFit: 'cover',
                            borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                        }}
                    />
                </div>

                {/* Book Info */}
                <div className="book-detail-info" style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{ margin: '0 0 5px', fontSize: '2rem', color: 'var(--text-primary)' }}>{book.title}</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: '0 0 15px' }}>by <strong style={{ color: 'var(--primary-color)' }}>{book.author}</strong></p>
                        </div>
                        <button
                            onClick={() => toggleWishlist(book.id)}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                borderRadius: '50%',
                                width: '50px',
                                height: '50px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '1.8rem',
                                transition: 'all 0.3s',
                                color: wishlist.includes(book.id) ? '#ff4d4d' : 'var(--text-secondary)',
                                borderColor: wishlist.includes(book.id) ? '#ff4d4d' : 'var(--border-color)',
                                boxShadow: wishlist.includes(book.id) ? '0 4px 15px rgba(255, 77, 77, 0.2)' : 'none'
                            }}
                            title={wishlist.includes(book.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                            {wishlist.includes(book.id) ? '❤️' : '♡'}
                        </button>
                    </div>

                    {/* Rating Summary */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <StarRating rating={Math.round(avgRating)} />
                        <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                            {avgRating > 0 ? `${avgRating.toFixed(1)} out of 5` : 'No ratings yet'} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                        </span>
                    </div>

                    {/* Details Table */}
                    <div className="details-grid" style={{
                        background: 'var(--bg-color)', borderRadius: '12px', padding: '20px',
                        marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'
                    }}>
                        <div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Category</span>
                            <p style={{ margin: '4px 0 0', fontWeight: '600' }}>{book.category || 'General'}</p>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Edition</span>
                            <p style={{ margin: '4px 0 0', fontWeight: '600' }}>{book.edition || 'First Edition'}</p>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Published Year</span>
                            <p style={{ margin: '4px 0 0', fontWeight: '600' }}>{book.publishedYear || 'N/A'}</p>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Availability</span>
                            <p style={{
                                margin: '4px 0 0', fontWeight: '700',
                                color: book.stock > 0 ? 'var(--secondary-color)' : 'var(--error-color)'
                            }}>
                                {book.stock > 0 ? (user?.role === 'ADMIN' ? `In Stock (${book.stock})` : 'In Stock') : 'Out of Stock'}
                            </p>
                        </div>
                    </div>

                    {/* Price */}
                    <p style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--secondary-color)', margin: '0 0 10px' }}>
                        ₹{book.price?.toFixed(2)}
                    </p>

                    {/* Description */}
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', margin: '0 0 25px' }}>{book.description}</p>

                    {/* Action Buttons */}
                    {(!user || user.role !== 'ADMIN') && (
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                disabled={book.stock <= 0}
                                style={{ flex: 1, padding: '14px', fontSize: '1rem', opacity: book.stock <= 0 ? 0.5 : 1 }}
                                onClick={handleAddToCart}
                            >
                                {book.stock <= 0 ? 'Out of Stock' : '🛒 Add to Cart'}
                            </button>
                            {book.stock > 0 && (
                                <button className="secondary" style={{ flex: 1, padding: '14px', fontSize: '1rem' }} onClick={handleBuyNow}>
                                    ⚡ Buy Now
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews Section */}
            <div className="glass" style={{ marginTop: '30px', padding: '35px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                    <h2 style={{ margin: 0, border: 'none', padding: 0 }}>Customer Reviews ({reviews.length})</h2>
                    {user && user.role !== 'ADMIN' && !alreadyReviewed && hasPurchased && (
                        <button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            style={{ padding: '10px 24px', fontSize: '0.95rem', borderRadius: '25px' }}
                        >
                            ✍️ Write a Review
                        </button>
                    )}
                    {user && user.role !== 'ADMIN' && !alreadyReviewed && !hasPurchased && (
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>🛒 Purchase this book to write a review</span>
                    )}
                    {alreadyReviewed && (
                        <span style={{ fontSize: '0.9rem', color: 'var(--secondary-color)' }}>✅ You've already reviewed this book</span>
                    )}
                </div>

                {/* Review Form */}
                {showReviewForm && (
                    <div style={{
                        background: 'var(--bg-color)', borderRadius: '12px', padding: '25px',
                        marginBottom: '25px', animation: 'popupEntrance 0.3s ease'
                    }}>
                        <h3 style={{ margin: '0 0 15px' }}>Your Rating</h3>
                        <StarRating rating={newRating} onRate={setNewRating} interactive={true} />
                        <textarea
                            placeholder="Share your thoughts about this book..."
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            rows={4}
                            style={{ marginTop: '15px', resize: 'vertical', fontSize: '1rem' }}
                        />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                            <button onClick={handleSubmitReview} style={{ padding: '12px 30px' }}>Submit Review</button>
                            <button className="secondary" onClick={() => { setShowReviewForm(false); setNewRating(0); setNewComment(''); }} style={{ padding: '12px 20px' }}>Cancel</button>
                        </div>
                    </div>
                )}

                {/* Review List */}
                {reviews.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '30px 0' }}>No reviews yet. Be the first to review this book!</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {reviews.map(review => (
                            <div key={review.id} style={{
                                padding: '20px 0',
                                borderBottom: '1px solid var(--border-color)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '38px', height: '38px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, var(--primary-color), #868CFF)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', fontWeight: '700', fontSize: '0.95rem'
                                        }}>
                                            {review.username.charAt(0).toUpperCase()}
                                        </div>
                                        <strong style={{ color: 'var(--text-primary)' }}>{review.username}</strong>
                                    </div>
                                    <StarRating rating={review.rating} />
                                </div>
                                {review.comment && (
                                    <p style={{ margin: '0 0 0 48px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                        {review.comment}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
