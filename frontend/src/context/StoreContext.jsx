import React, { createContext, useState, useEffect, useCallback } from 'react';

export const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);
    const [wishlist, setWishlist] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [popupMsg, setPopupMsg] = useState(null);

    const showPopup = (msg) => {
        setPopupMsg(msg);
        setTimeout(() => {
            setPopupMsg(null);
        }, 3000);
    };

    const fetchWishlist = useCallback(async (userId) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/wishlist/${userId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setWishlist(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Error fetching wishlist:', err);
        }
    }, []);

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            fetchWishlist(user.id);
        } else {
            localStorage.removeItem('user');
            setWishlist([]);
        }
    }, [user, fetchWishlist]);

    useEffect(() => {
        if(token) localStorage.setItem('token', token);
        else localStorage.removeItem('token');
    }, [token]);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (book) => {
        setCart(prev => {
            const existing = prev.find(item => item.bookId === book.id);
            if (existing) {
                return prev.map(item => item.bookId === book.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { bookId: book.id, bookTitle: book.title, price: book.price, quantity: 1, imageUrl: book.imageUrl }];
        });
    };

    const removeFromCart = (bookId) => {
        setCart(prev => prev.filter(item => item.bookId !== bookId));
    };

    const toggleWishlist = async (bookId) => {
        if (!user) {
            showPopup('Please login to use wishlist! 🔐');
            return;
        }

        const isInWishlist = wishlist.includes(bookId);
        try {
            const currentToken = localStorage.getItem('token');
            if (isInWishlist) {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/wishlist/${user.id}/${bookId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${currentToken}` }
                });
                if (res.ok) {
                    setWishlist(prev => (Array.isArray(prev) ? prev.filter(id => id !== bookId) : []));
                    showPopup('Removed from wishlist! 💔');
                }
            } else {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/wishlist`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentToken}`
                    },
                    body: JSON.stringify({ userId: user.id, bookId })
                });
                if (res.ok) {
                    setWishlist(prev => [...(Array.isArray(prev) ? prev : []), bookId]);
                    showPopup('Added to wishlist! ❤️');
                }
            }
        } catch (err) {
            console.error('Wishlist error:', err);
        }
    };

    const clearCart = () => setCart([]);

    const logout = () => {
        setUser(null);
        setToken(null);
        setCart([]);
        setWishlist([]);
    };

    return (
        <StoreContext.Provider value={{ 
            user, setUser, token, setToken, logout, 
            cart, addToCart, removeFromCart, clearCart, 
            wishlist, toggleWishlist,
            searchQuery, setSearchQuery, 
            selectedCategory, setSelectedCategory, 
            popupMsg, showPopup 
        }}>
            {children}
        </StoreContext.Provider>
    );
};
