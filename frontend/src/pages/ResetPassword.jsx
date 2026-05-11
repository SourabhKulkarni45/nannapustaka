import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import AuthBackground from '../components/AuthBackground';

export default function ResetPassword() {
    const [username, setUsername] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const { showPopup } = useContext(StoreContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, oldPassword, newPassword })
            });
            if (res.ok) {
                showPopup('Password reset successfully! Please login with your new password. ✅');
                navigate('/login');
            } else {
                showPopup('Invalid username or previous password ❌');
            }
        } catch (err) {
            console.error(err);
            showPopup('Server error. Is the backend running? ⚠️');
        }
    };

    return (
        <div className="auth-content-container">
            <AuthBackground />
            <form className="glass auth-form" onSubmit={handleSubmit}>
            <h2>Reset Password</h2>
            <input 
                placeholder="Username" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
            />
            <input 
                type="password" 
                placeholder="Previous Password" 
                value={oldPassword} 
                onChange={e => setOldPassword(e.target.value)} 
                required 
            />
            <input 
                type="password" 
                placeholder="New Password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                required 
            />
            <button type="submit">Reset Password</button>
            <p style={{textAlign: 'center'}}>
                Remembered your password? <Link to="/login" style={{color: 'var(--secondary-color)'}}>Login here</Link>
            </p>
            </form>
        </div>
    );
}
