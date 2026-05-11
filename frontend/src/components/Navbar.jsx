import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import BrandLogo from './BrandLogo';

// Fixed Navbar Component
export default function Navbar() {
    const { user, logout, cart, setSelectedCategory, wishlist } = useContext(StoreContext);
    const [showCategories, setShowCategories] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <nav className="glass custom-header">
            <div className="nav-top-mobile">
                <div onClick={() => { setSelectedCategory(''); navigate('/'); }} style={{ cursor: 'pointer', minWidth: '180px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    <BrandLogo fontSize="1.8rem" />
                </div>
                
                <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? '✕' : '☰'}
                </button>
            </div>
            
            <div className={isMenuOpen ? "links active" : "links"}>
                <Link to="/" onClick={() => { setSelectedCategory(''); setIsMenuOpen(false); }}>Home</Link>
                <Link to="/" onClick={() => { setSelectedCategory(''); setIsMenuOpen(false); }}>Books</Link>
                <div 
                    className="category-dropdown-container"
                    onClick={() => setShowCategories(!showCategories)}
                    onMouseEnter={() => setShowCategories(true)}
                    onMouseLeave={() => setShowCategories(false)}
                    style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                >
                    <span style={{ cursor: 'pointer', color: '#fff', fontWeight: 500 }}>Categories ▾</span>
                    {showCategories && (
                        <div className="dropdown-menu">
                            <span onClick={() => {setSelectedCategory('Fiction'); navigate('/'); setIsMenuOpen(false);}}>Fiction</span>
                            <span onClick={() => {setSelectedCategory('Science'); navigate('/'); setIsMenuOpen(false);}}>Science</span>
                            <span onClick={() => {setSelectedCategory('Technology'); navigate('/'); setIsMenuOpen(false);}}>Technology</span>
                            <span onClick={() => {setSelectedCategory('Business'); navigate('/'); setIsMenuOpen(false);}}>Business</span>
                            <span onClick={() => {setSelectedCategory('History'); navigate('/'); setIsMenuOpen(false);}}>History</span>
                        </div>
                    )}
                </div>

                {user ? (
                    <>
                        {user.role === 'ADMIN' && <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>}
                        {user.role !== 'ADMIN' && (
                            <>
                                <Link to="/wishlist" onClick={() => setIsMenuOpen(false)}>Wishlist ({wishlist.length})</Link>
                                <Link to="/cart" onClick={() => setIsMenuOpen(false)}>Cart ({cartCount})</Link>
                                <Link to="/orders" onClick={() => setIsMenuOpen(false)}>My Orders</Link>
                            </>
                        )}
                        <span className="user-greeting">Hi, {user?.username || 'User'}</span>
                        <button className="secondary logout-btn" onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                        <Link to="/register" onClick={() => setIsMenuOpen(false)}><button className="secondary">Register</button></Link>
                    </>
                )}
            </div>
        </nav>
    );
}
