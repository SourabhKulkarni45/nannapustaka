import React, { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

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
                        fontSize: interactive ? '1.6rem' : '1rem',
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

export default function BookList() {
    const [books, setBooks] = useState([]);
    const { addToCart, user, showPopup, wishlist, toggleWishlist, token, searchQuery, selectedCategory } = useContext(StoreContext);
    const navigate = useNavigate();

    const quotes = [
        "\"ಎಲ್ಲಾದರು ಇರು ಎಂತಾದರು ಇರು, ಎಂದೆಂದಿಗೂ ನೀ ಕನ್ನಡವಾಗಿರು.\" - ಕುವೆಂಪು",
        "\"A room without books is like a body without a soul.\" - Cicero",
        "\"ನೀ ಹಿಂಗ ನೋಡಬ್ಯಾಡ ನನ್ನ, ನೀ ಹಿಂಗ ನೋಡಿದರೆ ಹಂಗ ಆಗತೈತಿ ನನಗ.\" - ದ.ರಾ.ಬೇಂದ್ರೆ",
        "\"There is no friend as loyal as a book.\" - Ernest Hemingway",
        "\"ಜೀವನ ಅಂದ್ರೆ ಇಷ್ಟೇ, ನಾವು ಅಂದುಕೊಂಡಿದ್ದಕ್ಕಿಂತ ಭಿನ್ನವಾಗಿರೋದೇ ಜೀವನ.\" - ರವಿ ಬೆಳಗೆರೆ",
        "\"So many books, so little time.\" - Frank Zappa",
        "\"ಬಾರಿಸು ಕನ್ನಡ ಡಿಂಡಿಮವ ಓ ಕರ್ನಾಟಕ ಹೃದಯ ಶಿವ.\" - ಕುವೆಂಪು",
        "\"A reader lives a thousand lives before he dies.\" - George R.R. Martin",
        "\"ಕುರುಡು ಕಾಂಚಾಣ ಕುಣಿಯುತಲಿದೆ, ಕಾಲಿಗೆ ಬಿದ್ದವರ ತುಳಿಯುತಲಿದೆ.\" - ದ.ರಾ.ಬೇಂದ್ರೆ",
        "\"That's the thing about books. They let you travel without moving your feet.\" - Jhumpa Lahiri",
        "\"Books are a uniquely portable magic.\" - Stephen King",
        "\"The more that you read, the more things you will know.\" - Dr. Seuss",
        "\"ಕನ್ನಡವೇ ಸತ್ಯ, ಕನ್ನಡವೇ ನಿತ್ಯ.\" - ಸಿದ್ದಲಿಂಗಯ್ಯ",
        "\"Good friends, good books, and a sleepy conscience: this is the ideal life.\" - Mark Twain"
    ];
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    // Review states
    const [reviews, setReviews] = useState({});
    const [openReviewBookId, setOpenReviewBookId] = useState(null);
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [purchasedBooks, setPurchasedBooks] = useState({});
    const [sortBy, setSortBy] = useState('default');
    const [surpriseBookId, setSurpriseBookId] = useState(null);

    const handleSurpriseMe = () => {
        if (books.length === 0) return;
        const randomIndex = Math.floor(Math.random() * books.length);
        const randomBook = books[randomIndex];
        setSurpriseBookId(randomBook.id);
        
        // Scroll to the book
        const element = document.getElementById(`book-${randomBook.id}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        showPopup(`🎲 Surprise! We recommend: ${randomBook.title}`);
        
        // Remove highlight after 3 seconds
        setTimeout(() => setSurpriseBookId(null), 3000);
    };

    useEffect(() => {
        const currentQuote = quotes[currentQuoteIndex];
        let timer;
        
        if (isDeleting) {
            timer = setTimeout(() => {
                setDisplayedText(currentQuote.substring(0, displayedText.length - 1));
                if (displayedText.length === 0) {
                    setIsDeleting(false);
                    setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
                }
            }, 30);
        } else {
            if (displayedText.length === currentQuote.length) {
                timer = setTimeout(() => setIsDeleting(true), 2500);
            } else {
                timer = setTimeout(() => {
                    setDisplayedText(currentQuote.substring(0, displayedText.length + 1));
                }, 80);
            }
        }
        return () => clearTimeout(timer);
    }, [displayedText, isDeleting, currentQuoteIndex]);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/books`)
            .then(res => res.json())
            .then(data => {
                setBooks(data);
                data.forEach(book => fetchReviews(book.id));
            })
            .catch(err => console.error("Error fetching books:", err));
    }, []);

    // Check which books the user has purchased
    useEffect(() => {
        if (user && books.length > 0 && token) {
            books.forEach(book => {
                fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/user/${user.id}/purchased/${book.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                    .then(res => res.json())
                    .then(data => setPurchasedBooks(prev => ({ ...prev, [book.id]: !!data })))
                    .catch(() => setPurchasedBooks(prev => ({ ...prev, [book.id]: false })));
            });
        }
    }, [user, books, token]);

    const fetchReviews = (bookId) => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews/book/${bookId}`)
            .then(res => res.json())
            .then(data => setReviews(prev => ({ ...prev, [bookId]: data })))
            .catch(() => {});
    };

    const handleSubmitReview = async (bookId) => {
        if (!user) { navigate('/login'); return; }
        if (newRating === 0) { showPopup('Please select a star rating ⭐'); return; }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ bookId, username: user.username, rating: newRating, comment: newComment })
            });
            if (res.ok) {
                showPopup('Review submitted successfully! ✅');
                fetchReviews(bookId);
                setOpenReviewBookId(null);
                setNewRating(0);
                setNewComment('');
            } else {
                const err = await res.text();
                showPopup(err || 'Could not submit review ❌');
            }
        } catch (err) {
            showPopup('Server error ⚠️');
        }
    };

    const getAverageRating = (bookId) => {
        const bookReviews = reviews[bookId] || [];
        if (bookReviews.length === 0) return 0;
        return bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length;
    };

    const handleAddToCart = (book) => {
        if(!user) { navigate('/login'); return; }
        addToCart(book);
        showPopup(`${book.title} added to cart! 🛒`);
    };

    const handleBuyNow = (book) => {
        if(!user) { navigate('/login'); return; }
        addToCart(book);
        navigate('/checkout');
    };

    const alreadyReviewed = (bookId) => {
        if (!user) return false;
        return (reviews[bookId] || []).some(r => r.username === user.username);
    };

    const hasPurchased = (bookId) => {
        return purchasedBooks[bookId] === true;
    };

    const filteredBooks = books.filter(book => {
        const matchesCategory = !selectedCategory || book.category === selectedCategory;
        const matchesSearch = !searchQuery || 
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            book.author.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div style={{maxWidth: '1400px', margin: '0 auto'}}>
            <div style={{ padding: '20px 40px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {selectedCategory && (
                        <>
                            <h3 style={{ margin: 0 }}>Category: <span style={{ color: 'var(--primary-color)' }}>{selectedCategory}</span></h3>
                            <button className="secondary" style={{ padding: '6px 16px', fontSize: '0.85rem', borderRadius: '20px' }} onClick={() => setSelectedCategory('')}>
                                Show All Books
                            </button>
                        </>
                    )}
                    {!selectedCategory && <h3 style={{ margin: 0 }}>Discover your next <span style={{ color: 'var(--primary-color)' }}>Masterpiece</span></h3>}
                </div>

                {/* Sale Banner */}
                <div style={{ 
                    background: 'linear-gradient(90deg, #ff4d4d, #f97316)', 
                    color: 'white', 
                    padding: '8px 20px', 
                    borderRadius: '30px', 
                    fontWeight: 'bold', 
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 15px rgba(255, 77, 77, 0.3)',
                    animation: 'pulse 2s infinite',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span style={{ fontSize: '1.2rem' }}>🔥</span> 
                    <span>SALE IS LIVE: Order ₹400 and get ₹100 OFF!</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button 
                        onClick={handleSurpriseMe}
                        className="secondary"
                        style={{ 
                            padding: '8px 16px', 
                            borderRadius: '20px', 
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            border: '2px solid var(--secondary-color)',
                            color: 'var(--secondary-color)',
                            fontWeight: 'bold'
                        }}
                    >
                        <span>🎲</span> Surprise Me!
                    </button>
                    <div style={{ width: '1px', height: '25px', background: 'var(--border-color)', margin: '0 5px' }}></div>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Sort By:</label>
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
                    >
                        <option value="default">Newest First</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="rating-desc">Highest Rated</option>
                    </select>
                </div>
            </div>

            {!selectedCategory && !searchQuery && (
                <div className="quote-banner">
                    <h2 className="quote-text">
                        {displayedText}
                        <span style={{ fontWeight: 'bold', animation: 'blink 1s step-end infinite' }}>|</span>
                    </h2>
                </div>
            )}
            
            <div className="book-grid">
                {books.length === 0 ? <p style={{gridColumn: '1/-1', textAlign:'center'}}>No books found. Check backend connection.</p> : null}
                {filteredBooks
                    .sort((a, b) => {
                        if (sortBy === 'price-asc') return a.price - b.price;
                        if (sortBy === 'price-desc') return b.price - a.price;
                        if (sortBy === 'rating-desc') return getAverageRating(b.id) - getAverageRating(a.id);
                        return b.id - a.id; // default: newest (higher ID) first
                    })
                    .map(book => {
                    const bookReviews = reviews[book.id] || [];
                    const avgRating = getAverageRating(book.id);
                    const isSurprise = surpriseBookId === book.id;
                    return (
                <div key={book.id} id={`book-${book.id}`} className={`glass book-card ${isSurprise ? 'surprise-highlight' : ''}`}>
                    <div style={{ position: 'relative' }}>
                        <img src={book.imageUrl || 'https://placehold.co/200x300?text=No+Cover'} alt={book.title} onError={(e) => { e.target.src = 'https://placehold.co/200x300?text=No+Cover' }} onClick={() => navigate(`/book/${book.id}`)} style={{ cursor: 'pointer' }} />
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(book.id); }}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'rgba(255, 255, 255, 0.8)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '35px',
                                height: '35px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s',
                                zIndex: 5
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                             title={(Array.isArray(wishlist) && wishlist.includes(book.id)) ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                            {(Array.isArray(wishlist) && wishlist.includes(book.id)) ? '❤️' : '♡'}
                        </button>
                    </div>
                    <h3 onClick={() => navigate(`/book/${book.id}`)} style={{ cursor: 'pointer' }}>{book.title}</h3>
                    <p className="author">by {book.author}</p>

                    {/* Average Rating Display */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                        <StarRating rating={Math.round(avgRating)} />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {avgRating > 0 ? `${avgRating.toFixed(1)} (${bookReviews.length})` : 'No reviews yet'}
                        </span>
                    </div>

                    <p className="description" onClick={() => navigate(`/book/${book.id}`)} style={{ cursor: 'pointer' }}>
                        {book.description?.length > 120 
                            ? <>{book.description.substring(0, 120)}... <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Read More</span></>
                            : book.description
                        }
                    </p>
                    <p className="price">₹{book.price?.toFixed(2)}</p>
                    {book.stock <= 0 ? (
                        <p style={{fontSize: '0.9rem', color: 'var(--error-color)', fontWeight: 'bold', margin: '5px 0'}}>
                            Out of Stock
                        </p>
                    ) : (book.stock < 5 && user?.role === 'ADMIN') ? (
                        <p style={{fontSize: '0.9rem', color: '#ff9800', fontWeight: 'bold', margin: '5px 0'}}>
                            Low Stock: {book.stock} left
                        </p>
                    ) : (
                        <p style={{minHeight: '20px', margin: '5px 0'}}></p>
                    )}
                    {(!user || user.role !== 'ADMIN') && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button disabled={book.stock <= 0} style={{ flex: 1, opacity: book.stock <= 0 ? 0.5 : 1 }} onClick={() => handleAddToCart(book)}>
                                {book.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            {book.stock > 0 && (
                                <button className="secondary" style={{ flex: 1 }} onClick={() => handleBuyNow(book)}>
                                    Buy Now
                                </button>
                            )}
                        </div>
                    )}

                    {/* Review Section */}
                    <div style={{ marginTop: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                        {/* Write Review Button - Only for customers who purchased */}
                        {user && user.role !== 'ADMIN' && !alreadyReviewed(book.id) && hasPurchased(book.id) && (
                            <button
                                type="button"
                                onClick={() => setOpenReviewBookId(openReviewBookId === book.id ? null : book.id)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--primary-color)',
                                    color: 'var(--primary-color)',
                                    padding: '6px 14px',
                                    fontSize: '0.85rem',
                                    borderRadius: '20px',
                                    width: '100%',
                                    marginBottom: '10px'
                                }}
                            >
                                ✍️ Write a Review
                            </button>
                        )}
                        {user && user.role !== 'ADMIN' && !alreadyReviewed(book.id) && !hasPurchased(book.id) && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 8px', textAlign: 'center', fontStyle: 'italic' }}>🛒 Purchase this book to write a review</p>
                        )}
                        {alreadyReviewed(book.id) && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--secondary-color)', margin: '0 0 8px', textAlign: 'center' }}>✅ You've reviewed this book</p>
                        )}

                        {/* Review Form */}
                        {openReviewBookId === book.id && (
                            <div style={{
                                background: 'var(--bg-color)',
                                borderRadius: '10px',
                                padding: '14px',
                                marginBottom: '10px',
                                animation: 'popupEntrance 0.3s ease'
                            }}>
                                <p style={{ margin: '0 0 8px', fontWeight: '600', fontSize: '0.9rem' }}>Your Rating</p>
                                <StarRating rating={newRating} onRate={setNewRating} interactive={true} />
                                <textarea
                                    placeholder="Write your review here..."
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    rows={3}
                                    style={{ marginTop: '10px', resize: 'vertical', fontSize: '0.9rem' }}
                                />
                                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                    <button
                                        type="button"
                                        onClick={() => handleSubmitReview(book.id)}
                                        style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
                                    >
                                        Submit Review
                                    </button>
                                    <button
                                        type="button"
                                        className="secondary"
                                        onClick={() => { setOpenReviewBookId(null); setNewRating(0); setNewComment(''); }}
                                        style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Existing Reviews */}
                        {bookReviews.length > 0 && (
                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {bookReviews.slice(0, 3).map(review => (
                                    <div key={review.id} style={{
                                        padding: '10px 0',
                                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                                        fontSize: '0.85rem'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <strong style={{ color: 'var(--primary-color)' }}>👤 {review.username}</strong>
                                            <StarRating rating={review.rating} />
                                        </div>
                                        {review.comment && (
                                            <p style={{ margin: '5px 0 0', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                                {review.comment}
                                            </p>
                                        )}
                                    </div>
                                ))}
                                {bookReviews.length > 3 && (
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', margin: '8px 0 0' }}>
                                        +{bookReviews.length - 3} more reviews
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                    );
                })}
            </div>
        </div>
    );
}
