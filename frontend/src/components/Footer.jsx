import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer style={{
            background: 'linear-gradient(90deg, var(--text-primary), var(--primary-color))',
            paddingTop: '60px',
            marginTop: 'auto',
            borderTop: 'none',
            color: 'rgba(255, 255, 255, 0.8)',
            boxShadow: '0 -4px 15px rgba(67, 24, 255, 0.3)'
        }}>
            <div style={{ 
                maxWidth: '1200px', 
                margin: '0 auto', 
                padding: '0 20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '40px',
                marginBottom: '40px'
            }}>
                {/* Brand Section */}
                <div>
                    <h2 style={{ 
                        color: '#ffffff', 
                        margin: '0 0 20px 0', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px' 
                    }}>
                        📚 NannaPustaka
                    </h2>
                    <p style={{ lineHeight: '1.6', marginBottom: '20px' }}>
                        Your premium destination for books. Discover thousands of stories, learn new skills, and explore diverse worlds with our curated collection.
                    </p>
                </div>

                {/* Quick Links Section */}
                <div>
                    <h3 style={{ color: '#ffffff', marginBottom: '20px', fontSize: '1.2rem' }}>Quick Links</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li><Link to="/" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', transition: 'color 0.2s' }}>Home</Link></li>
                        <li><Link to="/orders" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', transition: 'color 0.2s' }}>Track My Order</Link></li>
                        <li><Link to="/cart" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', transition: 'color 0.2s' }}>My Cart</Link></li>
                        <li><Link to="/login" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', transition: 'color 0.2s' }}>Sign In</Link></li>
                    </ul>
                </div>

                {/* Contact Section */}
                <div>
                    <h3 style={{ color: '#ffffff', marginBottom: '20px', fontSize: '1.2rem' }}>Contact Us</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <span style={{ fontSize: '1.2rem' }}>📍</span>
                            <div>
                                <strong style={{ color: '#ffffff', display: 'block', marginBottom: '4px' }}>Headquarters</strong>
                                <span>11-33 plot no 243,<br/>Kalaburagi, Karnataka, India</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '1.2rem' }}>📧</span>
                            <span>support@nannapustaka.com</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '1.2rem' }}>📞</span>
                            <span>+91 1800 123 4567</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright Bar */}
            <div style={{ 
                background: 'rgba(0, 0, 0, 0.2)', 
                padding: '20px', 
                textAlign: 'center',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '0.95rem',
                color: 'rgba(255, 255, 255, 0.7)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} NannaPustaka. All rights reserved.</p>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Privacy Policy</span>
                        <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Terms of Service</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
